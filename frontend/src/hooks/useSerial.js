import { useState, useRef, useCallback } from 'react'

const BAUD_RATE = 115200
const LINE_RE = /Pull:\s*([\d.]+)\s*kg/

export function useSerial(onReading) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const portRef = useRef(null)
  const readerRef = useRef(null)
  const writerRef = useRef(null)
  const bufferRef = useRef('')
  const onReadingRef = useRef(onReading)
  onReadingRef.current = onReading

  const connect = useCallback(async () => {
    setError(null)
    try {
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate: BAUD_RATE })
      portRef.current = port

      writerRef.current = port.writable.getWriter()

      const decoder = new TextDecoderStream()
      port.readable.pipeTo(decoder.writable)
      const reader = decoder.readable.getReader()
      readerRef.current = reader

      ;(async () => {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            bufferRef.current += value
            const lines = bufferRef.current.split('\n')
            bufferRef.current = lines.pop()
            for (const line of lines) {
              const m = line.match(LINE_RE)
              if (m) onReadingRef.current(parseFloat(m[1]))
            }
          }
        } catch {
          // port closed
        } finally {
          setConnected(false)
        }
      })()

      setConnected(true)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      readerRef.current?.cancel()
      writerRef.current?.releaseLock()
      await portRef.current?.close()
    } catch {}
    setConnected(false)
  }, [])

  const sendCommand = useCallback(async (cmd) => {
    if (!writerRef.current) return
    await writerRef.current.write(new TextEncoder().encode(cmd))
  }, [])

  return { connected, error, connect, disconnect, sendCommand }
}
