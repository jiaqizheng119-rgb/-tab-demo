import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GifCompress from './pages/GifCompress'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GifCompress />} />
        <Route path="/gif-compress" element={<GifCompress />} />
        <Route path="*" element={<GifCompress />} />
      </Routes>
    </BrowserRouter>
  )
}
