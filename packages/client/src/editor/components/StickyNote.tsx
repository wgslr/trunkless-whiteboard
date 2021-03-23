import DeleteIcon from '@material-ui/icons/Delete';
import React, { useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useSnapshot } from 'valtio';
import { getUsername, usersState } from '../../store/users';
import { Note, UUID } from '../../types';

interface NoteProps {
  save: (id: UUID, content: string) => void;
  delete: (id: UUID) => void;
  move: (id: UUID, x: number, y: number) => void;
  note: Note;
}

const StickyNote: React.FunctionComponent<NoteProps> = props => {
  const users = useSnapshot(usersState);
  const childRef = useRef(null);
  const { note } = props;
  const creatorId = note.creatorId;
  let creatorName = undefined;
  if (creatorId) {
    creatorName = getUsername(creatorId, users) || creatorId;
  }

  const onMove = (e: DraggableEvent, d: DraggableData) => {
    e.preventDefault();
    props.move(note.id, d.x, d.y);
  };

  const deleteNote = () => {
    props.delete(note.id);
  };

  return (
    <Draggable
      position={{ x: note.position.x, y: note.position.y }}
      onDrag={(e, d) => onMove(e, d)}
      onStop={(e, d) => onMove(e, d)}
      nodeRef={childRef}
    >
      <div className="stickyNote" ref={childRef}>
        <textarea
          onChange={e => props.save(note.id, e.target.value)}
          value={note.text}
        />
        <span
          className="delete"
          title="Delete"
          onClick={e => {
            e.preventDefault();
            deleteNote();
          }}
        >
          <DeleteIcon />
        </span>
        <div className="noteCreator">created by: {creatorName}</div>
      </div>
    </Draggable>
  );
};

export default StickyNote;
