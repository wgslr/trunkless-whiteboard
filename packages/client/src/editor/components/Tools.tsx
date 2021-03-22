import React, { useRef } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useRecoilState } from 'recoil';
import { modeState, imgState } from '../state';
import { Mode } from '../../types';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ImageIcon from '@material-ui/icons/Image';
import Draw from '../../cursors/Draw';
import Erase from '../../cursors/Erase';

export default function Tools() {
  const [mode, setMode] = useRecoilState(modeState);
  const [, setImgData] = useRecoilState(imgState);
  const imageUpload = useRef(null);

  const handleMode = (event: React.MouseEvent<HTMLElement>, newMode: Mode) => {
    if (newMode === 'image') {
      // @ts-ignore: type definition is optional null, but it's set in the input below
      imageUpload.current.click();
      setMode('image');
    } else if (newMode != null) {
      setMode(newMode);
    }
  };

  const onImageUploadClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(image);
      reader.onload = () => {
        setImgData(new Uint8Array(reader.result as ArrayBuffer));
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
