import { proxy } from 'valtio';
import { Color as AlertSeverity } from '@material-ui/lab';

type Alert = {
  title: string;
  message?: string;
  level: AlertSeverity;
};

export const alertsState = proxy<{ alerts: Alert[] }>({
  alerts: []
});

export const actions = {
  addAlert(newAlert: Alert) {
    alertsState.alerts.push(newAlert);
  },
  removeAlert(index: number) {
    alertsState.alerts.splice(index, 1);
  }
};
