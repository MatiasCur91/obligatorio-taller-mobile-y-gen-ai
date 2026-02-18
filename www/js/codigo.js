const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const REGISTRO = document.querySelector("#pantalla-registro");
const AGREGAR_PELICULA = document.querySelector("#pantalla-agregar-pelicula");
const LOGIN = document.querySelector("#pantalla-login");
const PELICULAS = document.querySelector("#pantalla-peliculas");
const MAPA = document.querySelector("#pantalla-mapa");
const URL_BASE = "https://movielist.develotion.com/"
const NAV = document.querySelector("ion-nav");
const FOOTER = document.querySelector("ion-footer");
const ESTADISTICAS = document.querySelector("#pantalla-estadisticas");

Inicio();

function Inicio() {

    Eventos();
    ArmarHome();
    ArmarMenu();
    ArmarFooter();

}

function CargarMapa() {

    setTimeout(function () { CrearMapa() }, 1000)
}

var map = null;
function CrearMapa() {

    if (map != null) {
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
        html += `
        <ion-item onclick="CerrarMenu()" href="/peliculas">Mis Peliculas</ion-item>
        <ion-item onclick="CerrarMenu()" href="/agregar-pelicula">Agregar Pelicula</ion-item>
        <ion-item onclick="CerrarMenu()" href="/mapa">Mapa</ion-item>
       <ion-item onclick="CerrarSesion()" >Logout</ion-item> `


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
        html += ` <ion-button id="" href="/peliculas" expand="full">Peliculas</ion-button>
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

function ArmarFooter() {

    let hayToken = localStorage.getItem('token');
    if (hayToken) {
        FOOTER.style.display = "block";
    } else {
        FOOTER.style.display = "none";
    }
}



function CerrarSesion() {

    localStorage.clear();
    ArmarHome();
    ArmarMenu();
    ArmarFooter();
    NAV.push("pantalla-home");

}


function Eventos() {
    ROUTER.addEventListener('ionRouteDidChange', Navegar)
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin)
    document.querySelector("#btnRegistro").addEventListener('click', TomarDatosRegistro)
    document.querySelector("#fecha").addEventListener("ionChange", () => { ListarPeliculas(); });

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
        ArmarFooter();
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

    } else if (response.status == 409) {

        Alertar("Usuario existente",
            "Registro",
            "El nombre de usuario ya está en uso. Intente con otro.")
    }
    else {

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

    } else if (ruta == "/peliculas") {
        PELICULAS.style.display = "block";
        setTimeout(ListarPeliculas, 100);
    } else if (ruta == "/mapa") {
        MAPA.style.display = "block";
        CargarMapa();


    } else if (ruta == "/agregar-pelicula") {
        AGREGAR_PELICULA.style.display = "block";
        ArmarSelectCategorias();
    } else if (ruta == "/estadisticas") {
        ESTADISTICAS.style.display = "block";
        CargarEstadisticas();
    }



}
function CerrarMenu() {
    MENU.close();
}
function OcultarPantallas() {
    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO.style.display = "none";
    PELICULAS.style.display = "none";
    MAPA.style.display = "none";
    AGREGAR_PELICULA.style.display = "none";
    ESTADISTICAS.style.display = "none";

}
async function ListarPeliculas() {

    let listaP = await ObtenerPeliculas();
    let categorias = await ObtenerCategorias();
    let periodo = document.querySelector("#fecha").value;

    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!periodo) {
        periodo = "todas";
    }
    console.log("Periodo seleccionado:", periodo);

    if (periodo === "ultima-semana") {

        let peliculasUltimaSemana = [];

        for (let p of listaP) {
            let fechaPelicula = new Date(p.fechaEstreno);

            let hace7Dias = new Date(hoy);
            hace7Dias.setDate(hoy.getDate() - 7);

            if (fechaPelicula >= hace7Dias && fechaPelicula <= hoy) {
                peliculasUltimaSemana.push(p);
            }
        }

        listaP = peliculasUltimaSemana;

    } else if (periodo === "ultimo-mes") {

        let peliculasUltimoMes = [];

        for (let p of listaP) {
            let fechaPelicula = new Date(p.fechaEstreno);

            let hace30Dias = new Date(hoy);
            hace30Dias.setDate(hoy.getDate() - 30);

            if (fechaPelicula >= hace30Dias && fechaPelicula <= hoy) {
                peliculasUltimoMes.push(p);
            }
        }

        listaP = peliculasUltimoMes;
    }

    let html = ``;

    console.log("Películas recibidas:");
    for (let p of listaP) {
        console.log(p.nombre, p.fechaEstreno);

        let categoria = categorias.find(c => c.id == p.idCategoria);

        html += `<ion-card color="dark">
            <ion-card-header>
                <ion-card-title>${p.nombre}</ion-card-title>
            </ion-card-header>

            <ion-card-content>
                Fecha de estreno: ${p.fechaEstreno}<br>
                Categoría: ${categoria ? categoria.nombre : "Sin categoría"} ${categoria ? categoria.emoji : ""}<br>
                Edad requerida: ${categoria ? categoria.edad_requerida : "-"} años
                <ion-button color="primary" slot="end" shape="round" onclick="EliminarPelicula('${p.id}')">Eliminar</ion-button>
            </ion-card-content>
        </ion-card>`;
    }

    document.querySelector("#lista-peliculas").innerHTML = html;
}





async function ObtenerPeliculas() {

    let token = localStorage.getItem("token");

    let response = await fetch(`${URL_BASE}peliculas`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token

        },

    });


    if (response.status == 200) {
        let data = await response.json();

        return data.peliculas;
    } else {
        return null;
    }

}

async function ObtenerCategorias() {

    let token = localStorage.getItem("token");

    let response = await fetch(`${URL_BASE}categorias`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token

        },

    });


    if (response.status == 200) {
        let data = await response.json();

        return data.categorias;
    } else {
        return null;
    }

}

async function ArmarSelectCategorias() {

    let listaC = await ObtenerCategorias();

    if (!Array.isArray(listaC)) {
        console.error("La API no devolvió un array");
        return;
    }

    const select = document.querySelector("#slcCategoria");
    select.innerHTML = "";

    for (let c of listaC) {
        const option = document.createElement("ion-select-option");
        option.value = c.id;
        option.innerText = c.nombre;
        select.appendChild(option);
        console.log(c.id);
    }
}

async function TomarDatosPalicula() {
    let nombre = document.querySelector("#txtNombrePelicula").value;
    let fecha = document.querySelector("#txtFechaPelicula").value;
    let categoria = Number(document.querySelector("#slcCategoria").value);

    if (DatosPeliculaValidos(nombre, fecha, categoria)) {

        AgregarPelicula(nombre, fecha, categoria);

    } else {
        Alertar("Datos inválidos", "Agregar película", "Revise que los datos ingresados sean correctos. El nombre no puede estar vacío, la fecha debe ser válida y la categoría debe ser seleccionada.")
    }

}

function DatosPeliculaValidos(nombre, fecha, categoria) {
    let hoy = new Date();
    let fechaIngresada = new Date(fecha);
    hoy.setHours(0, 0, 0, 0);

    if (!nombre || fechaIngresada > hoy || isNaN(categoria) || categoria < 1) {
        return false;
    }

    return true;
}

async function AgregarPelicula(nombre, fecha, categoria) {

    // MostrarLoader("Agregando película")

    let token = localStorage.getItem("token");

    let response = await fetch(`${URL_BASE}peliculas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token

        },
        body: JSON.stringify({
            idCategoria: categoria,
            nombre: nombre,
            fecha: fecha,
        })
    });

    if (response.status == 200) {
        let data = await response.json();
        MostrarToast("Alta correcta", 3000)
        Navegar({ detail: { to: "/peliculas" } });


        return data.peliculas;
    } else {
        return null;
    }

    // ApagarLoader();
}


async function EliminarPelicula(idp) {

    let token = localStorage.getItem("token");

    let response = await fetch(`${URL_BASE}peliculas/${idp}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token

        },

    });


    if (response.status == 200) {
        let data = await response.json();
        MostrarToast("Pelicula eliminada correctamente", 3000);
        Navegar({ detail: { to: "/peliculas" } }); // Forzar recarga de la lista de películas
        return data.peliculas;
    } else {
        return null;
    }

}

//ESTADISTICAS

async function CargarEstadisticas() {

    MostrarLoader("Cargando estadísticas...")

    let peliculas = await ObtenerPeliculas();
    let categorias = await ObtenerCategorias();

    if (!peliculas || !categorias) {
        console.error("Error cargando datos");
        return;
    }

    EstadisticasPorCategoria(peliculas, categorias);
    EstadisticasPorEdad(peliculas, categorias);
    ApagarLoader();
}

function EstadisticasPorCategoria(peliculas, categorias) {

    let conteo = {};

    for (let p of peliculas) {
        let idCat = p.idCategoria;

        if (conteo[idCat]) {
            conteo[idCat]++;
        } else {
            conteo[idCat] = 1;
        }
    }

    let html = `<ion-list>
  <ion-list-header>
    <ion-label>Películas por categoría</ion-label>
  </ion-list-header>`;

    for (let c of categorias) {
        let cantidad = conteo[c.id] || 0;

        html += `
            <ion-item>
                <ion-label>
                    ${c.nombre}
                </ion-label>
                <ion-badge slot="end">${cantidad}</ion-badge>
            </ion-item>
        `;
    }

    html += `</ion-list>`;

    document.querySelector("#stats-categorias").innerHTML = html;
}
function EstadisticasPorEdad(peliculas, categorias) {

    let mayores12 = 0;
    let resto = 0;

    for (let p of peliculas) {
        let categoria = null;

        for (let c of categorias) {
            if (c.id == p.idCategoria) {
                categoria = c;
                break;
            }
        }

        if (!categoria) continue;

        if (categoria.edad_requerida > 12) {
            mayores12++;
        } else {
            resto++;
        }
    }

    let total = mayores12 + resto;

    let porcentajeMayores = 0;
    let porcentajeResto = 0;

    if (total > 0) {
        porcentajeMayores = Math.round((mayores12 * 100) / total);
        porcentajeResto = Math.round((resto * 100) / total);
    }

    let html = `
        <ion-card color="dark">
            <ion-card-header>
                <ion-card-title>Estadísticas por Edad</ion-card-title>
                <ion-card-subtitle>Mayores de 12 años vs Resto</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
                <p>Mayores de 12 años: <strong>${porcentajeMayores}%</strong></p>
                <p>Resto: <strong>${porcentajeResto}%</strong></p>
            </ion-card-content>
        </ion-card>
    `;



    document.querySelector("#stats-edad").innerHTML = html;
}


//LOADER

const loading = document.createElement('ion-loading');

function MostrarLoader(texto) {
    loading.message = texto;
    document.body.appendChild(loading);
    loading.present();
}

function ApagarLoader() {

    loading.dismiss();

}


function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');

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

