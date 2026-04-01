import { Check } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-linear-to-br from-violet-400 via-purple-500 to-indigo-600 text-white">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <div className="size-7 rounded-full bg-white/20 flex items-center justify-center">
            <div className="size-3 rounded-full bg-white" />
          </div>
          Meetio
        </div>

        <div className="space-y-4 mt-2">
          <h1 className="text-4xl font-bold leading-tight">
            Schedule smarter.<br />Meet better.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Find the perfect time for your team, jump into video calls, and let AI keep track of what matters.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium shrink-0">
              <Check className="h-4 w-4"/>
            </div>
            <span className="text-white/80 text-sm">Find overlapping availability</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium shrink-0">
              <Check className="h-4 w-4"/>
            </div>
            <span className="text-white/80 text-sm">One-click video calls</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium shrink-0">
              <Check className="h-4 w-4"/>
            </div>
            <span className="text-white/80 text-sm">AI meeting assistant</span>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}