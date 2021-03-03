import React from 'react';
import './App.css';
import Topbar from './Topbar';
import Canvas from './editor/whiteboard';
import ServerContext, {
  serverConnection
} from './connection-context/server-connection';

const topBarHeight = 60;
const canvasX = 800;
const canvasY = 600;

function App() {
  return (
    <div className="App">
      <Topbar h={topBarHeight} />
      <ServerContext.Provider value={serverConnection}>
        <Canvas x={canvasX} y={canvasY} />
      </ServerContext.Provider>
    </div>
  );
}

export default App;
