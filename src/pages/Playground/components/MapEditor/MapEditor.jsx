import {AnimatePresence, motion} from 'framer-motion';
import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import {Dropdown} from 'primereact/dropdown';

import {AppContext} from '../../../../App';

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

  const [tileset, setTileset] = useState(TILESETS[0]);

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
`;
