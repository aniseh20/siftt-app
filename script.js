// ================= USER STORE =================
const STORAGE_KEY = "sift_users";

function loadUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
}
function saveUsers(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function findUser(email) {
    return loadUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}
function addUser(email, password) {
    const list = loadUsers();
    list.push({ email, password });
    saveUsers(list);
}

// ================= RECIPES =================
const recipes = [
    { title: "Roasted Tomato & Basil Orzo", image: "images/roasted-tomato-basil-orzo-salad.jpg", time: "18 min", tags: ["Dairy-free", "Nut-free"] },
    { title: "Coconut Lentil Stew",         image: "images/coconut-lentil-stew.jpg",              time: "25 min", tags: ["Shellfish-free", "Dairy-free"] },
    { title: "Crispy Chickpea Salad Bowl",  image: "images/crispy-chickpea-salad-bowl.jpg",       time: "12 min", tags: ["Nut-free", "Egg-free"] }
];

function renderRecipes() {
    const container = document.querySelector("#screen-recipes .recipe-list");
    if (!container) return;
    container.innerHTML = "";

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        const tagsHTML = recipe.tags.map(t => `<span class="mini-tag">${t}</span>`).join("");
        card.innerHTML = `
            <div class="recipe-img">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" onerror="this.style.display='none'">` : ""}
                <span class="time-badge">${recipe.time}</span>
            </div>
            <div class="recipe-content">
                <h3>${recipe.title}</h3>
                <div class="recipe-tags">${tagsHTML}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ================= INLINE ERRORS =================
function showError(inputEl, errorId, message) {
    const errEl = document.getElementById(errorId);
    if (inputEl) inputEl.classList.add("input-error");
    if (errEl) {
        errEl.textContent = message;
        errEl.classList.add("visible");
    }
}
function clearError(inputEl, errorId) {
    const errEl = document.getElementById(errorId);
    if (inputEl) inputEl.classList.remove("input-error");
    if (errEl) {
        errEl.textContent = "";
        errEl.classList.remove("visible");
    }
}
function clearAllLoginErrors() {
    clearError(document.getElementById("login-email"),    "login-email-error");
    clearError(document.getElementById("login-password"), "login-password-error");
}
function clearAllSignupErrors() {
    clearError(document.getElementById("signup-email"),    "signup-email-error");
    clearError(document.getElementById("signup-password"), "signup-password-error");
    clearError(document.getElementById("signup-confirm"),  "signup-confirm-error");
}

// ================= PASSWORD TOGGLE =================
function togglePassword(btn) {
    const input = btn.parentElement.querySelector("input");
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
    } else {
        input.type = "password";
        btn.textContent = "👁";
    }
}

// ================= LOGIN =================
function doLogin() {
    clearAllLoginErrors();

    const emailInput    = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const email    = emailInput.value.trim();
    const password = passwordInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let ok = true;

    if (!email) {
        showError(emailInput, "login-email-error", "Please enter your email.");
        ok = false;
    } else if (!emailPattern.test(email)) {
        showError(emailInput, "login-email-error", "That doesn't look like a valid email.");
        ok = false;
    }
    if (!password) {
        showError(passwordInput, "login-password-error", "Please enter your password.");
        ok = false;
    }
    if (!ok) return;

    const user = findUser(email);
    if (!user) {
        showError(emailInput, "login-email-error", "No account found with that email.");
        return;
    }
    if (user.password !== password) {
        showError(passwordInput, "login-password-error", "Incorrect password.");
        return;
    }

    loginSuccess(user);
}

function loginSuccess(user) {
    if (loadSettings().darkmode) {
        document.querySelector('.device')?.classList.add('dark-mode');
    }

    const firstName = (user.name || user.email.split('@')[0])
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    const greeting = document.querySelector('#screen-home .greeting h1');
    if (greeting) greeting.textContent = `Hi, ${firstName}`;

    const login = document.getElementById('screen-login');
    const home  = document.getElementById('screen-home');

    login.classList.add('fade-out');

    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'fade-out'));
        home.classList.add('active');

        const nav = document.querySelector('.bottom-nav');
        if (nav) nav.style.display = 'flex';

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(n => n.classList.remove('active'));
        if (navItems[0]) navItems[0].classList.add('active');
    }, 350);
}

// ================= SIGN UP =================
function doSignup() {
    clearAllSignupErrors();

    const emailInput   = document.getElementById('signup-email');
    const passInput    = document.getElementById('signup-password');
    const confirmInput = document.getElementById('signup-confirm');
    const email    = emailInput.value.trim();
    const password = passInput.value;
    const confirm  = confirmInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let ok = true;

    if (!emailPattern.test(email)) {
        showError(emailInput, "signup-email-error", "Please enter a valid email address.");
        ok = false;
    } else if (findUser(email)) {
        showError(emailInput, "signup-email-error", "That email is already registered.");
        ok = false;
    }
    if (password.length < 6) {
        showError(passInput, "signup-password-error", "Password must be at least 6 characters.");
        ok = false;
    }
    if (password !== confirm) {
        showError(confirmInput, "signup-confirm-error", "Passwords don't match.");
        ok = false;
    }
    if (!ok) return;

    addUser(email, password);
    emailInput.value = '';
    passInput.value = '';
    confirmInput.value = '';
    loginSuccess({ email, password });
}

// ================= LOGOUT =================
function doLogout() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-login').classList.add('active');

    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.style.display = 'none';

    const emailInput    = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    if (emailInput)    emailInput.value = '';
    if (passwordInput) passwordInput.value = '';

    clearAllLoginErrors();
    document.querySelector('.device')?.classList.remove('dark-mode');
}

// ================= SCREEN NAV =================
function showScreen(screenId, navElement) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.display =
            (screenId === 'screen-login' || screenId === 'screen-signup') ? 'none' : 'flex';
    }

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.add('active');

    const allNavItems = document.querySelectorAll('.nav-item');
    if (navElement) {
        allNavItems.forEach(item => item.classList.remove('active'));
        navElement.classList.add('active');
    } else {
        allNavItems.forEach(item => item.classList.remove('active'));
        const navMap = { 'screen-home':0, 'screen-scan':1, 'screen-recipes':2, 'screen-places':3, 'screen-profile':4 };
        const i = navMap[screenId];
        if (i !== undefined && allNavItems[i]) allNavItems[i].classList.add('active');
    }
}

// ================= MODALS =================
function openModal(id) {
    document.getElementById(id).classList.add('active');
    if (id === 'modal-add-allergy') document.getElementById('custom-allergy-input').value = '';
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ================= NOTIFICATIONS / INBOX =================
function openInbox() {
    const inbox = document.getElementById("inbox-list");

    const notifications = [
        {
            title: "Scan cleared",
            body: "Oat Milk Original is safe for your profile.",
            time: "2h ago",
            img: "img-green",
            screen: "screen-scan"
        },
        {
            title: "New recipe match",
            body: "Coconut Lentil Stew fits all your filters.",
            time: "Yesterday",
            img: "img-yellow",
            screen: "screen-recipes"
        },
        {
            title: "Nearby alert",
            body: "Leaf & Ladle updated their allergy info.",
            time: "2d ago",
            img: "img-cream",
            screen: "screen-places"
        }
    ];

    inbox.innerHTML = notifications.map(n => `
        <div class="list-item notification-row" style="margin-bottom: 10px; cursor: pointer;"
             onclick="openNotification('${n.screen}')">
            <div class="item-img ${n.img}"></div>
            <div class="item-info">
                <h4>${n.title}</h4>
                <p>${n.body}<br><span style="opacity:.6;">${n.time}</span></p>
            </div>
        </div>
    `).join("");

    openModal("modal-inbox");
}

function openNotification(screenId) {
    closeModal("modal-inbox");
    setTimeout(() => showScreen(screenId), 200);
}

// ================= FORGOT PASSWORD =================
function openForgotModal() {
    const loginEmail  = document.getElementById("login-email").value.trim();
    const forgotInput = document.getElementById("forgot-email");
    forgotInput.value = loginEmail;

    const errEl = document.getElementById("forgot-email-error");
    if (errEl) { errEl.textContent = ""; errEl.classList.remove("visible"); }
    forgotInput.classList.remove("input-error");

    openModal("modal-forgot");
}

function doForgotPassword() {
    const input = document.getElementById("forgot-email");
    const email = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const errEl = document.getElementById("forgot-email-error");
    errEl.textContent = "";
    errEl.classList.remove("visible");
    input.classList.remove("input-error");

    if (!emailPattern.test(email)) {
        errEl.textContent = "Please enter a valid email address.";
        errEl.classList.add("visible");
        input.classList.add("input-error");
        return;
    }

    const user = findUser(email);
    if (!user) {
        errEl.textContent = "No account found with that email.";
        errEl.classList.add("visible");
        input.classList.add("input-error");
        return;
    }

    closeModal("modal-forgot");
    showToast("✉️ Reset link sent to " + email);

    const inbox = document.getElementById("inbox-list");
    inbox.innerHTML = `
        <div class="list-item" style="margin-bottom: 10px;">
            <div class="item-img img-green"></div>
            <div class="item-info">
                <h4>Sift · Reset your password</h4>
                <p>To: ${email}<br>Just now</p>
            </div>
        </div>
        <p class="subtitle" style="margin-top: 10px;">Click the link in this email to choose a new password.</p>
    `;

    setTimeout(() => openModal("modal-inbox"), 500);
}

// ================= TOAST =================
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.querySelector(".device").appendChild(toast);

    setTimeout(() => toast.classList.add("visible"), 10);
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// ================= ALLERGY ICON MAP =================
const ALLERGY_ICONS = {
    "peanuts":      "🥜",
    "peanut":       "🥜",
    "tree nuts":    "🌰",
    "nuts":         "🌰",
    "dairy":        "🥛",
    "milk":         "🥛",
    "lactose":      "🥛",
    "shellfish":    "🦐",
    "shrimp":       "🦐",
    "crab":         "🦀",
    "lobster":      "🦞",
    "fish":         "🐟",
    "eggs":         "🥚",
    "egg":          "🥚",
    "gluten":       "🌾",
    "wheat":        "🌾",
    "soy":          "🌱",
    "soya":         "🌱",
    "sesame":       "🫘",
    "mustard":      "🌭",
    "sulfites":     "🍷",
    "sulphites":    "🍷",
    "corn":         "🌽",
    "chocolate":    "🍫",
    "strawberry":   "🍓",
    "citrus":       "🍊",
    "banana":       "🍌",
    "tomato":       "🍅"
};

function allergyIconFor(name) {
    const key = name.trim().toLowerCase();
    if (ALLERGY_ICONS[key]) return ALLERGY_ICONS[key];
    for (const k of Object.keys(ALLERGY_ICONS)) {
        if (key.includes(k)) return ALLERGY_ICONS[k];
    }
    return "⚠️";
}

// ================= ADD ALLERGY =================
function appendAllergyToList(name, icon) {
    const list = document.querySelector('.allergy-list');
    const resolvedIcon = icon || allergyIconFor(name);

    const newItem = document.createElement('div');
    newItem.className = 'allergy-item';
    newItem.style.cursor = "pointer";
    newItem.innerHTML = `
        <div class="allergy-icon">${resolvedIcon}</div>
        <div class="allergy-info">
            <h4>${name}</h4>
            <p class="severity high">● New</p>
        </div>
        <div class="arrow">›</div>
    `;

    newItem.onclick = () => openDeleteAllergy(name, newItem);

    newItem.style.opacity = '0';
    list.appendChild(newItem);
    setTimeout(() => {
        newItem.style.transition = 'opacity 0.3s';
        newItem.style.opacity = '1';
    }, 10);
}

function addAllergy(name) {
    appendAllergyToList(name);
    closeModal('modal-add-allergy');
}

function addCustomAllergy() {
    const input = document.getElementById('custom-allergy-input');
    const value = input.value.trim();
    if (value === '') { alert("Please type an allergy first."); return; }
    appendAllergyToList(value);
    input.value = '';
    closeModal('modal-add-allergy');
}

function handleCustomAllergyKey(e) {
    if (e.key === 'Enter') addCustomAllergy();
}

// ================= DELETE ALLERGY =================
let allergyPendingDelete = null;

function openDeleteAllergy(name, itemEl) {
    allergyPendingDelete = { name, itemEl };
    document.getElementById("delete-allergy-name").textContent = name;
    openModal("modal-delete-allergy");
}

function confirmDeleteAllergy() {
    if (!allergyPendingDelete) return;

    const { itemEl, name } = allergyPendingDelete;

    itemEl.style.transition = "opacity 0.2s, transform 0.2s";
    itemEl.style.opacity = "0";
    itemEl.style.transform = "translateX(20px)";

    setTimeout(() => {
        itemEl.remove();
        closeModal("modal-delete-allergy");
        showToast(`🗑️ ${name} removed`);
        allergyPendingDelete = null;
    }, 220);
}

// ================= SEARCH =================
const searchData = [
    { name: "Oat Milk Original", type: "Product", screen: "screen-home" },
    { name: "Sourdough Loaf", type: "Product", screen: "screen-home" },
    { name: "Leaf & Ladle", type: "Place", screen: "screen-places" },
    { name: "Grainhouse Bakery", type: "Place", screen: "screen-places" },
    { name: "Harbor Kitchen", type: "Place", screen: "screen-places" },
    { name: "Roasted Tomato & Basil Orzo", type: "Recipe", screen: "screen-recipes" },
    { name: "Coconut Lentil Stew", type: "Recipe", screen: "screen-recipes" },
    { name: "Crispy Chickpea Salad Bowl", type: "Recipe", screen: "screen-recipes" }
];

function openSearch() {
    openModal('modal-search');
    document.querySelector('.search-input').value = '';
    document.getElementById('search-results').innerHTML =
        '<p class="subtitle">Start typing to see results...</p>';
}
function handleSearch(query) {
    const c = document.getElementById('search-results');
    if (query.trim() === '') {
        c.innerHTML = '<p class="subtitle">Start typing to see results...</p>';
        return;
    }
    const filtered = searchData.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    if (!filtered.length) {
        c.innerHTML = '<p class="subtitle">No results found.</p>';
        return;
    }
    c.innerHTML = filtered.map(i => `
        <div class="search-result-item" onclick="goToSearchResult('${i.screen}')">
            <strong>${i.name}</strong><br>
            <small style="color:#666">${i.type}</small>
        </div>
    `).join('');
}
function goToSearchResult(id) {
    closeModal('modal-search');
    showScreen(id);
}

// ================= SIMULATE SCAN =================
function simulateScan() {
    showToast("✅ Scan complete — Product is safe!");
    setTimeout(() => showScreen('screen-home'), 700);
}

// ================= SETTINGS =================
const SETTINGS_KEY = 'sift_settings';
function loadSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { notifications: true, haptics: true }; }
    catch { return { notifications: true, haptics: true }; }
}

function openSettings() {
    const prefs = loadSettings();
    const map = {
        'setting-darkmode':    'darkmode',
        'setting-notifications':'notifications',
        'setting-push':        'push',
        'setting-haptics':     'haptics'
    };
    Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!prefs[key];
    });
    openModal('modal-settings');
}

function saveSetting(key, value) {
    const prefs = loadSettings();
    prefs[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(prefs));
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} ${value ? 'on' : 'off'}`);
}

function toggleDarkMode(enabled) {
    const device = document.querySelector('.device');
    if (!device) return;
    device.classList.toggle('dark-mode', !!enabled);
    saveSetting('darkmode', !!enabled);
}

function clearAllData() {
    if (!confirm('Clear all app data? This will remove your accounts and settings.')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    document.querySelector('.device')?.classList.remove('dark-mode');
    closeModal('modal-settings');
    showToast('🗑️ All data cleared');
    setTimeout(() => doLogout(), 400);
}

// ================= INIT =================
const bottomNav = document.querySelector('.bottom-nav');
if (bottomNav) bottomNav.style.display = 'none';

document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
const loginScreen = document.getElementById('screen-login');
if (loginScreen) loginScreen.classList.add('active');

renderRecipes();

localStorage.removeItem("sift_remember_email");
document.querySelector('.device')?.classList.remove('dark-mode');

document.querySelectorAll(".login-input").forEach(inp => {
    inp.addEventListener("input", () => {
        inp.classList.remove("input-error");
        if (inp.id) {
            const errEl = document.getElementById(inp.id + "-error");
            if (errEl) { errEl.textContent = ""; errEl.classList.remove("visible"); }
        }
    });
});

// ================= DEVICE SCALING =================
const DEVICE_W = 390;
const DEVICE_H = 844;
const SHRINK_FACTOR = 0.90;

function fitDevice() {
    const device = document.querySelector('.device');
    if (!device) return;

    const availW = window.innerWidth - 20;
    const availH = window.innerHeight - 40;

    const fitScale = Math.min(1, availW / DEVICE_W, availH / DEVICE_H);
    const finalScale = fitScale * SHRINK_FACTOR;

    device.style.transform = `scale(${finalScale})`;

    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
    document.body.style.display = "flex";
    document.body.style.alignItems = "center";
    document.body.style.justifyContent = "center";
    document.body.style.margin = "0";
}

fitDevice();
window.addEventListener('resize', fitDevice);