import React from 'react';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';

interface SaveProps {
  onClick: () => any;
}

const SaveTool: React.FunctionComponent<SaveProps> = props => (
  <Button {...props} variant="contained" aria-label="save">
    <GetAppIcon />
  </Button>
);

export default SaveTool;
