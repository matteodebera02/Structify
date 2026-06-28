import { useState, useEffect, useRef } from 'react'

const PROMPT = 'e-commerce app with auth, catalog and cart'

const LINES = [
  { type: 'story', text: 'User Authentication' },
  { type: 'task',  text: 'Register with email' },
  { type: 'task',  text: 'Login & session management' },
  { type: 'task',  text: 'Password reset flow' },
  { type: 'gap',   text: '' },
  { type: 'story', text: 'Product Catalog' },
  { type: 'task',  text: 'Browse & filter products' },
  { type: 'task',  text: 'Search with live results' },
  { type: 'gap',   text: '' },
  { type: 'story', text: 'Shopping Cart' },
  { type: 'task',  text: 'Add / remove items' },
  { type: 'task',  text: 'Proceed to checkout' },
] as const

type Phase = 'typing' | 'thinking' | 'revealing' | 'done'

export default function AnimatedTerminal() {
  const [promptText, setPromptText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')
  const [visibleCount, setVisibleCount] = useState(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    function runSequence() {
      if (!mounted.current) return
      setPromptText('')
      setPhase('typing')
      setVisibleCount(0)

      let idx = 0
      function typeNext() {
        if (!mounted.current) return
        if (idx < PROMPT.length) {
          setPromptText(PROMPT.slice(0, idx + 1))
          idx++
          setTimeout(typeNext, 43)
        } else {
          setTimeout(() => {
            if (!mounted.current) return
            setPhase('thinking')
            setTimeout(() => {
              if (!mounted.current) return
              setPhase('revealing')
              let line = 0
              function revealNext() {
                if (!mounted.current) return
                if (line < LINES.length) {
                  setVisibleCount(line + 1)
                  line++
                  const delay = LINES[line - 1].type === 'gap' ? 50 : 155
                  setTimeout(revealNext, delay)
                } else {
                  setPhase('done')
                  setTimeout(() => { if (mounted.current) runSequence() }, 4500)
                }
              }
              revealNext()
            }, 950)
          }, 350)
        }
      }
      setTimeout(typeNext, 600)
    }

    runSequence()
  }, [])

  return (
    <div className="bg-warm-terminal border border-white/8 rounded-2xl p-5 shadow-2xl w-[340px] select-none overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="ml-2 text-[10px] text-white/20 tracking-wider font-mono">structify</span>
      </div>

      {/* Prompt */}
      <div className="flex items-start gap-2 mb-3 min-h-[2rem]">
        <span className="text-pink-primary font-mono text-sm flex-shrink-0 mt-px">›</span>
        <span className="font-mono text-[12px] text-white/65 leading-relaxed break-all">
          {promptText}
          {phase === 'typing' && (
            <span className="inline-block w-[2px] h-[13px] bg-white/50 ml-0.5 animate-blink align-middle" />
          )}
        </span>
      </div>

      {/* Thinking indicator */}
      {phase === 'thinking' && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-pink-primary font-mono animate-pulse">● ● ●</span>
          <span className="text-[11px] text-white/30 font-mono">generating...</span>
        </div>
      )}

      {/* Output lines */}
      {(phase === 'revealing' || phase === 'done') && visibleCount > 0 && (
        <div className="space-y-[5px]">
          {LINES.slice(0, visibleCount).map((line, i) => {
            if (line.type === 'gap') return <div key={i} className="h-1.5" />
            if (line.type === 'story') {
              return (
                <div key={i} className="flex items-center gap-2 animate-slide-in-line">
                  <span className="text-[10px] text-pink-primary font-mono flex-shrink-0">■</span>
                  <span className="font-mono text-[12px] text-white/80 font-medium">{line.text}</span>
                </div>
              )
            }
            return (
              <div key={i} className="flex items-center gap-2 pl-4 animate-slide-in-line">
                <span className="text-[10px] text-white/20 font-mono flex-shrink-0">□</span>
                <span className="font-mono text-[11px] text-white/40">{line.text}</span>
              </div>
            )
          })}
          {phase === 'done' && (
            <div className="mt-1">
              <span className="inline-block w-[2px] h-[13px] bg-white/25 animate-blink" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
