// Endereço do WebSocket da aula ao vivo.
// Por padrão usa o mesmo computador que serve o site; pode ser trocado com a variável VITE_WS_URL.
// Site em HTTPS exige WebSocket seguro (wss).
const protocolo = window.location.protocol === "https:" ? "wss" : "ws";

export const URL_WEBSOCKET: string =
  import.meta.env.VITE_WS_URL ?? `${protocolo}://${window.location.hostname}:8003/librasCodeWebsocket`;

// Login, turmas e histórico no banco. Desligado (padrão): os portais abrem sem cadastro,
// todos ficam numa sala única e o histórico da aula fica só no navegador.
// Para ligar: VITE_LOGIN_ATIVO=true no .env (e LOGIN_ATIVO=true no .env do backend).
export const LOGIN_ATIVO = import.meta.env.VITE_LOGIN_ATIVO === "true";

// Sala usada por todos quando o login está desligado
export const SALA_SEM_LOGIN = "geral";
