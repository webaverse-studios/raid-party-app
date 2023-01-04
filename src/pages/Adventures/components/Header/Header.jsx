import React, {useContext} from 'react';
import styled from 'styled-components';
import ShadowButton from '../../../../components/Buttons/ShadowButton';
import metaversefile from '../../../../../metaversefile-api.js';

import {AppContext} from '../../../../App';

export default function Header() {
  const localPlayer = metaversefile.useLocalPlayer();
  const {app, setOpenCreateAdventure} = useContext(AppContext);

  return (
    <Holder>
      <ShadowButton
        icon="/images/rp/icon-back.svg"
        onClick={() => {
          localPlayer.dispatchEvent({
            type: 'update_adventures',
            app,
            open_adventures: false,
          });
        }}
      />
      <ShadowButton
        title="Create New"
        onClick={() => {
          setOpenCreateAdventure(true);
        }}
      />
    </Holder>
  );
}

const Holder = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 1.5em;
  background-color: #3a4d5e;
`;
