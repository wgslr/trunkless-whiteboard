import React, { useCallback } from 'react';
import StickyNote, { NoteProps } from './StickyNote';
import { UUID, Coordinate, Note } from '../../types';
import { v5 } from 'uuid';

const UUID_NAMESPACE = '940beed9-f057-4088-a714-a9f5f2fc6052';

interface prop {
    get: (id: UUID) => string;
    save: (content: string, id: UUID) => void;
    remove: (id: UUID) => void;
}

const notes: Note[] = [];

export const addNote = (pos: Coordinate) => {
    notes.push({
      UUID: v5('line' + (notes.length-1).toString(), UUID_NAMESPACE),
      position: pos,
      text: ''
    });
    console.log('added note');
};
  
const moveNote = (id: UUID, newPos: Coordinate) => {
    let index = notes.findIndex( note => note.UUID == id);
    if (index != -1) {
      notes[index].position = newPos;
    }
};
  
const updateNote = (content: string, id: UUID) => {
    let index = notes.findIndex( note => note.UUID == id);
    if (index != -1) {
      notes[index].text = content;
      console.log(content);
    }
};
  
const deleteNote = (id: UUID) => {
    let index = notes.findIndex( note => note.UUID == id);
    if (index != -1) {
      notes.splice(index,1);
    }
};

const getNote = (id: UUID) => {
    let index = notes.findIndex( note => note.UUID == id);
    if (index != -1) {
      return notes[index].text;
    } else return 'Note with ${id} not found'
};

const Stickies = () => {
    const listItems = notes.map( note => {
        <li key={note.UUID}>
            {new StickyNote({
                id: note.UUID,
                get: getNote,
                save: updateNote,
                delete: deleteNote
            })}
        </li>
    });

    return (
        <ul id='stickies'>{listItems}</ul>
    )
}

export default Stickies;