import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Define custom theme
const choreTheme = {
  dark: false,
  colors: {
    primary: '#2196F3',      // Blue
    secondary: '#4CAF50',    // Green
    accent: '#FF9800',       // Orange
    error: '#F44336',        // Red
    warning: '#FFC107',      // Amber
    info: '#03A9F4',         // Light Blue
    success: '#4CAF50',      // Green
    background: '#FAFAFA',   // Light Gray
    surface: '#FFFFFF',      // White
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'choreTheme',
    themes: {
      choreTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      variant: 'elevated',
      rounded: 'lg',
    },
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
