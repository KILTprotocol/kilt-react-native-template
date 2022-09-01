import React, { useState, useEffect } from 'react'
import { Text, StyleSheet } from 'react-native'
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner'

export default function QRScanner({
  onBarCodeScanned,
}: {
  onBarCodeScanned: BarCodeScannedCallback
}) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <>
      <BarCodeScanner onBarCodeScanned={onBarCodeScanned} style={StyleSheet.absoluteFillObject} />
    </>
  )
}
