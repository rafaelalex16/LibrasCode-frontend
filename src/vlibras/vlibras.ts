// Integração com o avatar do VLibras (widget carregado no index.html).
// Depois que o player carrega, o widget expõe window.vlibras com os comandos do avatar.

type StatusPlayer = "idle" | "playing" | "paused";

interface PlayerVLibras {
  status?: StatusPlayer;
  play?: (glosa?: string) => void;
  pause?: () => void;
  setSpeed?: (velocidade: number) => void;
  translateAndPlay?: (texto: string) => Promise<void>;
}

declare global {
  interface Window {
    vlibras?: PlayerVLibras;
    VLibrasWidget?: { open?: () => void };
  }
}

// Velocidades aceitas pelo player do VLibras
export const VELOCIDADES = [0.5, 1, 1.5, 2, 2.5];

const ESPERA_INICIO_MS = 6000;
const ESPERA_CARREGAMENTO_MS = 20000;

let enviadoEm = 0;
let viuTocando = true;
let textoPendente: string | null = null;
let esperaCarregamento: number | undefined;

// Com o avatar aberto, o VLibras intercepta os cliques para traduzir o texto clicado e
// exige um segundo clique em "Interagir" para botões e links. Nos controles do LibrasCode
// (e no editor de código) o clique segue direto; clicar em texto comum continua traduzindo.
const MARCA_CLIQUE_LIBERADO = "__vlibrasSyntheticClick";
const CONTROLES = "button, a, input, select, textarea, label, [role=button], .monaco-editor";

document.addEventListener(
  "click",
  (evento) => {
    const alvo = evento.target;
    if (alvo instanceof Element && alvo.closest("#root") && alvo.closest(CONTROLES)) {
      Object.defineProperty(evento, MARCA_CLIQUE_LIBERADO, { value: true });
    }
  },
  true,
);

let velocidadeEscolhida = 1;
let velocidadePendente = true;

function player() {
  const atual = window.vlibras?.translateAndPlay ? window.vlibras : undefined;
  // O player pode terminar de carregar depois que o aluno escolheu a velocidade
  if (atual && velocidadePendente) {
    velocidadePendente = false;
    atual.setSpeed?.(velocidadeEscolhida);
  }
  return atual;
}

// Encaixa a janela do avatar sobre um espaço da página, com a mesma posição e largura.
// O widget fica dentro de um shadow DOM, então o estilo é injetado lá. No modo
// tela cheia do VLibras (data-expanded) o encaixe é ignorado.
const ID_ESTILO_ENCAIXE = "librascode-encaixe";

export function encaixarAvatar(espaco: HTMLElement) {
  // Altura do cabeçalho + barra de controles, medida quando o player aparece
  let alturaBarras: number | null = null;

  const aplicar = () => {
    const raiz = document.getElementById("vlibras-app-root")?.shadowRoot;
    if (!raiz) return false;

    const janela = raiz.getElementById("vlibras-app");
    const player = janela?.querySelector("iframe");
    if (alturaBarras === null && janela && player && player.offsetHeight > 0) {
      alturaBarras = janela.offsetHeight - player.offsetHeight;
    }

    let estilo = raiz.getElementById(ID_ESTILO_ENCAIXE);
    if (!estilo) {
      estilo = document.createElement("style");
      estilo.id = ID_ESTILO_ENCAIXE;
      raiz.appendChild(estilo);
    }
    const area = espaco.getBoundingClientRect();
    estilo.textContent = `
      :host(:not([data-expanded=true])) #vlibras-app {
        top: ${area.top}px !important;
        left: ${area.left}px !important;
        right: auto !important;
        bottom: auto !important;
        translate: none !important;
        transform: none !important;
        animation: none !important;
      }
      :host(:not([data-expanded=true])) #vlibras-app > div { width: ${area.width}px !important; }
      ${alturaBarras === null ? "" : `
      :host(:not([data-expanded=true])) #vlibras-app iframe {
        height: ${Math.max(150, area.height - alturaBarras)}px !important;
      }`}`;
    return alturaBarras !== null;
  };

  // O widget só cria a janela e o player quando o avatar é aberto: tenta até conseguir
  const tentativas = window.setInterval(() => {
    if (aplicar()) window.clearInterval(tentativas);
  }, 300);
  const observador = new ResizeObserver(() => aplicar());
  observador.observe(espaco);
  window.addEventListener("resize", aplicar);

  return () => {
    window.clearInterval(tentativas);
    observador.disconnect();
    window.removeEventListener("resize", aplicar);
    document.getElementById("vlibras-app-root")?.shadowRoot?.getElementById(ID_ESTILO_ENCAIXE)?.remove();
  };
}

// O script do VLibras só cria a função de abrir depois que a página termina de carregar
export function abrirAvatar(tentativas = 40) {
  if (window.VLibrasWidget?.open) window.VLibrasWidget.open();
  else if (tentativas > 0) window.setTimeout(() => abrirAvatar(tentativas - 1), 250);
}

export function sinalizar(texto: string) {
  const limpo = texto.trim();
  if (!limpo) return;

  abrirAvatar();
  const atual = player();
  if (atual?.translateAndPlay) {
    enviadoEm = Date.now();
    viuTocando = false;
    void atual.translateAndPlay(limpo);
    return;
  }

  // Avatar ainda carregando: guarda o último texto e envia assim que o player estiver pronto
  textoPendente = limpo;
  if (esperaCarregamento !== undefined) return;
  const inicio = Date.now();
  esperaCarregamento = window.setInterval(() => {
    const pronto = player();
    if (!pronto && Date.now() - inicio < ESPERA_CARREGAMENTO_MS) return;

    window.clearInterval(esperaCarregamento);
    esperaCarregamento = undefined;
    const pendente = textoPendente;
    textoPendente = null;
    if (pronto && pendente) sinalizar(pendente);
  }, 500);
}

// Livre = player carregado, sem sinalização em andamento e sem tradução recém-enviada
export function avatarLivre() {
  const atual = player();
  if (!atual) return false;

  if (atual.status === "playing" || atual.status === "paused") {
    viuTocando = true;
    return false;
  }
  return viuTocando || Date.now() - enviadoEm > ESPERA_INICIO_MS;
}

export function pausarAvatar() {
  player()?.pause?.();
}

export function retomarAvatar() {
  player()?.play?.();
}

export function definirVelocidade(velocidade: number) {
  velocidadeEscolhida = velocidade;
  const atual = player();
  if (atual) atual.setSpeed?.(velocidade);
  else velocidadePendente = true;
}
