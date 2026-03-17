const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Master Chef Credentials
const MASTER_CHEF_USERNAME = 'masterchef';
const MASTER_CHEF_PASSWORD = 'password123';

// In-memory mock database
let recipes = [
    { 
        id: 1, 
        name: 'Truffle Risotto', 
        basePortions: 10, 
        ingredients: [ 
            { name: 'Arborio Rice', amount: 1000, unit: 'g' }, 
            { name: 'Truffle Oil', amount: 50, unit: 'ml' }, 
            { name: 'Parmesan', amount: 200, unit: 'g' },
            { name: 'White Wine', amount: 250, unit: 'ml'},
            { name: 'Shallots', amount: 150, unit: 'g'},
            { name: 'Garlic', amount: 30, unit: 'g'},
            { name: 'Butter', amount: 150, unit: 'g'},
            { name: 'Heavy Cream', amount: 100, unit: 'ml'},
            { name: 'Vegetable Stock', amount: 3000, unit: 'ml'},
            { name: 'Fresh Thyme', amount: 10, unit: 'g'},
            { name: 'Salt', amount: 15, unit: 'g'},
            { name: 'Black Pepper', amount: 5, unit: 'g'}
        ], 
        prepTime: '45 mins', 
        standardTemp: '165°F' 
    },
    { 
        id: 2, 
        name: 'Wagyu Burger', 
        basePortions: 4, 
        ingredients: [ 
            { name: 'Wagyu Beef', amount: 800, unit: 'g' }, 
            { name: 'Brioche Bun', amount: 4, unit: 'pcs' }, 
            { name: 'Secret Sauce', amount: 120, unit: 'ml' },
            { name: 'Aged Cheddar', amount: 4, unit: 'slices'},
            { name: 'Caramelized Onions', amount: 200, unit: 'g'},
            { name: 'Crispy Bacon', amount: 8, unit: 'slices'},
            { name: 'Butter Lettuce', amount: 4, unit: 'leaves'},
            { name: 'Heirloom Tomato', amount: 4, unit: 'slices'},
            { name: 'Pickles', amount: 40, unit: 'g'},
            { name: 'Salt', amount: 8, unit: 'g'},
            { name: 'Black Pepper', amount: 4, unit: 'g'}
        ], 
        prepTime: '15 mins', 
        standardTemp: '145°F' 
    },
    { 
        id: 3, 
        name: 'Beef Wellington', 
        basePortions: 6, 
        ingredients: [ 
            { name: 'Beef Tenderloin', amount: 1000, unit: 'g' }, 
            { name: 'Puff Pastry', amount: 500, unit: 'g' }, 
            { name: 'Mushrooms (Duxelles)', amount: 400, unit: 'g' },
            { name: 'Prosciutto', amount: 150, unit: 'g'},
            { name: 'English Mustard', amount: 50, unit: 'g'},
            { name: 'Egg Wash', amount: 1, unit: 'pc'},
            { name: 'Thyme', amount: 15, unit: 'g'},
            { name: 'Butter', amount: 50, unit: 'g'},
            { name: 'Salt', amount: 20, unit: 'g'},
            { name: 'Black Pepper', amount: 10, unit: 'g'}
        ], 
        prepTime: '2 hours', 
        standardTemp: '135°F' 
    },
    { 
        id: 4, 
        name: 'Lobster Thermidor', 
        basePortions: 2, 
        ingredients: [ 
            { name: 'Whole Lobster', amount: 2, unit: 'pcs' }, 
            { name: 'Gruyere Cheese', amount: 100, unit: 'g' }, 
            { name: 'Heavy Cream', amount: 150, unit: 'ml' },
            { name: 'Cognac', amount: 50, unit: 'ml'},
            { name: 'Dijon Mustard', amount: 30, unit: 'g'},
            { name: 'Shallots', amount: 50, unit: 'g'},
            { name: 'Butter', amount: 75, unit: 'g'},
            { name: 'Flour', amount: 20, unit: 'g'},
            { name: 'Tarragon', amount: 10, unit: 'g'},
            { name: 'Lemon Juice', amount: 15, unit: 'ml'}
        ], 
        prepTime: '40 mins', 
        standardTemp: '145°F' 
    }
];

let qualityLogs = [
    { id: 1, recipeId: 1, date: new Date().toISOString().split('T')[0], status: 'Passed', notes: 'Perfect consistency, vivid truffle aroma' }
];

// Get all recipes
app.get('/api/recipes', (req, res) => {
    res.json(recipes);
});

// Update a recipe (Master Chef only)
app.put('/api/recipes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
        recipes[index] = { ...recipes[index], ...req.body };
        res.json(recipes[index]);
    } else {
        res.status(404).json({ error: 'Recipe not found' });
    }
});

// Auth Route
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === MASTER_CHEF_USERNAME && password === MASTER_CHEF_PASSWORD) {
        res.json({ success: true, token: 'master-chef-temp-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Add a quality log
app.post('/api/quality', (req, res) => {
    // Basic automatic quality calculation based on inputs if not provided explicitly
    let calculatedStatus = req.body.status;
    let autoResult = "Verified by Chef";
    const reportedTemp = parseInt(req.body.temp);
    const recipe = recipes.find(r => r.id === parseInt(req.body.recipeId));
    
    if (recipe && reportedTemp) {
        const standardTemp = parseInt(recipe.standardTemp); // extract num from "165°F"
        if (Math.abs(reportedTemp - standardTemp) > 10) {
             calculatedStatus = 'Failed';
             autoResult = `Failed: Temp deviation (${reportedTemp}°F vs ${standardTemp}°F)`;
        } else if (Math.abs(reportedTemp - standardTemp) > 5) {
             calculatedStatus = 'Subpar';
             autoResult = `Subpar: Minor temp deviation (${reportedTemp}°F vs ${standardTemp}°F)`;
        } else {
             calculatedStatus = 'Passed';
             autoResult = `Passed: Temp on target`;
        }
    }

    const log = { 
        id: qualityLogs.length + 1, 
        recipeId: req.body.recipeId,
        status: calculatedStatus,
        notes: req.body.notes,
        temp: req.body.temp,
        autoResult: autoResult,
        date: new Date().toISOString().split('T')[0] 
    };
    qualityLogs.push(log);
    res.status(201).json(log);
});

// Get all quality logs
app.get('/api/quality', (req, res) => {
    res.json(qualityLogs);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Kitchen Optimizer API running on http://localhost:${PORT}`);
});
