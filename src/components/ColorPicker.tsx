import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ColorPickerProps {
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onSelectColor }) => {
  const { isDarkMode } = useTheme();

  // Predefined colors
  const colors = [
    // Blue tones
    '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1',
    // Red tones
    '#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C',
    // Green tones
    '#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20',
    // Yellow/orange tones
    '#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00',
    // Gray tones
    '#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121',
    // Purple/pink tones
    '#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C',
  ];

  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg shadow-md p-2 w-64 transition-colors duration-300">
      <div className="flex flex-wrap gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className="w-6 h-6 rounded-md border border-dark-200 dark:border-dark-700 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;