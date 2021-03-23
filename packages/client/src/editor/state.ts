import { atom } from 'recoil';
import { proxy } from 'valtio';
import { Mode, Img } from '../types';

export const editorState = proxy<{ mode: Mode }>({
  mode: 'none'
});

export const imgState = atom<Img['data']>({
  key: 'imgData',
  default: new Uint8Array()
});

export const resetEditorState = () => {
  editorState.mode = 'none';
};
