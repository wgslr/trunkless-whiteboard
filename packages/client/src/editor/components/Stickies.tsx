import React from 'react';
import { deleteNote, updateText } from '../../store/notes';
import { Note } from '../../types';
import StickyNote from './StickyNote';

const Stickies: React.FunctionComponent<{ notes: Note[] }> = ({ notes }) => (
  <div id="stickies" className="stickersRoot">
    {notes.map(note => (
      <StickyNote
        key={note.id}
        save={updateText}
        delete={deleteNote}
        note={note}
      />
    ))}
  </div>
);

export default Stickies;
