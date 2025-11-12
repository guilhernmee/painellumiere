document.addEventListener("DOMContentLoaded", () => {
  // quick helper to show register block in same page (index)
  const toRegister = document.getElementById("toRegister");
  const toLogin = document.getElementById("toLogin");
  const registerCard = document.getElementById("registerCard");
  const loginCard = document.getElementById("loginCard");

  if (toRegister) {
    toRegister.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginCard) loginCard.style.display = "none";
      if (registerCard) registerCard.style.display = "block";
    });
  }
  if (toLogin) {
    toLogin.addEventListener("click", (e) => {
      e.preventDefault();
      if (registerCard) registerCard.style.display = "none";
      if (loginCard) loginCard.style.display = "block";
    });
  }

  // Register on index (another smaller form)
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();
      const cargo = document.getElementById("cargo").value;
      if (!nome || !email || !senha || !cargo) return alert("Preencha todos os campos!");
      const contas = JSON.parse(localStorage.getItem("contas") || "[]");
      contas.push({ user: email, pass: senha, nome, role: cargo });
      localStorage.setItem("contas", JSON.stringify(contas));
      alert("Conta criada! Use seu e-mail como usuário.");
      registerForm.reset();
      if (registerCard) registerCard.style.display = "none";
      if (loginCard) loginCard.style.display = "block";
    });
  }

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("user").value.trim();
      const pass = document.getElementById("pass").value.trim();
      // check stored accounts
      const contas = JSON.parse(localStorage.getItem("contas") || "[]");
      const match = contas.find(c => (c.user === user || c.nome === user) && c.pass === pass);
      if (match || (user === "admin" && pass === "1234")) {
        localStorage.setItem("logged", user);
        window.location.href = "dashboard.html";
      } else {
        alert("Usuário ou senha inválidos!");
      }
    });
  }
});
