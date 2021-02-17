// Topbar with react-native
// https://jeffgukang.github.io/react-native-tutorial/docs/sample-apps/coininfo-list/05-top-bar/topbar.html

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import logo from './trunkless.svg'

function Topbar(props: {h: number}) {
  const styles = StyleSheet.create({
    container: {
      alignSelf: 'stretch',
      height: props.h,
      flexDirection: 'row', // row
      backgroundColor: 'gray',
      alignItems: 'center',
      justifyContent: 'space-between', // center, space-around
      paddingLeft: 10,
      paddingRight: 10
    },
    text: {
      color: '#000000'
    }
  })
  return (
    <View style={styles.container}>
      <img height={props.h} src={logo} alt="logo"/>
      <Text style={styles.text}>Trunkless Whiteboard</Text>
      <Text style={styles.text}>v0.0</Text>
    </View>
  );
}

export default Topbar