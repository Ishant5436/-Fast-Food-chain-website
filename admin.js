const state = {
  user: null,
  statuses: [],
  orders: [],
  refreshTimerId: null
};

const els = {
  adminStatusText: document.getElementById("adminStatusText"),
  adminMessage: document.getElementById("adminMessage"),
  adminStats: document.getElementById("adminStats"),
  adminOrdersList: document.getElementById("adminOrdersList"),
  adminLogoutBtn: document.getElementById("adminLogoutBtn")
};

function setMessage(message, isError) {
  els.adminMessage.textContent = message;
  els.adminMessage.classList.toggle("error", Boolean(isError));
}

async function loadSession() {
  const data = await apiRequest("api/auth/me.php");
  state.user = data.authenticated ? data.user : null;
}

async function logout() {
  try {
    await apiRequest("api/auth/logout.php", {
      method: "POST",
      body: JSON.stringify({})
    });
  } finally {
    window.location.href = "index.php";
  }
}

function renderStats() {
  if (!state.orders.length) {
    els.adminStats.innerHTML = `
      <article><h3>Total Orders</h3><p>0</p></article>
      <article><h3>In Progress</h3><p>0</p></article>
      <article><h3>Delivered</h3><p>0</p></article>
    `;
    return;
  }

  const delivered = state.orders.filter((order) => order.status === "Delivered").length;
  const inProgress = state.orders.length - delivered;

  els.adminStats.innerHTML = `
    <article><h3>Total Orders</h3><p>${state.orders.length}</p></article>
    <article><h3>In Progress</h3><p>${inProgress}</p></article>
    <article><h3>Delivered</h3><p>${delivered}</p></article>
  `;
}

function renderOrders() {
  if (!state.orders.length) {
    els.adminOrdersList.innerHTML = `<p class="empty-admin">No orders found yet.</p>`;
    return;
  }

  els.adminOrdersList.innerHTML = state.orders
    .map((order) => {
      const when = new Date(order.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });

      const options = state.statuses
        .map((status) => {
          const selected = status === order.status ? "selected" : "";
          return `<option value="${status}" ${selected}>${status}</option>`;
        })
        .join("");

      const itemList = (order.items || [])
        .map((item) => `<span class="admin-item">${item.name} x${item.quantity}</span>`)
        .join("");

      return `
        <article class="admin-order-card">
          <div class="admin-order-head">
            <div>
              <p class="admin-order-title">Order #${order.orderCode}</p>
              <p class="admin-order-meta">${order.customerName} | ${order.phone} | ${order.paymentMode}</p>
              <p class="admin-order-meta">${order.address}</p>
              <p class="admin-order-meta">Placed: ${when} | User: ${order.userEmail}</p>
            </div>
            <strong>${formatInr(order.total)}</strong>
          </div>
          <div class="admin-item-list">${itemList}</div>
          <div class="admin-status-row">
            <select data-status-select="${order.orderCode}">
              ${options}
            </select>
            <button type="button" data-update-status="${order.orderCode}">Update Status</button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadOrders() {
  const data = await apiRequest("api/admin/orders.php");
  state.orders = Array.isArray(data.orders) ? data.orders : [];
  state.statuses = Array.isArray(data.statuses) ? data.statuses : [];
  renderStats();
  renderOrders();
}

async function updateOrderStatus(orderCode, newStatus) {
  await apiRequest("api/admin/update_status.php", {
    method: "POST",
    body: JSON.stringify({ orderCode, status: newStatus })
  });
}

function startRefreshPolling() {
  if (state.refreshTimerId) {
    clearInterval(state.refreshTimerId);
  }
  state.refreshTimerId = setInterval(() => {
    loadOrders().catch((error) => setMessage(error.message, true));
  }, 12000);
}

function bindEvents() {
  els.adminLogoutBtn.addEventListener("click", logout);

  els.adminOrdersList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-update-status]");
    if (!button) return;
    const orderCode = button.dataset.updateStatus;
    const select = els.adminOrdersList.querySelector(`select[data-status-select="${orderCode}"]`);
    if (!select) return;
    const status = select.value;

    try {
      await updateOrderStatus(orderCode, status);
      setMessage(`Order #${orderCode} updated to "${status}".`);
      await loadOrders();
    } catch (error) {
      setMessage(error.message, true);
    }
  });
}

async function initialize() {
  try {
    await loadSession();
  } catch (error) {
    els.adminStatusText.textContent = "Session check failed.";
    setMessage(error.message, true);
    return;
  }

  if (!state.user) {
    els.adminStatusText.textContent = "Login required. Redirecting...";
    setTimeout(() => {
      window.location.href = "index.php";
    }, 1200);
    return;
  }

  if (state.user.role !== "admin") {
    els.adminStatusText.textContent = "Your account is not admin.";
    setMessage("Please login with admin account.", true);
    return;
  }

  els.adminStatusText.textContent = `Admin session: ${state.user.name} (${state.user.email})`;
  bindEvents();

  try {
    await loadOrders();
    startRefreshPolling();
    setMessage("Orders synced.");
  } catch (error) {
    setMessage(error.message, true);
  }
}

initialize();

