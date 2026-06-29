import { useState, useEffect } from 'react'

const WORDS = ['app', 'SaaS', 'API', 'plugin', 'product']

export default function WordCycler() {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIndex(i => (i + 1) % WORDS.length)
        setFading(false)
      }, 220)
    }, 2600)
    return () => clearInterval(timer)
  }, [])

  return (
    <span
      className="inline-block w-[7ch] font-mono text-pink-primary transition-opacity duration-200"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {WORDS[index]}
    </span>
  )
}
