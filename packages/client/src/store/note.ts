import { v4 } from 'uuid';
import type { Note, Coordinates, UUID } from '../types';

type Patch = {
  changeId: UUID;
  newState: Note;
};

type NoteTimeline = {
  commited: Note | null;
  drafts: Patch[];
};

export const getNewestLocalState = (nt: NoteTimeline): Note | null => {
  if (nt.drafts.length > 0) {
    return nt.drafts[nt.drafts.length - 1].newState;
  } else {
    return nt.commited;
  }
};

const newPatch = (newState: Note) => ({ changeId: v4(), newState });

export const setDraftText = (
  nt: NoteTimeline,
  newText: string
): NoteTimeline => {
  const current = getNewestLocalState(nt);
  if (!current) {
    console.error('moveNote called on Timeline with both states null');
    return nt;
  } else {
    return {
      ...nt,
      drafts: nt.drafts.concat(
        newPatch({
          ...current,
          text: newText
        })
      )
    };
  }
};

export const moveNote = (
  nt: NoteTimeline,
  newPos: Coordinates
): NoteTimeline => {
  const current = nt.drafts ?? nt.commited;
  if (!current) {
    return nt;
    console.error('moveNote called on Timeline with both states null');
  } else {
    return {
      ...nt,
      drafts: {
        ...current,
        position: newPos
      }
    };
  }
};
