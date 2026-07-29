function demoRegister(e) {
  e.preventDefault();
  document.getElementById('msg').textContent = 'Compte créé (prototype). Redirection vers votre dashboard...';
  setTimeout(() => location.href = 'dashboard.html', 900);
}
function demoLogin(e) {
  e.preventDefault();
  document.getElementById('msg').textContent = 'Connexion réussie (prototype). Redirection...';
  setTimeout(() => location.href = 'dashboard.html', 700);
}
function demoSubmit(e) {
  e.preventDefault();
  document.getElementById('msg').textContent = 'Votre sortie a été soumise avec succès (prototype).';
  e.target.reset();
}
