import React from 'react'
import { Text, View, Button } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer'

const Drawer = createDrawerNavigator()

export function AppDrawer(): JSX.Element {
  return (
    <Drawer.Navigator initialRouteName="App">
      {/* <Drawer.Screen component={}/>rr */}
    </Drawer.Navigator>
  )
}
