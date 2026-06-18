// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = "https://hsdxvlfpyrmfqthjqfpi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZHh2bGZweXJtZnF0aGpxZnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTEzNDUsImV4cCI6MjA5NzM4NzM0NX0.E0McNITvCMzxWw4ZUQPeacLZF4lnISSnUHjk_Ff_ngo";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let playerLogado      = null;
let mestreAutenticado = false;
let debounceTimer     = null;
let nomeValido        = true;
const CHAVE_MESTRE_PADRAO = "mestre123";

window.addEventListener('DOMContentLoaded', () => {
    carregarListaPublica();
    escutarMudancasEmTempoReal();
});

// ==========================================
// FEATURE 7: TELA DE CARREGAMENTO
// ==========================================
function mostrarLoading() { document.getElementById('loading-overlay').classList.remove('hidden'); }
function ocultarLoading()  { document.getElementById('loading-overlay').classList.add('hidden'); }

// ==========================================
// UTILITÁRIOS DE RANK E ITEM (FEATURE 5)
// ==========================================
const RANK_ESTILOS = {
    S: { borda:'#fbbf24', texto:'#fde68a', fundo:'rgba(120,80,0,0.25)',    glow:'0 0 10px rgba(251,191,36,0.65),0 0 22px rgba(251,191,36,0.3)', badge:'background:#451a03;color:#fde68a;border:1px solid #b45309' },
    A: { borda:'#f97316', texto:'#fed7aa', fundo:'rgba(120,40,0,0.25)',    glow:'0 0 8px rgba(249,115,22,0.5)',                                  badge:'background:#431407;color:#fed7aa;border:1px solid #c2410c' },
    B: { borda:'#a855f7', texto:'#e9d5ff', fundo:'rgba(80,20,120,0.25)',   glow:'0 0 8px rgba(168,85,247,0.4)',                                  badge:'background:#3b0764;color:#e9d5ff;border:1px solid #7e22ce' },
    C: { borda:'#3b82f6', texto:'#bfdbfe', fundo:'rgba(20,40,120,0.25)',   glow:'',                                                             badge:'background:#1e3a5f;color:#bfdbfe;border:1px solid #1d4ed8' },
    D: { borda:'#22c55e', texto:'#bbf7d0', fundo:'rgba(10,60,30,0.25)',    glow:'',                                                             badge:'background:#14532d;color:#bbf7d0;border:1px solid #15803d' },
    E: { borda:'#475569', texto:'#94a3b8', fundo:'rgba(15,23,42,0.8)',     glow:'',                                                             badge:'background:#1e293b;color:#94a3b8;border:1px solid #334155' },
};

function parseItem(str) {
    try { const o = JSON.parse(str); if (o && o.nome) return o; } catch {}
    return { nome: str, rank: 'E' };
}
function serializarItem(nome, rank) {
    return JSON.stringify({ nome, rank: rank || 'E' });
}
function rankBadgeHTML(rank) {
    const e = RANK_ESTILOS[rank] || RANK_ESTILOS['E'];
    return `<span style="${e.badge};font-size:9px;font-weight:900;padding:1px 5px;border-radius:3px;font-family:monospace">${rank}</span>`;
}

// ==========================================
// FEATURE 6: EXAUSTÃO (7 NÍVEIS)
// ==========================================
const EXAUSTAO = [
    { label: 'Totalmente Descansado', cor: '#34d399', pulse: false },
    { label: 'Energizado',            cor: '#4ade80', pulse: false },
    { label: 'Alerta',                cor: '#22d3ee', pulse: false },
    { label: 'Desgastado',            cor: '#facc15', pulse: false },
    { label: 'Exausto',               cor: '#fb923c', pulse: false },
    { label: 'No Limite',             cor: '#ef4444', pulse: true  },
    { label: 'Crítico — Cuidado!',    cor: '#dc2626', pulse: true  },
];

// ==========================================
// FEATURE 4: LOG DE EVENTOS DO SISTEMA
// ==========================================
async function adicionarLog(id, mensagem) {
    try {
        const agora = new Date();
        const hora  = agora.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
        const entrada = `[SISTEMA ${hora}]: ${mensagem}`;
        const { data } = await supabaseClient.from('cacadores').select('log_eventos').eq('id', id).single();
        const logs  = Array.isArray(data?.log_eventos) ? data.log_eventos : [];
        const novos = [...logs.slice(-29), entrada];
        await supabaseClient.from('cacadores').update({ log_eventos: novos }).eq('id', id);
    } catch {}
}

// ==========================================
// NAVEGAÇÃO
// ==========================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => { el.classList.add('hidden'); el.classList.remove('block'); });
    document.querySelectorAll('.nav-btn').forEach(el => { el.classList.remove('active','text-cyan-400','font-bold'); el.classList.add('text-slate-400','font-medium'); });
    const t = document.getElementById(`tab-${tabName}`);
    if (t) { t.classList.remove('hidden'); t.classList.add('block'); }
    const b = document.getElementById(`btn-${tabName}`);
    if (b) { b.classList.add('active','text-cyan-400','font-bold'); b.classList.remove('text-slate-400','font-medium'); }
    if (tabName === 'lista') carregarListaPublica();
    if (tabName === 'mestre' && mestreAutenticado) carregarPainelMestre();
    if (tabName === 'player' && playerLogado) renderizarHudPlayer();
    if (tabName === 'sistemas') verificarAcessoSistemas();
}

// ==========================================
// FEATURE 1: VALIDAÇÃO DE NOME COM DEBOUNCE
// ==========================================
function validarNomeDebounce() {
    clearTimeout(debounceTimer);
    const nome     = document.getElementById('reg-nome').value.trim();
    const feedback = document.getElementById('feedback-nome');
    const btn      = document.getElementById('btn-registrar');
    if (!nome || nome.length < 2) { feedback.textContent = ''; nomeValido = true; return; }
    feedback.textContent = '⏳ Verificando...';
    feedback.className   = 'text-xs mt-1 block text-slate-400';
    debounceTimer = setTimeout(async () => {
        const { data } = await supabaseClient.from('cacadores').select('id').eq('nome', nome).maybeSingle();
        if (data) {
            feedback.textContent = '❌ Este nome já foi escolhido pelo Sistema';
            feedback.className   = 'text-xs mt-1 block text-red-400 font-semibold';
            nomeValido = false;
            btn.disabled = true;
            btn.classList.add('opacity-50','cursor-not-allowed');
        } else {
            feedback.textContent = '✅ Disponível para Manifestação';
            feedback.className   = 'text-xs mt-1 block text-emerald-400 font-semibold';
            nomeValido = true;
            btn.disabled = false;
            btn.classList.remove('opacity-50','cursor-not-allowed');
        }
    }, 500);
}

// ==========================================
// FEATURE 2: CROP QUADRADO + COMPACTAÇÃO
// ==========================================
function compactarImagemCanvas(file) {
    return new Promise((resolve, reject) => {
        const MAX = 400, Q = 0.7;
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const lado = Math.min(img.width, img.height);
            const sx   = (img.width  - lado) / 2;
            const sy   = (img.height - lado) / 2;
            const canvas = document.createElement('canvas');
            canvas.width = MAX; canvas.height = MAX;
            canvas.getContext('2d').drawImage(img, sx, sy, lado, lado, 0, 0, MAX, MAX);
            resolve(canvas.toDataURL('image/jpeg', Q));
        };
        img.onerror = reject;
        img.src = url;
    });
}

// ==========================================
// REGISTRO DE PERSONAGEM
// ==========================================
async function registrarPersonagem(event) {
    event.preventDefault();
    if (!nomeValido) { alert('❌ Este nome já está em uso pelo Sistema.'); return; }

    const nome        = document.getElementById('reg-nome').value.trim();
    const raca        = document.getElementById('reg-raca').value.trim();
    const classe      = document.getElementById('reg-classe').value.trim();
    const clan        = document.getElementById('reg-clan').value.trim() || 'Nenhum';
    const obra_origem = document.getElementById('reg-obra').value.trim();
    const senha       = document.getElementById('reg-senha').value;

    if (!nome || !senha || !raca || !classe || !obra_origem) {
        alert('⚠️ Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // FEATURE 3: Verificar aparência duplicada
    const { data: obraExiste } = await supabaseClient.from('cacadores').select('id,nome').eq('obra_origem', obra_origem).maybeSingle();
    if (obraExiste) {
        const ok = confirm(`⚠️ A aparência da obra "${obra_origem}" já está sendo usada pelo caçador "${obraExiste.nome}".\n\nDeseja usar mesmo assim?`);
        if (!ok) return;
    }

    mostrarLoading();

    let url_aparencia = '';
    const fileInput = document.getElementById('reg-file');
    if (fileInput && fileInput.files.length > 0) {
        try   { url_aparencia = await compactarImagemCanvas(fileInput.files[0]); }
        catch { url_aparencia = await new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(fileInput.files[0]); r.onload = () => res(r.result); r.onerror = rej; }); }
    }

    const { error } = await supabaseClient.from('cacadores')
        .insert([{ nome, senha, raca, classe, clan, obra_origem, url_aparencia }]);

    ocultarLoading();

    if (error) {
        alert(error.code === '23505' ? '❌ Este Nome de Personagem já está em uso!' : '❌ Erro ao registrar: ' + error.message);
    } else {
        alert('⚡ O SISTEMA TE ESCOLHEU! Registro concluído com sucesso.');
        document.getElementById('form-cadastro').reset();
        document.getElementById('feedback-nome').textContent = '';
        nomeValido = true;
        switchTab('player');
        document.getElementById('login-nome').value = nome;
    }
}

// ==========================================
// LOGIN DO PLAYER
// ==========================================
async function autenticarPlayer() {
    mostrarLoading();
    const nome  = document.getElementById('login-nome').value.trim();
    const senha = document.getElementById('login-senha').value;
    const { data, error } = await supabaseClient.from('cacadores').select('*').eq('nome', nome).eq('senha', senha).maybeSingle();
    ocultarLoading();
    if (error || !data) { alert('❌ Nome ou senha incorretos.'); return; }
    playerLogado = data;
    document.getElementById('player-login-box').classList.add('hidden');
    renderizarHudPlayer();
}

// ==========================================
// HUD DO PLAYER (TODAS AS FEATURES)
// ==========================================
function renderizarHudPlayer() {
    const hud = document.getElementById('player-hud');
    if (!hud) return;
    hud.classList.remove('hidden');
    const p = playerLogado;

    // FEATURE 6: Barras e Exaustão
    const hpMax      = (p.vitalidade    || 0) * 10;
    const recMax     = (p.inteligencia  || 0) * 10;
    const hpAtual    = p.hp_atual       ?? 0;
    const recAtual   = p.recurso_atual  ?? 0;
    const recTipo    = p.recurso_tipo   || 'Energia';
    const hpPct      = hpMax  > 0 ? Math.min(100, Math.round((hpAtual  / hpMax)  * 100)) : 0;
    const recPct     = recMax > 0 ? Math.min(100, Math.round((recAtual / recMax)  * 100)) : 0;
    const hpCor      = hpPct > 50 ? '#34d399' : hpPct > 25 ? '#facc15' : '#ef4444';
    const recCor     = recTipo === 'Mana' ? '#a855f7' : '#06b6d4';
    const exIdx      = Math.min(6, Math.max(0, (p.exaustao ?? 1) - 1));
    const exInfo     = EXAUSTAO[exIdx];

    // FEATURE 8: Títulos
    const titulos    = Array.isArray(p.titulos)    ? p.titulos    : [];
    const titHTML    = titulos.map(t => `<span class="titulo-badge">${t}</span>`).join('');

    // FEATURE 5: Itens e Poderes com rank visual
    const inventario = Array.isArray(p.inventario) ? p.inventario : [];
    const poderes    = Array.isArray(p.poderes)    ? p.poderes    : [];

    const itensHTML = inventario.length === 0
        ? '<p class="text-xs text-slate-500 italic">Inventário vazio.</p>'
        : inventario.map(str => {
            const item = parseItem(str);
            const e    = RANK_ESTILOS[item.rank] || RANK_ESTILOS['E'];
            const cls  = item.rank === 'S' ? 'rank-s-glow' : '';
            return `<div class="flex items-center gap-1.5 rounded px-2 py-1 text-xs border ${cls}" style="background:${e.fundo};border-color:${e.borda};${e.glow?'box-shadow:'+e.glow:''}">
                ${rankBadgeHTML(item.rank)}<span style="color:${e.texto}">📦 ${item.nome}</span>
            </div>`;
        }).join('');

    const poderesHTML = poderes.length === 0
        ? '<p class="text-xs text-slate-500 italic">Nenhum poder manifestado.</p>'
        : poderes.map(str => {
            const pod = parseItem(str);
            const e   = RANK_ESTILOS[pod.rank] || RANK_ESTILOS['E'];
            const cls = pod.rank === 'S' ? 'rank-s-glow' : '';
            return `<div class="flex items-center gap-1.5 rounded px-2 py-1 text-xs border ${cls}" style="background:${e.fundo};border-color:${e.borda};${e.glow?'box-shadow:'+e.glow:''}">
                ${rankBadgeHTML(pod.rank)}<span style="color:${e.texto}">🔥 ${pod.nome}</span>
            </div>`;
        }).join('');

    // FEATURE 4: Log
    const logs    = Array.isArray(p.log_eventos) ? p.log_eventos : [];
    const logsHTML = logs.length === 0
        ? '<p class="text-xs text-slate-500 italic">Nenhum registro ainda.</p>'
        : [...logs].reverse().map(l => `<p class="text-[10px] font-mono text-cyan-600/80 leading-relaxed">${l}</p>`).join('');

    const mortoClass  = !p.vivo ? 'avatar-morto' : '';
    const statusVital = p.vivo
        ? `<span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-xs font-bold">VIVO</span>`
        : `<span class="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-xs font-bold">CONDIÇÃO: MORTO</span>`;

    hud.innerHTML = `
    <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">

        <!-- Avatar + Info -->
        <div class="flex gap-4 items-center">
            <img src="${p.url_aparencia}" class="w-20 h-20 object-cover rounded-xl border-2 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] ${mortoClass}">
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <h2 class="text-lg font-black tracking-wide text-slate-100 uppercase">${p.nome}</h2>
                    <span class="text-base font-black text-cyan-400 font-mono bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">RANK ${p.rank}</span>
                </div>
                <p class="text-xs text-slate-400">${p.classe} • ${p.raca}</p>
                <p class="text-xs text-slate-500 mt-0.5">Clã: ${p.clan} (${p.obra_origem})</p>
                ${titHTML ? `<div class="flex flex-wrap gap-1 mt-1.5">${titHTML}</div>` : ''}
            </div>
        </div>

        <!-- Neutralidade + Status -->
        <div class="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800/60">
            <div class="text-xs text-slate-400">Neutralidade: <span class="text-amber-400 font-bold">${p.neutralidade}</span></div>
            ${statusVital}
        </div>

        <!-- FEATURE 6: Barras de HP e Recurso -->
        <div class="space-y-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div>
                <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400 font-semibold uppercase tracking-wider">❤️ Vida</span>
                    <span class="font-mono font-bold" style="color:${hpCor}">${hpAtual} / ${hpMax}</span>
                </div>
                <div class="h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${hpPct}%;background:${hpCor};box-shadow:0 0 8px ${hpCor}99"></div>
                </div>
            </div>
            <div>
                <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400 font-semibold uppercase tracking-wider">${recTipo === 'Mana' ? '🔮' : '⚡'} ${recTipo}</span>
                    <span class="font-mono font-bold" style="color:${recCor}">${recAtual} / ${recMax}</span>
                </div>
                <div class="h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${recPct}%;background:${recCor};box-shadow:0 0 8px ${recCor}99"></div>
                </div>
            </div>
            <!-- Exaustão -->
            <div class="flex items-center justify-between rounded-lg px-2 py-1.5 border border-slate-800/80 bg-slate-950">
                <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">🫁 Estado Físico</span>
                <span class="text-xs font-black ${exInfo.pulse ? 'animate-pulse' : ''}" style="color:${exInfo.cor}">● ${exInfo.label}</span>
            </div>
        </div>

        <!-- Atributos -->
        <div class="space-y-1.5">
            <div class="flex justify-between items-center">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Atributos do Caçador</h3>
                ${p.pontos_distribuir > 0 ? `<span class="text-xs bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black animate-bounce">⚡ +${p.pontos_distribuir} PONTOS</span>` : ''}
            </div>
            ${['forca','agilidade','vitalidade','inteligencia','sentido'].map(attr => `
            <div class="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-900">
                <span class="text-xs uppercase font-semibold text-slate-400">${attr==='forca'?'💪 Força':attr==='agilidade'?'⚡ Agilidade':attr==='vitalidade'?'❤️ Vitalidade':attr==='inteligencia'?'🔮 Inteligência':'👁️ Sentido'}</span>
                <div class="flex items-center gap-3">
                    <span class="text-sm font-mono font-bold text-slate-200">${p[attr]}</span>
                    ${p.pontos_distribuir > 0 && p.vivo ? `<button onclick="distribuirPonto('${attr}')" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold w-6 h-6 rounded flex items-center justify-center text-xs transition">+</button>` : ''}
                </div>
            </div>`).join('')}
        </div>

        <!-- FEATURE 5: Inventário e Habilidades com Rank -->
        <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventário</h4>
                <div class="space-y-1 max-h-40 overflow-y-auto">${itensHTML}</div>
            </div>
            <div class="space-y-1.5">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Habilidades</h4>
                <div class="space-y-1 max-h-40 overflow-y-auto">${poderesHTML}</div>
            </div>
        </div>

        <!-- FEATURE 4: Log do Sistema -->
        <details class="group">
            <summary class="cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wider py-1 flex items-center gap-1 hover:text-cyan-400 transition select-none">
                <span class="group-open:rotate-90 transition-transform inline-block">▶</span>
                Registros do Sistema
            </summary>
            <div class="mt-2 bg-slate-950 border border-slate-800/60 rounded-lg p-2 max-h-36 overflow-y-auto space-y-0.5">
                ${logsHTML}
            </div>
        </details>

        <button onclick="document.location.reload()" class="w-full text-center text-xs text-slate-500 hover:text-slate-400 pt-1 transition">Desconectar da Janela</button>
    </div>`;
}

async function distribuirPonto(atributo) {
    if (!playerLogado || playerLogado.pontos_distribuir <= 0) return;
    const novoVal = playerLogado[atributo] + 1;
    const novoPts = playerLogado.pontos_distribuir - 1;
    const { data, error } = await supabaseClient.from('cacadores')
        .update({ [atributo]: novoVal, pontos_distribuir: novoPts })
        .eq('id', playerLogado.id).select().single();
    if (!error && data) {
        adicionarLog(playerLogado.id, `Ponto distribuído em ${atributo.charAt(0).toUpperCase()+atributo.slice(1)} (novo valor: ${novoVal}).`);
        playerLogado = data;
        renderizarHudPlayer();
    }
}

// ==========================================
// LISTA PÚBLICA
// ==========================================
async function carregarListaPublica() {
    const container = document.getElementById('lista-cacadores-container');
    if (!container) return;
    const { data: cacadores, error } = await supabaseClient.from('cacadores').select('*').order('rank', { ascending: false });
    if (error) return;
    container.innerHTML = '';
    cacadores.forEach(c => {
        const mortoClass = !c.vivo ? 'avatar-morto' : '';
        const badgeVivo  = !c.vivo ? `<span class="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 rounded font-black ml-1">MORTO</span>` : '';
        const poder = (c.forca || 0) + (c.agilidade || 0) + (c.vitalidade || 0) + (c.inteligencia || 0) + (c.sentido || 0);

        container.innerHTML += `
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex gap-3 items-center">
            <img src="${c.url_aparencia}" class="w-14 h-14 object-cover rounded-lg border border-slate-700 ${mortoClass} flex-shrink-0">
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-2">
                    <h3 class="text-sm font-bold text-slate-200 truncate uppercase">${c.nome}${badgeVivo}</h3>
                    <div class="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span class="text-xs font-mono font-black text-purple-400 bg-purple-950/40 border border-purple-900/60 px-2 rounded">RANK ${c.rank}</span>
                        <span class="text-[10px] font-mono font-bold text-cyan-500/80">POD: ${poder}</span>
                    </div>
                </div>
                <p class="text-xs text-slate-400 truncate">${c.classe} • Clã ${c.clan}</p>
                <p class="text-[10px] text-slate-500 italic truncate">Aparência: ${c.obra_origem}</p>
            </div>
        </div>`;
    });
}

// ==========================================
// AUTENTICAÇÃO DO MESTRE
// ==========================================
function autenticarMestre() {
    const chave = document.getElementById('mestre-chave').value;
    if (chave === CHAVE_MESTRE_PADRAO) {
        mestreAutenticado = true;
        document.getElementById('mestre-login-box').classList.add('hidden');
        carregarPainelMestre();
    } else { alert('❌ Chave de Administrador Inválida!'); }
}
function deslogarMestre() {
    mestreAutenticado = false;
    document.getElementById('mestre-hud').classList.add('hidden');
    document.getElementById('mestre-login-box').classList.remove('hidden');
    document.getElementById('mestre-chave').value = '';
}

// ==========================================
// PAINEL DO MESTRE (COMPLETO)
// ==========================================
function _seletorRank(id, campo) {
    return `<select id="rank-${campo}-${id}" class="bg-slate-950 border border-slate-700 text-xs rounded px-1 py-0.5 text-slate-200 font-mono">
        ${['E','D','C','B','A','S'].map(r => `<option value="${r}">${r}</option>`).join('')}
    </select>`;
}

async function carregarPainelMestre() {
    if (!mestreAutenticado) return;
    const container = document.getElementById('mestre-lista-players');
    if (!container) return;
    document.getElementById('mestre-hud').classList.remove('hidden');
    const { data: players, error } = await supabaseClient.from('cacadores').select('*').order('nome', { ascending: true });
    if (error) return;

    container.innerHTML = '';
    players.forEach(p => {
        const mortoClass = !p.vivo ? 'opacity-40 grayscale border-red-900' : 'border-slate-700';
        const hpMax  = (p.vitalidade   || 0) * 10;
        const recMax = (p.inteligencia || 0) * 10;
        const recTipo = p.recurso_tipo || 'Energia';

        const inventario   = Array.isArray(p.inventario) ? p.inventario : [];
        const poderes      = Array.isArray(p.poderes)    ? p.poderes    : [];
        const titulos      = Array.isArray(p.titulos)    ? p.titulos    : [];
        const conquistasOk = Array.isArray(p.conquistas_desbloqueadas) ? p.conquistas_desbloqueadas : [];

        const itensHTML = inventario.length > 0
            ? inventario.map((str, idx) => {
                const item = parseItem(str); const e = RANK_ESTILOS[item.rank] || RANK_ESTILOS['E'];
                return `<div class="flex items-center justify-between rounded px-2 py-1 text-xs border gap-1" style="background:${e.fundo};border-color:${e.borda}">
                    <span class="flex items-center gap-1.5 truncate min-w-0">${rankBadgeHTML(item.rank)}<span style="color:${e.texto}" class="truncate">${item.nome}</span></span>
                    <button onclick="removerItemMestre('${p.id}',${idx})" class="text-red-500 hover:text-red-400 flex-shrink-0 ml-1" title="Remover">❌</button>
                </div>`;
            }).join('')
            : '<p class="text-xs text-slate-600 italic">Vazio.</p>';

        const poderesHTML = poderes.length > 0
            ? poderes.map((str, idx) => {
                const pod = parseItem(str); const e = RANK_ESTILOS[pod.rank] || RANK_ESTILOS['E'];
                return `<div class="flex items-center justify-between rounded px-2 py-1 text-xs border gap-1" style="background:${e.fundo};border-color:${e.borda}">
                    <span class="flex items-center gap-1.5 truncate min-w-0">${rankBadgeHTML(pod.rank)}<span style="color:${e.texto}" class="truncate">${pod.nome}</span></span>
                    <button onclick="removerPoderMestre('${p.id}',${idx})" class="text-red-500 hover:text-red-400 flex-shrink-0 ml-1" title="Remover">❌</button>
                </div>`;
            }).join('')
            : '<p class="text-xs text-slate-600 italic">Nenhum.</p>';

        const titulosHTML = titulos.length > 0
            ? titulos.map((t, idx) => `<div class="flex items-center justify-between bg-slate-950 rounded px-2 py-1 text-xs border border-slate-800 gap-1">
                <span class="titulo-badge truncate">${t}</span>
                <button onclick="removerTituloMestre('${p.id}',${idx})" class="text-red-500 hover:text-red-400 flex-shrink-0 ml-1">❌</button>
            </div>`).join('')
            : '<p class="text-xs text-slate-600 italic">Sem títulos.</p>';

        const atributosMap = { forca:'💪 Força', agilidade:'⚡ Agil.', vitalidade:'❤️ Vital.', inteligencia:'🔮 Intel.', sentido:'👁️ Sent.' };

        container.innerHTML += `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 relative">
            <button onclick="eliminarPersonagemMestre('${p.id}','${p.nome.replace(/'/g,"\\'")}','${p.nome.replace(/'/g,"\\'")}' )" class="absolute top-2 right-2 text-slate-600 hover:text-red-500 text-sm transition" title="Apagar">🗑️</button>

            <!-- Cabeçalho -->
            <div class="flex items-center gap-3 pr-8 border-b border-slate-800/60 pb-2">
                <img src="${p.url_aparencia}" class="w-11 h-11 object-cover rounded-lg border ${mortoClass} flex-shrink-0">
                <div class="min-w-0 flex-1">
                    <h4 class="text-sm font-bold text-slate-200 uppercase truncate">${p.nome} <span class="text-xs text-slate-500 font-normal">(Rank ${p.rank})</span></h4>
                    <p class="text-xs text-slate-400">Pts. livres: <span class="text-cyan-400 font-bold">${p.pontos_distribuir}</span></p>
                </div>
                <select onchange="atualizarRankMestre('${p.id}', this.value)" class="bg-slate-950 border border-slate-700 text-xs rounded p-1 text-slate-300">
                    ${['E','D','C','B','A','S'].map(r=>`<option value="${r}" ${p.rank===r?'selected':''}>${r}</option>`).join('')}
                </select>
            </div>

            <!-- Controles rápidos -->
            <div class="grid grid-cols-3 gap-1.5">
                <button onclick="concederPontosMestre('${p.id}',${p.pontos_distribuir},5)" class="bg-slate-950 border border-slate-800 text-xs py-1 text-cyan-400 rounded hover:bg-slate-800 transition">+5 Pts</button>
                <button onclick="alternarVidaMestre('${p.id}',${p.vivo})" class="text-xs py-1 rounded transition ${p.vivo?'bg-emerald-950/50 border border-emerald-800 text-emerald-400':'bg-red-950/50 border border-red-800 text-red-400'}">${p.vivo?'🟢 Vivo':'🔴 Morto'}</button>
                <select onchange="atualizarNeutralidadeMestre('${p.id}', this.value)" class="bg-slate-950 border border-slate-800 text-[10px] rounded text-amber-400 p-1">
                    ${['Neutro','Herói','Vilão','Caótico'].map(n=>`<option value="${n}" ${p.neutralidade===n?'selected':''}>${n}</option>`).join('')}
                </select>
            </div>

            <!-- Atributos Base -->
            <details class="group">
                <summary class="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider py-1 select-none flex items-center gap-1 hover:text-cyan-400 transition">
                    <span class="group-open:rotate-90 transition-transform inline-block">▶</span> Atributos Base
                </summary>
                <div class="mt-1.5 space-y-1 border-t border-slate-800/50 pt-2">
                    ${Object.entries(atributosMap).map(([attr, label]) => `
                    <div class="flex items-center justify-between bg-slate-950 rounded px-2 py-1 border border-slate-900">
                        <span class="text-xs text-slate-400 w-20">${label}</span>
                        <div class="flex items-center gap-2">
                            <button onclick="ajustarAtributoMestre('${p.id}','${attr}',${p[attr]},-1)" class="bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 font-bold w-6 h-6 rounded flex items-center justify-center transition">−</button>
                            <span id="attr-${p.id}-${attr}" class="text-sm font-mono font-bold text-slate-200 w-8 text-center">${p[attr]}</span>
                            <button onclick="ajustarAtributoMestre('${p.id}','${attr}',${p[attr]},+1)" class="bg-slate-800 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-400 font-bold w-6 h-6 rounded flex items-center justify-center transition">+</button>
                        </div>
                    </div>`).join('')}
                </div>
            </details>

            <!-- HP / Recurso / Exaustão -->
            <details class="group">
                <summary class="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider py-1 select-none flex items-center gap-1 hover:text-red-400 transition">
                    <span class="group-open:rotate-90 transition-transform inline-block">▶</span> HP / Recurso / Estado
                </summary>
                <div class="mt-1.5 space-y-2 border-t border-slate-800/50 pt-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400 w-14 flex-shrink-0">❤️ HP</span>
                        <input type="number" id="hp-${p.id}" value="${p.hp_atual??0}" min="0" max="${hpMax}"
                            class="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 text-center">
                        <span class="text-xs text-slate-500 flex-shrink-0">/ ${hpMax}</span>
                        <button onclick="salvarHpMestre('${p.id}')" class="bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs px-2 py-0.5 rounded hover:bg-emerald-900 transition">✓</button>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400 w-14 flex-shrink-0">${recTipo==='Mana'?'🔮':'⚡'} ${recTipo}</span>
                        <input type="number" id="rec-${p.id}" value="${p.recurso_atual??0}" min="0" max="${recMax}"
                            class="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 text-center">
                        <span class="text-xs text-slate-500 flex-shrink-0">/ ${recMax}</span>
                        <button onclick="salvarRecursoMestre('${p.id}')" class="bg-purple-950 border border-purple-800 text-purple-400 text-xs px-2 py-0.5 rounded hover:bg-purple-900 transition">✓</button>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400 w-14 flex-shrink-0">⚗️ Tipo</span>
                        <select onchange="atualizarRecursoTipoMestre('${p.id}', this.value)" class="flex-1 bg-slate-950 border border-slate-800 text-xs rounded p-1 text-slate-300">
                            <option value="Energia" ${recTipo==='Energia'?'selected':''}>Energia</option>
                            <option value="Mana"    ${recTipo==='Mana'   ?'selected':''}>Mana</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400 w-14 flex-shrink-0">🫁 Estado</span>
                        <select onchange="atualizarExaustaoMestre('${p.id}', this.value)" class="flex-1 bg-slate-950 border border-slate-800 text-xs rounded p-1 text-slate-300">
                            ${EXAUSTAO.map((ex,i) => `<option value="${i+1}" ${(p.exaustao??1)===(i+1)?'selected':''}>${i+1}. ${ex.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </details>

            <!-- Inventário & Habilidades com Rank -->
            <details class="group" open>
                <summary class="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider py-1 select-none flex items-center gap-1 hover:text-cyan-400 transition">
                    <span class="group-open:rotate-90 transition-transform inline-block">▶</span> Inventário & Habilidades
                </summary>
                <div class="mt-1.5 space-y-3 border-t border-slate-800/50 pt-2">
                    <div>
                        <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Inventário Atual</p>
                        <div class="space-y-1 max-h-24 overflow-y-auto mb-1">${itensHTML}</div>
                        <div class="flex gap-1 items-center">
                            ${_seletorRank(p.id,'item')}
                            <input type="text" placeholder="Novo item..." id="item-${p.id}" class="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-100 min-w-0">
                            <button onclick="injetarItemMestre('${p.id}')" class="bg-purple-900 hover:bg-purple-800 text-white px-2 py-0.5 rounded text-xs transition flex-shrink-0">+</button>
                        </div>
                    </div>
                    <div>
                        <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Habilidades Atuais</p>
                        <div class="space-y-1 max-h-24 overflow-y-auto mb-1">${poderesHTML}</div>
                        <div class="flex gap-1 items-center">
                            ${_seletorRank(p.id,'poder')}
                            <input type="text" placeholder="Novo poder..." id="poder-${p.id}" class="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-100 min-w-0">
                            <button onclick="injetarPoderMestre('${p.id}')" class="bg-indigo-900 hover:bg-indigo-800 text-white px-2 py-0.5 rounded text-xs transition flex-shrink-0">+</button>
                        </div>
                    </div>
                </div>
            </details>

            <!-- Títulos -->
            <details class="group">
                <summary class="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider py-1 select-none flex items-center gap-1 hover:text-amber-400 transition">
                    <span class="group-open:rotate-90 transition-transform inline-block">▶</span> Títulos
                </summary>
                <div class="mt-1.5 space-y-1 border-t border-slate-800/50 pt-2">
                    <div class="space-y-1 max-h-20 overflow-y-auto mb-1">${titulosHTML}</div>
                    <div class="flex gap-1">
                        <input type="text" placeholder='Ex: "Monarca das Sombras"' id="titulo-${p.id}"
                            class="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-100 min-w-0">
                        <button onclick="concederTituloMestre('${p.id}')" class="bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700 text-amber-400 px-2 py-0.5 rounded text-xs transition flex-shrink-0">+</button>
                    </div>
                </div>
            </details>

            <!-- Conquistas -->
            <details class="group">
                <summary class="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider py-1 select-none flex items-center gap-1 hover:text-yellow-400 transition">
                    <span class="group-open:rotate-90 transition-transform inline-block">▶</span> Conquistas
                    <span class="ml-auto font-mono text-yellow-600">${conquistasOk.length}/20</span>
                </summary>
                <div class="mt-1.5 border-t border-slate-800/50 pt-2">
                    <div class="grid grid-cols-2 gap-1">
                        ${(typeof CONQUISTAS !== 'undefined' ? CONQUISTAS : []).map(c => {
                            const desbloq = conquistasOk.includes(c.id);
                            return `<button onclick="toggleConquistaMestre('${p.id}','${c.id}',${desbloq})"
                                class="flex items-center gap-1 text-left rounded px-1.5 py-1 border text-[10px] transition hover:opacity-80 ${desbloq
                                    ? 'bg-yellow-950/40 border-yellow-800 text-yellow-400'
                                    : 'bg-slate-950 border-slate-800 text-slate-600'}">
                                <span>${c.icone}</span>
                                <span class="leading-tight">${c.nome}</span>
                            </button>`;
                        }).join('')}
                    </div>
                </div>
            </details>
        </div>`;
    });
}

// ==========================================
// AÇÕES DO MESTRE
// ==========================================
async function atualizarRankMestre(id, rank) {
    await supabaseClient.from('cacadores').update({ rank }).eq('id', id);
    adicionarLog(id, `Rank alterado para ${rank} pelo Mestre.`);
    carregarPainelMestre();
}
async function concederPontosMestre(id, pts, qtd) {
    await supabaseClient.from('cacadores').update({ pontos_distribuir: pts + qtd }).eq('id', id);
    adicionarLog(id, `+${qtd} Pontos de Atributo concedidos pelo Mestre.`);
    carregarPainelMestre();
}
async function alternarVidaMestre(id, vivo) {
    const novo = !vivo;
    await supabaseClient.from('cacadores').update({ vivo: novo }).eq('id', id);
    adicionarLog(id, `Status vital alterado para ${novo ? 'VIVO' : 'MORTO'} pelo Mestre.`);
    carregarPainelMestre();
}
async function atualizarNeutralidadeMestre(id, neutralidade) {
    await supabaseClient.from('cacadores').update({ neutralidade }).eq('id', id);
    adicionarLog(id, `Neutralidade alterada para ${neutralidade} pelo Mestre.`);
    carregarPainelMestre();
}
async function ajustarAtributoMestre(id, atributo, valorAtual, delta) {
    const novo = Math.max(0, valorAtual + delta);
    const { error } = await supabaseClient.from('cacadores').update({ [atributo]: novo }).eq('id', id);
    if (!error) {
        const span = document.getElementById(`attr-${id}-${atributo}`);
        if (span) {
            span.textContent = novo;
            const btns = span.parentElement?.querySelectorAll('button');
            btns?.[0]?.setAttribute('onclick', `ajustarAtributoMestre('${id}','${atributo}',${novo},-1)`);
            btns?.[1]?.setAttribute('onclick', `ajustarAtributoMestre('${id}','${atributo}',${novo},+1)`);
        }
        adicionarLog(id, `${atributo.charAt(0).toUpperCase()+atributo.slice(1)} ajustado para ${novo} pelo Mestre.`);
    }
}
async function salvarHpMestre(id) {
    const val = parseInt(document.getElementById(`hp-${id}`)?.value ?? 0);
    await supabaseClient.from('cacadores').update({ hp_atual: val }).eq('id', id);
    adicionarLog(id, `HP ajustado para ${val} pelo Mestre.`);
}
async function salvarRecursoMestre(id) {
    const val = parseInt(document.getElementById(`rec-${id}`)?.value ?? 0);
    await supabaseClient.from('cacadores').update({ recurso_atual: val }).eq('id', id);
    adicionarLog(id, `Recurso ajustado para ${val} pelo Mestre.`);
}
async function atualizarRecursoTipoMestre(id, tipo) {
    await supabaseClient.from('cacadores').update({ recurso_tipo: tipo }).eq('id', id);
    adicionarLog(id, `Tipo de recurso alterado para ${tipo} pelo Mestre.`);
    carregarPainelMestre();
}
async function atualizarExaustaoMestre(id, nivel) {
    const lvl = parseInt(nivel);
    await supabaseClient.from('cacadores').update({ exaustao: lvl }).eq('id', id);
    adicionarLog(id, `Estado físico: nível ${lvl} — ${EXAUSTAO[lvl-1]?.label}.`);
}
async function injetarItemMestre(id) {
    const input   = document.getElementById(`item-${id}`);
    const rankSel = document.getElementById(`rank-item-${id}`);
    if (!input?.value.trim()) return;
    const { data } = await supabaseClient.from('cacadores').select('inventario').eq('id', id).single();
    const inv = Array.isArray(data?.inventario) ? data.inventario : [];
    const rank = rankSel?.value || 'E';
    inv.push(serializarItem(input.value.trim(), rank));
    await supabaseClient.from('cacadores').update({ inventario: inv }).eq('id', id);
    adicionarLog(id, `Item [${rank}] "${input.value.trim()}" adicionado ao inventário pelo Mestre.`);
    input.value = '';
    carregarPainelMestre();
}
async function injetarPoderMestre(id) {
    const input   = document.getElementById(`poder-${id}`);
    const rankSel = document.getElementById(`rank-poder-${id}`);
    if (!input?.value.trim()) return;
    const { data } = await supabaseClient.from('cacadores').select('poderes').eq('id', id).single();
    const pods = Array.isArray(data?.poderes) ? data.poderes : [];
    const rank = rankSel?.value || 'E';
    pods.push(serializarItem(input.value.trim(), rank));
    await supabaseClient.from('cacadores').update({ poderes: pods }).eq('id', id);
    adicionarLog(id, `Habilidade [${rank}] "${input.value.trim()}" concedida pelo Mestre.`);
    input.value = '';
    carregarPainelMestre();
}
async function removerItemMestre(id, index) {
    const { data } = await supabaseClient.from('cacadores').select('inventario').eq('id', id).single();
    const inv = Array.isArray(data?.inventario) ? data.inventario : [];
    const removido = parseItem(inv.splice(index, 1)[0]);
    await supabaseClient.from('cacadores').update({ inventario: inv }).eq('id', id);
    adicionarLog(id, `Item "${removido.nome}" removido do inventário pelo Mestre.`);
    carregarPainelMestre();
}
async function removerPoderMestre(id, index) {
    const { data } = await supabaseClient.from('cacadores').select('poderes').eq('id', id).single();
    const pods = Array.isArray(data?.poderes) ? data.poderes : [];
    const removido = parseItem(pods.splice(index, 1)[0]);
    await supabaseClient.from('cacadores').update({ poderes: pods }).eq('id', id);
    adicionarLog(id, `Habilidade "${removido.nome}" removida pelo Mestre.`);
    carregarPainelMestre();
}
async function concederTituloMestre(id) {
    const input = document.getElementById(`titulo-${id}`);
    if (!input?.value.trim()) return;
    const { data } = await supabaseClient.from('cacadores').select('titulos').eq('id', id).single();
    const tits = Array.isArray(data?.titulos) ? data.titulos : [];
    tits.push(input.value.trim());
    await supabaseClient.from('cacadores').update({ titulos: tits }).eq('id', id);
    adicionarLog(id, `Título "${input.value.trim()}" concedido pelo Mestre.`);
    input.value = '';
    carregarPainelMestre();
}
async function removerTituloMestre(id, index) {
    const { data } = await supabaseClient.from('cacadores').select('titulos').eq('id', id).single();
    const tits = Array.isArray(data?.titulos) ? data.titulos : [];
    const removido = tits.splice(index, 1)[0];
    await supabaseClient.from('cacadores').update({ titulos: tits }).eq('id', id);
    adicionarLog(id, `Título "${removido}" removido pelo Mestre.`);
    carregarPainelMestre();
}
async function eliminarPersonagemMestre(id, nome) {
    if (confirm(`⚠️ Apagar o caçador "${nome}" para sempre do banco?`)) {
        const { error } = await supabaseClient.from('cacadores').delete().eq('id', id);
        if (error) alert('Erro ao deletar: ' + error.message);
        else { alert(`🔥 ${nome} foi apagado do registro.`); carregarPainelMestre(); }
    }
}

// ==========================================
// CONQUISTAS — MESTRE DESBLOQUEIA
// ==========================================
async function toggleConquistaMestre(id, conquistaId, estaDesbloqueada) {
    const { data, error } = await supabaseClient.from('cacadores').select('conquistas_desbloqueadas').eq('id', id).single();
    if (error || !data) { alert('Erro ao buscar conquistas.'); return; }
    let lista = Array.isArray(data.conquistas_desbloqueadas) ? [...data.conquistas_desbloqueadas] : [];
    if (estaDesbloqueada) {
        lista = lista.filter(c => c !== conquistaId);
    } else {
        if (!lista.includes(conquistaId)) lista.push(conquistaId);
    }
    await supabaseClient.from('cacadores').update({ conquistas_desbloqueadas: lista }).eq('id', id);
    const conq = typeof CONQUISTAS !== 'undefined' ? CONQUISTAS.find(c => c.id === conquistaId) : null;
    const acao = estaDesbloqueada ? 'Conquista removida' : 'Conquista desbloqueada';
    const nome = conq ? conq.nome : conquistaId;
    adicionarLog(id, `${acao}: "${nome}" pelo Mestre.`);
    carregarPainelMestre();
}

// ==========================================
// REALTIME
// ==========================================
function escutarMudancasEmTempoReal() {
    supabaseClient.channel('mudancas_cacadores')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cacadores' }, (payload) => {
            carregarListaPublica();
            if (mestreAutenticado) carregarPainelMestre();
            if (playerLogado && payload.new && payload.new.id === playerLogado.id) {
                playerLogado = payload.new;
                renderizarHudPlayer();
            }
        }).subscribe();
}
