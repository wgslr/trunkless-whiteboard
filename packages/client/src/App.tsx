import React from 'react';
import { RecoilRoot } from 'recoil';
import './App.css';
import ServerContext, { contextValue } from './connection/ServerContext';
import Editor from './editor/components/Editor';
import Topbar from './Topbar';

const topBarHeight = 60;
const canvasX = 800;
const canvasY = 600;

function App() {
  return (
    <div className="App">
      <Topbar h={topBarHeight} />
      <RecoilRoot>
        <ServerContext.Provider value={contextValue}>
          <Editor x={canvasX} y={canvasY} />
        </ServerContext.Provider>
      </RecoilRoot>
    </div>
  );
}

export default App;
