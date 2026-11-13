import "./App.css";
import { PaginaInicial } from "./paginas/PaginaInicial";
import PortalAluno from "./paginas/alunos/PortalAluno";

import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { LOGIN_ATIVO } from "./config";
import { RotaProtegida } from "./auth/RotaProtegida";
import { IDE } from "./paginas/alunos/IDE";
import { Trilha } from "./paginas/alunos/Trilha";
import { AulaAoVivo } from "./paginas/alunos/AulaAoVivo";
import { PortalProfessor } from "./paginas/professor/PortalProfessor";
import { GravarAulaProfessor } from "./paginas/professor/GravarAulaProfessor";
import { ProgressoTurma } from "./paginas/professor/ProgressoTurma";
import { Turmas } from "./paginas/professor/Turmas";
import { Dicionario } from "./paginas/alunos/Dicionario";
import { Entrar } from "./paginas/Entrar";
import { MinhaConta } from "./paginas/MinhaConta";
import { Privacidade } from "./paginas/Privacidade";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<PaginaInicial />} />
          <Route path="/entrar" element={LOGIN_ATIVO ? <Entrar /> : <Navigate to="/home" replace />} />
          <Route path="/privacidade" element={<Privacidade />} />

          {/* Portal do aluno: precisa estar logado como aluno */}
          <Route path="/aluno" element={<RotaProtegida papel="aluno"><PortalAluno /></RotaProtegida>}>
            {/* Redirecionamento padrao do aluno */}
            <Route index element={<Navigate to="ide" replace />} />

            <Route path="ide" element={<IDE />} />
            <Route path="aula" element={<AulaAoVivo />} />
            <Route path="trilha" element={<Trilha />} />
            <Route path="glossario" element={<Dicionario />} />
            {LOGIN_ATIVO && <Route path="conta" element={<MinhaConta />} />}
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />

          {/* Portal do professor: precisa estar logado como professor */}
          <Route path="/professor" element={<RotaProtegida papel="professor"><PortalProfessor /></RotaProtegida>}>
            <Route index element={<Navigate to="aovivo" replace />} />

            <Route path="aovivo" element={<GravarAulaProfessor />} />
            {LOGIN_ATIVO && <Route path="turmas" element={<Turmas />} />}
            <Route path="progresso" element={<ProgressoTurma />} />
            {LOGIN_ATIVO && <Route path="conta" element={<MinhaConta />} />}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
