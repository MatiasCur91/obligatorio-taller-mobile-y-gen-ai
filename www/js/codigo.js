const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const REGISTRO = document.querySelector("#pantalla-registro");
const LOGIN = document.querySelector("#pantalla-login");
const PRODUCTOS = document.querySelector("#pantalla-productos");
const MAPA = document.querySelector("#pantalla-mapa");
const URL_BASE = "https://movielist.develotion.com/"
//const URL_BASE_imagenes = "https://ort-tallermoviles.herokuapp.com/assets/imgs/"
const NAV = document.querySelector("ion-nav");

Inicio();

function Inicio() {

    Eventos();
    ArmarHome();
    ArmarMenu();
   

}

function CargarMapa(){

    setTimeout(function(){CrearMapa()},1000)
}

var map = null;
function CrearMapa() {

    if(map != null){
        map.remove();
    }




    map = L.map('map').setView([-34.89742018057002, -56.16433646022703], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZomm: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);


    var marker = L.marker([-34.89742018057002, -56.16433646022703]).addTo(map).bindPopup("<b>Obelisco</b><br>Montevideo");

    var circle = L.circle([-34.89742018057002, -56.16433646022703], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.2,
        radius: 500
    }).addTo(map);



    var polygon = L.polygon([
    [-34.887232060982285, -56.15921630560929],
    [-34.887576590810674, -56.171412955505495],
    [-34.904852295863385, -56.169276573751084],
    [-34.89723693213823, -56.14666147277048]
]).addTo(map);

}

function ArmarMenu() {

    let hayToken = localStorage.getItem('token');

    let html = `<ion-item onclick="CerrarMenu()" href="/">Home</ion-item>`

    if (hayToken) {
        html += `<ion-item onclick="CerrarSesion()" >Logout</ion-item>
        <ion-item onclick="CerrarMenu()" href="/productos">Productos</ion-item>
        <ion-item onclick="CerrarMenu()" href="/mapa">Mapa</ion-item>`


    } else {
        html += `  <ion-item onclick="CerrarMenu()" href="/registro">Registro</ion-item>
                    <ion-item onclick="CerrarMenu()" href="/login">Login</ion-item>`
    }

    document.querySelector("#menu-opciones").innerHTML = html;
}

function ArmarHome() {

    let hayToken = localStorage.getItem('token');

    let html = ``;

    if (hayToken) {
        html += ` <ion-button id="" href="/productos" expand="full">Productos</ion-button>
        <ion-button id="" href="/mapa" expand="full">Mapa</ion-button>
        <ion-button id="" onclick="CerrarSesion()" expand="full">Cerrar Sesión</ion-button>`
        console.log("hay token");

    } else {
        html = `   <ion-button id="" href="/login" expand="full">Login</ion-button>
                <ion-button id="" href="/registro" expand="full">Registrarse</ion-button>`
        console.log("no hay token");
    }

    document.querySelector("#botones-home").innerHTML = html;
}



function CerrarSesion() {

    localStorage.clear();
    ArmarHome();
    ArmarMenu();
    NAV.push("pantalla-home");

}


function Eventos() {
    ROUTER.addEventListener('ionRouteDidChange', Navegar)
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin)
    document.querySelector("#btnRegistro").addEventListener('click', TomarDatosRegistro)
}

async function TomarDatosLogin() {
    let us = document.querySelector("#txtLoginUsuario").value;
    let ps = document.querySelector("#txtLoginPassword").value;

    let login = new Object();
    login.usuario = us;
    login.password = ps;

    MostrarLoader("Iniciando sesión")
    let response = await fetch(`${URL_BASE}login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(login),
    });

    if (response.status == 200) {

        let data = await response.json();

        localStorage.setItem('token', data.token);
        ArmarMenu();
        ArmarHome();
        NAV.push("page-home")
    }
    ApagarLoader();
}

async function ArmarSelectPaises() {

    let listaP = await ObtenerPaises();

    if (!Array.isArray(listaP)) {
        console.error("La API no devolvió un array");
        return;
    }

    const select = document.querySelector("#slcRegistroPais");
    select.innerHTML = "";

    for (let p of listaP) {
        const option = document.createElement("ion-select-option");
        option.value = p.id;
        option.innerText = p.nombre;
        select.appendChild(option);
    }
}

async function ObtenerPaises() {


    let response = await fetch(`${URL_BASE}paises`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'

        },

    });


    if (response.status == 200) {
        let data = await response.json();

        return data.paises;
    } else {
        return null;
    }

}



async function TomarDatosRegistro() {
    let u = document.querySelector("#txtRegistroUsuario").value;
    let ps = document.querySelector("#txtRegistroPassword").value;
    let p = Number(document.querySelector("#slcRegistroPais").value);


    if (DatosValidos(u, ps, p)) {

        RegistrarUsuario(u, ps, p)

    } else {
        Alertar("Datos inválidos", "Registro de usuario", "Revise que los datos ingresados sean correctos. Usuario y password no pueden contener espacios, el password debe tener al menos 6 caracteres y el usuario al menos 3 caracteres.")
    }



}

async function RegistrarUsuario(u, ps, p) {

    MostrarLoader("Registrando usuario")

    let r = new Object();
    r.usuario = u;
    r.password = ps;
    r.pais = p;

    let response = await fetch(`${URL_BASE}usuarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(r),
    });


    if (response.status == 200) {

        MostrarToast("Alta correcta", 3000)

    } else {

        let data = await response.json();

        Alertar("ERROR", "Alta de usuario", data.error)
    }

    ApagarLoader();

}



function DatosValidos(u, ps, p) {
    if (!p || isNaN(p) || ps.length < 6 || u.length < 3 || u.includes(" ") || ps.includes(" ") || u == null || ps == null) {
    return false;
}

    return true;
}



function Navegar(evt) {
    console.log(evt)
    OcultarPantallas();
    let ruta = evt.detail.to;

    if (ruta == "/") {
        HOME.style.display = "block";
    } else if (ruta == "/login") {
        LOGIN.style.display = "block";

    } else if (ruta == "/registro") {
        REGISTRO.style.display = "block";
        ArmarSelectPaises();

    } else if (ruta == "/productos") {
        PRODUCTOS.style.display = "block";
        ListarProductos();

    } else if (ruta == "/mapa") {
        MAPA.style.display = "block";
        CargarMapa();
       

    }



}
function CerrarMenu() {
    MENU.close();
}
function OcultarPantallas() {
    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO.style.display = "none";
    PRODUCTOS.style.display = "none";
    MAPA.style.display = "none";
}
async function ListarProductos() {

    let listaP = await ObtenerProductos();
    console.log(listaP);

    let html = ``;
    for (let p of listaP) {

        html += `<ion-card>
                   
                    <ion-card-header>
                        <ion-card-title>$${p.nombre}</ion-card-title>
                        <ion-card-subtitle>${p.categoria}</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                       ${p.nombre}
                       <ion-button slot="end" shape="round" onclick="EliminarProducto('${p._id}')">Eliminar</ion-button>
                    </ion-card-content>
                    
                    </ion-card>`;

    }

    document.querySelector("#lista-productos").innerHTML = html;

}



async function ListarProductos2() {

    let listaP = await ObtenerProductos();
    console.log(listaP);

    let html = `<ion-list>`;
    for (let p of listaP) {

        html += `<ion-item-sliding>
                 

                    <ion-item>
                    <ion-label>Sliding Item with Options on Both Sides</ion-label>
                    </ion-item>

                    <ion-item-options side="end">
                  
                    <ion-item-option color="danger" onclick="verDetalles('${p._id}')">Delete</ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>`;

    }
    html += `</ion-list>`
    document.querySelector("#lista-productos").innerHTML = html;

}

async function verDetalles(idp) {

    let p = await ObtenerProducto(idp);
    console.log(p);

}



async function ObtenerProductos() {

    let token = localStorage.getItem("token");

    let response = await fetch(`${URL_BASE}productos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': "Bearer " + token

        },

    });


    if (response.status == 200) {
        let data = await response.json();

        return data.data;
    } else {
        return null;
    }

}


async function ObtenerProducto(idp) {

    let token = localStorage.getItem("token");

    let response = await fetch(`${URL_BASE}productos/${idp}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': token

        },

    });


    if (response.status == 200) {
        let data = await response.json();

        return data.data;
    } else {
        return null;
    }

}




const loading = document.createElement('ion-loading');

function MostrarLoader(texto) {
    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    //loading.duration = 2000;
    document.body.appendChild(loading);
    loading.present();
}

function ApagarLoader() {

    loading.dismiss();

}


function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = titulo;
    alert.subHeader = subtitulo;
    alert.message = mensaje;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
}


function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = duracion;

    document.body.appendChild(toast);
    toast.present();
}
