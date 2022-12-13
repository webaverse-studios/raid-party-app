import React from 'react';
import styled from 'styled-components';
import Spiner from '../Spiner';

export default function BorderButton({
  icon,
  title,
  onClick,
  className,
  loading = false,
}) {
  return (
    <Holder
      className={className}
      onClick={e => {
        if (loading) {
          return;
        }
        onClick(e);
      }}
    >
      {icon && (
        <IconHolder>
          {loading ? (
            <Spiner size={40} color="#77baa2" />
          ) : (
            <Icon src={icon} alt="" />
          )}
        </IconHolder>
      )}
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

const IconHolder = styled.div`
  position: relative;
`;

const Icon = styled.img`
  width: 2em;
  height: 2em;
`;
