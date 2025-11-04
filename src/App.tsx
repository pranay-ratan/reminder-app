import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { TaskManager } from "./components/TaskManager";
import { OutlookCalendarIntegration } from "./components/OutlookCalendarIntegration";
import Iridescence from "./components/Iridescence";
import { useEffect, useState } from "react";
import "./components/Iridescence.css";

export default function App() {
  const overdueTasks = useQuery(api.tasks.getOverdueTasks) || [];
  const [isHorrorMode, setIsHorrorMode] = useState(false);

  useEffect(() => {
    setIsHorrorMode(overdueTasks.length > 0);
  }, [overdueTasks.length]);

  return (
    <div className={`min-h-screen transition-all duration-1000 relative overflow-hidden ${
      isHorrorMode
        ? 'bg-gradient-to-br from-purple-900/80 via-red-900/80 to-black/80'
        : 'bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-rose-50/30'
    }`}>
      {/* Iridescence Background */}
      <div className="fixed inset-0 z-[-2] bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse opacity-70"></div>
      <Iridescence
        color={[0.8, 0.9, 1.0]}
        speed={0.5}
        amplitude={0.05}
        mouseReact={true}
      />

      {/* Floating cute elements */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        isHorrorMode ? 'opacity-20' : 'opacity-30'
      }`}>
        {/* Horror mode elements */}
        <div className="absolute top-10 left-10 text-6xl animate-pulse">👻</div>
        <div className="absolute top-32 right-20 text-4xl animate-bounce">🦇</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-pulse">💀</div>
        <div className="absolute bottom-32 right-10 text-3xl animate-bounce">🕷️</div>

        {/* Cute mode elements with K-pop vibes */}
        <div className="absolute top-20 left-1/4 text-4xl animate-bounce" style={{animationDelay: '0s'}}>💖</div>
        <div className="absolute top-40 right-1/3 text-3xl animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>
        <div className="absolute bottom-40 left-1/3 text-5xl animate-bounce" style={{animationDelay: '1s'}}>🌸</div>
        <div className="absolute bottom-20 right-1/4 text-4xl animate-pulse" style={{animationDelay: '1.5s'}}>🦄</div>
        <div className="absolute top-1/2 left-10 text-3xl animate-bounce" style={{animationDelay: '2s'}}>💕</div>
        <div className="absolute top-1/3 right-10 text-4xl animate-pulse" style={{animationDelay: '2.5s'}}>🌈</div>
        <div className="absolute bottom-1/2 right-20 text-3xl animate-bounce" style={{animationDelay: '3s'}}>🎀</div>
        <div className="absolute top-3/4 left-20 text-4xl animate-pulse" style={{animationDelay: '3.5s'}}>🦋</div>
        {/* K-pop elements */}
        <div className="absolute top-1/4 left-1/2 text-2xl animate-bounce" style={{animationDelay: '0.8s'}}>🎤</div>
        <div className="absolute bottom-1/4 right-1/2 text-2xl animate-pulse" style={{animationDelay: '1.2s'}}>🎵</div>
        <div className="absolute top-3/4 right-1/4 text-3xl animate-bounce" style={{animationDelay: '1.8s'}}>💃</div>
        <div className="absolute bottom-3/4 left-1/4 text-2xl animate-pulse" style={{animationDelay: '2.2s'}}>🎶</div>
      </div>

      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-32 h-32 rounded-full transition-all duration-2000 ${
          isHorrorMode ? 'bg-purple-500/10' : 'bg-pink-200/30'
        } top-20 left-20 animate-bounce`} style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className={`absolute w-24 h-24 rounded-full transition-all duration-2000 ${
          isHorrorMode ? 'bg-red-500/10' : 'bg-purple-200/30'
        } top-40 right-32 animate-pulse`} style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className={`absolute w-40 h-40 rounded-full transition-all duration-2000 ${
          isHorrorMode ? 'bg-pink-500/10' : 'bg-rose-200/20'
        } bottom-32 left-1/4 animate-bounce`} style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className={`absolute w-28 h-28 rounded-full transition-all duration-2000 ${
          isHorrorMode ? 'bg-orange-500/10' : 'bg-yellow-200/25'
        } bottom-20 right-1/3 animate-pulse`} style={{animationDelay: '3s', animationDuration: '3.5s'}}></div>
      </div>

      <header className={`sticky top-0 z-20 backdrop-blur-lg border-b px-4 transition-all duration-1000 ${
        isHorrorMode
          ? 'bg-purple-900/60 border-red-800/60'
          : 'bg-transparent border-pink-300/30'
      }`}>
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <span className="text-3xl animate-bounce">💖</span>
              <span className="text-2xl animate-pulse">✨</span>
            </div>
            <h2 className={`text-2xl font-bold transition-colors duration-1000 ${
              isHorrorMode ? 'text-red-300' : 'text-pink-600'
            }`}>
              Bebu's Magical Reminders 💫
            </h2>
            <div className="flex gap-2">
              <span className="text-2xl animate-pulse">🌸</span>
              <span className="text-3xl animate-bounce">💕</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <OutlookCalendarIntegration isHorrorMode={isHorrorMode} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-30">
        <div className="w-full max-w-5xl mx-auto">
          <Content isHorrorMode={isHorrorMode} overdueTasks={overdueTasks} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content({ isHorrorMode, overdueTasks }: { isHorrorMode: boolean; overdueTasks: any[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <div className="mb-6">
          <h1 className={`text-5xl font-bold mb-4 transition-all duration-1000 ${
            isHorrorMode 
              ? 'text-red-300 animate-pulse drop-shadow-[0_0_10px_rgba(220,38,127,0.8)]' 
              : 'text-pink-600 animate-bounce'
          }`}>
            {isHorrorMode ? '🎃 Bebu! You have overdue tasks! 👻' : '💕 Hello Beautiful Bebu! 🌸'}
          </h1>
          {isHorrorMode ? (
            <div className="space-y-2">
              <p className="text-xl text-red-200 animate-pulse">
                The cute ghosts are here to remind you! 👻💀
              </p>
              <p className="text-lg text-purple-300">
                {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''} need{overdueTasks.length === 1 ? 's' : ''} your attention! 🕸️
              </p>
            </div>
          ) : (
            <p className="text-xl text-purple-600 animate-pulse">
              Ready to conquer your day, sweetie? 🦄✨
            </p>
          )}
        </div>
        <TaskManager isHorrorMode={isHorrorMode} />
      </div>
    </div>
  );
}
