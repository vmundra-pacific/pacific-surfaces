"use client";

/**
 * Showroom — Pacific Stone Gallery, walkable 3D plaza.
 *
 * Layout: central plaza with a signature slab + four themed wings radiating
 * out (Whites, Greys & Blues, Darks, Warm Earth). Every slab stands on its
 * own freestanding gallery frame, no wall-mounted displays.
 *
 * Controls:
 *   • Arrow badges on the floor show all waypoints you can travel to — click
 *     one to glide there. This is the primary navigation.
 *   • Drag anywhere else to look around (mouse or touch).
 *   • Optional WASD for free walking.
 *   • Click a slab to zoom into close inspection.
 */

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Info,
  MousePointerClick,
  Navigation,
  Sparkles,
  X,
} from "lucide-react";
import type { Slab } from "@/data/slabs";
import { renderSlabTile } from "./slab-texture";
import {
  GALLERY,
  SLAB_DISPLAYS,
  WAYPOINTS,
  WINGS,
  getSlab,
  getWaypoint,
  type SlabDisplay,
  type Waypoint,
} from "./gallery-scene";

/* ================================================================
 * Texture cache
 * ================================================================ */

const slabTextureCache = new Map<string, Promise<THREE.Texture>>();

async function loadSlabTexture(slab: Slab): Promise<THREE.Texture> {
  const cached = slabTextureCache.get(slab.id);
  if (cached) return cached;
  const p: Promise<THREE.Texture> = (async () => {
    let tex: THREE.Texture;
    if (slab.photoUrl) {
      tex = await new Promise<THREE.Texture>((resolve, reject) => {
        new THREE.TextureLoader().load(slab.photoUrl!, resolve, undefined, reject);
      });
    } else {
      const canvas = await renderSlabTile(slab, 1024, 1024);
      tex = new THREE.CanvasTexture(canvas);
    }
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  })();
  slabTextureCache.set(slab.id, p);
  return p;
}

/* ================================================================
 * Freestanding framed slab display
 * ================================================================ */

function StandingSlab({
  display,
  hovered,
  onHover,
  onSelect,
  isHero,
}: {
  display: SlabDisplay;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  isHero: boolean;
}) {
  const slab = getSlab(display.slabId);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!slab) return;
    let cancelled = false;
    loadSlabTexture(slab).then((t) => {
      if (!cancelled) setTex(t);
    });
    return () => {
      cancelled = true;
    };
  }, [slab]);

  if (!slab) return null;

  const w = isHero ? GALLERY.slabWidth * 1.35 : GALLERY.slabWidth;
  const h = isHero ? GALLERY.slabHeight * 1.15 : GALLERY.slabHeight;
  const t = GALLERY.slabThickness;
  const ft = GALLERY.frameThickness;
  const fd = ft * 1.1; // frame depth

  return (
    <group position={display.position} rotation={[0, display.rotationY, 0]}>
      {/* Heavy plinth base */}
      <mesh position={[0, -h / 2 - GALLERY.plinthHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry
          args={[GALLERY.plinthWidth * (isHero ? 1.25 : 1), GALLERY.plinthHeight, GALLERY.plinthDepth]}
        />
        <meshStandardMaterial color="#0f1821" roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Plinth top accent strip */}
      <mesh position={[0, -h / 2 - 0.01, 0]} castShadow>
        <boxGeometry
          args={[GALLERY.plinthWidth * (isHero ? 1.25 : 1) - 0.05, 0.015, GALLERY.plinthDepth - 0.04]}
        />
        <meshStandardMaterial color="#9aa8b6" roughness={0.25} metalness={0.55} />
      </mesh>

      {/* Frame — four bars around the slab (top, bottom, left, right) */}
      {[
        // top
        { pos: [0, h / 2 + ft / 2, 0] as [number, number, number], size: [w + ft * 2, ft, fd] as [number, number, number] },
        // bottom
        { pos: [0, -h / 2 - ft / 2, 0] as [number, number, number], size: [w + ft * 2, ft, fd] as [number, number, number] },
        // left
        { pos: [-w / 2 - ft / 2, 0, 0] as [number, number, number], size: [ft, h, fd] as [number, number, number] },
        // right
        { pos: [w / 2 + ft / 2, 0, 0] as [number, number, number], size: [ft, h, fd] as [number, number, number] },
      ].map((bar, i) => (
        <mesh key={i} position={bar.pos} castShadow receiveShadow>
          <boxGeometry args={bar.size} />
          <meshStandardMaterial color="#12181d" roughness={0.38} metalness={0.6} />
        </mesh>
      ))}

      {/* The slab itself — a thin slab inset inside the frame */}
      <mesh
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(display.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(display.id);
        }}
      >
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial
          map={tex ?? undefined}
          color={tex ? "#ffffff" : "#c4c9cf"}
          roughness={0.22}
          metalness={0.05}
          envMapIntensity={0.8}
          emissive={hovered ? "#9aa8b6" : "#000000"}
          emissiveIntensity={hovered ? 0.1 : 0}
        />
      </mesh>

      {/* Subtle glow plane behind the slab */}
      <mesh position={[0, 0, -t / 2 - 0.01]}>
        <planeGeometry args={[w + ft, h + ft]} />
        <meshBasicMaterial color="#dae1e8" transparent opacity={0.04} />
      </mesh>

      {/* Plaque — slab name + collection at the base */}
      <Html
        position={[0, -h / 2 - GALLERY.plinthHeight + 0.02, GALLERY.plinthDepth / 2 + 0.01]}
        center
        distanceFactor={7}
        zIndexRange={[50, 0]}
        occlude={false}
      >
        <div
          className={`pointer-events-none px-3 py-1.5 rounded whitespace-nowrap select-none transition-colors ${
            hovered
              ? "bg-[#DAE1E8] text-[#112732]"
              : "bg-[#112732]/85 text-[#DAE1E8] border border-white/15 backdrop-blur"
          }`}
        >
          <div className="text-[9px] tracking-[.28em] uppercase opacity-70">
            {isHero ? "Signature" : slab.collection}
          </div>
          <div className="text-[11px] tracking-wide mt-0.5">{slab.name}</div>
        </div>
      </Html>
    </group>
  );
}

/* ================================================================
 * Architecture — plaza floor + four wings + walls + archways
 * ================================================================ */

function PlazaArchitecture() {
  const { plazaSize, wingWidth, wingDepth, ceilingHeight, wallThickness, archwayWidth } = GALLERY;
  const halfP = plazaSize / 2;
  const halfW = wingWidth / 2;

  // A single wall segment — used to build the walls around plaza + wings
  const Wall = ({
    pos,
    size,
    color,
    rotationY = 0,
  }: {
    pos: [number, number, number];
    size: [number, number, number];
    color: string;
    rotationY?: number;
  }) => (
    <mesh position={pos} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.92} />
    </mesh>
  );

  // For each plaza-facing wall, we carve an archway by leaving a gap.
  // We represent this as two wall segments flanking the archway.
  const plazaWallSegs = (dir: "north" | "south" | "east" | "west") => {
    const h = ceilingHeight;
    const t = wallThickness;
    const gap = archwayWidth;
    const segLen = (plazaSize - gap) / 2;
    const off = gap / 2 + segLen / 2;
    const wingPalette =
      dir === "north"
        ? WINGS.north.palette.wall
        : dir === "south"
          ? WINGS.south.palette.wall
          : dir === "east"
            ? WINGS.east.palette.wall
            : WINGS.west.palette.wall;
    // two segments flanking the archway. We also add a lintel above the
    // archway so the ceiling appears continuous.
    const segs: React.ReactNode[] = [];
    if (dir === "north" || dir === "south") {
      const z = dir === "north" ? -halfP : halfP;
      // Left segment
      segs.push(
        <Wall
          key={`${dir}-L`}
          pos={[-off, h / 2, z]}
          size={[segLen, h, t]}
          color={wingPalette}
        />,
      );
      segs.push(
        <Wall
          key={`${dir}-R`}
          pos={[off, h / 2, z]}
          size={[segLen, h, t]}
          color={wingPalette}
        />,
      );
      // Lintel above archway (top 0.6m)
      segs.push(
        <Wall
          key={`${dir}-lintel`}
          pos={[0, h - 0.3, z]}
          size={[gap, 0.6, t]}
          color={wingPalette}
        />,
      );
    } else {
      const x = dir === "east" ? halfP : -halfP;
      segs.push(
        <Wall
          key={`${dir}-L`}
          pos={[x, h / 2, -off]}
          size={[t, h, segLen]}
          color={wingPalette}
        />,
      );
      segs.push(
        <Wall
          key={`${dir}-R`}
          pos={[x, h / 2, off]}
          size={[t, h, segLen]}
          color={wingPalette}
        />,
      );
      segs.push(
        <Wall
          key={`${dir}-lintel`}
          pos={[x, h - 0.3, 0]}
          size={[t, 0.6, gap]}
          color={wingPalette}
        />,
      );
    }
    return segs;
  };

  return (
    <group>
      {/* Ceiling (single dark slab over the whole footprint) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ceilingHeight, 0]}>
        <planeGeometry args={[plazaSize + wingDepth * 2 + 2, plazaSize + wingDepth * 2 + 2]} />
        <meshStandardMaterial color="#0c151c" roughness={0.95} />
      </mesh>

      {/* Plaza floor — polished */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[plazaSize, plazaSize]} />
        <meshStandardMaterial color="#1e2a34" roughness={0.22} metalness={0.2} />
      </mesh>

      {/* Per-wing floors — slightly differentiated tones */}
      {(Object.keys(WINGS) as Array<keyof typeof WINGS>).map((wid) => {
        const wing = WINGS[wid];
        const cx =
          wid === "east"
            ? halfP + wingDepth / 2
            : wid === "west"
              ? -halfP - wingDepth / 2
              : 0;
        const cz =
          wid === "north"
            ? -halfP - wingDepth / 2
            : wid === "south"
              ? halfP + wingDepth / 2
              : 0;
        const sizeX = wid === "east" || wid === "west" ? wingDepth : wingWidth;
        const sizeZ = wid === "east" || wid === "west" ? wingWidth : wingDepth;
        return (
          <mesh
            key={`floor-${wid}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[cx, 0.001, cz]}
            receiveShadow
          >
            <planeGeometry args={[sizeX, sizeZ]} />
            <meshStandardMaterial color={wing.palette.floor} roughness={0.28} metalness={0.15} />
          </mesh>
        );
      })}

      {/* Plaza perimeter walls (4 sides, each with archway) */}
      {plazaWallSegs("north")}
      {plazaWallSegs("south")}
      {plazaWallSegs("east")}
      {plazaWallSegs("west")}

      {/* Back walls of each wing (the far end opposite the archway) */}
      {(Object.keys(WINGS) as Array<keyof typeof WINGS>).map((wid) => {
        const wing = WINGS[wid];
        const h = ceilingHeight;
        const t = wallThickness;
        // Back wall position
        if (wid === "north") {
          return (
            <Wall
              key="north-back"
              pos={[0, h / 2, -halfP - wingDepth]}
              size={[wingWidth, h, t]}
              color={wing.palette.wall}
            />
          );
        }
        if (wid === "south") {
          return (
            <Wall
              key="south-back"
              pos={[0, h / 2, halfP + wingDepth]}
              size={[wingWidth, h, t]}
              color={wing.palette.wall}
            />
          );
        }
        if (wid === "east") {
          return (
            <Wall
              key="east-back"
              pos={[halfP + wingDepth, h / 2, 0]}
              size={[t, h, wingWidth]}
              color={wing.palette.wall}
            />
          );
        }
        return (
          <Wall
            key="west-back"
            pos={[-halfP - wingDepth, h / 2, 0]}
            size={[t, h, wingWidth]}
            color={wing.palette.wall}
          />
        );
      })}

      {/* Side walls of each wing (2 per wing — long walls flanking the space) */}
      {(Object.keys(WINGS) as Array<keyof typeof WINGS>).map((wid) => {
        const wing = WINGS[wid];
        const h = ceilingHeight;
        const t = wallThickness;
        const out: React.ReactNode[] = [];
        if (wid === "north" || wid === "south") {
          // long walls run along Z
          const zCentre =
            wid === "north"
              ? -halfP - wingDepth / 2
              : halfP + wingDepth / 2;
          const zLen = wingDepth;
          out.push(
            <Wall
              key={`${wid}-sideL`}
              pos={[-halfW, h / 2, zCentre]}
              size={[t, h, zLen]}
              color={wing.palette.wall}
            />,
          );
          out.push(
            <Wall
              key={`${wid}-sideR`}
              pos={[halfW, h / 2, zCentre]}
              size={[t, h, zLen]}
              color={wing.palette.wall}
            />,
          );
        } else {
          // long walls run along X
          const xCentre =
            wid === "east"
              ? halfP + wingDepth / 2
              : -halfP - wingDepth / 2;
          const xLen = wingDepth;
          out.push(
            <Wall
              key={`${wid}-sideL`}
              pos={[xCentre, h / 2, -halfW]}
              size={[xLen, h, t]}
              color={wing.palette.wall}
            />,
          );
          out.push(
            <Wall
              key={`${wid}-sideR`}
              pos={[xCentre, h / 2, halfW]}
              size={[xLen, h, t]}
              color={wing.palette.wall}
            />,
          );
        }
        return out;
      })}

      {/* Wing name plaques above each archway on the plaza side */}
      {(["north", "east", "south", "west"] as const).map((wid) => {
        const wing = WINGS[wid];
        let pos: [number, number, number];
        let rotY = 0;
        if (wid === "north") {
          pos = [0, ceilingHeight - 0.55, -halfP - 0.01];
          rotY = Math.PI;
        } else if (wid === "south") {
          pos = [0, ceilingHeight - 0.55, halfP + 0.01];
          rotY = 0;
        } else if (wid === "east") {
          pos = [halfP + 0.01, ceilingHeight - 0.55, 0];
          rotY = -Math.PI / 2;
        } else {
          pos = [-halfP - 0.01, ceilingHeight - 0.55, 0];
          rotY = Math.PI / 2;
        }
        return (
          <Html
            key={`plaque-${wid}`}
            position={pos}
            rotation={[0, rotY, 0]}
            transform
            occlude
            distanceFactor={8}
            zIndexRange={[10, 0]}
          >
            <div className="select-none text-center px-4 py-2 text-[#112732]">
              <div className="text-[9px] tracking-[.36em] uppercase opacity-60">
                Wing
              </div>
              <div className="text-xl font-light tracking-tight whitespace-nowrap">
                {wing.label}
              </div>
              <div className="text-[9px] tracking-[.3em] uppercase opacity-50 mt-0.5 whitespace-nowrap">
                {wing.tagline}
              </div>
            </div>
          </Html>
        );
      })}

      {/* Plaza rug — subtle ring highlighting the hero plinth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[2.3, 2.5, 64]} />
        <meshStandardMaterial color="#9aa8b6" roughness={0.35} metalness={0.35} />
      </mesh>
    </group>
  );
}

/* ================================================================
 * Lighting
 * ================================================================ */

function GalleryLighting() {
  const { plazaSize, wingDepth, ceilingHeight } = GALLERY;
  const halfP = plazaSize / 2;

  // Spotlight helper — dirs an overhead spot to a floor target
  const spot = (
    position: [number, number, number],
    target: [number, number, number],
    color = "#fff4e0",
    intensity = 14,
    angle = 0.65,
    distance = 9,
  ) => (
    <spotLight
      position={position}
      target-position={target}
      color={color}
      intensity={intensity}
      angle={angle}
      penumbra={0.7}
      distance={distance}
      decay={1.6}
      castShadow
    />
  );

  // Per-wing spotlight cluster — light the slabs from above
  const wingSpots = useMemo(() => {
    const spots: React.ReactNode[] = [];
    const hYo = ceilingHeight - 0.25;
    (Object.keys(WINGS) as Array<keyof typeof WINGS>).forEach((wid) => {
      const wing = WINGS[wid];
      const cx =
        wid === "east"
          ? halfP + wingDepth / 2
          : wid === "west"
            ? -halfP - wingDepth / 2
            : 0;
      const cz =
        wid === "north"
          ? -halfP - wingDepth / 2
          : wid === "south"
            ? halfP + wingDepth / 2
            : 0;
      // 4 spots in a grid pattern across the wing
      const offsets: [number, number][] = [
        [-2.5, -2.5],
        [2.5, -2.5],
        [-2.5, 2.5],
        [2.5, 2.5],
      ];
      offsets.forEach((o, i) => {
        const px = cx + (wid === "east" || wid === "west" ? o[0] : o[1]);
        const pz = cz + (wid === "east" || wid === "west" ? o[1] : o[0]);
        spots.push(
          <group key={`${wid}-spot-${i}`}>
            {spot([px, hYo, pz], [px, 1.5, pz], wing.palette.accent, 12)}
          </group>,
        );
      });
    });
    return spots;
  }, [halfP, wingDepth, ceilingHeight]);

  return (
    <group>
      <ambientLight intensity={0.22} color="#b8c4d0" />
      <directionalLight position={[4, 10, -2]} intensity={0.4} color="#fff4dc" />

      {/* Plaza — 4 downlights + 1 hero spot */}
      {spot([0, ceilingHeight - 0.25, 0], [0, 1.6, 0], "#fff1d0", 26, 0.55, 10)}
      {spot([-4, ceilingHeight - 0.25, -4], [-4, 0.5, -4], "#d4dce4", 6, 0.8, 8)}
      {spot([4, ceilingHeight - 0.25, -4], [4, 0.5, -4], "#d4dce4", 6, 0.8, 8)}
      {spot([-4, ceilingHeight - 0.25, 4], [-4, 0.5, 4], "#d4dce4", 6, 0.8, 8)}
      {spot([4, ceilingHeight - 0.25, 4], [4, 0.5, 4], "#d4dce4", 6, 0.8, 8)}

      {wingSpots}

      {/* Entry rim light from south */}
      <pointLight
        position={[0, 2.6, halfP + wingDepth - 1]}
        intensity={1.2}
        distance={7}
        decay={2}
        color="#9aa8b6"
      />
    </group>
  );
}

/* ================================================================
 * Ground arrows — navigation between waypoints
 * ================================================================ */

function GroundArrow({
  fromPos,
  toPos,
  label,
  onGo,
}: {
  fromPos: [number, number, number];
  toPos: [number, number, number];
  label: string;
  onGo: () => void;
}) {
  // Position the arrow 1.4m in front of the "from" position, pointing toward "to"
  const dir = new THREE.Vector3(
    toPos[0] - fromPos[0],
    0,
    toPos[2] - fromPos[2],
  ).normalize();
  const arrowPos: [number, number, number] = [
    fromPos[0] + dir.x * 1.8,
    0.04,
    fromPos[2] + dir.z * 1.8,
  ];
  // Rotation for the arrow geometry (so triangle points toward target)
  const angle = Math.atan2(dir.x, dir.z);

  const [hovered, setHovered] = useState(false);

  return (
    <group position={arrowPos} rotation={[0, angle, 0]}>
      {/* Floor disk */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onGo();
        }}
      >
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial
          color={hovered ? "#DAE1E8" : "#9AA8B6"}
          transparent
          opacity={hovered ? 0.9 : 0.55}
          emissive={hovered ? "#DAE1E8" : "#2a3a48"}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Inner arrow triangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial color={hovered ? "#112732" : "#FFFFFF"} transparent opacity={hovered ? 1 : 0.85} />
      </mesh>
      {/* HTML label above the arrow */}
      <Html
        position={[0, 0.4, 0]}
        center
        distanceFactor={10}
        zIndexRange={[30, 0]}
        occlude={false}
      >
        <div
          className={`pointer-events-none text-[9px] tracking-[.24em] uppercase px-2 py-0.5 rounded whitespace-nowrap select-none ${
            hovered
              ? "bg-[#DAE1E8] text-[#112732]"
              : "bg-[#112732]/80 text-[#DAE1E8] border border-white/15 backdrop-blur"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

// Arrow shape — a simple forward-pointing chevron/triangle
const arrowShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.28); // tip (forward = +Z, rendered as -Y in rotated plane)
  s.lineTo(-0.22, -0.1);
  s.lineTo(-0.1, -0.1);
  s.lineTo(-0.1, -0.28);
  s.lineTo(0.1, -0.28);
  s.lineTo(0.1, -0.1);
  s.lineTo(0.22, -0.1);
  s.closePath();
  return s;
})();

/* ================================================================
 * Camera rig — drag-to-look, WASD, waypoint glide, slab zoom
 * ================================================================ */

interface ZoomTarget {
  display: SlabDisplay;
  cameraPos: THREE.Vector3;
  lookAt: THREE.Vector3;
}

interface GlideTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

function CameraRig({
  zoomTarget,
  glideTarget,
  onGlideDone,
  currentWaypointPos,
}: {
  zoomTarget: ZoomTarget | null;
  glideTarget: GlideTarget | null;
  onGlideDone: () => void;
  currentWaypointPos: [number, number, number];
}) {
  const { camera, gl } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const animRef = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    lookFrom: THREE.Vector3;
    lookTo: THREE.Vector3;
    t: number;
    kind: "zoom" | "glide";
  } | null>(null);
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const dragging = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  // ---------------- Drag-to-look ----------------
  useEffect(() => {
    euler.current.setFromQuaternion(camera.quaternion);
    const dom = gl.domElement;
    dom.style.touchAction = "none";

    const onPointerDown = (e: PointerEvent) => {
      // Only drag on "background" clicks — if a mesh/arrow/slab handled the click,
      // its stopPropagation will prevent this. We check by seeing if it's the canvas.
      if (e.target !== dom) return;
      dragging.current.active = true;
      dragging.current.x = e.clientX;
      dragging.current.y = e.clientY;
      dom.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current.active) return;
      const dx = e.clientX - dragging.current.x;
      const dy = e.clientY - dragging.current.y;
      dragging.current.x = e.clientX;
      dragging.current.y = e.clientY;
      euler.current.y -= dx * 0.003;
      euler.current.x -= dy * 0.003;
      euler.current.x = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, euler.current.x),
      );
      camera.quaternion.setFromEuler(euler.current);
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging.current.active = false;
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);
    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
    };
  }, [camera, gl]);

  // ---------------- Keyboard WASD ----------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = true;
      if (k === "s" || k === "arrowdown") keys.current.s = true;
      if (k === "a" || k === "arrowleft") keys.current.a = true;
      if (k === "d" || k === "arrowright") keys.current.d = true;
      if (k === "shift") keys.current.shift = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = false;
      if (k === "s" || k === "arrowdown") keys.current.s = false;
      if (k === "a" || k === "arrowleft") keys.current.a = false;
      if (k === "d" || k === "arrowright") keys.current.d = false;
      if (k === "shift") keys.current.shift = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ---------------- Start animations ----------------
  useEffect(() => {
    if (zoomTarget) {
      animRef.current = {
        from: camera.position.clone(),
        to: zoomTarget.cameraPos.clone(),
        lookFrom: getCameraLookAt(camera),
        lookTo: zoomTarget.lookAt.clone(),
        t: 0,
        kind: "zoom",
      };
    } else if (glideTarget) {
      animRef.current = {
        from: camera.position.clone(),
        to: glideTarget.position.clone(),
        lookFrom: getCameraLookAt(camera),
        lookTo: glideTarget.lookAt.clone(),
        t: 0,
        kind: "glide",
      };
    } else {
      animRef.current = null;
    }
  }, [zoomTarget, glideTarget, camera]);

  // ---------------- Frame update ----------------
  useFrame((_, delta) => {
    const a = animRef.current;
    if (a && a.t < 1) {
      a.t = Math.min(1, a.t + delta * 1.25);
      const eased = easeInOutCubic(a.t);
      camera.position.lerpVectors(a.from, a.to, eased);
      const look = new THREE.Vector3().lerpVectors(a.lookFrom, a.lookTo, eased);
      camera.lookAt(look);
      if (a.t >= 1) {
        if (a.kind === "glide") {
          euler.current.setFromQuaternion(camera.quaternion);
          onGlideDone();
        }
        animRef.current = null;
      }
      return;
    }
    if (zoomTarget) return;

    // Free WASD walk
    const speed = (keys.current.shift ? 4.5 : 2.2) * delta;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .normalize();

    const move = new THREE.Vector3();
    if (keys.current.w) move.add(forward);
    if (keys.current.s) move.sub(forward);
    if (keys.current.d) move.add(right);
    if (keys.current.a) move.sub(right);
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      camera.position.add(move);
      // Clamp to gallery bounds
      clampToGallery(camera.position);
      euler.current.setFromQuaternion(camera.quaternion);
    }
    camera.position.y = GALLERY.eyeHeight;
    // unused
    void currentWaypointPos;
  });

  return null;
}

function getCameraLookAt(camera: THREE.Camera): THREE.Vector3 {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  return camera.position.clone().add(dir);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clampToGallery(p: THREE.Vector3) {
  const halfP = GALLERY.plazaSize / 2;
  const wingExtent = halfP + GALLERY.wingDepth - 0.8;
  const halfW = GALLERY.wingWidth / 2 - 0.8;
  const inPlaza = Math.abs(p.x) <= halfP - 0.8 && Math.abs(p.z) <= halfP - 0.8;
  const inNS =
    Math.abs(p.x) <= halfW && Math.abs(p.z) <= wingExtent && (p.z < -halfP || p.z > halfP);
  const inEW =
    Math.abs(p.z) <= halfW && Math.abs(p.x) <= wingExtent && (p.x < -halfP || p.x > halfP);
  if (inPlaza || inNS || inEW) return; // valid
  // Otherwise snap back to the plaza
  p.x = THREE.MathUtils.clamp(p.x, -halfP + 0.8, halfP - 0.8);
  p.z = THREE.MathUtils.clamp(p.z, -halfP + 0.8, halfP - 0.8);
}

/* ================================================================
 * Scene root
 * ================================================================ */

function SceneRoot({
  hoveredId,
  setHoveredId,
  onSelectDisplay,
  currentWaypoint,
  onGoWaypoint,
}: {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelectDisplay: (d: SlabDisplay) => void;
  currentWaypoint: Waypoint;
  onGoWaypoint: (id: string) => void;
}) {
  return (
    <>
      <color attach="background" args={["#080f15"]} />
      <fog attach="fog" args={["#080f15", 12, 38]} />
      <Suspense fallback={null}>
        <Environment preset="warehouse" background={false} />
      </Suspense>

      <GalleryLighting />
      <PlazaArchitecture />

      {SLAB_DISPLAYS.map((d) => (
        <StandingSlab
          key={d.id}
          display={d}
          hovered={hoveredId === d.id}
          onHover={setHoveredId}
          onSelect={() => onSelectDisplay(d)}
          isHero={d.wing === "plaza"}
        />
      ))}

      {/* Navigation arrows from current waypoint */}
      {currentWaypoint.neighbors.map((nid) => {
        const n = getWaypoint(nid);
        if (!n) return null;
        return (
          <GroundArrow
            key={`arrow-${nid}`}
            fromPos={currentWaypoint.position}
            toPos={n.position}
            label={n.label}
            onGo={() => onGoWaypoint(nid)}
          />
        );
      })}

      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.45}
        scale={50}
        blur={2.2}
        far={8}
      />
    </>
  );
}

/* ================================================================
 * Top-level
 * ================================================================ */

export function Showroom() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoomTarget, setZoomTarget] = useState<ZoomTarget | null>(null);
  const [currentWpId, setCurrentWpId] = useState<string>("entry");
  const [glideTarget, setGlideTarget] = useState<GlideTarget | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const currentWaypoint = getWaypoint(currentWpId) ?? WAYPOINTS[0];
  const activeDisplay = zoomTarget?.display ?? null;
  const activeSlab = activeDisplay ? getSlab(activeDisplay.slabId) : null;
  const hoveredSlab = hoveredId
    ? getSlab(SLAB_DISPLAYS.find((d) => d.id === hoveredId)?.slabId ?? "")
    : null;

  const goWaypoint = useCallback((id: string) => {
    const next = getWaypoint(id);
    if (!next) return;
    setGlideTarget({
      position: new THREE.Vector3(...next.position),
      lookAt: new THREE.Vector3(...next.lookAt),
    });
    setCurrentWpId(id);
  }, []);

  const onGlideDone = useCallback(() => {
    setGlideTarget(null);
  }, []);

  const makeZoomPose = useCallback((d: SlabDisplay): ZoomTarget => {
    const forward = new THREE.Vector3(
      Math.sin(d.rotationY),
      0,
      Math.cos(d.rotationY),
    );
    const camOffset = forward.clone().multiplyScalar(1.45);
    const cameraPos = new THREE.Vector3(
      d.position[0] + camOffset.x,
      GALLERY.eyeHeight,
      d.position[2] + camOffset.z,
    );
    const lookAt = new THREE.Vector3(
      d.position[0],
      GALLERY.eyeHeight + 0.05,
      d.position[2],
    );
    return { display: d, cameraPos, lookAt };
  }, []);

  const handleSelectDisplay = useCallback(
    (d: SlabDisplay) => {
      setZoomTarget(makeZoomPose(d));
    },
    [makeZoomPose],
  );

  const exitZoom = useCallback(() => setZoomTarget(null), []);

  // Esc to exit zoom
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zoomTarget) exitZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomTarget, exitZoom]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#080f15] text-[#DAE1E8] relative">
      {/* Top bar */}
      <header className="absolute top-0 inset-x-0 z-30 h-14 px-4 md:px-6 flex items-center justify-between bg-gradient-to-b from-[#080f15]/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-5 pointer-events-auto">
          <Link
            href="/visualize"
            className="inline-flex items-center gap-2 text-[#9AA8B6] hover:text-[#DAE1E8] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to visualiser</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-[10px] tracking-[.24em] uppercase text-[#9AA8B6]">
            <Sparkles className="w-3.5 h-3.5" />
            The Stone Gallery
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            href="/visualize"
            className="hidden md:inline-flex items-center gap-1.5 text-[#9AA8B6] hover:text-[#DAE1E8] text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
          >
            <Camera className="w-3 h-3" />
            Photo mode
          </Link>
          <button
            onClick={() => setShowHelp((v) => !v)}
            className="inline-flex items-center justify-center w-9 h-9 border border-white/10 rounded-full hover:border-white/30 text-[#9AA8B6] hover:text-[#DAE1E8] transition-colors"
            aria-label="Show controls"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: GALLERY.spawn, fov: 62, near: 0.1, far: 90 }}
        gl={{ antialias: true }}
        className="!absolute inset-0"
      >
        <SceneRoot
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onSelectDisplay={handleSelectDisplay}
          currentWaypoint={currentWaypoint}
          onGoWaypoint={goWaypoint}
        />
        <CameraRig
          zoomTarget={zoomTarget}
          glideTarget={glideTarget}
          onGlideDone={onGlideDone}
          currentWaypointPos={currentWaypoint.position}
        />
      </Canvas>

      {/* Location chip */}
      <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-4 z-20">
        <div className="inline-flex items-center gap-2 bg-[#112732]/75 backdrop-blur-xl border border-white/10 rounded-full px-3.5 py-1.5">
          <Navigation className="w-3 h-3 text-[#9AA8B6]" />
          <span className="text-[10px] tracking-[.26em] uppercase text-[#DAE1E8]">
            {currentWaypoint.label}
          </span>
        </div>
      </div>

      {/* Hovered slab chip */}
      <AnimatePresence>
        {!zoomTarget && hoveredSlab && (
          <motion.div
            key={hoveredSlab.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-6 z-20 bg-[#112732]/85 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/15"
          >
            <div className="text-[10px] tracking-[.26em] uppercase text-[#9AA8B6]">
              {hoveredSlab.collection}
            </div>
            <div className="text-[#DAE1E8] text-sm flex items-center gap-2">
              {hoveredSlab.name}
              <MousePointerClick className="w-3 h-3 text-[#9AA8B6]" />
              <span className="text-[10px] text-[#9AA8B6]">Click to inspect</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom inspection panel */}
      <AnimatePresence>
        {zoomTarget && activeSlab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-0 z-20 flex"
          >
            <div className="pointer-events-auto ml-auto w-full md:w-[380px] h-full bg-[#112732]/85 backdrop-blur-xl border-l border-white/10 flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="text-[10px] tracking-[.28em] uppercase text-[#9AA8B6]">
                  Close inspection
                </div>
                <button
                  onClick={exitZoom}
                  className="inline-flex items-center gap-1.5 text-[#9AA8B6] hover:text-[#DAE1E8] text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Exit
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] ring-1 ring-white/10 mb-4">
                    <div
                      className="absolute inset-0"
                      style={{ backgroundImage: activeSlab.swatch }}
                    />
                    {activeSlab.overlay && (
                      <div
                        className="absolute inset-0 mix-blend-overlay opacity-80"
                        style={{ backgroundImage: activeSlab.overlay }}
                      />
                    )}
                  </div>
                  <div className="text-[10px] tracking-[.28em] uppercase text-[#9AA8B6] mb-1">
                    {activeSlab.collection}
                  </div>
                  <div className="text-2xl font-light leading-tight mb-3">
                    {activeSlab.name}
                  </div>
                  <p className="text-sm text-[#9AA8B6]">
                    {activeSlab.pattern} · {activeSlab.hues.join(", ")}
                  </p>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
                  <dt className="text-[#9AA8B6] text-xs tracking-[.14em] uppercase self-center">
                    Finishes
                  </dt>
                  <dd>{activeSlab.finishes.join(", ")}</dd>
                  <dt className="text-[#9AA8B6] text-xs tracking-[.14em] uppercase self-center">
                    Thickness
                  </dt>
                  <dd>{activeSlab.thicknesses.join(", ")}</dd>
                </dl>

                <div className="flex gap-2">
                  <Link
                    href="/catalogue"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#DAE1E8] text-[#112732] text-[10px] tracking-[.22em] uppercase px-4 py-2.5 rounded-full hover:bg-white transition-colors"
                  >
                    Request sample
                  </Link>
                  <Link
                    href="/visualize"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 border border-white/20 text-[#DAE1E8] text-[10px] tracking-[.22em] uppercase px-4 py-2.5 rounded-full hover:bg-white/5 transition-colors"
                  >
                    See in room
                  </Link>
                </div>

                <div className="rounded-xl border border-white/10 p-4 text-xs text-[#9AA8B6]">
                  Press <kbd className="px-1 border border-white/20 rounded text-[10px] text-[#DAE1E8]">Esc</kbd> or
                  tap <b>Exit</b> to return to the walk.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-5 z-30 w-72 bg-[#112732]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4"
          >
            <div className="text-[10px] tracking-[.28em] uppercase text-[#9AA8B6] mb-3">
              Controls
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-[#9AA8B6]">Travel</span>
                <span className="text-xs">Click a floor arrow</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9AA8B6]">Look</span>
                <span className="text-xs">Drag mouse / touch</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9AA8B6]">Free walk</span>
                <span>
                  <kbd className="px-1.5 border border-white/20 rounded text-[10px]">W A S D</kbd>
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9AA8B6]">Inspect slab</span>
                <span className="text-xs">Click it</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#9AA8B6]">Exit zoom</span>
                <span>
                  <kbd className="px-1.5 border border-white/20 rounded text-[10px]">Esc</kbd>
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
