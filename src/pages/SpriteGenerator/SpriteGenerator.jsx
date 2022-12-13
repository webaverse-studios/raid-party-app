import React, {useContext, useState} from 'react';
import styled from 'styled-components';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';

import {AppContext} from '../../components/app';
import Button from '../../components/Buttons/Button';
import PageAnimation from '../../components/Animations/PageAnimation';
import RaiseFadeAnimation from '../../components/Animations/RaiseFadeAnimation';

import Title from './components/Title';
import GeneratorTap from './components/GeneratorTap';

export default function SpriteGenerator() {
  const {setStartGame} = useContext(AppContext);
  const [visible, setVisible] = useState(true);
  return (
    <PageAnimation visible={visible}>
      <Holder>
        <Title />
        <RaiseFadeAnimation delay={3500}>
          <GeneratorTap />
        </RaiseFadeAnimation>
        <RaiseFadeAnimation delay={4000}>
          <Button
            title="Play"
            onClick={() => {
              setVisible(false);
              setTimeout(() => {
                setStartGame(true);
              }, [1000]);
            }}
          />
        </RaiseFadeAnimation>
      </Holder>
    </PageAnimation>
  );
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10em;
  background-color: #2c2539;
  background-image: url('/images/rp/sprite-gen/bg.svg');
  background-size: cover;
  background-repeat: no-repeat;
  font-family: 'A Goblin Appears!';
  font-size: 1.7em;
`;
