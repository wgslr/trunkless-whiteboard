import React from 'react';
import Button from '@material-ui/core/Button';
import UndoIcon from '@material-ui/icons/Undo';

interface UndoProps {
  onClick: () => void;
}

const UndoTool: React.FunctionComponent<UndoProps> = props => (
  <Button {...props} variant="contained" aria-label="undo">
    <UndoIcon />
  </Button>
);

export default UndoTool;
