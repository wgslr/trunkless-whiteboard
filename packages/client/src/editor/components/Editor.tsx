import React, { useEffect } from 'react';
import { undo } from '../history';
import Canvas from './Canvas';
import Stickies from './Stickies';
import Tools from './Tools';
import UndoTool from './UndoTool';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import { actions as alertActions } from '../../store/alerts';
import SaveTool from './SaveTool';
import { useSnapshot } from 'valtio';
import { clientState } from '../../store/auth';
import { useSetRecoilState } from 'recoil';
import { imgState, modeState } from '../state';

const EDITOR_FIELD_ID = 'editor-field';

const Editor = (props: { x: number; y: number }) => {
  const cState = useSnapshot(clientState);
  const setDraw = useSetRecoilState(modeState);
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
  useEffect(() => {
    if (!isWhiteboardActive) {
      // hacky place to reset drawing state when session ends
      setDraw('draw');
    }
  }, [isWhiteboardActive, setDraw]);

  return (
    <div
      id="editor"
      style={{
        height: props.y,
        width: props.x
      }}
    >
      <div>
        {isWhiteboardActive ? (
          <>
            <Tools />
            <SaveTool onClick={handleSave} />
            <UndoTool onClick={undo} />
          </>
        ) : (
          <SaveTool onClick={handleSave} />
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
