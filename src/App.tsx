import { useState } from "react";
import "./App.css";
import { PaginaInicial } from "./paginas/PaginaInicial";
import PortalAluno from "./paginas/alunos/PortalAluno";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { IDE } from "./paginas/alunos/IDE";
import { Trilha } from "./paginas/alunos/Trilha";
import { AulaAoVivo } from "./paginas/alunos/AulaAoVivo";
import { PortalProfessor } from "./paginas/professor/PortalProfessor";
import { GravarAulaProfessor } from "./paginas/professor/GravarAulaProfessor";
import { ProgressoTurma } from "./paginas/professor/ProgressoTurma";
import { Dicionario } from "./paginas/alunos/Dicionario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<PaginaInicial />} />

        <Route path="/aluno" element={<PortalAluno />}>
          {/* Redirecionamento padrao do aluno */}
          <Route index element={<Navigate to="ide" replace />} />

          <Route path="ide" element={<IDE />} />
          <Route path="aula" element={<AulaAoVivo />} />
          <Route path="trilha" element={<Trilha />} />
          <Route path="glossario" element={<Dicionario />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />

        {/* Redirecionamento PortalProfessor */}
        <Route path="/professor" element={<PortalProfessor />}>
          <Route index element={<Navigate to="aovivo" replace />} />

          <Route path="aovivo" element={<GravarAulaProfessor />} />
          <Route path="progresso" element={<ProgressoTurma />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
