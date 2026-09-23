# BrainShake Website Guide

BrainShake is a local-first canvas website. The application keeps boards and interface preferences in browser storage and does not require an account.

## Accessibility

Open the `Customize` tab in the sidebar to change font size, high contrast, motion reduction, keyboard navigation, enhanced focus, themes, accent color, dock position, and auto-hide settings. The `Accessibility Tour` explains these options in the interface and includes the presentation workflow.

Focus a main tool in the dock and use the arrow keys along the dock's direction to switch tools. Hold Space and drag the canvas, including from an object, to pan without changing the active tool. Space-drag does not take over text editing or other controls.

## Interface customization

The Customize page includes independent colors for the header, sidebar, canvas, and floating panels. Resetting a surface color returns it to the active theme. Accent colors can be entered as a HEX value or selected with the native color picker.

## Presentation mode

Select one or more canvas objects and press the presentation icon in the tools dock. Marked objects show an asterisk in their title bar. The presentation button in the header opens the marked objects as slides. Use the arrow buttons or Left/Right keys to move between slides and Escape to close presentation mode.

## Running the website

```bash
npm install
npm run dev
```

The production build is generated with:

```bash
npm run build
```
