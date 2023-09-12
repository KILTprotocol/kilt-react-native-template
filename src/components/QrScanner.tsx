import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, Button, Dimensions, TouchableOpacity } from 'react-native'
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner'
import styles from '../styles/styles'

export default function QrScanner({ navigation, route }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [type, setType] = useState<any>(BarCodeScanner.Constants.Type.back)
  const [scanned, setScanned] = useState<boolean>(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = (scanningResult: BarCodeScannerResult) => {
    if (!scanned) {
      const { type, data = {} } = scanningResult

      setScanned(true)
      navigation.navigate({ name: 'TokenSender', params: { scanAddress: data }, merge: true })
      alert(`Bar code with type ${type} and data ${data} has been scanned!`)
    }
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        type={type}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        style={[StyleSheet.absoluteFillObject, styles.container]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'flex-end',
            }}
            onPress={() => {
              setType(
                type === BarCodeScanner.Constants.Type.back
                  ? BarCodeScanner.Constants.Type.front
                  : BarCodeScanner.Constants.Type.back
              )
            }}
          >
            <Text style={{ fontSize: 18, margin: 5, color: 'white' }}> Flip </Text>
          </TouchableOpacity>
        </View>

        {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
      </BarCodeScanner>
    </View>
  )
}
