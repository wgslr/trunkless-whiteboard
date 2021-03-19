import React, { CSSProperties } from 'react';

function Topbar(props: { h: number }) {
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
  return (
    <div style={styles.container}>
      <span style={{ ...styles.text, margin: '0 auto' }}>
        Trunkless Whiteboard
      </span>
      <span style={styles.text}>v0.0</span>
    </div>
  );
}

export default Topbar;
