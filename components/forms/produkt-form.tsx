'use client'

import { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import { createProdukt, updateProdukt } from '@/app/actions/produkt.actions'

interface ProduktFormProps {
  produkt?: any
  factoryId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProduktForm({ produkt, factoryId, onSuccess, onCancel }: ProduktFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [bezeichnung, setBezeichnung] = useState(produkt?.bezeichnung || '')
  const [seriennummer, setSeriennummer] = useState(produkt?.seriennummer || '')
  const [glbFile, setGlbFile] = useState<File | null>(null)
  const [existingGlbFile, setExistingGlbFile] = useState(produkt?.glbFile || '')
  const [uploadProgress, setUploadProgress] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.glb')) {
        toast.error('Nur .glb Dateien sind erlaubt')
        return
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast.error('Datei ist zu groß. Maximal 50MB erlaubt.')
        return
      }
      setGlbFile(file)
    }
  }

  const uploadGlbFile = async (): Promise<string | null> => {
    if (!glbFile) return existingGlbFile || null

    setUploadProgress(true)
    const formData = new FormData()
    formData.append('file', glbFile)

    try {
      const response = await fetch('/api/upload/glb', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload fehlgeschlagen')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Fehler beim Hochladen der 3D-Datei')
      return null
    } finally {
      setUploadProgress(false)
    }
  }

  const deleteOldGlbFile = async (filename: string) => {
    try {
      const url = new URL('/api/upload/glb', window.location.origin)
      url.searchParams.append('filename', filename.split('/').pop() || '')
      
      await fetch(url, { method: 'DELETE' })
    } catch (error) {
      console.error('Error deleting old file:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bezeichnung.trim() || !seriennummer.trim()) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setIsLoading(true)

    try {
      // Upload new GLB file if selected
      let glbFileUrl = existingGlbFile
      if (glbFile) {
        const uploadedUrl = await uploadGlbFile()
        if (uploadedUrl) {
          // Delete old file if updating and new file uploaded
          if (produkt && existingGlbFile && existingGlbFile !== uploadedUrl) {
            await deleteOldGlbFile(existingGlbFile)
          }
          glbFileUrl = uploadedUrl
        }
      }

      const data = {
        bezeichnung: bezeichnung.trim(),
        seriennummer: seriennummer.trim(),
        glbFile: glbFileUrl
      }

      const result = produkt
        ? await updateProdukt(produkt.id, data)
        : await createProdukt(factoryId, data)

      if (result.success) {
        toast.success(result.message)
        onSuccess?.()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFile = () => {
    setGlbFile(null)
    setExistingGlbFile('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bezeichnung">Produktbezeichnung</Label>
        <Input
          id="bezeichnung"
          type="text"
          value={bezeichnung}
          onChange={(e) => setBezeichnung(e.target.value)}
          placeholder="z.B. Volkswagen Polo"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seriennummer">Seriennummer</Label>
        <Input
          id="seriennummer"
          type="text"
          value={seriennummer}
          onChange={(e) => setSeriennummer(e.target.value)}
          placeholder="z.B. VW-POLO-001"
          disabled={isLoading}
          required
        />
        <p className="text-sm text-muted-foreground">
          Die Seriennummer muss eindeutig sein
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="glbFile">3D-Objekt (optional)</Label>
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            id="glbFile"
            type="file"
            accept=".glb"
            onChange={handleFileChange}
            disabled={isLoading || uploadProgress}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground">
            Akzeptiertes Format: .glb - Kostenlose Modelle finden Sie auf{' '}
            <a 
              href="https://sketchfab.com/3d-models" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Sketchfab
            </a>
          </p>
          
          {(glbFile || existingGlbFile) && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <Upload className="h-4 w-4" />
              <span className="text-sm flex-1">
                {glbFile ? glbFile.name : 'Vorhandenes 3D-Modell'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isLoading || uploadProgress}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading || uploadProgress}
          className="flex-1"
        >
          {isLoading || uploadProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress ? 'Lade hoch...' : 'Speichern...'}
            </>
          ) : (
            produkt ? 'Aktualisieren' : 'Erstellen'
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || uploadProgress}
          >
            Abbrechen
          </Button>
        )}
      </div>
    </form>
  )
}