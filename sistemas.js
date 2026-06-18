// ============================================================
// CROSS ARISE SYSTEM — sistemas.js
// Toda a lógica da aba Sistemas
// ============================================================

// ==========================================
// DADOS GLOBAIS (acessíveis de app.js também)
// ==========================================
const CONQUISTAS = [
    { id:'c01', icone:'🌟', nome:'Primeiro Chamado',     descricao:'Caçador registrado e aceito pelo Sistema.' },
    { id:'c02', icone:'💀', nome:'Além da Morte',        descricao:'Foi marcado como morto pelo Sistema.' },
    { id:'c03', icone:'🩸', nome:'Retorno das Cinzas',   descricao:'Foi morto e voltou a viver.' },
    { id:'c04', icone:'⚡', nome:'Distribuidor',         descricao:'Distribuiu 10 ou mais pontos de atributo.' },
    { id:'c05', icone:'📦', nome:'Acumulador',           descricao:'Possui 5 ou mais itens no inventário.' },
    { id:'c06', icone:'🔥', nome:'Portador de Poder',    descricao:'Possui 5 ou mais habilidades.' },
    { id:'c07', icone:'🦹', nome:'Do Lado das Sombras',  descricao:'Neutralidade definida como Vilão.' },
    { id:'c08', icone:'🦸', nome:'Guardião da Luz',      descricao:'Neutralidade definida como Herói.' },
    { id:'c09', icone:'🌀', nome:'Caótico por Natureza', descricao:'Neutralidade definida como Caótico.' },
    { id:'c10', icone:'⬆️', nome:'Elite dos Caçadores',  descricao:'Atingiu o Rank A.' },
    { id:'c11', icone:'👑', nome:'Lendário',             descricao:'Atingiu o Rank S.' },
    { id:'c12', icone:'🏷️', nome:'Batizado',             descricao:'Recebeu seu primeiro título.' },
    { id:'c13', icone:'🏆', nome:'Nobre dos Títulos',    descricao:'Possui 3 ou mais títulos simultâneos.' },
    { id:'c14', icone:'👑', nome:'Monarca',              descricao:'Possui 5 ou mais títulos simultâneos.' },
    { id:'c15', icone:'🔨', nome:'Aprendiz da Forja',    descricao:'Realizou sua primeira fusão.' },
    { id:'c16', icone:'⚙️', nome:'Mestre da Forja',      descricao:'Realizou 5 ou mais fusões na Forja.' },
    { id:'c17', icone:'💪', nome:'Força Bruta',          descricao:'Força base atingiu 20 ou mais.' },
    { id:'c18', icone:'🧠', nome:'Mente Brilhante',      descricao:'Inteligência base atingiu 20 ou mais.' },
    { id:'c19', icone:'🌪️', nome:'Velocidade Absurda',   descricao:'Agilidade base atingiu 20 ou mais.' },
    { id:'c20', icone:'🌌', nome:'Além dos Limites',     descricao:'Poder Total (soma dos atributos) superior a 100.' },
];

const RACAS = [
    { nome:'Humano',        bônus:'+1 em todos os atributos',                   descricao:'Versátil e adaptável. A raça mais comum entre caçadores.',                          icone:'👤' },
    { nome:'Elfo',          bônus:'+3 Agilidade, +3 Inteligência',              descricao:'Ágil, sábio e de vida longa. Excelente para magos e arqueiros.',                    icone:'🌿' },
    { nome:'Meio-Elfo',     bônus:'+2 em dois atributos à escolha',             descricao:'Herdeiros de dois mundos. Flexíveis e equilibrados.',                              icone:'🍃' },
    { nome:'Anão',          bônus:'+4 Vitalidade, +2 Força',                    descricao:'Resistentes como a rocha. Mestres em forja e defesa.',                             icone:'⛏️' },
    { nome:'Orc',           bônus:'+5 Força, −2 Inteligência',                  descricao:'Guerreiros natos. Força devastadora mas pensamento mais lento.',                    icone:'🪓' },
    { nome:'Dragão-Sangue', bônus:'+3 Vitalidade, +3 Inteligência',             descricao:'Descendentes de dragões. Possuem magia elemental inata.',                          icone:'🐉' },
    { nome:'Demoníaco',     bônus:'+4 Inteligência, tende ao Caótico',          descricao:'Marcados pelas trevas. Poder imenso, mas difíceis de controlar.',                  icone:'😈' },
    { nome:'Divino',        bônus:'+3 Sentido, +2 Vitalidade',                  descricao:'Abençoados por entidades superiores. Percepção além do normal.',                   icone:'✨' },
    { nome:'Não-Morto',     bônus:'+4 Vitalidade, resistência a status',        descricao:'Revividos pelo Sistema. Imunes a veneno e sangramento.',                           icone:'💀' },
    { nome:'Besta',         bônus:'+4 Agilidade, +3 Sentido',                   descricao:'Metade humano, metade animal. Instintos afiados e movimento rápido.',              icone:'🐺' },
];

const CLASSES = [
    { nome:'Guerreiro',              recurso:'Energia', foco:'Força + Vitalidade',          descricao:'Combate corpo a corpo. Linha de frente. Alta resistência e dano físico.',          icone:'⚔️' },
    { nome:'Mago',                   recurso:'Mana',    foco:'Inteligência',                descricao:'Magia arcana de longo alcance. Frágil mas devastador.',                            icone:'🔮' },
    { nome:'Assassino',              recurso:'Energia', foco:'Agilidade',                   descricao:'Ataques rápidos e furtivos. Golpe nas sombras, some antes de ser visto.',          icone:'🗡️' },
    { nome:'Curandeiro',             recurso:'Mana',    foco:'Inteligência + Sentido',      descricao:'Suporte vital do grupo. Cura e buffs. Insubstituível em expedições longas.',       icone:'💚' },
    { nome:'Arqueiro',               recurso:'Energia', foco:'Agilidade + Sentido',         descricao:'Precisão à distância. Domina terrenos abertos e masmorras de corredor.',          icone:'🏹' },
    { nome:'Cavaleiro das Sombras',  recurso:'Mana',    foco:'Força + Inteligência',        descricao:'Une magia sombria e combate físico. Um dos mais raros e temidos.',                icone:'🛡️' },
    { nome:'Invocador',              recurso:'Mana',    foco:'Inteligência',                descricao:'Evoca criaturas e espíritos para lutar em seu lugar. Frágil solo.',               icone:'🌀' },
    { nome:'Ferreiro de Masmorra',   recurso:'Energia', foco:'Vitalidade + Força',          descricao:'Cria, repara e forja equipamentos mesmo dentro das masmorras.',                   icone:'🔨' },
    { nome:'Necromante',             recurso:'Mana',    foco:'Inteligência',                descricao:'Controla mortos e drena vida. Temido e banido em muitas cidades.',                icone:'💀' },
    { nome:'Paladino',               recurso:'Mana',    foco:'Vitalidade + Sentido',        descricao:'Defesa sagrada. Escudo do grupo, canaliza poder divino.',                         icone:'🌟' },
];

const BESTARIO = [
    { nome:'Goblin Batedeiro',          rank:'E', hp:30,   poder:5,   descricao:'Criaturas pequenas e covardes. Atacam em grupos. Fácil individualmente.',              icone:'👺', recompensa:'5-10 moedas' },
    { nome:'Lobo das Trevas',           rank:'E', hp:50,   poder:8,   descricao:'Rápido e perigoso em matilha. Usa o ambiente escuro a seu favor.',                    icone:'🐺', recompensa:'8-15 moedas' },
    { nome:'Esqueleto Guerreiro',       rank:'D', hp:80,   poder:14,  descricao:'Morto-vivo armado. Resistente a dano físico. Use magia ou fogo.',                     icone:'💀', recompensa:'20-35 moedas' },
    { nome:'Troll das Cavernas',        rank:'D', hp:120,  poder:20,  descricao:'Regenera HP lentamente. Fogo ou ácido impede a regeneração.',                         icone:'🪨', recompensa:'40-60 moedas' },
    { nome:'Harpia Furiosa',            rank:'C', hp:200,  poder:35,  descricao:'Voa em alta velocidade e ataca com garras. Arqueiros são ideais.',                    icone:'🦅', recompensa:'100-150 moedas' },
    { nome:'Golem de Pedra',            rank:'C', hp:350,  poder:40,  descricao:'Imune a golpes físicos fracos. Magia elemental e armas pesadas são eficazes.',        icone:'🗿', recompensa:'120-180 moedas' },
    { nome:'Ogro Campeão',              rank:'B', hp:500,  poder:60,  descricao:'Força bruta devastadora. Um golpe pode quebrar formações inteiras.',                   icone:'👹', recompensa:'300-450 moedas' },
    { nome:'Wyvern Negra',              rank:'B', hp:600,  poder:70,  descricao:'Veneno paralisante e voo rápido. Abata no ar antes que pouse.',                       icone:'🐲', recompensa:'400-550 moedas' },
    { nome:'Lich Arcano',               rank:'A', hp:800,  poder:90,  descricao:'Lança magia de alto nível. Possui ficha de vida em um pergaminho escondido.',          icone:'👁️', recompensa:'800-1200 moedas' },
    { nome:'Dragão Crepuscular',        rank:'A', hp:1200, poder:110, descricao:'Fogo que derrete armaduras de aço. Exige grupo de elite coordenado.',                 icone:'🔥', recompensa:'1500-2500 moedas' },
    { nome:'Rei dos Demônios',          rank:'S', hp:2000, poder:180, descricao:'Chefe de masmorra de nível S. Controla exércitos de demônios menores.',               icone:'😈', recompensa:'5000+ moedas + item lendário' },
    { nome:'O Monarca das Sombras',     rank:'S', hp:9999, poder:999, descricao:'Registros: [DADOS APAGADOS]. Aviso: sobreviventes = nenhum documentado.',             icone:'🌑', recompensa:'???' },
];

const LOJA_ITENS = [
    { nome:'Espada Curta',         rank:'E', preco:'50',    descricao:'Lâmina básica e confiável.',                icone:'🗡️' },
    { nome:'Cajado do Novato',     rank:'E', preco:'60',    descricao:'Conduz magia básica.',                      icone:'🪄' },
    { nome:'Armadura de Couro',    rank:'E', preco:'80',    descricao:'Proteção leve para iniciantes.',            icone:'🥋' },
    { nome:'Poção de Cura',        rank:'E', preco:'30',    descricao:'Restaura HP moderadamente.',                icone:'🧪' },
    { nome:'Arco Élfico',          rank:'D', preco:'150',   descricao:'Leveza e precisão élfica.',                 icone:'🏹' },
    { nome:'Elixir de Mana',       rank:'D', preco:'100',   descricao:'Restaura Mana completamente.',              icone:'💙' },
    { nome:'Espada Longa',         rank:'D', preco:'200',   descricao:'Alcance e poder médios.',                   icone:'⚔️' },
    { nome:'Grimório das Runas',   rank:'C', preco:'500',   descricao:'Amplifica magias em 30%.',                  icone:'📖' },
    { nome:'Adaga das Sombras',    rank:'B', preco:'1.200', descricao:'Feita de aço sombrio. Perfura armaduras.',  icone:'🔪' },
    { nome:'Escudo Divino',        rank:'A', preco:'3.000', descricao:'Abençoado pelos deuses. Bloqueia magia.',   icone:'🛡️' },
];

const MAPA_REGIOES = [
    { nome:'Cidade de Asakura',              tipo:'🏙️ Cidade',    descricao:'Ponto de partida. Centro de comércio e recrutamento de caçadores.' },
    { nome:'Floresta das Almas Perdidas',    tipo:'🌲 Exploração', descricao:'Masmorras de Rank E e D. Criaturas sombrias e segredos enterrados.' },
    { nome:'Montanhas do Dragão Adormecido', tipo:'⛰️ Exploração', descricao:'Masmorras de Rank C e B. Temperatura extrema. Dragões menores patrulham.' },
    { nome:'Planície dos Caçadores',         tipo:'🌾 Campo',      descricao:'Zona de treino e confrontos entre clãs. Sem masmorras, mas não é segura.' },
    { nome:'Masmorra do Abismo',             tipo:'🚪 Restrita',   descricao:'Acesso restrito pelo Mestre. Rank A exigido. Registros de retorno: escassos.' },
    { nome:'Torre dos Arcanos',              tipo:'🗼 Especial',   descricao:'Lar de magos e invocadores. Contém o maior acervo de grimorios.' },
    { nome:'Santuário do Monarca',           tipo:'❓ Desconhecido', descricao:'Localização não mapeada. Mencionado apenas em registros de Rank S.' },
];

const ATRIBUTOS_INFO = [
    { nome:'Força',        emoji:'💪', formula:'Dano Físico = Força × 2', descricao:'Determina o poder de golpes físicos, capacidade de carregar peso e resistência a recuo.' },
    { nome:'Agilidade',    emoji:'⚡', formula:'Evasão = Agilidade × 1.5', descricao:'Velocidade de ataque, chance de esquiva e velocidade de movimento. Essencial para assassinos.' },
    { nome:'Vitalidade',   emoji:'❤️', formula:'HP Máx = Vitalidade × 10', descricao:'Determina o total de Pontos de Vida. Cada ponto = +10 HP. Base de sobrevivência.' },
    { nome:'Inteligência', emoji:'🔮', formula:'Recurso Máx = Inteligência × 10 | Magia = Int × 2.5', descricao:'Potência de magias, tamanho do pool de Mana/Energia e resistência mágica.' },
    { nome:'Sentido',      emoji:'👁️', formula:'Percepção = Sentido × 1.8', descricao:'Percepção do ambiente, detecção de armadilhas, precisão em ataques à distância e iniciativa em combate.' },
];

let secaoAtiva = null;

// ==========================================
// PONTO DE ENTRADA
// ==========================================
function verificarAcessoSistemas() {
    const container = document.getElementById('sistemas-container');
    if (!container) return;
    if (!playerLogado) {
        renderizarLoginSistemas(container);
    } else {
        renderizarMenuSistemas(container);
    }
}

// ==========================================
// LOGIN INLINE (se não estiver logado)
// ==========================================
function renderizarLoginSistemas(container) {
    container.innerHTML = `
    <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div class="text-center space-y-2 border-b border-slate-800 pb-3">
            <div class="text-3xl">🔐</div>
            <h2 class="text-lg font-bold text-slate-200 uppercase tracking-wide">Acesso Restrito</h2>
            <p class="text-xs text-slate-400">Identifique-se para acessar os Sistemas do Cross Arise.</p>
        </div>
        <div class="space-y-3">
            <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nome do Personagem</label>
                <input type="text" id="sis-login-nome" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Senha</label>
                <input type="password" id="sis-login-senha" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition">
            </div>
            <button onclick="loginDeSistemas()" class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-bold py-2 rounded-lg text-sm transition uppercase tracking-wider">Acessar Sistema</button>
        </div>
    </div>`;
}

async function loginDeSistemas() {
    const nome  = document.getElementById('sis-login-nome')?.value.trim();
    const senha = document.getElementById('sis-login-senha')?.value;
    if (!nome || !senha) { alert('Preencha nome e senha.'); return; }
    mostrarLoading();
    const { data, error } = await supabaseClient.from('cacadores').select('*').eq('nome', nome).eq('senha', senha).maybeSingle();
    ocultarLoading();
    if (error || !data) { alert('❌ Nome ou senha incorretos.'); return; }
    playerLogado = data;
    // Sincroniza com a aba de Status também
    document.getElementById('player-login-box')?.classList.add('hidden');
    const hud = document.getElementById('player-hud');
    if (hud) { hud.classList.remove('hidden'); renderizarHudPlayer(); }
    // Abre o menu de sistemas
    const container = document.getElementById('sistemas-container');
    if (container) renderizarMenuSistemas(container);
}

// ==========================================
// MENU PRINCIPAL DE SISTEMAS
// ==========================================
function renderizarMenuSistemas(containerRef) {
    const container = containerRef || document.getElementById('sistemas-container');
    if (!container) return;
    secaoAtiva = null;

    const secoes = [
        { id:'racas',     icone:'🧬', nome:'Raças',         cor:'border-cyan-800/60 hover:border-cyan-600' },
        { id:'classes',   icone:'⚔️', nome:'Classes',        cor:'border-purple-800/60 hover:border-purple-600' },
        { id:'bestario',  icone:'👹', nome:'Bestiário',      cor:'border-red-800/60 hover:border-red-600' },
        { id:'mapa',      icone:'🗺️', nome:'Mapa',           cor:'border-emerald-800/60 hover:border-emerald-600' },
        { id:'atributos', icone:'💪', nome:'Atributos',      cor:'border-yellow-800/60 hover:border-yellow-600' },
        { id:'mana',      icone:'🔮', nome:'Mana & Energia', cor:'border-blue-800/60 hover:border-blue-600' },
        { id:'loja',      icone:'🏪', nome:'Loja',           cor:'border-amber-800/60 hover:border-amber-600' },
        { id:'forja',     icone:'🔥', nome:'Forja',          cor:'border-orange-800/60 hover:border-orange-600' },
        { id:'conquistas',icone:'🏆', nome:'Conquistas',     cor:'border-yellow-700/60 hover:border-yellow-500' },
    ];

    container.innerHTML = `
    <div class="space-y-4">
        <div class="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <img src="${playerLogado.url_aparencia}" class="w-10 h-10 object-cover rounded-lg border border-slate-700 flex-shrink-0">
            <div class="min-w-0">
                <p class="text-xs text-slate-400">Sistema acessado por:</p>
                <p class="text-sm font-black text-slate-100 uppercase truncate">${playerLogado.nome}</p>
            </div>
            <span class="ml-auto text-xs font-mono font-black text-cyan-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded flex-shrink-0">RANK ${playerLogado.rank}</span>
        </div>

        <p class="text-xs text-slate-500 font-bold uppercase tracking-widest text-center">Selecione um Módulo</p>

        <div class="grid grid-cols-3 gap-2">
            ${secoes.map(s => `
            <button onclick="abrirSecaoSistemas('${s.id}')"
                class="bg-slate-900/50 border ${s.cor} rounded-xl p-3 flex flex-col items-center gap-1.5 transition group">
                <span class="text-2xl group-hover:scale-110 transition-transform">${s.icone}</span>
                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wide text-center leading-tight">${s.nome}</span>
            </button>`).join('')}
        </div>
    </div>`;
}

// ==========================================
// NAVEGAÇÃO INTERNA
// ==========================================
function abrirSecaoSistemas(secao) {
    secaoAtiva = secao;
    const container = document.getElementById('sistemas-container');
    if (!container) return;
    const mapa = {
        racas: renderizarRacas,
        classes: renderizarClasses,
        bestario: renderizarBestario,
        mapa: renderizarMapa,
        atributos: renderizarAtributos,
        mana: renderizarSobreMana,
        loja: renderizarLoja,
        forja: renderizarForja,
        conquistas: renderizarConquistas,
    };
    if (mapa[secao]) mapa[secao](container);
}

function voltarMenuSistemas() {
    const container = document.getElementById('sistemas-container');
    if (container) renderizarMenuSistemas(container);
}

function _cabecalhoSecao(icone, titulo, cor = 'text-slate-200') {
    return `<div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <button onclick="voltarMenuSistemas()" class="text-slate-500 hover:text-cyan-400 transition text-sm font-bold px-1.5 py-0.5 rounded border border-slate-800 hover:border-cyan-800 bg-slate-950">← Voltar</button>
        <span class="text-lg">${icone}</span>
        <h2 class="text-sm font-black uppercase tracking-wide ${cor}">${titulo}</h2>
    </div>`;
}

// ==========================================
// 1. RAÇAS
// ==========================================
function renderizarRacas(container) {
    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('🧬','Raças Disponíveis','text-cyan-400')}
        ${RACAS.map(r => `
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1">
            <div class="flex items-center gap-2">
                <span class="text-xl">${r.icone}</span>
                <h3 class="text-sm font-black text-slate-100 uppercase">${r.nome}</h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">${r.descricao}</p>
            <div class="bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-800/60 mt-1">
                <span class="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Bônus Inicial: </span>
                <span class="text-[10px] text-cyan-300 font-mono">${r.bônus}</span>
            </div>
        </div>`).join('')}
    </div>`;
}

// ==========================================
// 2. CLASSES
// ==========================================
function renderizarClasses(container) {
    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('⚔️','Classes Disponíveis','text-purple-400')}
        ${CLASSES.map(c => `
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <span class="text-xl">${c.icone}</span>
                    <h3 class="text-sm font-black text-slate-100 uppercase">${c.nome}</h3>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 ${c.recurso === 'Mana' ? 'bg-purple-950/50 text-purple-400 border-purple-800' : 'bg-cyan-950/50 text-cyan-400 border-cyan-800'}">${c.recurso}</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">${c.descricao}</p>
            <div class="bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-800/60">
                <span class="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Foco em: </span>
                <span class="text-[10px] text-purple-300 font-mono">${c.foco}</span>
            </div>
        </div>`).join('')}
    </div>`;
}

// ==========================================
// 3. BESTIÁRIO
// ==========================================
function renderizarBestario(container) {
    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('👹','Bestiário','text-red-400')}
        ${BESTARIO.map(m => {
            const e = RANK_ESTILOS?.[m.rank] || { borda:'#475569', texto:'#94a3b8', fundo:'rgba(15,23,42,0.8)', glow:'', badge:'background:#1e293b;color:#94a3b8;border:1px solid #334155' };
            return `
        <div class="rounded-xl p-3 border space-y-2" style="background:${e.fundo};border-color:${e.borda};${e.glow?'box-shadow:'+e.glow:''}">
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${m.icone}</span>
                    <h3 class="text-sm font-black uppercase" style="color:${e.texto}">${m.nome}</h3>
                </div>
                <span style="${e.badge};font-size:10px;font-weight:900;padding:2px 8px;border-radius:4px;font-family:monospace">RANK ${m.rank}</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">${m.descricao}</p>
            <div class="flex gap-3 text-[10px] font-mono">
                <span class="text-red-400">❤️ HP: ${m.hp}</span>
                <span class="text-cyan-400">⚡ POD: ${m.poder}</span>
                <span class="text-amber-400">💰 ${m.recompensa}</span>
            </div>
        </div>`;
        }).join('')}
    </div>`;
}

// ==========================================
// 4. MAPA
// ==========================================
function renderizarMapa(container) {
    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('🗺️','Mapa do Mundo','text-emerald-400')}
        <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
            <div class="text-5xl mb-2">🌐</div>
            <p class="text-xs text-slate-400 italic">Mapa cartográfico em expansão. Regiões descobertas pelo Mestre serão reveladas.</p>
        </div>
        ${MAPA_REGIOES.map(r => `
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1">
            <div class="flex items-center justify-between gap-2">
                <h3 class="text-sm font-bold text-slate-200">${r.nome}</h3>
                <span class="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded flex-shrink-0">${r.tipo}</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">${r.descricao}</p>
        </div>`).join('')}
    </div>`;
}

// ==========================================
// 5. ATRIBUTOS
// ==========================================
function renderizarAtributos(container) {
    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('💪','Sistema de Atributos','text-yellow-400')}
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
            Cada ponto concedido pelo Mestre pode ser distribuído em qualquer atributo. A soma de todos os atributos define o <span class="text-cyan-400 font-bold">Poder Total</span> do caçador.
        </div>
        ${ATRIBUTOS_INFO.map(a => `
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div class="flex items-center gap-2">
                <span class="text-2xl">${a.emoji}</span>
                <h3 class="text-sm font-black text-slate-100 uppercase">${a.nome}</h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">${a.descricao}</p>
            <div class="bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-800/60">
                <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Fórmula: </span>
                <span class="text-[10px] text-yellow-300 font-mono">${a.formula}</span>
            </div>
        </div>`).join('')}
    </div>`;
}

// ==========================================
// 6. MANA & ENERGIA
// ==========================================
function renderizarSobreMana(container) {
    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('🔮','Sistema de Recursos','text-blue-400')}
        <div class="bg-purple-950/20 border border-purple-800/50 rounded-xl p-4 space-y-2">
            <h3 class="text-sm font-black text-purple-300 flex items-center gap-2">🔮 Mana</h3>
            <p class="text-xs text-slate-400 leading-relaxed">Usado por classes mágicas: Magos, Curandeiros, Invocadores, Necromantes, Cavaleiros das Sombras e Paladinos.</p>
            <p class="text-xs text-slate-400 leading-relaxed">Se o pool de Mana chegar a zero, o caçador não pode mais lançar magias até recuperar. Recupera com descanso ou Elixires de Mana.</p>
            <div class="bg-slate-950/60 rounded-lg px-3 py-1.5 border border-purple-900/40">
                <span class="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Fórmula: </span>
                <span class="text-[10px] text-purple-300 font-mono">Mana Máx = Inteligência × 10</span>
            </div>
        </div>
        <div class="bg-cyan-950/20 border border-cyan-800/50 rounded-xl p-4 space-y-2">
            <h3 class="text-sm font-black text-cyan-300 flex items-center gap-2">⚡ Energia</h3>
            <p class="text-xs text-slate-400 leading-relaxed">Usado por classes físicas: Guerreiros, Assassinos, Arqueiros e Ferreiros de Masmorra.</p>
            <p class="text-xs text-slate-400 leading-relaxed">Representa estamina física. Se zerar, o caçador fica exausto e sofre penalidades de movimento e ataque. Recupera com descanso e alimentos.</p>
            <div class="bg-slate-950/60 rounded-lg px-3 py-1.5 border border-cyan-900/40">
                <span class="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Fórmula: </span>
                <span class="text-[10px] text-cyan-300 font-mono">Energia Máx = Inteligência × 10</span>
            </div>
        </div>
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
            O tipo de recurso (Mana ou Energia) é definido pelo <span class="text-red-400 font-bold">Mestre</span> com base na classe e história do caçador.
        </div>
    </div>`;
}

// ==========================================
// 7. LOJA
// ==========================================
function renderizarLoja(container) {
    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('🏪','Loja do Sistema','text-amber-400')}
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
            Catálogo de itens disponíveis. Para adquirir, informe ao Mestre o item desejado durante a sessão.
        </div>
        ${LOJA_ITENS.map(item => {
            const e = RANK_ESTILOS?.[item.rank] || { borda:'#475569', texto:'#94a3b8', fundo:'rgba(15,23,42,0.8)', badge:'background:#1e293b;color:#94a3b8;border:1px solid #334155' };
            return `
        <div class="flex items-center gap-3 rounded-xl p-3 border" style="background:${e.fundo};border-color:${e.borda}">
            <span class="text-2xl flex-shrink-0">${item.icone}</span>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                    <span style="${e.badge};font-size:9px;font-weight:900;padding:1px 5px;border-radius:3px;font-family:monospace">${item.rank}</span>
                    <span class="text-xs font-bold" style="color:${e.texto}">${item.nome}</span>
                </div>
                <p class="text-[10px] text-slate-500">${item.descricao}</p>
            </div>
            <span class="text-xs font-mono font-black text-amber-400 flex-shrink-0">💰 ${item.preco}</span>
        </div>`;
        }).join('')}
    </div>`;
}

// ==========================================
// 8. FORJA
// ==========================================
function renderizarForja(containerRef) {
    const container = containerRef || document.getElementById('sistemas-container');
    if (!container) return;

    const inventario = Array.isArray(playerLogado?.inventario) ? playerLogado.inventario : [];

    // Agrupa itens por nome + rank (só conta parsed items)
    const grupos = {};
    inventario.forEach((str, idx) => {
        const item = parseItem(str);
        const key  = `${item.nome}__${item.rank}`;
        if (!grupos[key]) grupos[key] = { item, indices: [] };
        grupos[key].indices.push(idx);
    });

    // Filtra grupos com 2+ itens fusíveis (rank < S)
    const proxyRanks = { E:'D', D:'C', C:'B', B:'A', A:'S', S:'S' };
    const fusoesDisp = Object.values(grupos).filter(g => g.indices.length >= 2 && g.item.rank !== 'S_max');

    const fusoesHTML = fusoesDisp.length === 0
        ? `<div class="text-center py-6 space-y-2">
            <div class="text-4xl">⚙️</div>
            <p class="text-xs text-slate-500 italic">Nenhuma fusão disponível.<br>Você precisa de 2 itens com o mesmo nome e mesmo rank.</p>
           </div>`
        : fusoesDisp.map(g => {
            const e      = RANK_ESTILOS?.[g.item.rank] || { borda:'#475569', texto:'#94a3b8', fundo:'rgba(15,23,42,0.8)', badge:'background:#1e293b;color:#94a3b8;border:1px solid #334155' };
            const rankR  = proxyRanks[g.item.rank] || 'S';
            const eResult= RANK_ESTILOS?.[rankR] || e;
            const maxed  = g.item.rank === 'S';
            return `
        <div class="rounded-xl p-3 border space-y-2" style="background:${e.fundo};border-color:${e.borda}">
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                    <span style="${e.badge};font-size:9px;font-weight:900;padding:1px 5px;border-radius:3px;font-family:monospace">${g.item.rank}</span>
                    <span class="text-xs font-bold" style="color:${e.texto}">${g.item.nome}</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">${g.indices.length}x disponíveis</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-400">
                <span style="${e.badge};font-size:9px;padding:1px 5px;border-radius:3px;font-family:monospace;font-weight:900">${g.item.rank}</span>
                <span>+</span>
                <span style="${e.badge};font-size:9px;padding:1px 5px;border-radius:3px;font-family:monospace;font-weight:900">${g.item.rank}</span>
                <span>→</span>
                <span style="${eResult.badge};font-size:9px;padding:1px 5px;border-radius:3px;font-family:monospace;font-weight:900">${rankR}</span>
                <span style="color:${eResult.texto}" class="font-bold">${g.item.nome}</span>
                ${maxed ? '<span class="text-yellow-400 font-bold ml-1">(RANK MÁXIMO)</span>' : ''}
            </div>
            ${maxed
                ? `<button disabled class="w-full bg-slate-800 border border-slate-700 text-slate-600 text-xs font-bold py-1.5 rounded-lg cursor-not-allowed">Rank Máximo Atingido</button>`
                : `<button onclick="executarFusao('${g.item.nome.replace(/'/g,"\\'")}', '${g.item.rank}')"
                    class="w-full bg-gradient-to-r from-orange-900/60 to-red-900/60 hover:from-orange-800/80 hover:to-red-800/80 border border-orange-700 text-orange-300 font-bold py-1.5 rounded-lg text-xs transition uppercase tracking-wider">
                    🔥 Fundir (${g.item.rank} + ${g.item.rank} → ${rankR})
                   </button>`}
        </div>`;
        }).join('');

    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('🔥','Forja do Sistema','text-orange-400')}
        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 leading-relaxed space-y-1">
            <p>Junte <span class="text-orange-400 font-bold">2 itens de mesmo nome e mesmo Rank</span> para forjá-los em um item de Rank superior.</p>
            <p class="text-[10px] text-slate-500">E+E→D • D+D→C • C+C→B • B+B→A • A+A→S</p>
            <p class="text-[10px] text-amber-500/80">Total de fusões realizadas: <span class="font-bold font-mono">${playerLogado?.total_fusoes ?? 0}</span></p>
        </div>
        ${fusoesHTML}
    </div>`;
}

async function executarFusao(nome, rank) {
    if (!playerLogado) return;
    const rankChain = { E:'D', D:'C', C:'B', B:'A', A:'S' };
    const novoRank = rankChain[rank];
    if (!novoRank) { alert('Este item já está no rank máximo!'); return; }

    mostrarLoading();

    // Recarrega inventário fresco do banco para evitar conflito
    const { data, error } = await supabaseClient.from('cacadores').select('inventario, total_fusoes').eq('id', playerLogado.id).single();
    if (error || !data) { ocultarLoading(); alert('Erro ao buscar inventário.'); return; }

    const inv = Array.isArray(data.inventario) ? [...data.inventario] : [];
    let removidos = 0;
    const novoInv = [];

    for (const str of inv) {
        const item = parseItem(str);
        if (item.nome === nome && item.rank === rank && removidos < 2) {
            removidos++;
            continue; // remove este
        }
        novoInv.push(str);
    }

    if (removidos < 2) { ocultarLoading(); alert('Itens insuficientes para fusão.'); return; }

    novoInv.push(serializarItem(nome, novoRank));
    const totalFusoes = (data.total_fusoes || 0) + 1;

    await supabaseClient.from('cacadores').update({ inventario: novoInv, total_fusoes: totalFusoes }).eq('id', playerLogado.id);
    adicionarLog(playerLogado.id, `Fusão realizada: 2x ${nome} [${rank}] → ${nome} [${novoRank}] na Forja.`);

    // Recarrega player
    const { data: atualizado } = await supabaseClient.from('cacadores').select('*').eq('id', playerLogado.id).single();
    if (atualizado) playerLogado = atualizado;

    ocultarLoading();
    alert(`⚡ Fusão concluída! "${nome}" evoluiu para RANK ${novoRank}!`);
    renderizarForja();
}

// ==========================================
// 9. CONQUISTAS
// ==========================================
function renderizarConquistas(container) {
    const desbloqueadas = Array.isArray(playerLogado?.conquistas_desbloqueadas) ? playerLogado.conquistas_desbloqueadas : [];
    const total     = CONQUISTAS.length;
    const obtidas   = CONQUISTAS.filter(c => desbloqueadas.includes(c.id)).length;
    const pct       = Math.round((obtidas / total) * 100);

    container.innerHTML = `
    <div class="space-y-3">
        ${_cabecalhoSecao('🏆','Conquistas','text-yellow-400')}

        <!-- Progresso -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div class="flex justify-between text-xs">
                <span class="text-slate-400 font-bold uppercase tracking-wider">Progresso</span>
                <span class="font-mono font-black text-yellow-400">${obtidas} / ${total}</span>
            </div>
            <div class="h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:linear-gradient(90deg,#b45309,#fbbf24);box-shadow:0 0 8px rgba(251,191,36,0.5)"></div>
            </div>
            <p class="text-[10px] text-slate-500 text-right">${pct}% completo</p>
        </div>

        <!-- Lista -->
        <div class="space-y-2">
            ${CONQUISTAS.map(c => {
                const desbloq = desbloqueadas.includes(c.id);
                return `
            <div class="flex items-start gap-3 rounded-xl p-3 border transition ${desbloq
                ? 'bg-yellow-950/20 border-yellow-700/60'
                : 'bg-slate-900/30 border-slate-800/60 opacity-50'}">
                <span class="text-2xl flex-shrink-0 ${desbloq ? '' : 'grayscale'}">${c.icone}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-black ${desbloq ? 'text-yellow-300' : 'text-slate-500'} uppercase tracking-wide">${c.nome}</p>
                    <p class="text-[10px] ${desbloq ? 'text-slate-400' : 'text-slate-600'} leading-relaxed mt-0.5">${c.descricao}</p>
                </div>
                ${desbloq
                    ? `<span class="text-[10px] font-black text-yellow-500 bg-yellow-950/40 border border-yellow-800 px-1.5 py-0.5 rounded flex-shrink-0">✓</span>`
                    : `<span class="text-[10px] text-slate-700 flex-shrink-0">🔒</span>`}
            </div>`;
            }).join('')}
        </div>
    </div>`;
}
