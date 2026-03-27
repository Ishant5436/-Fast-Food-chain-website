/* ===== Shared Utilities ===== */

const STORAGE_KEYS = {
  cart: "campus_crave_php_cart",
  coupon: "campus_crave_php_coupon"
};

function loadFromStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const formatter = new Intl.NumberFormat("en-IN");

function formatInr(value) {
  return `INR ${formatter.format(Math.max(0, Math.round(value)))}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }
  return payload;
}

/* ===== Cart Helpers (shared across pages) ===== */

function getCart() {
  return loadFromStorage(STORAGE_KEYS.cart, {});
}

function setCart(cart) {
  saveToStorage(STORAGE_KEYS.cart, cart);
  updateCartBadge();
}

function addToCartShared(id) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  setCart(cart);
}

function getCartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("navCartBadge");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}

/* ===== Nav Auth + Session ===== */

async function loadNavSession() {
  try {
    const data = await apiRequest("api/auth/me.php");
    const statusEl = document.getElementById("navAuthStatus");
    const adminLink = document.getElementById("navAdminLink");

    if (data.authenticated && data.user) {
      if (statusEl) statusEl.textContent = `Hi, ${data.user.name}`;
      if (adminLink && data.user.role === "admin") {
        adminLink.classList.remove("hidden");
      }
      return data.user;
    } else {
      if (statusEl) statusEl.textContent = "Not signed in";
      return null;
    }
  } catch {
    return null;
  }
}

/* ===== Mobile Nav Toggle ===== */

function initNav() {
  const toggle = document.getElementById("navMenuToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("nav-open");
    });
  }
  // Set admin link active class from data attribute
  const adminLink = document.getElementById("navAdminLink");
  if (adminLink && adminLink.dataset.active === "true") {
    adminLink.classList.add("active");
  }
  updateCartBadge();
}

document.addEventListener("DOMContentLoaded", initNav);
