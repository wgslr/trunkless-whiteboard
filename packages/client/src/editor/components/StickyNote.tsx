import React from 'react';
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
    _newText: string
}

const noteStyle = {
    width: '200px',
    height: '100px',
    backgroundColor: '#f2d233',
    transform: 'translate(400px,400px)'
}

class StickyNote extends React.Component<NoteProps, NoteState> {
    constructor(props: NoteProps) {
        super(props);
        this.state = {
            editing: false,
            _newText: '',
        }
        this.save = this.save.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.renderForm = this.renderForm.bind(this);
        this.renderDisplay = this.renderDisplay.bind(this);
    }

    edit() {
        this.setState({editing: true});
    }

    save(event: React.FormEvent<HTMLFormElement>) {
        this.setState({_newText: event.currentTarget.value})
        this.props.save(this.state._newText, this.props.id);
        this.setState({editing: false});
        event.preventDefault();
    }

    delete() {
        this.props.delete(this.props.id);
    }

    renderForm() {
        return(
            <div style={noteStyle}>
                    <form onSubmit={this.save}>
                        <input type='text'/>
                        <button type='submit'>Save</button>
                    </form>
            </div>
        )
    }

    renderDisplay() {
        return( // Add styling for note div
            <div style={noteStyle}>
                <p>{this.props.get(this.props.id)}</p>
                <button onClick={this.edit}><EditIcon/></button>
                <button onClick={this.delete}><DeleteIcon/></button>          
            </div>
        )
    }
    
    render() {
        return this.state.editing ? this.renderForm() : this.renderDisplay();
    }
}

export default StickyNote;