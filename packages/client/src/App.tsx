import React from 'react';
import './App.css';
import Topbar from './Topbar'
import Canvas from './editor/whiteboard'
//import Canvas from './Canvas'

const topBarHeight = 60

//const canvasX = window.innerWidth;
//const canvasY = window.innerHeight;
const canvasX = 800;
const canvasY = 600;

function App() {

  return (
    <div className="App">
      <Topbar h={topBarHeight} />
      <Canvas x={canvasX} y={canvasY} />
      <p>xD</p>
    </div>
  );
}

export default App;
