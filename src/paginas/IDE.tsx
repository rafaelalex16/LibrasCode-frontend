export function IDE(){

    return <div 
    className="h-screen flex flex-col overflow-hidden bg-slate-100 ">
        <div className="flex flex-row items-center justify-between 
        p-4 bg-white border-b border-b-gray-100">
            <h1 className="font-semibold">
                LibrasCode IDE
            </h1>
             <button className="mt-5 ml-40 rounded-md bg-blue-600 text-sm text-white py-1 p-4 font-semibold text-white hover:bg-blue-400 transition">
          Executar
        </button>
        </div>
        </div>
    
}