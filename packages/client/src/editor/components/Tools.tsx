import ImageIcon from '@material-ui/icons/Image';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { useSnapshot } from 'valtio';
import Draw from '../../cursors/Draw';
import Erase from '../../cursors/Erase';
import { Mode } from '../../types';
import { editorState, imgState } from '../state';

export default function Tools() {
  const setImgState = useSetRecoilState(imgState);
  const { mode } = useSnapshot(editorState);
  const imageUpload = useRef<HTMLInputElement>(null);

  const handleMode = (event: React.MouseEvent<HTMLElement>, newMode: Mode) => {
    if (newMode === 'image') {
      imageUpload.current!.click();
      editorState.mode = 'image';
    } else if (newMode != null) {
      editorState.mode = newMode;
    }
  };

  const onImageUploadClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(image);
      reader.onload = () => {
        setImgState(new Uint8Array(reader.result as ArrayBuffer));
      };
    }
  };

  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={handleMode}
      aria-label="editor mode"
    >
      <ToggleButton value="draw" aria-label="draw mode">
        <Draw />
      </ToggleButton>
      <ToggleButton value="erase" aria-label="erase mode">
        <Erase />
      </ToggleButton>
      <ToggleButton value="note" aria-label="add note">
        <NoteAddIcon />
      </ToggleButton>
      <ToggleButton value="image" aria-label="add image">
        <input
          type="file"
          accept="image/*"
          onChange={onImageUploadClick}
          id="file-button"
          ref={imageUpload}
          hidden
        />
        <ImageIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
