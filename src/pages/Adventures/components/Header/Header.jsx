import React, {useContext} from 'react';
import styled from 'styled-components';
import ShadowButton from '../../../../components/Buttons/ShadowButton';
import metaversefile from '../../../../../metaversefile-api.js';

import {AppContext} from '../../../../App';

export default function Header(props) {
  const localPlayer = metaversefile.useLocalPlayer();
  const {app} = useContext(AppContext);

  return (
    <Holder>
      <ShadowButton
        icon="/images/rp/back.svg"
        onClick={() => {
          localPlayer.dispatchEvent({
            type: 'update_adventures',
            app,
            open_adventures: false,
          });
        }}
      />
      <ShadowButton
        title={props.showCards ? 'Create New' : 'Back'}
        onClick={() => {
          props.changeMenu();
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
