"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { FactorySwitcher } from '@/components/factory-switcher'

export function SiteHeader() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1])
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

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-4 px-4">
        <FactorySwitcher />
        <div className="flex-1" />
        
        <div className="flex items-center gap-6">
          {!isConfigurator && (
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
          )}
        </div>
      </div>
    </header>
  )
}