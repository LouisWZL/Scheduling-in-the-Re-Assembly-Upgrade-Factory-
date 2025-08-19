'use client'

import { useEffect, useRef, useState } from 'react'
import { processSimulationStep, createAutoOrders } from '@/app/actions/simulation.actions'
import { toast } from 'sonner'

interface SimulationProps {
  factoryId: string
  isPlaying: boolean
  speed: number
  autoOrders: boolean
  minThreshold: number
  batchSize: number
  onTimeUpdate: (time: Date) => void
}

export function Simulation({
  factoryId,
  isPlaying,
  speed,
  autoOrders,
  minThreshold,
  batchSize,
  onTimeUpdate
}: SimulationProps) {
  const [simulationTime, setSimulationTime] = useState(new Date())
  const [lastProcessedHour, setLastProcessedHour] = useState(-1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const processCounterRef = useRef(0)
  const isProcessingRef = useRef(false)
  
  // Berechne Intervall basierend auf Speed
  // 1 Tag = 12 Sekunden bei Speed 1x
  // 1 Stunde = 0.5 Sekunden bei Speed 1x
  const hourInMs = 500 / speed // 500ms = 0.5 Sekunden
  
  useEffect(() => {
    if (isPlaying) {
      // Starte Simulation
      intervalRef.current = setInterval(() => {
        setSimulationTime(prev => {
          const newTime = new Date(prev)
          newTime.setHours(newTime.getHours() + 1)
          return newTime
        })
      }, hourInMs)
    } else {
      // Stoppe Simulation
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, hourInMs])
  
  // Update parent component with current time
  useEffect(() => {
    onTimeUpdate(simulationTime)
  }, [simulationTime, onTimeUpdate])
  
  // Prozessiere Simulationsschritte alle 2 Stunden
  useEffect(() => {
    // Nur verarbeiten wenn Simulation läuft und nicht bereits ein Prozess läuft
    if (!isPlaying || isProcessingRef.current) return
    
    const currentHour = simulationTime.getHours()
    
    // Prüfe ob 2 Stunden vergangen sind für Simulationslogik
    if (currentHour !== lastProcessedHour && currentHour % 2 === 0) {
      setLastProcessedHour(currentHour)
      processCounterRef.current++
      isProcessingRef.current = true
      
      // Führe Simulationsschritt aus mit dynamischen Werten
      processSimulationStep(factoryId, simulationTime, autoOrders, minThreshold, batchSize)
        .then(result => {
          if (result.success) {
            if (result.updates && result.updates > 0) {
              console.log(`Simulation: ${result.message}`)
            }
          } else {
            console.error('Simulationsfehler:', result.error)
          }
        })
        .catch(error => {
          console.error('Fehler bei Simulationsschritt:', error)
        })
        .finally(() => {
          isProcessingRef.current = false
        })
    }
  }, [simulationTime, isPlaying, factoryId, autoOrders, minThreshold, batchSize, lastProcessedHour])
  
  // Reset bei Stop
  useEffect(() => {
    if (!isPlaying) {
      setLastProcessedHour(-1)
      processCounterRef.current = 0
      isProcessingRef.current = false // Stelle sicher, dass keine Prozesse mehr laufen
    }
  }, [isPlaying])
  
  // Sofort Auto-Aufträge erstellen wenn Checkbox aktiviert wird
  useEffect(() => {
    // Nur beim Aktivieren (false -> true), nicht bei jedem Render
    if (autoOrders) {
      createAutoOrders(factoryId, minThreshold, batchSize)
        .then(result => {
          if (result.success && result.created && result.created > 0) {
            console.log(`Auto-Aufträge beim Aktivieren: ${result.message}`)
          }
        })
        .catch(error => {
          console.error('Fehler bei Auto-Aufträgen:', error)
        })
    }
  }, [autoOrders]) // factoryId entfernt, um nicht bei Factory-Wechsel zu triggern
  
  return null // Diese Komponente rendert nichts, steuert nur die Logik
}