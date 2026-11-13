// Service worker do LibrasCode (PWA): permite instalar o site e abrir a interface mesmo com internet instável.
// Só guarda arquivos do próprio site. Supabase, VLibras, Pyodide e o servidor da aula sempre usam a rede.

const CACHE = "librascode-v1";
const ESSENCIAIS = ["/", "/manifest.webmanifest", "/icone.svg", "/icone-192.png", "/icone-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ESSENCIAIS)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  // Páginas: tenta a rede (versão mais nova) e usa a cópia guardada sem internet
  if (pedido.mode === "navigate") {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put("/", copia));
          return resposta;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  // Arquivos do build (nomes com hash nunca mudam): usa a cópia guardada
  if (url.pathname.startsWith("/assets/")) {
    evento.respondWith(
      caches.match(pedido).then(
        (guardado) =>
          guardado ||
          fetch(pedido).then((resposta) => {
            const copia = resposta.clone();
            caches.open(CACHE).then((cache) => cache.put(pedido, copia));
            return resposta;
          }),
      ),
    );
  }
});
