import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styled from 'styled-components';
import Spiner from '../Spiner';

export default function Loader({
  visible,
  className,
  size = 60,
  label = '',
  ...props
}) {
  return (
    <AnimatePresence>
      {visible && (
        <Holder
          {...props}
          className={className}
          initial={{opacity: 1, y: 0}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -30}}
          transition={{
            type: 'tween',
            duration: 0.8,
          }}
          layout
        >
          <Container>
            <Spiner size={size} />
          </Container>
          {label !== '' && <Label>{label}</Label>}
        </Holder>
      )}
    </AnimatePresence>
  );
}

const Holder = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  min-height: 100px;
  height: 100%;
  backdrop-filter: blur(6px);
  background-color: #00000055;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 5em;
  height: 5em;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Label = styled.p`
  color: #aaaaaa;
  text-align: center;
`;
