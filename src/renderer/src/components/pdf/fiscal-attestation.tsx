import React from 'react'
import { Document, Page, Text, View, Image, Font } from '@react-pdf/renderer'
import { createTw } from 'react-pdf-tailwind'
import logo from '../../assets/logo.png'
import alexMedium from '../../assets/Alexandria-Medium.ttf'
import alexRegular from '../../assets/Alexandria-Light.ttf'
import alexBold from '../../assets/Alexandria-Bold.ttf'
import { fr } from 'date-fns/locale'
import { format } from 'date-fns'

Font.register({
  family: 'Alexandria',
  fonts: [{ src: alexMedium }],
  fontWeight: 'bold',
  fontStyle: 'normal'
})
Font.register({
  family: 'AlexBold',
  fonts: [{ src: alexBold }],
  fontWeight: 'ultrabold',
  fontStyle: 'normal'
})
Font.register({
  family: 'AlexRegular',
  fonts: [{ src: alexRegular }],
  fontWeight: 'normal',
  fontStyle: 'normal'
})

// Tailwind theme configuration
const tw = createTw({
  theme: {
    fontFamily: {
      sans: ['AlexRegular'],
      alexBold: ['Alexandria'],
      alexUltraBold: ['AlexBold']
    },
    extend: {
      colors: {
        header: '#1E3A8A', // Blue header text color
        borderGray: '#d3d3d3', // Light border color
        stamp: '#FF4500', // Stamp color
        primary: '#1a2c49' // Primary color
      },
      fontSize: {
        xs: '10px',
        sm: '12px',
        base: '14px',
        lg: '16px',
        xl: '18px'
      }
    }
  }
})

// Fiscal attestation data props
export interface FiscalAttestationData {
  attestationNumber: string
  name: string
  type: boolean
  ITP: string
  IF: string
  identity: string
  activite: string
  address: string
  createdAt: string
}

interface FiscalAttestationPDFProps {
  fiscalAttestation: FiscalAttestationData
}

const FiscalAttestationPDF: React.FC<FiscalAttestationPDFProps> = ({ fiscalAttestation }) => {
  const { IF, ITP, activite, address, attestationNumber, createdAt, identity, name, type } =
    fiscalAttestation

  return (
    <Document>
      <Page size="A4" style={tw('text-primary p-8 font-sans')}>
        {/* Header Section */}
        <View
          style={tw(
            'flex flex-row justify-between items-center border-b pb-4 border-blue-100 mb-6'
          )}
        >
          {/* Left Section (French Text) */}
          <View style={tw('text-center flex justify-center items-center flex-col')}>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              Royaume du Maroc
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              Ministère de l&apos;Intérieur
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              Wilaya de la région de Draa-tafilalet
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              Province d&apos;Errachidia
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              Cercle de Tinejdad
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              Caidat de Ferkla
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              Commune de Ferkla Essoufla
            </Text>
          </View>

          {/* Center Section (Logo) */}
          <View style={tw('flex-1 text-center')}>
            <Image src={logo} style={tw('h-32 w-auto mx-auto')} />
          </View>

          {/* Right Section (Arabic Text) */}
          <View style={tw('text-center flex justify-center items-center flex-col')}>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              المملكة المغربية
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              وزارة الداخلية
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              ولاية جهة درعة-تافيلالت
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              إقليم الرشيدية
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              دائرة تنجداد
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              قيادة فركلة
            </Text>
            <Text style={{ fontFamily: 'Alexandria', fontSize: 10, fontWeight: 'bold' }}>
              جماعة فركلة السفلى
            </Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={tw('text-center mb-4')}>
          <Text style={tw('text-4xl font-alexUltraBold uppercase underline')}>
            ATTESTATION DE BIEN VIVRE
          </Text>
          <Text style={tw('text-base text-left font-alexBold text-primary')}>
            N°: {attestationNumber}
          </Text>
        </View>

        {/* attesatation Details Section */}
        <View style={tw('text-base capitalize my-5')}>
          <Text style={tw('mb-4')}>{`JE SOUSIGNE PRESIDENT DE LA COMMUNE DE FERKLA ESSOUFLA`}</Text>
          <Text style={tw('mb-4')}>
            {`ATTESTE QUE :`} <Text style={tw('font-alexBold text-primary')}>{name}</Text>
          </Text>
          <Text style={tw('mb-4')}>
            {type ? `C.I.N :` : `STE :`}
            <Text style={tw('font-alexBold text-primary')}>{identity}</Text>
          </Text>
          <Text style={tw('mb-4')}>
            {`ADRESSE : `}
            <Text style={tw('font-alexBold text-primary')}>{address}</Text>
          </Text>
          <Text style={tw('mb-4')}>
            {`ITP N° : `}
            <Text style={tw('font-alexBold text-primary')}>{ITP}</Text>
          </Text>
          <Text style={tw('mb-4')}>
            {`IF N°: `}
            <Text style={tw('font-alexBold text-primary')}>{IF}</Text>
          </Text>
          <Text style={tw('mb-4')}>
            {`ACTIVITE: `}
            <Text style={tw('font-alexBold text-primary')}>{activite}</Text>
          </Text>
          <Text style={tw('font-alexBold text-primary mb-4')}>
            {`EN DETAIL N'A PAS DE TAXES A REGLER VIS-A-VIS DE LA COMMUNE FERKLA ESSOUFLA JUSQU'A LA DATE DE CE JOUR.`}
          </Text>
          <Text style={tw('mb-3')}>
            {`EN FOI DE QUOI LA PRESENTE ATTESTATION EST DELIVREE A L'INTERESSE POUR LUI SERVIR ET VALOIR CE QUE DE DROIT.`}
          </Text>
        </View>

        {/* Dates Section */}
        <View style={tw('text-sm mb-2 flex flex-row justify-end gap-4')}>
          <Text style={tw('font-bold')}>
            A FERKLA ESSOUFLA LE:{' '}
            <Text style={tw('font-alexBold')}>
              {format(new Date(createdAt), 'dd/MM/yyyy', { locale: fr })}
            </Text>
          </Text>
        </View>

        {/* Footer Section */}
        <View style={tw('border-t p-6 uppercase border-blue-100 mt-4')}>
          {/* President Section */}
          <View style={tw('flex flex-row mb-24 justify-center items-center')}>
            <View style={tw('text-sm text-center')}>
              <Text style={tw('mt-4 font-alexBold')}>Le Président</Text>
            </View>
          </View>
        </View>
        {/* Footer contact */}
        <View style={tw('border p-2 rounded flex flex-row justify-around mt-auto items-center ')}>
          <Text style={{ fontFamily: 'Alexandria', fontSize: 8, fontWeight: 'bold' }}>
            Commune de Ferkla Essoufla
          </Text>
          <Text style={tw('font-bold text-xs')}>Tel - Fax : 0535787324 هاتف - فاكس</Text>
          <Text style={{ fontFamily: 'Alexandria', fontSize: 8, fontWeight: 'bold' }}>
            جماعة فركلة السفلى
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default FiscalAttestationPDF
