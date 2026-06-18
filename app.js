// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = "https://hsdxvlfpyrmfqthjqfpi.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZHh2bGZweXJtZnF0aGpxZnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTEzNDUsImV4cCI6MjA5NzM4NzM0NX0.E0McNITvCMzxWw4ZUQPeacLZF4lnISSnUHjk_Ff_ngo";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let playerLogado = null;
let mestreAutenticado = false;
const CHAVE_MESTRE_PADRAO = "mestre123"; 

window.addEventListener('DOMContentLoaded', () => {
    carregarListaPublica();
    escutarMudancasEmTempoReal();
});

// ==========================================
// CONTROLE DE NAVEGAÇÃO (ABAS)
// ==========================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('block'));
    
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('active', 'text-cyan-400', 'font-bold');
        el.classList.add('text-slate-400', 'font-medium');
    });

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('block');
    }

    const targetBtn = document.getElementById(`btn-${tabName}`);
    if (targetBtn) {
        targetBtn.classList.add('active', 'text-cyan-400', 'font-bold');
        targetBtn.classList.remove('text-slate-400', 'font-medium');
    }

    // CORREÇÃO: Garante o carregamento se a aba for lista ou caçadores
    if (tabName === 'lista' || tabName === 'grid') carregarListaPublica();
    if (tabName === 'mestre' && mestreAutenticado) carregarPainelMestre();
    if (tabName === 'player' && playerLogado) renderizarHudPlayer();
}

// ==========================================
// SISTEMA DE CADASTRO (RECRUTAMENTO)
// ==========================================
async function registrarPersonagem(event) {
    event.preventDefault();

    const nome = document.getElementById('reg-nome').value.trim();
    const raca = document.getElementById('reg-raca').value.trim();
    const classe = document.getElementById('reg-classe').value.trim();
    const clan = document.getElementById('reg-clan').value.trim() || "Nenhum";
    const obra_origem = document.getElementById('reg-obra').value.trim();
    const senha = document.getElementById('reg-senha').value;
    
    let url_aparencia = "";
    const fileInput = document.getElementById('reg-file');

    // Se o usuário fez upload de um arquivo local, converte para Base64
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        url_aparencia = await converterParaBase64(file);
    } else {
        // Fallback caso use o campo antigo de texto link
        const urlInput = document.getElementById('reg-url');
        url_aparencia = urlInput ? urlInput.value.trim() : "";
    }

    if (!nome || !senha || !raca || !classe || !obra_origem) {
        alert("⚠️ Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const { data, error } = await supabaseClient
        .from('cacadores')
        .insert([
            { nome, senha, raca, classe, clan, obra_origem, url_aparencia }
        ])
        .select();

    if (error) {
        if (error.code === '23505') {
            alert('❌ Erro: Este Nome de Personagem já está em uso!');
        } else {
            alert('❌ Erro ao registrar: ' + error.message);
        }
    } else {
        alert('⚡ O SISTEMA TE ESCOLHEU! Registro concluído com sucesso.');
        document.getElementById('form-cadastro').reset();
        switchTab('player');
        document.getElementById('login-nome').value = nome;
    }
}

// Função utilitária para transformar o arquivo local em string de texto
function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ==========================================
// SISTEMA DE LOGIN E RENDERIZAÇÃO DO JOGADOR
// ==========================================
async function autenticarPlayer() {
    const nome = document.getElementById('login-nome').value.trim();
    const senha = document.getElementById('login-senha').value;

    const { data, error } = await supabaseClient
        .from('cacadores')
        .select('*')
        .eq('nome', nome)
        .eq('senha', senha)
        .maybeSingle();

    if (error || !data) {
        alert('❌ Nome ou senha incorretos.');
        return;
    }

    playerLogado = data;
    document.getElementById('player-login-box').classList.add('hidden');
    renderizarHudPlayer();
}

function renderizarHudPlayer() {
    const hud = document.getElementById('player-hud');
    if (!hud) return;
    hud.classList.remove('hidden');

    const p = playerLogado;
    const mortoClass = !p.vivo ? 'avatar-morto' : '';
    const statusVital = p.vivo 
        ? `<span class="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-xs font-bold">VIVO</span>`
        : `<span class="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-xs font-bold">CONDIÇÃO: MORTO</span>`;

    let itensHTML = p.inventario.length === 0 ? '<p class="text-xs text-slate-500 italic">Inventário vazio.</p>' : '';
    p.inventario.forEach(i => { itensHTML += `<div class="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300">📦 ${i}</div>`; });

    let poderesHTML = p.poderes.length === 0 ? '<p class="text-xs text-slate-500 italic">Nenhum poder manifestado.</p>' : '';
    p.poderes.forEach(pod => { poderesHTML += `<div class="bg-slate-950 border border-purple-900/50 rounded px-2 py-1 text-xs text-purple-300">🔥 ${pod}</div>`; });

    hud.innerHTML = `
        <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            <div class="flex gap-4 items-center">
                <img src="${p.url_aparencia}" class="w-20 h-20 object-cover rounded-xl border-2 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] ${mortoClass}">
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-black tracking-wide text-slate-100 uppercase">${p.nome}</h2>
                        <span class="text-xl font-black text-cyan-400 font-mono bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">RANK ${p.rank}</span>
                    </div>
                    <p class="text-xs text-slate-400">${p.classe} • ${p.raca}</p>
                    <p class="text-xs text-slate-500 mt-1">Clã: ${p.clan} (${p.obra_origem})</p>
                </div>
            </div>

            <div class="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                <div class="text-xs text-slate-400">Neutralidade: <span class="text-amber-400 font-bold">${p.neutralidade}</span></div>
                ${statusVital}
            </div>

            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Atributos do Caçador</h3>
                    ${p.pontos_distribuir > 0 ? `<span class="text-xs bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black animate-bounce">⚡ +${p.pontos_distribuir} PONTOS</span>` : ''}
                </div>
                
                ${['forca', 'agilidade', 'vitalidade', 'inteligencia', 'sentido'].map(attr => `
                    <div class="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-900">
                        <span class="text-xs uppercase font-semibold text-slate-400">${attr === 'forca' ? '💪 Força' : attr === 'agilidade' ? '⚡ Agilidade' : attr === 'vitalidade' ? '❤️ Vitalidade' : attr === 'inteligencia' ? '🔮 Inteligência' : '👁️ Sentido'}</span>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-mono font-bold text-slate-200">${p[attr]}</span>
                            ${p.pontos_distribuir > 0 && p.vivo ? `<button onclick="distribuirPonto('${attr}')" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold w-6 h-6 rounded flex items-center justify-center text-xs transition">+</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
                <div class="space-y-1.5">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventário</h4>
                    <div class="space-y-1 max-h-36 overflow-y-auto">${itensHTML}</div>
                </div>
                <div class="space-y-1.5">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Habilidades</h4>
                    <div class="space-y-1 max-h-36 overflow-y-auto">${poderesHTML}</div>
                </div>
            </div>
            
            <button onclick="document.location.reload()" class="w-full text-center text-xs text-slate-500 hover:text-slate-400 pt-2">Desconectar da Janela</button>
        </div>
    `;
}

async function distribuirPonto(atributo) {
    if (!playerLogado || playerLogado.pontos_distribuir <= 0) return;

    const novoValorAtributo = playerLogado[atributo] + 1;
    const novosPontos = playerLogado.pontos_distribuir - 1;

    const { data, error } = await supabaseClient
        .from('cacadores')
        .update({ [atributo]: novoValorAtributo, pontos_distribuir: novosPontos })
        .eq('id', playerLogado.id)
        .select()
        .single();

    if (!error && data) {
        playerLogado = data;
        renderizarHudPlayer();
    }
}

// ==========================================
// RENDERIZAÇÃO DA LISTA PÚBLICA (CAÇADORES)
// ==========================================
async function carregarListaPublica() {
    const container = document.getElementById('lista-cacadores-container');
    if (!container) return;

    const { data: cacadores, error } = await supabaseClient
        .from('cacadores')
        .select('*')
        .order('rank', { ascending: false });

    if (error) return;

    container.innerHTML = '';
    cacadores.forEach(c => {
        const mortoClass = !c.vivo ? 'avatar-morto' : '';
        const badgeVivo = !c.vivo ? `<span class="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 rounded font-black">MORTO</span>` : '';
        
        container.innerHTML += `
            <div class="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex gap-3 items-center">
                <img src="${c.url_aparencia}" class="w-14 h-14 object-cover rounded-lg border border-slate-700 ${mortoClass}">
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <h3 class="text-sm font-bold text-slate-200 truncate uppercase">${c.nome} ${badgeVivo}</h3>
                        <span class="text-xs font-mono font-black text-purple-400 bg-purple-950/40 border border-purple-900/60 px-2 rounded">RANK ${c.rank}</span>
                    </div>
                    <p class="text-xs text-slate-400 truncate">${c.classe} • Clã ${c.clan}</p>
                    <p class="text-[10px] text-slate-500 italic truncate">Aparência: ${c.obra_origem}</p>
                </div>
            </div>
        `;
    });
}

// ==========================================
// PAINEL DE CONTROLE DO MESTRE (ADMIN)
// ==========================================
function autenticarMestre() {
    const chave = document.getElementById('mestre-chave').value;
    if (chave === CHAVE_MESTRE_PADRAO) {
        mestreAutenticado = true;
        document.getElementById('mestre-login-box').classList.add('hidden');
        carregarPainelMestre();
    } else {
        alert('❌ Chave de Administrador Inválida!');
    }
}

function deslogarMestre() {
    mestreAutenticado = false;
    document.getElementById('mestre-hud').classList.add('hidden');
    document.getElementById('mestre-login-box').classList.remove('hidden');
    document.getElementById('mestre-chave').value = '';
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
        
        container.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 relative">
                <!-- Botão de Apagar Personagem -->
                <button onclick="eliminarPersonagemMestre('${p.id}', '${p.nome}')" class="absolute top-2 right-2 text-slate-500 hover:text-red-500 text-xs font-bold px-1 transition" title="Excluir Permanentemente">❌ Apagar</button>
                
                <div class="flex items-center gap-3 pr-16 border-b border-slate-800/60 pb-2">
                    <!-- CORREÇÃO: Foto do Caçador renderizada no Dashboard do Mestre -->
                    <img src="${p.url_aparencia}" class="w-11 h-11 object-cover rounded-lg border ${mortoClass} shadow-inner flex-shrink-0">
                    
                    <div class="min-w-0 flex-1">
                        <h4 class="text-sm font-bold text-slate-200 uppercase truncate">${p.nome} <span class="text-xs text-slate-500">(Rank ${p.rank})</span></h4>
                        <p class="text-xs text-slate-400">Pontos para gastar: <span class="text-cyan-400 font-bold">${p.pontos_distribuir}</span></p>
                    </div>
                    <select onchange="atualizarRankMestre('${p.id}', this.value)" class="bg-slate-950 border border-slate-700 text-xs rounded p-1 text-slate-300 ml-2">
                        ${['E','D','C','B','A','S'].map(r => `<option value="${r}" ${p.rank === r ? 'selected' : ''}>Rank ${r}</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    <button onclick="concederPontosMestre('${p.id}', ${p.pontos_distribuir}, 5)" class="bg-slate-950 border border-slate-800 text-xs py-1 text-cyan-400 rounded hover:bg-slate-800 transition">+5 Pontos</button>
                    <button onclick="alternarVidaMestre('${p.id}', ${p.vivo})" class="text-xs py-1 rounded transition ${p.vivo ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400' : 'bg-red-950/50 border border-red-800 text-red-400'}">
                        ${p.vivo ? '🟢 Vivo' : '🔴 Morto'}
                    </button>
                    <select onchange="atualizarNeutralidadeMestre('${p.id}', this.value)" class="bg-slate-950 border border-slate-800 text-[10px] rounded text-amber-400 p-1">
                        ${['Neutro','Herói','Vilão','Caótico'].map(n => `<option value="${n}" ${p.neutralidade === n ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-1">
                    <div class="flex gap-1">
                        <input type="text" placeholder="Novo Item..." id="item-${p.id}" class="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-100">
                        <button onclick="injetarItemMestre('${p.id}', '${escapeHtml(JSON.stringify(p.inventario))}')" class="bg-purple-900 text-white px-2 rounded text-xs">+</button>
                    </div>
                    <div class="flex gap-1">
                        <input type="text" placeholder="Novo Poder..." id="poder-${p.id}" class="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-100">
                        <button onclick="injetarPoderMestre('${p.id}', '${escapeHtml(JSON.stringify(p.poderes))}')" class="bg-indigo-900 text-white px-2 rounded text-xs">+</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function escapeHtml(str) {
    return str.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

async function atualizarRankMestre(id, novoRank) {
    await supabaseClient.from('cacadores').update({ rank: novoRank }).eq('id', id);
    carregarPainelMestre();
}

async function concederPontosMestre(id, pontosAtuais, qtd) {
    await supabaseClient.from('cacadores').update({ pontos_distribuir: pontosAtuais + qtd }).eq('id', id);
    carregarPainelMestre();
}

async function alternarVidaMestre(id, statusVivo) {
    await supabaseClient.from('cacadores').update({ vivo: !statusVivo }).eq('id', id);
    carregarPainelMestre();
}

async function atualizarNeutralidadeMestre(id, novaNeut) {
    await supabaseClient.from('cacadores').update({ neutralidade: novaNeut }).eq('id', id);
    carregarPainelMestre();
}

async function injetarItemMestre(id, inventarioJson) {
    const input = document.getElementById(`item-${id}`);
    if (!input || !input.value.trim()) return;
    const inv = JSON.parse(inventarioJson);
    inv.push(input.value.trim());
    await supabaseClient.from('cacadores').update({ inventario: inv }).eq('id', id);
    input.value = '';
    carregarPainelMestre();
}

async function injetarPoderMestre(id, poderesJson) {
    const input = document.getElementById(`poder-${id}`);
    if (!input || !input.value.trim()) return;
    const pods = JSON.parse(poderesJson);
    pods.push(input.value.trim());
    await supabaseClient.from('cacadores').update({ poderes: pods }).eq('id', id);
    input.value = '';
    carregarPainelMestre();
}

async function eliminarPersonagemMestre(id, nome) {
    if (confirm(`⚠️ Tem certeza absoluta que deseja apagar o caçador "${nome}" para sempre do banco?`)) {
        const { error } = await supabaseClient.from('cacadores').delete().eq('id', id);
        if (error) {
            alert("Erro ao deletar: " + error.message);
        } else {
            alert(`🔥 O caçador ${nome} foi apagado do registro universal.`);
            carregarPainelMestre();
        }
    }
}

// ==========================================
// MOTOR REALTIME (ATUALIZAÇÃO SEM F5)
// ==========================================
function escutarMudancasEmTempoReal() {
    supabaseClient
        .channel('mudancas_cacadores')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cacadores' }, (payload) => {
            carregarListaPublica();
            
            if (mestreAutenticado) carregarPainelMestre();

            if (playerLogado && payload.new && payload.new.id === playerLogado.id) {
                playerLogado = payload.new;
                renderizarHudPlayer();
            }
        })
        .subscribe();
}