import React, {useContext} from 'react';
import styled from 'styled-components';
import {AppContext} from '../../App';
import ShadowButton from '../../components/Buttons/ShadowButton';
import Card from './components/Card';
import {MiddleContainer} from '../../components/Containers';

const ADVENTURES_DATA = [
  {
    name: 'Forest',
    preview: '/images/rp/adventure.jpg',
    time: '8h ago',
  },
  {
    name: 'Dungeon',
    preview: '/images/rp/adventure.jpg',
    time: '10h ago',
  },
  {
    name: 'Forest 1',
    preview: '/images/rp/adventure.jpg',
    time: '12h ago',
  },
  {
    name: 'Forest 2',
    preview: '/images/rp/adventure.jpg',
    time: '13h ago',
  },
  {
    name: 'Dungeon 1',
    preview: '/images/rp/adventure.jpg',
    time: '15h ago',
  },
  {
    name: 'Dungeon 2',
    preview: '/images/rp/adventure.jpg',
    time: '20h ago',
  },
  {
    name: 'Dungeon 3',
    preview: '/images/rp/adventure.jpg',
    time: '22h ago',
  },
];

export default function Adventures() {
  const {setPageIndex} = useContext(AppContext);
  return (
    <Holder>
      <Header>
        <ShadowButton
          icon="/images/rp/back.svg"
          onClick={() => {
            setPageIndex(0);
          }}
        />
        <ShadowButton title="Create New" onClick={() => {}} />
      </Header>
      <MiddleContainer>
        <Cards>
          {ADVENTURES_DATA.map((d, index) => (
            <Card
              key={index}
              data={d}
              onClick={() => {
                setPageIndex(2);
              }}
            />
          ))}
        </Cards>
      </MiddleContainer>
    </Holder>
  );
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #30404e;
`;

const Header = styled.div`
  background-color: #4e727d;
  display: flex;
  justify-content: space-between;
  padding: 1.5em;
`;

const Cards = styled.div`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  margin-top: 4em;
  cursor: pointer;
`;
