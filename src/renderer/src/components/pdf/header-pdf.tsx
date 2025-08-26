import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import logo from '../../assets/logo.png'
import { tw } from './config'

const HeaderPDF: React.FC = () => {
  return (
    <View style={tw('flex flex-row justify-between items-center border-b pb-4 mb-6')}>
      {/* Left Section (French) */}
      <View style={tw('text-center flex justify-center items-center flex-col')}>
        <Text style={tw('text-sm font-bold')}>Royaume du Maroc</Text>
        <Text style={tw('text-sm font-bold')}>Ministère de l&apos;Intérieur</Text>
        <Text style={tw('text-sm font-bold')}>Wilaya de la région de Draa-tafilalet</Text>
        <Text style={tw('text-sm font-bold')}>Province d&apos;Errachidia</Text>
        <Text style={tw('text-sm font-bold')}>Cercle de Tinejdad</Text>
        <Text style={tw('text-sm font-bold')}>Caïdat de Ferkla</Text>
        <Text style={tw('text-sm font-bold')}>Commune de Ferkla Essoufla</Text>
      </View>

      {/* Center (Logo) */}
      <View style={tw('flex-1 text-center')}>
        <Image src={logo} style={tw('h-32 w-auto mx-auto')} />
      </View>

      {/* Right Section (Arabic) */}
      <View style={tw('text-center flex justify-center items-center flex-col')}>
        <Text style={tw('text-sm font-bold')}>المملكة المغربية</Text>
        <Text style={tw('text-sm font-bold')}>وزارة الداخلية</Text>
        <Text style={tw('text-sm font-bold')}>ولاية جهة درعة-تافيلالت</Text>
        <Text style={tw('text-sm font-bold')}>إقليم الرشيدية</Text>
        <Text style={tw('text-sm font-bold')}>دائرة تنجداد</Text>
        <Text style={tw('text-sm font-bold')}>قيادة فركلة</Text>
        <Text style={tw('text-sm font-bold')}>جماعة فركلة السفلى</Text>
      </View>
    </View>
  )
}

export default HeaderPDF
