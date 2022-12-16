import React, {useContext} from 'react';
import styled from 'styled-components';
import {AppContext} from '../../../../App';
import ShadowButton from '../../../../components/Buttons/ShadowButton';

export default function Header() {
  const {setPageIndex} = useContext(AppContext);
  return (
    <Holder>
      <ShadowButton
        icon="/images/rp/back.svg"
        onClick={() => {
          setPageIndex(0);
        }}
      />
      <ShadowButton title="Create New" onClick={() => {}} />
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
