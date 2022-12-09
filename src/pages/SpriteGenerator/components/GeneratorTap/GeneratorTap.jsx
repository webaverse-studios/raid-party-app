import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import {ScrollMenu, VisibilityContext} from 'react-horizontal-scrolling-menu';
import BorderButton from '../Buttons/BorderButton';
import './style.css';

const PRE_ROLLED_DATA = [
  {
    id: '001',
    name: 'Benny Bee',
    image: '/images/rp/sprite-gen/avatar-01.jpg',
  },
  {
    id: '002',
    name: 'Snake Cartoon Character',
    image: '/images/rp/sprite-gen/avatar-02.jpg',
  },
  {
    id: '003',
    name: 'Cute Pixel Penguin',
    image: '/images/rp/sprite-gen/avatar-03.jpg',
  },
  {
    id: '004',
    name: 'Cartoon Pixel Bear',
    image: '/images/rp/sprite-gen/avatar-04.jpg',
  },
  {
    id: '005',
    name: 'Cute Pixel Pig',
    image: '/images/rp/sprite-gen/avatar-05.jpg',
  },
  {
    id: '006',
    name: 'Cartoon Pixel Mouse',
    image: '/images/rp/sprite-gen/avatar-06.jpg',
  },
  {
    id: '007',
    name: 'Cute Pixel Bull',
    image: '/images/rp/sprite-gen/avatar-07.jpg',
  },
  {
    id: '008',
    name: 'Cartoon Pixel Deer',
    image: '/images/rp/sprite-gen/avatar-08.jpg',
  },
];

export default function GeneratorTap() {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(PRE_ROLLED_DATA[0]);
  const [describe, setDescribe] = useState('');

  const handleClick =
    item =>
    ({getItemById, scrollToItem}) => {
      setSelectedItem(item);
    };

  return (
    <Tabs>
      <TabList>
        <Tab
          active={tabIndex === 0}
          onClick={() => {
            setTabIndex(0);
          }}
        >
          Describe
        </Tab>
        <Tab
          active={tabIndex === 1}
          onClick={() => {
            setTabIndex(1);
          }}
        >
          Pre-Rolled
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
          ></TextArea>
          <TabPanelFooter>
            <BorderButton icon="/images/rp/sprite-gen/redo.svg" />
            <BorderButton
              icon="/images/rp/sprite-gen/wizard.svg"
              title="Generate"
            />
          </TabPanelFooter>
        </TabPanel>
      )}
      {tabIndex === 1 && (
        <TabPanel>
          <Text>{selectedItem.name}</Text>
          <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
            {PRE_ROLLED_DATA.map((item, index) => (
              <Card
                key={index}
                item={item}
                selected={selectedItem.id === item.id}
                onClick={handleClick(item)}
              />
            ))}
          </ScrollMenu>
          <TabPanelFooter>
            <BorderButton icon="/images/rp/sprite-gen/redo.svg" />
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
  gap: 0.2em;
  padding: 0 1em;
`;

const Tab = styled.div`
  width: fit-content;
  height: fit-content;
  padding: 1em 2em;
  border-top: 0.5em solid #967296;
  border-left: 0.5em solid #967296;
  border-right: 0.5em solid #967296;
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
  padding-bottom: ${props => (props.active ? '1.5em' : '1em')};
  background-color: ${props => (props.active ? '#a984a9' : '#6d607c')};
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease-out;
`;

const TabPanel = styled.div`
  position: relative;
  background-color: #f5dfb8;
  padding: 1em 1em 4em 1em;
  min-width: 40em;
  max-width: 40em;
  min-height: 20em;
  max-height: 20em;
  display: flex;
  flex-direction: column;
  gap: 1em;
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
  width: 5em;
  height: 5em;
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
  width: 100%;
  height: 100%;
`;
