import React from 'react';
import styled from 'styled-components';
import {motion} from 'framer-motion';

export default function Title() {
  return (
    <Holder
      variants={{
        init: {
          y: '-100%',
        },
        show: {
          y: 0,
        },
        hide: {
          y: '-150%',
        },
      }}
      transition={{
        type: 'spring',
        stiffness: 350,
        // mass: 3,
        // damping: 1,
        delay: 0.6,
      }}
      initial="init"
      animate="show"
    >
      <Content>
        <span>Welcome Creator!</span>
      </Content>
    </Holder>
  );
}

const Holder = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  background-image: url('/images/rp/sprite-gen/title-bg.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  color: white;
  padding: 3.5em 7em;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(-50%);
`;
