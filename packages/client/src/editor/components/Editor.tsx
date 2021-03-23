import download from 'downloadjs';
import * as htmlToImage from 'html-to-image';
import React from 'react';
import { useSnapshot } from 'valtio';
import { leaveWhiteboard } from '../../controllers/auth-controller';
import { actions as alertActions } from '../../store/alerts';
import { clientState } from '../../store/auth';
import { undo } from '../history';
import Canvas from './Canvas';
import ExitTool from './ExitTool';
import SaveTool from './SaveTool';
import Stickies from './Stickies';
import Tools from './Tools';
import UndoTool from './UndoTool';

const EDITOR_FIELD_ID = 'editor-field';

const Editor = (props: { x: number; y: number }) => {
  const cState = useSnapshot(clientState);
  const handleSave = () => {
    const filenameSafeDate = new Date().toISOString().replace(/:/g, '-');
    const filename = `${filenameSafeDate}-whiteboard.png`;
    htmlToImage
      .toPng(document.getElementById(EDITOR_FIELD_ID)!)
      .then((dataUrl: string) => download(dataUrl, filename))
      .catch((error: Error) =>
        alertActions.addAlert({
          title: 'Could not save whiteboard as image.',
          message: error.message,
          level: 'error'
        })
      );
  };
  const isWhiteboardActive = cState.v.state !== 'SESSION_ENDED';

  return (
    <div
      id="editor"
      style={{
        height: props.y,
        width: props.x
      }}
    >
      <div style={{ position: 'relative' }}>
        {isWhiteboardActive ? (
          <>
            <Tools />
            <SaveTool onClick={handleSave} />
            <UndoTool onClick={undo} />
            <ExitTool onClick={leaveWhiteboard} />
          </>
        ) : (
          <>
            <SaveTool onClick={handleSave} />
            <ExitTool onClick={leaveWhiteboard} />
          </>
        )}
      </div>
      <div id={EDITOR_FIELD_ID}>
        <Stickies />
        <Canvas {...props} />
      </div>
    </div>
  );
};

export default Editor;
