import { normalizeIngredient } from './normalizer.js'

export type CatalogEntry = {
  id: string
  name: string
  brand?: string
  price: number
  aisle: string
  packageUnit: string
  hasLeftovers: boolean
  keywords: string[]
}

const CATALOG: CatalogEntry[] = [
  // Produce
  { id: 'sku-garlic', name: 'Fresh Garlic Bulb', price: 0.69, aisle: 'Produce', packageUnit: 'bulb', hasLeftovers: true, keywords: ['garlic', 'garlic cloves', 'garlic bulb'] },
  { id: 'sku-onion', name: 'Yellow Onion', price: 0.89, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['onion', 'yellow onion', 'white onion', 'sweet onion'] },
  { id: 'sku-red-onion', name: 'Red Onion', price: 1.19, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['red onion'] },
  { id: 'sku-shallots', name: 'Shallots', price: 1.49, aisle: 'Produce', packageUnit: 'bag', hasLeftovers: true, keywords: ['shallots', 'shallot'] },
  { id: 'sku-tomatoes', name: 'Roma Tomatoes', price: 1.49, aisle: 'Produce', packageUnit: 'lb', hasLeftovers: false, keywords: ['tomatoes', 'roma tomatoes', 'plum tomatoes', 'tomato'] },
  { id: 'sku-cherry-tomatoes', name: 'Cherry Tomatoes', price: 3.49, aisle: 'Produce', packageUnit: 'pint', hasLeftovers: true, keywords: ['cherry tomatoes', 'grape tomatoes'] },
  { id: 'sku-potatoes', name: 'Russet Potatoes', price: 3.99, aisle: 'Produce', packageUnit: '5 lb bag', hasLeftovers: true, keywords: ['potatoes', 'russet potatoes', 'baking potatoes', 'potato'] },
  { id: 'sku-carrots', name: 'Carrots', price: 1.29, aisle: 'Produce', packageUnit: 'lb bag', hasLeftovers: true, keywords: ['carrots', 'carrot'] },
  { id: 'sku-celery', name: 'Celery', price: 1.99, aisle: 'Produce', packageUnit: 'bunch', hasLeftovers: true, keywords: ['celery', 'celery stalk', 'celery stalks'] },
  { id: 'sku-spinach', name: 'Baby Spinach', price: 3.99, aisle: 'Produce', packageUnit: '5 oz bag', hasLeftovers: true, keywords: ['spinach', 'baby spinach'] },
  { id: 'sku-broccoli', name: 'Broccoli Crown', price: 2.49, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['broccoli', 'broccoli florets'] },
  { id: 'sku-mushrooms', name: 'Baby Bella Mushrooms', price: 2.99, aisle: 'Produce', packageUnit: '8 oz', hasLeftovers: true, keywords: ['mushrooms', 'cremini mushrooms', 'baby bella mushrooms', 'button mushrooms'] },
  { id: 'sku-bell-pepper', name: 'Bell Pepper', price: 1.29, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['bell pepper', 'red bell pepper', 'green bell pepper', 'yellow bell pepper', 'bell peppers'] },
  { id: 'sku-lemon', name: 'Lemon', price: 0.79, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['lemon', 'lemons', 'lemon juice'] },
  { id: 'sku-lime', name: 'Lime', price: 0.59, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['lime', 'limes', 'lime juice'] },
  { id: 'sku-avocado', name: 'Avocado', price: 1.49, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['avocado', 'avocados'] },
  { id: 'sku-zucchini', name: 'Zucchini', price: 1.29, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['zucchini', 'zucchinis', 'courgette'] },
  { id: 'sku-cucumber', name: 'Cucumber', price: 0.99, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['cucumber', 'cucumbers'] },
  { id: 'sku-green-beans', name: 'Green Beans', price: 2.49, aisle: 'Produce', packageUnit: '12 oz bag', hasLeftovers: true, keywords: ['green beans', 'string beans', 'haricots verts'] },
  { id: 'sku-corn', name: 'Sweet Corn', price: 0.79, aisle: 'Produce', packageUnit: 'ear', hasLeftovers: false, keywords: ['corn', 'sweet corn', 'corn on the cob'] },

  // Meat & Seafood
  { id: 'sku-chicken-breast', name: 'Boneless Chicken Breast', price: 5.99, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['chicken breast', 'chicken breasts', 'boneless chicken', 'chicken'] },
  { id: 'sku-chicken-thigh', name: 'Boneless Chicken Thighs', price: 4.99, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['chicken thighs', 'chicken thigh', 'boneless chicken thighs'] },
  { id: 'sku-ground-beef', name: 'Ground Beef 80/20', price: 4.99, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['ground beef', 'beef mince', 'minced beef', 'hamburger meat'] },
  { id: 'sku-steak', name: 'Sirloin Steak', price: 9.99, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['steak', 'sirloin', 'beef steak', 'flank steak', 'skirt steak', 'ribeye'] },
  { id: 'sku-pork-chops', name: 'Pork Chops', price: 4.49, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['pork chops', 'pork chop', 'pork loin chops'] },
  { id: 'sku-bacon', name: 'Bacon', price: 5.49, aisle: 'Meat', packageUnit: '12 oz pkg', hasLeftovers: true, keywords: ['bacon', 'bacon strips', 'smoked bacon'] },
  { id: 'sku-italian-sausage', name: 'Italian Sausage', price: 4.99, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['italian sausage', 'sausage', 'pork sausage', 'italian sausages'] },
  { id: 'sku-salmon', name: 'Atlantic Salmon Fillet', price: 8.99, aisle: 'Seafood', packageUnit: 'lb', hasLeftovers: false, keywords: ['salmon', 'salmon fillet', 'salmon fillets', 'atlantic salmon'] },
  { id: 'sku-shrimp', name: 'Shrimp 21-25ct', price: 9.99, aisle: 'Seafood', packageUnit: 'lb', hasLeftovers: false, keywords: ['shrimp', 'prawns', 'large shrimp', 'jumbo shrimp'] },
  { id: 'sku-tuna-can', name: 'Canned Tuna in Water', price: 1.49, aisle: 'Canned Goods', packageUnit: '5 oz can', hasLeftovers: false, keywords: ['canned tuna', 'tuna', 'tuna fish'] },

  // Dairy & Eggs
  { id: 'sku-eggs', name: 'Large Eggs', price: 3.99, aisle: 'Dairy', packageUnit: 'dozen', hasLeftovers: true, keywords: ['eggs', 'large eggs', 'egg'] },
  { id: 'sku-milk', name: 'Whole Milk', price: 3.49, aisle: 'Dairy', packageUnit: 'gallon', hasLeftovers: true, keywords: ['milk', 'whole milk', 'dairy milk'] },
  { id: 'sku-heavy-cream', name: 'Heavy Whipping Cream', price: 3.99, aisle: 'Dairy', packageUnit: 'pint', hasLeftovers: true, keywords: ['heavy cream', 'heavy whipping cream', 'whipping cream', 'double cream'] },
  { id: 'sku-half-and-half', name: 'Half & Half', price: 2.99, aisle: 'Dairy', packageUnit: 'pint', hasLeftovers: true, keywords: ['half and half', 'half & half', 'cream'] },
  { id: 'sku-butter', name: 'Unsalted Butter', price: 4.49, aisle: 'Dairy', packageUnit: 'lb (4 sticks)', hasLeftovers: true, keywords: ['butter', 'unsalted butter', 'salted butter'] },
  { id: 'sku-cream-cheese', name: 'Cream Cheese', price: 2.99, aisle: 'Dairy', packageUnit: '8 oz block', hasLeftovers: true, keywords: ['cream cheese', 'philadelphia cream cheese'] },
  { id: 'sku-sour-cream', name: 'Sour Cream', price: 2.49, aisle: 'Dairy', packageUnit: '16 oz tub', hasLeftovers: true, keywords: ['sour cream', 'creme fraiche'] },
  { id: 'sku-greek-yogurt', name: 'Plain Greek Yogurt', price: 1.49, aisle: 'Dairy', packageUnit: '5.3 oz', hasLeftovers: false, keywords: ['greek yogurt', 'plain yogurt', 'yogurt', 'plain greek yogurt'] },
  { id: 'sku-parmesan', name: 'Parmesan Cheese', price: 5.49, aisle: 'Cheese', packageUnit: '8 oz wedge', hasLeftovers: true, keywords: ['parmesan', 'parmesan cheese', 'parmigiano', 'grated parmesan', 'parmigiano-reggiano'] },
  { id: 'sku-mozzarella', name: 'Shredded Mozzarella', price: 3.49, aisle: 'Cheese', packageUnit: '8 oz bag', hasLeftovers: true, keywords: ['mozzarella', 'shredded mozzarella', 'mozzarella cheese', 'fresh mozzarella'] },
  { id: 'sku-cheddar', name: 'Cheddar Cheese', price: 4.99, aisle: 'Cheese', packageUnit: '8 oz block', hasLeftovers: true, keywords: ['cheddar', 'cheddar cheese', 'shredded cheddar'] },
  { id: 'sku-feta', name: 'Feta Cheese', price: 4.49, aisle: 'Cheese', packageUnit: '6 oz', hasLeftovers: true, keywords: ['feta', 'feta cheese', 'crumbled feta'] },

  // Dry Goods & Pantry
  { id: 'sku-spaghetti', name: 'Spaghetti', price: 1.29, aisle: 'Pasta', packageUnit: '1 lb box', hasLeftovers: true, keywords: ['spaghetti'] },
  { id: 'sku-penne', name: 'Penne Pasta', price: 1.49, aisle: 'Pasta', packageUnit: '1 lb box', hasLeftovers: true, keywords: ['penne', 'penne pasta', 'penne rigate'] },
  { id: 'sku-fettuccine', name: 'Fettuccine', price: 1.49, aisle: 'Pasta', packageUnit: '1 lb box', hasLeftovers: true, keywords: ['fettuccine', 'fettuccini', 'linguine', 'pasta'] },
  { id: 'sku-rice', name: 'Long-Grain White Rice', price: 4.99, aisle: 'Grains', packageUnit: '5 lb bag', hasLeftovers: true, keywords: ['rice', 'white rice', 'long grain rice', 'jasmine rice'] },
  { id: 'sku-flour', name: 'All-Purpose Flour', price: 3.49, aisle: 'Baking', packageUnit: '5 lb bag', hasLeftovers: true, keywords: ['flour', 'all-purpose flour', 'all purpose flour', 'plain flour'] },
  { id: 'sku-sugar', name: 'Granulated Sugar', price: 2.99, aisle: 'Baking', packageUnit: '4 lb bag', hasLeftovers: true, keywords: ['sugar', 'granulated sugar', 'white sugar'] },
  { id: 'sku-brown-sugar', name: 'Brown Sugar', price: 2.79, aisle: 'Baking', packageUnit: '2 lb bag', hasLeftovers: true, keywords: ['brown sugar', 'light brown sugar', 'dark brown sugar'] },
  { id: 'sku-powdered-sugar', name: 'Powdered Sugar', price: 2.49, aisle: 'Baking', packageUnit: '2 lb bag', hasLeftovers: true, keywords: ['powdered sugar', 'confectioners sugar', 'icing sugar'] },
  { id: 'sku-olive-oil', name: 'Extra Virgin Olive Oil', price: 7.49, aisle: 'Oils', packageUnit: '16 oz bottle', hasLeftovers: true, keywords: ['olive oil', 'extra virgin olive oil', 'evoo'] },
  { id: 'sku-veg-oil', name: 'Vegetable Oil', price: 3.99, aisle: 'Oils', packageUnit: '48 oz bottle', hasLeftovers: true, keywords: ['vegetable oil', 'canola oil', 'neutral oil', 'cooking oil'] },
  { id: 'sku-sesame-oil', name: 'Sesame Oil', price: 4.99, aisle: 'Oils', packageUnit: '8 oz bottle', hasLeftovers: true, keywords: ['sesame oil', 'toasted sesame oil'] },
  { id: 'sku-chicken-broth', name: 'Chicken Broth', price: 2.49, aisle: 'Canned Goods', packageUnit: '32 oz carton', hasLeftovers: true, keywords: ['chicken broth', 'chicken stock', 'chicken bouillon'] },
  { id: 'sku-beef-broth', name: 'Beef Broth', price: 2.49, aisle: 'Canned Goods', packageUnit: '32 oz carton', hasLeftovers: true, keywords: ['beef broth', 'beef stock'] },
  { id: 'sku-diced-tomatoes', name: 'Canned Diced Tomatoes', price: 1.29, aisle: 'Canned Goods', packageUnit: '14.5 oz can', hasLeftovers: false, keywords: ['diced tomatoes', 'canned tomatoes', 'canned diced tomatoes', 'crushed tomatoes'] },
  { id: 'sku-tomato-paste', name: 'Tomato Paste', price: 1.19, aisle: 'Canned Goods', packageUnit: '6 oz can', hasLeftovers: true, keywords: ['tomato paste'] },
  { id: 'sku-pasta-sauce', name: 'Marinara Sauce', price: 2.99, aisle: 'Canned Goods', packageUnit: '24 oz jar', hasLeftovers: true, keywords: ['pasta sauce', 'marinara sauce', 'marinara', 'tomato sauce'] },
  { id: 'sku-coconut-milk', name: 'Coconut Milk', price: 1.99, aisle: 'Canned Goods', packageUnit: '13.5 oz can', hasLeftovers: false, keywords: ['coconut milk', 'full-fat coconut milk'] },
  { id: 'sku-soy-sauce', name: 'Soy Sauce', price: 2.79, aisle: 'Condiments', packageUnit: '10 oz bottle', hasLeftovers: true, keywords: ['soy sauce', 'low sodium soy sauce', 'tamari'] },
  { id: 'sku-worcestershire', name: 'Worcestershire Sauce', price: 2.49, aisle: 'Condiments', packageUnit: '10 oz bottle', hasLeftovers: true, keywords: ['worcestershire sauce', 'worcestershire'] },
  { id: 'sku-hot-sauce', name: 'Hot Sauce', price: 2.99, aisle: 'Condiments', packageUnit: '5 oz bottle', hasLeftovers: true, keywords: ['hot sauce', 'sriracha', 'tabasco', 'frank\'s red hot'] },
  { id: 'sku-dijon', name: 'Dijon Mustard', price: 2.99, aisle: 'Condiments', packageUnit: '8 oz jar', hasLeftovers: true, keywords: ['dijon mustard', 'dijon', 'mustard'] },
  { id: 'sku-honey', name: 'Honey', price: 5.99, aisle: 'Condiments', packageUnit: '12 oz bottle', hasLeftovers: true, keywords: ['honey'] },
  { id: 'sku-maple-syrup', name: 'Maple Syrup', price: 7.99, aisle: 'Condiments', packageUnit: '8 oz bottle', hasLeftovers: true, keywords: ['maple syrup', 'pure maple syrup'] },
  { id: 'sku-panko', name: 'Panko Breadcrumbs', price: 2.99, aisle: 'Baking', packageUnit: '8 oz bag', hasLeftovers: true, keywords: ['panko', 'panko breadcrumbs', 'breadcrumbs', 'bread crumbs'] },
  { id: 'sku-cornstarch', name: 'Cornstarch', price: 1.99, aisle: 'Baking', packageUnit: '16 oz box', hasLeftovers: true, keywords: ['cornstarch', 'corn starch', 'cornflour'] },
  { id: 'sku-baking-powder', name: 'Baking Powder', price: 2.49, aisle: 'Baking', packageUnit: '8 oz can', hasLeftovers: true, keywords: ['baking powder'] },
  { id: 'sku-baking-soda', name: 'Baking Soda', price: 1.49, aisle: 'Baking', packageUnit: '1 lb box', hasLeftovers: true, keywords: ['baking soda', 'bicarbonate of soda', 'bicarb'] },
  { id: 'sku-vanilla', name: 'Pure Vanilla Extract', price: 4.99, aisle: 'Baking', packageUnit: '4 oz bottle', hasLeftovers: true, keywords: ['vanilla extract', 'pure vanilla extract', 'vanilla'] },
  { id: 'sku-breadcrumbs', name: 'Italian Breadcrumbs', price: 2.49, aisle: 'Baking', packageUnit: '8 oz can', hasLeftovers: true, keywords: ['italian breadcrumbs', 'seasoned breadcrumbs'] },

  // Legumes & beans
  { id: 'sku-black-beans', name: 'Black Beans', price: 1.09, aisle: 'Canned Goods', packageUnit: '15 oz can', hasLeftovers: false, keywords: ['black beans', 'black bean'] },
  { id: 'sku-kidney-beans', name: 'Kidney Beans', price: 1.09, aisle: 'Canned Goods', packageUnit: '15 oz can', hasLeftovers: false, keywords: ['kidney beans', 'kidney bean', 'red kidney beans'] },
  { id: 'sku-chickpeas', name: 'Chickpeas', price: 1.19, aisle: 'Canned Goods', packageUnit: '15 oz can', hasLeftovers: false, keywords: ['chickpeas', 'garbanzo beans', 'chickpea', 'garbanzo'] },
  { id: 'sku-white-beans', name: 'Cannellini Beans', price: 1.19, aisle: 'Canned Goods', packageUnit: '15 oz can', hasLeftovers: false, keywords: ['white beans', 'cannellini beans', 'great northern beans', 'navy beans'] },
  { id: 'sku-lentils', name: 'Green Lentils', price: 2.49, aisle: 'Dry Goods', packageUnit: '1 lb bag', hasLeftovers: true, keywords: ['lentils', 'green lentils', 'red lentils', 'brown lentils'] },
  { id: 'sku-pinto-beans', name: 'Pinto Beans', price: 1.09, aisle: 'Canned Goods', packageUnit: '15 oz can', hasLeftovers: false, keywords: ['pinto beans', 'pinto bean'] },

  // Fresh herbs
  { id: 'sku-cilantro', name: 'Fresh Cilantro', price: 0.99, aisle: 'Produce', packageUnit: 'bunch', hasLeftovers: true, keywords: ['cilantro', 'coriander', 'fresh cilantro', 'fresh coriander'] },
  { id: 'sku-parsley', name: 'Fresh Parsley', price: 0.99, aisle: 'Produce', packageUnit: 'bunch', hasLeftovers: true, keywords: ['parsley', 'fresh parsley', 'flat-leaf parsley', 'italian parsley', 'curly parsley'] },
  { id: 'sku-mint', name: 'Fresh Mint', price: 1.99, aisle: 'Produce', packageUnit: 'bunch', hasLeftovers: true, keywords: ['mint', 'fresh mint', 'spearmint', 'peppermint leaves'] },
  { id: 'sku-sage', name: 'Fresh Sage', price: 1.99, aisle: 'Produce', packageUnit: 'pkg', hasLeftovers: true, keywords: ['sage', 'fresh sage', 'dried sage'] },
  { id: 'sku-chives', name: 'Fresh Chives', price: 1.99, aisle: 'Produce', packageUnit: 'pkg', hasLeftovers: true, keywords: ['chives', 'fresh chives'] },
  { id: 'sku-dill', name: 'Fresh Dill', price: 1.99, aisle: 'Produce', packageUnit: 'pkg', hasLeftovers: true, keywords: ['dill', 'fresh dill', 'dill weed'] },
  { id: 'sku-tarragon', name: 'Fresh Tarragon', price: 1.99, aisle: 'Produce', packageUnit: 'pkg', hasLeftovers: true, keywords: ['tarragon', 'fresh tarragon'] },

  // Bread & bakery
  { id: 'sku-bread', name: 'Sandwich Bread', price: 3.49, aisle: 'Bakery', packageUnit: 'loaf', hasLeftovers: true, keywords: ['bread', 'sandwich bread', 'white bread', 'whole wheat bread', 'sourdough bread', 'sliced bread'] },
  { id: 'sku-tortillas-flour', name: 'Flour Tortillas', price: 3.29, aisle: 'Bakery', packageUnit: '10-count pkg', hasLeftovers: true, keywords: ['flour tortillas', 'tortillas', 'flour tortilla'] },
  { id: 'sku-tortillas-corn', name: 'Corn Tortillas', price: 2.99, aisle: 'Bakery', packageUnit: '30-count pkg', hasLeftovers: true, keywords: ['corn tortillas', 'corn tortilla'] },
  { id: 'sku-pita', name: 'Pita Bread', price: 3.49, aisle: 'Bakery', packageUnit: '6-count pkg', hasLeftovers: true, keywords: ['pita bread', 'pita', 'flatbread'] },

  // Proteins / plant-based
  { id: 'sku-tofu', name: 'Extra Firm Tofu', price: 2.99, aisle: 'Produce', packageUnit: '14 oz block', hasLeftovers: false, keywords: ['tofu', 'firm tofu', 'extra firm tofu', 'silken tofu'] },
  { id: 'sku-tempeh', name: 'Tempeh', price: 3.49, aisle: 'Produce', packageUnit: '8 oz pkg', hasLeftovers: false, keywords: ['tempeh'] },

  // Dairy alternatives & extras
  { id: 'sku-almond-milk', name: 'Almond Milk', price: 3.99, aisle: 'Dairy', packageUnit: '32 oz carton', hasLeftovers: true, keywords: ['almond milk', 'unsweetened almond milk', 'oat milk', 'soy milk', 'plant-based milk'] },
  { id: 'sku-peanut-butter', name: 'Peanut Butter', price: 4.49, aisle: 'Condiments', packageUnit: '16 oz jar', hasLeftovers: true, keywords: ['peanut butter', 'creamy peanut butter', 'natural peanut butter'] },
  { id: 'sku-tahini', name: 'Tahini', price: 6.99, aisle: 'Condiments', packageUnit: '16 oz jar', hasLeftovers: true, keywords: ['tahini', 'sesame paste'] },
  { id: 'sku-capers', name: 'Capers', price: 3.49, aisle: 'Condiments', packageUnit: '3.5 oz jar', hasLeftovers: true, keywords: ['capers', 'caper'] },
  { id: 'sku-olives', name: 'Kalamata Olives', price: 3.99, aisle: 'Condiments', packageUnit: '6 oz jar', hasLeftovers: true, keywords: ['olives', 'kalamata olives', 'black olives', 'green olives'] },
  { id: 'sku-veg-broth', name: 'Vegetable Broth', price: 2.49, aisle: 'Canned Goods', packageUnit: '32 oz carton', hasLeftovers: true, keywords: ['vegetable broth', 'vegetable stock', 'veg broth', 'veggie broth'] },
  { id: 'sku-cream-soup', name: 'Cream of Mushroom Soup', price: 1.49, aisle: 'Canned Goods', packageUnit: '10.5 oz can', hasLeftovers: false, keywords: ['cream of mushroom soup', 'cream of chicken soup', 'condensed soup'] },
  { id: 'sku-wine-white', name: 'Dry White Wine', price: 8.99, aisle: 'Wine & Spirits', packageUnit: '750ml bottle', hasLeftovers: true, keywords: ['white wine', 'dry white wine', 'sauvignon blanc', 'pinot grigio', 'chardonnay'] },
  { id: 'sku-wine-red', name: 'Dry Red Wine', price: 8.99, aisle: 'Wine & Spirits', packageUnit: '750ml bottle', hasLeftovers: true, keywords: ['red wine', 'dry red wine', 'cabernet sauvignon', 'merlot', 'pinot noir'] },
  { id: 'sku-vinegar-balsamic', name: 'Balsamic Vinegar', price: 4.99, aisle: 'Condiments', packageUnit: '16 oz bottle', hasLeftovers: true, keywords: ['balsamic vinegar', 'balsamic'] },
  { id: 'sku-vinegar-white', name: 'White Wine Vinegar', price: 3.49, aisle: 'Condiments', packageUnit: '16 oz bottle', hasLeftovers: true, keywords: ['white wine vinegar', 'white vinegar', 'apple cider vinegar', 'rice vinegar', 'red wine vinegar', 'vinegar'] },
  { id: 'sku-fish-sauce', name: 'Fish Sauce', price: 3.99, aisle: 'International', packageUnit: '6.76 oz bottle', hasLeftovers: true, keywords: ['fish sauce', 'nam pla'] },
  { id: 'sku-hoisin', name: 'Hoisin Sauce', price: 3.49, aisle: 'International', packageUnit: '8.1 oz bottle', hasLeftovers: true, keywords: ['hoisin sauce', 'hoisin'] },
  { id: 'sku-oyster-sauce', name: 'Oyster Sauce', price: 3.49, aisle: 'International', packageUnit: '9 oz bottle', hasLeftovers: true, keywords: ['oyster sauce'] },
  { id: 'sku-chili-paste', name: 'Chili Paste', price: 3.99, aisle: 'International', packageUnit: '7 oz jar', hasLeftovers: true, keywords: ['chili paste', 'gochujang', 'sambal oelek', 'chili garlic sauce'] },
  { id: 'sku-curry-paste', name: 'Red Curry Paste', price: 2.99, aisle: 'International', packageUnit: '4 oz jar', hasLeftovers: true, keywords: ['red curry paste', 'green curry paste', 'yellow curry paste', 'curry paste'] },
  { id: 'sku-ginger', name: 'Fresh Ginger', price: 0.99, aisle: 'Produce', packageUnit: 'piece', hasLeftovers: true, keywords: ['ginger', 'fresh ginger', 'ginger root'] },
  { id: 'sku-scallions', name: 'Green Onions', price: 0.99, aisle: 'Produce', packageUnit: 'bunch', hasLeftovers: true, keywords: ['green onions', 'scallions', 'spring onions', 'green onion', 'scallion'] },
  { id: 'sku-jalapeño', name: 'Jalapeño Pepper', price: 0.49, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['jalapeño', 'jalapeno', 'jalapeños', 'jalapenos', 'jalapeño pepper'] },
  { id: 'sku-serrano', name: 'Serrano Pepper', price: 0.49, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['serrano', 'serrano pepper', 'chili pepper', 'green chili'] },
  { id: 'sku-eggplant', name: 'Eggplant', price: 1.99, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['eggplant', 'aubergine'] },
  { id: 'sku-sweet-potato', name: 'Sweet Potato', price: 1.29, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['sweet potato', 'sweet potatoes', 'yam'] },
  { id: 'sku-butternut-squash', name: 'Butternut Squash', price: 2.49, aisle: 'Produce', packageUnit: 'each', hasLeftovers: false, keywords: ['butternut squash', 'squash', 'acorn squash'] },
  { id: 'sku-kale', name: 'Kale', price: 2.49, aisle: 'Produce', packageUnit: 'bunch', hasLeftovers: true, keywords: ['kale', 'lacinato kale', 'curly kale', 'tuscan kale'] },
  { id: 'sku-arugula', name: 'Arugula', price: 3.49, aisle: 'Produce', packageUnit: '5 oz bag', hasLeftovers: true, keywords: ['arugula', 'rocket'] },
  { id: 'sku-asparagus', name: 'Asparagus', price: 3.99, aisle: 'Produce', packageUnit: 'bunch', hasLeftovers: false, keywords: ['asparagus', 'asparagus spears'] },
  { id: 'sku-peas', name: 'Frozen Peas', price: 1.99, aisle: 'Frozen', packageUnit: '10 oz bag', hasLeftovers: true, keywords: ['peas', 'frozen peas', 'green peas', 'sweet peas'] },
  { id: 'sku-corn-frozen', name: 'Frozen Corn', price: 1.99, aisle: 'Frozen', packageUnit: '10 oz bag', hasLeftovers: true, keywords: ['frozen corn', 'corn kernels', 'sweet corn kernels'] },
  { id: 'sku-edamame', name: 'Frozen Edamame', price: 2.99, aisle: 'Frozen', packageUnit: '12 oz bag', hasLeftovers: true, keywords: ['edamame', 'frozen edamame'] },
  { id: 'sku-ground-turkey', name: 'Ground Turkey', price: 4.99, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['ground turkey', 'turkey mince'] },
  { id: 'sku-lamb', name: 'Ground Lamb', price: 7.99, aisle: 'Meat', packageUnit: 'lb', hasLeftovers: false, keywords: ['ground lamb', 'lamb mince', 'lamb'] },
  { id: 'sku-cod', name: 'Cod Fillet', price: 7.99, aisle: 'Seafood', packageUnit: 'lb', hasLeftovers: false, keywords: ['cod', 'cod fillet', 'white fish', 'tilapia', 'halibut'] },
  { id: 'sku-chocolate-chips', name: 'Semi-Sweet Chocolate Chips', price: 3.49, aisle: 'Baking', packageUnit: '12 oz bag', hasLeftovers: true, keywords: ['chocolate chips', 'semi-sweet chocolate chips', 'dark chocolate chips', 'chocolate'] },
  { id: 'sku-cocoa', name: 'Unsweetened Cocoa Powder', price: 3.99, aisle: 'Baking', packageUnit: '8 oz can', hasLeftovers: true, keywords: ['cocoa powder', 'unsweetened cocoa', 'cocoa'] },
  { id: 'sku-oats', name: 'Old-Fashioned Oats', price: 4.49, aisle: 'Breakfast', packageUnit: '18 oz container', hasLeftovers: true, keywords: ['oats', 'rolled oats', 'old-fashioned oats', 'quick oats', 'oatmeal'] },

  // Spices
  { id: 'sku-salt', name: 'Kosher Salt', price: 1.29, aisle: 'Spices', packageUnit: '26 oz box', hasLeftovers: true, keywords: ['salt', 'kosher salt', 'sea salt', 'table salt', 'fine salt'] },
  { id: 'sku-black-pepper', name: 'Black Pepper', price: 2.99, aisle: 'Spices', packageUnit: '4 oz jar', hasLeftovers: true, keywords: ['black pepper', 'pepper', 'ground black pepper', 'freshly ground pepper'] },
  { id: 'sku-garlic-powder', name: 'Garlic Powder', price: 2.49, aisle: 'Spices', packageUnit: '3.1 oz jar', hasLeftovers: true, keywords: ['garlic powder'] },
  { id: 'sku-onion-powder', name: 'Onion Powder', price: 2.29, aisle: 'Spices', packageUnit: '3 oz jar', hasLeftovers: true, keywords: ['onion powder'] },
  { id: 'sku-paprika', name: 'Paprika', price: 2.49, aisle: 'Spices', packageUnit: '3.1 oz jar', hasLeftovers: true, keywords: ['paprika', 'smoked paprika', 'sweet paprika'] },
  { id: 'sku-cumin', name: 'Ground Cumin', price: 2.49, aisle: 'Spices', packageUnit: '2.1 oz jar', hasLeftovers: true, keywords: ['cumin', 'ground cumin', 'cumin seeds'] },
  { id: 'sku-oregano', name: 'Dried Oregano', price: 2.49, aisle: 'Spices', packageUnit: '0.75 oz jar', hasLeftovers: true, keywords: ['oregano', 'dried oregano'] },
  { id: 'sku-basil', name: 'Dried Basil', price: 2.49, aisle: 'Spices', packageUnit: '0.62 oz jar', hasLeftovers: true, keywords: ['basil', 'dried basil', 'fresh basil'] },
  { id: 'sku-thyme', name: 'Dried Thyme', price: 2.49, aisle: 'Spices', packageUnit: '0.65 oz jar', hasLeftovers: true, keywords: ['thyme', 'dried thyme', 'fresh thyme'] },
  { id: 'sku-rosemary', name: 'Dried Rosemary', price: 2.49, aisle: 'Spices', packageUnit: '0.62 oz jar', hasLeftovers: true, keywords: ['rosemary', 'dried rosemary', 'fresh rosemary'] },
  { id: 'sku-red-pepper-flakes', name: 'Red Pepper Flakes', price: 2.49, aisle: 'Spices', packageUnit: '1.5 oz jar', hasLeftovers: true, keywords: ['red pepper flakes', 'chili flakes', 'crushed red pepper', 'red chili flakes'] },
  { id: 'sku-chili-powder', name: 'Chili Powder', price: 2.29, aisle: 'Spices', packageUnit: '2.5 oz jar', hasLeftovers: true, keywords: ['chili powder', 'chili seasoning'] },
  { id: 'sku-italian-seasoning', name: 'Italian Seasoning', price: 2.49, aisle: 'Spices', packageUnit: '0.75 oz jar', hasLeftovers: true, keywords: ['italian seasoning', 'italian herbs'] },
  { id: 'sku-cinnamon', name: 'Ground Cinnamon', price: 2.99, aisle: 'Spices', packageUnit: '2.37 oz jar', hasLeftovers: true, keywords: ['cinnamon', 'ground cinnamon'] },
  { id: 'sku-turmeric', name: 'Ground Turmeric', price: 2.49, aisle: 'Spices', packageUnit: '2.37 oz jar', hasLeftovers: true, keywords: ['turmeric', 'ground turmeric'] },
  { id: 'sku-bay-leaves', name: 'Bay Leaves', price: 2.49, aisle: 'Spices', packageUnit: '0.25 oz jar', hasLeftovers: true, keywords: ['bay leaves', 'bay leaf'] },
]

export function matchIngredient(rawText: string): CatalogEntry | null {
  const normalized = normalizeIngredient(rawText).toLowerCase().trim()
  if (!normalized) return null

  let best: CatalogEntry | null = null
  let bestScore = 0

  for (const entry of CATALOG) {
    for (const kw of entry.keywords) {
      const k = kw.toLowerCase()
      let score = 0
      if (normalized === k) {
        // Exact match — highest priority, longer keyword wins ties
        score = 10000 + k.length
      } else if (normalized.includes(k)) {
        score = k.length
      } else if (k.includes(normalized)) {
        score = normalized.length
      }
      if (score > bestScore) {
        bestScore = score
        best = entry
      }
    }
  }

  // Require at least 3 chars matched to avoid spurious matches
  return bestScore >= 3 ? best : null
}

export function suggestSubstitutes(rawText: string, limit = 3): CatalogEntry[] {
  const words = rawText.toLowerCase().split(/\W+/).filter((w) => w.length >= 3)
  if (!words.length) return []
  return CATALOG.map((entry) => {
    const kws = entry.keywords.join(' ').toLowerCase()
    const score = words.filter((w) => kws.includes(w)).length
    return { entry, score }
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry)
}
