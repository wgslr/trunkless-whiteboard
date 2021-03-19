import React, { useEffect, useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import DeleteIcon from '@material-ui/icons/Delete';
import { UUID, Note } from '../../types';

interface NoteProps {
  save: (id: UUID, content: string) => void;
  delete: (id: UUID) => void;
  move: (id: UUID, x: number, y: number) => void;
  note: Note;
}

const StickyNote: React.FunctionComponent<NoteProps> = props => {
  const { note } = props;

  const onMove = (e: DraggableEvent, d: DraggableData) => {
    e.preventDefault();
    props.move(note.id, d.x, d.y);
  };

  const deleteNote = () => {
    props.delete(note.id);
  };

  const style = {
    top: note.position.y,
    left: note.position.x
  };

  return (
    <Draggable 
      position={{x: note.position.x, y: note.position.y}}
      onDrag={(e,d) => onMove(e,d)}
      onStop={(e,d) => onMove(e,d)}>
      <div className="stickyNote">
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
      </div>
    </Draggable>
  );
};

export default StickyNote;
