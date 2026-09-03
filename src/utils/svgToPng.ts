/**
 * @file svgToPng.ts
 * @description Convert an SVG string into a PNG Blob at the requested resolution.
 */
export const svgStringToPngBlob = (
  svgString: string,
  width: number,
  height: number,
  bgColor?: string
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((png) => {
        if (png) resolve(png);
        else reject(new Error('PNG encoding failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG failed to load'));
    };
    img.src = url;
  });
