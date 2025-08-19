"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Play, Pause, RotateCcw, Plus, Minus, Loader2, Settings } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FactorySwitcher } from '@/components/factory-switcher'
import { useFactory } from '@/contexts/factory-context'
import { generateOrders, deleteAllAuftraege } from '@/app/actions/auftrag.actions'
import { Simulation } from '@/components/simulation'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SiteHeader() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1])
  const [orderCount, setOrderCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [autoOrders, setAutoOrders] = useState(false)
  const [simulationTime, setSimulationTime] = useState(new Date())
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [minThreshold, setMinThreshold] = useState(30) // Minimum-Schwelle für Auto-Aufträge
  const [batchSize, setBatchSize] = useState(20) // Batch-Größe für Auto-Aufträge
  const { activeFactory } = useFactory()
  const pathname = usePathname()
  const isConfigurator = pathname.startsWith('/factory-configurator/')

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = async () => {
    setShowResetDialog(true)
  }

  const handleConfirmReset = async () => {
    if (!activeFactory) {
      toast.error('Keine Factory ausgewählt')
      return
    }

    setResetting(true)
    try {
      // Delete all orders for this factory
      const result = await deleteAllAuftraege(activeFactory.id)
      if (result.success) {
        // Reset simulation
        setIsPlaying(false)
        setSimulationTime(new Date())
        toast.success('Simulation und Aufträge zurückgesetzt')
      } else {
        toast.error(result.error || 'Fehler beim Zurücksetzen')
      }
    } catch (error) {
      console.error('Error resetting simulation:', error)
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setResetting(false)
      setShowResetDialog(false)
    }
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value)
  }

  const handleIncreaseOrders = () => {
    setOrderCount(prev => Math.min(prev + 10, 100)) // Max 100 orders
  }

  const handleDecreaseOrders = () => {
    setOrderCount(prev => Math.max(prev - 10, 10)) // Min 10 orders
  }

  const handleGenerateOrders = async () => {
    if (!activeFactory) {
      toast.error('Keine Factory ausgewählt')
      return
    }

    setGenerating(true)
    try {
      const result = await generateOrders(activeFactory.id, orderCount)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || 'Fehler beim Erstellen der Aufträge')
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((err: string) => toast.error(err))
        }
      }
    } catch (error) {
      console.error('Error generating orders:', error)
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-4 px-4">
        <FactorySwitcher />
        <div className="flex-1" />
        
        <div className="flex items-center gap-6">
          {!isConfigurator && (
            <>
              {/* Order Generation Controls */}
              <div className="flex items-center gap-2 border-r pr-4 mr-4">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={handleDecreaseOrders}
                  disabled={orderCount <= 10 || generating}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="min-w-[3rem] text-center font-medium">
                  {orderCount}
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={handleIncreaseOrders}
                  disabled={orderCount >= 100 || generating}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateOrders}
                  disabled={generating || !activeFactory}
                  className="ml-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Erstelle...
                    </>
                  ) : (
                    'Aufträge erstellen'
                  )}
                </Button>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-4">
              {/* Auto-Aufträge Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="auto-orders"
                      checked={autoOrders}
                      onCheckedChange={(checked) => setAutoOrders(checked as boolean)}
                    />
                    <Label 
                      htmlFor="auto-orders" 
                      className="text-sm cursor-pointer"
                      title="Automatisch neue Aufträge erstellen"
                    >
                      Auto-Aufträge
                    </Label>
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Auto-Aufträge Einstellungen</h4>
                      <p className="text-sm text-muted-foreground">
                        Konfigurieren Sie die automatische Auftragserstellung
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="min-threshold">Minimum</Label>
                        <Input
                          id="min-threshold"
                          type="number"
                          value={minThreshold}
                          onChange={(e) => setMinThreshold(Number(e.target.value))}
                          className="col-span-2 h-8"
                          disabled={isPlaying}
                          min={1}
                          max={100}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Wenn weniger als {minThreshold} Aufträge in Auftragsannahme
                      </p>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="batch-size">Batch-Größe</Label>
                        <Input
                          id="batch-size"
                          type="number"
                          value={batchSize}
                          onChange={(e) => setBatchSize(Number(e.target.value))}
                          className="col-span-2 h-8"
                          disabled={isPlaying}
                          min={1}
                          max={50}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Erstelle {batchSize} neue Aufträge
                      </p>
                    </div>
                    {isPlaying && (
                      <p className="text-xs text-amber-600">
                        Pausieren Sie die Simulation um die Werte zu ändern
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handlePlayPause}
                className="h-8 w-8 p-0"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleRestart}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              {/* Digitale Uhr */}
              <div className="bg-muted rounded px-3 py-1 font-mono text-sm font-medium">
                {simulationTime.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
                {' '}
                {simulationTime.toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Speed:</span>
                <Slider
                  value={speed}
                  onValueChange={handleSpeedChange}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground w-8">{speed[0]}x</span>
              </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Simulation Component */}
      {activeFactory && !isConfigurator && (
        <Simulation
          factoryId={activeFactory.id}
          isPlaying={isPlaying}
          speed={speed[0]}
          autoOrders={autoOrders}
          minThreshold={minThreshold}
          batchSize={batchSize}
          onTimeUpdate={setSimulationTime}
        />
      )}

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simulation zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion wird die Simulation zurücksetzen und <strong>alle Aufträge dieser Factory löschen</strong>. 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReset}
              disabled={resetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {resetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lösche...
                </>
              ) : (
                'Zurücksetzen & Löschen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}