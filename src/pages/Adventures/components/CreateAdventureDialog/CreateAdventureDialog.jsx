import React, {useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import {AnimatePresence, motion} from 'framer-motion';

import BorderButton from '../../../../components/Buttons/BorderButton';
import IconButton from '../../../../components/Buttons/IconButton';
import metaversefile from '../../../../../metaversefile-api';
import {AppContext} from '../../../../App';
import {toast} from 'react-toastify';

const PROMPTS = [
  'Unicorn',
  'Icy',
  'Haunted',
  "Wizard's",
  'Rainbow',
  'Dark',
  'Blazing',
];

const localPlayer = metaversefile.useLocalPlayer();

export default function CreateAdventureDialog() {
  const {app, openCreateAdventure, setOpenCreateAdventure} =
    useContext(AppContext);
  const [mapPrompt, setMapPrompt] = useState('');
  const [mapType, setMapType] = useState('forest');

  const createNew = () => {
    if (mapPrompt === '') {
      toast('Please enter a map description');
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
      prompt: mapPrompt,
      prompt_type: mapType,
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
            <CloseButton
              icon="/images/rp/icon-close.svg"
              onClick={() => {
                setOpenCreateAdventure(false);
              }}
            />
            <TypeSelector>
              <TypeItem
                image="/images/rp/forest.jpg"
                active={mapType === 'forest'}
                onClick={() => {
                  setMapType('forest');
                }}
              >
                <div>Forest</div>
              </TypeItem>
              <TypeItem
                image="/images/rp/dungeon.jpg"
                active={mapType === 'dungeon'}
                onClick={() => {
                  setMapType('dungeon');
                }}
              >
                <div>Dungeon</div>
              </TypeItem>
            </TypeSelector>
            <TextArea
              placeholder="Enter map description"
              value={mapPrompt}
              onChange={e => {
                setMapPrompt(e.target.value);
              }}
            />
            <div className="flex gap-2">
              <BorderButton title="Randomize" onClick={setRandomPrompt} />
              <BorderButton
                icon="/images/rp/icon-editor.svg"
                title="Generate"
                onClick={createNew}
              />
            </div>
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
  width: 100%;
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

const TypeSelector = styled.div`
  min-width: 10em;
  width: 100%;
  min-height: 10em;
  display: flex;
  border-radius: 0.5em;
  overflow: hidden;
  border: 0.2em solid #e1cda8;
`;

const TypeItem = styled.div`
  flex: 1;
  height: inherit;
  background-image: ${props => `url(${props.image})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  cursor: pointer;
  opacity: ${props => (props.active ? 1 : 0.7)};
  transition: all 0.3s ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  > div {
    font-size: 0.9em;
    opacity: ${props => (props.active ? 1 : 0)};
  }
`;
