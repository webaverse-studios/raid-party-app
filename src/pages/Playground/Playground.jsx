import React, {useState, useEffect, useRef, useContext} from 'react';
import styled from 'styled-components';

import game from '../../../game';
import universe from '../../../universe.js';
import cameraManager from '../../../camera-manager';
import {world} from '../../../world';
import {handleStoryKeyControls} from '../../../story';
import raycastManager from '../../../raycast-manager';
import npcManager from '../../../npc-manager';
import loadoutManager from '../../../loadout-manager';
import {partyManager} from '../../../party-manager';
import {playersManager} from '../../../players-manager';

import {Crosshair} from '../../components/general/crosshair';
import {WorldObjectsList} from '../../components/general/world-objects-list';
import {
  IoHandler,
  registerIoEventHandler,
  unregisterIoEventHandler,
} from '../../components/general/io-handler';
import {ZoneTitleCard} from '../../components/general/zone-title-card';
import {Quests} from '../../components/play-mode/quests';
import {MapGen} from '../../components/general/map-gen/MapGen.jsx';
import {LoadingBox} from '../../components/LoadingBox.jsx';
import {FocusBar} from '../../components/FocusBar.jsx';
import {DragAndDrop} from '../../components/DragAndDrop.jsx';
import {Stats} from '../../components/Stats.jsx';
import {PlayMode} from '../../components/play-mode';
import {EditorMode} from '../../components/editor-mode';
import Header from '../../components/Header.jsx';
import QuickMenu from '../../components/QuickMenu.jsx';
import {ClaimsNotification} from '../../components/ClaimsNotification.jsx';
import {DomRenderer} from '../../components/DomRenderer.jsx';
import {GrabKeyIndicators} from '../../components/GrabKeyIndicators';
import Modals from '../../components/modals';
import Loader from '../../components/Loader';

import {AppContext, getCurrentRoom, getCurrentSceneSrc} from '../../App';
import metaversefile from '../../../metaversefile-api';
import Adventures from '../Adventures';
import Toolbar from '../../components/Toolbar';

const localPlayer = metaversefile.useLocalPlayer();

const _startApp = async (weba, canvas, sprite) => {
  weba.setContentLoaded();
  weba.bindInput();
  weba.bindInterface();
  weba.bindCanvas(canvas);

  await weba.waitForLoad();

  await npcManager.initDefaultPlayer();
  loadoutManager.initDefault();
  await universe.handleUrlUpdate();
  partyManager.inviteDefaultPlayer();

  // Set sprite
  playersManager.getLocalPlayer().avatar.makeSpriteAvatar(sprite.image);

  await weba.startLoop();
};

const Canvas = ({app}) => {
  const {currentSprite} = useContext(AppContext);
  const canvasRef = useRef(null);
  const [domHover, setDomHover] = useState(null);

  const isStarted = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      if (!isStarted.current) {
        _startApp(app, canvasRef.current, currentSprite);
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

  return <StyledCanvas domhover={domHover} ref={canvasRef} />;
};

export default function Playground() {
  const {
    uiMode,
    setUIMode,
    state,
    setState,
    selectedScene,
    setSelectedScene,
    selectedRoom,
    setSelectedRoom,
    selectedApp,
    setSelectedApp,
    app,
    apps,
    setApps,
    avatarLoaded,
    setAvatarLoaded,
    tilesLoaded,
    setTilesLoaded,
    openAdventures,
    setOpenAdventures,
  } = useContext(AppContext);

  const selectApp = (app, physicsId, position) => {
    game.setMouseSelectedObject(app, physicsId, position);
  };

  const _loadUrlState = () => {
    const src = getCurrentSceneSrc();
    setSelectedScene(src);

    const roomName = getCurrentRoom();
    setSelectedRoom(roomName);
  };

  useEffect(() => {
    localPlayer.addEventListener('loading_map', e => {
      setTilesLoaded(e.loading);
    });
  }, []);

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

  useEffect(() => {
    localPlayer.addEventListener('update_adventures', e => {
      setOpenAdventures(e.open_adventures);
    });
  }, []);

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
    <Holder
      id="app"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <Modals />
      <DomRenderer />
      <Canvas app={app} />
      <ClaimsNotification />
      <LoadingBox />
      <DragAndDrop />
      <Stats app={app} />
      <Crosshair />
      <Quests />
      <GrabKeyIndicators />
      <FocusBar />
      <Toolbar />
      {openAdventures ? <Adventures /> : <IoHandler />}
      <StyledLoader visible={tilesLoaded} label="Loading assets..." size={80} />
    </Holder>
  );
}

const Holder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const StyledCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${props => (props.domhover ? 'none' : 'auto')};
`;

const StyledLoader = styled(Loader)`
  background-color: #2c293d;
  z-index: 99999;
`;
