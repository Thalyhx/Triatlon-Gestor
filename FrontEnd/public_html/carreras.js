// ---- LISTA DE CARRERAS ----

function renderListaCarreras() {
    // Carga carreras y categorias juntas para mostrar el nombre de la categoria en la tabla
    Promise.all([
        getCarreras(),
        getCategorias().catch(function() { return []; })
    ]).then(function(datos) {
        var carreras   = datos[0];
        var categorias = datos[1];

        // Mapa id -> nombre de categoria
        var mapaCats = {};
        for (var i = 0; i < categorias.length; i++) {
            mapaCats[categorias[i].id] = categorias[i].nombre || '—';
        }

        var tbody = document.getElementById('carr-tbody');
        var empty = document.getElementById('carr-empty');
        if (!tbody) return;

        if (carreras.length === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        var filas = '';
        for (var j = 0; j < carreras.length; j++) {
            var c = carreras[j];
            var catBadge = c.idCategoria
                ? '<span class="badge badge-swim">' + (mapaCats[c.idCategoria] || '#' + c.idCategoria) + '</span>'
                : '<span style="color:var(--text-muted)">—</span>';

            filas += '<tr>' +
                '<td><strong>' + c.nombre + '</strong></td>' +
                '<td>' + (c.ubicacion || '—') + '</td>' +
                '<td><span style="font-family:monospace;font-size:12px">' + (c.fecha || '—') + '</span></td>' +
                '<td>' + estrellasDificultad(c.nivelDificultad) + '</td>' +
                '<td>' + catBadge + '</td>' +
                '<td><div style="display:flex;gap:6px">' +
                    '<button class="btn btn-ghost btn-sm" title="Ver" onclick="verCarrera(' + c.id + ')">' +
                        '<span class="material-icons-round" style="font-size:14px">visibility</span></button>' +
                    '<button class="btn btn-ghost btn-sm" title="Modificar" onclick="irModificarCarrera(' + c.id + ')">' +
                        '<span class="material-icons-round" style="font-size:14px">edit</span></button>' +
                    '<button class="btn btn-danger btn-sm" title="Eliminar" onclick="iniciarEliminacionCarrera(' + c.id + ',\'' + c.nombre + '\')">' +
                        '<span class="material-icons-round" style="font-size:14px">delete</span></button>' +
                '</div></td>' +
            '</tr>';
        }
        tbody.innerHTML = filas;
    }).catch(function() {
        showToast('error', 'Error al cargar carreras');
    });
}

function estrellasDificultad(nivel) {
    var mapa = { '1': '★☆☆☆☆', '2': '★★☆☆☆', '3': '★★★☆☆', '4': '★★★★☆', '5': '★★★★★' };
    if (!nivel) return '—';
    return '<span style="color:var(--gold)">' + (mapa[nivel] || nivel) + '</span>';
}

function verCarrera(id) {
    localStorage.setItem('view_carrera_id', id);
    showPage('detalle_carrera');
}

function irModificarCarrera(id) {
    localStorage.setItem('mod_carrera_id', id);
    showPage('modificar_carrera');
}

// ---- REGISTRAR CARRERA ----

function cargarSelectCategorias() {
    var sel = document.getElementById('carr-cat-sel');
    if (!sel) return;

    getCategorias().then(function(cats) {
        var opciones = '<option value="">Sin categoría</option>';
        for (var i = 0; i < cats.length; i++) {
            var c = cats[i];
            opciones += '<option value="' + c.id + '">' + c.nombre + ' (' + c.tipo + ')</option>';
        }
        sel.innerHTML = opciones;
    }).catch(function() {
        sel.innerHTML = '<option value="">Error al cargar categorías</option>';
    });
}

function registrarCarrera() {
    var nombre    = document.getElementById('carr-nombre').value.trim();
    var ubicacion = document.getElementById('carr-ubicacion').value.trim();
    var fecha     = document.getElementById('carr-fecha').value;
    var nivel     = document.getElementById('carr-nivel').value;
    var publico   = document.getElementById('carr-publico').value.trim();
    var idCat     = document.getElementById('carr-cat-sel').value;

    if (!nombre || !ubicacion || !fecha) {
        showToast('error', 'Nombre, ubicación y fecha son obligatorios');
        return;
    }

    var datos = {
        nombre: nombre,
        ubicacion: ubicacion,
        fecha: fecha,
        nivelDificultad: nivel || null,
        publico: publico || null,
        idCategoria: idCat ? parseInt(idCat) : null
    };

    postCarrera(datos).then(function() {
        document.getElementById('carr-nombre').value    = '';
        document.getElementById('carr-ubicacion').value = '';
        document.getElementById('carr-fecha').value     = '';
        document.getElementById('carr-publico').value   = '';
        document.getElementById('carr-nivel').value     = '';
        document.getElementById('carr-cat-sel').value   = '';
        showToast('success', 'Carrera "' + nombre + '" registrada');
        updateSidebar();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- DETALLE / CONSULTAR CARRERA ----

function consultarCarreraPorId() {
    var id  = document.getElementById('det-carrera-id').value.trim();
    var res = document.getElementById('det-carrera-result');
    if (!id || !res) return;

    // Carga la carrera, sus atletas y su categoría al mismo tiempo
    Promise.all([
        getCarreraById(id),
        getAtletasCarrera(id).catch(function() { return []; }),
        getCategoriaCarrera(id).catch(function() { return null; })
    ]).then(function(datos) {
        var carrera   = datos[0];
        var atletas   = datos[1];
        var categoria = datos[2];

        res.style.display = 'block';
        res.innerHTML = buildCarreraDetail(carrera, atletas, categoria);
    }).catch(function() {
        res.style.display = 'block';
        res.innerHTML = '<div class="card" style="border-color:var(--accent2);max-width:400px">' +
            '<div style="color:var(--accent2)">Carrera no encontrada con ID <strong>' + id + '</strong></div></div>';
    });
}

function buildCarreraDetail(c, atletas, categoria) {
    // Tabla de atletas inscritos
    var atletasHTML = '';
    if (atletas.length === 0) {
        atletasHTML = '<div style="color:var(--text-muted);font-size:13px;margin-top:8px">Sin atletas inscritos</div>';
    } else {
        var filas = '';
        for (var i = 0; i < atletas.length; i++) {
            var a = atletas[i];
            filas += '<tr>' +
                '<td>' + a.nombre + '</td>' +
                '<td>' + a.identificacion + '</td>' +
                '<td>' + a.genero + '</td>' +
                '<td>' + (a.especialidad || '—') + '</td>' +
                '<td>' +
                    '<button class="btn btn-danger btn-sm" onclick="eliminarAtletaDeCarrera(' + c.id + ',\'' + a.identificacion + '\')">' +
                        '<span class="material-icons-round" style="font-size:14px">person_remove</span>' +
                    '</button>' +
                '</td>' +
            '</tr>';
        }
        atletasHTML = '<div class="table-wrap" style="margin-top:12px"><table>' +
            '<thead><tr><th>Nombre</th><th>ID</th><th>Género</th><th>Especialidad</th><th>Acción</th></tr></thead>' +
            '<tbody>' + filas + '</tbody></table></div>';
    }

    // Bloque de categoría
    var catHTML = '';
    if (categoria) {
        catHTML = '<div class="card" style="margin-top:16px;border-color:var(--accent3)">' +
            '<div class="card-title"><span class="material-icons-round">category</span> Categoría</div>' +
            '<div class="info-grid">' +
                '<div class="info-item"><div class="info-item-label">Nombre</div><div class="info-item-value">' + (categoria.nombre || '—') + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Tipo</div><div class="info-item-value">' + (categoria.tipo || '—') + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Descripción</div><div class="info-item-value" style="font-size:13px">' + (categoria.descripcion || '—') + '</div></div>' +
            '</div>' +
        '</div>';
    }

    return '<div class="detail-card">' +
        '<div class="detail-avatar" style="background:rgba(0,212,255,0.15);border:2px solid var(--accent)">' +
            '<span class="material-icons-round" style="font-size:36px;color:var(--accent)">flag</span>' +
        '</div>' +
        '<div class="detail-info">' +
            '<div class="detail-name">' + c.nombre + '</div>' +
            '<div class="detail-id">' + (c.ubicacion || '—') + ' | ' + (c.fecha || '—') + '</div>' +
            '<div class="detail-badges">' +
                (c.nivelDificultad ? '<span class="badge badge-bike">★ Dificultad ' + c.nivelDificultad + '/5</span>' : '') +
                (c.publico ? '<span class="badge badge-swim">' + c.publico + '</span>' : '') +
            '</div>' +
            '<div class="info-grid">' +
                '<div class="info-item"><div class="info-item-label">ID</div><div class="info-item-value">' + c.id + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Ubicación</div><div class="info-item-value">' + (c.ubicacion || '—') + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Fecha</div><div class="info-item-value">' + (c.fecha || '—') + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Atletas inscritos</div><div class="info-item-value" style="color:var(--accent3)">' + atletas.length + '</div></div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '<div class="card" style="margin-top:16px">' +
        '<div class="card-title"><span class="material-icons-round">people</span> Atletas Inscritos</div>' +
        atletasHTML +
    '</div>' +
    catHTML;
}

function eliminarAtletaDeCarrera(idCarrera, idAtleta) {
    // Elimina en los dos microservicios al mismo tiempo
    Promise.all([
        deleteAtletaDeCarrera(idCarrera, idAtleta),
        patchQuitarCarreraAtleta(idAtleta).catch(function() {})
    ]).then(function() {
        showToast('success', 'Atleta retirado de la carrera');
        consultarCarreraPorId();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- MODIFICAR CARRERA ----

var modCarreraCurrentId = null;

function cargarCarreraParaModificar() {
    var rawId = localStorage.getItem('mod_carrera_id');
    var inputId = document.getElementById('modcarr-search-id');
    if (!rawId && inputId) rawId = inputId.value.trim();
    if (!rawId) return;

    getCarreraById(rawId).then(function(c) {
        modCarreraCurrentId = c.id;

        var preview = document.getElementById('modcarr-preview');
        if (preview) {
            preview.style.display = 'block';
            preview.innerHTML = '<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px">' +
                '<strong>' + c.nombre + '</strong>' +
                '<div style="font-size:12px;color:var(--text-muted);margin-top:4px">' + (c.ubicacion || '—') + ' | ' + (c.fecha || '—') + '</div>' +
            '</div>';
        }

        var formCard = document.getElementById('modcarr-form-card');
        if (formCard) formCard.style.display = 'block';

        var notFound = document.getElementById('modcarr-not-found');
        if (notFound) notFound.style.display = 'none';

        localStorage.removeItem('mod_carrera_id');
    }).catch(function() {
        modCarreraCurrentId = null;
        var notFound = document.getElementById('modcarr-not-found');
        if (notFound) notFound.style.display = 'block';
        var formCard = document.getElementById('modcarr-form-card');
        if (formCard) formCard.style.display = 'none';
    });
}

function showModCarreraField() {
    var campo     = document.getElementById('modcarr-campo').value;
    var wrap      = document.getElementById('modcarr-field-wrap');
    var label     = document.getElementById('modcarr-field-label');
    var inputArea = document.getElementById('modcarr-field-input');

    if (!campo) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    if (campo === 'ubicacion') {
        label.textContent = 'Nueva Ubicación';
        inputArea.innerHTML = '<input type="text" class="form-control" id="modcarr-new-val" placeholder="Ciudad, País">';
    } else if (campo === 'fecha') {
        label.textContent = 'Nueva Fecha';
        inputArea.innerHTML = '<input type="date" class="form-control" id="modcarr-new-val">';
    }
}

function aplicarModificacionCarrera() {
    var campo = document.getElementById('modcarr-campo').value;
    var val   = document.getElementById('modcarr-new-val').value.trim();
    if (!val || !modCarreraCurrentId) { showToast('error', 'Completa el campo'); return; }

    var promesa;
    if (campo === 'ubicacion') promesa = patchUbicacionCarrera(modCarreraCurrentId, val);
    else if (campo === 'fecha') promesa = patchFechaCarrera(modCarreraCurrentId, val);
    else return;

    promesa.then(function() {
        showToast('success', 'Carrera actualizada');
        cargarCarreraParaModificar();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- ELIMINAR CARRERA ----

function iniciarEliminacionCarrera(id, nombre) {
    document.getElementById('del-carr-confirm-msg').innerHTML = '¿Eliminar la carrera <strong>' + nombre + '</strong> (ID ' + id + ')?';
    document.getElementById('del-carr-confirm-btn').onclick = function() { confirmarEliminacionCarrera(id); };
    openModal('modal-delete-carrera');
}

function confirmarEliminacionCarrera(id) {
    deleteCarrera(id).then(function() {
        closeModal('modal-delete-carrera');
        showToast('success', 'Carrera eliminada');
        renderListaCarreras();
        updateSidebar();
    }).catch(function() {
        showToast('error', 'No se pudo eliminar');
    });
}
