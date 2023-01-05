import React, {useContext} from 'react';
import styled from 'styled-components';
import {toast} from 'react-toastify';

import ShadowButton from '../../components/Buttons/ShadowButton';
import RaiseFadeAnimation from '../../components/Animations/RaiseFadeAnimation';

import Title from './components/Title';
import GeneratorTap from './components/GeneratorTap';
import {AppContext} from '../../App';

export default function AvatarGenerator() {
  const {currentSprite, setPageIndex} = useContext(AppContext);
  return (
    <Holder>
      <Title />
      <RaiseFadeAnimation delay={3}>
        <GeneratorTap />
      </RaiseFadeAnimation>
      <RaiseFadeAnimation delay={3.7}>
        <ShadowButton
          title="Next"
          onClick={() => {
            if (currentSprite) {
              setPageIndex(1);
            } else {
              toast(
                'Please generate a new sprite or choose one pre-generated sprite',
              );
            }
          }}
        />
      </RaiseFadeAnimation>
    </Holder>
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
