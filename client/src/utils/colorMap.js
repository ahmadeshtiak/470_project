// Color name to hex code mapping for car customization
export const getColorHex = (colorName) => {
  const colorMap = {
    // White variants
    'Pearl White': '#F0F8FF',
    'Platinum White': '#F0F8FF',
    'Glacier White': '#F5F5F5',
    'Snowflake White Pearl': '#FFFAFA',
    'Ibis White': '#F8F8FF',
    'Quartz White': '#FFFFF0',
    'Mineral White': '#F5F5F5',
    'Diamond White': '#FBFCF8',
    'Alpine White': '#FFFFFF',
    
    // Black variants
    'Midnight Black': '#000000',
    'Super Black': '#050505',
    'Crystal Black': '#0A0A0A',
    'Jet Black Mica': '#080808',
    'Phantom Black': '#0F0F0F',
    'Obsidian Black': '#121212',
    'Black Sapphire': '#0E0E10',
    
    // Silver variants
    'Celestial Silver': '#C0C0C0',
    'High-Tech Silver': '#C0C0C0',
    'Iridium Silver': '#D3D3D3',
    'Bright Silver': '#E0E0E0',
    'Shimmering Silver': '#DCDCDC',
    'Florett Silver': '#C9C9C9',
    'Lunar Silver': '#BFC1C2',
    'Champagne Silver': '#C0C0A8',
    
    // Gray variants
    'Magnetic Gray': '#808080',
    'Predawn Gray': '#696969',
    'Hampton Gray': '#708090',
    'Machine Gray': '#484848',
    'Manhattan Grey': '#686868',
    'Graphite Grey': '#484D50',
    'Sonic Gray': '#7D7F7D',
    'Urban Gray': '#7A7C7F',
    
    // Red variants
    'Super Red': '#FF0000',
    'Supersonic Red': '#D40000',
    'Rallye Red': '#DC143C',
    'San Marino Red': '#800000',
    'Soul Red Crystal': '#8B0000',
    'Calypso Red': '#A52A2A',
    'Tango Red': '#DC343B',
    'Patagonia Red': '#B22222',
    'Hyacinth Red': '#C41E3A',
    
    // Blue variants
    'Reservoir Blue': '#000080',
    'Deep Blue Pearl': '#00008B',
    'Aegean Blue': '#1E90FF',
    'Boost Blue': '#4169E1',
    'Deep Crystal Blue': '#00008B',
    'Stormy Sea': '#104E8B',
    'Navarra Blue': '#000080',
    'Spectral Blue': '#4682B4',
    'Nautical Blue': '#000080',
    'Phytonic Blue': '#004C99',
    'Tanzanite Blue': '#191970',
    'Portimao Blue': '#4169E1',
    
    // Green variants
    'Cypress Green': '#006400',
    'Army Green': '#4B5320',
    'District Green': '#556B2F',
    'Emerald Green': '#50C878',
    'San Remo Green': '#006400',
    
    // Other colors
    'Bronze Oxide': '#CD7F32',
    'Bronze Age': '#CD7F32',
    'Zircon Sand': '#F4A460',
    'Smoky Mauve': '#9370DB',
    'Electric Shadow': '#778899',
    
    // Rim colors
    'Chrome': '#E0E0E0',
    'Matte Black': '#1A1A1A',
    'Gold': '#FFD700',
    'Bronze': '#CD7F32',
    'Gunmetal': '#404040'
  };
  
  return colorMap[colorName] || '#FFFFFF';
};

export const RIM_COLORS = ['Chrome', 'Matte Black', 'Gold', 'Bronze', 'Gunmetal'];
