export const PRODUCT_MAIN_CATEGORIES = [
  { 
    name: "Royal Silks", 
    image: "/uploads/categories/royal-silks.jpg",
    categories: ["Royal Silks", "Handwoven Heritage", "Wedding", "Festive"]
  },
  { 
    name: "Festive Radiance", 
    image: "/uploads/categories/festive-radiance.jpg",
    categories: ["Festive Radiance", "Festive", "Party Wear", "Casual"]
  },
  { 
    name: "Bridal Elegance", 
    image: "/uploads/categories/bridal-elegance.jpg",
    categories: ["Bridal Elegance", "Bride", "Wedding", "Party Wear"]
  },
  { 
    name: "Handwoven Heritage", 
    image: "/uploads/categories/handwoven-heritage.jpg",
    categories: ["Handwoven Heritage", "Royal Silks", "Daily Wear", "Casual"]
  }
];

export const PRODUCT_MAIN_CATEGORY_NAMES = PRODUCT_MAIN_CATEGORIES.map(c => c.name);

export const PRODUCT_SUB_CATEGORIES = [
  "Wedding", "Party Wear", "Bride", "Festive", "Casual", "Daily Wear",
  "Royal Silks", "Festive Radiance", "Bridal Elegance", "Handwoven Heritage"
];

export const PRODUCT_COLORS = [
  { name: "Yellow", hex: "#EAB308" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Pink", hex: "#E11D48" },
  { name: "Red", hex: "#DC2626" },
  { name: "Green", hex: "#16A34A" },
  { name: "Purple", hex: "#9333EA" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Black", hex: "#0F172A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Silver", hex: "#C0C0C0" }
];
