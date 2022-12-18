import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import {motion} from 'framer-motion';

import metaversefile from '../../../metaversefile-api.js';

import {MiddleContainer} from '../../components/Containers';

import Header from './components/Header';
import Card from './components/Card';
import {AppContext} from '../../App';
import BorderButton from '../../components/Buttons/BorderButton.jsx';

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

  const [showCards, setShowCards] = useState(true);
  const [mapPrompt, setMapPrompt] = useState('');

  const changeMenu = () => {
    setShowCards(!showCards);
  };

  const createNew = () => {
    const prompt = mapPrompt;
    if (!prompt) {
      return;
    }

    localPlayer.dispatchEvent({
      type: 'update_adventures',
      app,
      open_adventures: false,
    });
    localPlayer.dispatchEvent({
      type: 'enter_adventure',
      app,
      prompt: prompt,
      is_pregenerated: true,
    });
  };

  const setRandomPrompt = () => {
    const prompts = [
      'Unicorn Forest',
      'Icy Forest',
      'Haunted Forest',
      "Wizard's Forest",
      'Rainbow Forest',
      'Dark Forest',
      'Blazing Forest',
      'Unicorn Dungeon',
      'Icy Dungeon',
      'Haunted Dungeon',
      "Wizard's Dungeon",
      'Rainbow Dungeon',
      'Dark Dungeon',
      'Desert Forest',
      'Blazing Dungeon',
    ];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    setMapPrompt(prompt);
  };

  console.log('opening');
  return (
    <Holder>
      <Header changeMenu={changeMenu} showCards={showCards} />
      <MiddleContainer>
        {showCards ? (
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
                  localStorage.setItem('adventure', JSON.stringify(d));
                  const prompt = d.name + ' ' + d.type;
                  console.log('opening adventure:', prompt);

                  localPlayer.dispatchEvent({
                    type: 'update_adventures',
                    app,
                    open_adventures: false,
                  });
                  localPlayer.dispatchEvent({
                    type: 'enter_adventure',
                    app,
                    prompt: prompt,
                    is_pregenerated: true,
                    prompt_id: index,
                  });
                }}
              />
            ))}
          </Cards>
        ) : (
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
            <TextArea
              placeholder="Map Prompt"
              value={mapPrompt}
              onChange={e => {
                setMapPrompt(e.target.value);
              }}
            />
            <TabPanelFooter>
              <BorderButton
                icon="/images/rp/sprite-gen/wizard.svg"
                title="Generate"
                onClick={createNew}
                loading={false}
              />
              <BorderButton
                icon="/images/rp/sprite-gen/wizard.svg"
                title="Randomize"
                onClick={setRandomPrompt}
                loading={false}
              />
            </TabPanelFooter>
          </Cards>
        )}
      </MiddleContainer>
    </Holder>
  );
}

const TabPanelFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  display: flex;
  gap: 0.5em;
  transform: translate(-50%, 55%);
`;

const TextArea = styled.textarea`
  font-family: 'A Goblin Appears!';
  color: #92724d;
  font-size: 0.9em;
  line-height: 2;
  padding: 1em;
  width: 20em;
  height: 7em;
  background-color: #fff1d6;
  border: 0.2em solid #e1cda8;
  border-radius: 1em;
  resize: none;
  &:focus {
    outline: none;
  }
  &::-webkit-scrollbar {
    width: 0;
  }
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #6b8fa3;
    border-radius: 5px;
  }
`;

const Holder = styled.div`
  position: relative;
  width: 100%;
  background-color: #30404e;
`;

const Cards = styled(motion.ul)`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  margin-top: 4em;
`;
