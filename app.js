/* ===== Home Page (app.js) — Auth handling ===== */

const state = {
  authMode: "register",
  user: null
};

const els = {
  authStatus: document.getElementById("authStatus"),
  authMessage: document.getElementById("authMessage"),
  authForm: document.getElementById("authForm"),
  authName: document.getElementById("authName"),
  authNameLabel: document.getElementById("authNameLabel"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  authSubmitBtn: document.getElementById("authSubmitBtn"),
  switchAuthModeBtn: document.getElementById("switchAuthModeBtn"),
  logoutBtn: document.getElementById("logoutBtn")
};

function setAuthMessage(message, isError) {
  els.authMessage.textContent = message;
  els.authMessage.classList.toggle("error", Boolean(isError));
}

function renderAuthUI() {
  if (state.user) {
    els.authStatus.textContent = `Signed in: ${state.user.name} (${state.user.role})`;
    els.authForm.classList.add("hidden");
    els.logoutBtn.classList.remove("hidden");
    return;
  }

  const isRegister = state.authMode === "register";
  els.authStatus.textContent = "Not signed in";
  els.authForm.classList.remove("hidden");
  els.logoutBtn.classList.add("hidden");

  els.authSubmitBtn.textContent = isRegister ? "Register" : "Login";
  els.switchAuthModeBtn.textContent = isRegister ? "Switch To Login" : "Switch To Register";
  els.authNameLabel.classList.toggle("hidden", !isRegister);
  els.authName.classList.toggle("hidden", !isRegister);
  els.authName.required = isRegister;
}

async function loadSession() {
  const user = await loadNavSession();
  state.user = user;
  renderAuthUI();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const mode = state.authMode;
  const name = String(els.authName.value || "").trim();
  const email = String(els.authEmail.value || "").trim();
  const password = String(els.authPassword.value || "");

  if (!email || !password) {
    setAuthMessage("Email and password are required.", true);
    return;
  }
  if (mode === "register" && !name) {
    setAuthMessage("Name is required for registration.", true);
    return;
  }

  try {
    if (mode === "register") {
      await apiRequest("api/auth/register.php", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
    } else {
      await apiRequest("api/auth/login.php", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
    }

    setAuthMessage(`${mode === "register" ? "Registration" : "Login"} successful! Redirecting to menu...`);
    els.authForm.reset();
    await loadSession();
    setTimeout(() => { window.location.href = "menu.php"; }, 1200);
  } catch (error) {
    setAuthMessage(error.message, true);
  }
}

function toggleAuthMode() {
  state.authMode = state.authMode === "register" ? "login" : "register";
  setAuthMessage("");
  renderAuthUI();
}

async function logout() {
  try {
    await apiRequest("api/auth/logout.php", { method: "POST", body: JSON.stringify({}) });
  } catch (error) {
    setAuthMessage(error.message, true);
  }
  state.user = null;
  renderAuthUI();
  setAuthMessage("Logged out successfully.");
  // Reload nav
  loadNavSession();
}

function bindEvents() {
  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.switchAuthModeBtn.addEventListener("click", toggleAuthMode);
  els.logoutBtn.addEventListener("click", logout);
}

async function initialize() {
  renderAuthUI();
  bindEvents();
  await loadSession();
}

initialize().catch(() => {
  setAuthMessage("Failed to initialize.", true);
});
