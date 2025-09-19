import React, { createContext, useContext, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const colorScheme = Appearance.getColorScheme();
    const [theme, setTheme] = useState(colorScheme || 'light');

    const toggleTheme = () => {
        setTheme((value) => value === 'light' ? 'dark' : 'light');
    };

    const themeColors = {
        light: {
            // Backgrounds
            background: '#FFFFFF',
            cardBackground: '#FFFFFF',
            surfaceBackground: '#F8F9FA',
            
            // Primary Brand Colors
            primary: '#E91E63', // Rosa da logo
            primaryLight: '#F8BBD9',
            primaryDark: '#C2185B',
            
            // Text Colors
            text: '#1A1A1A',
            textSecondary: '#6C757D',
            textMuted: '#ADB5BD',
            
            // Input Colors
            input: '#F8F9FA',
            inputBorder: '#E9ECEF',
            inputFocus: '#E91E63',
            placeHolderTextColor: '#6C757D',
            
            // Button Colors
            backgroundButton: '#E91E63',
            buttonText: '#FFFFFF',
            buttonSecondary: '#F8F9FA',
            buttonSecondaryText: '#495057',
            
            // Status Colors
            success: '#28A745',
            error: '#DC3545',
            warning: '#FFC107',
            info: '#17A2B8',
            
            // Border and Divider
            border: '#DEE2E6',
            divider: '#E9ECEF',
            
            // Shadow
            shadow: 'rgba(0, 0, 0, 0.1)',
        },
        dark: {
            // Backgrounds
            background: '#121212',
            cardBackground: '#1E1E1E',
            surfaceBackground: '#2A2A2A',
            
            // Primary Brand Colors
            primary: '#F06292', // Rosa mais suave para dark
            primaryLight: '#F8BBD9',
            primaryDark: '#E91E63',
            
            // Text Colors
            text: '#FFFFFF',
            textSecondary: '#B0B0B0',
            textMuted: '#777777',
            
            // Input Colors
            input: '#2A2A2A',
            inputBorder: '#404040',
            inputFocus: '#F06292',
            placeHolderTextColor: '#888888',
            
            // Button Colors
            backgroundButton: '#F06292',
            buttonText: '#FFFFFF',
            buttonSecondary: '#2A2A2A',
            buttonSecondaryText: '#FFFFFF',
            
            // Status Colors
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3',
            
            // Border and Divider
            border: '#404040',
            divider: '#333333',
            
            // Shadow
            shadow: 'rgba(0, 0, 0, 0.3)',
        }
    };

    return (
        <ThemeContext.Provider value={{ 
            theme, 
            toggleTheme, 
            colors: themeColors[theme] 
        }}>
            {children}
        </ThemeContext.Provider>
    );
}