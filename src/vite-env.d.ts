/// <reference types="vite/client" />

// Optional: SVG imports as URL strings (Vite default behavior when using ?url).
// If you later use SVGR, you can extend this with a ReactComponent export.
declare module "*.svg" {
  const src: string;
  export default src;
}
