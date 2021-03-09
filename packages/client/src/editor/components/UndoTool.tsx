import React from 'react';
import Button from '@material-ui/core/Button';
import UndoIcon from '@material-ui/icons/Undo';

interface UndoProps {
    onClick: () => void
}

class UndoTool extends React.Component<UndoProps> {
    render () {
        return(
            <Button onClick={this.props.onClick} variant="contained" aria-label="undo">
                <UndoIcon />
            </Button>
        )
    }
}

export default UndoTool;