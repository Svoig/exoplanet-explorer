import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router';

import './index.css'
import App from './App.tsx'
import { Planet } from './planet/Planet';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="planets">
          <Route path=":planet" element={<Planet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
