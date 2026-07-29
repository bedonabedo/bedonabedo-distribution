// Shared helpers for auth feedback and dashboard protection.
function getAuthMessageElement() {
  return document.getElementById('msg');
}

function setAuthMessage(message, isError = false) {
  const msgEl = getAuthMessageElement();
  if (!msgEl) return;

  msgEl.textContent = message;
  msgEl.style.color = isError ? '#ff8a80' : '#b9ff39';
}

function redirectToLoginIfNeeded() {
  if (window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/register.html') || window.location.pathname.endsWith('/confirm.html')) {
    return;
  }

  if (!window.supabase) {
    window.location.href = 'login.html';
    return;
  }

  window.supabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
      window.location.href = 'login.html';
    }
  }).catch(() => {
    window.location.href = 'login.html';
  });
}

function getSupabaseAuthParams() {
  const searchParams = new URLSearchParams(window.location.search || '');
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const params = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  for (const [key, value] of hashParams.entries()) {
    params[key] = value;
  }

  return params;
}

function hasSupabaseAuthParams() {
  const params = getSupabaseAuthParams();
  return Boolean(params.access_token || params.refresh_token || params.token_hash || params.error_description || params.error);
}

async function finalizeEmailConfirmation() {
  if (!window.supabase) {
    setAuthMessage('La configuration Supabase n\'est pas encore renseignée.', true);
    return;
  }

  const params = getSupabaseAuthParams();
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  const tokenHash = params.token_hash;
  const type = params.type;
  const errorDescription = params.error_description || params.error;

  if (errorDescription) {
    setAuthMessage(errorDescription || 'La confirmation a échoué.', true);
    return;
  }

  if (!accessToken && !refreshToken && !tokenHash) {
    setAuthMessage('Aucun code de confirmation n\'a été trouvé dans l\'URL.', true);
    return;
  }

  try {
    if (tokenHash && type) {
      const { data, error } = await window.supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        console.error('OTP verification failed', error);
        setAuthMessage('La confirmation a échoué. Veuillez réessayer ou demander un nouvel e-mail.', true);
        return;
      }

      if (data.session) {
        setAuthMessage('Votre adresse e-mail a bien été confirmée. Vous pouvez maintenant vous connecter.');
        window.location.href = 'login.html';
        return;
      }
    }

    if (accessToken && refreshToken) {
      const { data, error } = await window.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('Session exchange failed', error);
        setAuthMessage('La confirmation a échoué. Veuillez réessayer.', true);
        return;
      }

      if (data.session) {
        setAuthMessage('Votre adresse e-mail a bien été confirmée. Vous pouvez maintenant vous connecter.');
        window.location.href = 'login.html';
        return;
      }
    }

    setAuthMessage('La confirmation est en cours mais aucune session n\'a pu être établie.', true);
  } catch (error) {
    console.error('Email confirmation error', error);
    setAuthMessage('La confirmation a rencontré une erreur inattendue.', true);
  }
}

function setDashboardLoadingState() {
  const nameEl = document.querySelector('[data-dashboard-user-name]');
  const emailEl = document.querySelector('[data-dashboard-user-email]');
  const profileEl = document.querySelector('[data-dashboard-user-profile]');

  if (nameEl) {
    nameEl.textContent = 'Chargement...';
  }

  if (emailEl) {
    emailEl.textContent = 'Chargement de votre session...';
  }

  if (profileEl) {
    profileEl.textContent = 'Chargement du profil utilisateur...';
  }
}

async function loadDashboardProfile() {
  if (!window.supabase) {
    setAuthMessage('La configuration Supabase n\'est pas encore renseignée.', true);
    window.location.href = 'login.html';
    return;
  }

  setDashboardLoadingState();

  const { data: sessionData, error: sessionError } = await window.supabase.auth.getSession();
  if (sessionError || !sessionData?.session) {
    console.error('Session check failed', sessionError);
    window.location.href = 'login.html';
    return;
  }

  const sessionUser = sessionData.session.user;
  const { data: userData, error: userError } = await window.supabase.auth.getUser();
  const authUser = userData?.user || sessionUser;

  if (userError) {
    console.warn('Unable to refresh auth user', userError);
  }

  if (!authUser?.id) {
    window.location.href = 'login.html';
    return;
  }

  const { data: profileData, error: profileError } = await window.supabase
    .from('profiles')
    .select('full_name, artist_name, country')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError) {
    console.warn('Profile lookup failed', profileError);
    updateDashboardUserInfo(authUser, null, 'Profil indisponible pour le moment.');
    return;
  }

  if (!profileData) {
    updateDashboardUserInfo(authUser, null, 'Aucun profil trouvé pour cet utilisateur.');
    return;
  }

  updateDashboardUserInfo(authUser, profileData, 'Profil chargé depuis Supabase.');
}

function protectDashboardPage() {
  loadDashboardProfile();
}

function updateDashboardUserInfo(user, profile = null, statusMessage = '') {
  if (!user) return;

  const nameEl = document.querySelector('[data-dashboard-user-name]');
  const emailEl = document.querySelector('[data-dashboard-user-email]');
  const profileEl = document.querySelector('[data-dashboard-user-profile]');
  const avatarEl = document.querySelector('[data-dashboard-user-avatar]');

  const profileName = profile?.full_name || user.user_metadata?.full_name || '';
  const artistName = profile?.artist_name || user.user_metadata?.artist_name || '';
  const country = profile?.country || user.user_metadata?.country || '';
  const avatarSource = user.user_metadata?.picture || user.user_metadata?.avatar_url || '';
  const fallbackName = profileName || artistName || user.email || 'Artiste';

  if (nameEl) {
    nameEl.textContent = fallbackName;
  }

  if (emailEl) {
    emailEl.textContent = user.email || 'Votre email';
  }

  if (profileEl) {
    const details = [];
    if (artistName) {
      details.push(`Artiste : ${artistName}`);
    }
    if (country) {
      details.push(`Pays : ${country}`);
    }

    profileEl.textContent = details.length > 0 ? details.join(' • ') : (statusMessage || 'Profil chargé depuis Supabase.');
  }

  if (avatarEl) {
    if (avatarSource) {
      avatarEl.src = avatarSource;
      avatarEl.style.display = 'block';
    } else {
      avatarEl.style.display = 'none';
    }
  }
}
