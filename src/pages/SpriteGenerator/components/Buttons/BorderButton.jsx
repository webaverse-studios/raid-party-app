import React from 'react';
import styled from 'styled-components';

export default function BorderButton({icon, title, onClick, className}) {
  return (
    <Holder className={className} onClick={onClick}>
      {icon && <Icon src={icon} alt="" />}
      {title && <span>{title}</span>}
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  align-items: center;
  gap: 1em;
  background-color: #fff9ee;
  color: #4c4c4c;
  padding: 1em;
  border-radius: 0.5em;
  border: 0.3em solid #e0cbab;
  cursor: pointer;
  transition: all 0.3s ease-out;
  user-select: none;
  &:hover {
    background-color: #ffffff;
  }
  &:active {
    background-color: #ecdcc4;
  }
`;

const Icon = styled.img``;
