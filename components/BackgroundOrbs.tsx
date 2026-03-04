export function BackgroundOrbs({ variant = 'default' }: { variant?: 'default' | 'subtle' }) {
  if (variant === 'subtle') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {/* Top-left orb */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-500/[0.06] blur-3xl animate-blob" />
        {/* Top-right orb */}
        <div className="absolute -top-10 right-10 w-72 h-72 rounded-full bg-violet-400/10 dark:bg-violet-500/[0.06] blur-3xl animate-blob animation-delay-4000" />
        {/* Bottom orb */}
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-purple-400/10 dark:bg-purple-500/[0.05] blur-3xl animate-blob-slow animation-delay-2000" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large top-left */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-300/20 dark:bg-indigo-600/[0.08] blur-3xl animate-blob" />
      {/* Top-right */}
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-violet-300/20 dark:bg-violet-600/[0.08] blur-3xl animate-blob animation-delay-2000" />
      {/* Bottom-center */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-purple-300/15 dark:bg-purple-600/[0.07] blur-3xl animate-blob-slow animation-delay-4000" />
      {/* Small accent — mid right */}
      <div className="absolute top-1/2 -right-10 w-64 h-64 rounded-full bg-sky-300/10 dark:bg-sky-500/[0.05] blur-2xl animate-blob animation-delay-6000" />
    </div>
  )
}
