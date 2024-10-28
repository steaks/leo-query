import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4A90E2', // Blue tone inspired by the image
    },
    secondary: {
      main: '#50E3C2', // A complementing teal tone for secondary actions
    },
    background: {
      default: '#f0f2f5', // Light grey background for the app
      paper: '#ffffff',   // White background for cards and modals
    },
    text: {
      primary: '#333333', // Dark grey for primary text
      secondary: '#7D7D7D', // Medium grey for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#333333',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#333333',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#4A90E2', // Using primary color for emphasis
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      color: '#555555',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#7D7D7D',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // White header
          color: '#4A90E2',           // Primary color for text/icon
          boxShadow: 'none',          // Flat appearance
          borderBottom: '1px solid #e0e0e0', // Subtle divider
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f9fafb', // Very light grey sidebar
          color: '#333333',
          width: 240,
          borderRight: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        text: {
          fontSize: '14px',
          color: '#4A90E2',
        },
        contained: {
          borderRadius: 12,
          textTransform: 'none',
          backgroundColor: '#4A90E2', // Primary blue background
          color: '#ffffff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#357ABD', // Darker shade on hover
          },
        },
        outlined: {
          borderColor: '#4A90E2',
          color: '#4A90E2',
          '&:hover': {
            backgroundColor: '#f0f7ff',
            borderColor: '#357ABD',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add some depth
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
            fontSize: '0.875rem',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row': {
            '&:nth-of-type(odd)': {
              backgroundColor: '#f9fafb',
            },
            '&:hover': {
              backgroundColor: '#f0f7ff', // Light hover effect
            },
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
            color: '#333333',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          padding: '4px 8px', // Reduce padding for a more compact look
          fontSize: '0.875rem', // Smaller font size
          minHeight: '32px', // Lower the overall height
          '&:hover': {
            borderColor: '#4A90E2',
          },
          '&.Mui-focused': {
            borderColor: '#4A90E2',
            backgroundColor: '#f0f7ff',
          },
        },
        icon: {
          color: '#4A90E2',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#4A90E2',
          fontWeight: 500,
          fontSize: '0.875rem', // Smaller font size for the label
        },
        shrink: {
          color: '#4A90E2',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.875rem', // Smaller font size for menu items
          '&.Mui-selected': {
            backgroundColor: '#f0f7ff',
            color: '#4A90E2',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#dceeff',
          },
        },
      },
    }
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
