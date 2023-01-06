const GRID_COLOR = 'rgba(0,255,217,0.7)';

export default class TilesetDrawer {
  canvas;
  ctx;
  image = null;
  tileSize = 32;
  imageWidth = 60;
  imageHeight = 60;
  /**
   * @param {HTMLElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  setDrawValues(image, tileSize) {
    this.image = image;
    this.imageWidth = image.naturalWidth;
    this.imageHeight = image.naturalHeight;
    this.tileSize = tileSize;
  }

  resizeCanvas() {
    this.canvas.width = this.imageWidth;
    this.canvas.height = this.imageHeight;
  }

  drawImage() {
    this.ctx.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight);
  }

  drawGrid = () => {
    this.ctx.strokeStyle = GRID_COLOR;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    for (let x = 0; x < this.imageWidth + 1; x += this.tileSize) {
      this.ctx.moveTo(x, 0.5);
      this.ctx.lineTo(x, this.imageHeight + 0.5);
    }
    for (let y = 0; y < this.imageHeight + 1; y += this.tileSize) {
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(this.imageWidth, y + 0.5);
    }
    this.ctx.stroke();
  };

  drawAll = () => {
    this.resizeCanvas();
    this.drawImage();
    this.drawGrid();
  };
}
