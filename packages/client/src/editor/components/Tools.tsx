import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useRecoilState } from 'recoil';
import { modeState } from '../state';
import { Mode } from '../../types';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ImageIcon from '@material-ui/icons/Image';
import Draw from '../../cursors/Draw';
import Erase from '../../cursors/Erase';

export default function Tools() {
  const [mode, setMode] = useRecoilState(modeState);

  const handleMode = (event: React.MouseEvent<HTMLElement>, newMode: Mode) => {
    setMode(newMode);
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
      <ToggleButton value="image" aria-label="add note">
        <ImageIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
