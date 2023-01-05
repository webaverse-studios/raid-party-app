export default class MapEditorDrawer {
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
    console.log(image);
    this.canvas.width = image.naturalWidth;
    this.canvas.height = image.naturalHeight;
    this.ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  }
}
