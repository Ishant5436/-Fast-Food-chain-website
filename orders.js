/* ===== Orders Page JS ===== */

const ORDER_STAGES = [
  "Order Confirmed",
  "Cooking in Kitchen",
  "Rider Picked Up",
  "Rider Near Your Location",
  "Delivered"
];

let ordersUser = null;
let orderHistory = [];
let activeOrder = null;
let pollTimerId = null;

const orderEls = {
  authMessage: document.getElementById("ordersAuthMessage"),
  trackingPanel: document.getElementById("trackingPanel"),
  trackingOrderId: document.getElementById("trackingOrderId"),
  trackingStatusText: document.getElementById("trackingStatusText"),
  etaText: document.getElementById("etaText"),
  progressFill: document.getElementById("progressFill"),
  statusList: document.getElementById("statusList"),
  historyList: document.getElementById("historyList")
};

function statusIndex(status) {
  const index = ORDER_STAGES.indexOf(status);
  return index === -1 ? 0 : index;
}

function renderTracking() {
  if (!activeOrder) {
    orderEls.trackingPanel.classList.add("hidden");
    return;
  }

  const currentIndex = statusIndex(activeOrder.status);
  const progress = ((currentIndex + 1) / ORDER_STAGES.length) * 100;

  orderEls.trackingPanel.classList.remove("hidden");
  orderEls.trackingOrderId.textContent = `Order #${activeOrder.orderCode}`;
  orderEls.trackingStatusText.textContent = activeOrder.status;
  orderEls.etaText.textContent = `${Math.max(0, Number(activeOrder.etaMinutes || 0))} min`;
  orderEls.progressFill.style.width = `${progress}%`;
  orderEls.statusList.innerHTML = ORDER_STAGES.map((stage, index) => {
    const doneClass = index <= currentIndex ? "done" : "";
    return `<li class="${doneClass}">${stage}</li>`;
  }).join("");
}

function renderHistory() {
  if (!ordersUser) {
    orderEls.historyList.innerHTML = `
      <div class="page-message">
        <h2>🔐 Login Required</h2>
        <p>Sign in to view your order history.</p>
        <a href="index.php" class="admin-link btn-link" style="background:var(--brand);">Go to Login</a>
      </div>`;
    return;
  }

  if (!orderHistory.length) {
    orderEls.historyList.innerHTML = `
      <div class="page-message">
        <h2>📋 No Orders Yet</h2>
        <p>Place your first order from the menu!</p>
        <a href="menu.php" class="admin-link btn-link" style="background:var(--brand);">Browse Menu</a>
      </div>`;
    return;
  }

  orderEls.historyList.innerHTML = orderHistory
    .slice(0, 12)
    .map((order) => {
      const when = new Date(order.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
      const itemsText = (order.items || []).map((item) => `${item.name} x${item.quantity}`).join(", ");
      return `
        <article class="history-item">
          <div class="history-top">
            <span>Order #${order.orderCode}</span>
            <span>${when}</span>
          </div>
          <p>${itemsText || "No items"}</p>
          <p class="history-total">${formatInr(order.total)} | ${order.status}</p>
        </article>
      `;
    })
    .join("");
}

function chooseActiveOrder(orders) {
  if (!orders.length) return null;
  const inProgress = orders.find((order) => order.status !== "Delivered");
  return inProgress || null;
}

async function loadMyOrders() {
  if (!ordersUser) {
    orderHistory = [];
    activeOrder = null;
    renderHistory();
    renderTracking();
    return;
  }

  try {
    const data = await apiRequest("api/orders/my.php");
    const orders = Array.isArray(data.orders) ? data.orders : [];
    orderHistory = orders;
    activeOrder = chooseActiveOrder(orders);
    renderHistory();
    renderTracking();
  } catch (error) {
    orderEls.authMessage.textContent = error.message;
    orderEls.authMessage.classList.add("error");
  }
}

function startPolling() {
  if (pollTimerId) clearInterval(pollTimerId);
  if (!ordersUser) return;
  pollTimerId = setInterval(() => loadMyOrders(), 12000);
}

async function initOrders() {
  ordersUser = await loadNavSession();
  if (!ordersUser) {
    orderEls.authMessage.textContent = "Please login to view your orders.";
    orderEls.authMessage.classList.add("error");
  }
  await loadMyOrders();
  startPolling();
}

initOrders().catch(console.error);
