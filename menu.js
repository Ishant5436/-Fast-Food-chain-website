/* ===== Menu Page JS ===== */

const FALLBACK_MENU = [
  { id: "m1", name: "Cheese Burst Burger", category: "Burgers", cafe: "Grill Garage", rating: 4.6, etaMinutes: 22, price: 149, badge: "BG" },
  { id: "m2", name: "Crispy Paneer Wrap", category: "Wraps", cafe: "Roll Republic", rating: 4.4, etaMinutes: 19, price: 129, badge: "WR" },
  { id: "m3", name: "Masala Maggi Bowl", category: "Snacks", cafe: "Night Canteen", rating: 4.7, etaMinutes: 15, price: 89, badge: "MG" },
  { id: "m4", name: "Farmhouse Pizza Slice", category: "Pizza", cafe: "Stone Oven Hub", rating: 4.3, etaMinutes: 25, price: 179, badge: "PZ" },
  { id: "m5", name: "Loaded Veg Momos", category: "Snacks", cafe: "Steam Street", rating: 4.5, etaMinutes: 17, price: 109, badge: "MM" },
  { id: "m6", name: "Peri Peri Fries", category: "Sides", cafe: "Crunch Point", rating: 4.2, etaMinutes: 16, price: 99, badge: "FR" },
  { id: "m7", name: "Cold Coffee Blast", category: "Beverages", cafe: "Bean Bunker", rating: 4.8, etaMinutes: 12, price: 119, badge: "CF" },
  { id: "m8", name: "Chocolate Shake", category: "Beverages", cafe: "Sip Stop", rating: 4.1, etaMinutes: 13, price: 109, badge: "SH" },
  { id: "m9", name: "Veg Loaded Sandwich", category: "Sandwich", cafe: "Bread Box", rating: 4.5, etaMinutes: 18, price: 139, badge: "SW" },
  { id: "m10", name: "Tandoori Paneer Bowl", category: "Meals", cafe: "Campus Curry", rating: 4.6, etaMinutes: 24, price: 199, badge: "ML" },
  { id: "m11", name: "Chole Rice Combo", category: "Meals", cafe: "North Mess", rating: 4.4, etaMinutes: 20, price: 149, badge: "CR" },
  { id: "m12", name: "Smoky Pasta Alfredo", category: "Pasta", cafe: "Pasta Patch", rating: 4.3, etaMinutes: 23, price: 189, badge: "PA" }
];

const menuState = {
  category: "All",
  search: "",
  menuItems: []
};

const menuEls = {
  searchInput: document.getElementById("searchInput"),
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),
  categoryChips: document.getElementById("categoryChips"),
  menuGrid: document.getElementById("menuGrid"),
  resultCount: document.getElementById("resultCount")
};

function getCategories() {
  const unique = new Set(menuState.menuItems.map((item) => item.category));
  return ["All", ...Array.from(unique)];
}

function getFilteredItems() {
  const query = menuState.search.trim().toLowerCase();
  return menuState.menuItems.filter((item) => {
    const matchesCategory = menuState.category === "All" || item.category === menuState.category;
    const haystack = `${item.name} ${item.cafe} ${item.category}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesQuery;
  });
}

function renderCategories() {
  menuEls.categoryChips.innerHTML = getCategories()
    .map((category) => {
      const activeClass = category === menuState.category ? "active" : "";
      return `<button class="chip ${activeClass}" data-category="${category}" type="button">${category}</button>`;
    })
    .join("");
}

function renderMenu() {
  const items = getFilteredItems();
  menuEls.resultCount.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

  if (!items.length) {
    menuEls.menuGrid.innerHTML = `
      <article class="menu-card">
        <div class="food-emoji">NA</div>
        <div>
          <h3>No Items Found</h3>
          <p class="meta">Try changing category or search keyword.</p>
        </div>
      </article>
    `;
    return;
  }

  menuEls.menuGrid.innerHTML = items
    .map((item) => {
      const cart = getCart();
      const inCart = cart[item.id] || 0;
      const cartLabel = inCart > 0 ? `In Cart (${inCart})` : "Add To Cart";
      return `
        <article class="menu-card">
          <div class="food-emoji">${item.badge}</div>
          <div>
            <div class="menu-name">
              <h3>${item.name}</h3>
              <span>${item.rating} / 5</span>
            </div>
            <p class="meta">${item.cafe} | ${item.etaMinutes} min | ${item.category}</p>
            <div class="menu-footer">
              <span class="price">${formatInr(item.price)}</span>
              <button type="button" data-add-id="${item.id}">${cartLabel}</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadMenu() {
  try {
    const data = await apiRequest("api/menu/list.php");
    menuState.menuItems = Array.isArray(data.items) ? data.items : [];
  } catch (error) {
    menuState.menuItems = FALLBACK_MENU;
  }
  renderCategories();
  renderMenu();
}

function bindMenuEvents() {
  menuEls.categoryChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    menuState.category = button.dataset.category;
    renderCategories();
    renderMenu();
  });

  menuEls.searchInput.addEventListener("input", (event) => {
    menuState.search = event.target.value;
    renderMenu();
  });

  menuEls.clearFiltersBtn.addEventListener("click", () => {
    menuState.search = "";
    menuState.category = "All";
    menuEls.searchInput.value = "";
    renderCategories();
    renderMenu();
  });

  menuEls.menuGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-id]");
    if (!button) return;
    addToCartShared(button.dataset.addId);
    renderMenu(); // Re-render to update button text
  });
}

async function initMenu() {
  bindMenuEvents();
  await loadNavSession();
  await loadMenu();
}

initMenu().catch(console.error);
