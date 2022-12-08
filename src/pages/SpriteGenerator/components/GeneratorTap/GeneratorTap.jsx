import {motion} from 'framer-motion';
import React, {useState} from 'react';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import styled from 'styled-components';
import './style.css';

export default function GeneratorTap() {
  const [visible, setVisible] = useState(true);

  return (
    <Holder
      variants={{
        init: {
          y: '-30',
          opacity: 0,
        },
        show: {
          y: 0,
          opacity: 1,
        },
        hide: {
          y: '-30',
          opacity: 0,
        },
      }}
      transition={{
        ease: 'easeOut',
        delay: 6,
        duration: 0.8,
      }}
      initial="init"
      animate={visible ? 'show' : 'hide'}
    >
      <Tabs>
        <TabList>
          <Tab>Describe</Tab>
          <Tab>Pre-Rolled</Tab>
        </TabList>
        <TabPanel>
          <PanelContent>
            <TextArea name="" rows="4">
              Enter the description of your avatar to generate a sprite
            </TextArea>
          </PanelContent>
        </TabPanel>
        <TabPanel>
          <PanelContent>
            <TextArea name="" rows="4">
              Editable text description of the selected pre-rolled option.
            </TextArea>
          </PanelContent>
        </TabPanel>
      </Tabs>
    </Holder>
  );
}

const Holder = styled(motion.div)``;

const PanelContent = styled.div`
  padding: 3em;
  background: #f5dfb8;
  max-width: 50em;
  color: #92724d;
`;

const TextArea = styled.textarea`
  font-family: 'A Goblin Appears!';
  color: #92724d;
  font-size: 0.9em;
  line-height: 1.5;
  padding: 1em;
`;
