'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteDialog } from '@/components/delete-dialog'
import { ProduktDialog } from '@/components/dialogs/produkt-dialog'
import { ThreeViewer, ThreeViewerEmpty } from '@/components/three-viewer'
import { 
  getProdukte, 
  deleteProdukt 
} from '@/app/actions/produkt.actions'

interface ProduktManagementProps {
  factoryId: string
}

export function ProduktManagement({ factoryId }: ProduktManagementProps) {
  const [produkte, setProdukte] = useState<any[]>([])
  const [selectedProdukt, setSelectedProdukt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [produktDialogOpen, setProduktDialogOpen] = useState(false)
  const [editingProdukt, setEditingProdukt] = useState<any>(null)
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProdukt, setDeletingProdukt] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [factoryId])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getProdukte(factoryId)

      if (result.success && result.data) {
        setProdukte(result.data)
        // Select first product by default
        if (result.data.length > 0 && !selectedProdukt) {
          setSelectedProdukt(result.data[0])
        }
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Produkte')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProdukt = async () => {
    if (!deletingProdukt) return

    const result = await deleteProdukt(deletingProdukt.id)
    
    if (result.success) {
      toast.success(result.message)
      // If deleting the selected product, clear selection or select first
      if (selectedProdukt?.id === deletingProdukt.id) {
        const remainingProdukte = produkte.filter(p => p.id !== deletingProdukt.id)
        setSelectedProdukt(remainingProdukte.length > 0 ? remainingProdukte[0] : null)
      }
      await loadData()
    } else {
      toast.error(result.error)
    }
    
    setDeleteDialogOpen(false)
    setDeletingProdukt(null)
  }

  const confirmDelete = (produkt: any) => {
    setDeletingProdukt(produkt)
    setDeleteDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setProduktDialogOpen(false)
    setEditingProdukt(null)
    loadData()
  }

  const handleRowClick = (produkt: any) => {
    setSelectedProdukt(produkt)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6 gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produkt Manager</h2>
        <Button onClick={() => {
          setEditingProdukt(null)
          setProduktDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Produkt erstellen
        </Button>
      </div>

      {/* Dialogs */}
      <ProduktDialog
        open={produktDialogOpen}
        onOpenChange={(open) => {
          setProduktDialogOpen(open)
          if (!open) setEditingProdukt(null)
        }}
        produkt={editingProdukt}
        factoryId={factoryId}
        onSuccess={handleFormSuccess}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteProdukt}
        title="Produkt löschen"
        description={`Möchten Sie das Produkt "${deletingProdukt?.bezeichnung}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
      />

      {/* Content */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Produkte Table */}
        <Card>
          <CardHeader>
            <CardTitle>Produkte</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bezeichnung</TableHead>
                  <TableHead>Seriennummer</TableHead>
                  <TableHead className="w-[100px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produkte.map((produkt) => (
                  <TableRow 
                    key={produkt.id}
                    className={`cursor-pointer ${selectedProdukt?.id === produkt.id ? 'bg-muted/50' : ''}`}
                    onClick={() => handleRowClick(produkt)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {produkt.bezeichnung}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {produkt.seriennummer}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProdukt(produkt)
                            setProduktDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDelete(produkt)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {produkte.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Keine Produkte vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produkt Details */}
        <Card>
          <CardHeader>
            <CardTitle>Produktdetails</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProdukt ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedProdukt.bezeichnung}</h3>
                  <p className="text-sm text-muted-foreground">
                    Seriennummer: {selectedProdukt.seriennummer}
                  </p>
                </div>

                {/* 3D Model Viewer */}
                <div className="h-[400px]">
                  {selectedProdukt.glbFile ? (
                    <ThreeViewer glbUrl={selectedProdukt.glbFile} />
                  ) : (
                    <ThreeViewerEmpty />
                  )}
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Weitere Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Varianten:</span>
                        <Badge variant="outline">{selectedProdukt.varianten?.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Baugruppentypen:</span>
                        <Badge variant="outline">{selectedProdukt.baugruppentypen?.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Erstellt am:</span>
                        <span className="text-sm">
                          {new Date(selectedProdukt.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedProdukt.baugruppentypen?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Zugeordnete Baugruppentypen</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProdukt.baugruppentypen.map((typ: any) => (
                          <Badge key={typ.id} variant="secondary">
                            {typ.bezeichnung}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Wählen Sie ein Produkt aus der Tabelle aus
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}