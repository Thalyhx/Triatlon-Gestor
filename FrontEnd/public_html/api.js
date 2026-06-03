// URLs base de los tres microservicios
var URL_ATLETAS    = 'http://localhost:9000/api/atletas';
var URL_CARRERAS   = 'http://localhost:9001/api/carreras';
var URL_CATEGORIAS = 'http://localhost:9002/api/categorias';

// Hace un fetch y devuelve la respuesta como JSON (o null si no hay body)
function hacerPeticion(url, opciones) {
    return fetch(url, opciones).then(function(resp) {
        if (!resp.ok) {
            return resp.json().catch(function() {
                return { message: 'Error ' + resp.status };
            }).then(function(body) {
                throw new Error(body.message || 'Error ' + resp.status);
            });
        }
        if (resp.status === 204) return null;
        var tipo = resp.headers.get('Content-Type') || '';
        if (tipo.includes('application/json')) return resp.json();
        return resp.text();
    });
}

// Opciones comunes para enviar JSON
function opcionesJSON(metodo, datos) {
    return {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    };
}

// Opciones para enviar texto plano (usado en PATCH de un solo campo)
function opcionesTexto(valor) {
    return {
        method: 'PATCH',
        headers: { 'Content-Type': 'text/plain' },
        body: valor
    };
}

// ---- ATLETAS ----

function getAtletas() {
    return hacerPeticion(URL_ATLETAS);
}

function getAtletaById(id) {
    return hacerPeticion(URL_ATLETAS + '/' + id);
}

function postAtleta(datos) {
    return hacerPeticion(URL_ATLETAS + '/atleta', opcionesJSON('POST', datos));
}

function putAtleta(id, datos) {
    return hacerPeticion(URL_ATLETAS + '/update/' + id, opcionesJSON('PUT', datos));
}

function patchNombreAtleta(id, valor) {
    return hacerPeticion(URL_ATLETAS + '/' + id + '/nombre', opcionesTexto(valor));
}

function patchIdAtleta(id, valor) {
    return hacerPeticion(URL_ATLETAS + '/' + id + '/identificacion', opcionesTexto(valor));
}

function patchCategoriaAtleta(id, valor) {
    return hacerPeticion(URL_ATLETAS + '/' + id + '/categoria', opcionesTexto(valor));
}

function deleteAtleta(id) {
    return hacerPeticion(URL_ATLETAS + '/delete/' + id, { method: 'DELETE' });
}

function getCarreraAtleta(id) {
    return hacerPeticion(URL_ATLETAS + '/' + id + '/carrera');
}

function postInscribirAtleta(idAtleta, idCarrera) {
    return hacerPeticion(URL_ATLETAS + '/' + idAtleta + '/carrera/' + idCarrera, { method: 'POST' });
}

function patchQuitarCarreraAtleta(id) {
    return hacerPeticion(URL_ATLETAS + '/' + id + '/eliminarCarrera', { method: 'PATCH' });
}

function getAtletasFiltro(params) {
    var qs = new URLSearchParams(params).toString();
    return hacerPeticion(URL_ATLETAS + (qs ? '?' + qs : ''));
}

// ---- CARRERAS ----

function getCarreras() {
    return hacerPeticion(URL_CARRERAS);
}

function getCarreraById(id) {
    return hacerPeticion(URL_CARRERAS + '/' + id);
}

function postCarrera(datos) {
    return hacerPeticion(URL_CARRERAS + '/carrera', opcionesJSON('POST', datos));
}

function deleteCarrera(id) {
    return hacerPeticion(URL_CARRERAS + '/delete/' + id, { method: 'DELETE' });
}

function patchUbicacionCarrera(id, valor) {
    return hacerPeticion(URL_CARRERAS + '/' + id + '/ubicacion', opcionesTexto(valor));
}

function patchFechaCarrera(id, fecha) {
    return hacerPeticion(URL_CARRERAS + '/' + id + '/fecha', opcionesJSON('PATCH', fecha));
}

function getAtletasCarrera(id) {
    return hacerPeticion(URL_CARRERAS + '/' + id + '/atletas');
}

function getCategoriaCarrera(id) {
    return hacerPeticion(URL_CARRERAS + '/' + id + '/categoria');
}

function postAtletaEnCarrera(idCarrera, idAtleta) {
    return hacerPeticion(URL_CARRERAS + '/' + idCarrera + '/registrarAtleta/' + idAtleta, { method: 'POST' });
}

function deleteAtletaDeCarrera(idCarrera, idAtleta) {
    return hacerPeticion(URL_CARRERAS + '/' + idCarrera + '/eliminarAtleta/' + idAtleta, { method: 'DELETE' });
}

function patchQuitarCategoriaCarrera(id) {
    return hacerPeticion(URL_CARRERAS + '/' + id + '/eliminarCategoria', { method: 'PATCH' });
}

// ---- CATEGORIAS ----

function getCategorias() {
    return hacerPeticion(URL_CATEGORIAS);
}

function getCategoriaById(id) {
    return hacerPeticion(URL_CATEGORIAS + '/' + id);
}

function postCategoria(datos) {
    return hacerPeticion(URL_CATEGORIAS + '/categoria', opcionesJSON('POST', datos));
}

function deleteCategoria(id) {
    return hacerPeticion(URL_CATEGORIAS + '/delete/' + id, { method: 'DELETE' });
}

function patchDescripcionCategoria(id, valor) {
    return hacerPeticion(URL_CATEGORIAS + '/' + id + '/descripcion', opcionesTexto(valor));
}

function patchRecomendacionCategoria(id, valor) {
    return hacerPeticion(URL_CATEGORIAS + '/' + id + '/recomendacion', opcionesTexto(valor));
}

function getCarrerasCategoria(id) {
    return hacerPeticion(URL_CATEGORIAS + '/' + id + '/carreras');
}

function deleteCarreraDeCategoria(idCat, idCarr) {
    return hacerPeticion(URL_CATEGORIAS + '/' + idCat + '/eliminarCarrera/' + idCarr, { method: 'DELETE' });
}
