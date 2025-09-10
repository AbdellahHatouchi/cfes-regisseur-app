import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import HeaderPDF from './header-pdf'
import FooterPDF from './footer-pdf'
import { tw } from './config'

type VersementPDFProps = {
  versement: any
}

const VersementPDF: React.FC<VersementPDFProps> = ({ versement }) => {
  const items = versement.items || []

  return (
    <Document>
      <Page size="A4" style={tw('p-8 font-sans')}>
        <HeaderPDF />
        <View style={tw('mb-4')}>
          <Text style={tw('text-lg font-bold')}>Versement {versement.numeroVersement}</Text>
          <Text style={tw('text-sm')}>Type: {versement.type}</Text>
        </View>
        <View style={tw('mt-2 border-t pt-4')}>
          {items.length === 0 ? (
            <Text style={tw('text-sm text-gray-500')}>Aucun article</Text>
          ) : (
            items.map((line: any) => (
              <View key={line.id} style={tw('flex flex-row justify-between text-sm py-1')}>
                <Text>
                  {line.type === 'vignette'
                    ? `${line.quantity} x ${line?.vignetteValue?.valueDh?.toFixed?.(2) || ''} DH`
                    : `Quittance ${line.quittanceNum || ''}`}
                </Text>
                <Text>{Number(line.amountDh).toFixed(2)} DH</Text>
              </View>
            ))
          )}
          <View style={tw('mt-2 border-t pt-2 flex flex-row justify-between text-sm font-bold')}>
            <Text>Total</Text>
            <Text>{Number(versement.montantTotal).toFixed(2)} DH</Text>
          </View>
        </View>
        <FooterPDF />
      </Page>
    </Document>
  )
}

export default VersementPDF
