import React from 'react';
import { useSnapshot } from 'valtio';
import { deleteNote, updateNoteText } from '../../controllers/note-controller';
import { getEffectiveNotes, noteTimelinesState } from '../../store';
import { NoteTimeline } from '../../store/timelines/note';
import { Note } from '../../types';
import StickyNote from './StickyNote';

const Stickies: React.FunctionComponent = () => {
  const noteTimelinesSnapshot = useSnapshot(noteTimelinesState) as Readonly<
    Map<Note['id'], NoteTimeline>
  >;
  const notes = getEffectiveNotes(noteTimelinesSnapshot);
  return (
    <div id="stickies" className="stickersRoot">
      {Array.from(notes.values()).map(note => (
        <StickyNote
          key={note.id}
          save={updateNoteText}
          delete={deleteNote}
          note={note}
        />
      ))}
    </div>
  );
};

export default Stickies;
