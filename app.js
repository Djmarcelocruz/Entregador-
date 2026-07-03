const supabaseUrl = "https://jrcyhnonjzyhtztrxfhx.supabase.co";
const supabaseKey = "SUA_PUBLISHABLE_KEY";

const client = supabase.createClient(supabaseUrl, supabaseKey);

let usuario = null;

window.onload = () => {

    const salvo = localStorage.getItem("usuario");

    if(salvo){
        usuario = JSON.parse(salvo);
        abrirPainel();
    }else{
        telaLogin();
    }

};

function telaLogin(){

document.getElementById("app").innerHTML = `

<div class="container">

<div class="card">

<h2>Checklist Industrial</h2>

<input id="matricula" placeholder="Matrícula">

<input id="pin" type="password" placeholder="PIN">

<button onclick="login()">

Entrar

</button>

<p id="msg"></p>

</div>

</div>

`;

}

async function login(){

const matricula = document.getElementById("matricula").value;

const {data,error} = await client

.from("profiles")

.select("*")

.eq("registration_number",matricula)

.single();

if(error){

document.getElementById("msg").innerHTML="Usuário não encontrado";

return;

}

usuario=data;

localStorage.setItem("usuario",JSON.stringify(usuario));

abrirPainel();

}
function abrirPainel(){

if(usuario.role=="supervisor"){

document.getElementById("app").innerHTML=`

<div class="container">

<div class="card">

<h2>Bem-vindo</h2>

<h3>${usuario.full_name}</h3>

<div class="menu">

<button onclick="telaCadastroMaquina()">
🚜 Cadastrar Máquina
</button>

<button onclick="listarMaquinas()">
📋 Máquinas
</button>

<button onclick="alert('Em breve')">
👥 Usuários
</button>

<button onclick="alert('Em breve')">
✅ Checklists
</button>

<button onclick="alert('Em breve')">
🔧 Manutenções
</button>

<button onclick="alert('Em breve')">
📊 Relatórios
</button>

<button onclick="logout()">
🚪 Sair
</button>

</div>

</div>

</div>

`;

}

}

function logout(){

localStorage.removeItem("usuario");

location.reload();

}

function telaCadastroMaquina(){

document.getElementById("app").innerHTML=`

<div class="container">

<div class="card">

<h2>Cadastro de Máquina</h2>

<input id="nome" placeholder="Nome da máquina">

<input id="codigo" placeholder="Código">

<select id="tipo">

<option value="Empilhadeira">Empilhadeira</option>

<option value="Carrinho Elétrico">Carrinho Elétrico</option>

</select>

<input id="fabricante" placeholder="Fabricante">

<input id="modelo" placeholder="Modelo">

<input id="horimetro" type="number" placeholder="Horímetro Inicial">

<input id="preventiva" type="number" value="250" placeholder="Intervalo Preventivo">

<button onclick="salvarMaquina()">

Salvar Máquina

</button>

<button onclick="abrirPainel()">

Voltar

</button>

</div>

</div>

`;

}
async function salvarMaquina(){

const maquina={

name:document.getElementById("nome").value,

code:document.getElementById("codigo").value,

type:document.getElementById("tipo").value,

status:"Liberada",

maintenance_status:"OK",

horimeter:Number(document.getElementById("horimetro").value),

next_preventive_horimeter:
Number(document.getElementById("horimetro").value)+
Number(document.getElementById("preventiva").value)

};

const {error}=await client

.from("machines")

.insert([maquina]);

if(error){

alert(error.message);

return;

}

alert("Máquina cadastrada com sucesso!");

listarMaquinas();

}

async function listarMaquinas(){

const {data,error}=await client

.from("machines")

.select("*")

.order("code");

if(error){

alert(error.message);

return;

}

let html=`

<div class="container">

<div class="card">

<h2>Máquinas</h2>

<button onclick="telaCadastroMaquina()">

➕ Nova Máquina

</button>

<br><br>

`;

if(data.length==0){

html+="Nenhuma máquina cadastrada.";

}

data.forEach(m=>{

html+=`

<div style="border:1px solid #ddd;padding:10px;margin-top:10px;border-radius:8px;">

<b>${m.code}</b><br>

${m.name}<br>

Tipo: ${m.type}<br>

Horímetro: ${m.horimeter}<br>

Status: ${m.status}<br>

Manutenção: ${m.maintenance_status}

</div>

`;

});

html+=`

<br>

<button onclick="abrirPainel()">

⬅ Voltar

</button>

</div>

</div>

`;

document.getElementById("app").innerHTML=html;

}
