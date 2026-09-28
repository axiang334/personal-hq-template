import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import AgentChat from './components/AgentChat.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Works from './pages/Works.jsx'
import Writing from './pages/Writing.jsx'
import Videos from './pages/Videos.jsx'
import Subscribe from './pages/Subscribe.jsx'
import Network from './pages/Network.jsx'
import Projects from './pages/Projects.jsx'
import Workspace from './pages/Workspace.jsx'

/** 路由切换后回到页面顶部 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/works" element={<Works />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/network" element={<Network />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AgentChat />
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24">
      <h1 className="font-serif text-2xl">404</h1>
      <p className="mt-3 text-muted">这一页不存在。可能是我删掉了，也可能是链接错了。</p>
    </div>
  )
}
