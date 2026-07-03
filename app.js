const supabaseUrl = "https://jrcyhnonjzyhtztrxfhx.supabase.co";
const supabaseKey = "sb_publishable_26sS-4aR4t-NMFVZ3asmvQ_Dgz6xH0x";

const client = supabase.createClient(supabaseUrl, supabaseKey);

let usuario = null;

// ================= LOGIN =================
window.onload = () => {
    telaLogin();
};

function telaLogin() {
document.getElementById("app").innerHTML = `
<div class="container">
<div class="card">
<h2>Login</h2>

<input id="matricula" placeholder="Matrícula">
<input id="pin" type="password" placeholder="PIN">

<button onclick="login()">Entrar</button>

<p id="msg"></p>
</div>
</div>
`;
}

async function login() {
const matricula = document.getElementById("matricula").value;
const pin = document.getElementById("pin").value;

const { data, error } = await client
.from("profiles")
.select("*")
.eq("registration_number", matricula)
.eq("pin", pin)
.single();

if (error || !data) {
document.getElementById("msg").innerText = "Login inválido";
return;
}

usuario = data;
abrirPainel();
}

// ================= PAINEL =================
function abrirPainel() {
document.getElementById("app").innerHTML = `
<div class="container">
<div class="card">

<h2>Bem-vindo</h2>
<h3>${usuario.full_name || ""}</h3>

<button onclick="telaCadastro()">Cadastrar Máquina</button>
<button onclick="listarMaquinas()">Listar Máquinas</button>
<button onclick="logout()">Sair</button>

</div>
</div>
`;
}

// ================= LOGOUT =================
function logout() {
usuario = null;
telaLogin();
}

// ================= CADASTRO =================
function telaCadastro() {
document.getElementById("app").innerHTML = `
<div class="container">
<div class="card">

<h2>Cadastro Máquina</h2>

<input id="nome" placeholder="Nome">
<input id="codigo" placeholder="Código">

<select id="tipo">
<option>Empilhadeira</option>
<option>Carrinho</option>
</select>

<input id="horimetro" type="number" placeholder="Horímetro">

<input id="preventiva" type="number" value="250">

<button onclick="salvar()">Salvar</button>
<button onclick="abrirPainel()">Voltar</button>

</div>
</div>
`;
}

async function salvar() {

const maquina = {
name: document.getElementById("nome").value,
code: document.getElementById("codigo").value,
type: document.getElementById("tipo").value,
horimeter: Number(document.getElementById("horimetro").value),
status: "OK"
};

const { error } = await client
.from("machines")
.insert([maquina]);

if (error) {
alert(error.message);
return;
}

alert("Máquina cadastrada!");
abrirPainel();
}

// ================= LISTA =================
async function listarMaquinas() {

const { data } = await client
.from("machines")
.select("*");

let html = `
<div class="container">
<div class="card">

<h2>Máquinas</h2>
<button onclick="abrirPainel()">Voltar</button>
`;

data.forEach(m => {
html += `
<div style="border:1px solid #ccc;margin:10px;padding:10px">
<b>${m.code}</b><br>
${m.name}<br>
Tipo: ${m.type}
</div>
`;
});

html += `</div></div>`;

document.getElementById("app").innerHTML = html;
}
