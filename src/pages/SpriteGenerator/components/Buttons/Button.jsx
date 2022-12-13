import React from 'react';
import styled from 'styled-components';

export default function Button({icon, title, onClick, className}) {
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
  background-color: #a984a9;
  color: white;
  padding: 1em 4em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.3s ease-out;
  user-select: none;
  &:hover {
    background-color: #f5bff5;
  }
  &:active {
    background-color: #c096c0;
  }
`;

const Icon = styled.img``;
