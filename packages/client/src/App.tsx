import React from 'react';
import './App.css';
import Topbar from './Topbar'
import Canvas from './Canvas'

const topBarHeight = 60

function App() {

  return (
    <div className="App">
      <Topbar h={topBarHeight} />
      <Canvas x={window.innerWidth} y={window.innerHeight} />
    </div>
  );
}

export default App;
