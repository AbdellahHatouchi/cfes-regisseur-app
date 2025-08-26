import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { tw } from './config'

const FooterPDF: React.FC = () => {
  return (
    <View style={tw('border p-2 rounded flex flex-row justify-around mt-auto items-center')}>
      <Text style={tw('text-xs font-bold')}>Commune de Ferkla Essoufla</Text>
      <Text style={tw('text-xs font-bold')}>Tel - Fax : 0535787324 هاتف - فاكس</Text>
      <Text style={tw('text-xs font-bold')}>جماعة فركلة السفلى</Text>
    </View>
  )
}

export default FooterPDF
