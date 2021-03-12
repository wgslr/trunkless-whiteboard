import React, { useEffect, useState } from 'react';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { UUID } from '../../types';

export interface NoteProps {
  id: UUID;
  get: (id: UUID) => string;
  save: (content: string, id: UUID) => void;
  delete: (id: UUID) => void;
}
interface NoteState {
  editing: boolean;
  _newText: string;
}

const noteStyle = {
  width: '200px',
  height: '100px',
  backgroundColor: '#f2d233',
  transform: 'translate(400px,400px)'
};

const StickyNote: React.FunctionComponent<NoteProps> = props => {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState('');

  const edit = () => {
    setIsEditing(true);
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewText(event.currentTarget.value);
    setIsEditing(false);
  };

  const deleteNote = () => {
    props.delete(props.id);
  };

  useEffect(() => {
    props.save(newText, props.id);
  }, [newText]);

  if (isEditing) {
    return (
      <div style={noteStyle}>
        <form onSubmit={save}>
          <input type="text" />
          <button type="submit">Save</button>
        </form>
      </div>
    );
  } else {
    return (
      // Add styling for note div
      <div style={noteStyle}>
        <p>{props.get(props.id)}</p>
        <button onClick={edit}>
          <EditIcon />
        </button>
        <button onClick={deleteNote}>
          <DeleteIcon />
        </button>
      </div>
    );
  }
};

export default StickyNote;
