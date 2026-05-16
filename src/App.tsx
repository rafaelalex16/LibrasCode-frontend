import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { PaginaInicial } from './paginas/PaginaInicial';
import PortalAluno from './paginas/PortalAluno';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
     <Router>
       <Routes>
         <Route path="/" element={<PaginaInicial />} />
         <Route path="/Inicial" element={<PaginaInicial />} />
         <Route path="/Aluno" element={<PortalAluno />} />
       </Routes>
     </Router>
   );
}

export default App;