import React, {useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import BorderButton from '../../../../components/Buttons/BorderButton';
import IconButton from '../../../../components/Buttons/IconButton';
import metaversefile from '../../../../../metaversefile-api';
import {AppContext} from '../../../../App';
import {AnimatePresence, motion} from 'framer-motion';

const PROMPTS = [
  'Unicorn',
  'Icy',
  'Haunted',
  "Wizard's",
  'Rainbow',
  'Dark',
  'Blazing',
];

export default function CreateAdventureDialog() {
  const localPlayer = metaversefile.useLocalPlayer();
  const {app, openCreateAdventure, setOpenCreateAdventure} =
    useContext(AppContext);
  const [mapPrompt, setMapPrompt] = useState('');
  const [isForest, setIsForest] = useState(true);
  const [isDungeon, setIsDungeon] = useState(false);

  useEffect(() => {
    if (isForest) {
      setIsDungeon(false);
    } else {
      setIsDungeon(true);
    }
  }, [isForest]);
  useEffect(() => {
    if (isDungeon) {
      setIsForest(false);
    } else {
      setIsForest(true);
    }
  }, [isDungeon]);

  const createNew = () => {
    const prompt = mapPrompt;
    if (!prompt) {
      return;
    }

    console.log('prompt.type:', isForest ? 'forest' : 'dungeon');
    localPlayer.dispatchEvent({
      type: 'update_adventures',
      app,
      open_adventures: false,
    });
    localPlayer.dispatchEvent({
      type: 'enter_adventure',
      app,
      prompt,
      prompt_type: isForest ? 'forest' : 'dungeon',
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
            Forest:{' '}
            {isForest ? (
              <CheckboxChecked
                onClick={() => {
                  setIsForest(!isForest);
                }}
              />
            ) : (
              <Checkbox
                onClick={() => {
                  setIsForest(!isForest);
                }}
              />
            )}
            Dungeon:{' '}
            {isDungeon ? (
              <CheckboxChecked
                onClick={() => {
                  setIsDungeon(!isDungeon);
                }}
              />
            ) : (
              <Checkbox
                onClick={() => {
                  setIsDungeon(!isDungeon);
                }}
              />
            )}
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

const CheckboxChecked = styled.div`
  /* Group 112 */

  width: 53px;
  height: 53px;

  /* Ellipse 12 */

  box-sizing: border-box;

  width: 53px;
  height: 53px;

  background: #aa85ab;
  border: 5px solid #977398;
  box-shadow: 0px 22px 4px rgba(0, 0, 0, 0.14), inset 0px 10px 0px #c1a0b4;
  border-radius: 24px;

  /* Ellipse 13 */

  width: 31px;
  height: 31px;

  background: #ffffff;
  border-radius: 24px;
`;

const Checkbox = styled.div`
  /* Ellipse 12 */

  box-sizing: border-box;

  width: 53px;
  height: 53px;

  background: #aa85ab;
  border: 5px solid #977398;
  box-shadow: 0px 22px 4px rgba(0, 0, 0, 0.14), inset 0px 10px 0px #c1a0b4;
  border-radius: 24px;
`;
