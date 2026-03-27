// Checks login
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.email) {
    alert("Please login first!");
    window.location.href = "login.html";
}

// LOAD DATA
const FALLBACK_MENU_MAP = {
    m1: { id: "m1", name: "Cheese Burst Burger", price: 149 },
    m2: { id: "m2", name: "Crispy Paneer Wrap", price: 129 },
    m3: { id: "m3", name: "Masala Maggi Bowl", price: 89 },
    m4: { id: "m4", name: "Farmhouse Pizza Slice", price: 179 },
    m5: { id: "m5", name: "Loaded Veg Momos", price: 109 },
    m6: { id: "m6", name: "Peri Peri Fries", price: 99 },
    m7: { id: "m7", name: "Cold Coffee Blast", price: 119 },
    m8: { id: "m8", name: "Chocolate Shake", price: 109 },
    m9: { id: "m9", name: "Veg Loaded Sandwich", price: 139 },
    m10: { id: "m10", name: "Tandoori Paneer Bowl", price: 199 },
    m11: { id: "m11", name: "Chole Rice Combo", price: 149 },
    m12: { id: "m12", name: "Smoky Pasta Alfredo", price: 189 }
};

function readJsonStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function getStoredMenuMap() {
    const rawMenu = readJsonStorage("menu", []);
    if (!Array.isArray(rawMenu)) {
        return FALLBACK_MENU_MAP;
    }

    const menuMap = { ...FALLBACK_MENU_MAP };
    rawMenu.forEach((item) => {
        if (!item || !item.id) return;
        menuMap[String(item.id)] = {
            id: String(item.id),
            name: item.name || FALLBACK_MENU_MAP[String(item.id)]?.name || "Item",
            price: Number(item.price) || FALLBACK_MENU_MAP[String(item.id)]?.price || 0
        };
    });
    return menuMap;
}

function getCartItems() {
    const menuMap = getStoredMenuMap();
    const rawLegacyCart = readJsonStorage("cart", []);
    const rawSharedCart = readJsonStorage("campus_crave_php_cart", {});
    const normalizeCartItem = (rawKey, rawItem) => {
        if (rawItem == null) return null;

        if (typeof rawItem === "string" || typeof rawItem === "number") {
            const id = String(rawItem || rawKey || "");
            const menuItem = menuMap[id];
            if (!menuItem) return null;
            return {
                id,
                name: menuItem.name,
                price: Number(menuItem.price || 0),
                qty: 1
            };
        }

        if (typeof rawItem !== "object") {
            return null;
        }

        const id = String(rawItem.id ?? rawItem.menuItemId ?? rawItem.productId ?? rawKey ?? "");
        const menuItem = menuMap[id] || null;
        const name = rawItem.name ?? rawItem.itemName ?? rawItem.title ?? rawItem.productName ?? menuItem?.name ?? "";
        const price = Number(rawItem.price ?? rawItem.unitPrice ?? rawItem.amount ?? menuItem?.price ?? 0);
        const qty = Number(rawItem.qty ?? rawItem.quantity ?? rawItem.count ?? 1);

        if (!name && !id) {
            return null;
        }

        return {
            id,
            name,
            price,
            qty
        };
    };

    if (Array.isArray(rawLegacyCart)) {
        return rawLegacyCart
            .map((item) => normalizeCartItem("", item))
            .filter((item) => item && item.qty > 0 && (item.id || item.name));
    }

    if (rawLegacyCart && typeof rawLegacyCart === "object" && !Array.isArray(rawLegacyCart)) {
        return Object.entries(rawLegacyCart)
            .map(([id, value]) => {
                if (value && typeof value === "object") {
                    return normalizeCartItem(id, value);
                }
                const menuItem = menuMap[String(id)];
                return {
                    id: String(id),
                    name: menuItem?.name || "",
                    price: Number(menuItem?.price || 0),
                    qty: Number(value || 0)
                };
            })
            .filter((item) => item && item.qty > 0 && (item.id || item.name));
    }

    if (rawSharedCart && typeof rawSharedCart === "object") {
        return Object.entries(rawSharedCart)
            .map(([id, value]) => {
                if (value && typeof value === "object") {
                    return normalizeCartItem(id, value);
                }
                const menuItem = menuMap[String(id)];
                return {
                    id: String(id),
                    name: menuItem?.name || "",
                    price: Number(menuItem?.price || 0),
                    qty: Number(value || 0)
                };
            })
            .filter((item) => item && item.qty > 0 && (item.id || item.name));
    }

    return [];
}

// Calculate Bill
function calculateBill() {

    let subtotal = 0;

    const cart = getCartItems();

    cart.forEach(item => {
        subtotal += item.price * item.qty;
    });

    const packaging = subtotal > 0 ? 20 : 0;
    const delivery = subtotal > 500 ? 0 : (subtotal > 0 ? 45 : 0);
    const tax = Math.round(subtotal * 0.05);

    // base total BEFORE donation
    const baseTotal = subtotal + packaging + delivery + tax;

    const donationEnabled = document.getElementById("donationCheck")?.checked;

    // Donation is 2% of TOTAL
    const donation = donationEnabled
        ? Math.round(baseTotal * 0.02)
        : 0;

    const total = baseTotal + donation;

    // UPDATE UI
    document.getElementById("subtotal").innerText = subtotal;
    document.getElementById("delivery").innerText = delivery;
    document.getElementById("tax").innerText = tax;
    document.getElementById("donation").innerText = donation;
    document.getElementById("total").innerText = total;
}

// Place Order
function placeOrder() {
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const payment = document.getElementById("payment").value;

    if (!name || !address || !phone) {
        alert("Please fill all details!");
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        alert("Enter valid 10-digit phone number");
        return;
    }

    const cartItems = getCartItems();

    if (cartItems.length === 0) {
        alert("Cart is empty!");
        return;
    }
    const order = {
        customerName: name,
        address: address,
        phone: phone,
        paymentMode: payment,
        items: cartItems.map(item => ({
            menuItemId: item.id || "",
            name: item.name,
            unitPrice: item.price,
            quantity: item.qty
        }))
    };

    // SEND TO BACKEND
    fetch('http://localhost/food_project/api/orders/create.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(order)
    })
        .then(res => res.json())
        .then(data => {
            console.log("Response:", data);

            if (data.message === "Order placed successfully.") {
                alert("Order placed!");

                localStorage.removeItem("cart");

                window.location.href = "index.html";
            } else {
                alert(data.message || "Failed to place order");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error connecting to server");
        });
}

// Auto calculation
document.addEventListener("DOMContentLoaded", () => {
    calculateBill();

    // Recalculating if donation checkbox is changed
    const donationCheckbox = document.getElementById("donationCheck");
    if (donationCheckbox) {
        donationCheckbox.addEventListener("change", calculateBill);
    }
});
