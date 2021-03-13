import { v4 } from 'uuid';
import { updateStore } from '.';
import { Coordinates, Note } from '../types';
import { newNoteTimeline, modifyDelete, modifyText } from './timelines/note';

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

export const deleteNote = (id: Note['id']) => {
  updateStore(store => {
    const nt = store.noteTimelines.get(id);
    if (!nt) {
      console.error('tried deleting a note without NoteTimeline');
      return;
    } else {
      store.noteTimelines.set(nt.noteId, modifyDelete(nt));
      console.log('added note removal operation', { nt });
    }
  });
};

export const updateText = (id: Note['id'], newText: string) => {
  updateStore(store => {
    const nt = store.noteTimelines.get(id);
    if (!nt) {
      console.error('tried updating text of a note without NoteTimeline');
      return;
    } else {
      store.noteTimelines.set(nt.noteId, modifyText(nt, newText));
    }
  });
};
