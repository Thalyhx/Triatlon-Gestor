// Navegación entre páginas del frontend
var PAGINAS = {
    dashboard:        'dashboard.html',
    reg_atleta:       'registrar.html',
    lista_atletas:    'lista.html',
    consulta_atleta:  'consulta.html',
    modificar_atleta: 'modificar.html',
    grupos_atletas:   'grupos.html',
    eliminar_atleta:  'eliminar.html',
    carrera_atleta:   'inscribir_atleta.html',
    lista_carreras:   'lista_carreras.html',
    reg_carrera:      'registrar_carrera.html',
    detalle_carrera:  'detalle_carrera.html',
    modificar_carrera:'modificar_carrera.html',
    lista_categorias: 'lista_categorias.html',
    reg_categoria:    'registrar_categoria.html'
};

function showPage(nombre) {
    if (PAGINAS[nombre]) {
        window.location.href = PAGINAS[nombre];
    }
}

// Muestra un mensaje flotante (toast) en la esquina
function showToast(tipo, mensaje) {
    var contenedor = document.getElementById('toast-container');
    if (!contenedor) return;

    var iconos = { success: 'check_circle', error: 'error', info: 'info', warn: 'warning' };
    var div = document.createElement('div');
    div.className = 'toast ' + tipo;
    div.innerHTML = '<span class="material-icons-round" style="font-size:18px">' + (iconos[tipo] || 'info') + '</span>' + mensaje;
    contenedor.appendChild(div);

    setTimeout(function() { div.remove(); }, 3500);
}

// Abrir y cerrar modales de confirmación
function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

// Devuelve la clase CSS del avatar según género
function claseAvatar(genero) {
    return esMasculino(genero) ? 'avatar-blue' : 'avatar-red';
}

// Detecta masculino sin importar si llega 'M', 'm', 'Masculino', 'MALE', etc.
function esMasculino(genero) {
    if (!genero) return false;
    var g = genero.toString().toUpperCase().trim();
    return g === 'M' || g === 'MASCULINO' || g === 'MALE';
}

function textoGenero(genero) {
    return esMasculino(genero) ? 'Masculino' : 'Femenino';
}

function badgeGenero(genero) {
    return esMasculino(genero) ? 'badge-m' : 'badge-f';
}

// Devuelve la clase del badge según especialidad
function badgeEspecialidad(esp) {
    if (esp === 'Sprint') return 'badge-bike';
    if (esp === 'Olímpico' || esp === 'Estándar') return 'badge-swim';
    if (esp === 'Media Distancia') return 'badge-run';
    if (esp === 'Ironman') return 'badge-full';
    return '';
}

// Construye el bloque HTML de detalle de un atleta
function buildAthleteDetail(a) {
    var iconos = { 'Sprint': '🏃', 'Olímpico': '🏊', 'Estándar': '🏊', 'Media Distancia': '🚴', 'Ironman': '🔥' };
    var icono = iconos[a.especialidad] || '🏅';
    var avatar = a.foto
        ? '<img src="' + a.foto + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)">'
        : '<div class="detail-avatar">' + (a.nombre || '?')[0] + '</div>';

    var crossColor = a.modalidadCross ? 'var(--accent3)' : 'var(--text-muted)';
    var carreraFila = a.idCarrera
        ? '<div class="info-item"><div class="info-item-label">ID Carrera</div><div class="info-item-value">' + a.idCarrera + '</div></div>'
        : '';

    return '<div class="detail-card">' +
        avatar +
        '<div class="detail-info">' +
            '<div class="detail-name">' + a.nombre + '</div>' +
            '<div class="detail-id">ID: ' + a.identificacion + ' | ' + (a.correo || 'Sin correo') + '</div>' +
            '<div class="detail-badges">' +
                '<span class="badge ' + badgeGenero(a.genero) + '">' + textoGenero(a.genero) + '</span>' +
                '<span class="badge badge-swim">' + (a.categoria || '—') + '</span>' +
                '<span class="badge ' + badgeEspecialidad(a.especialidad) + '">' + icono + ' ' + (a.especialidad || '—') + '</span>' +
                (a.modalidadCross ? '<span class="badge badge-cross">Cross</span>' : '') +
            '</div>' +
            '<div class="info-grid">' +
                '<div class="info-item"><div class="info-item-label">Edad</div><div class="info-item-value">' + a.edad + ' años</div></div>' +
                '<div class="info-item"><div class="info-item-label">Género</div><div class="info-item-value">' + textoGenero(a.genero) + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Categoría</div><div class="info-item-value">' + (a.categoria || '—') + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Especialidad</div><div class="info-item-value">' + (a.especialidad || '—') + '</div></div>' +
                '<div class="info-item"><div class="info-item-label">Cross</div><div class="info-item-value" style="color:' + crossColor + '">' + (a.modalidadCross ? 'Sí' : 'No') + '</div></div>' +
                carreraFila +
            '</div>' +
        '</div>' +
    '</div>';
}

// Redimensiona imagen y la convierte a base64 comprimida (max 80x80, calidad 0.4)
// para que quepa en el VARCHAR(255) del backend
function fileToBase64(archivo) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.readAsDataURL(archivo);
        reader.onload = function() {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var MAX = 80;
                var w = img.width;
                var h = img.height;
                if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                else        { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                canvas.width  = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.4));
            };
            img.onerror = function() { reject(new Error('imagen inválida')); };
            img.src = reader.result;
        };
        reader.onerror = function(e) { reject(e); };
    });
}

// ---- Carrusel de especialidades ----
var carouselIndex = 0;
var selectedSpec = '';

function moveCarousel(dir) {
    carouselIndex = (carouselIndex + dir + 4) % 4;
    actualizarCarrusel();
}

function goSlide(i) {
    carouselIndex = i;
    actualizarCarrusel();
}

function actualizarCarrusel() {
    var track = document.getElementById('spec-track');
    if (track) track.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';

    var dots = document.querySelectorAll('.dot');
    for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === carouselIndex);
    }
}

function selectSpec(i, nombre) {
    selectedSpec = nombre;
    var inp = document.getElementById('reg-spec');
    if (inp) inp.value = nombre;

    var tarjetas = document.querySelectorAll('.specialty-card');
    for (var j = 0; j < tarjetas.length; j++) {
        tarjetas[j].classList.toggle('selected', j === i);
    }
    showToast('success', 'Especialidad: ' + nombre);
}

// Resalta la etiqueta del radio de cross seleccionado
function toggleCrossLabel() {
    var yesChecked = document.getElementById('cross-yes') && document.getElementById('cross-yes').checked;
    var yL = document.getElementById('cross-yes-label');
    var nL = document.getElementById('cross-no-label');
    if (!yL || !nL) return;
    yL.style.borderColor = yesChecked ? 'var(--accent)'  : 'var(--border)';
    yL.style.color       = yesChecked ? 'var(--accent)'  : '';
    nL.style.borderColor = !yesChecked ? 'var(--accent2)' : 'var(--border)';
    nL.style.color       = !yesChecked ? 'var(--accent2)' : '';
}

// Actualiza los contadores del sidebar en paralelo
function updateSidebar() {
    Promise.all([
        getAtletas().catch(function() { return []; }),
        getCarreras().catch(function() { return []; }),
        getCategorias().catch(function() { return []; })
    ]).then(function(resultados) {
        var atletas    = resultados[0];
        var carreras   = resultados[1];
        var categorias = resultados[2];

        var elAtletas = document.getElementById('sidebar-count');
        var elCarreras = document.getElementById('sidebar-carreras');
        var elCats = document.getElementById('sidebar-cats');

        if (elAtletas)  elAtletas.textContent  = atletas.length;
        if (elCarreras) elCarreras.textContent  = carreras.length;
        if (elCats)     elCats.textContent      = categorias.length;
    }).catch(function() {});
}

// Inicialización al cargar cada página
window.addEventListener('DOMContentLoaded', function() {
    updateSidebar();

    var path = window.location.pathname;

    if (path.includes('dashboard.html'))       updateDashboard();
    if (path.includes('lista.html'))           renderListaAtletas();
    if (path.includes('lista_carreras.html'))  renderListaCarreras();
    if (path.includes('lista_categorias.html'))renderListaCategorias();

    if (path.includes('consulta.html')) {
        var idAtleta = localStorage.getItem('view_athlete_id');
        if (idAtleta) {
            document.getElementById('consulta-id').value = idAtleta;
            consultarAtletaPorId();
            localStorage.removeItem('view_athlete_id');
        }
    }

    if (path.includes('detalle_carrera.html')) {
        var idCarrera = localStorage.getItem('view_carrera_id');
        if (idCarrera) {
            document.getElementById('det-carrera-id').value = idCarrera;
            consultarCarreraPorId();
            localStorage.removeItem('view_carrera_id');
        }
    }

    if (path.includes('modificar_carrera.html')) {
        cargarCarreraParaModificar();
    }

    if (path.includes('inscribir_atleta.html')) {
        cargarSelectCarreras();
    }

    if (path.includes('registrar_carrera.html')) {
        cargarSelectCategorias();
    }
});
