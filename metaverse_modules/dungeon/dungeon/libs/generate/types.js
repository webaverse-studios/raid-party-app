import {nanoid} from 'nanoid';

//
// Tree
//
export class TreeNode {
  left;
  right;
  leaf;

  constructor(data) {
    this.leaf = data;
  }

  /** Get the bottom-most leaves */
  get leaves() {
    const result = [];

    if (this.left && this.right) {
      result.push(...this.left.leaves, ...this.right.leaves);
    } else {
      result.push(this.leaf);
    }

    return result;
  }
}

//
// Containers
//
export class Point {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Rectangle {
  x;
  y;
  width;
  height;

  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get center() {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  get surface() {
    return this.width * this.height;
  }

  get down() {
    return this.y + this.height;
  }

  get right() {
    return this.x + this.width;
  }
}

export class Container extends Rectangle {
  id;
  room;
  corridor;

  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.id = nanoid();
  }
}

export class Room extends Rectangle {
  id;
  template;

  constructor(x, y, id, template) {
    super(x, y, template.width, template.height);

    this.id = id;
    this.template = template;
  }
}

export class Corridor extends Rectangle {
  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  get direction() {
    return this.width > this.height ? 'horizontal' : 'vertical';
  }
}

//
// Rooms
//
export const RoomTypes = ['entrance', 'monsters', 'heal', 'treasure', 'boss'];

//
// Tiles
//
export const TileDirection = {
  NorthWest: 1,
  North: 2,
  NorthEast: 4,
  West: 8,
  East: 16,
  SouthWest: 32,
  South: 64,
  SouthEast: 128,
};
export const TileType = {
  Hole: -1,
  Wall: 1,
  All: 46,
  Door: 48,
  Ground: 0,
};
export const TileTypes = ['Hole', 'Wall'];

//
// Props
//
export const PropType = {
  Bone: 2,
  Coin: 22,
  CrateSilver: 3,
  CrateWood: 4,
  Flag: 5,
  Handcuff1: 6,
  Handcuff2: 7,
  HealthLarge: 15,
  HealthSmall: 16,
  KeyGold: 17,
  KeySilver: 18,
  Ladder: 21,
  Lamp: 8,
  ManaLarge: 19,
  ManaSmall: 20,
  Peak: 1,
  Skull: 9,
  StonesLarge: 10,
  StonesSmall: 11,
  Torch: 12,
  WebLeft: 13,
  WebRight: 14,
};
export const PropTypes = [
  'Bone',
  'Coin',
  'CrateSilver',
  'CrateWood',
  'Flag',
  'Handcuff1',
  'Handcuff2',
  'HealthLarge',
  'HealthSmall',
  'KeyGold',
  'KeySilver',
  'Ladder',
  'Lamp',
  'ManaLarge',
  'ManaSmall',
  'Peak',
  'Skull',
  'StonesLarge',
  'StonesSmall',
  'Torch',
  'WebLeft',
  'WebRight',
  'Arrow',
];

//
// Monsters
//
export const MonsterType = {
  Bandit: 1,
  CentaurFemale: 2,
  CentaurMale: 3,
  MushroomLarge: 4,
  MushroomSmall: 5,
  Skeleton: 6,
  Troll: 7,
  Wolf: 8,
};
export const MonsterTypes = [
  'Bandit',
  'CentaurFemale',
  'CentaurMale',
  'MushroomLarge',
  'MushroomSmall',
  'Skeleton',
  'Troll',
  'Wolf',
];

//
// Tilemap
//
export const TileLayer = {
  tiles: 0,
  props: 1,
  monsters: 2,
};
export const TileLayers = ['tiles', 'props', 'monsters'];

export const Direction = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};
