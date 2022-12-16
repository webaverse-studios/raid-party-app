import {motion} from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

export default function Card({data, className, onClick}) {
  return (
    <Holder
      className={className}
      onClick={onClick}
      variants={{
        open: {
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            damping: 12,
            stiffness: 200,
          },
        },
        closed: {
          opacity: 0,
          y: 20,
          transition: {
            type: 'spring',
            damping: 12,
            stiffness: 200,
          },
        },
      }}
    >
      <Preview>
        <img src={data.preview} alt="" />
      </Preview>
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

const Holder = styled(motion.li)`
  width: 17em;
  height: 12em;
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
