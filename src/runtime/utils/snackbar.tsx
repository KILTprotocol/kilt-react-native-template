import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Text, View, Button, Platform, Alert } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export type NotificationsProps = Alert & {
  open: boolean
  handleClose: () => void
  message: string
  severity?: AlertColor
}

export default function Snackbar(props: NotificationsProps): JSX.Element {
  return (
    <Notifications open={props.open} autoHideDuration={6000} onClose={props.handleClose}>
      <Alert onClose={props.handleClose} severity={props.severity ?? 'info'} sx={{ width: '100%' }}>
        {props.message}
      </Alert>
    </Notifications>
  )
}
