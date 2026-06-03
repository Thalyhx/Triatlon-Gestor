/* =============================================
   TRIATLÓN GESTOR — Cliente API
   Tres microservicios: Atletas (9000), Carreras (9001), Categorias (9002)
   ============================================= */

const ATLETAS_BASE   = 'http://localhost:9000/api/atletas';
const CARRERAS_BASE  = 'http://localhost:9001/api/carreras';
const CATEGORIAS_BASE = 'http://localhost:9002/api/categorias';

/* ──────────────────────────────────────────────
   Util: petición genérica con manejo de errores
   ────────────────────────────────────────────── */
async function request(url, options = {}) {
    const resp = await fetch(url, options);
    if (!resp.ok) {
        let msg = `Error ${resp.status}`;
        try { const body = await resp.json(); msg = body.message || msg; } catch (_) {}
        throw new Error(msg);
    }
    const ct = resp.headers.get('Content-Type') || '';
    if (resp.status === 204 || resp.headers.get('Content-Length') === '0') return null;
    return ct.includes('application/json') ? resp.json() : resp.text();
}

/* ──────────────────────────────────────────────
   Util: enviar plain-text al body (para PATCH TXT)
   ────────────────────────────────────────────── */
function txtOpts(value) {
    return { method: 'PATCH', headers: { 'Content-Type': 'text/plain' }, body: value };
}

/* ==============================================
   API ATLETAS  –  puerto 9000
   ============================================== */
const AtletasAPI = {

    /** Lista todos (opcionalmente filtrado) */
    listarTodos(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return request(`${ATLETAS_BASE}${qs ? '?' + qs : ''}`);
    },

    /** Obtener por identificacion */
    obtenerPorId(id) {
        return request(`${ATLETAS_BASE}/${id}`);
    },

    /** Registrar nuevo atleta */
    registrar(dto) {
        return request(`${ATLETAS_BASE}/atleta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });
    },

    /** Actualización completa PUT */
    actualizarCompleto(id, dto) {
        return request(`${ATLETAS_BASE}/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });
    },

    /** PATCH nombre */
    actualizarNombre(id, valor) {
        return request(`${ATLETAS_BASE}/${id}/nombre`, txtOpts(valor));
    },

    /** PATCH identificacion */
    actualizarIdentificacion(id, valor) {
        return request(`${ATLETAS_BASE}/${id}/identificacion`, txtOpts(valor));
    },

    /** PATCH categoria */
    actualizarCategoria(id, valor) {
        return request(`${ATLETAS_BASE}/${id}/categoria`, txtOpts(valor));
    },

    /** Eliminar atleta */
    eliminar(id) {
        return request(`${ATLETAS_BASE}/delete/${id}`, { method: 'DELETE' });
    },

    /** Inscribir atleta en carrera */
    inscribirEnCarrera(idAtleta, idCarrera) {
        return request(`${ATLETAS_BASE}/${idAtleta}/carrera/${idCarrera}`, { method: 'POST' });
    },

    /** Consultar carrera del atleta */
    consultarCarrera(idAtleta) {
        return request(`${ATLETAS_BASE}/${idAtleta}/carrera`);
    },

    /** Eliminar relación con carrera */
    eliminarCarrera(idAtleta) {
        return request(`${ATLETAS_BASE}/${idAtleta}/eliminarCarrera`, { method: 'PATCH' });
    },

    /* Filtros individuales (usados en Promise.all del dashboard) */
    filtrarPorGenero(genero)         { return this.listarTodos({ genero }); },
    filtrarPorCategoria(categoria)   { return this.listarTodos({ categoria }); },
    filtrarPorEspecialidad(esp)      { return this.listarTodos({ especialidad: esp }); },
    filtrarPorCross(val)             { return this.listarTodos({ modalidadCross: val }); },
};

/* ==============================================
   API CARRERAS  –  puerto 9001
   ============================================== */
const CarrerasAPI = {

    listarTodas() {
        return request(CARRERAS_BASE);
    },

    obtenerPorId(id) {
        return request(`${CARRERAS_BASE}/${id}`);
    },

    registrar(dto) {
        return request(`${CARRERAS_BASE}/carrera`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });
    },

    eliminar(id) {
        return request(`${CARRERAS_BASE}/delete/${id}`, { method: 'DELETE' });
    },

    actualizarUbicacion(id, valor) {
        return request(`${CARRERAS_BASE}/${id}/ubicacion`, txtOpts(valor));
    },

    /** fecha: string YYYY-MM-DD */
    actualizarFecha(id, fecha) {
        return request(`${CARRERAS_BASE}/${id}/fecha`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fecha)
        });
    },

    consultarAtletas(id) {
        return request(`${CARRERAS_BASE}/${id}/atletas`);
    },

    consultarCategoria(id) {
        return request(`${CARRERAS_BASE}/${id}/categoria`);
    },

    registrarAtleta(idCarrera, idAtleta) {
        return request(`${CARRERAS_BASE}/${idCarrera}/registrarAtleta/${idAtleta}`, { method: 'POST' });
    },

    eliminarAtleta(idCarrera, idAtleta) {
        return request(`${CARRERAS_BASE}/${idCarrera}/eliminarAtleta/${idAtleta}`, { method: 'DELETE' });
    },

    eliminarCategoria(id) {
        return request(`${CARRERAS_BASE}/${id}/eliminarCategoria`, { method: 'PATCH' });
    },

    listarPorCategoria(idCategoria) {
        return request(`${CARRERAS_BASE}/categoria/${idCategoria}`);
    },
};

/* ==============================================
   API CATEGORIAS  –  puerto 9002
   ============================================== */
const CategoriasAPI = {

    listarTodas() {
        return request(CATEGORIAS_BASE);
    },

    obtenerPorId(id) {
        return request(`${CATEGORIAS_BASE}/${id}`);
    },

    registrar(dto) {
        return request(`${CATEGORIAS_BASE}/categoria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });
    },

    eliminar(id) {
        return request(`${CATEGORIAS_BASE}/delete/${id}`, { method: 'DELETE' });
    },

    actualizarDescripcion(id, valor) {
        return request(`${CATEGORIAS_BASE}/${id}/descripcion`, txtOpts(valor));
    },

    actualizarRecomendacion(id, valor) {
        return request(`${CATEGORIAS_BASE}/${id}/recomendacion`, txtOpts(valor));
    },

    consultarCarreras(id) {
        return request(`${CATEGORIAS_BASE}/${id}/carreras`);
    },

    eliminarCarrera(idCategoria, idCarrera) {
        return request(`${CATEGORIAS_BASE}/${idCategoria}/eliminarCarrera/${idCarrera}`, { method: 'DELETE' });
    },
};
