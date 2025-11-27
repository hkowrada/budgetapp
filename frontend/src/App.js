import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PDFManager from '@/pages/PDFManager';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PDFManager />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}