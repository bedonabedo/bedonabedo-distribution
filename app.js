// Supabase Auth integration for login, registration, logout and dashboard protection.
function getAuthFormMessageElement() {
  return document.getElementById('msg');
}

function showAuthMessage(message, isError = false) {
  const msgEl = getAuthFormMessageElement();
  if (!msgEl) return;

  msgEl.textContent = message;
  msgEl.style.color = isError ? '#ff8a80' : '#b9ff39';
}

async function demoRegister(e) {
  e.preventDefault();

  if (!window.supabase) {
    showAuthMessage('La configuration Supabase n\'est pas encore renseignée.', true);
    return;
  }

  const fullName = document.getElementById('register-full-name')?.value?.trim() || '';
  const artistName = document.getElementById('register-artist-name')?.value?.trim() || '';
  const email = document.getElementById('register-email')?.value?.trim() || '';
  const country = document.getElementById('register-country')?.value?.trim() || '';
  const password = document.getElementById('register-password')?.value || '';
  const confirmPassword = document.getElementById('register-confirm-password')?.value || '';

  if (password !== confirmPassword) {
    showAuthMessage('Les mots de passe ne correspondent pas.', true);
    return;
  }

  showAuthMessage('Création du compte en cours...');

  const redirectUrl = window.location.hostname === 'localhost'
    ? `${window.location.origin}/login.html`
    : 'https://bedonabedo.github.io/bedonabedo-distribution/login.html';

  const signupOptions = {
    emailRedirectTo: redirectUrl,
    data: {
      full_name: fullName,
      artist_name: artistName,
      country,
    },
  };

  const { data, error } = await window.supabase.auth.signUp({
    email,
    password,
    options: signupOptions,
  });

  if (error) {
    showAuthMessage(error.message || 'Impossible de créer le compte.', true);
    return;
  }

  if (data.session) {
    showAuthMessage('Compte créé avec succès. Redirection vers votre tableau de bord...');
    window.location.href = 'dashboard.html';
    return;
  }

  showAuthMessage('Compte créé. Vérifiez votre adresse e-mail pour finaliser l\'activation.');
}

async function demoLogin(e) {
  e.preventDefault();

  if (!window.supabase) {
    showAuthMessage('La configuration Supabase n\'est pas encore renseignée.', true);
    return;
  }

  const email = document.getElementById('login-email')?.value?.trim() || '';
  const password = document.getElementById('login-password')?.value || '';

  showAuthMessage('Connexion en cours...');

  const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showAuthMessage(error.message || 'Impossible de se connecter.', true);
    return;
  }

  if (data.session) {
    showAuthMessage('Connexion réussie. Redirection vers votre tableau de bord...');
    window.location.href = 'dashboard.html';
  }
}

async function logoutCurrentUser() {
  if (!window.supabase) {
    window.location.href = 'login.html';
    return;
  }

  const { error } = await window.supabase.auth.signOut();
  if (error) {
    console.error('Logout failed', error);
  }

  window.location.href = 'login.html';
}

function attachLogoutLinks() {
  const logoutLinks = document.querySelectorAll('[data-auth-logout]');
  logoutLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      logoutCurrentUser();
    });
  });
}

function initializeAuthUi() {
  attachLogoutLinks();

  if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('/dashboard.html')) {
    protectDashboardPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuthUi);
} else {
  initializeAuthUi();
}

function demoSubmit(e) {
  e.preventDefault();
  document.getElementById('msg').textContent = 'Votre sortie a été soumise avec succès (prototype).';
  e.target.reset();
}
