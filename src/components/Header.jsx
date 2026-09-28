import { NavLink, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { profile } from '../data/site.js'

const navItems = [
  { to: '/works', label: '作品' },
  { to: '/writing', label: '长文' },
  { to: '/network', label: '联盟网络' },
  { to: '/projects', label: '项目池' },
  { to: '/videos', label: '视频' },
  { to: '/about', label: '关于' },
  { to: '/subscribe', label: '订阅' },
]

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
        <Link to="/" className="font-serif text-[15px] tracking-wide text-fg">
          {profile.name}
          <span className="ml-2 hidden text-muted sm:inline">{profile.nameEn}</span>
        </Link>
        <nav className="flex flex-nowrap items-center gap-3 overflow-x-auto text-[13px] sm:gap-5 sm:text-[13.5px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors hover:text-fg ${isActive ? 'text-fg' : 'text-muted'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

/** 深浅主题切换：写 localStorage，切换 html.dark */
function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch (e) {}
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      aria-label={dark ? '切换到浅色模式' : '切换到深色模式'}
      title={dark ? '切换到浅色模式' : '切换到深色模式'}
      className="text-muted transition-colors hover:text-fg"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        {dark ? (
          // 太阳
          <circle cx="12" cy="12" r="4.4" />
        ) : (
          // 月亮
          <path d="M20 13.2A8.2 8.2 0 1 1 10.8 4a6.6 6.6 0 0 0 9.2 9.2Z" />
        )}
        {dark && (
          <g>
            <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
          </g>
        )}
      </svg>
    </button>
  )
}
