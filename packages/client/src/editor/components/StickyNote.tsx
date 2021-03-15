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

  const [isEditing, setIsEditing] = useState(false);

  // TODO this won't recevie update correctly when the note text
  // changes not because of this form, but becaus of an update from server
  const [newText, setNewText] = useState(note.text);

  const edit = () => {
    setIsEditing(true);
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEditing(false);
    props.save(note.id, newText);
  };

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
      {isEditing ? (
        <form onSubmit={save}>
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
          <button type="submit">Save</button>
        </form>
      ) : (
        <>
          <p>{note.text}</p>
          <button onClick={edit}>
            <EditIcon />
          </button>
          <button onClick={deleteNote}>
            <DeleteIcon />
          </button>
        </>
      )}
    </div>
  );
};

export default StickyNote;
