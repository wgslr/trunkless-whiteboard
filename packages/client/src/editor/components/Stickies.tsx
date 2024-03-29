import React from 'react';
import {
  deleteNote,
  updateNoteText,
  moveNote
} from '../../controllers/note-controller';
import { useEffectiveNotes } from '../../store/hooks';
import StickyNote from './StickyNote';

const Stickies: React.FunctionComponent = () => {
  const notesSnaphost = useEffectiveNotes();
  return (
    <div id="stickies" className="stickersRoot">
      {Array.from(notesSnaphost.values()).map(note => (
        <StickyNote
          key={note.id}
          save={updateNoteText}
          delete={deleteNote}
          move={moveNote}
          note={note}
        />
      ))}
    </div>
  );
};

export default Stickies;
