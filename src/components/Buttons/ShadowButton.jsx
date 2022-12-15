import React from 'react';
import styled from 'styled-components';

export default function ShadowButton({icon, title, onClick, className}) {
  return (
    <Holder className={className} onClick={onClick}>
      {icon && <Icon src={icon} alt="" />}
      {title && <span>{title}</span>}
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  gap: 0.5em;
  background-color: #aa85ab;
  color: white;
  padding: 1em 4em;
  border-radius: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease-out;
  user-select: none;
  border: 0.2em solid #977398;
  box-shadow: 0px 1em 4px rgba(0, 0, 0, 0.14), inset 0px 0.2em 0px #c1a0b4;
  text-transform: uppercase;
  &:hover {
    background-color: #f5bff5;
  }
  &:active {
    background-color: #c096c0;
  }
`;

const Icon = styled.img``;
