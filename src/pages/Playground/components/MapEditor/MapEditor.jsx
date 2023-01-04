import {AnimatePresence, motion} from 'framer-motion';
import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import {Dropdown} from 'primereact/dropdown';

import {AppContext} from '../../../../App';

const TILESETS = [
  {
    key: 'tileset1',
    name: 'tileset1',
    url: '/images/rp/tilesets/free.png',
  },
  {
    key: 'tileset2',
    name: 'tileset2',
    url: '/images/rp/tilesets/free.png',
  },
  {
    key: 'tileset3',
    name: 'tileset3',
    url: '/images/rp/tilesets/free.png',
  },
  {
    key: 'tileset4',
    name: 'tileset4',
    url: '/images/rp/tilesets/free.png',
  },
  {
    key: 'tileset5',
    name: 'tileset5',
    url: '/images/rp/tilesets/free.png',
  },
  {
    key: 'tileset6',
    name: 'tileset6',
    url: '/images/rp/tilesets/free.png',
  },
];

export default function MapEditor() {
  const {mapEditorVisible} = useContext(AppContext);

  const stopPropagation = event => {
    event.stopPropagation();
  };

  const [tileset, setTileset] = useState(TILESETS[0]);

  console.log(tileset);

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

const Label = styled.h4``;
