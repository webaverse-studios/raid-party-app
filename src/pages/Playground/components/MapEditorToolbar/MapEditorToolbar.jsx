import {AnimatePresence, motion} from 'framer-motion';
import React, {useContext} from 'react';
import styled from 'styled-components';
import {AppContext} from '../../../../App';
import BorderButton from '../../../../components/Buttons/BorderButton';

export default function MapEditorToolbar() {
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
              x: '-100%',
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
          <Content>
            <BorderButton icon="/images/rp/icon-editor.svg" onClick={e => {}} />
            <BorderButton icon="/images/rp/icon-editor.svg" onClick={e => {}} />
            <BorderButton icon="/images/rp/icon-editor.svg" onClick={e => {}} />
            <BorderButton icon="/images/rp/icon-editor.svg" onClick={e => {}} />
          </Content>
        </Holder>
      )}
    </AnimatePresence>
  );
}

const Holder = styled(motion.div)`
  position: fixed;
  top: 9em;
  left: 0;
`;

const Content = styled.div`
  position: relative;
  background-color: #f5dfb8;
  border-top-right-radius: 0.8em;
  border-bottom-right-radius: 0.8em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;
