import React, { useEffect, useState } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { UUID, Note } from '../../types';

interface NoteProps {
  save: (id: UUID, content: string) => void;
  delete: (id: UUID) => void;
  note: Note;
}

const StickyNote: React.FunctionComponent<NoteProps> = props => {
  const { note } = props;

  const deleteNote = () => {
    props.delete(note.id);
  };

  const style = {
    top: note.position.y,
    left: note.position.x
  };

  return (
    <div style={style} className="stickyNote">
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
  );
};

export default StickyNote;
