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
  committed: Note | null;
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
  if (nt.committed) {
    patchesReverse.push(nt.committed); // lowest priority
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
      console.debug(
        `Processed note '${current.text}' timeline with ${
          nt.committed ? 'non-null' : 'null'
        } commited state and ${nt.patches.length} patches`
      );
      return current as Note;
    }
  }
  return null;
};

export const newCommittedNoteTimeline = (initial: Note): NoteTimeline => ({
  noteId: initial.id,
  committed: initial,
  patches: []
});

export const newLocalNoteTimeline = (initial: Note): NoteTimeline => ({
  noteId: initial.id,
  committed: null,
  patches: [newPatch(initial)]
});

export const modifyText = (
  nt: NoteTimeline,
  newText: string
): [NoteTimeline, Patch['changeId']] => {
  const patch = newPatch({ text: newText });
  return [
    {
      ...nt,
      patches: nt.patches.concat(patch)
    },
    patch.changeId
  ];
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

export const setCommitted = (
  nt: NoteTimeline,
  committed: NoteTimeline['committed']
): NoteTimeline => ({
  ...nt,
  committed
});

export const discardPatch = (
  nt: NoteTimeline,
  changeId: Patch['changeId']
): NoteTimeline => ({
  ...nt,
  patches: nt.patches.filter(p => p.changeId !== changeId)
});
