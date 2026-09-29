"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

gsap.registerPlugin(ScrollTrigger);

// GPT-generated v7 "knife metal" mesh - kept as the emblem by choice.
// Swap the file here to change it; the component doesn't care about its shape.
const MODEL_URL = "/models/trident-skull-v7.glb";

const GLOW = 0x6d6dff; // --color-glow
const ICE = 0xa9b8ff; // --color-ice

const GLEAM_EVERY_MS = 7000;
const GLEAM_DURATION_MS = 1300;

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Soft radial glow texture for the backlight behind the emblem's cutouts. */
function makeGlowTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(190,200,255,1)");
  grad.addColorStop(0.25, "rgba(120,120,255,0.75)");
  grad.addColorStop(0.6, "rgba(90,90,230,0.22)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Metallic trident-skull emblem rendered with three.js on a transparent canvas.
 * - knife gleam: a tall strip light sweeps across the blade edges every few
 *   seconds, and whenever the cursor comes over the emblem
 * - cursor lighting: the indigo/ice rim lights follow the pointer (they orbit
 *   slowly on touch devices)
 * - glow through the cutouts: an additive backlight behind the badge shines
 *   through the eye sockets and gaps, pulsing gently
 * - scroll takeover: while the hero is pinned the emblem turns to face the
 *   camera, zooms in and brightens; as the hero leaves it tilts away and fades
 * The mesh is a thin extruded badge, so at rest it sways instead of spinning.
 */
export default function TridentSkull3D({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    RectAreaLightUniformsLib.init();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.45;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    scene.add(new THREE.AmbientLight(0xffffff, 0.18));
    const key = new THREE.DirectionalLight(0xdfe4ff, 1.9);
    key.position.set(3, 4, 5);
    scene.add(key);
    const glowLight = new THREE.PointLight(GLOW, 70, 25);
    glowLight.position.set(-6, 1, 5);
    scene.add(glowLight);
    const iceLight = new THREE.PointLight(ICE, 45, 25);
    iceLight.position.set(6, -3, 4);
    scene.add(iceLight);

    // knife gleam: a tall, thin strip light that slides across in front
    const gleam = new THREE.RectAreaLight(0xeef2ff, 0, 0.5, 14);
    gleam.position.set(-8, 0, 4);
    scene.add(gleam);

    const pivot = new THREE.Group();
    scene.add(pivot);
    let modelHeight = 6.3; // refined from the model's bounding box once loaded
    let modelWidth = 5.5;

    // backlight - child of the pivot so it stays behind the badge as it turns
    const glowTexture = makeGlowTexture();
    const backGlowMaterial = new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.6,
    });
    const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backGlowMaterial);
    pivot.add(backGlow);
    const coreGlowMaterial = backGlowMaterial.clone();
    const coreGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), coreGlowMaterial);
    pivot.add(coreGlow);

    function fit() {
      const w = host!.clientWidth;
      const h = host!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      // pull back until the emblem fills ~72% of the height (and fits the width),
      // leaving headroom for the takeover zoom so it never clips the frame
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const distForHeight = modelHeight / 2 / 0.72 / tanHalf;
      const distForWidth = modelWidth / 2 / 0.8 / (tanHalf * camera.aspect);
      camera.position.set(0, 0, Math.max(distForHeight, distForWidth));
      camera.updateProjectionMatrix();
    }

    let disposed = false;
    new GLTFLoader().load(MODEL_URL, (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      model.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && !mesh.geometry.attributes.normal) mesh.geometry.computeVertexNormals();
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(box.getCenter(new THREE.Vector3()));
      modelHeight = size.y;
      modelWidth = size.x;
      pivot.add(model);

      const backZ = -size.z / 2 - 0.35;
      backGlow.scale.set(size.x * 1.25, size.y * 1.1, 1);
      backGlow.position.set(0, 0, backZ);
      // brighter core behind the nose/eye area (a little below center)
      coreGlow.scale.set(size.x * 0.55, size.y * 0.4, 1);
      coreGlow.position.set(0, -size.y * 0.1, backZ + 0.01);

      fit();
      if (reduced) renderer.render(scene, camera);
    });

    // ---- pointer: drives parallax, light positions and hover-gleam ----
    const pointer = { x: 0, y: 0 };
    const lightTarget = { x: 0, y: 0 };
    let lastGleam = -Infinity;
    let hovering = false;
    function onPointerMove(e: PointerEvent) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      const rect = host!.getBoundingClientRect();
      const inside =
        e.clientX > rect.left + rect.width * 0.2 &&
        e.clientX < rect.right - rect.width * 0.2 &&
        e.clientY > rect.top + rect.height * 0.15 &&
        e.clientY < rect.bottom - rect.height * 0.15;
      if (inside && !hovering) requestGleam(performance.now(), 1500);
      hovering = inside;
    }
    if (!isTouch && !reduced) window.addEventListener("pointermove", onPointerMove);

    function requestGleam(now: number, cooldown: number) {
      if (now - lastGleam > cooldown) lastGleam = now;
    }

    // ---- scroll takeover, scrubbed across the hero's pin + exit ----
    const scroll = { p: 0 };
    const stage = host.parentElement;
    const trigger =
      stage && !reduced
        ? ScrollTrigger.create({
            trigger: stage,
            start: "top top",
            end: "+=140%",
            onUpdate: (self) => {
              const prev = scroll.p;
              scroll.p = self.progress;
              // fire a gleam as the takeover begins
              if (prev < 0.08 && scroll.p >= 0.08) requestGleam(performance.now(), 800);
            },
          })
        : null;

    // only animate while the hero is actually on screen
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(host);

    const resizeObserver = new ResizeObserver(() => {
      fit();
      if (reduced) renderer.render(scene, camera);
    });
    resizeObserver.observe(host);
    fit();

    let raf = 0;
    function frame(time: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      const takeover = smoothstep(0, 0.45, scroll.p); // face the camera + zoom
      const exit = smoothstep(0.55, 1, scroll.p); // tilt away + fade

      // idle sway, damped out as the takeover faces it forward
      const sway = Math.sin(time * 0.00035) * 0.55 * (1 - takeover);
      pivot.rotation.y = sway + pointer.x * 0.12 * (1 - takeover) + exit * 0.5;
      const targetX = pointer.y * 0.1 * (1 - takeover) - exit * 0.55;
      pivot.rotation.x += (targetX - pivot.rotation.x) * 0.06;
      pivot.position.y = Math.sin(time * 0.0006) * 0.08 * (1 - takeover) + exit * modelHeight * 0.06;
      pivot.scale.setScalar(1 + takeover * 0.15 - exit * 0.2);
      renderer.domElement.style.opacity = String(1 - exit * 0.9);

      // lights chase the pointer (or orbit slowly on touch)
      if (isTouch) {
        lightTarget.x = Math.sin(time * 0.0003);
        lightTarget.y = Math.cos(time * 0.00023) * 0.6;
      } else {
        lightTarget.x += (pointer.x - lightTarget.x) * 0.05;
        lightTarget.y += (pointer.y - lightTarget.y) * 0.05;
      }
      glowLight.position.set(lightTarget.x * 7 - 1, -lightTarget.y * 4 + 1, 5);
      iceLight.position.set(-lightTarget.x * 6 + 1, lightTarget.y * 4 - 2, 4);
      glowLight.intensity = 70 + takeover * 50;

      // backlight pulse, stronger during the takeover
      const pulse = 0.5 + Math.sin(time * 0.0012) * 0.5;
      backGlowMaterial.opacity = 0.35 + pulse * 0.2 + takeover * 0.25;
      coreGlowMaterial.opacity = 0.45 + pulse * 0.35 + takeover * 0.2;

      // knife gleam: periodic sweep, plus hover / scroll-triggered ones
      if (time - lastGleam > GLEAM_EVERY_MS) lastGleam = time;
      const g = (time - lastGleam) / GLEAM_DURATION_MS;
      if (g >= 0 && g <= 1) {
        const eased = g * g * (3 - 2 * g);
        gleam.position.set(-8 + eased * 16, 0, 4);
        gleam.lookAt(0, 0, 0);
        gleam.intensity = Math.sin(g * Math.PI) * 28;
      } else {
        gleam.intensity = 0;
      }

      renderer.render(scene, camera);
    }
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      trigger?.kill();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
      });
      glowTexture.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
