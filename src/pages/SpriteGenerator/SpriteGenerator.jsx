import React, {useState} from 'react';
import styled from 'styled-components';
import {AnimatePresence, motion} from 'framer-motion';

import Title from './components/Title';

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
`;

const PlayButton = styled.div`
  position: absolute;
  left: 50%;
  bottom: 10%;
  z-index: 1;
  background-color: #a984a9;
  color: white;
  padding: 0.5em 3em;
  border-radius: 0.5em;
  transform: translateX(-50%);
  cursor: pointer;
  transition: all 0.3s ease-out;
  &:hover {
    background-color: #f5bff5;
  }
`;
