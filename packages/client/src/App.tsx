import React from 'react';
import { RecoilRoot } from 'recoil';
import './App.css';
import ServerContext, { contextValue } from './connection/ServerContext';
import Lifecycle from './editor/components/Lifecycle';
import Topbar from './Topbar';
import Alerts from './Alerts';

const topBarHeight = 60;

const App = () => (
  <div className="App">
    <Alerts />
    <Topbar h={topBarHeight} />
    <RecoilRoot>
      <ServerContext.Provider value={contextValue}>
        <main>
          <Lifecycle />
        </main>
      </ServerContext.Provider>
    </RecoilRoot>
  </div>
);

export default App;
