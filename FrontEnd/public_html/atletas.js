// ---- DASHBOARD ----

function updateDashboard() {
    // Carga atletas, carreras y categorias al mismo tiempo
    Promise.all([
        getAtletas().catch(function() { return []; }),
        getCarreras().catch(function() { return []; }),
        getCategorias().catch(function() { return []; })
    ]).then(function(res) {
        var atletas    = res[0];
        var carreras   = res[1];
        var categorias = res[2];

        // Contadores principales
        setText('dash-total',    atletas.length);
        setText('dash-fem',      contarPor(atletas, 'genero', 'F'));
        setText('dash-masc',     contarPor(atletas, 'genero', 'M'));
        setText('dash-cross',    atletas.filter(function(a) { return a.modalidadCross; }).length);
        setText('dash-carreras', carreras.length);
        setText('dash-cats',     categorias.length);

        // Barras de especialidades
        var specs  = ['Sprint', 'Olímpico', 'Media Distancia', 'Ironman'];
        var colors = ['var(--gold)', 'var(--accent)', 'var(--accent3)', 'var(--accent2)'];
        var specsEl = document.getElementById('dash-specs');
        if (specsEl) {
            var html = '';
            for (var i = 0; i < specs.length; i++) {
                var cnt = contarPor(atletas, 'especialidad', specs[i]);
                var pct = atletas.length > 0 ? Math.round((cnt / atletas.length) * 100) : 0;
                html += '<div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">' +
                        '<span>' + specs[i] + '</span>' +
                        '<span style="color:' + colors[i] + ';font-weight:700">' + cnt + '</span>' +
                    '</div>' +
                    '<div style="background:var(--border);border-radius:4px;height:5px">' +
                        '<div style="width:' + pct + '%;background:' + colors[i] + ';height:5px;border-radius:4px"></div>' +
                    '</div>' +
                '</div>';
            }
            specsEl.innerHTML = html;
        }

        // Lista de carreras recientes
        var carrerasEl = document.getElementById('dash-carreras-list');
        if (carrerasEl) {
            if (carreras.length === 0) {
                carrerasEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px">Sin carreras registradas</div>';
            } else {
                var html2 = '';
                var limite = Math.min(carreras.length, 5);
                for (var j = 0; j < limite; j++) {
                    var c = carreras[j];
                    html2 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">' +
                        '<div>' +
                            '<span style="font-size:13px;font-weight:600">' + c.nombre + '</span>' +
                            '<span style="font-size:11px;color:var(--text-muted);margin-left:8px">' + (c.ubicacion || '') + '</span>' +
                        '</div>' +
                        '<span class="badge badge-run">' + (c.fecha || '') + '</span>' +
                    '</div>';
                }
                carrerasEl.innerHTML = html2;
            }
        }

        // Lista de categorias
        var catsEl = document.getElementById('dash-cats-list');
        if (catsEl) {
            if (categorias.length === 0) {
                catsEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px">Sin categorías registradas</div>';
            } else {
                var html3 = '';
                var limite2 = Math.min(categorias.length, 5);
                for (var k = 0; k < limite2; k++) {
                    var cat = categorias[k];
                    html3 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">' +
                        '<div>' +
                            '<span style="font-size:13px;font-weight:600">' + (cat.nombre || '—') + '</span>' +
                            '<span style="font-size:11px;color:var(--text-muted);margin-left:8px">' + (cat.tipo || '') + '</span>' +
                        '</div>' +
                        '<span class="badge badge-swim">' + cat.id + '</span>' +
                    '</div>';
                }
                catsEl.innerHTML = html3;
            }
        }
    }).catch(function() {
        showToast('error', 'Error al cargar el dashboard');
    });
}

// Cuenta cuántos objetos de un array tienen campo === valor
function contarPor(lista, campo, valor) {
    var n = 0;
    for (var i = 0; i < lista.length; i++) {
        if (lista[i][campo] === valor) n++;
    }
    return n;
}

// Pone un texto en un elemento por id
function setText(id, valor) {
    var el = document.getElementById(id);
    if (el) el.textContent = valor;
}

// ---- REGISTRAR ATLETA ----

function registrarTriatleta() {
    var nombre  = document.getElementById('reg-nombre').value.trim();
    var id      = document.getElementById('reg-id').value.trim();
    var correo  = document.getElementById('reg-correo').value.trim();
    var edad    = document.getElementById('reg-edad').value;
    var genero  = document.getElementById('reg-genero').value;
    var spec    = selectedSpec;
    var crossEl = document.querySelector('input[name="cross"]:checked');
    var fotoEl  = document.getElementById('reg-foto');

    if (!nombre || !id || !correo || !edad || !genero || !spec || !crossEl) {
        showToast('error', 'Completa todos los campos obligatorios');
        return;
    }

    var datos = {
        nombre: nombre,
        identificacion: id,
        correo: correo,
        edad: parseInt(edad),
        genero: genero,
        especialidad: spec,
        modalidadCross: crossEl.value === 'si',
        foto: null
    };

    // Si hay foto, primero la convierte a base64 y luego registra
    if (fotoEl && fotoEl.files && fotoEl.files[0]) {
        fileToBase64(fotoEl.files[0]).then(function(base64) {
            datos.foto = base64;
            enviarRegistroAtleta(datos);
        }).catch(function() {
            showToast('error', 'Error al procesar la imagen');
        });
    } else {
        enviarRegistroAtleta(datos);
    }
}

function enviarRegistroAtleta(datos) {
    postAtleta(datos).then(function() {
        // Limpiar formulario
        document.getElementById('reg-nombre').value = '';
        document.getElementById('reg-id').value = '';
        document.getElementById('reg-correo').value = '';
        document.getElementById('reg-edad').value = '';
        document.getElementById('reg-genero').value = '';
        document.getElementById('reg-foto').value = '';
        selectedSpec = '';

        var tarjetas = document.querySelectorAll('.specialty-card');
        for (var i = 0; i < tarjetas.length; i++) {
            tarjetas[i].classList.remove('selected');
        }
        var radios = document.querySelectorAll('input[name="cross"]');
        for (var j = 0; j < radios.length; j++) {
            radios[j].checked = false;
        }
        toggleCrossLabel();
        goSlide(0);

        showToast('success', datos.nombre + ' registrado exitosamente');
        updateSidebar();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- LISTA DE ATLETAS ----

function renderListaAtletas() {
    getAtletas().then(function(atletas) {
        var search = (document.getElementById('lista-search') ? document.getElementById('lista-search').value : '').toLowerCase();
        var gen    = document.getElementById('lista-filter-gen') ? document.getElementById('lista-filter-gen').value : '';
        var spec   = document.getElementById('lista-filter-spec') ? document.getElementById('lista-filter-spec').value : '';

        var filtrados = [];
        for (var i = 0; i < atletas.length; i++) {
            var a = atletas[i];
            var porNombre = !search || a.nombre.toLowerCase().includes(search) || String(a.identificacion).includes(search);
            var porGenero = !gen || a.genero === gen;
            var porSpec   = !spec || a.especialidad === spec;
            if (porNombre && porGenero && porSpec) filtrados.push(a);
        }

        var tbody = document.getElementById('lista-tbody');
        var empty = document.getElementById('lista-empty');
        if (!tbody) return;

        if (filtrados.length === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        var filas = '';
        for (var j = 0; j < filtrados.length; j++) {
            var at = filtrados[j];
            var avatarHTML = at.foto
                ? '<img src="' + at.foto + '" style="width:34px;height:34px;border-radius:50%;object-fit:cover">'
                : '<div class="avatar ' + claseAvatar(at.genero) + '">' + (at.nombre || '?')[0] + '</div>';

            filas += '<tr>' +
                '<td><div class="athlete-cell">' + avatarHTML +
                    '<div style="display:flex;flex-direction:column"><strong>' + at.nombre + '</strong>' +
                    '<span style="font-size:11px;color:var(--text-muted)">' + (at.correo || '') + '</span></div>' +
                '</div></td>' +
                '<td><span style="font-family:monospace;font-size:12px">' + at.identificacion + '</span></td>' +
                '<td>' + at.edad + '</td>' +
                '<td><span class="badge ' + (at.genero === 'M' ? 'badge-m' : 'badge-f') + '">' + (at.genero === 'M' ? 'Masc' : 'Fem') + '</span></td>' +
                '<td>' + (at.categoria || '—') + '</td>' +
                '<td><span class="badge ' + badgeEspecialidad(at.especialidad) + '">' + (at.especialidad || '—') + '</span></td>' +
                '<td>' + (at.modalidadCross ? '<span class="badge badge-cross">✓ Cross</span>' : '<span style="color:var(--text-muted)">—</span>') + '</td>' +
                '<td><div style="display:flex;gap:6px">' +
                    '<button class="btn btn-ghost btn-sm" title="Ver" onclick="verAtleta(\'' + at.identificacion + '\')">' +
                        '<span class="material-icons-round" style="font-size:14px">visibility</span></button>' +
                    '<button class="btn btn-danger btn-sm" title="Eliminar" onclick="iniciarEliminacionAtleta(\'' + at.identificacion + '\')">' +
                        '<span class="material-icons-round" style="font-size:14px">delete</span></button>' +
                '</div></td>' +
            '</tr>';
        }
        tbody.innerHTML = filas;
    }).catch(function() {
        showToast('error', 'Error al cargar la lista de atletas');
    });
}

function verAtleta(id) {
    localStorage.setItem('view_athlete_id', id);
    showPage('consulta_atleta');
}

// ---- CONSULTAR ATLETA POR ID ----

function consultarAtletaPorId() {
    var id = document.getElementById('consulta-id').value.trim();
    var res = document.getElementById('consulta-result');
    if (!id) { showToast('error', 'Ingresa un ID'); return; }

    // Carga el atleta y su carrera al mismo tiempo
    Promise.all([
        getAtletaById(id),
        getCarreraAtleta(id).catch(function() { return null; })
    ]).then(function(datos) {
        var atleta     = datos[0];
        var carreraData = datos[1];

        res.style.display = 'block';

        var carreraHTML = '';
        if (carreraData && carreraData.carrera) {
            var c = carreraData.carrera;
            carreraHTML = '<div class="card" style="margin-top:16px;border-color:var(--accent)">' +
                '<div class="card-title"><span class="material-icons-round">flag</span> Carrera Inscrita</div>' +
                '<div class="info-grid">' +
                    '<div class="info-item"><div class="info-item-label">Nombre</div><div class="info-item-value">' + (c.nombre || '—') + '</div></div>' +
                    '<div class="info-item"><div class="info-item-label">Ubicación</div><div class="info-item-value">' + (c.ubicacion || '—') + '</div></div>' +
                    '<div class="info-item"><div class="info-item-label">Fecha</div><div class="info-item-value">' + (c.fecha || '—') + '</div></div>' +
                    '<div class="info-item"><div class="info-item-label">Dificultad</div><div class="info-item-value">' + (c.nivelDificultad || '—') + '</div></div>' +
                '</div>' +
                '<button class="btn btn-danger btn-sm" style="margin-top:12px" onclick="desinscribirAtleta(\'' + id + '\')">' +
                    '<span class="material-icons-round" style="font-size:14px">link_off</span> Desvincular carrera' +
                '</button>' +
            '</div>';
        }

        res.innerHTML = buildAthleteDetail(atleta) + carreraHTML;
    }).catch(function() {
        res.style.display = 'block';
        res.innerHTML = '<div class="card" style="border-color:var(--accent2);max-width:400px">' +
            '<div style="color:var(--accent2)">Atleta no encontrado: <strong>' + id + '</strong></div></div>';
    });
}

function desinscribirAtleta(id) {
    patchQuitarCarreraAtleta(id).then(function() {
        showToast('success', 'Carrera desvinculada');
        consultarAtletaPorId();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- CONSULTAR GRUPOS ----

function consultarGrupo() {
    var gen   = document.getElementById('grp-gen').value;
    var cat   = document.getElementById('grp-cat').value;
    var spec  = document.getElementById('grp-spec').value;
    var cross = document.getElementById('grp-cross').value;
    var res   = document.getElementById('grupos-result');

    if (!gen && !cat && !spec && !cross) {
        res.innerHTML = '<div class="card" style="max-width:400px"><div style="color:var(--text-muted)">Selecciona al menos un filtro.</div></div>';
        return;
    }

    // Arma las llamadas según los filtros activos
    var llamadas = [];
    var etiquetas = [];

    if (gen)   { llamadas.push(getAtletasFiltro({ genero: gen }));            etiquetas.push('Género: ' + gen); }
    if (cat)   { llamadas.push(getAtletasFiltro({ categoria: cat }));          etiquetas.push('Categoría: ' + cat); }
    if (spec)  { llamadas.push(getAtletasFiltro({ especialidad: spec }));      etiquetas.push('Especialidad: ' + spec); }
    if (cross) { llamadas.push(getAtletasFiltro({ modalidadCross: cross === 'si' })); etiquetas.push('Cross: ' + cross); }

    Promise.all(llamadas).then(function(resultados) {
        // Intersección de todos los resultados
        var filtrados = resultados[0] || [];
        for (var i = 1; i < resultados.length; i++) {
            var ids = {};
            for (var j = 0; j < resultados[i].length; j++) {
                ids[resultados[i][j].identificacion] = true;
            }
            var nueva = [];
            for (var k = 0; k < filtrados.length; k++) {
                if (ids[filtrados[k].identificacion]) nueva.push(filtrados[k]);
            }
            filtrados = nueva;
        }

        if (filtrados.length === 0) {
            res.innerHTML = '<div class="card" style="border-color:var(--accent2);max-width:400px">' +
                '<div style="color:var(--accent2)">Sin resultados para: ' + etiquetas.join(' · ') + '</div></div>';
            return;
        }

        var filas = '';
        for (var m = 0; m < filtrados.length; m++) {
            var a = filtrados[m];
            var avatarHTML = a.foto
                ? '<img src="' + a.foto + '" style="width:34px;height:34px;border-radius:50%">'
                : '<div class="avatar ' + claseAvatar(a.genero) + '">' + (a.nombre || '?')[0] + '</div>';

            filas += '<tr>' +
                '<td><div class="athlete-cell">' + avatarHTML + '<strong>' + a.nombre + '</strong></div></td>' +
                '<td>' + a.identificacion + '</td>' +
                '<td>' + a.edad + '</td>' +
                '<td>' + a.genero + '</td>' +
                '<td>' + (a.categoria || '—') + '</td>' +
                '<td>' + (a.especialidad || '—') + '</td>' +
                '<td>' + (a.modalidadCross ? '<span class="badge badge-cross">✓</span>' : '—') + '</td>' +
            '</tr>';
        }

        res.innerHTML = '<div style="margin-bottom:14px;color:var(--text-muted);font-size:13px">' +
            filtrados.length + ' resultado(s) — ' + etiquetas.join(' · ') + '</div>' +
            '<div class="table-wrap"><table>' +
            '<thead><tr><th>Triatleta</th><th>ID</th><th>Edad</th><th>Género</th><th>Categoría</th><th>Especialidad</th><th>Cross</th></tr></thead>' +
            '<tbody>' + filas + '</tbody></table></div>';
    }).catch(function() {
        showToast('error', 'Error al consultar grupos');
    });
}

// ---- MODIFICAR ATLETA ----

var modCurrentId = null;
var modCurrentPhoto = '';

function buscarParaModificar() {
    var id = document.getElementById('mod-search-id').value.trim();
    var notFound = document.getElementById('mod-not-found');
    var formCard = document.getElementById('mod-form-card');

    getAtletaById(id).then(function(a) {
        if (notFound) notFound.style.display = 'none';
        modCurrentId = a.identificacion;
        modCurrentPhoto = a.foto || '';
        if (formCard) formCard.style.display = 'block';

        // Rellenar campos del formulario completo
        document.getElementById('edit-nombre').value = a.nombre;
        document.getElementById('edit-correo').value = a.correo || '';
        document.getElementById('edit-edad').value   = a.edad;
        document.getElementById('edit-genero').value = a.genero;
        document.getElementById('edit-spec').value   = a.especialidad;
        document.getElementById('edit-cross').value  = a.modalidadCross ? 'si' : 'no';

        document.getElementById('mod-tipo').value = 'campo';
        toggleModTipo();
        document.getElementById('mod-campo').value = '';
        document.getElementById('mod-field-wrap').style.display = 'none';

        var avatarHTML = a.foto
            ? '<img src="' + a.foto + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover">'
            : '<div class="avatar ' + claseAvatar(a.genero) + '">' + (a.nombre || '?')[0] + '</div>';

        var preview = document.getElementById('mod-athlete-preview');
        if (preview) {
            preview.innerHTML = '<div style="display:flex;align-items:center;gap:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px">' +
                avatarHTML +
                '<div><div style="font-weight:600">' + a.nombre + '</div>' +
                '<div style="font-size:12px;color:var(--text-muted);font-family:monospace">' + a.identificacion + '</div></div>' +
            '</div>';
        }
    }).catch(function() {
        if (notFound) notFound.style.display = 'block';
        if (formCard) formCard.style.display = 'none';
        modCurrentId = null;
    });
}

function toggleModTipo() {
    var tipo   = document.getElementById('mod-tipo').value;
    var campo  = document.getElementById('mod-campo-wrap');
    var comp   = document.getElementById('mod-completo-wrap');
    if (campo) campo.style.display = tipo === 'campo'    ? 'block' : 'none';
    if (comp)  comp.style.display  = tipo === 'completo' ? 'block' : 'none';
}

function showModField() {
    var campo     = document.getElementById('mod-campo').value;
    var wrap      = document.getElementById('mod-field-wrap');
    var label     = document.getElementById('mod-field-label');
    var inputArea = document.getElementById('mod-field-input');

    if (!campo) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    if (campo === 'nombre') {
        label.textContent = 'Nuevo Nombre';
        inputArea.innerHTML = '<input type="text" class="form-control" id="mod-new-val" placeholder="Nombre completo">';
    } else if (campo === 'id') {
        label.textContent = 'Nueva Identificación';
        inputArea.innerHTML = '<input type="text" class="form-control" id="mod-new-val" placeholder="Nuevo número">';
    } else if (campo === 'categoria') {
        label.textContent = 'Nueva Categoría';
        inputArea.innerHTML = '<select class="form-control" id="mod-new-val">' +
            '<option value="">Seleccionar</option>' +
            '<option>Cadetes</option><option>Juvenil</option><option>Junior</option>' +
            '<option>Sub-23</option><option>Absoluta</option>' +
            '<option>Veterano 1</option><option>Veterano 2</option><option>Veterano 3</option>' +
        '</select>';
    }
}

function aplicarModificacion() {
    var campo = document.getElementById('mod-campo').value;
    var val   = document.getElementById('mod-new-val').value.trim();
    if (!val) { showToast('error', 'Ingresa el nuevo valor'); return; }

    var promesa;
    if (campo === 'nombre')    promesa = patchNombreAtleta(modCurrentId, val);
    else if (campo === 'id')   promesa = patchIdAtleta(modCurrentId, val);
    else if (campo === 'categoria') promesa = patchCategoriaAtleta(modCurrentId, val);
    else return;

    promesa.then(function() {
        if (campo === 'id') modCurrentId = val;
        showToast('success', 'Campo actualizado correctamente');
        buscarParaModificar();
        updateSidebar();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

function aplicarModificacionCompleta() {
    var nombre = document.getElementById('edit-nombre').value.trim();
    var correo = document.getElementById('edit-correo').value.trim();
    var edad   = document.getElementById('edit-edad').value;
    var genero = document.getElementById('edit-genero').value;
    var spec   = document.getElementById('edit-spec').value;
    var cross  = document.getElementById('edit-cross').value;
    var fotoEl = document.getElementById('edit-foto');

    if (!nombre || !correo || !edad || !genero || !spec) {
        showToast('error', 'Completa todos los campos');
        return;
    }

    var dto = {
        nombre: nombre,
        identificacion: modCurrentId,
        correo: correo,
        edad: parseInt(edad),
        genero: genero,
        especialidad: spec,
        modalidadCross: cross === 'si',
        foto: modCurrentPhoto
    };

    if (fotoEl && fotoEl.files && fotoEl.files[0]) {
        fileToBase64(fotoEl.files[0]).then(function(base64) {
            dto.foto = base64;
            enviarActualizacionCompleta(dto);
        });
    } else {
        enviarActualizacionCompleta(dto);
    }
}

function enviarActualizacionCompleta(dto) {
    putAtleta(modCurrentId, dto).then(function() {
        showToast('success', 'Perfil actualizado correctamente');
        buscarParaModificar();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}

// ---- ELIMINAR ATLETA ----

function buscarParaEliminar() {
    var id  = document.getElementById('del-id').value.trim();
    var res = document.getElementById('del-result');

    getAtletaById(id).then(function(a) {
        res.innerHTML = buildAthleteDetail(a) +
            '<div style="margin-top:16px;display:flex;gap:12px">' +
                '<button class="btn btn-ghost" onclick="limpiarEliminar()">Cancelar</button>' +
                '<button class="btn btn-eliminar" onclick="iniciarEliminacionAtleta(\'' + a.identificacion + '\')">' +
                    '<span class="material-icons-round">delete_forever</span> Eliminar Triatleta' +
                '</button>' +
            '</div>';
    }).catch(function() {
        res.innerHTML = '<div class="card" style="border-color:var(--accent2);max-width:400px">' +
            '<div style="color:var(--accent2)">Atleta no encontrado</div></div>';
    });
}

function iniciarEliminacionAtleta(id) {
    document.getElementById('del-confirm-msg').innerHTML = '¿Eliminar triatleta con ID <strong>' + id + '</strong>?';
    document.getElementById('del-confirm-btn').onclick = function() { confirmarEliminacionAtleta(id); };
    openModal('modal-delete');
}

function confirmarEliminacionAtleta(id) {
    deleteAtleta(id).then(function() {
        closeModal('modal-delete');
        limpiarEliminar();
        showToast('success', 'Atleta eliminado');
        updateSidebar();
        if (window.location.pathname.includes('lista.html')) renderListaAtletas();
    }).catch(function() {
        showToast('error', 'No se pudo eliminar');
    });
}

function limpiarEliminar() {
    document.getElementById('del-result').innerHTML = '';
    document.getElementById('del-id').value = '';
}

// ---- INSCRIBIR EN CARRERA ----

function cargarSelectCarreras() {
    var sel = document.getElementById('ins-carrera-sel');
    if (!sel) return;

    getCarreras().then(function(carreras) {
        var opciones = '<option value="">Seleccionar carrera</option>';
        for (var i = 0; i < carreras.length; i++) {
            var c = carreras[i];
            opciones += '<option value="' + c.id + '">' + c.nombre + ' — ' + (c.ubicacion || '') + '</option>';
        }
        sel.innerHTML = opciones;
    }).catch(function() {
        sel.innerHTML = '<option value="">Error al cargar carreras</option>';
    });
}

function inscribirAtletaEnCarrera() {
    var idAtleta  = document.getElementById('ins-atleta-id').value.trim();
    var idCarrera = document.getElementById('ins-carrera-sel').value;

    if (!idAtleta || !idCarrera) {
        showToast('error', 'Completa ambos campos');
        return;
    }

    // Registra en los dos microservicios al mismo tiempo
    Promise.all([
        postInscribirAtleta(idAtleta, idCarrera),
        postAtletaEnCarrera(idCarrera, idAtleta)
    ]).then(function() {
        showToast('success', 'Atleta inscrito en la carrera');
        updateSidebar();
    }).catch(function(err) {
        showToast('error', err.message);
    });
}
