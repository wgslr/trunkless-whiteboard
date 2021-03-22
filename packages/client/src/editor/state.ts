import { atom } from 'recoil';
import { Mode, Img } from '../types';

export const modeState = atom<Mode>({
  key: 'mode',
  default: 'draw'
});

export const imgState = atom<Img['data']>({
  key: 'imgData',
  default: new Uint8Array()
});
