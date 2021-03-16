import { v4 } from 'uuid';
import type { Note, Coordinates, UUID } from '../../types';

// TODO functions below should probably validate
// that after 'deleted' there can't be newer patches
type Diff = Partial<Omit<Note, 'id'>> | 'deleted';

type Patch = {
  id: UUID;
  diff: Diff;
};

type Result = {
  timeline: NoteTimeline;
  patchId: Patch['id'];
  figureId: UUID;
};

export type NoteTimeline = {
  figureId: UUID;
  committed: Note | null;
  patches: Patch[];
};

const newPatch = (diff: Diff): Patch => ({
  id: v4(),
  diff
});

export const getEffectiveNote = (nt: NoteTimeline): Note | null => {
  // Flattens information about the note, going from newest patch to oldest

  const current: Partial<Note> = { id: nt.figureId };
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
  figureId: initial.id,
  committed: initial,
  patches: []
});

export const newLocalNoteTimeline = (initial: Note): Result => {
  const patch = newPatch(initial);
  const noteTimeline: NoteTimeline = {
    figureId: initial.id,
    committed: null,
    patches: [patch]
  };
  return {
    timeline: noteTimeline,
    patchId: patch.id,
    figureId: initial.id
  };
};

export const patchText = (nt: NoteTimeline, newText: string): Result => {
  const patch = newPatch({ text: newText });
  const timeline = {
    ...nt,
    patches: nt.patches.concat(patch)
  };
  return {
    figureId: nt.figureId,
    patchId: patch.id,
    timeline
  };
};

export const patchPosition = (
  nt: NoteTimeline,
  newPosition: Coordinates
): NoteTimeline => {
  return {
    ...nt,
    patches: nt.patches.concat(newPatch({ position: newPosition }))
  };
};

export const patchDeleteNote = (nt: NoteTimeline): Result => {
  const patch = newPatch('deleted');
  const timeline = {
    ...nt,
    patches: nt.patches.concat(patch)
  };
  return {
    timeline,
    figureId: nt.figureId,
    patchId: patch.id
  };
};

export const setCommitted = (
  nt: NoteTimeline,
  committed: NoteTimeline['committed']
): NoteTimeline => ({
  ...nt,
  committed
});

export const discardPatch = (
  nt: NoteTimeline,
  changeId: Patch['id']
): NoteTimeline => ({
  ...nt,
  patches: nt.patches.filter(p => p.id !== changeId)
});
