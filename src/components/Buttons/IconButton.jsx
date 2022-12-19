import React from 'react';
import styled from 'styled-components';

export default function IconButton({icon, onClick, className}) {
  return (
    <Holder className={className} onClick={onClick}>
      {icon && <Icon src={icon} alt="" />}
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  gap: 0.5em;
  background-color: #f4dfb7;
  color: white;
  padding: 1em;
  border-radius: 5em;
  cursor: pointer;
  transition: all 0.3s ease-out;
  user-select: none;
  width: fit-content;
  &:hover {
    filter: brightness(110%);
  }
`;

const Icon = styled.img`
  width: 1.5em;
  height: 1.5em;
`;
