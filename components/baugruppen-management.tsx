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
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteDialog } from '@/components/delete-dialog'
import { BaugruppentypDialog } from '@/components/dialogs/baugruppentyp-dialog'
import { BaugruppeDialog } from '@/components/dialogs/baugruppe-dialog'
import { 
  getBaugruppentypen, 
  deleteBaugruppentyp 
} from '@/app/actions/baugruppentyp.actions'
import { 
  getBaugruppen, 
  deleteBaugruppe 
} from '@/app/actions/baugruppe.actions'

export function BaugruppenManagement() {
  const [baugruppentypen, setBaugruppentypen] = useState<any[]>([])
  const [baugruppen, setBaugruppen] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [baugruppentypDialogOpen, setBaugruppentypDialogOpen] = useState(false)
  const [editingBaugruppentyp, setEditingBaugruppentyp] = useState<any>(null)
  const [baugruppeDialogOpen, setBaugruppeDialogOpen] = useState(false)
  const [editingBaugruppe, setEditingBaugruppe] = useState<any>(null)
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ type: 'baugruppentyp' | 'baugruppe', item: any } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [typenResult, baugruppenResult] = await Promise.all([
        getBaugruppentypen(),
        getBaugruppen()
      ])

      if (typenResult.success && typenResult.data) {
        setBaugruppentypen(typenResult.data)
      }
      if (baugruppenResult.success && baugruppenResult.data) {
        setBaugruppen(baugruppenResult.data)
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBaugruppentyp = async () => {
    if (!deletingItem || deletingItem.type !== 'baugruppentyp') return

    const result = await deleteBaugruppentyp(deletingItem.item.id)
    
    if (result.success) {
      toast.success(result.message)
      await loadData()
    } else {
      toast.error(result.error)
    }
    
    setDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  const handleDeleteBaugruppe = async () => {
    if (!deletingItem || deletingItem.type !== 'baugruppe') return

    const result = await deleteBaugruppe(deletingItem.item.id)
    
    if (result.success) {
      toast.success(result.message)
      await loadData()
    } else {
      toast.error(result.error)
    }
    
    setDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  const confirmDelete = (type: 'baugruppentyp' | 'baugruppe', item: any) => {
    setDeletingItem({ type, item })
    setDeleteDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setBaugruppentypDialogOpen(false)
    setBaugruppeDialogOpen(false)
    setEditingBaugruppentyp(null)
    setEditingBaugruppe(null)
    loadData()
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
        <h2 className="text-2xl font-bold">Baugruppen Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => {
            setEditingBaugruppentyp(null)
            setBaugruppentypDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Baugruppentyp erstellen
          </Button>
          <Button variant="outline" onClick={() => {
            setEditingBaugruppe(null)
            setBaugruppeDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Baugruppe erstellen
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <BaugruppentypDialog
        open={baugruppentypDialogOpen}
        onOpenChange={(open) => {
          setBaugruppentypDialogOpen(open)
          if (!open) setEditingBaugruppentyp(null)
        }}
        baugruppentyp={editingBaugruppentyp}
        onSuccess={handleFormSuccess}
      />

      <BaugruppeDialog
        open={baugruppeDialogOpen}
        onOpenChange={(open) => {
          setBaugruppeDialogOpen(open)
          if (!open) setEditingBaugruppe(null)
        }}
        baugruppe={editingBaugruppe}
        onSuccess={handleFormSuccess}
      />

      {/* Tables */}
      <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Baugruppentypen */}
          <Card>
            <CardHeader>
              <CardTitle>Baugruppentypen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Verwendung</TableHead>
                    <TableHead className="w-[100px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {baugruppentypen.map((typ) => (
                    <TableRow key={typ.id}>
                      <TableCell className="font-medium">{typ.bezeichnung}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {typ.beschreibung || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{typ.baugruppen?.length || 0} Baugruppen</div>
                          <div className="text-muted-foreground">{typ.produkte?.length || 0} Produkte</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingBaugruppentyp(typ)
                              setBaugruppentypDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => confirmDelete('baugruppentyp', typ)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Baugruppen */}
          <Card>
            <CardHeader>
              <CardTitle>Alle Baugruppen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bezeichnung</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Art</TableHead>
                      <TableHead>Art-Nr.</TableHead>
                      <TableHead className="w-[100px]">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {baugruppen.map((baugruppe) => (
                      <TableRow key={baugruppe.id}>
                        <TableCell className="font-medium">{baugruppe.bezeichnung}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {baugruppe.baugruppentyp?.bezeichnung || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {baugruppe.variantenTyp}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{baugruppe.artikelnummer}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingBaugruppe({
                                  ...baugruppe,
                                  baugruppentypId: baugruppe.baugruppentyp?.id || baugruppe.baugruppentypId
                                })
                                setBaugruppeDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => confirmDelete('baugruppe', baugruppe)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={
          deletingItem?.type === 'baugruppentyp' 
            ? handleDeleteBaugruppentyp 
            : handleDeleteBaugruppe
        }
        title={
          deletingItem?.type === 'baugruppentyp'
            ? 'Baugruppentyp löschen?'
            : 'Baugruppe löschen?'
        }
        description={
          deletingItem?.type === 'baugruppentyp'
            ? `Möchten Sie den Baugruppentyp "${deletingItem?.item?.bezeichnung}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
            : `Möchten Sie die Baugruppe "${deletingItem?.item?.bezeichnung}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
        }
      />
    </div>
  )
}