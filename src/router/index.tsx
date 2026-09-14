// src/router/index.tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Generator from '../pages/Generator';
// import AdminEditor from '../pages/AdminEditor';
import GeradorEtiquetas from '../pages/GeradorEtiquetas';

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/admin/editor" element={<AdminEditor />} /> */}
        {/* Note o layoutId como parâmetro dinâmico */}
        <Route path="/generator/:layoutId" element={<Generator />} />
        <Route path="/gerador-etiquetas" element={<GeradorEtiquetas />} />
      </Routes>
    </HashRouter>
  );
}