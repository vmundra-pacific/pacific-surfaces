"use client";

/**
 * OriginSection — Section 3 of the Pacific Surfaces scroll homepage.
 *
 * A GPU-morphed quartz deconstruction with 80,000 particles interpolating
 * between four baked target positions (slab → grit → powder → crystal)
 * driven by scroll progress via GSAP ScrollTrigger.
 *
 * Tech: React Three Fiber + raw Three.js ShaderMaterial + GSAP.
 */

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ----- Brand palette (Pacific guidelines) -----
const COLOR_DARK = "#112732";
const COLOR_MID = "#9AA8B6";
const COLOR_LIGHT = "#DAE1E8";

const PARTICLE_COUNT = 15_000;

// ----- Target position generators -----

function makeSlab(n: number) {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3 + 0] = (Math.random() - 0.5) * 10;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 0.35;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  return arr;
}

function makeGrit(n: number) {
  const arr = new Float32Array(n * 3);
  const C = 28;
  const centres: [number, number, number, number][] = [];
  for (let i = 0; i < C; i++) {
    centres.push([
      (Math.random() - 0.5) * 9,
      (Math.random() - 0.5) * 2.2,
      (Math.random() - 0.5) * 5.5,
      0.35 + Math.random() * 0.55,
    ]);
  }
  for (let i = 0; i < n; i++) {
    const c = centres[i % C];
    let r = Math.random();
    r = Math.pow(r, 1 / 3) * c[3];
    const phi = Math.random() * Math.PI * 2;
    const cosT = Math.random() * 2 - 1;
    const sinT = Math.sqrt(1 - cosT * cosT);
    arr[i * 3 + 0] = c[0] + r * sinT * Math.cos(phi);
    arr[i * 3 + 1] = c[1] + r * sinT * Math.sin(phi) * 0.6;
    arr[i * 3 + 2] = c[2] + r * cosT;
  }
  return arr;
}

function makePowder(n: number) {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u1 = Math.random() || 1e-6;
    const u2 = Math.random();
    const gx = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const gz = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    arr[i * 3 + 0] = gx * 1.6;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
    arr[i * 3 + 2] = gz * 1.1;
  }
  return arr;
}

function makeFinishedSlab(n: number) {
  // Stage 4 — the FINISHED, ENGINEERED slab.
  // Narrative: "from raw crystal to finished slab" — particles reassemble
  // from chaos back into a precise, tilted rectangular slab presented
  // toward the viewer (like a countertop sample held up to the light).
  //
  // Sharper, smaller, and cleaner than the stage-1 slab so they read
  // as distinct states — stage 1 is "raw material", stage 4 is "product".
  const arr = new Float32Array(n * 3);

  // Slab dimensions (slightly tighter than stage-1 so the geometry reads
  // as refined/engineered rather than raw)
  const W = 7.2;   // width
  const D = 3.8;   // depth
  const T = 0.22;  // thickness

  // Present the slab tilted toward camera — rotate on X so the back edge
  // lifts up and the front edge dips. Adds a subtle yaw so it feels held.
  const tiltX = -0.28;   // ~16° toward viewer
  const yawY  = 0.08;    // slight rotation

  const cx = 0, cy = -0.1, cz = 0;

  for (let i = 0; i < n; i++) {
    // 88% of particles form the slab surface (top face) — a dense plane
    // that reads as a polished countertop face
    // 10% fill the side edges — thin band giving it visual depth
    // 2% scatter as sparkle above the slab — finished-product highlights
    const r = Math.random();

    let lx: number, ly: number, lz: number;

    if (r < 0.88) {
      // Surface plane — slight z-jitter within thickness so the top face
      // has some material density rather than being a perfect 2D sheet
      lx = (Math.random() - 0.5) * W;
      lz = (Math.random() - 0.5) * D;
      ly = T * 0.5 - Math.random() * 0.04; // hug the top face
    } else if (r < 0.98) {
      // Edges — pick a side (±W/2 or ±D/2) and place particle there
      if (Math.random() < 0.5) {
        lx = Math.sign(Math.random() - 0.5) * W * 0.5;
        lz = (Math.random() - 0.5) * D;
      } else {
        lx = (Math.random() - 0.5) * W;
        lz = Math.sign(Math.random() - 0.5) * D * 0.5;
      }
      ly = (Math.random() - 0.5) * T;
    } else {
      // Ambient sparkle cloud just above the slab — "engineered quality" glints
      lx = (Math.random() - 0.5) * W * 0.9;
      lz = (Math.random() - 0.5) * D * 0.9;
      ly = T * 0.5 + Math.random() * 0.8;
    }

    // Apply tilt (rotate around X) then yaw (rotate around Y)
    const ctx = Math.cos(tiltX), stx = Math.sin(tiltX);
    const ry1 = ly * ctx - lz * stx;
    const rz1 = ly * stx + lz * ctx;

    const cy2 = Math.cos(yawY), sy2 = Math.sin(yawY);
    const rx2 = lx * cy2 + rz1 * sy2;
    const rz2 = -lx * sy2 + rz1 * cy2;

    arr[i * 3 + 0] = cx + rx2;
    arr[i * 3 + 1] = cy + ry1;
    arr[i * 3 + 2] = cz + rz2;
  }
  return arr;
}

// ----- Shaders -----

const vertexShader = /* glsl */ `
  attribute vec3 aPosA;
  attribute vec3 aPosB;
  attribute vec3 aPosC;
  attribute vec3 aPosD;
  attribute vec3 aRand;
  attribute float aSize;

  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform float uSize;

  varying float vMix;
  varying vec3  vRand;

  void main(){
    float tAB = smoothstep(0.0, 1.0, clamp(uProgress, 0.0, 1.0));
    float tBC = smoothstep(0.0, 1.0, clamp(uProgress - 1.0, 0.0, 1.0));
    float tCD = smoothstep(0.0, 1.0, clamp(uProgress - 2.0, 0.0, 1.0));

    vec3 posAB = mix(aPosA, aPosB, tAB);
    vec3 posBC = mix(posAB, aPosC, tBC);
    vec3 pos   = mix(posBC, aPosD, tCD);

    // Powder drift — only active while we're clearly in the powder stage.
    // Fade out hard by 2.05 so no vertical motion leaks into the crystal
    // settle (which starts at progress=2.0). This removes the "dripping"
    // streaks we were seeing on stage 4.
    float powderWindow = smoothstep(1.2, 1.9, uProgress) * (1.0 - smoothstep(1.95, 2.05, uProgress));
    float drift = sin(uTime * 0.6 + aRand.x * 18.0) * 0.15
                + cos(uTime * 0.4 + aRand.y * 12.0) * 0.12;
    pos.y += drift * powderWindow;
    pos.x += sin(uTime * 0.5 + aRand.z * 10.0) * 0.08 * powderWindow;

    // Subtle "breathing" on crystals — micro-shimmer, no macro movement
    float crystalPhase = smoothstep(2.2, 2.8, uProgress);
    float breath = sin(uTime * 0.3 + aRand.x * 6.2831) * 0.015;
    float shimmer = sin(uTime * 1.4 + aRand.y * 9.0) * 0.008 * crystalPhase;
    pos += aRand * (breath + shimmer);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Per-stage size scaling:
    //   slab → grit         : 1.0  → 1.45  (grit looks chunkier)
    //   grit → powder       : 1.45 → 0.55  (powder is fine dust)
    //   powder→finished slab: 0.55 → 0.75  (crisp refined slab — NOT bokeh)
    float stageSize;
    if (uProgress < 1.0)      stageSize = mix(1.0, 1.45, tAB);
    else if (uProgress < 2.0) stageSize = mix(1.45, 0.55, tBC);
    else                      stageSize = mix(0.55, 0.75, tCD);
    gl_PointSize = uSize * aSize * stageSize * uPixelRatio * (320.0 / -mvPosition.z);

    vMix  = uProgress;
    vRand = aRand;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColorDark;
  uniform vec3 uColorMid;
  uniform vec3 uColorLight;

  varying float vMix;
  varying vec3  vRand;

  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    // Softer per-particle alpha so overlapping particles don't saturate.
    // NormalBlending clamps each pixel's resulting alpha at 1.0,
    // so 20 overlapping particles look like a single solid dust grain,
    // not a pure white highlight.
    float alpha = smoothstep(0.5, 0.15, d) * 0.75;

    // Medium-tone colors that read cleanly on the dark bg
    vec3 slabC     = mix(uColorMid,  uColorLight, 0.35 + vRand.x * 0.35);
    vec3 gritC     = mix(uColorDark, uColorMid,   0.55 + vRand.y * 0.40);
    vec3 powderC   = mix(uColorMid,  uColorLight, 0.55 + vRand.z * 0.40);
    // Finished slab — cool, clean quartz tone. Restrained (NOT pushed to
    // pure white) so the slab reads as a material surface, not a blowout.
    vec3 finishedC = mix(uColorMid,  uColorLight, 0.50 + vRand.x * 0.35);

    float tAB = smoothstep(0.0, 1.0, clamp(vMix, 0.0, 1.0));
    float tBC = smoothstep(0.0, 1.0, clamp(vMix - 1.0, 0.0, 1.0));
    float tCD = smoothstep(0.0, 1.0, clamp(vMix - 2.0, 0.0, 1.0));

    vec3 col = slabC;
    col = mix(col, gritC,     tAB);
    col = mix(col, powderC,   tBC);
    col = mix(col, finishedC, tCD);

    // Rare bright quartz glints on the finished slab (~1% of particles)
    float sparkle = step(0.99, vRand.x) * tCD;
    col += sparkle * vec3(0.4, 0.5, 0.7);

    gl_FragColor = vec4(col, alpha);
  }
`;

// ----- The particle mesh -----

function QuartzParticles({ progressRef }: { progressRef: React.RefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { gl, camera } = useThree();

  // Build attributes once
  const { geometry, material } = useMemo(() => {
    const posA = makeSlab(PARTICLE_COUNT);
    const posB = makeGrit(PARTICLE_COUNT);
    const posC = makePowder(PARTICLE_COUNT);
    const posD = makeFinishedSlab(PARTICLE_COUNT);

    const rand = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      rand[i * 3 + 0] = Math.random();
      rand[i * 3 + 1] = Math.random();
      rand[i * 3 + 2] = Math.random();
      sizes[i] = 0.5 + Math.pow(Math.random(), 4) * 3.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posA.slice(), 3));
    geo.setAttribute("aPosA", new THREE.BufferAttribute(posA, 3));
    geo.setAttribute("aPosB", new THREE.BufferAttribute(posB, 3));
    geo.setAttribute("aPosC", new THREE.BufferAttribute(posC, 3));
    geo.setAttribute("aPosD", new THREE.BufferAttribute(posD, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPixelRatio: { value: gl.getPixelRatio() },
        // Shader math: gl_PointSize = uSize * aSize * stageSize * dpr * (320 / -z)
        // At camera z=9 that multiplies by ~35, then by aSize~0.6 avg → 0.25 reads as ~5px
        uSize: { value: 0.25 },
        uColorDark: { value: new THREE.Color(COLOR_DARK) },
        uColorMid: { value: new THREE.Color(COLOR_MID) },
        uColorLight: { value: new THREE.Color(COLOR_LIGHT) },
      },
      transparent: true,
      depthWrite: false,
      // NormalBlending: each particle alpha-blends with what's behind it,
      // capping per-pixel alpha at 1.0. Avoids the "blown out white center"
      // that AdditiveBlending produces when thousands of particles overlap.
      blending: THREE.NormalBlending,
    });

    return { geometry: geo, material: mat };
  }, [gl]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const progress = progressRef.current ?? 0;
    material.uniforms.uProgress.value = progress;

    if (pointsRef.current) {
      const p01 = progress / 3;
      pointsRef.current.rotation.y = p01 * Math.PI * 0.35;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    }

    // Camera: hold back during the finished-slab reveal. Moving closer
    // at this stage blew particles up into bokeh — instead, pull slightly
    // WIDER and lower the look-at point so the tilted slab frames nicely.
    const finalT = Math.min(1, Math.max(0, progress - 2.0));
    camera.position.z = 9.0 + finalT * 0.4;          // 9.0 → 9.4 (reveal framing)
    camera.position.y = 0.3 + finalT * 0.4;          // slight rise for 3/4 view
    camera.lookAt(0, -finalT * 0.3, 0);
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ----- The section wrapper (sticky + scroll driving + UI) -----

const STAGES = [
  {
    title: (
      <>
        Every surface begins <em className="text-pacific-mid not-italic font-light">bound by resin.</em>
      </>
    ),
    copy:
      "A polymer binder holds the matrix — 7% of the final composition — giving the slab its strength and non-porous finish.",
    label: "Bound",
  },
  {
    title: (
      <>
        Coloured by <em className="text-pacific-mid not-italic font-light">pigment.</em>
      </>
    ),
    copy:
      "Natural and synthetic pigments are dispersed through coarse quartz grits, giving every collection its signature tone.",
    label: "Coloured",
  },
  {
    title: (
      <>
        93% <em className="text-pacific-mid not-italic font-light">crushed quartz.</em>
      </>
    ),
    copy:
      "Fine quartz aggregate — the material backbone. Hardness 7 on the Mohs scale. The reason Pacific surfaces outlast the kitchens they sit in.",
    label: "Crushed",
  },
  {
    title: (
      <>
        Engineered for <em className="text-pacific-mid not-italic font-light">life.</em>
      </>
    ),
    copy:
      "14 days. 1,200 tons of press force. Zero compromise. The finished slab — precision re-formed from raw material.",
    label: "Finished",
  },
];

export function OriginSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<number>(0);
  const fillRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  // Only mount the WebGL canvas when the section is near the viewport.
  // Avoids hitting the browser WebGL-context limit during dev/Fast-Refresh
  // and saves GPU when the user hasn't scrolled here yet.
  const [canvasMounted, setCanvasMounted] = useState(false);
  // Key used to force-remount Canvas after a context-loss event
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      // Smaller scrub = tighter tracking of actual scroll position.
      // Lenis already provides lerp smoothing, so keep this small.
      scrub: 0.25,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p * 3;
        if (fillRef.current) {
          fillRef.current.style.width = (p * 100).toFixed(2) + "%";
        }
        const idx = Math.max(0, Math.min(3, Math.round(p * 3)));
        setActiveStage(idx);
      },
    });

    // Mount Canvas the first time the section comes within 1 screen of the
    // viewport, and keep it mounted. Re-mounting on every scroll past was
    // causing the particle field to flicker in/out.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCanvasMounted(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "100% 0px 100% 0px", threshold: 0 }
    );
    io.observe(sectionRef.current);

    return () => {
      st.kill();
      io.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-origin-section
      className="relative"
      style={{ height: "400vh", background: "#0a1620" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* The 3D canvas */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(154,168,182,.10) 0%, rgba(17,39,50,0) 60%), linear-gradient(180deg,#0b1a23 0%, #0a1620 50%, #0b1a23 100%)",
          }}
        >
          {canvasMounted && (
            <Canvas
              key={canvasKey}
              // DPR=1 — for a soft particle field, higher pixel density
              // has no visible benefit but costs 2-4x fragments to shade.
              dpr={1}
              camera={{ position: [0, 0.3, 9], fov: 45, near: 0.1, far: 100 }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: false,
              }}
              onCreated={({ gl }) => {
                // Refresh ScrollTrigger now that the Canvas is in the DOM
                // (sticky/flex layout may have shifted before this point)
                ScrollTrigger.refresh();

                // Attempt graceful recovery if the WebGL context is ever lost
                const canvas = gl.domElement;
                const onLost = (e: Event) => {
                  e.preventDefault();
                  // Remount on next tick so Three.js can rebuild cleanly
                  setTimeout(() => setCanvasKey((k) => k + 1), 0);
                };
                canvas.addEventListener("webglcontextlost", onLost, false);
              }}
            >
              <QuartzParticles progressRef={progressRef} />
            </Canvas>
          )}
        </div>

        {/* Overlay UI */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-between"
          style={{ padding: "5vh 6vw" }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-[14px] text-[11px] font-medium uppercase tracking-[0.3em] text-pacific-mid">
            <span className="h-1.5 w-1.5 rounded-full bg-pacific-mid" />
            Section 03 · The Origin
          </div>

          {/* Title stack (crossfade) */}
          <div className="max-w-[720px]">
            <div className="relative min-h-[200px]">
              {STAGES.map((s, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    opacity: i === activeStage ? 1 : 0,
                    transform: i === activeStage ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  <h2
                    className="font-light text-white"
                    style={{
                      fontSize: "clamp(40px, 6.5vw, 96px)",
                      lineHeight: 1.02,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.title}
                  </h2>
                  <p
                    className="mt-[18px] max-w-[460px] text-[15px] leading-[1.6] text-pacific-mid"
                  >
                    {s.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stage index */}
          <div className="flex items-center gap-9">
            {STAGES.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.25em] transition-opacity duration-400"
                style={{
                  opacity: i === activeStage ? 1 : 0.4,
                  color: i === activeStage ? "#fff" : COLOR_MID,
                }}
              >
                <span className="font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress rail */}
        <div
          className="absolute bottom-[5vh] h-px bg-pacific-mid/20"
          style={{ left: "6vw", right: "6vw" }}
        >
          <div ref={fillRef} className="h-full bg-white" style={{ width: "0%" }} />
        </div>
      </div>
    </section>
  );
}

export default OriginSection;
