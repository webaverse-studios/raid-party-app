import React from 'react';
import styled from 'styled-components';

export default function Card({data, className, onClick}) {
  return (
    <Holder className={className} onClick={onClick}>
      <Preview image={data.preview} />
      <Caption>
        <div>
          <Title>{data.name}</Title>
          <Type>{data.type}</Type>
        </div>
        <Time>{data.time}</Time>
      </Caption>
    </Holder>
  );
}

const Holder = styled.div`
  background: #f5e1b5;
  border: 5px solid #e1cda8;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  padding: 0.2em;
  transition: all 0.2s ease-out;
  cursor: pointer;
  &:hover {
    background: #fcf0cd;
    filter: drop-shadow(0px 0.8em 0.8em rgba(0, 0, 0, 0.45));
  }
`;

const Preview = styled.div`
  width: 100%;
  min-height: 9em;
  height: 9em;
  flex: 1;
  border-radius: 1em;
  overflow: hidden;
  background-image: ${props => `url(${props.image})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

const Caption = styled.div`
  width: 100%;
  padding: 0.5em;
  display: flex;
  justify-content: space-between;
`;

const Title = styled.div`
  font-weight: 400;
  font-size: 1em;
  color: rgba(56, 26, 21, 0.93);
`;

const Type = styled.div`
  font-weight: 100;
  font-size: 0.8em;
  color: #988355;
`;

const Time = styled.div`
  font-weight: 400;
  font-size: 0.7em;
  color: #988355;
`;
