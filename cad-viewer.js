// Interactive 3D CAD viewer for project modals.
// Renders any element shaped like:
//   <div class="cad-viewer" data-model="assets/models/part.stl"></div>
// Supports .stl (SolidWorks export) and .glb/.gltf files.
// Viewers lazy-initialize the first time they become visible and pause
// rendering while hidden, so closed modals cost nothing.

import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const viewers = new Map(); // element -> viewer state

function createViewer(el) {
  const modelUrl = el.dataset.model;
  if (!modelUrl) return null;

  el.classList.add("cad-loading");

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);

  // Studio-style lighting so machined surfaces read clearly
  scene.add(new THREE.HemisphereLight(0xffffff, 0x666677, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(1, 2, 1.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd4ff, 0.7);
  rim.position.set(-1.5, -0.5, -1);
  scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = !REDUCED_MOTION;
  controls.autoRotateSpeed = 1.6;

  // Stop the auto-spin once the visitor takes over
  controls.addEventListener("start", () => {
    controls.autoRotate = false;
    el.classList.add("cad-touched");
  });

  const state = {
    el,
    scene,
    camera,
    renderer,
    controls,
    running: false,
    frame: 0,
  };

  loadModel(modelUrl, state);

  const resize = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  new ResizeObserver(resize).observe(el);
  resize();

  return state;
}

function loadModel(url, state) {
  const isStl = /\.stl(\?.*)?$/i.test(url);
  const color = state.el.dataset.cadColor || "#96a9c4";

  const onError = () => {
    state.el.classList.remove("cad-loading");
    state.el.classList.add("cad-error");
    const msg = document.createElement("div");
    msg.className = "cad-message";
    msg.textContent = "3D model could not be loaded";
    state.el.appendChild(msg);
  };

  const onReady = (object) => {
    frameObject(object, state);
    state.el.classList.remove("cad-loading");
    if (!state.el.querySelector(".cad-hint")) {
      const hint = document.createElement("div");
      hint.className = "cad-hint";
      hint.textContent = "drag to rotate · scroll to zoom";
      state.el.appendChild(hint);
    }
  };

  if (isStl) {
    new STLLoader().load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          metalness: 0.55,
          roughness: 0.42,
        });
        onReady(new THREE.Mesh(geometry, material));
      },
      undefined,
      onError
    );
  } else {
    new GLTFLoader().load(url, (gltf) => onReady(gltf.scene), undefined, onError);
  }
}

function frameObject(object, state) {
  // Center the part on the origin and pull the camera back to fit it
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length() || 1;

  object.position.sub(center);
  state.scene.add(object);

  const dist = size * 1.05;
  state.camera.position.set(dist * 0.75, dist * 0.45, dist * 0.75);
  state.camera.near = size / 100;
  state.camera.far = size * 20;
  state.camera.updateProjectionMatrix();

  state.controls.minDistance = size * 0.4;
  state.controls.maxDistance = size * 3;
  state.controls.target.set(0, 0, 0);
  state.controls.update();

  // Draw one frame right away so the model appears even before the
  // animation loop's first tick
  state.renderer.render(state.scene, state.camera);
}

function startLoop(state) {
  if (state.running) return;
  state.running = true;
  const tick = () => {
    if (!state.running) return;
    state.frame = requestAnimationFrame(tick);
    state.controls.update();
    state.renderer.render(state.scene, state.camera);
  };
  tick();
}

function stopLoop(state) {
  state.running = false;
  cancelAnimationFrame(state.frame);
}

// Lazy-init viewers when they become visible, pause them when hidden.
// script.js dispatches "cad:refresh" whenever a modal opens/closes or a
// carousel slide changes.
function refreshViewers() {
  document.querySelectorAll(".cad-viewer[data-model]").forEach((el) => {
    const visible = el.clientWidth > 0 && el.clientHeight > 0;

    if (visible) {
      if (!viewers.has(el)) {
        const state = createViewer(el);
        if (state) viewers.set(el, state);
      }
      const state = viewers.get(el);
      if (state) {
        state.camera.aspect = el.clientWidth / el.clientHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(el.clientWidth, el.clientHeight);
        startLoop(state);
      }
    } else {
      const state = viewers.get(el);
      if (state) stopLoop(state);
    }
  });
}

document.addEventListener("cad:refresh", refreshViewers);
refreshViewers();
