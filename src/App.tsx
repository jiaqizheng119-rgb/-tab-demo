import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GuildHome from './pages/GuildHome'
import CheckinDemo from './pages/CheckinDemo'
import ChannelDemo from './pages/ChannelDemo'
import ChannelFullPage from './pages/ChannelFullPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CheckinDemo />} />
        <Route path="/checkin-demo" element={<CheckinDemo />} />
        <Route path="/guild" element={<GuildHome />} />
        <Route path="/channel" element={<ChannelDemo />} />
        <Route path="/channel-full" element={<ChannelFullPage />} />
        <Route path="/channel-mini-games" element={<ChannelFullPage />} />
        <Route path="/channel-activity" element={<ChannelFullPage />} />
        <Route path="/channel-on-sale" element={<ChannelFullPage />} />
      </Routes>
    </BrowserRouter>
  )
}
