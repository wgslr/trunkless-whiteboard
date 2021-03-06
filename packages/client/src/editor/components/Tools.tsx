import React, {useState} from 'react';
import {ToggleButton} from '@material-ui/lab';
import {ToggleButtonGroup} from '@material-ui/lab';
import {useRecoilState} from 'recoil';
import { modeState } from '../state';
import { Mode } from '../../types'
import Draw from'../../cursors/Draw';
import Erase from'../../cursors/Erase';

export default function Tools() {
    const [mode, setMode] = useRecoilState(modeState);

    const handleMode = (event: React.MouseEvent<HTMLElement>, newMode: Mode) => {
        setMode(newMode);
    }

    return (
        <ToggleButtonGroup value={mode} exclusive onChange={handleMode} aria-label="editor mode">
            <ToggleButton value="draw" aria-label="draw mode">
                <Draw/>
            </ToggleButton>
            <ToggleButton value="erase" aria-label="erase mode">
                <Erase/>
            </ToggleButton>
        </ToggleButtonGroup>
    )
};  
