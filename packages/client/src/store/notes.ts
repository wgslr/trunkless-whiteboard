import { v4 } from 'uuid';
import { updateStore } from '.';
import { Coordinates } from '../types';
import { newNoteTimeline } from './timelines/note';

export const addNote = (pos: Coordinates) => {
  const nt = newNoteTimeline({
    id: v4(),
    position: pos,
    text: 'a new note'
  });
  updateStore(store => {
    store.noteTimelines.set(nt.noteId, nt);
  });
  // TODO push to server. Here?
  console.log('added note timeline', { nt });
};
