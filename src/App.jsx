import React, {useState, useContext, createContext, useEffect} from 'react';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';

import ThemeProvider from './theme/ThemeProvider';

import sceneNames from '../scenes/scenes.json';
import {parseQuery} from '../util.js';
import Webaverse from '../webaverse.js';

import {AccountContext} from './hooks/web3AccountProvider';
import {ChainContext} from './hooks/chainProvider';

import Characters from './pages/Characters';
import Adventures from './pages/Adventures';
import Playground from './pages/Playground';
import metaversefile from '../metaversefile-api.js';

export const getCurrentSceneSrc = () => {
  const q = parseQuery(window.location.search);
  let {src} = q;

  if (src === undefined) {
    src = './scenes/' + sceneNames[0];
  }

  return src;
};

export const getCurrentRoom = () => {
  const q = parseQuery(window.location.search);
  const {room} = q;
  return room || '';
};

export const AppContext = createContext();

const queryClient = new QueryClient();

export const useWebaverseApp = (() => {
  let webaverse = null;
  return () => {
    if (webaverse === null) {
      webaverse = new Webaverse();
    }
    return webaverse;
  };
})();

export const App = () => {
  const app = useWebaverseApp();
  const localPlayer = metaversefile.useLocalPlayer();

  const account = useContext(AccountContext);
  const chain = useContext(ChainContext);

  const [state, setState] = useState({openedPanel: null});
  const [uiMode, setUIMode] = useState('normal');
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedScene, setSelectedScene] = useState(getCurrentSceneSrc());
  const [selectedRoom, setSelectedRoom] = useState(getCurrentRoom());
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider
          value={{
            state,
            setState,
            app,
            setSelectedApp,
            selectedApp,
            uiMode,
            setUIMode,
            account,
            chain,
            selectedScene,
            setSelectedScene,
            selectedRoom,
            setSelectedRoom,
            avatarLoaded,
            setAvatarLoaded,
            tilesLoaded,
            setTilesLoaded,
            pageIndex,
            setPageIndex,
          }}
        >
          {pageIndex === 0 && <Characters />}
          {pageIndex === 1 && <Playground />}
        </AppContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
