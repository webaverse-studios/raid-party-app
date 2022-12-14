/**
 * Backtrace according to the parent records and return the path.
 * (including both start and end nodes)
 * @param {Node} node End node
 * @return {Array<Array<number>>} the path
 */
export function backtrace(node) {
  var path = [[node.x, node.y]];
  while (node.parent) {
    node = node.parent;
    path.push([node.x, node.y]);
  }
  return path.reverse();
}

/**
 * Backtrace from start and end node, and return the path.
 * (including both start and end nodes)
 * @param {Node}
 * @param {Node}
 */
export function biBacktrace(nodeA, nodeB) {
  var pathA = backtrace(nodeA),
    pathB = backtrace(nodeB);
  return pathA.concat(pathB.reverse());
}

/**
 * Compute the length of the path.
 * @param {Array<Array<number>>} path The path
 * @return {number} The length of the path
 */
export function pathLength(path) {
  var i,
    sum = 0,
    a,
    b,
    dx,
    dy;
  for (i = 1; i < path.length; ++i) {
    a = path[i - 1];
    b = path[i];
    dx = a[0] - b[0];
    dy = a[1] - b[1];
    sum += Math.sqrt(dx * dx + dy * dy);
  }
  return sum;
}

/**
 * Given the start and end coordinates, return all the coordinates lying
 * on the line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * @param {number} x0 Start x coordinate
 * @param {number} y0 Start y coordinate
 * @param {number} x1 End x coordinate
 * @param {number} y1 End y coordinate
 * @return {Array<Array<number>>} The coordinates on the line
 */
export function interpolate(x0, y0, x1, y1) {
  var abs = Math.abs,
    line = [],
    sx,
    sy,
    dx,
    dy,
    err,
    e2;

  dx = abs(x1 - x0);
  dy = abs(y1 - y0);

  sx = x0 < x1 ? 1 : -1;
  sy = y0 < y1 ? 1 : -1;

  err = dx - dy;

  for (;;) {
    line.push([x0, y0]);

    if (x0 === x1 && y0 === y1) {
      break;
    }

    e2 = 2 * err;
    if (e2 > -dy) {
      err = err - dy;
      x0 = x0 + sx;
    }
    if (e2 < dx) {
      err = err + dx;
      y0 = y0 + sy;
    }
  }

  return line;
}

/**
 * Given a compressed path, return a new path that has all the segments
 * in it interpolated.
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} expanded path
 */
export function expandPath(path) {
  var expanded = [],
    len = path.length,
    coord0,
    coord1,
    interpolated,
    interpolatedLen,
    i,
    j;

  if (len < 2) {
    return expanded;
  }

  for (i = 0; i < len - 1; ++i) {
    coord0 = path[i];
    coord1 = path[i + 1];

    interpolated = interpolate(coord0[0], coord0[1], coord1[0], coord1[1]);
    interpolatedLen = interpolated.length;
    for (j = 0; j < interpolatedLen - 1; ++j) {
      expanded.push(interpolated[j]);
    }
  }
  expanded.push(path[len - 1]);

  return expanded;
}

/**
 * Compress a path, remove redundant nodes without altering the shape
 * The original path is not modified
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} The compressed path
 */
export function compressPath(path) {
  // nothing to compress
  if (path.length < 3) {
    return path;
  }

  var compressed = [],
    sx = path[0][0], // start x
    sy = path[0][1], // start y
    px = path[1][0], // second point x
    py = path[1][1], // second point y
    dx = px - sx, // direction between the two points
    dy = py - sy, // direction between the two points
    lx,
    ly,
    ldx,
    ldy,
    sq,
    i;

  // normalize the direction
  sq = Math.sqrt(dx * dx + dy * dy);
  dx /= sq;
  dy /= sq;

  // start the new path
  compressed.push([sx, sy]);

  for (i = 2; i < path.length; i++) {
    // store the last point
    lx = px;
    ly = py;

    // store the last direction
    ldx = dx;
    ldy = dy;

    // next point
    px = path[i][0];
    py = path[i][1];

    // next direction
    dx = px - lx;
    dy = py - ly;

    // normalize
    sq = Math.sqrt(dx * dx + dy * dy);
    dx /= sq;
    dy /= sq;

    // if the direction has changed, store the point
    if (dx !== ldx || dy !== ldy) {
      compressed.push([lx, ly]);
    }
  }

  // store the last point
  compressed.push([px, py]);

  return compressed;
}
