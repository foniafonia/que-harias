/* ¿Qué harías? · interfaz: bloques, situaciones que corrigen y explican, reto mezclado,
   técnicas, guía, modo clase, fichas, adaptaciones, contadores anónimos, abeja de mejoras y puente a ColmenIA. */
(function () {
'use strict';
var B = window.BLOQUES, T = window.TECNICAS, EMO = window.EMOCIONES;
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function baraja(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
function bloque(id) { for (var i = 0; i < B.length; i++) if (B[i].id === id) return B[i]; return null; }

/* ===================== Contadores (abacus, anónimos) ===================== */
var Q = new URLSearchParams(location.search);
var CANAL = (Q.get('c') || '').replace(/[^a-z]/gi, '').slice(0, 6).toLowerCase();
if (CANAL) ls('qh-canal', CANAL); else CANAL = ls('qh-canal') || '';
var NO_CONTAR = Q.get('yo') === '1';
if (NO_CONTAR) ls('qh-no-contar', '1'); if (ls('qh-no-contar')) NO_CONTAR = true;
var CB = 'https://abacus.jasoncameron.dev/hit/foniafonia-harias/';
function cuenta(k) {
  if (NO_CONTAR) return;
  k = String(k).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 60);
  try {
    new Image().src = CB + 'qh_' + k;
    if (CANAL && /^(aperturas|personas|skool$|juega$|acaba$|desbloquea$)/.test(k)) new Image().src = CB + 'qh_c_' + CANAL + '_' + k;
  } catch (e) {}
}
cuenta('aperturas');
if (!ls('qh-visto')) { ls('qh-visto', '1'); cuenta('personas'); }

/* ===================== Llave de ColmenIA =====================
   Abierto: 2 situaciones de cada bloque, técnicas y guía. Con llave: todo.
   Aquí solo la huella de la llave. Para cambiarla, añade fnv(normaliza('nueva')) a CLAVES. */
var CLAVES = [3994850518];
var LIBRES = 2;
function normaliza(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''); }
function fnv(t) { var x = 2166136261; for (var i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x; }
function claveBuena(t) { return CLAVES.indexOf(fnv(normaliza(t))) >= 0; }
var COMO_VISITA = Q.get('como') === 'visitante';
var dentro = !COMO_VISITA && (!!ls('qh-llave') || NO_CONTAR);
if (!dentro && !COMO_VISITA && Q.get('k') && claveBuena(Q.get('k'))) { ls('qh-llave', '1'); dentro = true; cuenta('desbloquea'); cuenta('desbloquea_enlace'); }
var MOTIVOS = { bloque: 'Las 6 situaciones del bloque', mezcla: 'El reto mezclado', clase: 'El modo clase', fichas: 'Las fichas', adaptar: 'Las adaptaciones', portada: 'Todo abierto' };
var tras = null;
function candado(motivo, luego) {
  if (dentro) return false;
  tras = luego || null;
  $('candTit').textContent = MOTIVOS[motivo] || 'Todo';
  $('claveMsg').textContent = ''; abre('mCandado'); setTimeout(function () { $('clave').focus(); }, 50);
  cuenta('candado_' + motivo);
  return true;
}
function pruebaClave() {
  if (claveBuena($('clave').value)) {
    if (!COMO_VISITA) ls('qh-llave', '1'); dentro = true; cuenta('desbloquea'); cuenta('desbloquea_clave');
    $('claveMsg').style.color = 'var(--bien)'; $('claveMsg').textContent = '¡Dentro! Ya lo tienes todo abierto.';
    setTimeout(function () { cierra('mCandado'); pintaBloques(); toast('¿Qué harías? abierto entero 🐝'); var f = tras; tras = null; if (f) f(); }, 600);
  } else { cuenta('clave_mal'); $('claveMsg').style.color = ''; $('claveMsg').textContent = 'Esa no es. Está en ColmenIA › Cursos › Material a medida › ¿Qué harías?'; }
}
$('bClave').addEventListener('click', pruebaClave);
$('clave').addEventListener('keydown', function (e) { if (e.key === 'Enter') pruebaClave(); });
$('candCierra').addEventListener('click', function () { cierra('mCandado'); });

/* ===================== Modales y avisos ===================== */
var ultimoFoco = null;
function abre(id) { ultimoFoco = document.activeElement; $(id).classList.remove('oculto'); }
function cierra(id) { $(id).classList.add('oculto'); if (ultimoFoco && ultimoFoco.focus) try { ultimoFoco.focus(); } catch (e) {} }
['mCandado', 'mAdapta', 'mFichas', 'mAbeja'].forEach(function (id) { $(id).addEventListener('click', function (e) { if (e.target === $(id)) cierra(id); }); });
document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; ['mCandado', 'mAdapta', 'mFichas', 'mAbeja'].forEach(function (id) { if (!$(id).classList.contains('oculto')) cierra(id); }); });
var tToast = 0;
function toast(t) { var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.appendChild(d); clearTimeout(tToast); tToast = setTimeout(function () { d.remove(); }, 2600); }

/* ===================== Puente a ColmenIA ===================== */
var SK = 'https://www.skool.com/logopedia-7339/about';   // portada: nunca con ?c=
function puentes(raiz) {
  (raiz || document).querySelectorAll('a[data-sk]').forEach(function (a) {
    if (a.dataset.skOk) return; a.dataset.skOk = '1'; a.href = SK;
    a.addEventListener('click', function () { cuenta('skool'); cuenta('skool_' + a.getAttribute('data-sk')); });
  });
}
function bloquePuente(lugar) {
  return '<div class="puente" style="margin-top:14px;text-align:left"><div class="logos"><img src="img/colmenia-logo.webp" alt="ColmenIA"><img src="img/logo-fonia.jpg" alt="Gabinete Fönia"></div>' +
    '<b>¿Te ha servido? En ColmenIA hay más</b><p>Ahí está la llave para abrirlo entero, y puedes pedir situaciones de tu clase o material a medida. Docentes, PT, AL y logopedas compartiendo.</p>' +
    '<a class="btn oro" data-sk="' + lugar + '" target="_blank" rel="noopener">Entrar en ColmenIA</a></div>';
}

/* ===================== Vistas ===================== */
var VISTAS = ['inicio', 'juego', 'tecnicas', 'guia'];
function vista(v) {
  VISTAS.forEach(function (n) { $('v-' + n).classList.toggle('oculto', n !== v); });
  document.querySelectorAll('nav.pest [data-ir]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.ir === v || (v === 'juego' && b.dataset.ir === 'inicio') ? 'true' : 'false'); });
  callar();
  window.scrollTo(0, 0);
  if (v !== 'juego') cuenta('ve_' + v);
}
document.addEventListener('click', function (e) {
  var g = e.target.closest('[data-ir]'); if (g) { vista(g.dataset.ir); return; }
  var j = e.target.closest('[data-juega]'); if (j) { empieza(j.dataset.juega); }
});

/* ===================== Bloques ===================== */
function pintaBloques() {
  var h = B.map(function (b) {
    return '<button class="bloque" type="button" data-juega="' + b.id + '" style="--c:' + b.color + '"><span class="bt"><img src="img/pictos/' + b.picto + '.png" alt=""><b>' + b.ico + ' ' + esc(b.nombre) + '</b></span><p>' + esc(b.intro) + '</p>' +
      '<span class="meta">' + (dentro ? b.items.length + ' situaciones' : LIBRES + ' abiertas · ' + b.items.length + ' con la llave 🔑') + '</span></button>';
  }).join('');
  h += '<button class="bloque mezcla" type="button" data-juega="mezcla" style="--c:#FF7A59"><span class="bt"><img src="img/pictos/abrazo.png" alt=""><b>🎲 Reto mezclado</b></span><p>10 situaciones al azar de todos los bloques. Para repasar o para un día de tutoría sin preparar.</p><span class="meta">' + (dentro ? 'Listo para jugar' : 'Con la llave 🔑') + '</span></button>';
  $('bloques').innerHTML = h;
}

/* ===================== Adaptaciones ===================== */
var AJ_DEF = { pictos: true, unPaso: false, expl: false, voz: false, grande: false, muygrande: false, atk: false, mayus: false, contraste: false };
var PERFILES = {
  tea: { pictos: true, unPaso: true, expl: true },
  tdah: { unPaso: true, grande: true },
  tdl: { pictos: true, voz: true, grande: true },
  dislexia: { atk: true, grande: true, voz: true },
  vision: { muygrande: true, contraste: true },
  inicial: { pictos: true, voz: true, grande: true, unPaso: true, mayus: true },
  nada: {}
};
var AJ = AJ_DEF;
try { AJ = Object.assign({}, AJ_DEF, JSON.parse(ls('qh-aj') || '{}')); } catch (e) { AJ = Object.assign({}, AJ_DEF); }
if (!dentro) AJ = Object.assign({}, AJ_DEF);
function aplicaAjustes() {
  var c = document.body.classList;
  c.toggle('sinpictos', !AJ.pictos); c.toggle('grande', AJ.grande && !AJ.muygrande); c.toggle('muygrande', AJ.muygrande);
  c.toggle('atk', AJ.atk); c.toggle('mayus', AJ.mayus); c.toggle('contraste', AJ.contraste);
  $('mAdapta').querySelectorAll('[data-a]').forEach(function (i) { i.checked = !!AJ[i.dataset.a]; });
  $('bAdapta').setAttribute('aria-pressed', Object.keys(AJ).some(function (k) { return k !== 'pictos' && AJ[k]; }) ? 'true' : 'false');
}
function guardaAjustes() { ls('qh-aj', JSON.stringify(AJ)); aplicaAjustes(); if (!$('v-juego').classList.contains('oculto') && J && !J.fin) pintaSit(); }
$('bAdapta').addEventListener('click', function () { if (candado('adaptar', function () { abre('mAdapta'); })) return; abre('mAdapta'); cuenta('adapta_abre'); });
$('perfiles').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (!b) return; AJ = Object.assign({}, AJ_DEF, PERFILES[b.dataset.p]); cuenta('adapta_' + b.dataset.p); guardaAjustes(); });
$('mAdapta').addEventListener('change', function (e) { var c = e.target.closest('[data-a]'); if (!c) return; AJ[c.dataset.a] = c.checked; if (c.dataset.a === 'muygrande' && c.checked) AJ.grande = false; cuenta('adapta_' + c.dataset.a + (c.checked ? '_si' : '_no')); guardaAjustes(); });
$('adCierra').addEventListener('click', function () { cierra('mAdapta'); });
$('adOk').addEventListener('click', function () { cierra('mAdapta'); });

/* ===================== Voz ===================== */
var VOZ = null;
function eligeVoz() { try { var v = speechSynthesis.getVoices(); VOZ = v.filter(function (x) { return /^es(-|_)ES/i.test(x.lang); })[0] || v.filter(function (x) { return /^es/i.test(x.lang); })[0] || null; } catch (e) {} }
if ('speechSynthesis' in window) { eligeVoz(); speechSynthesis.onvoiceschanged = eligeVoz; }
function lee(t) { if (!('speechSynthesis' in window)) return; callar(); var u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; if (VOZ) u.voice = VOZ; u.rate = 0.95; speechSynthesis.speak(u); }
function callar() { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {} }
document.addEventListener('visibilitychange', function () { if (document.hidden) { callar(); paraCrono(); } });

/* ===================== Juego ===================== */
var J = null;
var RETOS = {
  conversa: 'Esta semana, pregunta a tres personas por algo suyo y escucha la respuesta sin interrumpir.',
  indirectas: 'Apunta dos frases que oigas esta semana que digan una cosa y signifiquen otra.',
  emociones: 'Cada noche, pon nombre a la emoción más fuerte que has sentido ese día.',
  conflictos: 'Si discutes con alguien, prueba el mensaje yo: «Cuando…, me siento…, me gustaría…».',
  no: 'Di que no a algo que no quieras hacer, con calma y sin dar mil explicaciones.',
  ayuda: 'Da las gracias de verdad a alguien que te haya ayudado, mirándole a los ojos.',
  redes: 'Antes de enviar un mensaje enfadado, espera diez minutos y vuelve a leerlo.',
  equipo: 'Invita a alguien con quien no sueles estar a sumarse a tu grupo en el recreo o en un trabajo.',
  mezcla: 'Elige la técnica que más te ha servido y úsala una vez esta semana.'
};
function empieza(id) {
  var lista, nombre, color;
  if (id === 'mezcla') {
    if (candado('mezcla', function () { empieza('mezcla'); })) return;
    lista = []; B.forEach(function (b) { b.items.forEach(function (it, i) { lista.push({ b: b, it: it, i: i }); }); });
    lista = baraja(lista).slice(0, 10); nombre = 'Reto mezclado'; color = '#FF7A59';
  } else {
    var b = bloque(id); if (!b) return;
    lista = b.items.map(function (it, i) { return { b: b, it: it, i: i }; });
    if (!dentro) lista = lista.slice(0, LIBRES);
    nombre = b.nombre; color = b.color;
  }
  J = { id: id, nombre: nombre, color: color, lista: lista, n: 0, pts: 0, est: { a: 0, p: 0, g: 0 }, resp: null, verOps: false, fin: false, orden: null };
  vista('juego'); cuenta('juega'); cuenta('juega_' + id);
  pintaSit();
}
function letra(i) { return 'ABC'[i]; }
function pintaSit() {
  var x = J.lista[J.n], it = x.it, b = x.b;
  if (!J.orden) J.orden = baraja([0, 1, 2]);
  var hecha = J.resp !== null;
  var mostrarOps = !AJ.unPaso || J.verOps || hecha || document.body.classList.contains('pizarra');
  var h = '<div class="sit" style="--c:' + b.color + '">' +
    '<div class="top"><span class="etq" style="background:' + b.color + '">' + b.ico + ' ' + esc(J.id === 'mezcla' ? b.nombre : J.nombre) + '</span><span class="prog">' + (J.n + 1) + ' de ' + J.lista.length + '</span></div>' +
    '<div class="barra"><i style="width:' + Math.round(J.n / J.lista.length * 100) + '%"></i></div>' +
    '<div class="cuerpo">' + (it.e ? '<div class="emo"><img src="img/pictos/' + it.e + '.png" alt="">' + esc(EMO[it.e] || '') + '</div>' : '') +
    '<div style="flex:1"><h3>' + esc(it.t) + '</h3><p class="txt">' + esc(it.s) + '</p><p class="preg">' + esc(it.p) + '</p></div></div>';
  if (mostrarOps) {
    h += '<div class="ops">' + J.orden.map(function (oi, k) {
      var o = it.o[oi], cls = 'op n' + o[1];
      var ver = hecha && (oi === J.resp || AJ.expl || J.todas);
      if (ver) cls += ' vista'; if (oi === J.resp) cls += ' elegida';
      return '<button class="' + cls + '" type="button" data-op="' + oi + '"' + (hecha ? ' disabled' : '') + '><span class="letra">' + letra(k) + '</span><span class="ot">' + esc(o[0]) +
        (ver ? '<span class="exp">' + etiquetas(o) + esc(o[2]) + '</span>' : '') + '</span></button>';
    }).join('') + '</div>';
    if (!hecha) h += '<p class="voto">✋ Votad: 1 dedo = A · 2 dedos = B · 3 dedos = C <button class="btn sec peq" type="button" id="bCrono">⏱️ 30 s para pensar</button> <span class="crono" id="crono"></span></p>';
  } else {
    h += '<div class="verops"><button class="btn coral" type="button" id="bVerOps">Ver las respuestas</button></div>';
  }
  if (hecha) {
    var o = it.o[J.resp];
    h += '<div class="resp n' + o[1] + '" role="status">' + (o[1] === 2 ? '✅ ¡Buena elección!' : o[1] === 1 ? '🤔 Se puede mejorar.' : '❌ Mejor no.') + ' ' + esc(o[2]) + '</div>';
    if (!AJ.expl && !J.todas) h += '<p style="margin:10px 0 0"><button class="btn sec peq" type="button" id="bTodas">Ver por qué las otras sí o no</button></p>';
    if (it.d) h += '<div class="debate">💬 <b>Para hablar en grupo:</b> ' + esc(it.d) + '</div>';
  }
  h += '<div class="acciones"><span class="fila"><button class="btn sec peq" type="button" id="bLee">🔊 Escuchar</button><button class="btn sec peq" type="button" data-ir="inicio">← Bloques</button></span>' +
    (hecha ? '<button class="btn coral" type="button" id="bSig">' + (J.n + 1 < J.lista.length ? 'Siguiente →' : 'Terminar ✓') + '</button>' : '') + '</div></div>';
  $('juego').innerHTML = h;
  puentes($('juego'));
  if (AJ.voz && !hecha) leeSit();
  var f = hecha ? $('bSig') : ($('bVerOps') || $('juego').querySelector('.op'));
  if (f) try { f.focus({ preventScroll: true }); } catch (e) {}
}
function etiquetas(o) {
  var n = o[1] === 2 ? 'Buena idea' : o[1] === 1 ? 'Se puede mejorar' : 'Mejor no';
  var e = o[3] === 'a' ? 'asertiva' : o[3] === 'p' ? 'pasiva' : o[3] === 'g' ? 'agresiva' : '';
  return '<span class="nota n' + o[1] + '">' + n + '</span>' + (e ? '<span class="estilo ' + o[3] + '">' + e + '</span>' : '');
}
function leeSit() {
  var it = J.lista[J.n].it;
  var t = it.t + '. ' + it.s + ' ' + it.p;
  if (J.resp === null && (!AJ.unPaso || J.verOps)) t += ' ' + J.orden.map(function (oi, k) { return letra(k) + ': ' + it.o[oi][0]; }).join(' ');
  if (J.resp !== null) t = it.o[J.resp][2];
  lee(t);
}
$('juego').addEventListener('click', function (e) {
  if (!J) return;
  var op = e.target.closest('[data-op]');
  if (op && J.resp === null) {
    paraCrono();
    var oi = +op.dataset.op, o = J.lista[J.n].it.o[oi];
    J.resp = oi; J.pts += o[1]; if (o[3]) J.est[o[3]]++;
    cuenta('responde'); cuenta('responde_' + o[1]);
    pintaSit(); if (AJ.voz) leeSit(); return;
  }
  if (e.target.closest('#bVerOps')) { J.verOps = true; pintaSit(); return; }
  if (e.target.closest('#bTodas')) { J.todas = true; cuenta('ve_todas'); pintaSit(); return; }
  if (e.target.closest('#bLee')) { leeSit(); cuenta('leer'); return; }
  if (e.target.closest('#bCrono')) { crono(30); cuenta('crono'); return; }
  if (e.target.closest('#bSig')) { callar(); siguiente(); return; }
  if (e.target.closest('[data-fin-mas]')) { if (candado('bloque', function () { empieza(J.id); })) return; }
  if (e.target.closest('[data-otra]')) { empieza(J.id); return; }
});
function siguiente() {
  if (J.n + 1 < J.lista.length) { J.n++; J.resp = null; J.verOps = false; J.todas = false; J.orden = null; pintaSit(); window.scrollTo(0, 0); return; }
  J.fin = true; pintaFin();
}
function pintaFin() {
  var max = J.lista.length * 2, pct = Math.round(J.pts / max * 100);
  var total = J.est.a + J.est.p + J.est.g;
  var msg = pct >= 80 ? '¡Muy bien! Sabes manejar estas situaciones.' : pct >= 50 ? 'Vas bien. Revisa las técnicas y vuelve a intentarlo.' : 'Estas situaciones son difíciles para todo el mundo. Mira las técnicas y prueba otra vez.';
  var h = '<div class="sit fin"><h2>' + esc(J.nombre) + ': terminado</h2><div class="gran">' + J.pts + ' / ' + max + '</div><p class="lead">' + msg + '</p>';
  if (total) h += '<div class="estilos"><div style="background:var(--bien2)"><b>' + J.est.a + '</b>asertivas</div><div style="background:#E7EAF3"><b>' + J.est.p + '</b>pasivas</div><div style="background:var(--mal2)"><b>' + J.est.g + '</b>agresivas</div></div>';
  h += '<div class="reto"><b>🎯 Reto para esta semana:</b> ' + esc(RETOS[J.id] || RETOS.mezcla) + '</div>';
  var b = bloque(J.id);
  if (!dentro && b && b.items.length > LIBRES) h += '<div class="cand">🔑 Este bloque tiene <b>' + (b.items.length - LIBRES) + ' situaciones más</b>, y hay 48 en total, el modo clase y las fichas. <button class="btn oro peq" type="button" data-fin-mas="1">Tengo la llave</button></div>';
  h += '<div class="fila" style="justify-content:center;margin-top:10px"><button class="btn coral" type="button" data-otra="1">↻ Otra vez</button><button class="btn sec" type="button" data-ir="inicio">Otro bloque</button><button class="btn sec" type="button" data-ir="tecnicas">🧰 Técnicas</button></div>';
  h += bloquePuente('fin') + '</div>';
  $('juego').innerHTML = h; puentes($('juego'));
  cuenta('acaba'); cuenta('acaba_' + J.id); cuenta('acaba_' + (pct >= 80 ? 'alto' : pct >= 50 ? 'medio' : 'bajo'));
  window.scrollTo(0, 0);
}

/* Cronómetro de pensar (modo clase) */
var tCrono = 0;
function crono(s) {
  paraCrono(); var fin = Date.now() + s * 1000;
  (function tic() { var el = $('crono'); if (!el) return; var r = Math.max(0, Math.ceil((fin - Date.now()) / 1000)); el.textContent = r ? r + ' s' : '¡A votar!'; if (r) tCrono = setTimeout(tic, 250); })();
}
function paraCrono() { clearTimeout(tCrono); }

/* ===================== Modo clase ===================== */
$('bPizarra').addEventListener('click', function () {
  var on = !document.body.classList.contains('pizarra');
  if (on && candado('clase', function () { $('bPizarra').click(); })) return;
  document.body.classList.toggle('pizarra', on); $('bPizarra').setAttribute('aria-pressed', on ? 'true' : 'false');
  if (on) { cuenta('pizarra'); try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) {} toast('Modo clase. Pulsa Esc o el botón para salir.'); }
  else { try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} }
  if (J && !J.fin && !$('v-juego').classList.contains('oculto')) pintaSit();
});
document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && document.body.classList.contains('pizarra')) { document.body.classList.remove('pizarra'); $('bPizarra').setAttribute('aria-pressed', 'false'); if (J && !J.fin && !$('v-juego').classList.contains('oculto')) pintaSit(); } });
/* el botón queda visible en modo clase para poder salir */
(function () { var s = document.createElement('style'); s.textContent = 'body.pizarra .cab nav{display:flex!important}body.pizarra .cab nav button:not(#bPizarra){display:none}'; document.head.appendChild(s); })();

/* ===================== Técnicas ===================== */
$('tecs').innerHTML = T.map(function (t) { return '<div class="tec"><h3>' + t.ico + ' ' + esc(t.n) + '</h3><p>' + t.t + '</p><div class="ej">' + esc(t.ej) + '</div></div>'; }).join('') +
  '<div class="tec" style="grid-column:1/-1">' + bloquePuente('tecnicas').replace('margin-top:14px', 'margin:0') + '</div>';

/* ===================== Fichas ===================== */
$('fiBloques').innerHTML = B.map(function (b) { return '<button class="chip" type="button" data-fi="' + b.id + '">' + b.ico + ' ' + esc(b.nombre) + '</button>'; }).join('');
$('bFichas').addEventListener('click', function () { if (candado('fichas', function () { abre('mFichas'); })) return; abre('mFichas'); cuenta('fichas_abre'); });
$('fiCierra').addEventListener('click', function () { cierra('mFichas'); });
$('fiBloques').addEventListener('click', function (e) { var b = e.target.closest('[data-fi]'); if (b) ficha(bloque(b.dataset.fi)); });
function ficha(b) {
  var cab = '<div class="fh"><div><b style="font-size:18pt">¿Qué harías? · ' + esc(b.nombre) + '</b><br>Nombre: ______________________ Curso: ______ Fecha: ________</div><div><img src="img/colmenia-logo.webp" alt=""> <img src="img/logo-fonia.jpg" alt=""></div></div>';
  var h = cab + '<p><i>' + esc(b.intro) + '</i> Lee cada situación, marca la respuesta que te parece mejor y escribe qué harías tú.</p>';
  b.items.forEach(function (it, n) {
    h += '<div class="fs"><h4>' + (n + 1) + '. ' + esc(it.t) + '</h4><div>' + esc(it.s) + ' <b>' + esc(it.p) + '</b></div>' +
      it.o.map(function (o, k) { return '<div>☐ ' + letra(k) + ') ' + esc(o[0]) + '</div>'; }).join('') +
      '<div style="margin-top:4px">¿Qué harías tú, con tus palabras?</div><div class="lin"></div><div class="lin"></div>' +
      '<div style="margin-top:4px">¿Cómo se siente cada persona?</div><div class="lin"></div></div>';
  });
  if ($('fiTec').checked) h += '<div class="fs"><h4>Técnicas</h4>' + T.map(function (t) { return '<div><b>' + esc(t.n) + ':</b> ' + t.t.replace(/<[^>]+>/g, '') + '</div>'; }).join('') + '</div>';
  if ($('fiSol').checked) {
    h += '<div class="sol"><div class="fh"><b style="font-size:16pt">Soluciones para el docente · ' + esc(b.nombre) + '</b></div>';
    b.items.forEach(function (it, n) {
      h += '<div class="fs"><h4>' + (n + 1) + '. ' + esc(it.t) + '</h4>' + it.o.map(function (o, k) {
        var e = o[3] === 'a' ? ' · asertiva' : o[3] === 'p' ? ' · pasiva' : o[3] === 'g' ? ' · agresiva' : '';
        return '<div><b>' + letra(k) + ') ' + (o[1] === 2 ? 'Buena idea' : o[1] === 1 ? 'Se puede mejorar' : 'Mejor no') + e + '.</b> ' + esc(o[2]) + '</div>';
      }).join('') + '<div><i>Para hablar: ' + esc(it.d) + '</i></div></div>';
    });
    h += '</div>';
  }
  h += '<div class="fpie">¿Qué harías? · ColmenIA, comunidad de educación e IA de Gabinete Fönia (skool.com/logopedia-7339) · Material de apoyo para tutoría.</div>';
  $('ficha').innerHTML = h;
  cuenta('imprimir'); cuenta('imprimir_' + b.id);
  var imgs = $('ficha').querySelectorAll('img'), faltan = imgs.length, hecho = false;
  function imprime() { if (hecho) return; hecho = true; window.print(); }
  if (!faltan) imprime();
  imgs.forEach(function (im) { if (im.complete) { if (--faltan <= 0) imprime(); } else { im.onload = im.onerror = function () { if (--faltan <= 0) imprime(); }; } });
  setTimeout(imprime, 1500);
}

/* ===================== Abeja de mejoras ===================== */
var IDEAS = [['situaciones', 'Más situaciones'], ['primaria', 'Versión Primaria'], ['bachillerato', 'Versión Bachillerato'], ['roleplay', 'Guiones de role-play'], ['familias', 'Hoja para familias'], ['igualdad', 'Igualdad y relaciones'], ['video', 'Situaciones en vídeo']];
$('mejChips').innerHTML = IDEAS.map(function (c) { return '<button class="chip" type="button" data-m="' + c[0] + '" aria-pressed="false">' + c[1] + '</button>'; }).join('');
$('mejChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b || b.getAttribute('aria-pressed') === 'true') return; b.setAttribute('aria-pressed', 'true'); cuenta('mejora_' + b.dataset.m); $('mejOk').textContent = 'Voto sumado. Lo más pedido es lo siguiente que hacemos.'; });
$('abeja').addEventListener('click', function () { abre('mAbeja'); $('mejOk').textContent = ''; $('mejTxt').focus(); cuenta('abeja_abre'); });
$('mejCierra').addEventListener('click', function () { cierra('mAbeja'); });
var BUZON = 'https://fonia-buzon.vercel.app/api/registro', COLA = 'qh-buzon-cola';
function leeCola() { try { return JSON.parse(ls(COLA) || '[]') || []; } catch (e) { return []; } }
function ponCola(l) { ls(COLA, JSON.stringify(l.slice(-20))); }
function manda(c, cb) {
  if (!window.fetch) { cb(false); return; }
  fetch(BUZON, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) })
    .then(function (r) { cb(r.ok); }).catch(function () { cb(false); });
}
function reintenta() { var l = leeCola(); if (!l.length) return; ponCola([]); l.forEach(function (c) { manda(c, function (b) { if (!b) ponCola(leeCola().concat([c])); }); }); }
setTimeout(reintenta, 3000); window.addEventListener('online', reintenta);
$('mejEnvia').addEventListener('click', function () {
  var t = $('mejTxt').value.trim();
  var chips = [].map.call(document.querySelectorAll('#mejChips [aria-pressed="true"]'), function (b) { return b.textContent; });
  if (!t && !chips.length) { $('mejOk').textContent = 'Escribe algo o toca una opción.'; return; }
  var firma = $('mejFirma').value.trim().slice(0, 60);
  var c = { id: 'c0000-qh-' + uid(), caso: '0000', terapeuta: '', material: 'comentario', version: 'que-harias',
    contenido: '¿QUÉ HARÍAS? · MEJORA\n' + (firma ? 'De: ' + firma + '\n' : '') + 'Aparato: ' + navigator.userAgent.slice(0, 160) + '\n\n' + (chips.length ? 'Marcó: ' + chips.join(', ') + '\n' : '') + t.slice(0, 2500) + '\n\nSin datos personales del alumnado.' };
  var b = $('mejEnvia'); b.disabled = true; $('mejOk').textContent = 'Enviando…';
  manda(c, function (bien) {
    b.disabled = false; if (!bien) ponCola(leeCola().concat([c]));
    cuenta(bien ? 'buzon_ok' : 'buzon_cola');
    if (bien) $('mejTxt').value = '';
    $('mejOk').textContent = bien ? '¡Recibido! Ya lo tiene el equipo. Gracias 🐝' : 'Ahora no hay conexión: lo guardamos y se envía solo cuando vuelva.';
  });
});

/* ===================== Arranque ===================== */
pintaBloques();
aplicaAjustes();
puentes();
(function () {
  var visto = false; try { visto = !!sessionStorage.getItem('qh-car'); } catch (e) {}
  if (dentro || (visto && !COMO_VISITA) || Q.get('b')) return;
  var c = $('caratula'); c.classList.remove('oculto'); cuenta('caratula_ve');
  function fuera(que) { c.classList.add('oculto'); try { sessionStorage.setItem('qh-car', '1'); } catch (e) {} cuenta('caratula_' + que); }
  c.addEventListener('click', function (e) {
    var b = e.target.closest('[data-car]'); if (!b) return;
    var q = b.dataset.car; fuera(q);
    if (q === 'juega') empieza('conversa');
    if (q === 'clave') candado('portada');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !c.classList.contains('oculto')) fuera('esc'); });
  setTimeout(function () { var f = c.querySelector('[data-car="juega"]'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }, 100);
})();
var bq = Q.get('b'); if (bq && (bloque(bq) || bq === 'mezcla')) empieza(bq);
})();
