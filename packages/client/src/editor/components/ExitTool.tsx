import Button from '@material-ui/core/Button';
import ExitIcon from '@material-ui/icons/ExitToApp';
import React from 'react';

interface Props {
  onClick: () => any;
}

const ExitTool: React.FunctionComponent<Props> = props => (
  <Button
    {...props}
    variant="contained"
    aria-label="exit"
    style={{ position: 'absolute', right: 0, bottom:0}}
  >
    <ExitIcon />
  </Button>
);

export default ExitTool;
