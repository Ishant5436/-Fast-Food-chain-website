// Retrieve cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Add item to cart
function addToCart(btn) {
    const card = btn.closest(".food-card");

    // safety check
    if (!card) {
        console.error("Food card not found");
        return;
    }

    const name =
        card.dataset.name ||
        card.querySelector("h4")?.innerText ||
        "Item";

    const price = parseInt(card.dataset.price) || 0;

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            qty: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    showToast(`${name} added to cart`);
}

// Update cart count in navbar
function updateCartCount() {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];

    const count = cartData.reduce((total, item) => {
        return total + item.qty;
    }, 0);

    const countElement = document.getElementById("cart-count");

    if (countElement) {
        countElement.innerText = count;
    }
}

// Load cart items on cart page
function loadCart() {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("cart-items");

    if (!container) return;

    container.innerHTML = "";

    if (cartData.length === 0) {
        container.innerHTML = "<p class='empty'>Your cart is empty</p>";
        document.getElementById("total-price").innerText = 0;
        return;
    }

    cartData.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
            </div>

            <div class="item-actions">
                <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                <button class="qty-btn remove-btn" onclick="removeItem(${index})">X</button>
            </div>
        `;

        container.appendChild(div);
    });

    updateTotal();
}

// Change item quantity
function changeQty(index, change) {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];

    cartData[index].qty += change;

    if (cartData[index].qty <= 0) {
        cartData.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cartData));

    loadCart();
    updateCartCount();
}

// Remove item from cart
function removeItem(index) {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];

    cartData.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cartData));

    loadCart();
    updateCartCount();
}

// Calculate total price
function updateTotal() {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];

    const total = cartData.reduce((sum, item) => {
        return sum + item.price * item.qty;
    }, 0);

    const totalElement = document.getElementById("total-price");

    if (totalElement) {
        totalElement.innerText = total;
    }
}

// Simple toast message
function showToast(message) {
    const toast = document.createElement("div");
    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "20px";
    toast.style.background = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "1000";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    loadCart();
});

function goToCheckout() {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};

    if (Object.keys(cart).length === 0) {
        alert("Cart is empty!");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    // Checks for user login
    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html"; // or open modal
        return;
    }

    window.location.href = "checkout.html";
}
