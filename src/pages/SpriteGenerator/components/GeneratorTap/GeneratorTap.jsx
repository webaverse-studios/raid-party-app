import React, {useCallback, useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import {ScrollMenu, VisibilityContext} from 'react-horizontal-scrolling-menu';
import {nanoid} from 'nanoid';
import './style.css';

import BorderButton from '../../../../components/Buttons/BorderButton';
import {generateAvatar} from '../../../../api/sprite';

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
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [describe, setDescribe] = useState('');
  const [fetching, setFetching] = useState(false);
  const [sprite, setSprite] = useState('');
  const [preRolledSprites, setPreRolledSprites] = useState([]);

  const handleClick =
    item =>
    ({getItemById, scrollToItem}) => {
      setSelectedItem(item);
    };

  const fetchSprite = useCallback(async () => {
    if (fetching) {
      return;
    }

    setFetching(true);

    try {
      const image = await generateAvatar(describe);
      const url = URL.createObjectURL(image);

      const oldSprites = loadSprites();
      const newSprite = {
        id: nanoid(),
        name: describe,
        image: url,
      };
      oldSprites.data.push(newSprite);
      saveSprites(oldSprites);

      setSprite(url);
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
          <TextArea
            placeholder="Enter the description of your avatar to generate a sprite"
            value={describe}
            onChange={e => {
              setDescribe(e.target.value);
            }}
          />
          {sprite && (
            <SpritePreview>
              <img src={sprite} />
            </SpritePreview>
          )}
          <TabPanelFooter>
            <BorderButton
              icon="/images/rp/sprite-gen/wizard.svg"
              title="Generate"
              onClick={fetchSprite}
              loading={fetching}
            />
          </TabPanelFooter>
        </TabPanel>
      )}
      {tabIndex === 1 && (
        <TabPanel>
          <Text>{selectedItem?.name}</Text>
          <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
            {preRolledSprites.map((item, index) => (
              <Card
                key={index}
                item={item}
                selected={selectedItem?.id === item.id}
                onClick={handleClick(item)}
              />
            ))}
          </ScrollMenu>
          <TabPanelFooter>
            <BorderButton
              icon="/images/rp/sprite-gen/check.svg"
              title="Select"
            />
          </TabPanelFooter>
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
  padding: 1em 1em 4em 1em;
  min-width: 40em;
  max-width: 40em;
  min-height: 20em;
  max-height: 20em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  border: 0.4em solid #e0cbab;
  box-shadow: 0px 1.2em 0px rgba(0, 0, 0, 0.14);
  border-radius: 1.2em;
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
  width: 100%;
  height: 100%;
  &:focus {
    outline: none;
  }
`;

const Text = styled.div`
  background-color: #fff9ee;
  color: #92724d;
  padding: 1em;
  line-height: 2;
`;

const Arrow = ({direction, disabled, onClick}) => {
  return (
    <img
      src="/images/rp/sprite-gen/arrow.svg"
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

const Card = ({onClick, selected, item}) => {
  const visibility = useContext(VisibilityContext);
  const visible = visibility.isItemVisible(item.id);
  return (
    <CardHolder active={selected} onClick={() => onClick(visibility)}>
      <CardPreview src={item.image} alt="" />
    </CardHolder>
  );
};

const CardHolder = styled.div`
  background-color: #fff9ee;
  color: black;
  overflow: hidden;
  border: 0.4em solid #a984a9;
  border-radius: 0.3em;
  border-color: ${props => (props.active ? '#a984a9' : '#e0cbab')};
  user-select: none;
  transition: all 0.3s ease-out;
`;

const CardPreview = styled.img`
  object-fit: none;
  object-position: 0 0;
  width: 64px;
  height: 64px;
  transform: scale(1.2);
`;

const SpritePreview = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  > img {
    object-fit: none;
    object-position: 0 0;
    width: 64px;
    height: 64px;
    transform: scale(2.5);
  }
`;
