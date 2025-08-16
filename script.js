document.addEventListener('DOMContentLoaded', function() {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  function switchToLogin() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  }

  function switchToRegister() {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }

  loginTab.addEventListener('click', switchToLogin);
  registerTab.addEventListener('click', switchToRegister);

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Inicio de sesión exitoso. Redirigiendo...');
    window.location.href = "registro.html";
  });

  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Registro exitoso. Redirigiendo...');
    window.location.href = "registro.html";
  });
});
