/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Droplets, Gauge, Zap, Lightbulb, BatteryCharging, TrendingUp } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { SimulationOutputs } from '../simulation/physics';

interface HudDashboardProps {
  language: Language;
  simData: SimulationOutputs;
  powerHistory: number[];
  onOpenChallenges: () => void;
  onOpenFacts: () => void;
  onStartPresentation: () => void;
  onOpenComponent?: (id: string) => void;
}

export const HudDashboard: React.FC<HudDashboardProps> = ({
  language,
  simData,
  powerHistory,
  onOpenChallenges,
  onOpenFacts,
  onStartPresentation,
  onOpenComponent,
}) => {
  const t = translations[language];

  // Flow classification
  const getFlowLabel = (flowLps: number) => {
    if (flowLps <= 0.1) return 'Off';
    if (flowLps < 4.5) return t.flowLow;
    if (flowLps < 9.0) return t.flowMedium;
    return t.flowHigh;
  };

  // Sparkline coordinates
  const graphWidth = 140;
  const graphHeight = 36;
  const maxVal = Math.max(10, ...powerHistory, 60);
  const points = powerHistory
    .map((val, idx) => {
      const x = (idx / Math.max(1, powerHistory.length - 1)) * graphWidth;
      const y = graphHeight - (val / maxVal) * (graphHeight - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Top Action Buttons (Challenges / Science Facts / Exhibition) */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onOpenComponent && (
          <button
            onClick={() => onOpenComponent('turbine')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
          >
            <span>🔬</span>
            <span>Component Explorer</span>
          </button>
        )}

        <button
          onClick={onOpenChallenges}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
        >
          <span>🏆</span>
          <span>{t.challengesTitle}</span>
        </button>

        <button
          onClick={onOpenFacts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
        >
          <span>💡</span>
          <span>{t.didYouKnowTitle.split('?')[0]}?</span>
        </button>

        <button
          onClick={onStartPresentation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
        >
          <span>🎓</span>
          <span>{t.presentationMode}</span>
        </button>
      </div>

      {/* Primary Metrics Grid Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-wrap sm:flex-nowrap items-center gap-3">
        {/* Metric 1: Water Flow */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950/60 rounded-xl border border-sky-900/40 min-w-[105px]">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              {t.flowRate}
            </div>
            <div className="text-xs font-bold text-sky-300">
              {simData.flowRateLps} <span className="text-[10px] font-normal text-slate-400">L/s</span>
            </div>
            <div className="text-[9px] font-semibold text-sky-400">
              {getFlowLabel(simData.flowRateLps)}
            </div>
          </div>
        </div>

        {/* Metric 2: Turbine RPM */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950/60 rounded-xl border border-cyan-900/40 min-w-[105px]">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              {t.turbineSpeed}
            </div>
            <div className="text-xs font-bold text-cyan-300">
              {simData.turbineRpm} <span className="text-[10px] font-normal text-slate-400">RPM</span>
            </div>
            <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (simData.turbineRpm / 1500) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Electric Power (Watts) */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950/60 rounded-xl border border-amber-900/40 min-w-[105px]">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              {t.electricityGenerated}
            </div>
            <div className="text-xs font-bold text-amber-300">
              {simData.electricalPowerWatts} <span className="text-[10px] font-normal text-slate-400">W</span>
            </div>
            <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (simData.electricalPowerWatts / 75) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Bulb Brightness */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950/60 rounded-xl border border-yellow-900/40 min-w-[105px]">
          <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              {t.bulbBrightness}
            </div>
            <div className="text-xs font-bold text-yellow-300">
              {simData.bulbBrightnessPercent}%
            </div>
            <div className="text-[9px] font-semibold text-yellow-500">
              {simData.bulbLumensEstimate} lm
            </div>
          </div>
        </div>

        {/* Metric 5: Energy Accumulator */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950/60 rounded-xl border border-emerald-900/40 min-w-[100px]">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              {t.totalEnergy}
            </div>
            <div className="text-xs font-bold text-emerald-300">
              {simData.energyWattHours} <span className="text-[10px] font-normal text-slate-400">Wh</span>
            </div>
            <div className="text-[9px] font-semibold text-emerald-400">
              η = {Math.round(simData.generatorEfficiency * 100)}%
            </div>
          </div>
        </div>

        {/* Live Sparkline Graph: Watts vs Time */}
        <div className="hidden lg:flex flex-col items-start px-2 py-1 bg-slate-950/70 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-0.5">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>Power Trend (W)</span>
          </div>
          <svg width={graphWidth} height={graphHeight} className="overflow-visible">
            {/* Guide grid line */}
            <line x1="0" y1={graphHeight / 2} x2={graphWidth} y2={graphHeight / 2} stroke="#334155" strokeDasharray="2,2" strokeWidth="0.8" />
            {/* Polyline */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
