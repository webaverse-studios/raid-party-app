import React from 'react';
import styled from 'styled-components';

export default function Card({data, className, onClick}) {
  return (
    <Holder className={className} onClick={onClick}>
      <Preview>
        <img src={data.preview} alt="" />
      </Preview>
      <Caption>
        <Title>{data.name}</Title>
        <Time>{data.time}</Time>
      </Caption>
    </Holder>
  );
}

const Holder = styled.div`
  width: 14em;
  height: 10em;
  background: #f5e1b5;
  border: 5px solid #e1cda8;
  box-shadow: 0px 22px 0px rgba(0, 0, 0, 0.14);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  padding: 0.2em;
  transition: all 0.2s ease-out;
  cursor: pointer;
  &:hover {
    background: #fcf0cd;
    padding-top: 0.4em;
    border-color: #475f74;
  }
`;

const Preview = styled.div`
  width: 100%;
  flex: 1;
  border-radius: 1em;
  overflow: hidden;
`;

const Caption = styled.div`
  width: 100%;
  padding: 0.5em;
  display: flex;
  justify-content: space-between;
`;

const Title = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 156%;
  color: rgba(56, 26, 21, 0.93);
`;

const Time = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 156%;
  color: #988355;
`;
