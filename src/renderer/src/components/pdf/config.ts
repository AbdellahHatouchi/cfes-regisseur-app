import { Font } from '@react-pdf/renderer'
import { createTw } from 'react-pdf-tailwind'
import alexMedium from '../../assets/Alexandria-Medium.ttf'
import alexRegular from '../../assets/Alexandria-Light.ttf'
import alexBold from '../../assets/Alexandria-Bold.ttf'

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
export const tw = createTw({
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
        sm: '10px',
        base: '12px',
        lg: '16px',
        xl: '18px'
      }
    }
  }
})
