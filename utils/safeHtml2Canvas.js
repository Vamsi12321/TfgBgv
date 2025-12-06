import html2canvas from "html2canvas";

export async function safeHtml2Canvas(element, options = {}) {
  // Clone the element
  const cloned = element.cloneNode(true);

  // Append clone off-screen
  Object.assign(cloned.style, {
    position: "fixed",
    top: "0",
    left: "0",
    opacity: "0",
    zIndex: "-999999",
    pointerEvents: "none",
  });

  document.body.appendChild(cloned);

  /** COPY STYLES RECURSIVELY */
  function copyStyles(source, target) {
    const computed = window.getComputedStyle(source);
    for (const prop of computed) {
      try {
        target.style[prop] = computed.getPropertyValue(prop);
      } catch (err) {}
    }
    // Recursively copy
    const sourceChildren = [...source.children];
    const targetChildren = [...target.children];
    sourceChildren.forEach((srcChild, i) => {
      copyStyles(srcChild, targetChildren[i]);
    });
  }

  copyStyles(element, cloned);

  /** FIX BROKEN COLORS */
  const fixColors = (el) => {
    const style = window.getComputedStyle(el);
    for (const prop of ["color", "backgroundColor", "borderColor"]) {
      const val = style[prop];
      if (val && /(lab|oklab|oklch)\(/.test(val)) {
        el.style[prop] = "rgb(0,0,0)";
      }
    }
    for (const child of el.children) fixColors(child);
  };
  fixColors(cloned);

  /** Generate canvas */
  const canvas = await html2canvas(cloned, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    ...options,
  });

  document.body.removeChild(cloned);
  return canvas;
}
