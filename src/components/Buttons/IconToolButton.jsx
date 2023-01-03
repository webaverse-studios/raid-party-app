import React from 'react';
import styled from 'styled-components';

export default function IconToolButton({icon, onClick, className, active}) {
  return (
    <Holder className={className} onClick={onClick} active={active}>
      {icon && <Icon src={icon} alt="" />}
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  gap: 0.5em;
  background-color: ${props => (props.active ? '#966b19' : '#f4dfb7')};
  color: white;
  padding: 0.5em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.3s ease-out;
  user-select: none;
  width: fit-content;
`;

const Icon = styled.img`
  width: 1.5em;
  height: 1.5em;
`;
