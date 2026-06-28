import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-warm-terminal border-t border-white/8 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/25 font-mono">
          © 2025 Structify · Built for makers
        </p>
        <div className="flex items-center gap-6">
          <Link
            to="/privacy"
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            Privacy
          </Link>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            Get Groq key
          </a>
        </div>
      </div>
    </footer>
  )
}
