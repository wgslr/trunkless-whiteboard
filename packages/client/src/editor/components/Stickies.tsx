import React from 'react';
import { localDeleteNote, localUpdateText } from '../../store/notes';
import { Note } from '../../types';
import StickyNote from './StickyNote';

const Stickies: React.FunctionComponent<{ notes: Note[] }> = ({ notes }) => (
  <div id="stickies" className="stickersRoot">
    {notes.map(note => (
      <StickyNote
        key={note.id}
        save={localUpdateText}
        delete={localDeleteNote}
        note={note}
      />
    ))}
  </div>
);

export default Stickies;
