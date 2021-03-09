import { atom } from 'recoil';
import { Mode } from '../types';

export const modeState = atom<Mode>({
    key: "mode",
    default: "draw"
});