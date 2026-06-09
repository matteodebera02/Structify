interface Props {
  waitTime: string
}

export default function RateLimitBanner({ waitTime }: Props) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-5">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5">⏳</span>
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Generation temporarily unavailable
          </p>
          <p className="text-xs text-amber-700 leading-relaxed mb-2">
            The AI service has reached its daily usage limit. This is a temporary quota on the free tier —
            no data was lost and nothing is broken.
          </p>
          <p className="text-xs text-amber-800 font-medium">
            Try again in <span className="font-bold">{waitTime}</span> and it will work normally.
          </p>
        </div>
      </div>
    </div>
  )
}
