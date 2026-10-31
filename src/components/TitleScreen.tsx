/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Volume2, VolumeX, Globe } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface TitleScreenProps {
  language: Language;
  onSetLanguage: (lang: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartExploring: () => void;
  onSkipIntro: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  language,
  onSetLanguage,
  isMuted,
  onToggleMute,
  onStartExploring,
  onSkipIntro,
}) => {
  const t = translations[language];

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 backdrop-blur-sm pointer-events-auto">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 px-3 py-1.5 rounded-full text-xs font-semibold text-sky-300">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Interactive 3D Science Lab</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <button
            onClick={() => onSetLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 hover:border-sky-500 text-xs font-semibold text-slate-200 transition-colors shadow-sm cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'en' ? 'हिन्दी (Hindi)' : 'English'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-full bg-slate-800/90 border border-slate-700 hover:border-sky-500 text-slate-200 transition-colors shadow-sm cursor-pointer"
            title={isMuted ? t.audioOn : t.audioOff}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>

      {/* Main Title Hero Center */}
      <div className="flex flex-col items-center text-center max-w-3xl my-auto animate-fade-in">
        <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-bold tracking-wide uppercase shadow-lg">
          ⚡ 3D Interactive Exhibition
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-md">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 font-['Fredoka',sans-serif]">
            {t.appName}
          </span>
        </h1>

        <p className="text-lg sm:text-2xl text-slate-200 font-medium max-w-2xl mb-8 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 w-full max-w-xl text-left">
          <div className="bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl flex items-center gap-2">
            <span className="text-xl">🌊</span>
            <div className="text-xs">
              <div className="font-bold text-white">Real Physics</div>
              <div className="text-slate-400">Head & Flow Q</div>
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div className="text-xs">
              <div className="font-bold text-white">Water Turbine</div>
              <div className="text-slate-400">Pelton Runner</div>
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl flex items-center gap-2">
            <span className="text-xl">🧲</span>
            <div className="text-xs">
              <div className="font-bold text-white">Generator</div>
              <div className="text-slate-400">Rotor & Coil</div>
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl flex items-center gap-2">
            <span className="text-xl">💡</span>
            <div className="text-xs">
              <div className="font-bold text-white">Glowing Bulb</div>
              <div className="text-slate-400">Clean Watts</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onStartExploring}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>{t.startExploring}</span>
          </button>

          <button
            onClick={onSkipIntro}
            className="text-xs sm:text-sm text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4 transition-colors cursor-pointer"
          >
            {t.skipIntro}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/60">
        <span>Hydro Hero • Clean Renewable Energy Education</span>
        <span>Drag to orbit • Scroll to zoom • Click parts to inspect</span>
      </div>
    </div>
  );
};
