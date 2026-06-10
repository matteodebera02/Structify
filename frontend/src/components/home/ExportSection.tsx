import { useInView } from '@/hooks/useInView'
import { cn } from '@/utils/cn'

const FORMATS = [
  {
    label: 'CSV',
    badge: 'Universal',
    tagline: 'Import into any PM tool',
    description:
      'One structured CSV that maps directly to Linear, Notion databases, ClickUp, Asana and more. Every tool has a CSV importer — just drag and drop.',
    columns: ['Name', 'Description', 'Type', 'User Story', 'Effort', 'Priority', 'Status'],
    tools: [
      { name: 'Linear',        color: '#5E6AD2' },
      { name: 'Notion',        color: '#000000' },
      { name: 'ClickUp',       color: '#7B68EE' },
      { name: 'Asana',         color: '#F06A6A' },
      { name: 'Jira',          color: '#0052CC' },
      { name: 'Google Sheets', color: '#34A853' },
      { name: 'Trello',        color: '#0079BF' },
    ],
  },
  {
    label: 'JSON',
    badge: 'Structify format',
    tagline: 'For developers & custom pipelines',
    description:
      'The native Structify schema — project title, mode, user stories (or flat tasks for tasks-only projects), effort hours, and metadata. Ready for custom scripts or API integrations.',
    columns: ['project_title', 'mode', 'user_stories[]', 'tasks[]', 'effort_hours', 'exported_at'],
    tools: [
      { name: 'Custom scripts', color: '#6B7280' },
      { name: 'REST APIs',      color: '#6B7280' },
      { name: 'n8n / Zapier',   color: '#EA4B22' },
      { name: 'GitHub Actions', color: '#181717' },
    ],
  },
  {
    label: 'Markdown',
    badge: '.md',
    tagline: 'Human-readable, anywhere',
    description:
      'A clean .md file with H2 user stories and nested tasks, or a flat task list for tasks-only projects — effort badges inline. Paste into any editor — Notion, GitHub, Obsidian — and it renders perfectly.',
    columns: ['# Project', '## US — Title', '### Tasks', '- [ ] Task `M` `2–6h`'],
    tools: [
      { name: 'Notion',      color: '#000000' },
      { name: 'GitHub',      color: '#181717' },
      { name: 'Obsidian',    color: '#7C3AED' },
      { name: 'Confluence',  color: '#0052CC' },
      { name: 'Logseq',      color: '#48CAE4' },
    ],
  },
]

const ALL_TOOLS = [
  { name: 'Linear',        color: '#5E6AD2' },
  { name: 'Notion',        color: '#000000' },
  { name: 'Jira',          color: '#0052CC' },
  { name: 'ClickUp',       color: '#7B68EE' },
  { name: 'Asana',         color: '#F06A6A' },
  { name: 'Trello',        color: '#0079BF' },
  { name: 'GitHub',        color: '#181717' },
  { name: 'Obsidian',      color: '#7C3AED' },
  { name: 'Confluence',    color: '#0052CC' },
  { name: 'Google Sheets', color: '#34A853' },
  { name: 'Logseq',        color: '#48CAE4' },
  { name: 'n8n',           color: '#EA4B22' },
]

export default function ExportSection() {
  const { ref, inView } = useInView()

  return (
    <section className="bg-[#F9F9F9] py-24 px-6 border-t border-base-border">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-3">Export</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base-black tracking-tight mb-4">
            Three formats. Every tool.
          </h2>
          <p className="text-base text-base-muted max-w-xl mx-auto leading-relaxed">
            Generate your structure in Structify, then bring it wherever your team lives.
            No copy-paste, no reformatting.
          </p>
        </div>

        {/* Format cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {FORMATS.map((fmt, i) => (
            <div
              key={fmt.label}
              className={cn(
                'bg-white border border-base-border rounded-2xl p-6 flex flex-col',
                'hover:border-pink-primary/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200',
                inView ? 'animate-fade-in-up' : 'opacity-0'
              )}
              style={inView ? { animationDelay: `${i * 100}ms` } : undefined}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-base-black tracking-tight">{fmt.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-soft text-pink-dark font-semibold">
                  {fmt.badge}
                </span>
              </div>

              <p className="text-xs font-semibold text-base-black mb-1">{fmt.tagline}</p>
              <p className="text-sm text-base-muted leading-relaxed mb-5">{fmt.description}</p>

              <div className="bg-[#F4F4F4] rounded-lg px-3 py-2.5 mb-5 font-mono text-[10px] text-base-muted space-y-0.5">
                {fmt.columns.map((col) => (
                  <div key={col}>{col}</div>
                ))}
              </div>

              <div className="mt-auto">
                <p className="text-[10px] text-base-muted uppercase tracking-widest mb-2 font-medium">
                  Works with
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fmt.tools.map((tool) => (
                    <span
                      key={tool.name}
                      className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-base-surface border border-base-border text-base-black font-medium"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tool.color }} />
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Marquee strip */}
        <div className="border border-base-border rounded-2xl bg-white px-0 py-6 overflow-hidden">
          <p className="text-[10px] text-base-muted uppercase tracking-widest font-medium text-center mb-5 px-8">
            Compatible with
          </p>
          <div className="overflow-hidden">
            <div className="flex gap-12 animate-marquee">
              {[...ALL_TOOLS, ...ALL_TOOLS].map((tool, i) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tool.color }} />
                  <span className="text-sm font-medium text-base-muted whitespace-nowrap">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-base-muted/40 text-center mt-5 px-8">
            All product names and logos are trademarks of their respective owners.
          </p>
        </div>

      </div>
    </section>
  )
}
