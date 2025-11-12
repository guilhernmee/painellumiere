// app.js - controle central (armazenamento em localStorage, CRUD cliente/equipe/financeiro)
(function () {
  // --- inicializa dados padrão ---
  function initData() {
    if (!localStorage.getItem("dentistas")) {
      const dentistas = [
        { id: 1, nome: "Dr. Lucas", especialidade: "Clínico Geral" },
        { id: 2, nome: "Dra. Ana", especialidade: "Ortodontista" }
      ];
      localStorage.setItem("dentistas", JSON.stringify(dentistas));
    }
    if (!localStorage.getItem("pacientes")) localStorage.setItem("pacientes", JSON.stringify([]));
    if (!localStorage.getItem("financeiro")) localStorage.setItem("financeiro", JSON.stringify([]));
    if (!localStorage.getItem("contas")) localStorage.setItem("contas", JSON.stringify([]));
  }
  initData();

  // --- utils ---
  const get = (k) => JSON.parse(localStorage.getItem(k) || "[]");
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // --- PACIENTES ---
  if (document.getElementById("formPaciente") || document.getElementById("listaPacientes")) {
    const form = document.getElementById("formPaciente");
    const tabela = document.getElementById("listaPacientes");

    function renderPacientes() {
      const pacientes = get("pacientes");
      if (!tabela) return;
      const tbody = tabela.querySelector("tbody");
      tbody.innerHTML = pacientes.map(p => `
        <tr>
          <td>${p.nome}</td>
          <td>${p.cpf}</td>
          <td>${p.telefone}</td>
          <td>${p.email}</td>
          <td>${p.procedimento || "-"}</td>
          <td class="table-actions">
            <button class="btn small ghost" onclick="editarPaciente('${p.cpf}')">Editar</button>
            <button class="btn small" onclick="removerPaciente('${p.cpf}')">Excluir</button>
          </td>
        </tr>
      `).join("");
    }

    window.removerPaciente = function (cpf) {
      if (!confirm("Excluir paciente?")) return;
      let ps = get("pacientes");
      ps = ps.filter(x => x.cpf !== cpf);
      set("pacientes", ps);
      renderPacientes();
      updateDashboard();
    };

    window.editarPaciente = function (cpf) {
      const ps = get("pacientes");
      const p = ps.find(x => x.cpf === cpf);
      if (!p) return alert("Paciente não encontrado");
      document.getElementById("nome").value = p.nome;
      document.getElementById("cpf").value = p.cpf;
      document.getElementById("telefone").value = p.telefone;
      document.getElementById("email").value = p.email;
      document.getElementById("procedimento").value = p.procedimento || "";
      removerPaciente(cpf);
    };

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const nome = document.getElementById("nome").value.trim();
        const cpf = document.getElementById("cpf").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim();
        const procedimento = document.getElementById("procedimento").value.trim();
        if (!nome || !cpf) return alert("Nome e CPF são obrigatórios");
        const pacientes = get("pacientes");
        if (pacientes.find(x => x.cpf === cpf)) return alert("CPF já cadastrado");
        pacientes.push({ nome, cpf, telefone, email, procedimento });
        set("pacientes", pacientes);
        form.reset();
        renderPacientes();
        updateDashboard();
      });
    }
    renderPacientes();
  }

  // --- EQUIPE (dentistas) ---
  if (document.getElementById("formEquipe") || document.getElementById("listaEquipe")) {
    const form = document.getElementById("formEquipe");
    const tabela = document.getElementById("listaEquipe");

    function renderEquipe() {
      const equipe = get("dentistas");
      if (!tabela) return;
      const tbody = tabela.querySelector("tbody");
      tbody.innerHTML = equipe.map(d => `
        <tr>
          <td>${d.nome}</td>
          <td>${d.especialidade}</td>
          <td class="table-actions">
            <button class="btn small ghost" onclick="editarDentista(${d.id})">Editar</button>
            <button class="btn small" onclick="removerDentista(${d.id})">Excluir</button>
          </td>
        </tr>
      `).join("");
    }

    window.removerDentista = function (id) {
      if (!confirm("Excluir membro da equipe?")) return;
      let equipe = get("dentistas");
      equipe = equipe.filter(x => x.id !== id);
      set("dentistas", equipe);
      renderEquipe();
      updateDashboard();
    };

    window.editarDentista = function (id) {
      const equipe = get("dentistas");
      const d = equipe.find(x => x.id === id);
      if (!d) return alert("Dentista não encontrado");
      document.getElementById("nomeDentista").value = d.nome;
      document.getElementById("especialidade").value = d.especialidade;
      removerDentista(id);
    };

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const nome = document.getElementById("nomeDentista").value.trim();
        const esp = document.getElementById("especialidade").value.trim();
        if (!nome || !esp) return alert("Preencha nome e especialidade");
        const equipe = get("dentistas");
        const novo = { id: Date.now(), nome, especialidade: esp };
        equipe.push(novo);
        set("dentistas", equipe);
        form.reset();
        renderEquipe();
        updateDashboard();
      });
    }
    renderEquipe();
  }

  // --- FINANCEIRO ---
  if (document.getElementById("formFinanceiro") || document.getElementById("listaFinanceiro")) {
    const form = document.getElementById("formFinanceiro");
    const tabela = document.getElementById("listaFinanceiro");
    const totalEntradaEl = document.getElementById("totalEntrada");
    const totalSaidaEl = document.getElementById("totalSaida");

    function renderFinanceiro() {
      const fin = get("financeiro");
      if (!tabela) return;
      const tbody = tabela.querySelector("tbody");
      let entradas = 0, saidas = 0;
      tbody.innerHTML = fin.map(f => {
        if (f.tipo === "Entrada") entradas += Number(f.valor);
        else saidas += Number(f.valor);
        return `<tr>
          <td>${f.descricao}</td>
          <td>${f.tipo}</td>
          <td>R$ ${Number(f.valor).toFixed(2)}</td>
          <td>${f.data}</td>
          <td class="table-actions">
            <button class="btn small" onclick="removerLancamento(${f.id})">Excluir</button>
          </td>
        </tr>`;
      }).join("");
      if (totalEntradaEl) totalEntradaEl.textContent = `R$ ${entradas.toFixed(2)}`;
      if (totalSaidaEl) totalSaidaEl.textContent = `R$ ${saidas.toFixed(2)}`;
    }

    window.removerLancamento = function (id) {
      if (!confirm("Excluir lançamento?")) return;
      let fin = get("financeiro");
      fin = fin.filter(x => x.id !== id);
      set("financeiro", fin);
      renderFinanceiro();
      updateDashboard();
    };

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const desc = document.getElementById("descricao").value.trim();
        const tipo = document.getElementById("tipo").value;
        const valor = parseFloat(document.getElementById("valor").value);
        const data = document.getElementById("data").value;
        if (!desc || !tipo || !valor || !data) return alert("Preencha todos os campos");
        const fin = get("financeiro");
        fin.push({ id: Date.now(), descricao: desc, tipo, valor, data });
        set("financeiro", fin);
        form.reset();
        renderFinanceiro();
        updateDashboard();
      });
    }
    renderFinanceiro();
  }

  // --- DASHBOARD ---
  function updateDashboard() {
    const totalPacientesEl = document.getElementById("totalPacientes");
    const totalFinanceiroEl = document.getElementById("totalFinanceiro");
    const ultimosPacientesTbody = document.getElementById("ultimosPacientes");

    const pacientes = get("pacientes");
    const fin = get("financeiro");
    const receita = fin.reduce((acc, f) => acc + (f.tipo === "Entrada" ? Number(f.valor) : 0), 0);

    if (totalPacientesEl) totalPacientesEl.textContent = pacientes.length;
    if (totalFinanceiroEl) totalFinanceiroEl.textContent = `R$ ${receita.toFixed(2)}`;
    if (ultimosPacientesTbody) {
      const ult = pacientes.slice(-5).reverse();
      ultimosPacientesTbody.innerHTML = ult.map(p =>
        `<tr><td>${p.nome}</td><td>${p.procedimento || "-"}</td><td>${p.telefone || "-"}</td></tr>`
      ).join("");
    }
  }

  window.updateDashboard = updateDashboard;
  updateDashboard();
})();
