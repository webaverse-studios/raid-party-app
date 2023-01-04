import React, {useCallback, useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import {ScrollMenu, VisibilityContext} from 'react-horizontal-scrolling-menu';
import {nanoid} from 'nanoid';
import './style.css';

import BorderButton from '../../../../components/Buttons/BorderButton';
import {generateAvatar} from '../../../../api/sprite';
import {device} from '../../../../theme/device';
import {AppContext} from '../../../../App';
import {blobToBase64} from '../../../../utils/BlobToBase64';

function saveSprites(sprites) {
  localStorage.setItem('sprites', JSON.stringify(sprites));
}

function loadSprites() {
  let parsed = [];

  try {
    const saved = localStorage.getItem('sprites');

    // Firs time the page is loaded we return a default list
    if (!saved) {
      return {data: []};
    }

    parsed = JSON.parse(saved);
  } catch (error) {
    console.warn('Error loading rooms from local storage.');
  }
  return parsed;
}

export default function GeneratorTap() {
  const {currentSprite, setCurrentSprite} = useContext(AppContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [describe, setDescribe] = useState('');
  const [fetching, setFetching] = useState(false);
  const [preRolledSprites, setPreRolledSprites] = useState([]);

  const handleClick =
    sprite =>
    ({getItemById, scrollToItem}) => {
      setCurrentSprite(sprite);
    };

  const fetchSprite = useCallback(async () => {
    if (fetching) {
      return;
    }

    setFetching(true);

    try {
      const blob = await generateAvatar(describe);
      const base64 = await blobToBase64(blob);

      const newSprite = {
        id: nanoid(),
        name: describe,
        image: base64,
      };

      const oldSprites = loadSprites();
      oldSprites.data.push(newSprite);

      saveSprites(oldSprites);

      setCurrentSprite(newSprite);
    } finally {
      setFetching(false);
    }
  }, [describe, fetching]);

  useEffect(() => {
    if (tabIndex === 1) {
      const sprites = loadSprites();
      setPreRolledSprites(sprites.data);
    }
  }, [tabIndex]);

  return (
    <Tabs>
      <TabList>
        <Tab
          active={tabIndex === 0}
          onClick={() => {
            setTabIndex(0);
          }}
        >
          <span>Create</span>
        </Tab>
        <Tab
          active={tabIndex === 1}
          onClick={() => {
            setTabIndex(1);
          }}
        >
          <span>Choose</span>
        </Tab>
      </TabList>
      {tabIndex === 0 && (
        <TabPanel>
          <SpritePreview>
            {currentSprite && <img src={currentSprite.image} />}
          </SpritePreview>
          <TextArea
            placeholder="Enter sprite description"
            value={describe}
            onChange={e => {
              setDescribe(e.target.value);
            }}
          />
          <TabPanelFooter>
            <BorderButton
              icon="/images/rp/icon-editor.svg"
              title="Generate"
              onClick={fetchSprite}
              loading={fetching}
            />
          </TabPanelFooter>
        </TabPanel>
      )}
      {tabIndex === 1 && (
        <TabPanel>
          <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
            {preRolledSprites.map((sprite, index) => (
              <Card
                key={index}
                sprite={sprite}
                selected={currentSprite?.id === sprite.id}
                onClick={handleClick(sprite)}
              />
            ))}
          </ScrollMenu>
        </TabPanel>
      )}
    </Tabs>
  );
}

const Tabs = styled.div`
  position: relative;
`;

const TabList = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1.5em;
  padding: 0 1em;
`;

const Tab = styled.div`
  width: fit-content;
  height: fit-content;
  padding: 1em 2em;
  border-top: 0.4em solid #967296;
  border-left: 0.4em solid #967296;
  border-right: 0.4em solid #967296;
  border-top-left-radius: 1.2em;
  border-top-right-radius: 1.2em;
  background-color: ${props => (props.active ? '#a984a9' : '#6d607c')};
  color: ${props => (props.active ? '#ffffff' : '#c2afc2')};
  cursor: pointer;
  transition: background-color 0.3s ease-out;
  box-shadow: inset 0px 0.2em 0px #c1a0b4;
  > span {
    text-shadow: 0px 4px 0px rgba(0, 0, 0, 0.25);
  }
`;

const TabPanel = styled.div`
  position: relative;
  background-color: #f5e1b5;
  padding: 2em 1em 4em 1em;
  display: flex;
  gap: 1em;
  border: 0.4em solid #e0cbab;
  box-shadow: 0px 1.2em 0px rgba(0, 0, 0, 0.14);
  border-radius: 1.2em;
  @media ${device.pad} {
    flex-direction: column;
    align-items: center;
  }
`;

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

const Arrow = ({direction, disabled, onClick}) => {
  return (
    <img
      src="/images/rp/icon-arrow.svg"
      onClick={onClick}
      style={{
        margin: '0em 0.2em',
        width: '1em',
        height: '1em',
        cursor: 'pointer',
        opacity: disabled ? '0.5' : '1',
        userSelect: 'none',
        transform: `rotate(${direction}deg)`,
      }}
    />
  );
};

const LeftArrow = () => {
  const {isFirstItemVisible, scrollPrev} = useContext(VisibilityContext);

  return (
    <Arrow
      direction={0}
      disabled={isFirstItemVisible}
      onClick={() => scrollPrev()}
    ></Arrow>
  );
};

const RightArrow = () => {
  const {isLastItemVisible, scrollNext} = useContext(VisibilityContext);

  return (
    <Arrow
      direction={180}
      disabled={isLastItemVisible}
      onClick={() => scrollNext()}
    ></Arrow>
  );
};

const Card = ({onClick, selected, sprite}) => {
  const visibility = useContext(VisibilityContext);
  return (
    <CardHolder onClick={() => onClick(visibility)}>
      {selected && <CardCheck src="/images/rp/icon-check.svg" />}
      {sprite.image && <CardPreview src={sprite.image} alt="" />}
    </CardHolder>
  );
};

const CardHolder = styled.div`
  position: relative;
  color: black;
  border: 0.2em solid #fffcf7;
  border-radius: 0.8em;
  background: #6e607e;
  box-shadow: 0px 7px 0px rgba(0, 0, 0, 0.14);
  transition: all 0.3s ease-out;
  user-select: none;
  min-width: 5em;
  min-height: 5em;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardPreview = styled.img`
  object-fit: none;
  object-position: 0 0;
  width: 64px;
  height: 64px;
  transform: scale(1.3);
`;

const CardCheck = styled.img`
  position: absolute;
  top: 0.1em;
  right: 0.2em;
  z-index: 1;
  width: 35px;
  transform: translate(16px, -5px);
`;

const SpritePreview = styled.div`
  width: 15em;
  height: 15em;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #434a61;
  border: 0.2em solid #fffcf7;
  box-shadow: 0px 0.3em 0px rgba(0, 0, 0, 0.14);
  border-radius: 1.2em;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  > img {
    object-fit: none;
    object-position: 0 0;
    width: 64px;
    height: 64px;
    transform: scale(2.5);
  }
`;
