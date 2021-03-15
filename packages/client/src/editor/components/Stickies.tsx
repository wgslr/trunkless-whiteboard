import React from 'react';
import { updateNoteText } from '../../controllers/note-controller';
import { localDeleteNote, localUpdateText } from '../../store/notes';
import { Note } from '../../types';
import StickyNote from './StickyNote';

const Stickies: React.FunctionComponent<{ notes: Note[] }> = ({ notes }) => (
  <div id="stickies" className="stickersRoot">
    {notes.map(note => (
      <StickyNote
        key={note.id}
        save={updateNoteText}
        delete={localDeleteNote}
        note={note}
      />
    ))}
  </div>
);

export default Stickies;
