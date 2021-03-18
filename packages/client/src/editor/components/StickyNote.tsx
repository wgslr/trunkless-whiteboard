import React, { useEffect, useState, useRef } from 'react';
import EditIcon from '@material-ui/icons/Edit';
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

  const [mouseDown, setMouseDown] = useState(false);
  const [pos, setPos] = useState({x: note.position.x, y: note.position.y});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      //ref.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`; 
      ref.current.style.setProperty('left', (note.position.x + pos.x).toString());
      ref.current.style.setProperty('top', (note.position.y + pos.y).toString());
    }
    props.move(note.id, pos.x,  pos.y);
  }, [pos])

  const onMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mouseDown) {
      setPos({x: pos.x + e.movementX, y: pos.y + e.movementY});
    }
  };

  const deleteNote = () => {
    props.delete(note.id);
  };

  const style = {
    top: note.position.y,
    left: note.position.x
  };

  return (
    <div 
      ref={ref} 
      style={style} 
      className="stickyNote"
      onMouseMove={ (e) => onMouseMove(e) }
      onMouseDown={ () => setMouseDown(true) }
      onMouseUp={ () => setMouseDown(false) }>
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
