import { Link } from 'react-router-dom'
import { profile } from '../data/site.js'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
        <div className="flex items-center gap-4">
          {profile.socials.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">
              {s.name}
            </a>
          ))}
          <Link to="/subscribe" className="transition-colors hover:text-fg">
            订阅
          </Link>
          <a href="/llms.txt" className="transition-colors hover:text-fg">
            llms.txt
          </a>
          <Link to="/workspace" className="text-[12px] opacity-60 transition-colors hover:text-fg hover:opacity-100">
            内部协同
          </Link>
        </div>
      </div>
    </footer>
  )
}
