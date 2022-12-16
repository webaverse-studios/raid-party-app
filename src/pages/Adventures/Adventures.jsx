import React, {useContext} from 'react';
import styled from 'styled-components';
import {motion} from 'framer-motion';

import {AppContext} from '../../App';
import {MiddleContainer} from '../../components/Containers';

import Header from './components/Header';
import Card from './components/Card';

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
  background-color: #30404e;
`;

const Cards = styled(motion.ul)`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  margin-top: 4em;
`;
