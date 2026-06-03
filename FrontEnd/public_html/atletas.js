/* =============================================
   TRIATLÓN GESTOR — atletas.js
   Lógica de todos los módulos de Atletas
   ============================================= */

/* ──────────────────────────────────────────────
   DASHBOARD  (Promise.all carga todo en paralelo)
   ────────────────────────────────────────────── */
async function updateDashboard() {
    try {
        // Cargar atletas, carreras y categorías en paralelo
        const [athletes, carreras, categorias] = await Promise.all([
            AtletasAPI.listarTodos().catch(() => []),
            CarrerasAPI.listarTodas().catch(() => []),
            CategoriasAPI.listarTodas().catch(() => [])
        ]);

        // Stats atletas
        const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setTxt('dash-total',     athletes.length);
        setTxt('dash-fem',       athletes.filter(a => a.genero === 'F').length);
        setTxt('dash-masc',      athletes.filter(a => a.genero === 'M').length);
        setTxt('dash-cross',     athletes.filter(a => a.modalidadCross).length);
        setTxt('dash-carreras',  carreras.length);
        setTxt('dash-cats',      categorias.length);

        // Especialidades
        const specs = ['Sprint', 'Olímpico', 'Media Distancia', 'Ironman'];
        const specColors = ['var(--gold)', 'var(--accent)', 'var(--accent3)', 'var(--accent2)'];
        const specsEl = document.getElementById('dash-specs');
        if (specsEl) {
            specsEl.innerHTML = specs.map((s, i) => {
                const cnt = athletes.filter(a => a.especialidad === s).length;
                const pct = athletes.length ? Math.round((cnt / athletes.length) * 100) : 0;
                return `<div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
                    <span>${s}</span><span style="color:${specColors[i]};font-weight:700">${cnt}</span>
                  </div>
                  <div style="background:var(--border);border-radius:4px;height:5px">
                    <div style="width:${pct}%;background:${specColors[i]};height:5px;border-radius:4px"></div>
                  </div>
                </div>`;
            }).join('');
        }

        // Categorías recientes
        const catsEl = document.getElementById('dash-cats-list');
        if (catsEl) {
            if (categorias.length === 0) {
                catsEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px">Sin categorías registradas</div>';
            } else {
                catsEl.innerHTML = categorias.slice(0, 5).map(c => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">
                    <div>
                      <span style="font-size:13px;font-weight:600">${c.name || c.nombre || '—'}</span>
                      <span style="font-size:11px;color:var(--text-muted);margin-left:8px">${c.tipo || ''}</span>
                    </div>
                    <span class="badge badge-swim">${c.id}</span>
                  </div>`).join('');
            }
        }

        // Carreras recientes
        const carrerasEl = document.getElementById('dash-carreras-list');
        if (carrerasEl) {
            if (carreras.length === 0) {
                carrerasEl.innerHTML = '<div style="color:var(--text-muted);font-size:13px">Sin carreras registradas</div>';
            } else {
                carrerasEl.innerHTML = carreras.slice(0, 5).map(c => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">
                    <div>
                      <span style="font-size:13px;font-weight:600">${c.nombre}</span>
                      <span style="font-size:11px;color:var(--text-muted);margin-left:8px">${c.ubicacion || ''}</span>
                    </div>
                    <span class="badge badge-run">${c.fecha || ''}</span>
                  </div>`).join('');
            }
        }
    } catch (err) {
        showToast('error', 'Error al cargar dashboard');
    }
}

/* ──────────────────────────────────────────────
   REGISTRAR ATLETA
   ────────────────────────────────────────────── */
async function registrarTriatleta() {
    const nombre  = document.getElementById('reg-nombre')?.value.trim();
    const id      = document.getElementById('reg-id')?.value.trim();
    const correo  = document.getElementById('reg-correo')?.value.trim();
    const edad    = document.getElementById('reg-edad')?.value;
    const genero  = document.getElementById('reg-genero')?.value;
    const spec    = selectedSpec;
    const crossEl = document.querySelector('input[name="cross"]:checked');
    const fotoEl  = document.getElementById('reg-foto');

    if (!nombre || !id || !correo || !edad || !genero || !spec || !crossEl) {
        showToast('error', '⚠ Completa todos los campos obligatorios');
        return;
    }

    let foto = '';
    if (fotoEl?.files?.[0]) {
        try { foto = await fileToBase64(fotoEl.files[0]); }
        catch (_) { showToast('error', '⚠ Error al procesar la imagen'); return; }
    }

    const dto = {
        nombre, identificacion: id, correo,
        edad: parseInt(edad), genero,
        especialidad: spec,
        modalidadCross: crossEl.value === 'si',
        foto
    };

    try {
        await AtletasAPI.registrar(dto);
        // Limpiar form
        ['reg-nombre','reg-id','reg-correo','reg-edad','reg-cat','reg-spec'].forEach(fid => {
            const el = document.getElementById(fid);
            if (el) el.value = '';
        });
        if (document.getElementById('reg-genero')) document.getElementById('reg-genero').value = '';
        if (fotoEl) fotoEl.value = '';
        selectedSpec = '';
        document.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('input[name="cross"]').forEach(r => r.checked = false);
        toggleCrossLabel();
        goSlide(0);
        showToast('success', `✓ ${nombre} registrado exitosamente`);
        updateSidebar();
    } catch (err) {
        showToast('error', `⚠ ${err.message}`);
    }
}

/* ──────────────────────────────────────────────
   LISTA DE ATLETAS
   ────────────────────────────────────────────── */
async function renderListaAtletas() {
    try {
        const athletes = await AtletasAPI.listarTodos();
        const search = (document.getElementById('lista-search')?.value || '').toLowerCase();
        const gen    = document.getElementById('lista-filter-gen')?.value  || '';
        const spec   = document.getElementById('lista-filter-spec')?.value || '';

        const filtered = athletes.filter(a => {
            const ms = !search || a.nombre.toLowerCase().includes(search) || String(a.identificacion).includes(search);
            const mg = !gen   || a.genero === gen;
            const msp= !spec  || a.especialidad === spec;
            return ms && mg && msp;
        });

        const tbody    = document.getElementById('lista-tbody');
        const empty    = document.getElementById('lista-empty');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        tbody.innerHTML = filtered.map(a => `
          <tr>
            <td>
              <div class="athlete-cell">
                ${a.foto ? `<img src="${a.foto}" style="width:34px;height:34px;border-radius:50%;object-fit:cover">` : `<div class="avatar ${getAvatarClass(a.genero)}">${(a.nombre||'?')[0]}</div>`}
                <div style="display:flex;flex-direction:column">
                  <strong>${a.nombre}</strong>
                  <span style="font-size:11px;color:var(--text-muted)">${a.correo || ''}</span>
                </div>
              </div>
            </td>
            <td><span style="font-family:'Space Mono',monospace;font-size:12px">${a.identificacion}</span></td>
            <td>${a.edad}</td>
            <td><span class="badge ${a.genero === 'M' ? 'badge-m' : 'badge-f'}">${a.genero === 'M' ? 'Masc' : 'Fem'}</span></td>
            <td>${a.categoria || '—'}</td>
            <td><span class="badge ${getSpecBadge(a.especialidad)}">${a.especialidad || '—'}</span></td>
            <td>${a.modalidadCross ? '<span class="badge badge-cross">✓ Cross</span>' : '<span style="color:var(--text-muted)">—</span>'}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" title="Ver" onclick="verAtleta('${a.identificacion}')">
                  <span class="material-icons-round" style="font-size:14px">visibility</span>
                </button>
                <button class="btn btn-danger btn-sm" title="Eliminar" onclick="iniciarEliminacionAtleta('${a.identificacion}')">
                  <span class="material-icons-round" style="font-size:14px">delete</span>
                </button>
              </div>
            </td>
          </tr>`).join('');
    } catch (err) {
        showToast('error', 'Error al cargar la lista de atletas');
    }
}

function verAtleta(id) {
    localStorage.setItem('view_athlete_id', id);
    showPage('consulta_atleta');
}

/* ──────────────────────────────────────────────
   CONSULTAR ATLETA POR ID
   ────────────────────────────────────────────── */
async function consultarAtletaPorId() {
    const id  = document.getElementById('consulta-id')?.value.trim();
    const res = document.getElementById('consulta-result');
    if (!id) { showToast('error', 'Ingresa un ID'); return; }

    try {
        // Cargar atleta y su carrera en paralelo
        const [atleta, carreraData] = await Promise.all([
            AtletasAPI.obtenerPorId(id),
            AtletasAPI.consultarCarrera(id).catch(() => null)
        ]);

        res.style.display = 'block';
        let carreraHTML = '';
        if (carreraData && carreraData.carrera) {
            const c = carreraData.carrera;
            carreraHTML = `
              <div class="card" style="margin-top:16px;border-color:var(--accent)">
                <div class="card-title"><span class="material-icons-round">flag</span> Carrera Inscrita</div>
                <div class="info-grid">
                  <div class="info-item"><div class="info-item-label">Nombre</div><div class="info-item-value">${c.nombre || '—'}</div></div>
                  <div class="info-item"><div class="info-item-label">Ubicación</div><div class="info-item-value">${c.ubicacion || '—'}</div></div>
                  <div class="info-item"><div class="info-item-label">Fecha</div><div class="info-item-value">${c.fecha || '—'}</div></div>
                  <div class="info-item"><div class="info-item-label">Dificultad</div><div class="info-item-value">${c.nivelDificultad || '—'}</div></div>
                </div>
                <button class="btn btn-danger btn-sm" style="margin-top:12px" onclick="desinscribirAtleta('${id}')">
                  <span class="material-icons-round" style="font-size:14px">link_off</span> Desvincular carrera
                </button>
              </div>`;
        }
        res.innerHTML = buildAthleteDetail(atleta) + carreraHTML;
    } catch (err) {
        res.style.display = 'block';
        res.innerHTML = `<div class="card" style="border-color:var(--accent2);max-width:400px"><div style="color:var(--accent2);display:flex;align-items:center;gap:8px"><span class="material-icons-round">search_off</span>No encontrado: <strong>${id}</strong></div></div>`;
    }
}

async function desinscribirAtleta(id) {
    try {
        await AtletasAPI.eliminarCarrera(id);
        showToast('success', 'Carrera desvinculada');
        consultarAtletaPorId();
    } catch (err) {
        showToast('error', err.message);
    }
}

/* ──────────────────────────────────────────────
   CONSULTAR GRUPOS (Promise.all para los 4 filtros)
   ────────────────────────────────────────────── */
async function consultarGrupo() {
    const gen   = document.getElementById('grp-gen')?.value;
    const cat   = document.getElementById('grp-cat')?.value;
    const spec  = document.getElementById('grp-spec')?.value;
    const cross = document.getElementById('grp-cross')?.value;
    const res   = document.getElementById('grupos-result');

    if (!gen && !cat && !spec && !cross) {
        res.innerHTML = `<div class="card" style="max-width:400px"><div style="color:var(--text-muted)">Selecciona al menos un filtro.</div></div>`;
        return;
    }

    // Construir parámetros y ejecutar llamadas activas en Promise.all
    const promises = [];
    const labels   = [];
    if (gen)   { promises.push(AtletasAPI.filtrarPorGenero(gen));       labels.push(`Género: ${gen}`); }
    if (cat)   { promises.push(AtletasAPI.filtrarPorCategoria(cat));    labels.push(`Categoría: ${cat}`); }
    if (spec)  { promises.push(AtletasAPI.filtrarPorEspecialidad(spec));labels.push(`Especialidad: ${spec}`); }
    if (cross) { promises.push(AtletasAPI.filtrarPorCross(cross === 'si')); labels.push(`Cross: ${cross}`); }

    try {
        const results = await Promise.all(promises);
        // Intersección si hay más de un filtro
        let filtered = results[0] || [];
        for (let i = 1; i < results.length; i++) {
            const ids = new Set(results[i].map(a => a.identificacion));
            filtered = filtered.filter(a => ids.has(a.identificacion));
        }

        if (filtered.length === 0) {
            res.innerHTML = `<div class="card" style="border-color:var(--accent2);max-width:400px"><div style="color:var(--accent2)">Sin resultados para: ${labels.join(' · ')}</div></div>`;
            return;
        }

        res.innerHTML = `
          <div style="margin-bottom:14px;color:var(--text-muted);font-size:13px">${filtered.length} resultado(s) — ${labels.join(' · ')}</div>
          <div class="table-wrap"><table>
            <thead><tr><th>Triatleta</th><th>ID</th><th>Edad</th><th>Género</th><th>Categoría</th><th>Especialidad</th><th>Cross</th></tr></thead>
            <tbody>
              ${filtered.map(a => `
                <tr>
                  <td><div class="athlete-cell">${a.foto ? `<img src="${a.foto}" style="width:34px;height:34px;border-radius:50%">` : `<div class="avatar ${getAvatarClass(a.genero)}">${(a.nombre||'?')[0]}</div>`}<strong>${a.nombre}</strong></div></td>
                  <td>${a.identificacion}</td><td>${a.edad}</td><td>${a.genero}</td>
                  <td>${a.categoria || '—'}</td><td>${a.especialidad || '—'}</td>
                  <td>${a.modalidadCross ? '<span class="badge badge-cross">✓</span>' : '—'}</td>
                </tr>`).join('')}
            </tbody>
          </table></div>`;
    } catch (err) {
        showToast('error', 'Error al consultar grupos');
    }
}

/* ──────────────────────────────────────────────
   MODIFICAR ATLETA
   ────────────────────────────────────────────── */
let modCurrentId    = null;
let modCurrentPhoto = '';

async function buscarParaModificar() {
    const id       = document.getElementById('mod-search-id')?.value.trim();
    const notFound = document.getElementById('mod-not-found');
    const formCard = document.getElementById('mod-form-card');
    try {
        const a = await AtletasAPI.obtenerPorId(id);
        if (notFound) notFound.style.display = 'none';
        modCurrentId    = a.identificacion;
        modCurrentPhoto = a.foto || '';
        if (formCard) formCard.style.display = 'block';

        // Rellenar campos completos
        ['edit-nombre','edit-correo','edit-edad','edit-genero','edit-spec','edit-cross'].forEach(fid => {
            const el = document.getElementById(fid);
            if (!el) return;
            const key = fid.replace('edit-','');
            if (key === 'nombre') el.value = a.nombre;
            if (key === 'correo') el.value = a.correo || '';
            if (key === 'edad')   el.value = a.edad;
            if (key === 'genero') el.value = a.genero;
            if (key === 'spec')   el.value = a.especialidad;
            if (key === 'cross')  el.value = a.modalidadCross ? 'si' : 'no';
        });

        document.getElementById('mod-tipo').value = 'campo';
        toggleModTipo();
        const campoEl = document.getElementById('mod-campo');
        if (campoEl) campoEl.value = '';
        const wrapEl = document.getElementById('mod-field-wrap');
        if (wrapEl) wrapEl.style.display = 'none';

        const preview = document.getElementById('mod-athlete-preview');
        if (preview) {
            preview.innerHTML = `
              <div style="display:flex;align-items:center;gap:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px">
                ${a.foto ? `<img src="${a.foto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">` : `<div class="avatar ${getAvatarClass(a.genero)}">${(a.nombre||'?')[0]}</div>`}
                <div>
                  <div style="font-weight:600">${a.nombre}</div>
                  <div style="font-size:12px;color:var(--text-muted);font-family:'Space Mono',monospace">${a.identificacion}</div>
                </div>
              </div>`;
        }
    } catch (_) {
        if (notFound) notFound.style.display = 'block';
        if (formCard) formCard.style.display = 'none';
        modCurrentId = null;
    }
}

function toggleModTipo() {
    const tipo = document.getElementById('mod-tipo')?.value;
    const campo  = document.getElementById('mod-campo-wrap');
    const comp   = document.getElementById('mod-completo-wrap');
    if (campo) campo.style.display = tipo === 'campo'    ? 'block' : 'none';
    if (comp)  comp.style.display  = tipo === 'completo' ? 'block' : 'none';
}

function showModField() {
    const campo    = document.getElementById('mod-campo')?.value;
    const wrap     = document.getElementById('mod-field-wrap');
    const label    = document.getElementById('mod-field-label');
    const inputArea= document.getElementById('mod-field-input');
    if (!campo) { if (wrap) wrap.style.display = 'none'; return; }
    if (wrap) wrap.style.display = 'block';
    if (campo === 'nombre')        { label.textContent = 'Nuevo Nombre';        inputArea.innerHTML = `<input type="text" class="form-control" id="mod-new-val" placeholder="Nombre completo">`; }
    else if (campo === 'id')       { label.textContent = 'Nueva Identificación'; inputArea.innerHTML = `<input type="text" class="form-control" id="mod-new-val" placeholder="Nuevo número">`; }
    else if (campo === 'categoria'){ label.textContent = 'Nueva Categoría';
        inputArea.innerHTML = `<select class="form-control" id="mod-new-val">
          <option value="">Seleccionar</option>
          <option>Cadetes</option><option>Juvenil</option><option>Junior</option>
          <option>Sub-23</option><option>Absoluta</option>
          <option>Veterano 1</option><option>Veterano 2</option><option>Veterano 3</option>
        </select>`;
    }
}

async function aplicarModificacion() {
    const campo = document.getElementById('mod-campo')?.value;
    const val   = document.getElementById('mod-new-val')?.value.trim();
    if (!val) { showToast('error', 'Ingresa el nuevo valor'); return; }
    try {
        if (campo === 'nombre')    await AtletasAPI.actualizarNombre(modCurrentId, val);
        if (campo === 'id')        { await AtletasAPI.actualizarIdentificacion(modCurrentId, val); modCurrentId = val; }
        if (campo === 'categoria') await AtletasAPI.actualizarCategoria(modCurrentId, val);
        showToast('success', '✓ Actualizado correctamente');
        buscarParaModificar();
        updateSidebar();
    } catch (err) {
        showToast('error', err.message);
    }
}

async function aplicarModificacionCompleta() {
    const nombre = document.getElementById('edit-nombre')?.value.trim();
    const correo = document.getElementById('edit-correo')?.value.trim();
    const edad   = document.getElementById('edit-edad')?.value;
    const genero = document.getElementById('edit-genero')?.value;
    const spec   = document.getElementById('edit-spec')?.value;
    const cross  = document.getElementById('edit-cross')?.value;
    const fotoEl = document.getElementById('edit-foto');

    if (!nombre || !correo || !edad || !genero || !spec) {
        showToast('error', '⚠ Completa todos los campos');
        return;
    }

    let foto = modCurrentPhoto;
    if (fotoEl?.files?.[0]) foto = await fileToBase64(fotoEl.files[0]);

    const dto = { nombre, identificacion: modCurrentId, correo, edad: parseInt(edad), genero, especialidad: spec, modalidadCross: cross === 'si', foto };
    try {
        await AtletasAPI.actualizarCompleto(modCurrentId, dto);
        showToast('success', '✓ Perfil actualizado correctamente');
        buscarParaModificar();
    } catch (err) {
        showToast('error', `⚠ ${err.message}`);
    }
}

/* ──────────────────────────────────────────────
   ELIMINAR ATLETA
   ────────────────────────────────────────────── */
async function buscarParaEliminar() {
    const id  = document.getElementById('del-id')?.value.trim();
    const res = document.getElementById('del-result');
    try {
        const a = await AtletasAPI.obtenerPorId(id);
        res.innerHTML = `
          ${buildAthleteDetail(a)}
          <div style="margin-top:16px;display:flex;gap:12px">
            <button class="btn btn-ghost" onclick="limpiarEliminar()">Cancelar</button>
            <button class="btn btn-eliminar" onclick="iniciarEliminacionAtleta('${a.identificacion}')">
              <span class="material-icons-round">delete_forever</span> Eliminar Triatleta
            </button>
          </div>`;
    } catch (_) {
        res.innerHTML = `<div class="card" style="border-color:var(--accent2);max-width:400px"><div style="color:var(--accent2)">Atleta no encontrado</div></div>`;
    }
}

function iniciarEliminacionAtleta(id) {
    document.getElementById('del-confirm-msg').innerHTML = `¿Eliminar triatleta con ID <strong>${id}</strong>?`;
    document.getElementById('del-confirm-btn').onclick = () => confirmarEliminacionAtleta(id);
    openModal('modal-delete');
}

async function confirmarEliminacionAtleta(id) {
    try {
        await AtletasAPI.eliminar(id);
        closeModal('modal-delete');
        limpiarEliminar();
        if (window.location.pathname.includes('lista.html')) renderListaAtletas();
        showToast('success', 'Atleta eliminado');
        updateSidebar();
    } catch (err) {
        showToast('error', 'No se pudo eliminar');
    }
}

function limpiarEliminar() {
    const res = document.getElementById('del-result');
    if (res) res.innerHTML = '';
    const el = document.getElementById('del-id');
    if (el) el.value = '';
}

/* ──────────────────────────────────────────────
   INSCRIBIR ATLETA EN CARRERA
   ────────────────────────────────────────────── */
async function cargarSelectCarreras() {
    const sel = document.getElementById('ins-carrera-sel');
    if (!sel) return;
    try {
        const carreras = await CarrerasAPI.listarTodas();
        sel.innerHTML = `<option value="">Seleccionar carrera</option>` +
            carreras.map(c => `<option value="${c.id}">${c.nombre} — ${c.ubicacion || ''}</option>`).join('');
    } catch (_) {
        sel.innerHTML = `<option value="">Error al cargar carreras</option>`;
    }
}

async function inscribirAtletaEnCarrera() {
    const idAtleta  = document.getElementById('ins-atleta-id')?.value.trim();
    const idCarrera = document.getElementById('ins-carrera-sel')?.value;
    if (!idAtleta || !idCarrera) { showToast('error', 'Completa ambos campos'); return; }
    try {
        // Inscribir en ambos microservicios en paralelo
        await Promise.all([
            AtletasAPI.inscribirEnCarrera(idAtleta, idCarrera),
            CarrerasAPI.registrarAtleta(idCarrera, idAtleta)
        ]);
        showToast('success', '✓ Atleta inscrito en la carrera');
        updateSidebar();
    } catch (err) {
        showToast('error', `⚠ ${err.message}`);
    }
}
