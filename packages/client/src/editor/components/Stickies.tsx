import React, { useCallback, useState } from 'react';
import StickyNote, { NoteProps } from './StickyNote';
import { UUID, Coordinate, Note } from '../../types';
import { v5 } from 'uuid';
import { Notes } from '@material-ui/icons';

const UUID_NAMESPACE = '940beed9-f057-4088-a714-a9f5f2fc6052';

interface prop {
  get: (id: UUID) => string;
  save: (content: string, id: UUID) => void;
  remove: (id: UUID) => void;
}

export const notes: Note[] = [];

export const addNote = (pos: Coordinate) => {
  notes.push({
    UUID: v5('line' + (notes.length - 1).toString(), UUID_NAMESPACE),
    position: pos,
    text: ''
  });
  console.log('added note');
};

const moveNote = (id: UUID, newPos: Coordinate) => {
  let index = notes.findIndex(note => note.UUID == id);
  if (index != -1) {
    notes[index].position = newPos;
  }
};

const updateNote = (content: string, id: UUID) => {
  console.log('updating note', { id, content });
  let index = notes.findIndex(note => note.UUID == id);
  if (index != -1) {
    notes[index].text = content;
    console.log('updated note', { id, content });
  }
};

const deleteNote = (id: UUID) => {
  let index = notes.findIndex(note => note.UUID == id);
  if (index != -1) {
    notes.splice(index, 1);
  }
};

const getNote = (id: UUID) => {
  let index = notes.findIndex(note => note.UUID == id);
  if (index != -1) {
    return notes[index].text;
  } else return 'Note with ${id} not found';
};

const Stickies = () => {
  console.log({ notes });
  const listItems = notes.map(note => (
    <div key={note.UUID}>
      <StickyNote
        id={note.UUID}
        get={getNote}
        save={updateNote}
        delete={deleteNote}
      />
    </div>
  ));

  return <div id="stickies">{listItems}</div>;
};

export default Stickies;
