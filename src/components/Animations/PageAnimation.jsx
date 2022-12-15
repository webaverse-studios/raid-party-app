import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styled from 'styled-components';

export default function PageAnimation(props) {
  const {children} = props;
  return (
    <AnimatePresence>
      <Holder
        layout
        transition={{duration: 0.5}}
        initial={{opacity: 0, y: -30}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0, y: -30}}
      >
        {children}
      </Holder>
    </AnimatePresence>
  );
}

const Holder = styled(motion.div)``;
