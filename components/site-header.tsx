"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, RotateCcw, Plus, Minus, Loader2 } from 'lucide-react'
import { FactorySwitcher } from '@/components/factory-switcher'
import { useFactory } from '@/contexts/factory-context'
import { generateOrders } from '@/app/actions/auftrag.actions'
import { toast } from 'sonner'

export function SiteHeader() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1])
  const [orderCount, setOrderCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const { activeFactory } = useFactory()
  const pathname = usePathname()
  const isConfigurator = pathname.startsWith('/factory-configurator/')

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setIsPlaying(false)
    // Add your restart logic here
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
        // Trigger refresh event
        window.dispatchEvent(new Event('ordersGenerated'))
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
    </header>
  )
}