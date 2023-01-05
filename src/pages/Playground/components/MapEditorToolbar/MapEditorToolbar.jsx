import {AnimatePresence, motion} from 'framer-motion';
import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import {AppContext} from '../../../../App';
import IconToolButton from '../../../../components/Buttons/IconToolButton';

const EDIT_ACTIONS = [
  {
    key: 'select',
    label: 'Select',
    icon: '/images/rp/icon-select.svg',
  },
  {
    key: 'stamp',
    label: 'Stamp',
    icon: '/images/rp/icon-stamp.svg',
  },
  {
    key: 'eraser',
    label: 'Eraser',
    icon: '/images/rp/icon-eraser.svg',
  },
  {
    key: 'hand',
    label: 'Hand',
    icon: '/images/rp/icon-hand.svg',
  },
  {
    key: 'boxSelect',
    label: 'Box select',
    icon: '/images/rp/icon-box-select.svg',
  },
];

export default function MapEditorToolbar() {
  const {mapEditorVisible} = useContext(AppContext);
  const [activedAction, setActivedAction] = useState('');

  const stopPropagation = event => {
    event.stopPropagation();
  };

  return (
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
      animate={mapEditorVisible ? 'show' : 'hide'}
    >
      <Content>
        {EDIT_ACTIONS.map(action => (
          <IconToolButton
            key={action.key}
            icon={action.icon}
            onClick={() => {
              setActivedAction(action.key);
            }}
            active={activedAction === action.key}
          />
        ))}
      </Content>
    </Holder>
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
  padding: 0.2em;
`;
