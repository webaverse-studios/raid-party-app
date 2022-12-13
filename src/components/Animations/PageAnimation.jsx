import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styled from 'styled-components';

export default function PageAnimation({children, visible}) {
  return (
    <AnimatePresence>
      {visible && (
        <Holder
          transition={{duration: 0.5}}
          initial={{opacity: 1, y: 0}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 1, y: '-100%'}}
        >
          {children}
        </Holder>
      )}
    </AnimatePresence>
  );
}

const Holder = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
`;
