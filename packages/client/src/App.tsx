import React from 'react';
import './App.css';
import Topbar from './Topbar'
import Canvas from './editor/whiteboard'
import { ServerConnection } from './serverClient';

// TODO: set as env variable
const SERVER_URL = 'ws://localhost:3001/ws';

const topBarHeight = 60
const canvasX = 800;
const canvasY = 600;

function App() {
  const socket = new WebSocket(SERVER_URL);
  const connection = new ServerConnection(socket);

  return (
    <div className="App">
      <Topbar h={topBarHeight} />
      <Canvas x={canvasX} y={canvasY} />
    </div>
  );
}

export default App;
