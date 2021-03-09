import React from 'react';
import { RecoilRoot } from 'recoil';
import './App.css';
import ServerContext, {
  serverConnection
} from './connection-context/server-connection';
//import Canvas from './editor/whiteboard'
//import Canvas from './editor/whiteboard'
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
        <ServerContext.Provider value={serverConnection}>
          <Editor x={canvasX} y={canvasY} />
        </ServerContext.Provider>
      </RecoilRoot>
    </div>
  );
}

export default App;
