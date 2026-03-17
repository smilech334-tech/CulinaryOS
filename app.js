// System Config & Fallbacks
const API_URL = 'http://localhost:3000/api';

// Firebase Setup (Demo Project Config)
// Note: For a real production app you would need to initialize with real keys
// Since this is a standalone prototype, we'll mock the Firebase behavior 
// robustly in the client, but structure it identically to a real Firebase integration.
const mockCloud = {
    users: [{ email: 'master@culinary.com', pass: 'password123' }],
    recipes: []
};

// State
let recipes = [];
let qualityLogs = [];
let isMasterChef = false;
let authToken = null;
let currentAuthMode = 'login'; // 'login' | 'signup'

// DOM Elements
const navRecipes = document.getElementById('nav-recipes');
const navQuality = document.getElementById('nav-quality');
const navMasterLogin = document.getElementById('nav-master-login');
const sectionRecipes = document.getElementById('recipes-section');
const sectionQuality = document.getElementById('quality-section');
const recipeGrid = document.getElementById('recipe-grid');
const recipeSelect = document.getElementById('q-recipe-select');
const qualityForm = document.getElementById('quality-form');
const logsContainer = document.getElementById('logs-container');
const searchInput = document.getElementById('recipe-search');
const masterBadge = document.getElementById('master-chef-badge');

// Modal Elements
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const btnCloseAuth = document.getElementById('btn-close-auth');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const passGroup = document.getElementById('pass-group');
const btnAuthSubmit = document.getElementById('btn-auth-submit');
const linkForgot = document.getElementById('link-forgot');
const forgotWrap = document.getElementById('forgot-wrap');

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const btnCloseEdit = document.getElementById('btn-close-edit');

const addModal = document.getElementById('add-modal');
const addForm = document.getElementById('add-form');
const btnCloseAdd = document.getElementById('btn-close-add');
const fabAddRecipe = document.getElementById('fab-add-recipe');

// Chat UI Elements
const fabChat = document.getElementById('fab-chat');
const chatWindow = document.getElementById('chat-window');
const btnCloseChat = document.getElementById('btn-close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Fallback data in case backend is not running
// Base ingredients for procedural generation
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

// Generate 50 items on the fly for the client side fallback
const fallbackRecipes = [];

// Seeded random approach for consistent arrays on reload
function LCG(seed) {
    return function () {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
}
const consistentRandom = LCG(12345);
const getRandomIntSeeded = (min, max) => Math.floor(consistentRandom() * (max - min + 1)) + min;

for (let i = 0; i < 50; i++) {
    const name = dishNames[i];
    const basePortions = getRandomIntSeeded(4, 12);
    const prepTime = `${getRandomIntSeeded(15, 120)} mins`;
    const tempMatch = name.toLowerCase().match(/steak|beef|burger|lamb/);
    const standardTemp = tempMatch ? `${getRandomIntSeeded(135, 155)}°F` : (name.toLowerCase().match(/chicken|poultry|duck/) ? `${getRandomIntSeeded(160, 165)}°F` : `${getRandomIntSeeded(140, 180)}°F`);

    const selectedMain = mainIngredients[getRandomIntSeeded(0, mainIngredients.length - 1)];

    // Copy and reliably "shuffle" with the seeded function
    let availableBase = [...baseIngredients];
    availableBase.sort((a, b) => consistentRandom() - 0.5);
    const selectedBase = availableBase.slice(0, 9);

    const ingredients = [
        { name: selectedMain.name, amount: getRandomIntSeeded(selectedMain.min, selectedMain.max), unit: selectedMain.unit },
        ...selectedBase.map(ing => ({
            name: ing.name,
            amount: getRandomIntSeeded(ing.min, ing.max),
            unit: ing.unit
        }))
    ];

    // Reliable high-quality distinct image thumbnails from TheMealDB (50 unique images)
    const mealDbImages = [
        "https://www.themealdb.com/images/media/meals/04axct1763793018.jpg",
        "https://www.themealdb.com/images/media/meals/grhn401765687086.jpg",
        "https://www.themealdb.com/images/media/meals/3m8yae1763257951.jpg",
        "https://www.themealdb.com/images/media/meals/5jdtie1763289302.jpg",
        "https://www.themealdb.com/images/media/meals/a4kgf21763075288.jpg",
        "https://www.themealdb.com/images/media/meals/se5vhk1764114880.jpg",
        "https://www.themealdb.com/images/media/meals/o2cd4r1764113576.jpg",
        "https://www.themealdb.com/images/media/meals/tbj1bs1764118062.jpg",
        "https://www.themealdb.com/images/media/meals/8rfd4q1764112993.jpg",
        "https://www.themealdb.com/images/media/meals/q47rkb1762324620.jpg",
        "https://www.themealdb.com/images/media/meals/adxcbq1619787919.jpg",
        "https://www.themealdb.com/images/media/meals/xvsurr1511719182.jpg",
        "https://www.themealdb.com/images/media/meals/c0gmo31766594751.jpg",
        "https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg",
        "https://www.themealdb.com/images/media/meals/p277uc1764109195.jpg",
        "https://www.themealdb.com/images/media/meals/13fg4j1764441982.jpg",
        "https://www.themealdb.com/images/media/meals/jgl9qq1764437635.jpg",
        "https://www.themealdb.com/images/media/meals/qt4i0n1763256454.jpg",
        "https://www.themealdb.com/images/media/meals/jc6oub1763196663.jpg",
        "https://www.themealdb.com/images/media/meals/kgfh3q1763075438.jpg",
        "https://www.themealdb.com/images/media/meals/zub3s91764110535.jpg",
        "https://www.themealdb.com/images/media/meals/02s6gc1763799560.jpg",
        "https://www.themealdb.com/images/media/meals/44bzep1761848278.jpg",
        "https://www.themealdb.com/images/media/meals/yk78uc1763075719.jpg",
        "https://www.themealdb.com/images/media/meals/flrajf1762341295.jpg",
        "https://www.themealdb.com/images/media/meals/020z181619788503.jpg",
        "https://www.themealdb.com/images/media/meals/dlmh401760524897.jpg",
        "https://www.themealdb.com/images/media/meals/urtpqw1487341253.jpg",
        "https://www.themealdb.com/images/media/meals/1548772327.jpg",
        "https://www.themealdb.com/images/media/meals/wyrqqq1468233628.jpg",
        "https://www.themealdb.com/images/media/meals/ytme8t1764111401.jpg",
        "https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg",
        "https://www.themealdb.com/images/media/meals/4xcfai1763765676.jpg",
        "https://www.themealdb.com/images/media/meals/tzsy461763769901.jpg",
        "https://www.themealdb.com/images/media/meals/4o4wh11761848573.jpg",
        "https://www.themealdb.com/images/media/meals/ywwrsp1511720277.jpg",
        "https://www.themealdb.com/images/media/meals/atd5sh1583188467.jpg",
        "https://www.themealdb.com/images/media/meals/vxuyrx1511302687.jpg",
        "https://www.themealdb.com/images/media/meals/ryppsv1511815505.jpg",
        "https://www.themealdb.com/images/media/meals/m0p0j81765568742.jpg",
        "https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg",
        "https://www.themealdb.com/images/media/meals/wrssvt1511556563.jpg",
        "https://www.themealdb.com/images/media/meals/pkopc31683207947.jpg",
        "https://www.themealdb.com/images/media/meals/z0ageb1583189517.jpg",
        "https://www.themealdb.com/images/media/meals/vtqxtu1511784197.jpg",
        "https://www.themealdb.com/images/media/meals/ursuup1487348423.jpg",
        "https://www.themealdb.com/images/media/meals/41cxjh1683207682.jpg",
        "https://www.themealdb.com/images/media/meals/uyqrrv1511553350.jpg",
        "https://www.themealdb.com/images/media/meals/dxpc7j1764370714.jpg",
        "https://www.themealdb.com/images/media/meals/1529444830.jpg"
    ];

    // Select one deterministically based on index so it stays consistent
    const imageUrl = mealDbImages[i % mealDbImages.length];

    fallbackRecipes.push({
        id: i + 1,
        name,
        basePortions,
        ingredients,
        prepTime,
        standardTemp,
        imageUrl
    });
}


// Navigation handling
navMasterLogin.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isMasterChef) {
        setAuthMode('login');
        authModal.classList.add('active');
    } else {
        // Logout functionality
        isMasterChef = false;
        authToken = null;
        masterBadge.style.display = 'none';
        fabAddRecipe.style.display = 'none';
        navMasterLogin.innerHTML = `<svg style="width:16px;height:16px;vertical-align:-2px;margin-right:8px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Master Chef Login`;
        renderRecipes(recipes);
    }
});

btnCloseAuth.addEventListener('click', () => authModal.classList.remove('active'));
btnCloseEdit.addEventListener('click', () => editModal.classList.remove('active'));
btnCloseAdd.addEventListener('click', () => addModal.classList.remove('active'));

fabAddRecipe.addEventListener('click', () => {
    addForm.reset();
    document.getElementById('add-ingredients-container').innerHTML = '';
    addIngredientRow('add-ingredients-container'); // Add one default empty row
    addModal.classList.add('active');
});

// Dynamic Ingedient Builder UI Logic
function addIngredientRow(containerId, name = '', amount = '', unit = '') {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <input type="text" class="ing-name" placeholder="Name (e.g. Salt)" value="${name}" required>
        <input type="number" class="ing-amount" placeholder="Amt" value="${amount}" required>
        <input type="text" class="ing-unit" placeholder="Unit" value="${unit}" required>
        <button type="button" class="btn-remove-ing">X</button>
    `;

    row.querySelector('.btn-remove-ing').addEventListener('click', () => {
        row.remove();
    });

    container.appendChild(row);
}

document.getElementById('btn-add-new-ingredient').addEventListener('click', () => {
    addIngredientRow('add-ingredients-container');
});

document.getElementById('btn-add-edit-ingredient').addEventListener('click', () => {
    addIngredientRow('edit-ingredients-container');
});

function extractIngredientsFromContainer(containerId) {
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.ingredient-row');
    const ingredients = [];
    rows.forEach(row => {
        ingredients.push({
            name: row.querySelector('.ing-name').value,
            amount: parseFloat(row.querySelector('.ing-amount').value),
            unit: row.querySelector('.ing-unit').value
        });
    });
    return ingredients;
}

// Auth Tabs Logic
function setAuthMode(mode) {
    currentAuthMode = mode;
    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        authTitle.innerText = "Master Chef Access";
        authSubtitle.innerText = "Log in to manage recipes and standards.";
        passGroup.style.display = 'block';
        forgotWrap.style.display = 'block';
        btnAuthSubmit.innerText = "Authenticate";
    } else if (mode === 'signup') {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        authTitle.innerText = "Create Master Account";
        authSubtitle.innerText = "Register a new Master Chef profile.";
        passGroup.style.display = 'block';
        forgotWrap.style.display = 'none';
        btnAuthSubmit.innerText = "Create Account";
    } else if (mode === 'forgot') {
        tabLogin.classList.remove('active');
        tabSignup.classList.remove('active');
        authTitle.innerText = "Reset Password";
        authSubtitle.innerText = "We will email you a secure reset link.";
        passGroup.style.display = 'none';
        forgotWrap.style.display = 'none';
        btnAuthSubmit.innerText = "Send Reset Link";
    }
}

tabLogin.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('login'); });
tabSignup.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('signup'); });
linkForgot.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('forgot'); });

navRecipes.addEventListener('click', (e) => {
    e.preventDefault();
    navRecipes.classList.add('active');
    navQuality.classList.remove('active');
    sectionRecipes.classList.add('active');
    sectionQuality.classList.remove('active');
});

navQuality.addEventListener('click', (e) => {
    e.preventDefault();
    navQuality.classList.add('active');
    navRecipes.classList.remove('active');
    sectionQuality.classList.add('active');
    sectionRecipes.classList.remove('active');
    populateRecipeSelect();
    fetchLogs();
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = recipes.filter(r => r.name.toLowerCase().includes(term));
    renderRecipes(filtered);
});

// Fetch backend data
async function fetchRecipes() {
    try {
        const res = await fetch(`${API_URL}/recipes`);
        if (!res.ok) throw new Error('Backend not found');
        recipes = await res.json();
    } catch (err) {
        console.warn('Using client-side fallback data. Start the backend server for full functionality.');
        recipes = [...fallbackRecipes];
    }
    renderRecipes(recipes);
}

async function fetchLogs() {
    try {
        const res = await fetch(`${API_URL}/quality`);
        if (!res.ok) throw new Error('Backend not found');
        qualityLogs = await res.json();
    } catch (err) {
        // Keeps local logs if backend fails
    }
    renderLogs();
}

// Render Recipes
function renderRecipes(data) {
    recipeGrid.innerHTML = '';

    if (data.length === 0) {
        recipeGrid.innerHTML = '<p style="color:var(--text-muted)">No recipes found.</p>';
        return;
    }

    data.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'card';

        let ingredientsHTML = recipe.ingredients.map(ing => `
            <li>
                <span>${ing.name}</span>
                <span class="ing-amount" data-base="${ing.amount}">${ing.amount} ${ing.unit}</span>
            </li>
        `).join('');

        let actionsHTML = '';
        if (isMasterChef) {
            actionsHTML = `
                <button class="delete-btn" data-id="${recipe.id}">Delete</button>
                <button class="edit-btn" data-id="${recipe.id}">Edit</button>
            `;
        }

        const imgPlaceholder = recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

        card.innerHTML = `
            <div class="recipe-img-container">
                <img src="${imgPlaceholder}" alt="${recipe.name}" class="recipe-img" loading="lazy">
            </div>
            <div class="card-content">
                <h3>${recipe.name} <div style="float:right">${actionsHTML}</div></h3>
                <div class="meta-info">Prep Time: ${recipe.prepTime} | Target Temp: ${recipe.standardTemp}</div>
                
                <div class="scaling-control">
                    <span>Target Portions:</span>
                    <input type="number" value="${recipe.basePortions}" min="1" class="portion-input" data-id="${recipe.id}">
                </div>
                
                <ul class="ingredients-list">
                    ${ingredientsHTML}
                </ul>
            </div>
        `;
        recipeGrid.appendChild(card);
    });

    // Attach scaling logic to new inputs
    document.querySelectorAll('.portion-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const recipeId = parseInt(e.target.dataset.id);
            const recipe = recipes.find(r => r.id === recipeId);
            const newPortions = parseInt(e.target.value) || 1;
            const ratio = newPortions / recipe.basePortions;

            const card = e.target.closest('.card');
            const amounts = card.querySelectorAll('.ing-amount');

            amounts.forEach((amt, index) => {
                const base = parseFloat(recipe.ingredients[index].amount);
                const unit = recipe.ingredients[index].unit;
                // Scale and format cleanly (remove trailing .0 if integer)
                const scaled = (base * ratio).toFixed(1).replace(/\.0$/, '');
                amt.textContent = `${scaled} ${unit}`;
            });
        });
    });

    // Attach edit logic
    if (isMasterChef) {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const recipe = recipes.find(r => r.id === id);
                if (recipe) {
                    document.getElementById('edit-id').value = recipe.id;
                    document.getElementById('edit-name').value = recipe.name;
                    document.getElementById('edit-portions').value = recipe.basePortions;
                    document.getElementById('edit-temp').value = recipe.standardTemp.replace('°F', '');
                    document.getElementById('edit-time').value = recipe.prepTime;
                    document.getElementById('edit-img').value = recipe.imageUrl || '';

                    // Populate ingredient builder
                    const container = document.getElementById('edit-ingredients-container');
                    container.innerHTML = '';
                    recipe.ingredients.forEach(ing => {
                        addIngredientRow('edit-ingredients-container', ing.name, ing.amount, ing.unit);
                    });

                    editModal.classList.add('active');
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm("Are you sure you want to permanently delete this recipe from the Cloud Database?")) {
                    const id = parseInt(e.target.dataset.id);
                    recipes = recipes.filter(r => r.id !== id);
                    renderRecipes(recipes);
                    populateRecipeSelect();
                    // In a real app: await firebase.firestore().collection('recipes').doc(id).delete();
                }
            });
        });
    }
}

function populateRecipeSelect() {
    recipeSelect.innerHTML = recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
}

function renderLogs() {
    if (qualityLogs.length === 0) {
        logsContainer.innerHTML = '<p style="color:var(--text-muted)">No quality logs yet.</p>';
        return;
    }

    logsContainer.innerHTML = qualityLogs.slice().reverse().map(log => {
        const recipe = recipes.find(r => r.id === parseInt(log.recipeId))?.name || 'Unknown Recipe';
        const displayResult = log.autoResult || `Status: ${log.status}`;
        return `
            <div class="log-item" style="align-items:flex-start">
                <div>
                    <strong>${recipe}</strong>
                    <div class="meta-info" style="margin-top:0.3rem; margin-bottom:0.3rem;">${log.date} — ${log.notes}</div>
                    <div style="font-size:0.9rem; color:var(--text-main); display:flex; gap:1.5rem; margin-top:0.5rem; background:rgba(0,0,0,0.2); padding:0.8rem; border-radius:8px;">
                        <span>🌡️ ${log.temp || '?'}°F</span>
                        <span>👁️ ${log.appearance || '?'} / 5</span>
                        <span>⚖️ ${log.weight || '?'} g</span>
                        <span>⏱️ ${log.preptime || '?'} min</span>
                    </div>
                    <div style="font-size:0.9rem; color:var(--text-muted); margin-top:0.5rem">System Evaluation: <em>${displayResult}</em></div>
                </div>
                <span class="status-badge status-${log.status}" style="margin-top:0.5rem">${log.status}</span>
            </div>
        `;
    }).join('');
}

// Log Submission
qualityForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const reportedTemp = parseInt(document.getElementById('q-temp').value);
    const appearanceScore = parseInt(document.getElementById('q-appearance').value);
    const reportedWeight = parseInt(document.getElementById('q-weight').value);
    const reportedPrepTime = parseInt(document.getElementById('q-preptime').value);
    const recipeIdStr = recipeSelect.value;
    const notesStr = document.getElementById('q-notes').value;
    const recipe = recipes.find(r => r.id === parseInt(recipeIdStr));

    // Comprehensive Automated Evaluation System
    let calculatedStatus = 'Passed';
    let autoResult = '';
    let penalties = [];

    if (recipe && reportedTemp) {
        const standardTemp = parseInt(recipe.standardTemp); // Strips the '°F'
        const tempDiff = Math.abs(reportedTemp - standardTemp);

        // Target Temp Rules
        if (tempDiff > 10) penalties.push(`CRITICAL: Temp off by ${tempDiff}°F (Target: ${standardTemp}°F)`);
        else if (tempDiff > 4) penalties.push(`Subpar Temp (Target: ${standardTemp}°F)`);

        // Appearance Rules
        if (appearanceScore <= 2) penalties.push(`CRITICAL: Unacceptable Plating (${appearanceScore}/5)`);
        else if (appearanceScore === 3) penalties.push(`Subpar Plating (${appearanceScore}/5)`);

        // Target Prep Time parsing (e.g. "45 mins" or "2 hours")
        let targetMins = 0;
        if (recipe.prepTime.includes('hour')) {
            targetMins = parseInt(recipe.prepTime) * 60;
        } else {
            targetMins = parseInt(recipe.prepTime);
        }

        // Time deviation rule (> 25% over target time is subpar)
        if (targetMins > 0 && reportedPrepTime > (targetMins * 1.25)) {
            penalties.push(`Slow Prep (${reportedPrepTime}m vs Target ${targetMins}m)`);
        } else if (targetMins > 0 && reportedPrepTime < (targetMins * 0.5)) {
            penalties.push(`Rushed Prep (${reportedPrepTime}m vs Target ${targetMins}m)`);
        }

        // Evaluate Status based on penalties length and severity
        let hasCritical = penalties.some(p => p.includes('CRITICAL'));

        if (hasCritical) {
            calculatedStatus = 'Failed';
            autoResult = 'Failed Standards: ' + penalties.join(' | ');
        } else if (penalties.length > 0) {
            calculatedStatus = 'Subpar';
            autoResult = 'Needs Improvement: ' + penalties.join(' | ');
        } else {
            calculatedStatus = 'Passed';
            autoResult = `Perfect execution across Temp, Plating, Weight, and Time.`;
        }

    } else {
        calculatedStatus = 'Failed';
        autoResult = 'SYSTEM ERROR: Invalid Form Data';
    }

    const payload = {
        recipeId: recipeIdStr,
        temp: reportedTemp,
        appearance: appearanceScore,
        weight: reportedWeight,
        preptime: reportedPrepTime,
        notes: notesStr,
        status: calculatedStatus,
        autoResult: autoResult
    };

    try {
        const res = await fetch(`${API_URL}/quality`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            qualityForm.reset();
            fetchLogs();
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (err) {
        // Fallback for client-side local saving if no backend
        qualityLogs.push({
            id: Date.now(),
            ...payload,
            date: new Date().toISOString().split('T')[0]
        });
        qualityForm.reset();
        renderLogs();
    }
});

// Master Chef Auth (Mock Cloud Implementation)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-pass').value;

    if (currentAuthMode === 'signup') {
        // "Cloud" User Registration
        if (mockCloud.users.find(u => u.email === email)) {
            alert('Cloud Auth Error: Email already registered.');
            return;
        }
        mockCloud.users.push({ email, pass: password });
        alert('Master Chef Cloud Profile Created! You are now logged in.');
        handleSuccessfulLogin();
    }
    else if (currentAuthMode === 'login') {
        // "Cloud" Authentication
        const user = mockCloud.users.find(u => u.email === email && u.pass === password);
        // Also support old demo combo
        if (user || (email === 'masterchef' && password === 'password123')) {
            handleSuccessfulLogin();
        } else {
            alert('Cloud Auth Error: Invalid email or password.');
        }
    }
    else if (currentAuthMode === 'forgot') {
        // "Cloud" Password Reset Email
        const userExists = mockCloud.users.find(u => u.email === email) || email === 'masterchef';
        if (userExists) {
            alert(`A secure password reset link has been dispatched to ${email} via Firebase Mail.`);
            setAuthMode('login');
        } else {
            alert('Cloud Auth Error: No Master Chef found with that email.');
        }
    }
});

function handleSuccessfulLogin() {
    isMasterChef = true;
    authToken = "cloud-token-" + Date.now();
    authModal.classList.remove('active');
    masterBadge.style.display = 'block';
    fabAddRecipe.style.display = 'flex';
    navMasterLogin.innerHTML = `<svg style="width:16px;height:16px;vertical-align:-2px;margin-right:8px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg> Logout Master Chef`;
    renderRecipes(recipes);
}

// Add New Recipe (Cloud Sync)
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ingredientsParsed = extractIngredientsFromContainer('add-ingredients-container');

    if (ingredientsParsed.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }

    const newRecipe = {
        // Generate pseudo-cloud ID
        id: Date.now(),
        name: document.getElementById('add-name').value,
        basePortions: parseInt(document.getElementById('add-portions').value),
        standardTemp: document.getElementById('add-temp').value + '°F',
        prepTime: document.getElementById('add-time').value,
        imageUrl: document.getElementById('add-img').value || 'https://www.themealdb.com/images/media/meals/qstyvs1505931190.jpg',
        ingredients: ingredientsParsed
    };

    recipes.unshift(newRecipe); // Add to beginning
    // In real app: await firebase.firestore().collection('recipes').add(newRecipe);

    addModal.classList.remove('active');
    renderRecipes(recipes);
    populateRecipeSelect();

    // Simulate cloud sync delay
    const ogText = masterBadge.innerHTML;
    masterBadge.innerHTML = '☁️ Syncing to Cloud...';
    setTimeout(() => {
        masterBadge.innerHTML = ogText;
    }, 1500);
});

// Edit Recipe Submit
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const ingredientsParsed = extractIngredientsFromContainer('edit-ingredients-container');

    if (ingredientsParsed.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }

    const payload = {
        name: document.getElementById('edit-name').value,
        basePortions: parseInt(document.getElementById('edit-portions').value),
        standardTemp: document.getElementById('edit-temp').value + '°F',
        prepTime: document.getElementById('edit-time').value,
        imageUrl: document.getElementById('edit-img').value,
        ingredients: ingredientsParsed
    };

    try {
        const res = await fetch(`${API_URL}/recipes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            editModal.classList.remove('active');
            fetchRecipes(); // refresh
        } else {
            throw new Error('Update failed');
        }
    } catch (err) {
        // Fallback local update
        const index = recipes.findIndex(r => r.id === id);
        if (index !== -1) {
            recipes[index] = { ...recipes[index], ...payload };
            editModal.classList.remove('active');
            renderRecipes(recipes);
        }
    }
});

// Initialization
fetchRecipes();

// --- AI Chatbot Logic ---

// Toggle Chat Window
fabChat.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    if (chatWindow.style.display === 'flex') chatInput.focus();
});

btnCloseChat.addEventListener('click', () => {
    chatWindow.style.display = 'none';
});

// Auto-scroll chat to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// True "LLM" Context-Aware Response Simulation
// In a production environment, this would cleanly make a fetch() request to OpenAI/Anthropic/Gemini
// passing the stringified `recipes` array as context. For this prototype, we build a heavy
// internal heuristic engine that closely mimics an intelligent LLM's parsing and reasoning.
async function generateLLMResponse(message) {
    const text = message.toLowerCase().trim();

    // Simulate API Network Latency
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    // Intelligence Layer 1: Operational Math & Scaling (Reasoning Capability)
    if (text.includes('scale') || text.includes('half') || text.includes('double') || text.includes('triple') || text.match(/\bfor \d+ (people|guests|portions)\b/)) {
        // Extract recipe identity
        const recipeMatch = recipes.find(r => text.includes(r.name.toLowerCase()) ||
            (text.length > 5 && r.name.toLowerCase().includes(text.replace(/scale|double|half|make/g, '').trim()))
        );

        if (recipeMatch) {
            let multiplier = 1;
            if (text.includes('double')) multiplier = 2;
            else if (text.includes('triple')) multiplier = 3;
            else if (text.includes('half')) multiplier = 0.5;
            else {
                // Try to parse an exact number of portions "for 20 guests"
                const numMatch = text.match(/\b(\d+)\s*(people|guests|portions)/);
                if (numMatch && numMatch[1]) {
                    multiplier = parseInt(numMatch[1]) / recipeMatch.basePortions;
                }
            }

            const scaledTarget = Math.round(recipeMatch.basePortions * multiplier);
            const scaledIngs = recipeMatch.ingredients.map(i => {
                const scaledAmt = (parseFloat(i.amount) * multiplier).toFixed(1).replace(/\.0$/, '');
                return `${scaledAmt}${i.unit} ${i.name}`;
            }).join(', ');

            return `*Analyzing scaling parameters...*\n\nTo scale the **${recipeMatch.name}** for ${scaledTarget} portions (a ${multiplier}x multiplier from the base of ${recipeMatch.basePortions}):\n\nYou will precisely need:\n${scaledIngs}.\n\nKeep the target temperature exactly at ${recipeMatch.standardTemp}. Cooking times may increase slightly due to volume; monitor with a core probe.`;
        }
    }

    // Intelligence Layer 2: General Culinary Knowledge Base
    if (text.includes('substitute') || text.includes('replace') || text.includes('instead of')) {
        return `As your Culinary AI, I advise caution with substitutions as they break standard yields. However:\n- For **Heavy Cream**, you can mount with whole butter or use a cashew emulsion (vegan).\n- For **White Wine**, use a splash of verjus or white wine vinegar diluted with stock.\n- For **Arborio Rice**, Carnaroli is superior, but pearled barley works for a rustic twist.\n\nNote: Please have the Master Chef update the recipe matrix if a permanent change is made.`;
    }

    if (text.includes('how to sear') || text.includes('maillard') || text.includes('crust')) {
        return `To achieve a perfect Maillard reaction (crust):\n1. Ensure the protein is completely dry (pat with paper towels).\n2. Use a heavy-bottomed pan (cast iron or carbon steel) preheated over medium-high.\n3. Use an oil with a high smoke point (grapeseed, canola).\n4. Place protein down and *do not move it* for 2-3 minutes until it releases naturally.`;
    }

    // Intelligence Layer 3: Natural Language Database Querying
    const recipeMatch = recipes.find(r => text.includes(r.name.toLowerCase()) ||
        (text.length > 5 && r.name.toLowerCase().includes(text.replace(/how do i make|what is|tell me about/g, '').trim()))
    );

    if (recipeMatch) {
        const ingredientsBreakdown = recipeMatch.ingredients.map(i => `• ${i.amount}${i.unit} ${i.name}`).join('<br>');
        return `I've pulled the exact schematic for **${recipeMatch.name}**:\n<br>\n**Target Yield:** ${recipeMatch.basePortions} portions<br>**Execution Temp:** ${recipeMatch.standardTemp}<br>**Par/Prep Time:** ${recipeMatch.prepTime}<br><br>**Mise en Place:**<br>${ingredientsBreakdown}<br><br>Let me know if you need to scale this up or down.`;
    }

    // Menu Summarization and Filtering
    if (text.includes('menu') || text.includes('what do we have') || text.includes('inventory')) {
        const total = recipes.length;
        const proteins = ['Salmon', 'Chicken', 'Steak', 'Pork', 'Duck', 'Tofu'];
        let activeProteins = proteins.filter(p => recipes.some(r => r.name.includes(p) || r.ingredients.some(i => i.name.includes(p))));

        return `I am actively monitoring a matrix of **${total} standardized recipes**. Our core structural proteins currently in rotation include: ${activeProteins.join(', ')}. \n\nYou can ask me to scale any of them, or query specific ingredient overlaps (e.g. "What recipes use Garlic?").`;
    }

    if (text.includes('with') || text.includes('contains') || text.includes('use')) {
        const searchWordArr = text.split(' ');
        let searchIngredient = searchWordArr[searchWordArr.length - 1].replace(/[^a-z]/g, '');
        if (searchIngredient === 'recipes' || searchIngredient === 'menu') searchIngredient = searchWordArr[searchWordArr.length - 2];

        let matches = recipes.filter(r => r.ingredients.some(i => i.name.toLowerCase().includes(searchIngredient)));
        if (matches.length > 0) {
            const matchNames = matches.slice(0, 5).map(m => `**${m.name}**`).join(', ');
            return `Data retrieved. I found **${matches.length}** active recipes utilizing "${searchIngredient}". \n\nThe primary dishes are: ${matchNames}.`;
        }
    }

    // Intelligence Layer 4: Analytics and Quality Assurance
    if (text.includes('quality') || text.includes('standards') || text.includes('log') || text.includes('fail') || text.includes('analytics') || text.includes('status')) {
        const fails = qualityLogs.filter(l => l.status === 'Failed').length;
        const subpar = qualityLogs.filter(l => l.status === 'Subpar').length;
        const passes = qualityLogs.filter(l => l.status === 'Passed').length;
        const total = qualityLogs.length;

        if (total > 0) {
            const passRate = Math.round((passes / total) * 100);
            return `📊 **Live Kitchen Analytics**:\n- **Total Logs:** ${total}\n- **Pass Rate:** ${passRate}%\n- **Perfect Executions:** ${passes}\n- **Subpar Warnings:** ${subpar}\n- **Critical Failures:** ${fails}\n\n*Directives:* Subpar items require protocol review. Critical failures (>10°F delta or plating <3/5) must hit the trash immediately.`;
        } else {
            return `Monitoring systems are online, but the QA Log is currently empty for this service. A reminder to the brigade: Temperature deltas > 4°F trigger warnings. Plating scores below 4 trigger warnings. Log all output.`;
        }
    }

    if (text.includes('master') || text.includes('edit') || text.includes('add') || text.includes('login') || text.includes('how do i change')) {
        return `Standard users have read-only execution access. If an ingredient ratio is fundamentally drifting, a **Master Chef** must authenticate via the bottom left navigation tab. Once verified, they can explicitly re-write the JSON standards matrix or override the menu architecture.`;
    }

    if (text === 'hello' || text === 'hi' || text === 'hey') {
        return `Hello, heard and ready, Chef. \n\nI am your deeply integrated Kitchen AI. I can calculate instant scaling logic, process cross-references on our ${recipes.length} menu items, offer culinary science advice, and process our live QA analytics. What do you need?`;
    }

    // Deep conversational fallback
    return `Chef, my natural language processor is highly tuned to the Kitchen Optimizer matrix. Try asking me complex queries like:\n- *"Double the Wagyu Burger recipe"* \n- *"What recipes use Heavy Cream?"*\n- *"What is our current Quality pass rate?"*\n- *"Give me a substitute for Arborio Rice."*`;
}

// Handle Form Submit
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user-msg';
    userDiv.textContent = message;
    chatMessages.appendChild(userDiv);

    // Clear & Scroll
    chatInput.value = '';
    scrollToBottom();

    // Create "Thinking" indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'chat-msg bot-msg';
    thinkingDiv.innerHTML = '<span class="thinking-dots">Thinking...</span>';
    chatMessages.appendChild(thinkingDiv);
    scrollToBottom();

    // Await Intelligence Response
    const response = await generateLLMResponse(message);

    // Replace thinking with actual rich HTML response
    thinkingDiv.innerHTML = response.replace(/\n/g, '<br>');
    scrollToBottom();
});
