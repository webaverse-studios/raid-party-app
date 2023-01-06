import {motion} from 'framer-motion';
import React, {useContext, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Dropdown} from 'primereact/dropdown';

import {AppContext} from '../../../../App';
import TilesetDrawer from './TilesetDrawer';
import Loader from '../../../../components/Loader';

const TILESETS = [
  {
    key: 'tileset1',
    name: 'free',
    url: '/images/rp/tilesets/free.png',
  },
  {
    key: 'tileset2',
    name: 'Dungeon_Tileset',
    url: '/images/rp/tilesets/Dungeon_Tileset.png',
  },
  {
    key: 'tileset3',
    name: 'tile-guide',
    url: '/images/rp/tilesets/tile-guide.png',
  },
  {
    key: 'tileset4',
    name: 'Tileset-Terrain2',
    url: '/images/rp/tilesets/Tileset-Terrain2.png',
  },
  {
    key: 'tileset5',
    name: 'wall-8-2-tiles-tall',
    url: '/images/rp/tilesets/wall-8-2-tiles-tall.png',
  },
];

export default function TilesetEditor() {
  const {mapEditorVisible} = useContext(AppContext);

  const stopPropagation = event => {
    event.stopPropagation();
  };

  const [imageLoading, setImageLoading] = useState(false);
  const [tileset, setTileset] = useState(null);
  const canvasRef = useRef();
  const drawerRef = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      drawerRef.current = new TilesetDrawer(canvasRef.current);
    }
  }, [canvasRef.current]);

  useEffect(() => {
    if (drawerRef.current && tileset) {
      setImageLoading(true);
      const image = new Image();
      image.onload = () => {
        drawerRef.current.drawImage(image);
        setImageLoading(false);
      };
      image.src = tileset.url;
      image.crossOrigin = 'Anonymous';
    }
  }, [tileset, drawerRef.current]);

  return (
    <Holder
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
      variants={{
        show: {
          x: 0,
        },
        hide: {
          x: '100%',
        },
      }}
      transition={{
        type: 'tween',
        duration: 0.4,
      }}
      initial="hide"
      animate={mapEditorVisible ? 'show' : 'hide'}
    >
      <Content>
        <Dropdown
          className="w-full mb-2"
          optionLabel="name"
          value={tileset}
          options={TILESETS}
          onChange={e => setTileset(e.value)}
          placeholder="Select a tileset"
        />
        <CanvasHolder>
          <Loader visible={imageLoading} />
          <canvas ref={canvasRef} />
        </CanvasHolder>
      </Content>
    </Holder>
  );
}

const Holder = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 20em;
  height: 100%;
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f5dfb8;
  padding: 0.5em;
  display: flex;
  flex-direction: column;
  font-size: 0.7em;
`;

const CanvasHolder = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  overflow: auto;
  background-color: #282828;
`;
