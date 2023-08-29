import React from 'react'
import { Text, View, Button } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { NavigationContainer } from '@react-navigation/native'
import App from '../../../App'

const Drawer = createDrawerNavigator()

export interface AppDrawerEntry {
  name: string
  displayName: string
  screens: Array<{
    name: string
    displayName: string
    icon: () => JSX.Element
  }>
}

export interface AppDrawerProps {
  open: boolean
  entries: AppDrawerEntry[]
  variant: 'permanent' | 'persistent' | 'temporary' | undefined
  closeDrawer: () => void
  setScreen: (module: string, screen: string) => void
}

export function AppDrawer(): JSX.Element {
  return (
    <Drawer.Navigator initialRouteName="App">
      <Text>Nessie protects your Identity</Text>
      <Drawer.Screen name="App" component={App} />
      {/* {entries.map((entry) => {
            return (
              <React.Fragment key={entry.name}>
                <ListSubheader key={entry.name} component="div" id="nested-list-subheader">
                  {entry.displayName}
                </ListSubheader>
                {entry.screens.map((screen) => (
                  <ListItem key={screen.name} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setScreen(entry.name, screen.name)
                      }}
                    >
                      <ListItemIcon>
                        <screen.icon />
                      </ListItemIcon>
                      <ListItemText primary={screen.displayName} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </React.Fragment>
            )
          })} */}
    </Drawer.Navigator>
  )
}
