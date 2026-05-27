import { useState, useRef, useCallback } from 'react'

const SERVICE_UUID     = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
const FORCE_CHAR_UUID  = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'
const COMMAND_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'

export function useBluetooth(onReading) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const deviceRef = useRef(null)
  const commandCharRef = useRef(null)
  const onReadingRef = useRef(onReading)
  onReadingRef.current = onReading

  const connect = useCallback(async () => {
    setError(null)
    try {
      const device = await navigator.bluetooth.requestDevice({
        // Match either by advertised service UUID or by name.
        // Service-based match is more reliable since names sometimes
        // get mangled at the advertising layer.
        filters: [
          { services: [SERVICE_UUID] },
          { name: 'Crimpmark' },
          { namePrefix: 'Crimp' },
        ],
        optionalServices: [SERVICE_UUID],
      })
      deviceRef.current = device
      device.addEventListener('gattserverdisconnected', () => {
        setConnected(false)
        commandCharRef.current = null
      })

      const server  = await device.gatt.connect()
      const service = await server.getPrimaryService(SERVICE_UUID)

      const forceChar   = await service.getCharacteristic(FORCE_CHAR_UUID)
      const commandChar = await service.getCharacteristic(COMMAND_CHAR_UUID)
      commandCharRef.current = commandChar

      forceChar.addEventListener('characteristicvaluechanged', (e) => {
        const kg = parseFloat(new TextDecoder().decode(e.target.value))
        if (!isNaN(kg)) onReadingRef.current(kg)
      })
      await forceChar.startNotifications()

      setConnected(true)
    } catch (e) {
      // User dismissed the device picker — not an error worth surfacing
      if (e.name === 'NotFoundError' || /cancelled/i.test(e.message)) return
      setError(e.message)
    }
  }, [])

  const disconnect = useCallback(() => {
    deviceRef.current?.gatt?.disconnect()
    setConnected(false)
  }, [])

  const sendCommand = useCallback(async (cmd) => {
    if (!commandCharRef.current) return
    await commandCharRef.current.writeValueWithoutResponse(new TextEncoder().encode(cmd))
  }, [])

  return { connected, error, connect, disconnect, sendCommand }
}
