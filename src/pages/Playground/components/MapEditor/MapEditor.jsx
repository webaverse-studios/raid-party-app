import {AnimatePresence, motion} from 'framer-motion';
import React, {useContext, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Dropdown} from 'primereact/dropdown';

import {AppContext} from '../../../../App';
import {blobToBase64} from '../../../../utils/BlobToBase64';
import UrlToBase64 from '../../../../utils/UrlToBase64';
import MapEditorDrawer from './MapEditorDrawer';
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

export default function MapEditor() {
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
      drawerRef.current = new MapEditorDrawer(canvasRef.current);
    }
  }, [canvasRef.current]);

  useEffect(() => {
    if (drawerRef.current) {
      setImageLoading(true);
      const image = new Image();
      image.onload = () => {
        drawerRef.current.drawImage(image);
        setImageLoading(false);
      };
      image.src = tileset.url;
    }
  }, [tileset, drawerRef.current]);

  return (
    <AnimatePresence>
      {mapEditorVisible && (
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
          animate="show"
          exit="hide"
        >
          <Content>
            <Dropdown
              className="w-full"
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
      )}
    </AnimatePresence>
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
`;

const CanvasHolder = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  padding: 0.5em;
  overflow: auto;
`;
