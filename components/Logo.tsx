export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { wrap: 'w-6 h-6 rounded-lg', svg: 'w-3 h-3' },
    md: { wrap: 'w-8 h-8 rounded-xl', svg: 'w-4 h-4' },
    lg: { wrap: 'w-10 h-10 rounded-2xl', svg: 'w-5 h-5' },
  }[size]

  return (
    <div
      className={`${dims.wrap} bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20`}
    >
      {/* Changelog document + sparkle icon */}
      <svg className={`${dims.svg} text-white`} fill="none" viewBox="0 0 16 16">
        <path d="M3 3h6M3 6h4M3 9h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M11 2l.6 1.4L13 4l-1.4.6L11 6l-.6-1.4L9 4l1.4-.6L11 2z"
          fill="white"
          fillOpacity="0.9"
        />
      </svg>
    </div>
  )
}
