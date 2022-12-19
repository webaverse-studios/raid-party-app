import React, {useContext} from 'react';
import styled from 'styled-components';
import {motion} from 'framer-motion';

import metaversefile from '../../../metaversefile-api.js';

import {MiddleContainer} from '../../components/Containers';

import Header from './components/Header';
import Card from './components/Card';
import {AppContext} from '../../App';
import CreateAdventureDialog from './components/CreateAdventureDialog/CreateAdventureDialog.jsx';

const ADVENTURES_DATA = [
  {
    name: 'Haunt of the Nightmare Knight',
    type: 'dungeon',
    preview: '/images/rp/adventure.jpg',
    time: '8h ago',
  },
  {
    name: 'Quarters of the Silver Morass',
    type: 'dungeon',
    preview: '/images/rp/adventure.jpg',
    time: '10h ago',
  },
  {
    name: 'Haunt of the Shunned Giant',
    type: 'dungeon',
    preview: '/images/rp/adventure.jpg',
    time: '12h ago',
  },
  {
    name: 'Cells of the Ruthless Monk',
    type: 'dungeon',
    preview: '/images/rp/adventure.jpg',
    time: '13h ago',
  },
  {
    name: 'The Deadly Point',
    type: 'dungeon',
    preview: '/images/rp/adventure.jpg',
    time: '15h ago',
  },
  {
    name: 'Bronze Spring Grove',
    type: 'forest',
    preview: '/images/rp/adventure.jpg',
    time: '20h ago',
  },
  {
    name: 'Unique Field Timberland',
    type: 'forest',
    preview: '/images/rp/adventure.jpg',
    time: '22h ago',
  },
  {
    name: 'Deep Grove',
    type: 'forest',
    preview: '/images/rp/adventure.jpg',
    time: '22h ago',
  },
  {
    name: 'Lonely Grove',
    type: 'forest',
    preview: '/images/rp/adventure.jpg',
    time: '22h ago',
  },
];

export default function Adventures() {
  const localPlayer = metaversefile.useLocalPlayer();
  const {app} = useContext(AppContext);

  return (
    <Holder>
      <Header />
      <MiddleContainer>
        <Cards
          initial="closed"
          animate="open"
          variants={{
            open: {
              transition: {staggerChildren: 0.09, delayChildren: 0.4},
            },
            closed: {
              transition: {staggerChildren: 0.05, staggerDirection: -1},
            },
          }}
        >
          {ADVENTURES_DATA.map((d, index) => (
            <Card
              key={index}
              data={d}
              onClick={() => {
                const prompt = d.name + ' ' + d.type;
                localPlayer.dispatchEvent({
                  type: 'update_adventures',
                  app,
                  open_adventures: false,
                });
                localPlayer.dispatchEvent({
                  type: 'enter_adventure',
                  app,
                  prompt,
                  is_pregenerated: true,
                  prompt_id: index,
                });
              }}
            />
          ))}
        </Cards>
      </MiddleContainer>
      <CreateAdventureDialog />
    </Holder>
  );
}

const Holder = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background-color: #30404e;
`;

const Cards = styled(motion.ul)`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  margin-top: 4em;
`;
