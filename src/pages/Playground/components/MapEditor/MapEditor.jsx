import {AnimatePresence, motion} from 'framer-motion';
import React, {useContext} from 'react';
import styled from 'styled-components';
import {AppContext} from '../../../../App';

export default function MapEditor() {
  const {mapEditorVisible} = useContext(AppContext);

  const stopPropagation = event => {
    event.stopPropagation();
  };

  return (
    <AnimatePresence>
      {mapEditorVisible && (
        <Holder
          onClick={stopPropagation}
          onKeyDown={stopPropagation}
          variants={{
            show: {
              x: 0,
            },
            hide: {
              x: '100%',
            },
          }}
          transition={{
            type: 'tween',
            duration: 0.4,
          }}
          initial="hide"
          animate="show"
          exit="hide"
        >
          <Content>Tilemap Editor</Content>
        </Holder>
      )}
    </AnimatePresence>
  );
}

const Holder = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 20em;
  height: 100%;
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f5dfb8;
  padding: 0.5em;
`;
