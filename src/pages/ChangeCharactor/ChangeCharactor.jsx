import React, {useContext, useState} from 'react';
import styled from 'styled-components';

import ShadowButton from '../../components/Buttons/ShadowButton';
import RaiseFadeAnimation from '../../components/Animations/RaiseFadeAnimation';

import Title from '../AvatarGenerator/components/Title';
import GeneratorTap from '../AvatarGenerator/components/GeneratorTap';
import {AppContext} from '../../App';
import PageTransition from '../../components/Animations/PageTransition';
import {playersManager} from '../../../players-manager';

export default function ChangeCharactor() {
  const {
    openChangeCharacter,
    setOpenChangeCharacter,
    currentSprite,
    setCurrentSprite,
  } = useContext(AppContext);

  const [oldSprite, setOldSprite] = useState(currentSprite);

  return (
    <PageTransition visible={openChangeCharacter}>
      <Holder>
        <Title />
        <RaiseFadeAnimation delay={1}>
          <GeneratorTap />
        </RaiseFadeAnimation>
        <RaiseFadeAnimation delay={1.5}>
          <div className="flex gap-3">
            <ShadowButton
              title="Ok"
              onClick={() => {
                playersManager
                  .getLocalPlayer()
                  .avatar.makeSpriteAvatar(currentSprite.image);
                setOpenChangeCharacter(false);
                setOldSprite(currentSprite);
              }}
            />
            <ShadowButton
              title="Cancel"
              onClick={() => {
                setCurrentSprite(oldSprite);
                setOpenChangeCharacter(false);
              }}
            />
          </div>
        </RaiseFadeAnimation>
      </Holder>
    </PageTransition>
  );
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5em;
  background-color: #2c2539;
  background-image: url('/images/rp/bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  padding: 12em 1em 1em 1em;
  overflow: hidden;
  overflow-y: auto;
`;
