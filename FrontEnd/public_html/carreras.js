/* =============================================
   TRIATLÓN GESTOR — carreras.js
   Lógica de todos los módulos de Carreras
   ============================================= */

/* ──────────────────────────────────────────────
   LISTA DE CARRERAS
   ────────────────────────────────────────────── */
async function renderListaCarreras() {
    try {
        // Cargar carreras y categorías en paralelo para enriquecer la tabla
        const [carreras, categorias] = await Promise.all([
            CarrerasAPI.listarTodas(),
            CategoriasAPI.listarTodas().catch(() => [])
        ]);

        const catMap = {};
        categorias.forEach(c => { catMap[c.id] = c.name || c.nombre || '—'; });

        const tbody = document.getElementById('carr-tbody');
        const empty = document.getElementById('carr-empty');
        if (!tbody) return;

        if (carreras.length === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        tbody.innerHTML = carreras.map(c => `
          <tr>
            <td><strong>${c.nombre}</strong></td>
            <td>${c.ubicacion || '—'}</td>
            <td><span style="font-family:'Space Mono',monospace;font-size:12px">${c.fecha || '—'}</span></td>
            <td>${renderDificultad(c.nivelDificultad)}</td>
            <td>${c.idCategoria ? `<span class="badge badge-swim">${catMap[c.idCategoria] || '#'+c.idCategoria}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" title="Ver" onclick="verCarrera(${c.id})">
                  <span class="material-icons-round" style="font-size:14px">visibility</span>
                </button>
                <button class="btn btn-ghost btn-sm" title="Modificar" onclick="irModificarCarrera(${c.id})">
                  <span class="material-icons-round" style="font-size:14px">edit</span>
                </button>
                <button class="btn btn-danger btn-sm" title="Eliminar" onclick="iniciarEliminacionCarrera(${c.id},'${c.nombre}')">
                  <span class="material-icons-round" style="font-size:14px">delete</span>
                </button>
              </div>
            </td>
          </tr>`).join('');
    } catch (err) {
        showToast('error', 'Error al cargar carreras');
    }
}

function renderDificultad(nivel) {
    if (!nivel) return '—';
    const stars = { '1': '★☆☆☆☆', '2': '★★☆☆☆', '3': '★★★☆☆', '4': '★★★★☆', '5': '★★★★★' };
    return `<span style="color:var(--gold)">${stars[nivel] || nivel}</span>`;
}

function verCarrera(id) {
    localStorage.setItem('view_carrera_id', id);
    showPage('detalle_carrera');
}

function irModificarCarrera(id) {
    localStorage.setItem('mod_carrera_id', id);
    showPage('modificar_carrera');
}

/* ──────────────────────────────────────────────
   REGISTRAR CARRERA
   ────────────────────────────────────────────── */
async function cargarSelectCategorias() {
    const sel = document.getElementById('carr-cat-sel');
    if (!sel) return;
    try {
        const cats = await CategoriasAPI.listarTodas();
        sel.innerHTML = `<option value="">Sin categoría</option>` +
            cats.map(c => `<option value="${c.id}">${c.name || c.nombre} (${c.tipo})</option>`).join('');
    } catch (_) {
        sel.innerHTML = `<option value="">Error al cargar categorías</option>`;
    }
}

async function registrarCarrera() {
    const nombre   = document.getElementById('carr-nombre')?.value.trim();
    const ubicacion= document.getElementById('carr-ubicacion')?.value.trim();
    const fecha    = document.getElementById('carr-fecha')?.value;
    const nivel    = document.getElementById('carr-nivel')?.value;
    const publico  = document.getElementById('carr-publico')?.value.trim();
    const idCat    = document.getElementById('carr-cat-sel')?.value;

    if (!nombre || !ubicacion || !fecha) {
        showToast('error', '⚠ Nombre, ubicación y fecha son obligatorios');
        return;
    }

    const dto = { nombre, ubicacion, fecha, nivelDificultad: nivel || null, publico: publico || null, idCategoria: idCat ? parseInt(idCat) : null };

    try {
        await CarrerasAPI.registrar(dto);
        ['carr-nombre','carr-ubicacion','carr-fecha','carr-publico'].forEach(fid => {
            const el = document.getElementById(fid); if (el) el.value = '';
        });
        const nEl = document.getElementById('carr-nivel'); if (nEl) nEl.value = '';
        const sEl = document.getElementById('carr-cat-sel'); if (sEl) sEl.value = '';
        showToast('success', `✓ Carrera "${nombre}" registrada`);
        updateSidebar();
    } catch (err) {
        showToast('error', `⚠ ${err.message}`);
    }
}

/* ──────────────────────────────────────────────
   DETALLE / CONSULTAR CARRERA
   ────────────────────────────────────────────── */
async function consultarCarreraPorId() {
    const id  = document.getElementById('det-carrera-id')?.value.trim();
    const res = document.getElementById('det-carrera-result');
    if (!id || !res) return;

    try {
        // Cargar carrera, sus atletas y su categoría en paralelo
        const [carrera, atletas, categoria] = await Promise.all([
            CarrerasAPI.obtenerPorId(id),
            CarrerasAPI.consultarAtletas(id).catch(() => []),
            CarrerasAPI.consultarCategoria(id).catch(() => null)
        ]);

        res.style.display = 'block';
        res.innerHTML = buildCarreraDetail(carrera, atletas, categoria);
    } catch (_) {
        res.style.display = 'block';
        res.innerHTML = `<div class="card" style="border-color:var(--accent2);max-width:400px"><div style="color:var(--accent2)">Carrera no encontrada con ID <strong>${id}</strong></div></div>`;
    }
}

function buildCarreraDetail(c, atletas, categoria) {
    const atletasHTML = atletas.length === 0
        ? '<div style="color:var(--text-muted);font-size:13px;margin-top:8px">Sin atletas inscritos</div>'
        : `<div class="table-wrap" style="margin-top:12px"><table>
            <thead><tr><th>Nombre</th><th>ID</th><th>Género</th><th>Especialidad</th><th>Acción</th></tr></thead>
            <tbody>
              ${atletas.map(a => `
                <tr>
                  <td>${a.nombre}</td>
                  <td>${a.identificacion}</td>
                  <td>${a.genero}</td>
                  <td>${a.especialidad || '—'}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarAtletaDeCarrera(${c.id},'${a.identificacion}')">
                      <span class="material-icons-round" style="font-size:14px">person_remove</span>
                    </button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table></div>`;

    const catHTML = categoria
        ? `<div class="card" style="margin-top:16px;border-color:var(--accent3)">
            <div class="card-title"><span class="material-icons-round">category</span> Categoría</div>
            <div class="info-grid">
              <div class="info-item"><div class="info-item-label">Nombre</div><div class="info-item-value">${categoria.name || categoria.nombre || '—'}</div></div>
              <div class="info-item"><div class="info-item-label">Tipo</div><div class="info-item-value">${categoria.tipo || '—'}</div></div>
              <div class="info-item"><div class="info-item-label">Descripción</div><div class="info-item-value" style="font-size:13px">${categoria.descripcion || '—'}</div></div>
            </div>
           </div>`
        : '';

    return `
      <div class="detail-card">
        <div class="detail-avatar" style="background:rgba(0,212,255,0.15);border:2px solid var(--accent)">
          <span class="material-icons-round" style="font-size:36px;color:var(--accent)">flag</span>
        </div>
        <div class="detail-info">
          <div class="detail-name">${c.nombre}</div>
          <div class="detail-id">${c.ubicacion || '—'} | ${c.fecha || '—'}</div>
          <div class="detail-badges">
            ${c.nivelDificultad ? `<span class="badge badge-bike">★ Dificultad ${c.nivelDificultad}/5</span>` : ''}
            ${c.publico ? `<span class="badge badge-swim">${c.publico}</span>` : ''}
          </div>
          <div class="info-grid">
            <div class="info-item"><div class="info-item-label">ID</div><div class="info-item-value">${c.id}</div></div>
            <div class="info-item"><div class="info-item-label">Ubicación</div><div class="info-item-value">${c.ubicacion || '—'}</div></div>
            <div class="info-item"><div class="info-item-label">Fecha</div><div class="info-item-value">${c.fecha || '—'}</div></div>
            <div class="info-item"><div class="info-item-label">Atletas inscritos</div><div class="info-item-value" style="color:var(--accent3)">${atletas.length}</div></div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-title"><span class="material-icons-round">people</span> Atletas Inscritos</div>
        ${atletasHTML}
      </div>
      ${catHTML}`;
}

async function eliminarAtletaDeCarrera(idCarrera, idAtleta) {
    try {
        // Eliminar en ambos microservicios en paralelo
        await Promise.all([
            CarrerasAPI.eliminarAtleta(idCarrera, idAtleta),
            AtletasAPI.eliminarCarrera(idAtleta).catch(() => {})
        ]);
        showToast('success', 'Atleta retirado de la carrera');
        consultarCarreraPorId();
    } catch (err) {
        showToast('error', err.message);
    }
}

/* ──────────────────────────────────────────────
   MODIFICAR CARRERA
   ────────────────────────────────────────────── */
let modCarreraCurrentId = null;

async function cargarCarreraParaModificar() {
    const rawId = localStorage.getItem('mod_carrera_id') || document.getElementById('modcarr-search-id')?.value.trim();
    if (!rawId) return;
    const idNum = parseInt(rawId);
    try {
        const c = await CarrerasAPI.obtenerPorId(idNum);
        modCarreraCurrentId = c.id;
        const preview = document.getElementById('modcarr-preview');
        if (preview) {
            preview.style.display = 'block';
            preview.innerHTML = `
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px">
                <strong>${c.nombre}</strong>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${c.ubicacion || '—'} | ${c.fecha || '—'}</div>
              </div>`;
        }
        const formCard = document.getElementById('modcarr-form-card');
        if (formCard) formCard.style.display = 'block';
        const notFound = document.getElementById('modcarr-not-found');
        if (notFound) notFound.style.display = 'none';
    } catch (_) {
        modCarreraCurrentId = null;
        const notFound = document.getElementById('modcarr-not-found');
        if (notFound) notFound.style.display = 'block';
        const formCard = document.getElementById('modcarr-form-card');
        if (formCard) formCard.style.display = 'none';
    }
}

function showModCarreraField() {
    const campo    = document.getElementById('modcarr-campo')?.value;
    const wrap     = document.getElementById('modcarr-field-wrap');
    const inputArea= document.getElementById('modcarr-field-input');
    const label    = document.getElementById('modcarr-field-label');
    if (!campo) { if (wrap) wrap.style.display = 'none'; return; }
    if (wrap) wrap.style.display = 'block';
    if (campo === 'ubicacion') {
        label.textContent = 'Nueva Ubicación';
        inputArea.innerHTML = `<input type="text" class="form-control" id="modcarr-new-val" placeholder="Ciudad, País">`;
    } else if (campo === 'fecha') {
        label.textContent = 'Nueva Fecha';
        inputArea.innerHTML = `<input type="date" class="form-control" id="modcarr-new-val">`;
    }
}

async function aplicarModificacionCarrera() {
    const campo = document.getElementById('modcarr-campo')?.value;
    const val   = document.getElementById('modcarr-new-val')?.value.trim();
    if (!val || !modCarreraCurrentId) { showToast('error', 'Completa el campo y la búsqueda'); return; }
    try {
        if (campo === 'ubicacion') await CarrerasAPI.actualizarUbicacion(modCarreraCurrentId, val);
        if (campo === 'fecha')     await CarrerasAPI.actualizarFecha(modCarreraCurrentId, val);
        showToast('success', '✓ Carrera actualizada');
        cargarCarreraParaModificar();
    } catch (err) {
        showToast('error', err.message);
    }
}

/* ──────────────────────────────────────────────
   ELIMINAR CARRERA
   ────────────────────────────────────────────── */
function iniciarEliminacionCarrera(id, nombre) {
    document.getElementById('del-carr-confirm-msg').innerHTML = `¿Eliminar la carrera <strong>${nombre}</strong> (ID ${id})?`;
    document.getElementById('del-carr-confirm-btn').onclick = () => confirmarEliminacionCarrera(id);
    openModal('modal-delete-carrera');
}

async function confirmarEliminacionCarrera(id) {
    try {
        await CarrerasAPI.eliminar(id);
        closeModal('modal-delete-carrera');
        showToast('success', 'Carrera eliminada');
        renderListaCarreras();
        updateSidebar();
    } catch (err) {
        showToast('error', 'No se pudo eliminar');
    }
}
