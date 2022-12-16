import React, {useContext} from 'react';
import styled from 'styled-components';
import ShadowButton from '../../../../components/Buttons/ShadowButton';
import metaversefile from '../../../../../metaversefile-api.js';

import {AppContext} from '../../../../App';

export default function Header() {
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
        title="Create New"
        onClick={() => {
          const prompts = [
            'Unicorn Forest',
            'Icy Forest',
            'Haunted Forest',
            "Wizard's Forest",
            'Rainbow Forest',
            'Dark Forest',
            'Blazing Forest',
            'Unicorn Dungeon',
            'Icy Dungeon',
            'Haunted Dungeon',
            "Wizard's Dungeon",
            'Rainbow Dungeon',
            'Dark Dungeon',
            'Desert Forest',
            'Blazing Dungeon',
          ];
          const prompt = prompts[Math.floor(Math.random() * prompts.length)];

          console.log('opening adventure:', prompt);

          localPlayer.dispatchEvent({
            type: 'update_adventures',
            app,
            open_adventures: false,
          });
          localPlayer.dispatchEvent({
            type: 'enter_adventure',
            app,
            prompt: prompt,
          });
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
