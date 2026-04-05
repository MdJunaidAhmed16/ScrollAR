import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function DesktopGate({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    function check() {
      setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDesktop || bypassed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-10 max-w-lg text-center">
        {/* Phone mockup */}
        <div className="relative">
          <div className="w-36 h-64 rounded-[2.5rem] border-4 border-gray-700 bg-gray-900 flex flex-col items-center justify-center gap-3 shadow-2xl">
            {/* Notch */}
            <div className="absolute top-3 w-12 h-1.5 bg-gray-700 rounded-full" />
            {/* Mini card stack */}
            <div className="relative w-20 h-28 mt-4">
              {[2, 1, 0].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/10"
                  style={{
                    transform: `scale(${1 - i * 0.05}) translateY(${i * -6}px)`,
                    zIndex: 3 - i,
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-2xl">↕</span>
              </div>
            </div>
            {/* Gesture hints */}
            <div className="flex gap-3 text-xs text-gray-500 mb-2">
              <span>←</span>
              <span>↑</span>
              <span>→</span>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-500/10 blur-2xl -z-10" />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">ScrollAr is built for mobile</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            For the best experience, open this on your phone — or shrink your browser window to mobile size.
          </p>
        </div>

        {/* URL hint */}
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 w-full">
          <span className="text-3xl">📱</span>
          <div className="text-left overflow-hidden">
            <p className="text-white text-sm font-medium">Open on your phone</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{window.location.href}</p>
          </div>
        </div>

        {/* Escape hatch */}
        <button
          onClick={() => setBypassed(true)}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
        >
          Continue anyway on desktop
        </button>
      </div>
    </div>
  );
}
