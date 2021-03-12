import type { Note, Coordinates } from '../types';

type NoteTimeline = {
  commited: Note | null;
  draft: Note | null;
};

export const setDraftText = (
  nt: NoteTimeline,
  newText: string
): NoteTimeline => {
  const current = nt.draft ?? nt.commited;
  if (!current) {
    return nt;
    console.error('moveNote called on Timeline with both states null');
  } else {
    return {
      ...nt,
      draft: {
        ...current,
        text: newText
      }
    };
  }
};

export const moveNote = (
  nt: NoteTimeline,
  newPos: Coordinates
): NoteTimeline => {
  const current = nt.draft ?? nt.commited;
  if (!current) {
    return nt;
    console.error('moveNote called on Timeline with both states null');
  } else {
    return {
      ...nt,
      draft: {
        ...current,
        position: newPos
      }
    };
  }
};
