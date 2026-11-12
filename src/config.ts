// Endereço do WebSocket da aula ao vivo.
// Por padrão usa o mesmo computador que serve o site; pode ser trocado com a variável VITE_WS_URL.
export const URL_WEBSOCKET: string =
  import.meta.env.VITE_WS_URL ?? `ws://${window.location.hostname}:8003/librasCodeWebsocket`;
