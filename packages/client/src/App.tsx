import React from 'react';
import './App.css';
import Topbar from './Topbar'
import { RecoilRoot } from "recoil";

//import Canvas from './editor/whiteboard'
//import Canvas from './editor/whiteboard'
import Editor from './editor/components/Editor'

const topBarHeight = 60

//const canvasX = window.innerWidth;
//const canvasY = window.innerHeight;
const canvasX = 800;
const canvasY = 600;

function App() {

  return (
    <div className="App">
      <Topbar h={topBarHeight} />
      <RecoilRoot>
        <Editor x={canvasX} y={canvasY} />
      </RecoilRoot>
    </div>
  );
}

export default App;
