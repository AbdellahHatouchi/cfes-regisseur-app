import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeildView } from '@/components/ui/feild-view'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import FiscalAttestationPDF from '@/components/pdf/fiscal-attestation'
import { CopyCheck, FileDown, Trash2, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { AlertModal } from '@/components/modals/alert-modal'
import { toast } from 'sonner'

type FiscalAttestation = {
  id: string
  type: boolean
  name: string
  ITP: string
  IF: string
  identity: string
  activite: string
  address: string
  attestationNumber: string
  createdAt: string
  updatedAt: string
}

export const Route = createFileRoute('/fiscal-attestations/$fiscalATId/view/')({
  component: ViewFiscalAttestation,
  loader: async ({ params }) => {
    const response = await window.electron.ipcRenderer.invoke(
      'getFiscalAttestationById',
      params.fiscalATId
    )
    if (response.success) {
      return response.data
    } else {
      throw new Error(response.message)
    }
  }
})

function ViewFiscalAttestation() {
  const [open, setOpen] = useState<boolean>(false)
  const [isPending, setIsPending] = useState<boolean>(false)
  const router = useRouter()
  const attestation = Route.useLoaderData() as FiscalAttestation

  const onDelete = async () => {
    try {
      setIsPending(true)
      const response = await window.electron.ipcRenderer.invoke(
        'deleteFiscalAttestation',
        attestation?.id
      )
      if (response.success) {
        alert('Suppression réussie')
        router.navigate({ to: '/' })
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'attestation fiscale:", error)
      alert("Erreur lors de la suppression de l'attestation fiscale")
    } finally {
      setIsPending(false)
    }
  }

  const handleCreateCopy = async () => {
    if (attestation) {
      try {
        setIsPending(false)
        const data = {
          type: Boolean(attestation.type),
          name: attestation.name,
          ITP: attestation.ITP,
          IF: attestation.IF,
          identity: attestation.identity,
          activite: attestation.activite,
          address: attestation.address
        }
        const response = await window.electron.ipcRenderer.invoke('createFiscalAttestation', data)

        if (response.success) {
          alert('Copie créée avec succès')
          toast.success('Copie créée avec succès')
          router.navigate({
            to: '/fiscal-attestations/$fiscalATId/view',
            params: { fiscalATId: response.data.dataValues.id }
          })
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error('Erreur lors de la création de la copie:', error)
        alert('Erreur lors de la création de la copie')
      } finally {
        setIsPending(false)
      }
    }
  }

  if (!attestation) {
    return <div>Loading...</div>
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending}
      />
      <div className="flex items-center justify-between">
        <Heading
          title="Détails de l'attestation fiscale"
          description="Voir les détails de l'attestation fiscale"
        />
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.navigate({ to: '/' })}>
            <Undo2 className="h-4 w-4 mr-1" />
            Arrière
          </Button>
          <PDFDownloadLink
            document={<FiscalAttestationPDF fiscalAttestation={attestation} />}
            fileName={`${attestation.attestationNumber}.pdf`}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            {({ loading }) => {
              return (
                <Button size="sm" variant="default" disabled={loading}>
                  <FileDown className="h-4 w-4 mr-1" />
                  {loading ? 'Téléchargement...' : 'Télécharger PDF'}
                </Button>
              )
            }}
          </PDFDownloadLink>
          <Button disabled={false} variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Attestation Détails</TabsTrigger>
          <TabsTrigger value="pdf">Attestation PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader className="flex w-full flex-row justify-between items-center gap-2">
              <div>
                <CardTitle className="text-lg uppercase">{attestation.name}</CardTitle>
                <CardDescription className="text-base">
                  N° : {attestation.attestationNumber}
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleCreateCopy}>
                <CopyCheck className="size-4 mr-1" />
                Créer Une Copie
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeildView
                label="Type"
                value={attestation.type ? 'Personne Physique' : 'Entreprise'}
              />
              <FeildView label="Identité" value={attestation.identity} />
              <FeildView label="ITP" value={attestation.ITP} />
              <FeildView label="IF" value={attestation.IF} />
              <FeildView
                label="Date de création"
                value={format(new Date(attestation.createdAt), 'dd/MM/yyyy', {
                  locale: fr
                })}
              />
              <FeildView
                label="Date de mise à jour"
                value={format(new Date(attestation.updatedAt), 'dd/MM/yyyy', {
                  locale: fr
                })}
              />
              <FeildView label="Activité" className="col-span-3" value={attestation.activite} />
              <FeildView label="Adresse" className="col-span-3" value={attestation.address} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pdf">
          <PDFViewer className="rounded-lg border" width="100%" height="800px" showToolbar={true}>
            <FiscalAttestationPDF fiscalAttestation={attestation} />
          </PDFViewer>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default ViewFiscalAttestation
