'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createBaugruppentyp, updateBaugruppentyp } from '@/app/actions/baugruppentyp.actions'

interface BaugruppentypFormProps {
  baugruppentyp?: {
    id: string
    bezeichnung: string
    beschreibung?: string | null
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function BaugruppentypForm({ baugruppentyp, onSuccess, onCancel }: BaugruppentypFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bezeichnung: baugruppentyp?.bezeichnung || '',
    beschreibung: baugruppentyp?.beschreibung || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result
      
      if (baugruppentyp) {
        result = await updateBaugruppentyp(baugruppentyp.id, {
          bezeichnung: formData.bezeichnung,
          beschreibung: formData.beschreibung || null
        })
      } else {
        result = await createBaugruppentyp({
          bezeichnung: formData.bezeichnung,
          beschreibung: formData.beschreibung || null
        })
      }

      if (result.success) {
        toast.success(result.message)
        if (onSuccess) onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {baugruppentyp ? 'Baugruppentyp bearbeiten' : 'Neuer Baugruppentyp'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bezeichnung">Bezeichnung *</Label>
            <Input
              id="bezeichnung"
              value={formData.bezeichnung}
              onChange={(e) => setFormData({ ...formData, bezeichnung: e.target.value })}
              placeholder="z.B. Karosserie"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
              placeholder="Optionale Beschreibung des Baugruppentyps"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Speichern...' : baugruppentyp ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}