import React, {useContext} from 'react';
import styled from 'styled-components';
import {AppContext} from '../../App';
import ShadowButton from '../../components/Buttons/ShadowButton';

export default function Adventures() {
  const {setPageIndex} = useContext(AppContext);
  return (
    <Holder>
      <ShadowButton
        title="Play"
        onClick={() => {
          setPageIndex(2);
        }}
      />
    </Holder>
  );
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #30404e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;
