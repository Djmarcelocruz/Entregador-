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
