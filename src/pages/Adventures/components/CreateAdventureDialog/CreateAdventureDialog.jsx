import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import BorderButton from '../../../../components/Buttons/BorderButton';
import IconButton from '../../../../components/Buttons/IconButton';
import metaversefile from '../../../../../metaversefile-api';
import {AppContext} from '../../../../App';
import {AnimatePresence, motion} from 'framer-motion';

const PROMPTS = [
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

export default function CreateAdventureDialog() {
  const localPlayer = metaversefile.useLocalPlayer();
  const {app, openCreateAdventure, setOpenCreateAdventure} =
    useContext(AppContext);
  const [mapPrompt, setMapPrompt] = useState('');

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
      prompt,
      is_pregenerated: true,
    });
  };

  const setRandomPrompt = () => {
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

    setMapPrompt(prompt);
  };

  return (
    <AnimatePresence>
      {openCreateAdventure && (
        <Holder
          transition={{duration: 0.2}}
          initial={{opacity: 0}}
          exit={{opacity: 0}}
          animate={{opacity: 1}}
        >
          <Content>
            <TextArea
              placeholder="Enter map description"
              value={mapPrompt}
              onChange={e => {
                setMapPrompt(e.target.value);
              }}
            />
            <BorderButton
              icon="/images/rp/wizard.svg"
              title="Generate"
              onClick={createNew}
            />
            <BorderButton title="Randomize" onClick={setRandomPrompt} />
            <CloseButton
              icon="/images/rp/close.svg"
              onClick={() => {
                setOpenCreateAdventure(false);
              }}
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
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #00000099;
`;

const Content = styled.div`
  position: relative;
  min-width: 20em;
  min-height: 20em;
  background-color: #f5dfb8;
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 1em;
  gap: 1em;
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

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  transform: translate(50%, -50%);
`;
