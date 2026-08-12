# Adding 3D CAD models to your portfolio

Visitors can rotate, zoom, and inspect any model you drop in this folder.
`sample-gear.stl` is a placeholder — replace it with your real parts.

## 1. Export from SolidWorks

- **File > Save As > STL (*.stl)**
- Click **Options**: choose **Binary** format and **Fine** resolution
  (binary keeps the file small; fine keeps curved surfaces smooth)
- Keep files under ~10 MB so the page stays fast. For big assemblies,
  export individual parts or use a simplified configuration.

`.glb` / `.gltf` files also work (e.g. exported from Fusion 360 or Blender).

## 2. Drop the file in this folder

```
assets/models/drivetrain-collar.stl
```

## 3. Add a 3D slide to a project modal in index.html

Inside the project's `<div class="carousel-track">`, add:

```html
<div class="modal-image cad-slide" aria-label="Interactive 3D model - drag to rotate">
  <div
    class="cad-viewer"
    data-model="assets/models/drivetrain-collar.stl"
    data-cad-color="#96a9c4"
  ></div>
  <span class="cad-slide-label">interactive CAD model</span>
</div>
```

- `data-model` — path to your file
- `data-cad-color` — part color (hex). Try `#96a9c4` (aluminum),
  `#c8873a` (brass), `#3f4750` (steel), or your team's colors.
- Add `active` to the `modal-image cad-slide` classes if you want the
  3D model to be the **first** slide (and remove `active` from the slide
  that currently has it).

To show a "3D model" badge on the project card, copy the
`<span class="card-badge-3d">` block from the submarine card.

## Notes

- The viewer loads Three.js from a CDN, so it needs an internet
  connection and a real web server. Opening index.html by double-clicking
  (file://) blocks model loading — test with a local server
  (`python -m http.server`) or just push to your live site.
- Models auto-rotate until the visitor grabs them; drag to rotate,
  scroll to zoom.
