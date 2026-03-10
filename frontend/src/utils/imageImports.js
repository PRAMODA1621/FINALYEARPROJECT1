// Image imports for all product categories
// Using Unsplash placeholders until actual images are added

// Category-based placeholder images
const categoryPlaceholders = {
  'Wooden': 'https://images.unsplash.com/photo-1586075010923-9dd4572fb6bf?w=500',
  'Acrylic': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
  'Metal': 'https://images.unsplash.com/photo-1583485088034-6e7a9d9d7f3c?w=500',
  'Crystal': 'https://images.unsplash.com/photo-1598257006458-0871690d0f3b?w=500',
  'Corporate Gifts': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
  'Mementos': 'https://images.unsplash.com/photo-1577083552431-6e5fd01988b7?w=500',
  'Marble': 'https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=500'
};

// Default fallback image
const defaultImage = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500';

// Image mapping object
export const productImages = {
  // Wooden
  'Engraved Wooden Name Plate': categoryPlaceholders['Wooden'],
  'Wooden Photo Frame Plaque': categoryPlaceholders['Wooden'],
  'Wooden Business Card Holder': categoryPlaceholders['Wooden'],
  'Wooden Pen Stand': categoryPlaceholders['Wooden'],
  'Wooden Award Plaque': categoryPlaceholders['Wooden'],
  
  // Acrylic
  'Acrylic LED Name Plate': categoryPlaceholders['Acrylic'],
  'Acrylic Trophy Award': categoryPlaceholders['Acrylic'],
  'Acrylic Paper Weight': categoryPlaceholders['Acrylic'],
  'Acrylic Plaque': categoryPlaceholders['Acrylic'],
  'Acrylic Desk Sign': categoryPlaceholders['Acrylic'],
  
  // Metal
  'Metal Engraved Pen': categoryPlaceholders['Metal'],
  'Metal Keychain': categoryPlaceholders['Metal'],
  'Corporate Desk Clock': categoryPlaceholders['Metal'],
  'Metal Business Card Case': categoryPlaceholders['Metal'],
  'Metal Letter Opener': categoryPlaceholders['Metal'],
  'Metal Money Clip': categoryPlaceholders['Metal'],
  'Metal Bookmark': categoryPlaceholders['Metal'],
  
  // Crystal
  'Crystal Corporate Award': categoryPlaceholders['Crystal'],
  'Crystal Paper Weight': categoryPlaceholders['Crystal'],
  'Crystal Star Award': categoryPlaceholders['Crystal'],
  'Crystal Globe Award': categoryPlaceholders['Crystal'],
  'Crystal Pyramid Award': categoryPlaceholders['Crystal'],
  
  // Corporate Gifts
  'Corporate Gift Combo': categoryPlaceholders['Corporate Gifts'],
  'Customized Coffee Mug': categoryPlaceholders['Corporate Gifts'],
  'Corporate Leather Folder': categoryPlaceholders['Corporate Gifts'],
  'Executive Gift Set': categoryPlaceholders['Corporate Gifts'],
  'Leather Mouse Pad': categoryPlaceholders['Corporate Gifts'],
  'Corporate Diary': categoryPlaceholders['Corporate Gifts'],
  'Leather Luggage Tag': categoryPlaceholders['Corporate Gifts'],
  
  // Mementos
  'Memento of Gratitude': categoryPlaceholders['Mementos'],
  'Memento of Service': categoryPlaceholders['Mementos'],
  
  // Marble
  'Marble Base Award': categoryPlaceholders['Marble'],
  'Marble Paperweight': categoryPlaceholders['Marble'],
  'Marble Plaque': categoryPlaceholders['Marble']
};

// Helper function to get image by product name
export const getProductImage = (productName) => {
  if (!productName) return defaultImage;
  return productImages[productName] || defaultImage;
};

// Helper function to get image by category
export const getCategoryImage = (category) => {
  if (!category) return defaultImage;
  return categoryPlaceholders[category] || defaultImage;
};