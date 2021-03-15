import React, { useEffect, useState } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { UUID, Note } from '../../types';

interface NoteProps {
  save: (id: UUID, content: string) => void;
  delete: (id: UUID) => void;
  note: Note;
}

const noteStyle = {
  width: '200px',
  height: '100px',
  backgroundColor: '#f2d233'
  // transform: 'translate(400px,400px)'
};

const StickyNote: React.FunctionComponent<NoteProps> = props => {
  const { note } = props;

  const deleteNote = () => {
    props.delete(note.id);
  };

  const style = {
    ...noteStyle,
    top: note.position.y,
    left: note.position.x
  };

  return (
    <div style={style} className="stickyNote">
      <input
        type="text"
        value={note.text}
        onChange={e => props.save(note.id, e.target.value)}
      />
      <button onClick={deleteNote}>
        <DeleteIcon />
      </button>
    </div>
  );
};

export default StickyNote;
