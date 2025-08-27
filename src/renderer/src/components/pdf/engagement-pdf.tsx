import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import HeaderPDF from './header-pdf'
import FooterPDF from './footer-pdf'
import { tw } from './config'

export interface EngagementData {
  name: string
  cin: string
  address: string
  createdAt: string
}

interface EngagementPDFProps {
  engagement: EngagementData
}

const EngagementPDF: React.FC<EngagementPDFProps> = ({ engagement }) => {
  const { name, cin, address, createdAt } = engagement

  return (
    <Document>
      <Page size="A4" style={tw('text-primary p-8 font-alexBold')}>
        {/* Header */}
        <HeaderPDF />

        {/* Title */}
        <View style={tw('text-center mt-6 mb-4')}>
          <Text style={tw('text-lg font-alexUltraBold')}>
            التزام الاستفادة من خدمة تفريغ الحفرة الصحية
          </Text>
        </View>

        {/* User Fields */}
        <View style={tw('text-base text-right px-6 leading-7 mb-4')}>
          <Text>أنا الممضي أسفله؛</Text>
          <View style={tw('flex flex-row justify-between items-center mb-2')}>
            <Text>Nom complet : </Text>
            <Text style={tw('font-alexUltraBold capitalize')}>{name}</Text>
            <Text>الاسم الكامل؛</Text>
          </View>
          <View style={tw('flex flex-row justify-between items-center mb-2')}>
            <Text>CIN : </Text>
            <Text style={tw('font-alexUltraBold')}>{cin}</Text>
            <Text>رقم بطاقة التعريف الوطنية؛</Text>
          </View>
          <View style={tw('flex flex-row justify-between items-center mb-2')}>
            <Text>Adresse : </Text>
            <Text style={tw('font-alexUltraBold capitalize')}>
              {address === 'unknow' ? '_ _ _ _ _ _ _ _' : address}
            </Text>
            <Text>العنوان؛</Text>
          </View>
        </View>

        {/* Engagement Clauses */}
        <View style={tw('text-base text-right px-6 leading-7 mb-6')}>
          <View style={tw('flex flex-row-reverse items-start mb-2')}>
            <Text style={tw('text-base')}>.1</Text>
            <Text style={tw('mr-3 flex-1')}>
              أصرح أن الطريق المؤدي إلى منزلي، يمكن لشاحنة التفريغ المرور بها والوصول إلى مكان
              الحفرة الصحية يوم التدخل. ـ
            </Text>
          </View>
          <View style={tw('flex flex-row-reverse items-start mb-2')}>
            <Text style={tw('text-base')}>.2</Text>
            <Text style={tw('mr-3 flex-1')}>
              ألتزم بتجهيز مكان التدخل وفتح الحفرة وكذا توفير اليد العاملة اللازمة للقيام بعملية
              التفريغ. ـ
            </Text>
          </View>
          <View style={tw('flex flex-row-reverse items-start mb-2')}>
            <Text style={tw('text-base')}>.3</Text>
            <Text style={tw('mr-3 flex-1')}>
              إذا تعذر على الشاحنة الوصول إلى مكان الحفرة يوم التدخل (بسبب ضيق الطريق أو وجود عوائق
              أو عدم تجهيز المكان)، فلن يتم تنفيذ الخدمة ولا يحق لي المطالبة باسترجاع المبلغ
              المدفوع. ـ
            </Text>
          </View>
          <View style={tw('flex flex-row-reverse items-start mb-2')}>
            <Text style={tw('text-base')}>.4</Text>
            <Text style={tw('mr-3 flex-1')}>
              أتحمل المسؤولية الكاملة في حالة تقديم معلومات غير صحيحة عن العنوان أو وضعية الطريق. ـ
            </Text>
          </View>
        </View>

        {/* Date & Signature */}
        <View style={tw('text-base flex flex-col w-1/2  leading-7 gap-3')}>
          <Text style={tw('text-center')}>
            حرر بفركلة السفلى في : {format(new Date(createdAt), 'dd/MM/yyyy', { locale: fr })}
          </Text>
          <Text style={tw('text-center')}>توقيع المعني بالأمر</Text>
        </View>

        {/* Footer */}
        <FooterPDF />
      </Page>
    </Document>
  )
}

export default EngagementPDF
