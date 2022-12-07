import React from 'react';
import styled from 'styled-components';

export default function Title() {
  return (
    <Holder>
      <Content>Welcome Creator!</Content>
    </Holder>
  );
}

const Holder = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1;
  transform: translateX(-50%);
`;

const Content = styled.div`
  position: relative;
  background-image: url('/images/rp/sprite-gen/title-bg.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  color: white;
  padding: 1em 5em;
`;
