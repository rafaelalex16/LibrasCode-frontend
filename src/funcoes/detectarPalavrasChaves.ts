import { dicionarioPythonSOV } from "../dicionarioMocado/dicionarioMocado";

export function detectarPalavrasChaves(textoCompleto:string){
    const resultado=[];

    //dividir o código em palavras
    //palavrasMinuscula= "rafael vai usar um print"
    const palavrasMinusculas= textoCompleto.toLowerCase()
    //ex:listadePalavras= ["rafael", "vai", "usar", "um", "print"]
    const listaDePalavras= palavrasMinusculas.split(/\W+/)

    //nós vamos percorrer a lista de palavras e checar se elas estão no 
    //dicionário mocado
    listaDePalavras.forEach(palavra => {
        if(dicionarioPythonSOV[palavra] && !resultado.includes(palavra)){
            //adicionando termo achado a lista de palavras detectadas
            resultado.push(palavra)
        }
    });

    return resultado
        
    


}