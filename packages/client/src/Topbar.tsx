import React, { CSSProperties } from 'react';
import { useSnapshot } from 'valtio';
import { clientState, ConnectionState } from './store/auth';

const shouldDisplayWhiteBoardID = ({ state }: ConnectionState) =>
  ['WHITEBOARD_USER', 'WHITEBOARD_HOST', 'PENDING_APPROVAL'].includes(state);

const Topbar = (props: { h: number }) => {
  const cState = useSnapshot(clientState);
  const styles: { [key: string]: CSSProperties } = {
    container: {
      height: props.h,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between', // center, space-around
      paddingLeft: 10,
      paddingRight: 10,
      backgroundColor: 'rgb(79, 147, 234)',
      boxShadow: '0 -10px 10px 20px #868686',
      marginBottom: '20px'
    },

    text: {
      color: '#000000',
      fontSize: 20
    }
  };
  const title = shouldDisplayWhiteBoardID(cState.v)
    // @ts-ignore: type predicating the function is icky
    ? `whiteboard : ${cState.v.whiteboardId}`
    : `whiteboard`;
  return (
    <div style={styles.container}>
      <span style={{ ...styles.text, margin: '0 auto' }}>{title}</span>
      <span style={styles.text}>v0.0</span>
    </div>
  );
};

export default Topbar;
