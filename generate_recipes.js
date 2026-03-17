const fs = require('fs');

const baseIngredients = [
    { name: 'Salt', unit: 'g', min: 2, max: 20 },
    { name: 'Black Pepper', unit: 'g', min: 1, max: 10 },
    { name: 'Olive Oil', unit: 'ml', min: 10, max: 100 },
    { name: 'Butter', unit: 'g', min: 10, max: 200 },
    { name: 'Garlic', unit: 'g', min: 5, max: 50 },
    { name: 'Onion', unit: 'g', min: 50, max: 300 },
    { name: 'Water', unit: 'ml', min: 50, max: 1000 },
    { name: 'Thyme', unit: 'g', min: 2, max: 15 },
    { name: 'Rosemary', unit: 'g', min: 2, max: 15 },
    { name: 'Lemon Juice', unit: 'ml', min: 5, max: 50 },
    { name: 'White Wine', unit: 'ml', min: 50, max: 250 },
    { name: 'Heavy Cream', unit: 'ml', min: 50, max: 300 },
    { name: 'Parmesan', unit: 'g', min: 20, max: 150 },
    { name: 'Chicken Stock', unit: 'ml', min: 100, max: 1000 }
];

const mainIngredients = [
    { name: 'Salmon Fillet', unit: 'g', min: 800, max: 1200 },
    { name: 'Ribeye Steak', unit: 'g', min: 1000, max: 1500 },
    { name: 'Chicken Breast', unit: 'g', min: 800, max: 1200 },
    { name: 'Pork Belly', unit: 'g', min: 1000, max: 2000 },
    { name: 'Tofu', unit: 'g', min: 500, max: 1000 },
    { name: 'Arborio Rice', unit: 'g', min: 400, max: 1000 },
    { name: 'Pasta', unit: 'g', min: 500, max: 1000 },
    { name: 'Potatoes', unit: 'g', min: 500, max: 1500 },
    { name: 'Lobster Tail', unit: 'pcs', min: 2, max: 6 },
    { name: 'Duck Breast', unit: 'g', min: 600, max: 1200 }
];

const dishNames = [
    'Pan-Seared Salmon', 'Grilled Ribeye', 'Roasted Chicken', 'Crispy Pork Belly',
    'Mapo Tofu', 'Mushroom Risotto', 'Truffle Pasta', 'Potato Gratin',
    'Lobster Bisque', 'Duck Confit', 'Beef Bourguignon', 'Chicken Piccata',
    'Beef Stroganoff', 'Pork Chops', 'Vegan Curry', 'Seafood Paella',
    'Lamb Shank', 'Veal Milanese', 'Shrimp Scampi', 'Eggplant Parmesan',
    'Chicken Marsala', 'Braised Short Ribs', 'Clam Chowder', 'Fettuccine Alfredo',
    'Beef Carpaccio', 'Miso Cod', 'Chilean Sea Bass', 'Bouillabaisse',
    'Coq au Vin', 'Osso Buco', 'Rack of Lamb', 'Peking Duck',
    'Pad Thai', 'Tom Yum Soup', 'Chicken Tikka Masala', 'Beef Wellington',
    'Lobster Thermidor', 'Truffle Risotto', 'Wagyu Burger', 'Scallop Ceviche',
    'Tuna Tartare', 'Oysters Rockefeller', 'Crab Cakes', 'Gnocchi',
    'Lasagna', 'Spaghetti Carbonara', 'Cacio e Pepe', 'Margherita Pizza',
    'Ratatouille', 'Caesar Salad'
];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRecipes = () => {
    const recipes = [];
    for (let i = 0; i < 50; i++) {
        const name = dishNames[i];
        const basePortions = getRandomInt(4, 12);
        const prepTime = `${getRandomInt(15, 120)} mins`;
        const tempMatch = name.toLowerCase().match(/steak|beef|burger|lamb/);
        const standardTemp = tempMatch ? `${getRandomInt(135, 155)}°F` : (name.toLowerCase().match(/chicken|poultry|duck/) ? `${getRandomInt(160, 165)}°F` : `${getRandomInt(140, 180)}°F`);
        
        // Pick one main ingredient and 9 base ingredients randomly
        const selectedMain = mainIngredients[getRandomInt(0, mainIngredients.length - 1)];
        let availableBase = [...baseIngredients];
        // Shuffle base ingredients
        availableBase.sort(() => 0.5 - Math.random());
        const selectedBase = availableBase.slice(0, 9);
        
        const ingredients = [
            { name: selectedMain.name, amount: getRandomInt(selectedMain.min, selectedMain.max), unit: selectedMain.unit },
            ...selectedBase.map(ing => ({
                name: ing.name,
                amount: getRandomInt(ing.min, ing.max),
                unit: ing.unit
            }))
        ];

        recipes.push({
            id: i + 1,
            name,
            basePortions,
            ingredients,
            prepTime,
            standardTemp
        });
    }
    return recipes;
};

const recipes = generateRecipes();
fs.writeFileSync('c:/Users/smile/.antigravity/kitchen-optimizer/backend/recipes.json', JSON.stringify(recipes, null, 2));
console.log('Successfully generated 50 recipes and saved to recipes.json');
