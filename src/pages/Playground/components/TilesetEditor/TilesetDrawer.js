import tilemapManager from '../../../../../tilemap/tilemap-manager';

const GRID_COLOR = 'rgba(0,255,217,0.7)';

export default class TilesetDrawer {
  canvas;
  ctx;
  image = null;
  tileSize = 32;
  imageWidth = 60;
  imageHeight = 60;
  isMouseDown = false;
  tiles = [];
  selectedTileData = null;
  startTilePosition = null;
  endTilePosition = null;
  selectedRect = null;
  /**
   * @param {HTMLElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    //
    this.realCanvas = document.createElement('canvas');
    this.realCtx = this.realCanvas.getContext('2d');

    // Add listeners
    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
    this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
  }

  onPointerDown(event) {
    if (event.button === 0) {
      this.isMouseDown = true;

      const {x, y} = event.target.getBoundingClientRect();

      const tx = Math.floor(Math.max(event.clientX - x, 0) / this.tileSize);
      const ty = Math.floor(Math.max(event.clientY - y, 0) / this.tileSize);

      this.startTilePosition = {
        x: tx,
        y: ty,
      };

      this.endTilePosition = {
        x: tx,
        y: ty,
      };

      this.selectedRect = {
        minX: tx,
        minY: ty,
        maxX: tx,
        maxY: ty,
      };
    }
  }

  onPointerUp(event) {
    if (event.button === 0) {
      this.isMouseDown = false;
      this.drawAll();
      this.initSelectedTileData();
    }
  }

  onPointerMove(event) {
    if (this.isMouseDown) {
      const {x, y} = event.target.getBoundingClientRect();

      const tx = Math.floor(Math.max(event.clientX - x, 0) / this.tileSize);
      const ty = Math.floor(Math.max(event.clientY - y, 0) / this.tileSize);

      if (tx !== this.endTilePosition.x || ty !== this.endTilePosition.y) {
        this.endTilePosition = {
          x: tx,
          y: ty,
        };

        const minX =
          this.startTilePosition.x <= this.endTilePosition.x
            ? this.startTilePosition.x
            : this.endTilePosition.x;
        const minY =
          this.startTilePosition.y <= this.endTilePosition.y
            ? this.startTilePosition.y
            : this.endTilePosition.y;
        const maxX =
          this.startTilePosition.x >= this.endTilePosition.x
            ? this.startTilePosition.x
            : this.endTilePosition.x;
        const maxY =
          this.startTilePosition.y >= this.endTilePosition.y
            ? this.startTilePosition.y
            : this.endTilePosition.y;

        this.selectedRect = {
          minX,
          minY,
          maxX,
          maxY,
        };

        this.drawAll();
      }
    }
  }

  setDrawValues(image, tileSize) {
    this.image = image;
    this.imageWidth = image.naturalWidth;
    this.imageHeight = image.naturalHeight;
    this.tileSize = tileSize;
    this.selectedRect = null;
    this.selectedTileData = null;
  }

  resizeCanvas() {
    this.canvas.width = this.imageWidth;
    this.canvas.height = this.imageHeight;
    this.realCanvas.width = this.imageWidth;
    this.realCanvas.height = this.imageHeight;
  }

  drawImage() {
    if (this.image) {
      this.ctx.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight);
      this.realCtx.drawImage(
        this.image,
        0,
        0,
        this.imageWidth,
        this.imageHeight,
      );
    }
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

  drawSelection = () => {
    if (this.selectedRect) {
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(0,255,217,1)';
      this.ctx.rect(
        this.selectedRect.minX * this.tileSize,
        this.selectedRect.minY * this.tileSize,
        (this.selectedRect.maxX - this.selectedRect.minX + 1) * this.tileSize,
        (this.selectedRect.maxY - this.selectedRect.minY + 1) * this.tileSize,
      );
      this.ctx.fillStyle = 'rgba(0,255,217,0.3)';
      this.ctx.fillRect(
        this.selectedRect.minX * this.tileSize,
        this.selectedRect.minY * this.tileSize,
        (this.selectedRect.maxX - this.selectedRect.minX + 1) * this.tileSize,
        (this.selectedRect.maxY - this.selectedRect.minY + 1) * this.tileSize,
      );
      this.ctx.stroke();
    }
  };

  drawAll = () => {
    this.resizeCanvas();
    this.drawImage();
    this.drawGrid();
    this.drawSelection();
  };

  initSelectedTileData = () => {
    if (this.selectedRect) {
      this.selectedTileData = this.ctx.getImageData(
        this.selectedRect.minX * this.tileSize,
        this.selectedRect.minY * this.tileSize,
        (this.selectedRect.maxX - this.selectedRect.minX + 1) * this.tileSize,
        (this.selectedRect.maxY - this.selectedRect.minY + 1) * this.tileSize,
      );
      tilemapManager.dispatchEvent(
        new MessageEvent('setTileData', {data: this.selectedTileData}),
      );
    }
  };
}
