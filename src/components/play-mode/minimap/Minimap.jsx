import React, {useState, useRef, useEffect} from 'react';
import classNames from 'classnames';

import minimapManager from 'engine/minimap.js';
import CustomButton from 'components/general/custom-button/index.jsx';

import styles from './minimap.module.css';

//

let minimap = null;
const canvasSize = 180 * window.devicePixelRatio;
const minimapSize = 2048 * 3;
const minimapWorldSize = 400;
const minimapMinZoom = 0.1;
const minimapBaseSpeed = 30;

export const Minimap = ({className}) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      if (!minimap) {
        minimap = minimapManager.createMiniMap(
          minimapSize,
          minimapSize,
          minimapWorldSize,
          minimapWorldSize,
          minimapMinZoom,
          minimapBaseSpeed,
        );
      }
      minimap.resetCanvases();
      minimap.addCanvas(canvas);
    }
  }, [canvasRef.current]);

  return (
    <div className={classNames(className, styles.locationMenu)}>
      <div className={styles.controls}>
        <CustomButton
          type="icon"
          theme="dark"
          icon="microphone"
          className={styles.button}
          size={24}
        />
        <CustomButton
          type="icon"
          theme="dark"
          icon="voice"
          className={styles.button}
          size={24}
        />
        <CustomButton
          type="icon"
          theme="dark"
          icon="vr"
          disabled
          className={styles.button}
          size={24}
        />
        <CustomButton
          type="icon"
          theme="dark"
          icon="hide"
          className={styles.button}
          size={24}
        />
      </div>
      <div className={styles.mapBg} />
      <div className={styles.mapWrap}>
        <canvas
          width={canvasSize}
          height={canvasSize}
          className={styles.map}
          ref={canvasRef}
        />
      </div>
    </div>
  );
};
