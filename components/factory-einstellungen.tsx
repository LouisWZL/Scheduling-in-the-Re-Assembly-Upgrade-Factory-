'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { updateFactoryName, updateFactoryCapacity, getFactory } from '@/app/actions/factory.actions'

interface FactoryEinstellungenProps {
  factoryId: string
}

export function FactoryEinstellungen({ factoryId }: FactoryEinstellungenProps) {
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingCapacity, setSavingCapacity] = useState(false)
  const [factoryData, setFactoryData] = useState<any>(null)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')

  useEffect(() => {
    loadFactoryData()
  }, [factoryId])

  const loadFactoryData = async () => {
    setLoading(true)
    try {
      const result = await getFactory(factoryId)
      if (result.success && result.data) {
        setFactoryData(result.data)
        setName(result.data.name)
        setCapacity(result.data.kapazität.toString())
      } else {
        toast.error('Fehler beim Laden der Factory-Daten')
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein')
      return
    }

    setSavingName(true)
    try {
      const result = await updateFactoryName(factoryId, name.trim())
      if (result.success) {
        toast.success(result.message)
        await loadFactoryData()
        // Trigger sidebar refresh
        window.dispatchEvent(new CustomEvent('factoryUpdated'))
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setSavingName(false)
    }
  }

  const handleUpdateCapacity = async () => {
    const capacityValue = parseInt(capacity)
    
    if (isNaN(capacityValue) || capacityValue < 1) {
      toast.error('Bitte geben Sie eine gültige Kapazität ein (mindestens 1)')
      return
    }

    setSavingCapacity(true)
    try {
      const result = await updateFactoryCapacity(factoryId, capacityValue)
      if (result.success) {
        toast.success(result.message)
        await loadFactoryData()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setSavingCapacity(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold mb-6">Factory Einstellungen</h2>
      
      <div className="grid gap-6 max-w-2xl">
        {/* Factory Name Card */}
        <Card>
          <CardHeader>
            <CardTitle>Factory Name</CardTitle>
            <CardDescription>
              Bearbeiten Sie den Namen Ihrer Factory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="factoryName">Name</Label>
              <Input
                id="factoryName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Stuttgart Factory"
                disabled={savingName}
              />
            </div>
            <Button 
              onClick={handleUpdateName}
              disabled={savingName || name === factoryData?.name}
              className="w-full sm:w-auto"
            >
              {savingName ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Factory Capacity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Factory Kapazität</CardTitle>
            <CardDescription>
              Die Kapazität der Factory gibt an, wie viele Produkte pro Tag in der Factory bearbeitet werden können. 
              Diese Einstellung beeinflusst die Produktionsplanung und Terminierung von Aufträgen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="factoryCapacity">Kapazität (Produkte pro Tag)</Label>
              <Input
                id="factoryCapacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="z.B. 50"
                min="1"
                disabled={savingCapacity}
              />
              <p className="text-sm text-muted-foreground">
                Aktuelle Auslastung: {factoryData?.auftraege?.length || 0} von {capacity} Aufträgen
              </p>
            </div>
            <Button 
              onClick={handleUpdateCapacity}
              disabled={savingCapacity || capacity === factoryData?.kapazität?.toString()}
              className="w-full sm:w-auto"
            >
              {savingCapacity ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}