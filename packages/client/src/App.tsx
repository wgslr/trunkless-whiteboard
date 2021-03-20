import React from 'react';
import { RecoilRoot } from 'recoil';
import { useSnapshot } from 'valtio';
import './App.css';
import ServerContext, { contextValue } from './connection/ServerContext';
import Editor from './editor/components/Editor';
import { clientState } from './store/auth';
import Topbar from './Topbar';

const topBarHeight = 60;
const canvasX = 800;
const canvasY = 600;

function App() {
  const cState = useSnapshot(clientState);
  return (
    <div className="App">
      <Topbar h={topBarHeight} />
      <RecoilRoot>
        <ServerContext.Provider value={contextValue}>
          {cState.v.state === 'DISCONNECTED' ? (
            'Connecting...'
          ) : (
            <Editor x={canvasX} y={canvasY} />
          )}
        </ServerContext.Provider>
      </RecoilRoot>
    </div>
  );
}

export default App;
