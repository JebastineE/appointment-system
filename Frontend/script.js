// CONFIGURATION
const ADMIN_SECRET = "HOSPITAL_ADMIN_2025";

// NAV & AUTH STATE
document.addEventListener("DOMContentLoaded", () => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    const logoutNav = document.getElementById("logoutNav");
    const greetingNav = document.getElementById("userGreeting");
    const emailField = document.getElementById("email");

    if (activeUser) {
        if (logoutNav) logoutNav.style.display = "block";
        if (greetingNav) {
            greetingNav.textContent = `Hello, ${activeUser.name || activeUser.email}`;
        }
    }

    const lastEmail = localStorage.getItem("lastRegisteredEmail");
    if (lastEmail && emailField) {
        emailField.value = lastEmail;
    }
});

// UI NAVIGATION
function switchTab(tab) {
    const loginSection = document.getElementById("loginSection");
    const signupSection = document.getElementById("signupSection");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (loginSection) loginSection.classList.toggle("active", tab === 'login');
    if (signupSection) signupSection.classList.toggle("active", tab === 'signup');
    if (loginBtn) loginBtn.classList.toggle("active", tab === 'login');
    if (signupBtn) signupBtn.classList.toggle("active", tab === 'signup');
    clearMessages();
}

function toggleAdminField() {
    const isChecked = document.getElementById("isAdminCheck").checked;
    document.getElementById("adminCodeGroup").style.display = isChecked ? "block" : "none";
}

function clearMessages() {
    const errorEl = document.getElementById("errorMessage");
    const successEl = document.getElementById("successMessage");
    if(errorEl) errorEl.textContent = "";
    if(successEl) successEl.textContent = "";
}

// AUTH LOGIC
if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const role = document.getElementById("role").value;
        const email = document.getElementById("email").value;
        const pass = document.getElementById("password").value;
        const error = document.getElementById("errorMessage");

        // Hardcoded Credentials
        if (role === "admin" && email === "admin@mail.com" && pass === "admin") {
            loginRedirect("admin", email, "Admin");
            return;
        }
        if (role === "user" && email === "user@mail.com" && pass === "user") {
            loginRedirect("user", email, "Master User");
            return;
        }

        const storeKey = role === "admin" ? "hospital_admins" : "hospital_patients";
        const accounts = JSON.parse(localStorage.getItem(storeKey)) || [];
        const user = accounts.find(a => a.email === email && a.password === pass);

        if (user) {
            loginRedirect(role, email, user.name);
        } else {
            error.textContent = "Access denied. Check credentials and role.";
        }
    });
}

function handleSignup() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPassword").value;
    const isAdmin = document.getElementById("isAdminCheck").checked;
    const code = document.getElementById("secretCode").value;
    const error = document.getElementById("errorMessage");
    const success = document.getElementById("successMessage");

    if (!name || !email || !pass) {
        error.textContent = "Please complete all fields.";
        return;
    }

    if (isAdmin) {
        if (code !== ADMIN_SECRET) {
            error.textContent = "Invalid Admin Secret Code.";
            return;
        }
        saveAccount("hospital_admins", { name, email, password: pass });
    } else {
        saveAccount("hospital_patients", { name, email, password: pass });
    }

    localStorage.setItem("lastRegisteredEmail", email);
    success.textContent = "Account created! You can now login.";
    setTimeout(() => switchTab('login'), 1500);
}

function saveAccount(key, data) {
    const accounts = JSON.parse(localStorage.getItem(key)) || [];
    accounts.push(data);
    localStorage.setItem(key, JSON.stringify(accounts));
}

function loginRedirect(role, email, name) {
    localStorage.setItem("activeUser", JSON.stringify({ role, email, name }));
    window.location.href = role === "admin" ? "admin_dashboard.html" : "user_dashboard.html";
}

function logout() {
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
}

// MODALS
function showInfo(type) {
    const modal = document.getElementById("infoModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    
    if (type === 'contact') {
        title.innerText = "Contact Support";
        body.innerHTML = "<p>Direct Line: (555) 012-3456</p><p>Email: health@cityhospital.com</p><p>Location: 100 Medical Plaza, City Heights.</p>";
    } else {
        title.innerText = "System Help";
        body.innerHTML = "<p>Need help with booking? Contact our administrator at admin_support@hospital.com</p><p>Emergency? Dial 100 immediately.</p>";
    }
    modal.style.display = "flex";
}

function closeModal() {
    const infoModal = document.getElementById("infoModal");
    const rescheduleModal = document.getElementById("rescheduleModal");
    if (infoModal) infoModal.style.display = "none";
    if (rescheduleModal) rescheduleModal.style.display = "none";
}

window.onclick = (event) => {
    const modal = document.getElementById("infoModal");
    const resModal = document.getElementById("rescheduleModal");
    if (event.target == modal) closeModal();
    if (event.target == resModal) closeModal();
};