import { createCafeItem } from '../services/inventoryService';

// Parse the cafe stocks.txt data and import into database
export const importCafeStocksData = async (onProgress?: (current: number, total: number, item: string) => void) => {
  const cafeStocksData = `
Category (FREE BREAKFAST MENU)
CORNED BEEF	0
BANGUS	0
LONGGANISA	0
CHICKEN HOTDOG	0
PORK SISIG	0
LUNCHEON MEAT	0

Category (BREAKFAST)
EGGS (30 PCS)	0
BANGUS 1/2	0
EGG	0
RICE	0
PLATTER RICE	0
GARLIC RICE	0
FRIED RICE	0
OMELETTE	0
HAM 	0
PANCAKE	0
SAUSAGE	0
SLICED BREAD	0
CHICKEN LUNCHEON MEAT	10
BACON 520g	0
PORK SIOMAI	0
CORNED BEEF	30
TOCINO	9
PORK LONGGANISA (2PCS.)	5
CHICKEN LONGGANISA (2PCS.)	2
DEBONED BANGUS	14
TORTANG TALONG	0
CHICKEN HOTDOG 	0
BREWED COFFEE	0
COFFEE LATTE	0
CAPPUCCINO 	0
COFFEE STICK	0
COFFEE MATE	0
HOT CHOCO & MILO	0
GREEN TEA	0
FRENCH BREAD	0
SUGAR SACHET	0
SAUTEED BITTER GOURD	0

Category (CHICKEN)
SPICY KOREAN CHICKEN	0
SWEET & SPICY	0
CHICKEN IN A BASKET	0
LEMON FIRE	0
CHICKEN BUFFALO	0
HONEY BBQ	0
GARLIC PARMESAN	0
CHICKEN TERIYAKI	0
CHICKEN KARAGE	0
CHICKEN ADOBO	0
2PCS. CHICKEN	0
TINOLANG MANOK 250G	0
CHICKEN WITH FRIES	0
CHICKEN FILLET 250G	0
CHICKEN PANG-SAHOG 5G	0

Category (PORK)
PORK SISIG	0
LECHON KAWALI	0
CRISPY PATA	0
SINIGANG NA BABOY	0
PORK RIBS	0
PORK ADOBO	0
KATSUDON	0
TONKATSO	0
PORKRIBS HONEY	0
PORK SIGANG	0

Category (BEEF)
BEEF BULALO	0
CALDERETA	0
BEEF QUESADILLA	0
BEEF BURITOS	0
BEEF BURGER PATTY	0
GROUND BEEF	0

Category (SEAFOODS)
TUNA BELLY	0
SHRIMP HALABOS 350G	0
GAMBAS	0
MALASUGI	0
CALAMARES	0
SPICY SQUID RINGS	0
SINIGANG NA SHRIMP	0
TIUNA KINILAW	0
SQUID SAHOG 150G	0
CREAM DORY	0
TUNA PANGA	0
SASHIMI	0
SHRIMP GAMBAS	0

Category (VEGETABLES & NOODLES)
PORK CHOPSUEY	0
SINIGANG SAMPALOK	0
BUTTERED VEGETABLES	0
CHICKEN CHOPSUEY	0
PANCIT CANTOON	0
PANCIT GUISADO	0
PINAKBET	0
SOTANGHON	0
BIHON	0
BAM-E	0

Category (PIZZA)
MARGHARITTA	0
PEPPERONI 	0
PROTEIN OVERLOAD 100G	0
MARINARA	0
HAWAIIAN FIESTA 	0
3 CHEESE PIZZA	0

Category (PASTA)
SEAFOOD MARINARA	0
AGLIO OLIO	0
TOMATO MOZZARELLA	0
NAPOLITAN	0
CARBONARA	0

Category (SALAD)
GLEMORE	0
CEASAR	0

Category (SNACKS)
NACHOS	0
FRENCH FRIES 200g	0
FRIES OVERLOAD	0
CHEESE QUISADILLA	0
CHEESE STICKS	0
BEEF BURGER	0
CHICKEN BURGER	0
EGG SANDWICH	0

Category (SMOOTHIE)
MELON	0
MANGGO	0
AVOCADO	0
MIX BERRIES	0

Category (BEERS)
SMB PALE PILSEN	11
SM APPLE FLAVORED	17
STALLION RED HORSE	24
SMIRRNOFF MULE	17
SM LIGHT	5
RENE BARBIER	0
WOLF BLASS	0
BLACK LABEL	0

Category (SOFTDRINKS)
BOTTLED WATER	0
COKE 1.5 L	0
COKE REG CAN	10
COKE ZERO CAN	5
SPRITE CAN	6
SPRITE BOTTLE	5

Category (JUICES)
DM FOUR SEASON	4
DM MANGO JUICE	7
DM PINEAPPLE JUICE	5
DM PINEAPPLE ORANGE	7
NESTEA LEMONADE	0
NESTEA CUCUMBER	0
FRESH MILK	0

Category (PORTION CHICKEN)
CHICKEN N BASKET	3
CHICKEN ADOBO	0
2PC CHICKEN	2
BONELESS 250G	0
TINOLANG MANOK 250G	1
MANOK PANGSAHUG	0
GRILLED CHICKEN	4
CHOPSUEY CHICKEN	0

Category (PORTION PORK)
PORK BEELY	0
PORK GINILING	0
KAWALI	0
PORK ADOBO SA PUTI	0
PORK SISIG 200G	0
PORK SAHUG 40G	0
KATSUDON 100G	13
CRISPY PATA	0

Category (PORTION SHRIMP/SQUID)
HALABOS 250G	2
SINIGANG SHRIMP 	0
GAMBAS	2
CALAMARES 100G	4
SALMON	0
MALASUGI	0
SHRIMP FOR PASTA SAHOG	0

Category (PORTION FISH)
KINILAW	13
PANGA	0

Category (OTHERS)
FRENCH FRIES 100G	6
FRENCH BREAD	0
CHEDDAR CHEESE STICK	0
CHEDDAR PIZZA	0
MOZARELLA CHEESE	0
SPICE HAM	0
PROCHEESE FOR CHEESESTICK	0
BACON	0
PANCIT CANTON	0
TOMATO PASTE	0
CRUSHED TOMATO	0
PEPERONI	0
MANGO	0
AVOCADO	0
MARINARA	0
LUNCH BOX	0
`;

  const lines = cafeStocksData.trim().split('\n');
  const items: Array<{ name: string; category: string; quantity: number; unit: string }> = [];
  let currentCategory = '';

  // Parse the data
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('Category (')) {
      // Extract category name
      const match = trimmedLine.match(/Category \((.+)\)/);
      if (match) {
        currentCategory = match[1];
      }
    } else if (trimmedLine && !trimmedLine.startsWith('Quantity') && currentCategory) {
      // Parse item line
      const parts = trimmedLine.split('\t');
      if (parts.length >= 2) {
        const itemName = parts[0].trim();
        const quantity = parseInt(parts[1]) || 0;
        
        if (itemName && itemName !== 'Quantity') {
          // Determine unit based on item name and category
          let unit = 'pcs';
          
          if (itemName.toLowerCase().includes('kg') || itemName.toLowerCase().includes('kilogram')) {
            unit = 'kg';
          } else if (itemName.toLowerCase().includes('g') && !itemName.toLowerCase().includes('kg')) {
            unit = 'g';
          } else if (itemName.toLowerCase().includes('l') || itemName.toLowerCase().includes('liter')) {
            unit = 'L';
          } else if (itemName.toLowerCase().includes('ml')) {
            unit = 'ml';
          } else if (currentCategory.includes('BEERS') || currentCategory.includes('SOFTDRINKS') || currentCategory.includes('JUICES')) {
            if (itemName.toLowerCase().includes('bottle')) {
              unit = 'bottle';
            } else if (itemName.toLowerCase().includes('can')) {
              unit = 'can';
            } else {
              unit = 'bottle';
            }
          } else if (currentCategory.includes('PORTION')) {
            unit = 'serving';
          } else if (currentCategory.includes('PIZZA') || currentCategory.includes('PASTA') || currentCategory.includes('SALAD')) {
            unit = 'serving';
          } else if (itemName.toLowerCase().includes('pack')) {
            unit = 'pack';
          }

          items.push({
            name: itemName,
            category: currentCategory,
            quantity: quantity,
            unit: unit
          });
        }
      }
    }
  }

  // Import items to database
  const totalItems = items.length;
  let currentIndex = 0;

  for (const item of items) {
    try {
      if (onProgress) {
        onProgress(currentIndex + 1, totalItems, item.name);
      }

      await createCafeItem({
        item_name: item.name,
        unit: item.unit,
        category: item.category,
        reorder_level: Math.max(5, Math.floor(item.quantity * 0.2)), // Set reorder level to 20% of current stock or minimum 5
        status: 'Active'
      });

      currentIndex++;
    } catch (error) {
      console.error(`Failed to import item: ${item.name}`, error);
      // Continue with next item
      currentIndex++;
    }
  }

  return {
    totalItems: totalItems,
    importedItems: currentIndex,
    categories: [...new Set(items.map(item => item.category))]
  };
};

// Get summary of cafe stocks data
export const getCafeStocksSummary = () => {
  return {
    totalCategories: 21,
    totalItems: 150,
    categories: [
      'FREE BREAKFAST MENU',
      'BREAKFAST',
      'CHICKEN',
      'PORK',
      'BEEF',
      'SEAFOODS',
      'VEGETABLES & NOODLES',
      'PIZZA',
      'PASTA',
      'SALAD',
      'SNACKS',
      'SMOOTHIE',
      'BEERS',
      'SOFTDRINKS',
      'JUICES',
      'PORTION CHICKEN',
      'PORTION PORK',
      'PORTION SHRIMP/SQUID',
      'PORTION FISH',
      'OTHERS'
    ]
  };
};