import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  createContext,
} from 'react';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';

import ThemeProvider from 'theme/ThemeProvider';

import classnames from 'classnames';

import game from 'engine/game.js';
import sceneNames from 'engine/scenes/scenes.json';
import {parseQuery} from 'engine/util.js';
import Webaverse from 'engine/webaverse.js';
import universe from 'engine/universe.js';
import cameraManager from 'engine/camera-manager.js';
import {world} from 'engine/world.js';
import raycastManager from 'engine/raycast-manager';
import npcManager from 'engine/npc-manager';
import loadoutManager from 'engine/loadout-manager';
import {partyManager} from 'engine/party-manager';
import {playersManager} from 'engine/players-manager';
import {handleStoryKeyControls} from 'engine/story';

import {AccountProvider, AccountContext} from 'hooks/web3AccountProvider';
import {ChainProvider, ChainContext} from 'hooks/chainProvider';

import {Crosshair} from 'components/general/crosshair';
import {WorldObjectsList} from 'components/general/world-objects-list';
import {
  IoHandler,
  registerIoEventHandler,
  unregisterIoEventHandler,
} from 'components/general/io-handler';
import {ZoneTitleCard} from 'components/general/zone-title-card';
import {Quests} from 'components/play-mode/quests';
import {MapGen} from 'components/general/map-gen/MapGen.jsx';
import {LoadingBox} from 'components/LoadingBox.jsx';
import {FocusBar} from 'components/FocusBar.jsx';
import {DragAndDrop} from 'components/DragAndDrop.jsx';
import {Stats} from 'components/Stats.jsx';
import {PlayMode} from 'components/play-mode';
import {EditorMode} from 'components/editor-mode';
import Header from 'components/Header.jsx';
import QuickMenu from 'components/QuickMenu.jsx';
import {ClaimsNotification} from 'components/ClaimsNotification.jsx';
import {DomRenderer} from 'components/DomRenderer.jsx';
import {GrabKeyIndicators} from 'components/GrabKeyIndicators';
import Modals from 'components/modals';

import SpriteGenerator from 'pages/SpriteGenerator';
import styled from 'styled-components';

const _startApp = async (weba, canvas) => {
  weba.setContentLoaded();
  weba.bindInput();
  weba.bindInterface();
  weba.bindCanvas(canvas);

  await weba.waitForLoad();

  await npcManager.initDefaultPlayer();
  loadoutManager.initDefault();
  await universe.handleUrlUpdate();
  partyManager.inviteDefaultPlayer();

  const sprites = _getSprites();

  if (sprites) {
    const selectedSprite = sprites.data[sprites.data.length - 1]; // hack
    console.log(selectedSprite, 'selectedSprite');
    playersManager
      .getLocalPlayer()
      .avatar.makeSpriteAvatar(selectedSprite.image);
  }

  await weba.startLoop();
};

const _getCurrentSceneSrc = () => {
  const q = parseQuery(window.location.search);
  let {src} = q;

  if (src === undefined) {
    src = './scenes/' + sceneNames[0];
  }

  return src;
};

const _getCurrentRoom = () => {
  const q = parseQuery(window.location.search);
  const {room} = q;
  return room || '';
};

const _getSprites = () => {
  let parsed = [];

  try {
    const saved = localStorage.getItem('sprites');

    if (!saved) {
      return {data: []};
    }

    parsed = JSON.parse(saved);
  } catch (error) {
    console.warn('Error loading rooms from local storage.');
  }
  return parsed;
};

const AppContext = createContext();

const queryClient = new QueryClient();

const useWebaverseApp = (() => {
  let webaverse = null;
  return () => {
    if (webaverse === null) {
      webaverse = new Webaverse();
    }
    return webaverse;
  };
})();

const Canvas = ({app}) => {
  const canvasRef = useRef(null);
  const [domHover, setDomHover] = useState(null);

  const isStarted = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      if (!isStarted.current) {
        _startApp(app, canvasRef.current);
        isStarted.current = true;
      }
    }
  }, [app, canvasRef]);

  useEffect(() => {
    const domhoverchange = e => {
      const {domHover} = e.data;
      // console.log('dom hover change', domHover);
      setDomHover(domHover);
    };
    raycastManager.addEventListener('domhoverchange', domhoverchange);

    return () => {
      raycastManager.removeEventListener('domhoverchange', domhoverchange);
    };
  }, []);

  return (
    <canvas
      className={classnames(styles.canvas, domHover ? styles.domHover : null)}
      ref={canvasRef}
    />
  );
};

const App = () => {
  const [state, setState] = useState({openedPanel: null});
  const [uiMode, setUIMode] = useState('normal');
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const app = useWebaverseApp();
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedScene, setSelectedScene] = useState(_getCurrentSceneSrc());
  const [selectedRoom, setSelectedRoom] = useState(_getCurrentRoom());
  const [apps, setApps] = useState(world.appManager.getApps().slice());
  const account = useContext(AccountContext);
  const chain = useContext(ChainContext);
  const [startGame, setStartGame] = useState(false);

  const selectApp = (app, physicsId, position) => {
    game.setMouseSelectedObject(app, physicsId, position);
  };

  const _loadUrlState = () => {
    const src = _getCurrentSceneSrc();
    setSelectedScene(src);

    const roomName = _getCurrentRoom();
    setSelectedRoom(roomName);
  };

  useEffect(() => {
    if (
      state.openedPanel &&
      state.openedPanel !== 'ChatPanel' &&
      cameraManager.pointerLockElement
    ) {
      cameraManager.exitPointerLock();
    }

    if (state.openedPanel) {
      setUIMode('normal');
    }
  }, [state.openedPanel]);

  useEffect(() => {
    const handleStoryKeyUp = event => {
      if (game.inputFocused()) return;
      handleStoryKeyControls(event);
    };

    registerIoEventHandler('keyup', handleStoryKeyUp);

    return () => {
      unregisterIoEventHandler('keyup', handleStoryKeyUp);
    };
  }, []);

  useEffect(() => {
    if (uiMode === 'none') {
      setState({openedPanel: null});
    }

    const handleKeyDown = event => {
      if (event.ctrlKey && event.code === 'KeyH') {
        setUIMode(uiMode === 'normal' ? 'none' : 'normal');
        return false;
      }

      return true;
    };
    game.setGrabUseMesh(uiMode);

    registerIoEventHandler('keydown', handleKeyDown);

    return () => {
      unregisterIoEventHandler('keydown', handleKeyDown);
    };
  }, [uiMode]);

  useEffect(() => {
    const handleClick = () => {
      const hoverObject = game.getMouseHoverObject();

      if (hoverObject) {
        const physicsId = game.getMouseHoverPhysicsId();
        const position = game.getMouseHoverPosition();
        selectApp(hoverObject, physicsId, position);
        return false;
      }

      return true;
    };

    registerIoEventHandler('click', handleClick);

    return () => {
      unregisterIoEventHandler('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const update = e => {
      setApps(world.appManager.getApps().slice());
    };

    world.appManager.addEventListener('appadd', update);
    world.appManager.addEventListener('appremove', update);
  }, []);

  useEffect(() => {
    const pushstate = e => {
      _loadUrlState();
    };

    const popstate = e => {
      _loadUrlState();
      universe.handleUrlUpdate();
    };

    window.addEventListener('pushstate', pushstate);
    window.addEventListener('popstate', popstate);

    return () => {
      window.removeEventListener('pushstate', pushstate);
      window.removeEventListener('popstate', popstate);
    };
  }, []);

  useEffect(_loadUrlState, []);

  //

  const onDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDragStart = e => {
    // console.log('drag start', e);
  };
  const onDragEnd = e => {
    // console.log('drag end', e);
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AccountProvider>
          <ChainProvider>
            <AppContext.Provider
              value={{
                state,
                setState,
                app,
                setSelectedApp,
                selectedApp,
                uiMode,
                account,
                chain,
                selectedScene,
                setSelectedScene,
                selectedRoom,
                setSelectedRoom,
                avatarLoaded,
                setAvatarLoaded,
                startGame,
                setStartGame,
              }}
            >
              {startGame && (
                <Holder
                  id="app"
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                >
                  <Modals />
                  <Header
                    setSelectedApp={setSelectedApp}
                    selectedApp={selectedApp}
                  />
                  <DomRenderer />
                  <Canvas app={app} />
                  <Crosshair />
                  <ClaimsNotification />
                  <WorldObjectsList
                    setSelectedApp={setSelectedApp}
                    selectedApp={selectedApp}
                  />
                  <PlayMode />
                  <EditorMode
                    selectedScene={selectedScene}
                    setSelectedScene={setSelectedScene}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                  />
                  <IoHandler />
                  <QuickMenu />
                  <ZoneTitleCard />
                  <MapGen />
                  <Quests />
                  <LoadingBox />
                  <FocusBar />
                  <DragAndDrop />
                  <GrabKeyIndicators />
                  <Stats app={app} />
                </Holder>
              )}
              <SpriteGenerator />
            </AppContext.Provider>
          </ChainProvider>
        </AccountProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export {AppContext, App};
