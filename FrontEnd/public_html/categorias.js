/* =============================================
   TRIATLÓN GESTOR — categorias.js
   Lógica de todos los módulos de Categorías
   ============================================= */

/* ──────────────────────────────────────────────
   LISTA DE CATEGORÍAS
   ────────────────────────────────────────────── */
async function renderListaCategorias() {
    try {
        const categorias = await CategoriasAPI.listarTodas();
        const tbody = document.getElementById('cat-tbody');
        const empty = document.getElementById('cat-empty');
        if (!tbody) return;

        if (categorias.length === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        tbody.innerHTML = categorias.map(c => `
          <tr>
            <td><strong>${c.name || c.nombre || '—'}</strong></td>
            <td><span class="badge badge-swim">${c.tipo || '—'}</span></td>
            <td style="max-width:280px;font-size:13px;color:var(--text-muted)">${(c.descripcion || '').substring(0, 80)}${c.descripcion?.length > 80 ? '…' : ''}</td>
            <td style="max-width:220px;font-size:13px">${(c.recomendacion || '—').substring(0, 60)}${c.recomendacion?.length > 60 ? '…' : ''}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" title="Ver carreras" onclick="verCarrerasDeCategoria(${c.id}, '${(c.name || c.nombre || '').replace(/'/g,'\\\'')}')" >
                  <span class="material-icons-round" style="font-size:14px">directions_bike</span>
                </button>
                <button class="btn btn-ghost btn-sm" title="Modificar" onclick="prepararModCategoria(${c.id})">
                  <span class="material-icons-round" style="font-size:14px">edit</span>
                </button>
                <button class="btn btn-danger btn-sm" title="Eliminar" onclick="iniciarEliminacionCategoria(${c.id},'${(c.name || c.nombre || '').replace(/'/g,'\\\'') }')">
                  <span class="material-icons-round" style="font-size:14px">delete</span>
                </button>
              </div>
            </td>
          </tr>`).join('');
    } catch (err) {
        showToast('error', 'Error al cargar categorías');
    }
}

/* ──────────────────────────────────────────────
   REGISTRAR CATEGORÍA
   ────────────────────────────────────────────── */
async function registrarCategoria() {
    const name   = document.getElementById('cat-nombre')?.value.trim();
    const tipo   = document.getElementById('cat-tipo')?.value.trim();
    const desc   = document.getElementById('cat-desc')?.value.trim();
    const recom  = document.getElementById('cat-recom')?.value.trim();

    if (!name || !tipo || !desc) {
        showToast('error', '⚠ Nombre, tipo y descripción son obligatorios');
        return;
    }

    const dto = { name, tipo, descripcion: desc, recomendacion: recom || null };
    try {
        await CategoriasAPI.registrar(dto);
        ['cat-nombre','cat-tipo','cat-desc','cat-recom'].forEach(fid => {
            const el = document.getElementById(fid); if (el) el.value = '';
        });
        showToast('success', `✓ Categoría "${name}" registrada`);
        updateSidebar();
    } catch (err) {
        showToast('error', `⚠ ${err.message}`);
    }
}

/* ──────────────────────────────────────────────
   VER CARRERAS DE UNA CATEGORÍA (en modal inline)
   ────────────────────────────────────────────── */
async function verCarrerasDeCategoria(id, nombre) {
    const res = document.getElementById('cat-carreras-result');
    if (!res) return;
    try {
        const carreras = await CategoriasAPI.consultarCarreras(id);
        res.style.display = 'block';
        if (carreras.length === 0) {
            res.innerHTML = `<div class="card"><div class="card-title"><span class="material-icons-round">category</span> ${nombre}</div><div style="color:var(--text-muted)">Sin carreras registradas en esta categoría</div></div>`;
            return;
        }
        res.innerHTML = `
          <div class="card">
            <div class="card-title"><span class="material-icons-round">flag</span> Carreras de: ${nombre}</div>
            <div class="table-wrap"><table>
              <thead><tr><th>Nombre</th><th>Ubicación</th><th>Fecha</th><th>Dificultad</th><th>Acción</th></tr></thead>
              <tbody>
                ${carreras.map(c => `
                  <tr>
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.ubicacion || '—'}</td>
                    <td>${c.fecha || '—'}</td>
                    <td>${renderDificultad(c.nivelDificultad)}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" onclick="desvincularCarreraDeCategoria(${id},${c.id})">
                        <span class="material-icons-round" style="font-size:14px">link_off</span>
                      </button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table></div>
          </div>`;
    } catch (err) {
        showToast('error', 'Error al cargar carreras de la categoría');
    }
}

async function desvincularCarreraDeCategoria(idCat, idCarr) {
    try {
        // Eliminar en ambos microservicios en paralelo
        await Promise.all([
            CategoriasAPI.eliminarCarrera(idCat, idCarr),
            CarrerasAPI.eliminarCategoria(idCarr).catch(() => {})
        ]);
        showToast('success', 'Carrera desvinculada de la categoría');
        const res = document.getElementById('cat-carreras-result');
        if (res) res.innerHTML = '';
    } catch (err) {
        showToast('error', err.message);
    }
}

/* ──────────────────────────────────────────────
   MODIFICAR CATEGORÍA
   ────────────────────────────────────────────── */
let modCatCurrentId = null;

async function prepararModCategoria(id) {
    modCatCurrentId = id;
    try {
        const c = await CategoriasAPI.obtenerPorId(id);
        const panel = document.getElementById('cat-mod-panel');
        if (panel) {
            panel.style.display = 'block';
            panel.innerHTML = `
              <div class="card" style="border-color:var(--accent)">
                <div class="card-title"><span class="material-icons-round">edit</span> Modificar: ${c.name || c.nombre}</div>
                <div class="form-group">
                  <label class="form-label">Campo</label>
                  <select class="form-control" id="modcat-campo" onchange="showModCatField()">
                    <option value="">Seleccionar</option>
                    <option value="descripcion">Descripción</option>
                    <option value="recomendacion">Recomendación</option>
                  </select>
                </div>
                <div id="modcat-field-wrap" style="display:none">
                  <div class="form-group">
                    <label class="form-label" id="modcat-field-label">Nuevo valor</label>
                    <div id="modcat-field-input"></div>
                  </div>
                  <button class="btn btn-primary" onclick="aplicarModCategoria()">
                    <span class="material-icons-round">save</span> Guardar
                  </button>
                </div>
              </div>`;
        }
        // Scroll al panel
        panel?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showToast('error', 'No se pudo cargar la categoría');
    }
}

function showModCatField() {
    const campo    = document.getElementById('modcat-campo')?.value;
    const wrap     = document.getElementById('modcat-field-wrap');
    const label    = document.getElementById('modcat-field-label');
    const inputArea= document.getElementById('modcat-field-input');
    if (!campo) { if (wrap) wrap.style.display = 'none'; return; }
    if (wrap) wrap.style.display = 'block';
    if (campo === 'descripcion') {
        label.textContent = 'Nueva Descripción';
        inputArea.innerHTML = `<textarea class="form-control" id="modcat-new-val" rows="3" placeholder="Descripción de la categoría"></textarea>`;
    } else if (campo === 'recomendacion') {
        label.textContent = 'Nueva Recomendación';
        inputArea.innerHTML = `<textarea class="form-control" id="modcat-new-val" rows="3" placeholder="Recomendación para esta categoría"></textarea>`;
    }
}

async function aplicarModCategoria() {
    const campo = document.getElementById('modcat-campo')?.value;
    const val   = document.getElementById('modcat-new-val')?.value.trim();
    if (!val || !modCatCurrentId) { showToast('error', 'Completa el campo'); return; }
    try {
        if (campo === 'descripcion')   await CategoriasAPI.actualizarDescripcion(modCatCurrentId, val);
        if (campo === 'recomendacion') await CategoriasAPI.actualizarRecomendacion(modCatCurrentId, val);
        showToast('success', '✓ Categoría actualizada');
        const panel = document.getElementById('cat-mod-panel');
        if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
        renderListaCategorias();
    } catch (err) {
        showToast('error', err.message);
    }
}

/* ──────────────────────────────────────────────
   ELIMINAR CATEGORÍA
   ────────────────────────────────────────────── */
function iniciarEliminacionCategoria(id, nombre) {
    document.getElementById('del-cat-confirm-msg').innerHTML = `¿Eliminar categoría <strong>${nombre}</strong> (ID ${id})?`;
    document.getElementById('del-cat-confirm-btn').onclick = () => confirmarEliminacionCategoria(id);
    openModal('modal-delete-categoria');
}

async function confirmarEliminacionCategoria(id) {
    try {
        await CategoriasAPI.eliminar(id);
        closeModal('modal-delete-categoria');
        showToast('success', 'Categoría eliminada');
        renderListaCategorias();
        updateSidebar();
    } catch (err) {
        showToast('error', 'No se pudo eliminar');
    }
}
