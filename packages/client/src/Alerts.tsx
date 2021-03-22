import React, { CSSProperties } from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useSnapshot } from 'valtio';
import { alertsState, actions as alertsActions } from './store/alerts';

const Alerts = () => {
  const state = useSnapshot(alertsState);
  const styles: { [key: string]: CSSProperties } = {
    container: {
      width: 300,
      position: 'absolute'
    },

    popup: {
      margin: 10
    }
  };

  const handleClose = alertsActions.removeAlert;

  return (
    <div style={styles.container}>
      {state.alerts.map((alert, idx) => (
        <div key={idx} style={styles.popup}>
          <Alert severity={alert.level} onClose={() => handleClose(idx)}>
            <AlertTitle>{alert.title}</AlertTitle>
            {alert.message}
          </Alert>
        </div>
      ))}
    </div>
  );
};

export default Alerts;
