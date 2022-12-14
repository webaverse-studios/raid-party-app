import React, {useContext, useRef} from 'react';
import styled from 'styled-components';
import {OverlayPanel} from 'primereact/overlaypanel';

import {AppContext} from '../../../../App';

export default function Profile() {
  const {currentSprite, setOpenChangeCharacter} = useContext(AppContext);

  const op = useRef(null);

  const stopPropagation = event => {
    event.stopPropagation();
  };

  return (
    <Holder onClick={stopPropagation} onKeyDown={stopPropagation}>
      <Content>
        <UserProfile onClick={e => op.current.toggle(e)}>
          <Photo>{currentSprite && <img src={currentSprite.image} />}</Photo>
        </UserProfile>
        <OverlayPanel ref={op}>
          <Items>
            <Item
              onClick={() => {
                op.current.hide();
                setOpenChangeCharacter(true);
              }}
            >
              Change Avatar
            </Item>
            <Item>Preferences</Item>
            <Item>Logout</Item>
          </Items>
        </OverlayPanel>
      </Content>
    </Holder>
  );
}

const Holder = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
`;

const Content = styled.div`
  position: relative;
  padding: 1.5em 0 0 1.5em;
`;

const UserProfile = styled.div`
  background: #f5e1b5;
  border: 0.1em solid #e1cda8;
  border-radius: 1em;
  padding: 0.5em;
  display: flex;
  gap: 1em;
  cursor: pointer;
  transition: all 0.2s ease-out;
  &:hover {
    background: #f8f1e1;
  }
`;

const Photo = styled.div`
  width: 5em;
  height: 5em;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border: 0.2em solid #e0cbab;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  > img {
    object-fit: none;
    object-position: 0 0;
    width: 64px;
    height: 64px;
    transform: scale(1.5);
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
`;

const Item = styled.div`
  cursor: pointer;
  color: #4c4c4c;
  transition: all 0.3s ease-out;
  padding: 0.7em 0;
  &:hover {
    color: #d33043;
  }
`;
