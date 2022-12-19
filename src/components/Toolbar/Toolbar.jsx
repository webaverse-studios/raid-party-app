import React, {useContext} from 'react';
import styled from 'styled-components';
import {AppContext} from '../../App';
import BorderButton from '../Buttons/BorderButton';

export default function Toolbar() {
  const {setOpenAdventures} = useContext(AppContext);
  return (
    <Holder>
      <Content>
        <Background />
        <BorderButton
          icon="/images/rp/wizard.svg"
          onClick={e => {
            setOpenAdventures(true);
            e.stopPropagation();
          }}
        />
        <BorderButton icon="/images/rp/edit.svg" />
        <BorderButton icon="/images/rp/alarm.svg" />
      </Content>
    </Holder>
  );
}

const Holder = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
`;

const Content = styled.div`
  position: relative;
  display: flex;
  gap: 1em;
  padding: 1em 2em;
`;

const Background = styled.div`
  position: absolute;
  left: 0;
  top: 40%;
  right: 0;
  bottom: 0;
  z-index: -1;
  background-color: #f5dfb8;
  border: 0.3em solid #e1cda8;
  box-shadow: 0px 1.5em 0px rgba(0, 0, 0, 0.14);
  border-top-left-radius: 0.8em;
  border-top-right-radius: 0.8em;
`;
