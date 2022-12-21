import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styled from 'styled-components';

export default function PageTransition(props) {
  const {children, visible} = props;

  const stopPropagation = event => {
    event.stopPropagation();
  };

  return (
    <AnimatePresence>
      {visible && (
        <Holder
          onClick={stopPropagation}
          onKeyDown={stopPropagation}
          initial={{opacity: 0}}
          exit={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{
            duration: 0.3,
          }}
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
  z-index: 999;
  width: 100%;
  height: 100%;
  background-color: #30404e;
`;
