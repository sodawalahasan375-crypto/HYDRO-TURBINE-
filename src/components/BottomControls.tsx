/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  Camera,
  Layers,
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { soundManager } from '../audio/soundEffects';

interface BottomControlsProps {
  language: Language;
  isRunning: boolean;
  onToggleRunning: () => void;
  flowPercent: number;
  onFlowChange: (val: number) => void;
  headHeight: number;
  onHeadChange: (val: number) => void;
  onReset: () => void;
  isSlowMotion: boolean;
  onToggleSlowMotion: () => void;
  isExploreInside: boolean;
  onToggleExploreInside: () => void;
  activeCamera: string;
  onSetCamera: (camKey: string) => void;
  onOpenComponent?: (id: string) => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  language,
  isRunning,
  onToggleRunning,
  flowPercent,
  onFlowChange,
  headHeight,
  onHeadChange,
  onReset,
  isSlowMotion,
  onToggleSlowMotion,
  isExploreInside,
  onToggleExploreInside,
  activeCamera,
  onSetCamera,
  onOpenComponent,
}) => {
  const t = translations[language];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleStartStop = () => {
    soundManager.playClick();
    onToggleRunning();
  };

  const handleReset = () => {
    soundManager.playClick();
    onReset();
  };

  const handleSlowMo = () => {
    soundManager.playClick();
    onToggleSlowMotion();
  };

  const handleExplore = () => {
    soundManager.playClick();
    onToggleExploreInside();
  };

  const handleCameraChange = (camKey: string) => {
    soundManager.playClick();
    onSetCamera(camKey);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-auto transition-transform duration-300">
      {/* Collapse/Expand Toggle Tab */}
      <div className="flex justify-center -mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 px-4 py-1 rounded-t-xl bg-slate-900/90 border-t border-x border-slate-700 hover:border-sky-500 text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Show Controls' : 'Hide Controls'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main Control Panel Bar */}
      <div
        className={`bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isCollapsed ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Group 1: Primary Action & Reset */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-center">
            <button
              onClick={handleStartStop}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-md cursor-pointer ${
                isRunning
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>{t.stopWater}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t.startWater}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={t.resetExperiment}
              aria-label={t.resetExperiment}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Slow Motion button */}
            <button
              onClick={handleSlowMo}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSlowMotion
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <span>⏱️</span>
              <span className="hidden sm:inline">{isSlowMotion ? t.normalSpeed : t.slowMotion}</span>
            </button>

            {/* Explore Inside button */}
            <button
              onClick={handleExplore}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isExploreInside
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.exploreInside}</span>
            </button>
          </div>

          {/* Group 2: Physical Sliders (Flow Rate & Reservoir Height) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Water Flow Slider */}
            <div className="flex flex-col gap-1 w-full sm:w-44">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-sky-400" />
                  <span>{t.waterFlow}</span>
                </span>
                <span className="text-sky-300 font-bold">{flowPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={flowPercent}
                onChange={(e) => onFlowChange(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Reservoir Height Slider */}
            <div className="flex flex-col gap-1 w-full sm:w-44">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>{t.waterHeight}</span>
                </span>
                <span className="text-cyan-300 font-bold">{headHeight} m</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={headHeight}
                onChange={(e) => onHeadChange(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Group 3: Camera Focus Presets */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 w-full lg:w-auto justify-center">
            <span className="text-[10px] text-slate-500 px-1 font-semibold flex items-center gap-1">
              <Camera className="w-3 h-3 text-slate-400" />
            </span>
            <button
              onClick={() => handleCameraChange('full')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCamera === 'full' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.camFull}
            </button>
            <button
              onClick={() => handleCameraChange('dam')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCamera === 'dam' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.camDam}
            </button>
            <button
              onClick={() => handleCameraChange('turbine')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCamera === 'turbine' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.camTurbine}
            </button>
            <button
              onClick={() => handleCameraChange('generator')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCamera === 'generator' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.camGenerator}
            </button>
            <button
              onClick={() => handleCameraChange('bulb')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCamera === 'bulb' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.camBulb}
            </button>
            {onOpenComponent && (
              <button
                onClick={() => onOpenComponent(activeCamera === 'full' ? 'turbine' : activeCamera)}
                className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
                title="Inspect component science facts"
              >
                <span>🔬</span>
                <span className="hidden sm:inline">Inspect Part</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
