export default class TilesetDrawer {
  canvas;
  ctx;
  /**
   * @param {HTMLElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * @param {HTMLElement} image
   */
  drawImage(image) {
    // set canvs size
    this.canvas.width = image.naturalWidth;
    this.canvas.height = image.naturalHeight;

    // draw image
    this.ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

    // draw grid
    this.drawGrid(image.naturalWidth, image.naturalHeight);
  }

  drawGrid = (w, h, step = 32, color = 'rgba(0,255,217,0.7)') => {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    for (let x = 0; x < w + 1; x += step) {
      this.ctx.moveTo(x, 0.5);
      this.ctx.lineTo(x, h + 0.5);
    }
    for (let y = 0; y < h + 1; y += step) {
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(w, y + 0.5);
    }
    this.ctx.stroke();
  };
}
