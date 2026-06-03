/* =============================================
   TRIATLÓN GESTOR — app.js
   Navegación, helpers y toast
   ============================================= */

/* ──────────────────────────────────────────────
   Navegación entre páginas
   ────────────────────────────────────────────── */
function showPage(name) {
    const pages = {
        dashboard:       'dashboard.html',
        // Atletas
        reg_atleta:      'registrar.html',
        lista_atletas:   'lista.html',
        consulta_atleta: 'consulta.html',
        modificar_atleta:'modificar.html',
        grupos_atletas:  'grupos.html',
        eliminar_atleta: 'eliminar.html',
        carrera_atleta:  'inscribir_atleta.html',
        // Carreras
        lista_carreras:  'lista_carreras.html',
        reg_carrera:     'registrar_carrera.html',
        detalle_carrera: 'detalle_carrera.html',
        modificar_carrera:'modificar_carrera.html',
        // Categorias
        lista_categorias:'lista_categorias.html',
        reg_categoria:   'registrar_categoria.html',
        modificar_categoria:'modificar_categoria.html',
    };
    if (pages[name]) window.location.href = pages[name];
}

/* ──────────────────────────────────────────────
   Toast
   ────────────────────────────────────────────── */
function showToast(type, msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const icons = { success: 'check_circle', error: 'error', info: 'info', warn: 'warning' };
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="material-icons-round" style="font-size:18px">${icons[type] || 'info'}</span>${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

/* ──────────────────────────────────────────────
   Modal
   ────────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

/* ──────────────────────────────────────────────
   Helpers visuales
   ────────────────────────────────────────────── */
function getAvatarClass(gen) { return gen === 'M' ? 'avatar-blue' : 'avatar-red'; }

function getSpecBadge(spec) {
    const map = {
        'Sprint': 'badge-bike', 'Olímpico': 'badge-swim', 'Estándar': 'badge-swim',
        'Media Distancia': 'badge-run', 'Ironman': 'badge-full'
    };
    return map[spec] || '';
}

function buildAthleteDetail(a) {
    const icons = { Sprint: '🏃', 'Olímpico': '🏊', 'Estándar': '🏊', 'Media Distancia': '🚴', Ironman: '🔥' };
    const icon = icons[a.especialidad] || '🏅';
    return `
    <div class="detail-card">
      ${a.foto ? `<img src="${a.foto}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)">` : `<div class="detail-avatar">${(a.nombre||'?')[0]}</div>`}
      <div class="detail-info">
        <div class="detail-name">${a.nombre}</div>
        <div class="detail-id">ID: ${a.identificacion} | ${a.correo || 'Sin correo'}</div>
        <div class="detail-badges">
          <span class="badge ${a.genero === 'M' ? 'badge-m' : 'badge-f'}">${a.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
          <span class="badge badge-swim">${a.categoria || '—'}</span>
          <span class="badge ${getSpecBadge(a.especialidad)}">${icon} ${a.especialidad || '—'}</span>
          ${a.modalidadCross ? '<span class="badge badge-cross">Cross</span>' : ''}
        </div>
        <div class="info-grid">
          <div class="info-item"><div class="info-item-label">Edad</div><div class="info-item-value">${a.edad} años</div></div>
          <div class="info-item"><div class="info-item-label">Género</div><div class="info-item-value">${a.genero === 'M' ? 'Masculino' : 'Femenino'}</div></div>
          <div class="info-item"><div class="info-item-label">Categoría</div><div class="info-item-value">${a.categoria || '—'}</div></div>
          <div class="info-item"><div class="info-item-label">Especialidad</div><div class="info-item-value">${a.especialidad || '—'}</div></div>
          <div class="info-item"><div class="info-item-label">Cross</div><div class="info-item-value" style="color:${a.modalidadCross ? 'var(--accent3)' : 'var(--text-muted)'}">${a.modalidadCross ? 'Sí' : 'No'}</div></div>
          ${a.idCarrera ? `<div class="info-item"><div class="info-item-label">ID Carrera</div><div class="info-item-value">${a.idCarrera}</div></div>` : ''}
        </div>
      </div>
    </div>`;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.readAsDataURL(file);
        r.onload = () => resolve(r.result);
        r.onerror = e => reject(e);
    });
}

/* ──────────────────────────────────────────────
   Carrusel especialidades (registrar.html)
   ────────────────────────────────────────────── */
let carouselIndex = 0;
let selectedSpec  = '';

function moveCarousel(dir) {
    const total = 4;
    carouselIndex = (carouselIndex + dir + total) % total;
    updateCarouselUI();
}
function goSlide(i) { carouselIndex = i; updateCarouselUI(); }
function updateCarouselUI() {
    const track = document.getElementById('spec-track');
    if (track) track.style.transform = `translateX(-${carouselIndex * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}
function selectSpec(i, name) {
    selectedSpec = name;
    const inp = document.getElementById('reg-spec');
    if (inp) inp.value = name;
    document.querySelectorAll('.specialty-card').forEach((c, j) => c.classList.toggle('selected', j === i));
    showToast('success', `Especialidad: ${name}`);
}

/* ──────────────────────────────────────────────
   Cross toggle visual (registrar.html)
   ────────────────────────────────────────────── */
function toggleCrossLabel() {
    const yes = document.getElementById('cross-yes')?.checked;
    const yL  = document.getElementById('cross-yes-label');
    const nL  = document.getElementById('cross-no-label');
    if (!yL || !nL) return;
    yL.style.borderColor = yes  ? 'var(--accent)'  : 'var(--border)';
    yL.style.color       = yes  ? 'var(--accent)'  : '';
    nL.style.borderColor = !yes ? 'var(--accent2)' : 'var(--border)';
    nL.style.color       = !yes ? 'var(--accent2)' : '';
}

/* ──────────────────────────────────────────────
   Sidebar counter – Promise.all para cargar en paralelo
   ────────────────────────────────────────────── */
async function updateSidebar() {
    try {
        const [atletas, carreras, categorias] = await Promise.all([
            AtletasAPI.listarTodos().catch(() => []),
            CarrerasAPI.listarTodas().catch(() => []),
            CategoriasAPI.listarTodas().catch(() => [])
        ]);
        const el = document.getElementById('sidebar-count');
        const cr = document.getElementById('sidebar-carreras');
        const ca = document.getElementById('sidebar-cats');
        if (el) el.textContent = atletas.length;
        if (cr) cr.textContent = carreras.length;
        if (ca) ca.textContent = categorias.length;
    } catch (_) {}
}

/* ──────────────────────────────────────────────
   Init por página
   ────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', async () => {
    await updateSidebar();
    const path = window.location.pathname;

    if (path.includes('dashboard.html'))         updateDashboard();
    if (path.includes('lista.html'))             renderListaAtletas();
    if (path.includes('lista_carreras.html'))     renderListaCarreras();
    if (path.includes('lista_categorias.html'))   renderListaCategorias();
    if (path.includes('consulta.html')) {
        const id = localStorage.getItem('view_athlete_id');
        if (id) { document.getElementById('consulta-id').value = id; consultarAtletaPorId(); localStorage.removeItem('view_athlete_id'); }
    }
    if (path.includes('detalle_carrera.html')) {
        const id = localStorage.getItem('view_carrera_id');
        if (id) { document.getElementById('det-carrera-id').value = id; consultarCarreraPorId(); localStorage.removeItem('view_carrera_id'); }
    }
});
