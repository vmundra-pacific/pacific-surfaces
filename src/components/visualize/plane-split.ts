/**
 * Depth-based plane splitting for architectural surface masks.
 *
 * Given a SAM-2 mask and a depth map, this module:
 *   1. Extracts depth values within the mask
 *   2. Detects sharp depth discontinuities (plane boundaries)
 *   3. Splits the mask into connected regions of similar depth
 *   4. Estimates a surface normal for each plane (for perspective texture)
 *
 * All pixel-level processing is done on the client using canvas — the
 * depth map and masks arrive as data-URLs from the server.
 */

export interface PlaneInfo {
  /** Unique identifier for this plane segment */
  id: string;
  /** Parent mask label (e.g. "Surface 2") */
  parentLabel: string;
  /** Sub-label (e.g. "Surface 2a") */
  label: string;
  /** Mask ImageData — white-alpha where this plane exists */
  mask: ImageData;
  /** Bounding box */
  bbox: { x: number; y: number; w: number; h: number };
  /** Centroid for UI label placement */
  centroid: { x: number; y: number };
  /** Area fraction of the total image */
  areaFraction: number;
  /** Average depth value (0–255, higher = farther) */
  avgDepth: number;
  /**
   * Estimated surface normal [nx, ny, nz].
   * - Facing camera: [0, 0, -1]
   * - Left wall:     [1, 0, 0]
   * - Right wall:    [-1, 0, 0]
   * - Floor:         [0, -1, 0]
   * - Ceiling:       [0, 1, 0]
   */
  normal: [number, number, number];
}

/**
 * Load a depth map data-URL into a grayscale pixel array at the given
 * target dimensions (matching the canvas/mask size).
 */
export async function loadDepthMap(
  depthDataUrl: string,
  targetW: number,
  targetH: number
): Promise<Float32Array> {
  const img = await loadImg(depthDataUrl);
  const c = document.createElement("canvas");
  c.width = targetW;
  c.height = targetH;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, targetW, targetH);
  const pixels = ctx.getImageData(0, 0, targetW, targetH).data;

  // Convert to single-channel float (luminance)
  const depth = new Float32Array(targetW * targetH);
  for (let i = 0; i < depth.length; i++) {
    const p = i * 4;
    // Depth maps are grayscale — just take the red channel
    depth[i] = pixels[p];
  }
  return depth;
}

/**
 * Split a single mask into sub-planes based on depth discontinuities.
 *
 * Algorithm:
 *   1. Compute depth gradient magnitude within the mask
 *   2. Mark pixels with steep gradient as "boundary" (depth edges)
 *   3. Flood-fill connected components on the non-boundary pixels
 *   4. Merge very small components into their nearest large neighbor
 *   5. Return each component as a separate PlaneInfo
 */
export function splitMaskByDepth(
  maskData: ImageData,
  depth: Float32Array,
  w: number,
  h: number,
  parentId: string,
  parentLabel: string
): PlaneInfo[] {
  const totalPixels = w * h;
  const maskPx = maskData.data;

  // Extract mask pixel indices
  const inMask = new Uint8Array(totalPixels);
  let maskCount = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (maskPx[i * 4 + 3] > 128) {
      inMask[i] = 1;
      maskCount++;
    }
  }

  if (maskCount < 100) {
    // Mask too small to split
    return [buildSinglePlane(maskData, depth, w, h, parentId, parentLabel)];
  }

  // ---- Step 1: Compute depth gradient within mask ----
  const gradient = new Float32Array(totalPixels);
  const step = 3; // Gradient kernel radius
  for (let y = step; y < h - step; y++) {
    for (let x = step; x < w - step; x++) {
      const idx = y * w + x;
      if (!inMask[idx]) continue;

      const dx = depth[y * w + (x + step)] - depth[y * w + (x - step)];
      const dy = depth[(y + step) * w + x] - depth[(y - step) * w + x];
      gradient[idx] = Math.sqrt(dx * dx + dy * dy);
    }
  }

  // ---- Step 2: Mark boundary pixels (steep depth gradient) ----
  // Adaptive threshold: use a percentile of gradient values within the mask
  const gradValues: number[] = [];
  for (let i = 0; i < totalPixels; i++) {
    if (inMask[i] && gradient[i] > 0) gradValues.push(gradient[i]);
  }

  if (gradValues.length < 50) {
    // Not enough variation — single plane
    return [buildSinglePlane(maskData, depth, w, h, parentId, parentLabel)];
  }

  gradValues.sort((a, b) => a - b);

  // Use a fixed threshold: depth change > 15 per 3px step ≈ wall corner
  // Also require it to be in the top 5% of gradients within this mask
  const percentile95 = gradValues[Math.floor(gradValues.length * 0.95)];
  const threshold = Math.max(12, Math.min(percentile95, 40));

  const isBoundary = new Uint8Array(totalPixels);
  let boundaryCount = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (inMask[i] && gradient[i] > threshold) {
      isBoundary[i] = 1;
      boundaryCount++;
    }
  }

  // If < 2% of mask pixels are boundaries, no real plane split exists
  if (boundaryCount < maskCount * 0.02) {
    return [buildSinglePlane(maskData, depth, w, h, parentId, parentLabel)];
  }

  // ---- Step 3: Flood-fill connected components ----
  const labels = new Int32Array(totalPixels).fill(-1);
  let nextLabel = 0;
  const componentSizes: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!inMask[idx] || isBoundary[idx] || labels[idx] >= 0) continue;

      // BFS flood fill
      const label = nextLabel++;
      const queue: number[] = [idx];
      labels[idx] = label;
      let size = 0;

      while (queue.length > 0) {
        const ci = queue.pop()!;
        size++;
        const cx = ci % w;
        const cy = (ci - cx) / w;

        // 4-connected neighbors
        const neighbors = [
          cy > 0 ? ci - w : -1,
          cy < h - 1 ? ci + w : -1,
          cx > 0 ? ci - 1 : -1,
          cx < w - 1 ? ci + 1 : -1,
        ];

        for (const ni of neighbors) {
          if (ni < 0 || !inMask[ni] || isBoundary[ni] || labels[ni] >= 0)
            continue;
          labels[ni] = label;
          queue.push(ni);
        }
      }

      componentSizes.push(size);
    }
  }

  // ---- Step 4: Merge small components into nearest large neighbor ----
  const MIN_COMPONENT = Math.max(200, maskCount * 0.03); // At least 3% of mask

  // Also assign boundary pixels to the nearest non-boundary neighbor's label
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!inMask[idx]) continue;
      if (labels[idx] >= 0 && componentSizes[labels[idx]] >= MIN_COMPONENT)
        continue;

      // Find nearest labeled pixel with a large-enough component via BFS
      const visited = new Set<number>();
      const q: number[] = [idx];
      visited.add(idx);
      let found = -1;

      while (q.length > 0 && found < 0) {
        const ci = q.shift()!;
        const cx = ci % w;
        const cy = (ci - cx) / w;

        const neighbors = [
          cy > 0 ? ci - w : -1,
          cy < h - 1 ? ci + w : -1,
          cx > 0 ? ci - 1 : -1,
          cx < w - 1 ? ci + 1 : -1,
        ];

        for (const ni of neighbors) {
          if (ni < 0 || !inMask[ni] || visited.has(ni)) continue;
          visited.add(ni);
          if (labels[ni] >= 0 && componentSizes[labels[ni]] >= MIN_COMPONENT) {
            found = labels[ni];
            break;
          }
          q.push(ni);
        }
      }

      if (found >= 0) labels[idx] = found;
    }
  }

  // ---- Step 5: Build PlaneInfo for each surviving component ----
  const uniqueLabels = new Set<number>();
  for (let i = 0; i < totalPixels; i++) {
    if (
      inMask[i] &&
      labels[i] >= 0 &&
      componentSizes[labels[i]] >= MIN_COMPONENT
    ) {
      uniqueLabels.add(labels[i]);
    }
  }

  // If only 1 component after merging, return as single plane
  if (uniqueLabels.size <= 1) {
    return [buildSinglePlane(maskData, depth, w, h, parentId, parentLabel)];
  }

  const sortedLabels = [...uniqueLabels].sort((a, b) => {
    // Sort by average depth (back-to-front ordering)
    let sumA = 0,
      cntA = 0,
      sumB = 0,
      cntB = 0;
    for (let i = 0; i < totalPixels; i++) {
      if (labels[i] === a) {
        sumA += depth[i];
        cntA++;
      }
      if (labels[i] === b) {
        sumB += depth[i];
        cntB++;
      }
    }
    return (cntB > 0 ? sumB / cntB : 0) - (cntA > 0 ? sumA / cntA : 0);
  });

  const planes: PlaneInfo[] = [];
  const letters = "abcdefghijklmnop";

  for (let li = 0; li < sortedLabels.length; li++) {
    const label = sortedLabels[li];
    const planeMask = new ImageData(w, h);
    const pd = planeMask.data;
    let sumX = 0,
      sumY = 0,
      count = 0;
    let minX = w,
      maxX = 0,
      minY = h,
      maxY = 0;
    let depthSum = 0;
    // For normal estimation: accumulate depth gradients
    let gxSum = 0,
      gySum = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (labels[idx] !== label) continue;
        const pi = idx * 4;
        pd[pi] = 255;
        pd[pi + 1] = 255;
        pd[pi + 2] = 255;
        pd[pi + 3] = 255;
        sumX += x;
        sumY += y;
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        depthSum += depth[idx];

        // Accumulate depth gradients for normal estimation
        if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
          gxSum += depth[y * w + (x + 1)] - depth[y * w + (x - 1)];
          gySum += depth[(y + 1) * w + x] - depth[(y - 1) * w + x];
        }
      }
    }

    if (count < 100) continue;

    const avgDepth = depthSum / count;
    const avgGx = gxSum / count;
    const avgGy = gySum / count;

    // Estimate surface normal from average depth gradient
    // gx > 0 means depth increases to the right → surface faces left
    // gy > 0 means depth increases downward → surface faces up
    const normal = estimateNormal(avgGx, avgGy);

    planes.push({
      id: `${parentId}-${letters[li] || li}`,
      parentLabel,
      label: `${parentLabel}${letters[li] || li}`,
      mask: planeMask,
      bbox: {
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1,
      },
      centroid: { x: sumX / count, y: sumY / count },
      areaFraction: count / totalPixels,
      avgDepth,
      normal,
    });
  }

  return planes.length > 0
    ? planes
    : [buildSinglePlane(maskData, depth, w, h, parentId, parentLabel)];
}

/** Build a single PlaneInfo when no split is detected */
function buildSinglePlane(
  maskData: ImageData,
  depth: Float32Array,
  w: number,
  h: number,
  parentId: string,
  parentLabel: string
): PlaneInfo {
  const totalPixels = w * h;
  let sumX = 0,
    sumY = 0,
    count = 0;
  let minX = w,
    maxX = 0,
    minY = h,
    maxY = 0;
  let depthSum = 0,
    gxSum = 0,
    gySum = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (maskData.data[idx * 4 + 3] < 128) continue;
      sumX += x;
      sumY += y;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      depthSum += depth[idx];
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        gxSum += depth[y * w + (x + 1)] - depth[y * w + (x - 1)];
        gySum += depth[(y + 1) * w + x] - depth[(y - 1) * w + x];
      }
    }
  }

  const avgGx = count > 0 ? gxSum / count : 0;
  const avgGy = count > 0 ? gySum / count : 0;

  return {
    id: parentId,
    parentLabel,
    label: parentLabel,
    mask: maskData,
    bbox: {
      x: minX,
      y: minY,
      w: count > 0 ? maxX - minX + 1 : 0,
      h: count > 0 ? maxY - minY + 1 : 0,
    },
    centroid: {
      x: count > 0 ? sumX / count : w / 2,
      y: count > 0 ? sumY / count : h / 2,
    },
    areaFraction: count / totalPixels,
    avgDepth: count > 0 ? depthSum / count : 128,
    normal: estimateNormal(avgGx, avgGy),
  };
}

/**
 * Estimate a surface normal from average depth gradients.
 *
 * In a depth map:
 *   - Large |gx| with small |gy| → wall (facing left or right)
 *   - Large |gy| with small |gx| → floor or ceiling
 *   - Small both → surface facing the camera (back wall)
 *
 * Returns a normalized [nx, ny, nz] vector.
 */
function estimateNormal(
  avgGx: number,
  avgGy: number
): [number, number, number] {
  // Scale: depth gradients are in pixels-per-pixel, typically 0–5 range
  // We use a sensitivity factor to convert to tangent-space normal
  const scale = 0.15;
  const nx = -avgGx * scale;
  const ny = -avgGy * scale;
  const nz = -1; // Pointing toward the camera

  // Normalize
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  return [nx / len, ny / len, nz / len];
}

/** Load an image from a data-URL */
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
