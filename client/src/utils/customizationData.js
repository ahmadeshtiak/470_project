// Dummy car data for customization studio
export const dummyCars = [
  {
    _id: 'demo-toyota-corolla',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2001,
    price: 1500000,
    modelPath: process.env.PUBLIC_URL + '/models/2001 Toyota Corolla RunX.glb',
    visualConfig: {
      scale: 0.01,
      textureRepeat: 20,
      cloneMaterial: true,
      bodyIdentifiers: ["paint1", "silver metallic"],
      rimIdentifiers: ["rims1"],
      exclusions: ["window", "glass", "tyre", "internal", "plastic", "mirror"]
    },
    customizationOptions: {
      colors: [
        { name: 'Pearl White', price: 0 },
        { name: 'Super Red', price: 20000 },
        { name: 'Midnight Black', price: 0 },
        { name: 'Celestial Silver', price: 15000 }
      ],
      rims: [
        { name: '15" Steel', price: 0 },
        { name: '16" Alloy', price: 35000 }
      ],
      tyres: [{ name: 'Standard', price: 0 }],
      interior: [{ name: 'Beige Fabric', price: 0 }],
      accessories: [
        { name: 'Spoiler', price: 15000 },
        { name: 'Sunroof', price: 50000 }
      ]
    }
  },
  {
    _id: 'demo-bmw-3series',
    brand: 'BMW',
    model: '3 Series',
    year: 2021,
    price: 6500000,
    modelPath: process.env.PUBLIC_URL + '/models/2021_bmw_3_series_325li.glb',
    visualConfig: {
      scale: 1.6,
      textureRepeat: 1,
      cloneMaterial: false,
      bodyIdentifiers: ["body", "paint", "metal", "chassis"],
      rimIdentifiers: ["rim", "wheel", "alloy", "spoke"],
      exclusions: ["window", "glass", "tire", "brake", "caliper", "inner"]
    },
    customizationOptions: {
      colors: [
        { name: 'Alpine White', price: 0 },
        { name: 'Portimao Blue', price: 45000 },
        { name: 'Black Sapphire', price: 0 }
      ],
      rims: [{ name: '18" M Sport', price: 85000 }],
      tyres: [{ name: 'Performance', price: 0 }],
      interior: [{ name: 'Leather', price: 0 }],
      accessories: [{ name: 'M Kit', price: 150000 }]
    }
  }
];
