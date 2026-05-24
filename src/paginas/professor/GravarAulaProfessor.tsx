import { MicOff, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function GravarAulaProfessor() {
  const [gravando,setGravando]= useState(false);
  const [texto,setTexto]= useState("");
  const [reconhecimento,setReconhecimento]= useState<any>(null);  

  useEffect(()=>{
    //criar conexão com o servidor/backend
    const websocket = new WebSocket("ws://localhost:8003/librasCodeWebsocket");

    // iniciando a api de reconhecimento de voz
    const ReconhecimentoDeFala =
      window.SpeechRecognition || window.webkitSpeechRecognition;

      // Verifica se o navegador suporta
    if (!ReconhecimentoDeFala) {
      alert("Seu navegador não suporta reconhecimento de voz");
      return;
    }

    //criando reconhecimento de voz 
    const fala= new ReconhecimentoDeFala() 

    // Define idioma e comportamento
    fala.lang = "pt-BR";
    fala.continuous = true;
    fala.interimResults = true;

    // Executa quando detectar fala
    fala.onresult = (evento: any) => {
      let textoCompleto = "";

      // junta todas as palavras formando frases prontas
      for (let i = 0; i < evento.results.length; i++) {
        textoCompleto += evento.results[i][0].transcript;
      }

      // Atualiza texto na tela
      setTexto(textoCompleto);

      // Envia texto para o servidor
      websocket.send(textoCompleto);
    };


    // Guarda reconhecimento para usar depois
    setReconhecimento(fala);

    // Fecha conexões ao sair da tela
    return () => {
      websocket.close();
      fala.stop();
    };

  },[])
  

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Cabeçalho */}
      <div className="bg-slate-50">
        <h1 className="font-bold text-lg ml-12">Modo Aula</h1>
        <h3 className="text-gray-500 font-semiboldm mb-5 ml-12">
          Sua fala é convertida em texto em tempo real para os alunos
          acompanharem
        </h3>
      </div>

      {/* Conteudo 1 (MICROFONE) */}
      <div className="w-full h-[40%] bg-white border border-gray-200 gap-2 items-center mb-12 flex flex-col justify-center rounded-lg ">
        <button onClick={()=> {
          if (!reconhecimento) return;

          if (gravando===true) {
            reconhecimento.stop();
            setGravando(false);
          } else {
            reconhecimento.start();
            setGravando(true);
          }

        }} >
        <div
        style={{backgroundColor: gravando===true ? "red" : "blue"}} 
        className="w-20 h-20 flex items-center justify-center rounded-full bg-red-600 ">
          <MicOff className="text-white" size={30} />
        </div>
        </button>
        <h3 
        style={{color: gravando===true  ? "red" : "blue" }}
        className="font-bold">
          {gravando===true  ? "Gravando — clique para parar " : "Clique para gravar"}
          
        </h3>
      </div>

      <div
        className="w-full h-[60%] bg-white border border-gray-200 gap-2 mb-12 flex flex-col
              rounded-lg "
      >
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="flex font-bold text-start ">Transcrição da Aula</h3>
          <h4 className="font-semibold text-xs text-gray-500 flex flex-row gap-1 ">
            <Trash2 className="text-gray-500" size={15} />
            Limpar
          </h4>
        </div>

        {/* Conteudo 2 (transcrição da aula escrita)*/}
        <div className="w-screen h-[60%] bg-white flex flex-col items-start rounded-lg overflow-y-auto">
          <div className="text-gray-400 text-bold text-sm-2 mt-3 mb-3 ml-8 mr-8">
            A transcrição da aula aparecerá aqui...
          </div>
          </div>

        {/* Escrita manual */}
        <div className="gap-2 flex items-center justify-between">
          <div className="w-screen mt-10 ml-7 mb-4 bg-white flex items-center justify-between  border border-gray-100 shadow-md rounded-lg">
            <div className="text-gray-400 text-bold text-sm-2 mt-3 mb-3 ml-2 mr-8">
              Adicionar anotação manualmente...
            </div>
          </div>

          <div className="w-24 h-12 ml-1 mr-5 mt-6 rounded-lg text-white bg-blue-600 flex items-center justify-center">
            <Send size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
