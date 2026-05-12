// src/router/index.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Generator from '../pages/Generator';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Note o layoutId como parâmetro dinâmico */}
        <Route path="/generator/:layoutId" element={<Generator />} />
      </Routes>
    </BrowserRouter>
  );
}