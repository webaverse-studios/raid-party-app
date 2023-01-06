import React, {useContext} from 'react';
import styled from 'styled-components';

import {AppContext} from '../../../../App';
import metaversefile from '../../../../../metaversefile-api';
import BorderButton from '../../../../components/Buttons/BorderButton';

export default function Taskbar() {
  const localPlayer = metaversefile.useLocalPlayer();
  const {app, setOpenAdventures, mapEditorVisible, setMapEditorVisible} =
    useContext(AppContext);

  const stopPropagation = event => {
    event.stopPropagation();
  };

  return (
    <Holder onClick={stopPropagation} onKeyDown={stopPropagation}>
      <Content>
        <Background />
        <BorderButton
          icon="/images/rp/icon-notifications.svg"
          onClick={e => {
            // localPlayer.dispatchEvent({
            //   type: 'back_map',
            //   app,
            // });
          }}
        />
        <BorderButton
          icon="/images/rp/icon-map.svg"
          onClick={() => {
            // localPlayer.dispatchEvent({
            //   type: 'reroll_map',
            //   app,
            // });
          }}
        />
        <BorderButton
          icon="/images/rp/icon-editor.svg"
          onClick={() => {
            setMapEditorVisible(!mapEditorVisible);
          }}
        />
        <BorderButton
          icon="/images/rp/icon-adventures.svg"
          onClick={e => {
            setOpenAdventures(true);
            e.stopPropagation();
          }}
        />
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
