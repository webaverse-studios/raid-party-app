import React, {useState} from 'react';
import styled from 'styled-components';
import {motion} from 'framer-motion';

export default function Title() {
  const [visible, setVisible] = useState(true);

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
        // ease: 'easeInOut',
        delay: 5,
        // duration: 0.8,
        type: 'spring',
        stiffness: 350,
      }}
      initial="init"
      animate={visible ? 'show' : 'hide'}
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
