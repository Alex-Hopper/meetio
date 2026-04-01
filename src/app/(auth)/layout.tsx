import { Check } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-linear-to-br from-blue-400 via-blue-500 to-indigo-600 text-white">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <div className="size-8 rounded-full bg-white/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 1000 1000" fill="none">
                <path d="M629.544 166.863C645.75 143.304 680.724 143.865 696.165 167.931L953.026 568.248C970.107 594.87 950.991 629.849 919.36 629.849L771.577 629.849C757.706 629.849 744.825 622.663 737.539 610.86L555.713 316.299C547.387 302.811 547.811 285.678 556.795 272.619L629.544 166.863Z" fill="#1447E6"/>
                <path d="M306.193 178.172C320.955 151.314 359.198 150.354 375.29 176.436L687.65 682.736C695.708 695.797 695.583 712.316 687.328 725.253L617.921 834.037C602.068 858.883 565.702 858.635 550.189 833.575L242.425 336.412C234.831 324.144 234.432 308.737 241.382 296.092L306.193 178.172Z" fill="#1447E6"/>
                <path d="M140.518 412.477C156.89 389.258 191.572 390.032 206.893 413.956L384.799 691.763C393.915 705.998 393.099 724.427 382.76 737.8L308.306 834.107C291.183 856.255 257.19 854.415 242.558 830.548L71.7589 551.943C63.4093 538.324 63.9643 521.042 73.1706 507.986L140.518 412.477Z" fill="#1447E6"/>
              </svg>
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