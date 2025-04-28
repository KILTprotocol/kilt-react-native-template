import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import styles from '../styles/styles'
import { CommonActions } from '@react-navigation/native'
type props = {
  handleScannerAddress: (scannedAddress: string) => void
}

export default function QrScanner({ navigation }, props) {
  const [hasPermission, setHasPermission] = useState()
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    handleBarCodeScanned(data)
    alert(`Bar code with type ${type} and data ${data} has been scanned!`)
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(CommonActions.goBack())
        }}
      >
        <Text>Go back</Text>
      </TouchableOpacity>
    </View>
  )
}
