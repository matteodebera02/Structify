import { Link } from 'react-router-dom'

export default function AuthBanner() {
  return (
    <div className="border border-pink-primary/30 bg-pink-soft rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-base-black">Save your project</p>
        <p className="text-xs text-base-muted mt-0.5">Create a free account to save, edit and export anytime.</p>
      </div>
      <Link to="/register">
        <button className="bg-pink-primary hover:bg-pink-hover text-white text-xs font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap">
          Get started free
        </button>
      </Link>
    </div>
  )
}
