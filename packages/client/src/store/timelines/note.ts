import { v4 } from 'uuid';
import type { Note, Coordinates, UUID } from '../../types';

// TODO functions below should probably validate
// that after 'deleted' there can't be newer patches
type Diff = Partial<Omit<Note, 'id'>> | 'deleted';

type Patch = {
  changeId: UUID;
  diff: Diff;
};

export type NoteTimeline = {
  noteId: UUID;
  commited: Note | null;
  patches: Patch[];
};

const newPatch = (diff: Diff): Patch => ({
  changeId: v4(),
  diff
});

export const getNewestLocalState = (nt: NoteTimeline): Note | null => {
  // Flattens information about the note, going from newest patch to oldest

  const current: Partial<Note> = { id: nt.noteId };
  const patchesReverse = [...nt.patches.map(p => p.diff)].reverse();
  if (nt.commited) {
    patchesReverse.push(nt.commited); // lowest priority
  }

  for (const diff of patchesReverse) {
    if (diff === 'deleted') {
      return null;
    }
    if (diff.position !== undefined && current.position === undefined) {
      current.position = diff.position;
    }
    if (diff.text !== undefined && current.text === undefined) {
      current.text = diff.text;
    }

    if (current.text !== undefined && current.position !== undefined) {
      return current as Note;
    }
  }
  return null;
};

export const newNoteTimeline = (initial: Note): NoteTimeline => ({
  noteId: initial.id,
  commited: null,
  patches: [newPatch(initial)]
});

export const modifyText = (nt: NoteTimeline, newText: string): NoteTimeline => {
  return {
    ...nt,
    patches: nt.patches.concat(newPatch({ text: newText }))
  };
};

export const modifyPositiion = (
  nt: NoteTimeline,
  newPosition: Coordinates
): NoteTimeline => {
  return {
    ...nt,
    patches: nt.patches.concat(newPatch({ position: newPosition }))
  };
};

export const modifyDelete = (nt: NoteTimeline): NoteTimeline => ({
  ...nt,
  patches: nt.patches.concat(newPatch('deleted'))
});

export const setCommited = (
  nt: NoteTimeline,
  commited: NoteTimeline['commited']
): NoteTimeline => ({
  ...nt,
  commited
});

export const discardPatch = (
  nt: NoteTimeline,
  changeId: Patch['changeId']
): NoteTimeline => ({
  ...nt,
  patches: nt.patches.filter(p => p.changeId !== changeId)
});
