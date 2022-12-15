import React from 'react';
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
} from 'styled-components';
import Div100vh from 'react-div-100vh';
import {isMobile} from 'react-device-detect';
import {normalize} from 'polished';

import theme from './theme';
import {device} from './device';

import './fonts.css';

// Toastify
import 'react-toastify/dist/ReactToastify.css';

// Load lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

// Load primereact styles
import './md-light-deeppurple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import PrimeReact from 'primereact/api';
PrimeReact.ripple = true;
PrimeReact.inputStyle = 'filled';
PrimeReact.zIndex = {
  modal: 10000, // dialog, sidebar
  overlay: 10000, // dropdown, overlaypanel
  menu: 1000, // overlay menus
  tooltip: 1100, // tooltip
  toast: 1200, // toast
};

const GlobalStyle = createGlobalStyle`
  ${normalize()}

  body {
    color: 212121;
    font-Size: 20px;
    font-family: 'A Goblin Appears!';
    padding: 0;
    margin: 0;
    overflow-x: hidden;
    touch-action: pan-x pan-y;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    --color: #ec407a;
    --color2: #ffa726;
    --color3: #42a5f5;
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  *::-webkit-scrollbar {
    width: 12px;
  }

  *::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }

  *::-webkit-scrollbar-thumb {
    background-color: none;
    outline: 1px solid slategrey;
    z-index: 1;
  }

  a {
    text-decoration: none;
  }
`;

const MobileContainer = styled(Div100vh)`
  width: 100vw;
  font-size: 0.9em;
`;

const DesktopContainer = styled.div`
  width: 100vw;
  height: 100vh;
  font-size: 1em;
  @media ${device.laptop} {
    font-size: 1.2vw;
  }
  @media ${device.pad} {
    font-size: 0.9em;
  }

  @media (max-width: 768px) {
    height: auto;
  }
`;

export default function ThemeProvider({children}) {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      <GlobalStyle />
      {isMobile ? (
        <MobileContainer> {children} </MobileContainer>
      ) : (
        <DesktopContainer> {children} </DesktopContainer>
      )}
    </StyledComponentsThemeProvider>
  );
}
