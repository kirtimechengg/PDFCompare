Build a web-based engineering document comparison tool with the following specifications:
Core Purpose
A PDF overlay comparison tool for engineering documents (P&IDs, engineering drawings, datasheets, isometric drawings, GA drawings) that allows engineers to visually identify revision changes between old and new versions.
File Input

Dual drag-and-drop zones: one for "Old Revision" (Rev A/0) and one for "New Revision" (Rev B/1)
Fallback "Browse" button for each zone for traditional file selection
Accept only .pdf files; validate and show error for invalid formats
Display file metadata after upload: filename, file size, page count, upload timestamp
Support multi-page PDFs with page navigation (next/previous, jump to page number)
Both documents must have matching page counts; warn user if mismatch detected
Allow clearing/replacing uploaded files without page refresh

Overlay Comparison Mode

Opens in a dedicated new window/tab (not modal) for distraction-free analysis
Old and new PDFs rendered as canvas layers stacked on top of each other, perfectly aligned
Color tinting per layer:

Old revision: user-selectable color (default: red)
New revision: user-selectable color (default: blue/cyan)
Color picker with preset palette (red, blue, green, magenta, cyan, yellow, black)
Intensity/opacity slider per layer (0–100%) so user can switch between "dimmer" and "darker" rendering
Blend mode toggle: multiply, difference, screen, overlay, darken (difference mode highlights changes most clearly)


Independent visibility toggle for each layer (show/hide old, show/hide new)
Auto-alignment: assume same page size; provide manual nudge controls (X/Y offset arrows + rotation in 0.1° increments) for misaligned scans

Side-by-Side Comparison Mode

Split screen: old revision on left, new revision on right
Synchronized scrolling and zoom (toggle on/off)
Synchronized page navigation (both jump to same page number)
Vertical divider that's draggable to adjust pane width ratio
Optional swipe/slider mode: single canvas with draggable vertical line revealing old on one side, new on the other

Zoom & Pan Controls

Zoom in/out buttons + Ctrl+scroll wheel zoom (10% to 800%)
Fit-to-width, fit-to-page, and 100% (actual size) preset buttons
Pan via click-and-drag when zoomed in
Mini-map / thumbnail overview in corner for navigation in large drawings
Reset view button

Theming

Light mode and dark mode toggle (persisted in localStorage)
Dark mode: dark gray canvas background (#1a1a1a), light UI chrome
Light mode: white canvas background, dark UI chrome
Smooth transition between modes
Ensure PDF rendering and overlay colors remain visible in both themes

UI/UX Requirements

Top toolbar: file controls, mode switcher (Overlay / Side-by-Side), theme toggle, export button
Left or right sidebar (collapsible): layer controls, color pickers, opacity sliders, blend mode dropdown, alignment nudge controls
Bottom status bar: current page, zoom %, cursor coordinates
Keyboard shortcuts: Ctrl +/- zoom, arrow keys pan, Space toggle layer visibility, Tab switch mode
Loading spinner during PDF rendering
Responsive layout (minimum 1280×720, scales up cleanly)

Export / Output

Export current view as PNG/JPG snapshot
Export full comparison report as PDF (all pages with overlay applied)
Print-friendly view

Technical Stack Recommendation

Frontend: React + Tailwind CSS (or vanilla HTML/CSS/JS if simpler)
PDF rendering: PDF.js (Mozilla) — renders to canvas, supports color manipulation
Canvas operations: native Canvas 2D API with globalCompositeOperation for blend modes and filter for tinting
Window management: window.open() for dedicated overlay window with postMessage for parent-child communication
State: React Context or Zustand for theme/settings persistence

Performance

Lazy-render pages (only current page + neighbors)
Cache rendered canvas data per zoom level
Handle large PDFs (50+ MB, 100+ pages) without freezing UI
Web Workers for PDF parsing if needed

Edge Cases to Handle

PDFs with different page sizes/orientations — show warning, offer to scale-fit
Scanned (raster) PDFs vs vector PDFs — both must work
Password-protected PDFs — prompt for password
Corrupted files — graceful error message