import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ToolboxHome from './pages/ToolboxHome'
import ToolPlaceholder from './pages/ToolPlaceholder'
import GifCompress from './pages/GifCompress'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToolboxHome />} />
        <Route path="/video-tools" element={<GifCompress />} />
        <Route path="/gif-compress" element={<GifCompress />} />
        <Route
          path="/image-tools"
          element={<ToolPlaceholder title="图片工具" />}
        />
        <Route
          path="/inspire-tools"
          element={<ToolPlaceholder title="灵感工具" />}
        />
        <Route path="*" element={<ToolboxHome />} />
      </Routes>
    </BrowserRouter>
  )
}
