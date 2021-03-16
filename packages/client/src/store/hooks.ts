import { useSnapshot } from 'valtio';
import { getEffectiveNotes, noteTimelinesState } from '../store';
import { NoteTimeline } from '../store/timelines/note';
import { Note } from '../types';

export const useEffectivNotes = () => {
  const noteTimelinesSnapshot = useSnapshot(noteTimelinesState) as Readonly<
    Map<Note['id'], NoteTimeline>
  >;
  return getEffectiveNotes(noteTimelinesSnapshot);
};
