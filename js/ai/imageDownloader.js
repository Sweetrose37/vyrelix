/**
 * Creates downloadable PNG files for CSS demo artwork without network access.
 */

/** Draws a clearly labeled demo image to an in-memory canvas. */
export function createDemoCanvas(record, size = 768) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, record.artwork.background);
  gradient.addColorStop(1, record.artwork.accent);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  context.strokeStyle = "rgba(255,255,255,.22)";
  context.lineWidth = 10;
  context.strokeRect(40, 40, size - 80, size - 80);
  context.fillStyle = "rgba(10,10,15,.7)";
  context.fillRect(0, size - 190, size, 190);
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.font = "700 46px Arial";
  context.fillText("DEMO IMAGE", size / 2, size - 112);
  context.font = "500 25px Arial";
  context.fillText("Generated using Mock Provider", size / 2, size - 64);
  return canvas;
}

/** Downloads a saved mock generation as PNG. */
export function downloadImage(record) {
  const canvas = createDemoCanvas(record);
  canvas.toBlob((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${String(record.title).toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-") || "vyrelix-demo"}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

