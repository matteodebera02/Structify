const MOCK_STORIES = [
  {
    title: 'User Authentication',
    tasks: ['Register with email', 'Login & session management', 'Password reset flow'],
  },
  {
    title: 'Product Catalog',
    tasks: ['Browse all products', 'Search and filter results'],
  },
  {
    title: 'Shopping Cart',
    tasks: ['Add / remove items', 'Calculate totals', 'Proceed to checkout'],
  },
]

export default function HeroMockup() {
  return (
    <div className="relative animate-float">
      <div className="bg-base-charcoal border border-white/10 rounded-2xl p-6 shadow-2xl w-80">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-sm">E-commerce Platform</h3>
          </div>
          <span className="text-[10px] font-semibold bg-pink-primary/15 text-pink-primary px-2.5 py-1 rounded-full border border-pink-primary/20">
            AI
          </span>
        </div>

        <div className="border-t border-white/8 mb-5" />

        <div className="space-y-4">
          {MOCK_STORIES.map((story) => (
            <div key={story.title}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-primary flex-shrink-0" />
                <span className="text-[12px] font-medium text-white/75">{story.title}</span>
              </div>
              <div className="pl-3.5 space-y-1.5">
                {story.tasks.map((task) => (
                  <div key={task} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded border border-white/20 flex-shrink-0" />
                    <span className="text-[11px] text-white/35">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute -inset-8 -z-10 rounded-3xl blur-3xl opacity-25"
        style={{ background: 'radial-gradient(ellipse, #E8336A 0%, transparent 65%)' }}
      />
    </div>
  )
}
