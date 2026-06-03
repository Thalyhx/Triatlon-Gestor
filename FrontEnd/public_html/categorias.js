// ---- LISTA DE CATEGORIAS ----

function renderListaCategorias() {
    getCategorias().then(function(categorias) {
        var tbody = document.getElementById('cat-tbody');
        var empty = document.getElementById('cat-empty');
        if (!tbody) return;

        if (categorias.length === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        var filas = '';
        for (var i = 0; i < categorias.length; i++) {
            var c = categorias[i];
            var nombre = c.nombre || '—';
            var desc   = (c.descripcion || '').substring(0, 80) + (c.descripcion && c.descripcion.length > 80 ? '…' : '');
            var recom  = (c.recomendacion || '—').substring(0, 60) + (c.recomendacion && c.recomendacion.length > 60 ? '…' : '');

            filas += '<tr>' +
                '<td><strong>' + nombre + '</strong></td>' +
                '<td><span class="badge badge-swim">' + (c.tipo || '—') + '</span></td>' +
                '<td style="max-width:280px;font-size:13px;color:var(--text-muted)">' + desc + '</td>' +
                '<td style="max-width:220px;font-size:13px">' + recom + '</td>' +
                '<td><div style="display:flex;gap:6px">' +
                    '<button class="btn btn-ghost btn-sm" title="Ver carreras" onclick="verCarrerasDeCategoria(' + c.id + ',\'' + nombre.replace(/'/g, "\\'") + '\')">' +
                        '<span class="material-icons-round" style="font-size:14px">directions_bike</span></button>' +
                    '<button class="btn btn-ghost btn-sm" title="Modificar" onclick="prepararModCategoria(' + c.id + ')">' +
                        '<span class="material-icons-round" style="font-size:14px">edit</span></button>' +
                    '<button class="btn btn-danger btn-sm" title="Eliminar" onclick="iniciarEliminacionCategoria(' + c.id + ',\'' + nombre.replace(/'/g, "\\'") + '\')">' +
                        '<span class="material-icons-round" style="font-size:14px">delete</span></button>' +
                '</div></td>' +
            '</tr>';
        }
        tbody.innerHTML = filas;
    }).catch(function() {
        showToast('error', 'Error al cargar categorías');
    });
}

// ---- REGISTRAR CATEGORIA ----

function registrarCategoria() {
    var nombre = document.getElementById('cat-nombre').value.trim();
    var tipo   = document.getElementById('cat-tipo').value.trim();
    var desc   = document.getElementById('cat-desc').value.trim();
    var recom  = document.getElementById('cat-recom').value.trim();

    if (!nombre || !tipo || !desc) {
        showToast('error', 'Nombre, tipo y descripción son obligatorios');
        return;
    }

    var datos = {
        name: nombre,
        tipo: tipo,
        descripcion: desc,
        recomendacion: recom || null
    };

    postCategoria(datos).then(function() {
        document.getElementById('cat-nombre').value = '';
        document.getElementById('cat-tipo').value   = '';
        document.getElementById('cat-desc').value   = '';
        document.getElementById('cat-recom').value  = '';
        showToast('success', 'Categoría "' + nombre + '" registrada');
        updateSidebar();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- VER CARRERAS DE UNA CATEGORIA ----

function verCarrerasDeCategoria(id, nombre) {
    var res = document.getElementById('cat-carreras-result');
    if (!res) return;

    getCarrerasCategoria(id).then(function(carreras) {
        res.style.display = 'block';

        if (carreras.length === 0) {
            res.innerHTML = '<div class="card"><div class="card-title">' +
                '<span class="material-icons-round">category</span> ' + nombre + '</div>' +
                '<div style="color:var(--text-muted)">Sin carreras en esta categoría</div></div>';
            return;
        }

        var filas = '';
        for (var i = 0; i < carreras.length; i++) {
            var c = carreras[i];
            filas += '<tr>' +
                '<td><strong>' + c.nombre + '</strong></td>' +
                '<td>' + (c.ubicacion || '—') + '</td>' +
                '<td>' + (c.fecha || '—') + '</td>' +
                '<td>' + estrellasDificultad(c.nivelDificultad) + '</td>' +
                '<td>' +
                    '<button class="btn btn-danger btn-sm" onclick="desvincularCarreraDeCategoria(' + id + ',' + c.id + ')">' +
                        '<span class="material-icons-round" style="font-size:14px">link_off</span>' +
                    '</button>' +
                '</td>' +
            '</tr>';
        }

        res.innerHTML = '<div class="card">' +
            '<div class="card-title"><span class="material-icons-round">flag</span> Carreras de: ' + nombre + '</div>' +
            '<div class="table-wrap"><table>' +
            '<thead><tr><th>Nombre</th><th>Ubicación</th><th>Fecha</th><th>Dificultad</th><th>Acción</th></tr></thead>' +
            '<tbody>' + filas + '</tbody></table></div>' +
        '</div>';
    }).catch(function() {
        showToast('error', 'Error al cargar carreras de la categoría');
    });
}

function desvincularCarreraDeCategoria(idCat, idCarr) {
    // Elimina en los dos microservicios al mismo tiempo
    Promise.all([
        deleteCarreraDeCategoria(idCat, idCarr),
        patchQuitarCategoriaCarrera(idCarr).catch(function() {})
    ]).then(function() {
        showToast('success', 'Carrera desvinculada de la categoría');
        var res = document.getElementById('cat-carreras-result');
        if (res) { res.innerHTML = ''; res.style.display = 'none'; }
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- MODIFICAR CATEGORIA ----

var modCatCurrentId = null;

function prepararModCategoria(id) {
    modCatCurrentId = id;

    getCategoriaById(id).then(function(c) {
        var panel = document.getElementById('cat-mod-panel');
        if (!panel) return;

        var nombre = c.nombre || '—';
        panel.style.display = 'block';
        panel.innerHTML = '<div class="card" style="border-color:var(--accent)">' +
            '<div class="card-title"><span class="material-icons-round">edit</span> Modificar: ' + nombre + '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Campo a modificar</label>' +
                '<select class="form-control" id="modcat-campo" onchange="showModCatField()">' +
                    '<option value="">Seleccionar</option>' +
                    '<option value="descripcion">Descripción</option>' +
                    '<option value="recomendacion">Recomendación</option>' +
                '</select>' +
            '</div>' +
            '<div id="modcat-field-wrap" style="display:none">' +
                '<div class="form-group">' +
                    '<label class="form-label" id="modcat-field-label">Nuevo valor</label>' +
                    '<div id="modcat-field-input"></div>' +
                '</div>' +
                '<button class="btn btn-primary" onclick="aplicarModCategoria()">' +
                    '<span class="material-icons-round">save</span> Guardar' +
                '</button>' +
            '</div>' +
        '</div>';

        panel.scrollIntoView({ behavior: 'smooth' });
    }).catch(function() {
        showToast('error', 'No se pudo cargar la categoría');
    });
}

function showModCatField() {
    var campo     = document.getElementById('modcat-campo').value;
    var wrap      = document.getElementById('modcat-field-wrap');
    var label     = document.getElementById('modcat-field-label');
    var inputArea = document.getElementById('modcat-field-input');

    if (!campo) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    if (campo === 'descripcion') {
        label.textContent = 'Nueva Descripción';
        inputArea.innerHTML = '<textarea class="form-control" id="modcat-new-val" rows="3" placeholder="Descripción de la categoría"></textarea>';
    } else if (campo === 'recomendacion') {
        label.textContent = 'Nueva Recomendación';
        inputArea.innerHTML = '<textarea class="form-control" id="modcat-new-val" rows="3" placeholder="Recomendación para esta categoría"></textarea>';
    }
}

function aplicarModCategoria() {
    var campo = document.getElementById('modcat-campo').value;
    var val   = document.getElementById('modcat-new-val').value.trim();

    if (!val || !modCatCurrentId) { showToast('error', 'Completa el campo'); return; }

    var promesa;
    if (campo === 'descripcion')   promesa = patchDescripcionCategoria(modCatCurrentId, val);
    else if (campo === 'recomendacion') promesa = patchRecomendacionCategoria(modCatCurrentId, val);
    else return;

    promesa.then(function() {
        showToast('success', 'Categoría actualizada');
        var panel = document.getElementById('cat-mod-panel');
        if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
        renderListaCategorias();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- ELIMINAR CATEGORIA ----

function iniciarEliminacionCategoria(id, nombre) {
    document.getElementById('del-cat-confirm-msg').innerHTML = '¿Eliminar categoría <strong>' + nombre + '</strong> (ID ' + id + ')?';
    document.getElementById('del-cat-confirm-btn').onclick = function() { confirmarEliminacionCategoria(id); };
    openModal('modal-delete-categoria');
}

function confirmarEliminacionCategoria(id) {
    deleteCategoria(id).then(function() {
        closeModal('modal-delete-categoria');
        showToast('success', 'Categoría eliminada');
        renderListaCategorias();
        updateSidebar();
    }).catch(function() {
        showToast('error', 'No se pudo eliminar');
    });
}
