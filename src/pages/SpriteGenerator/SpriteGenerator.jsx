import React, {useState} from 'react';
import styled from 'styled-components';
import {AnimatePresence, motion} from 'framer-motion';

import Title from './components/Title';
import GeneratorTap from './components/GeneratorTap';

export default function SpriteGenerator() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <Holder
          transition={{duration: 0.5}}
          initial={{opacity: 1, y: 0}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 1, y: '-100%'}}
        >
          <Content>
            <Title />
            <GeneratorTap />
            <PlayButton
              onClick={() => {
                setVisible(false);
              }}
            >
              Play
            </PlayButton>
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
  z-index: 999;
  width: 100%;
  height: 100%;
  background-color: #2c2539;
  background-image: url('/images/rp/sprite-gen/bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  font-family: 'A Goblin Appears!';
  font-size: 1em;
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const PlayButton = styled.div`
  background-color: #a984a9;
  color: white;
  padding: 1em 4em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.3s ease-out;
  margin-top: 3em;
  &:hover {
    background-color: #f5bff5;
  }
`;
