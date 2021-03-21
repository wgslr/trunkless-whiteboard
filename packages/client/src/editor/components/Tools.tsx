import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import Button from '@material-ui/core/Button';
import { useRecoilState } from 'recoil';
import { modeState, imgState } from '../state';
import { Mode } from '../../types';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ImageIcon from '@material-ui/icons/Image';
import Draw from '../../cursors/Draw';
import Erase from '../../cursors/Erase';

export default function Tools() {
  const [mode, setMode] = useRecoilState(modeState);
  const [imgData, setImgData] = useRecoilState(imgState);

  const handleMode = (event: React.MouseEvent<HTMLElement>, newMode: Mode) => {
    if (newMode !== null) setMode(newMode);
  }; 

  const onClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    //setMode('image');
    if (event.target.files && event.target.files[0]) {
        let image = event.target.files[0];
        let reader = new FileReader();
        reader.readAsArrayBuffer(image);
        reader.onload = () => {
            setImgData(new Uint8Array(reader.result as ArrayBuffer))
        }
    }
  }   

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
            onChange={ e => onClick(e) } 
            id="file-button"
            hidden/>
        <label htmlFor="file-button">          
            <ImageIcon />          
        </label>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
