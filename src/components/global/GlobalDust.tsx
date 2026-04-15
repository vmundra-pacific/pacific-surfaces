"use client";

/**
 * GlobalDust — a page-wide ambient quartz particle layer.
 *
 * A single fixed-position WebGL canvas renders sparse quartz "dust motes"
 * behind the entire site. Particles drift slowly; scroll velocity adds a
 * gentle streak along the scroll direction. Opacity auto-dims when the
 * OriginSection is in view so the two canvases don't compete.
 *
 * Density is deliberately low (~4,000 particles @ DPR 1) so we don't chew
 * GPU on sections that aren't about particles — this is atmosphere, not
 * the hero moment.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COLOR_MID = "#9AA8B6";
const COLOR_LIGHT = "#DAE1E8";
const PARTICLE_COUNT = 4_000;

// ----- Shaders -----
const vertexShader = /* glsl */ `
  attribute vec3 aSeed;     // stable per-particle random
  attribute float aSize;    // per-particle size multiplier

  uniform float uTime;
  uniform float uScroll;       // raw scroll position (px)
  uniform float uScrollVel;    // eased scroll velocity (-1..1)
  uniform float uPixelRatio;
  uniform vec2  uMouse;        // normalized -1..1
  uniform float uSize;

  varying float vRand;

  // Cheap hash for periodic-ish motion
  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  void main() {
    // Base slot position: spread across a wide 3D field
    vec3 base = vec3(
      (aSeed.x - 0.5) * 18.0,
      (aSeed.y - 0.5) * 18.0,
      (aSeed.z - 0.5) * 8.0
    );

    // Gentle perlin-ish drift
    float t = uTime * 0.12;
    vec3 drift = vec3(
      sin(t + aSeed.x * 12.57) * 0.35,
      cos(t * 0.8 + aSeed.y * 9.42) * 0.28,
      sin(t * 0.6 + aSeed.z * 7.85) * 0.22
    );

    // Scroll-driven vertical flow: particles drift upward when scrolling
    // down and vice versa, giving the page a sense of "current".
    float scrollFlow = (uScroll * 0.002) * (0.6 + aSeed.x * 0.8);
    vec3 scrollOffset = vec3(0.0, -scrollFlow, 0.0);

    // Wrap Y within ±9 so particles recycle instead of flying off
    vec3 pos = base + drift + scrollOffset;
    pos.y = mod(pos.y + 9.0, 18.0) - 9.0;

    // Scroll velocity smears particles along Y briefly (motion trail)
    pos.y += uScrollVel * 0.5 * (0.7 + aSeed.y * 0.6);

    // Subtle parallax toward mouse
    pos.x += uMouse.x * (aSeed.z * 0.3 - 0.15);
    pos.y += uMouse.y * (aSeed.x * 0.3 - 0.15);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = uSize * aSize * uPixelRatio * (260.0 / -mv.z);
    vRand = aSeed.x;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColorMid;
  uniform vec3 uColorLight;
  uniform float uOpacity;

  varying float vRand;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, d);
    vec3 col = mix(uColorMid, uColorLight, vRand);
    gl_FragColor = vec4(col, alpha * 0.35 * uOpacity);
  }
`;

// ----- Particle mesh -----
function DustField({
  scrollRef,
  scrollVelRef,
  mouseRef,
  opacityRef,
}: {
  scrollRef: React.RefObject<number>;
  scrollVelRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  opacityRef: React.RefObject<number>;
}) {
  const { gl } = useThree();

  const { geometry, material } = useMemo(() => {
    const seed = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const pos = new Float32Array(PARTICLE_COUNT * 3); // placeholder
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seed[i * 3 + 0] = Math.random();
      seed[i * 3 + 1] = Math.random();
      seed[i * 3 + 2] = Math.random();
      sizes[i] = 0.3 + Math.pow(Math.random(), 3) * 2.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uScrollVel: { value: 0 },
        uPixelRatio: { value: gl.getPixelRatio() },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uSize: { value: 0.32 },
        uColorMid: { value: new THREE.Color(COLOR_MID) },
        uColorLight: { value: new THREE.Color(COLOR_LIGHT) },
        uOpacity: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
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

  // Smoothed opacity state so fade in/out of the Origin section is graceful
  const smoothedOpacity = useRef(1);

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uScroll.value = scrollRef.current ?? 0;
    u.uScrollVel.value = scrollVelRef.current ?? 0;
    const m = mouseRef.current;
    if (m) {
      u.uMouse.value.set(m.x, m.y);
    }
    const target = opacityRef.current ?? 1;
    smoothedOpacity.current += (target - smoothedOpacity.current) * 0.08;
    u.uOpacity.value = smoothedOpacity.current;
  });

  return <points geometry={geometry} material={material} />;
}

// ----- Wrapper component -----
export default function GlobalDust() {
  const scrollRef = useRef(0);
  const scrollVelRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const opacityRef = useRef(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay mount until after first paint — avoids race with Origin canvas
    // during initial hydration and lets the page settle first.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let lastScroll = window.scrollY;
    let lastTime = performance.now();
    let velDecay = 0;

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const y = window.scrollY;
      const raw = (y - lastScroll) / dt;
      // Clamp and ease scroll velocity into a -1..1 range-ish
      const clamped = Math.max(-3, Math.min(3, raw));
      velDecay = clamped;
      scrollVelRef.current = clamped;
      scrollRef.current = y;
      lastScroll = y;
      lastTime = now;
    };

    const decayTimer = setInterval(() => {
      // Exponential decay toward 0 when no scroll
      velDecay *= 0.85;
      if (Math.abs(velDecay) < 0.01) velDecay = 0;
      scrollVelRef.current = velDecay;
    }, 32);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    scrollRef.current = window.scrollY;

    // Observe the OriginSection (by data attribute) and dim the dust layer
    // while it's on screen so the two canvases don't visually clash.
    const originEl = document.querySelector("[data-origin-section]");
    let io: IntersectionObserver | null = null;
    if (originEl) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            // If even 20% of Origin is visible, fade dust out
            opacityRef.current = entry.intersectionRatio > 0.2 ? 0 : 1;
          }
        },
        { threshold: [0, 0.2, 0.5, 1] }
      );
      io.observe(originEl);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      clearInterval(decayTimer);
      io?.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        // The fixed canvas sits behind all page content. We keep it as a
        // transparent layer so sections with their own backgrounds (Origin)
        // will sit cleanly on top.
        mixBlendMode: "screen",
      }}
    >
      <Canvas
        dpr={1}
        camera={{ position: [0, 0, 10], fov: 55, near: 0.1, far: 100 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        style={{ background: "transparent" }}
      >
        <DustField
          scrollRef={scrollRef}
          scrollVelRef={scrollVelRef}
          mouseRef={mouseRef}
          opacityRef={opacityRef}
        />
      </Canvas>
    </div>
  );
}
