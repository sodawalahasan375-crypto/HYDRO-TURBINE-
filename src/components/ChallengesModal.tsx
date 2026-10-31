/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, Star, CheckCircle, Wrench, AlertTriangle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations, Language } from '../i18n/translations';
import { soundManager } from '../audio/soundEffects';

export type ActiveFault = 'none' | 'valveStuck' | 'debrisBlocked' | 'wireLoose' | 'lowHead';

interface ChallengesModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  completedMissions: Record<string, boolean>;
  activeFault: ActiveFault;
  onTriggerFault: (fault: ActiveFault) => void;
  onFixFault: (fault: ActiveFault) => void;
  totalPoints: number;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  language,
  isOpen,
  onClose,
  completedMissions,
  activeFault,
  onTriggerFault,
  onFixFault,
  totalPoints,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleFixCurrentFault = () => {
    soundManager.playSuccessChime();
    fireConfetti();
    onFixFault(activeFault);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm pointer-events-auto animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-['Fredoka',sans-serif]">
              {t.challengesTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {t.challengesSubtitle}
          </p>

          {/* Points & Stars Banner */}
          <div className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">{t.pointsEarned}:</span>
              <span className="text-lg font-black text-white">{totalPoints} pts</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((idx) => {
                const isEarned = !!completedMissions[`challenge${idx}`];
                return (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isEarned
                        ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/50'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    ★
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-3">
          {/* Mission 1 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              completedMissions['challenge1']
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    1. {t.challenge1Title}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {t.challenge1Desc}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {completedMissions['challenge1'] ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {t.challenge1Goal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mission 2 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              completedMissions['challenge2']
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    2. {t.challenge2Title}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {t.challenge2Desc}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {completedMissions['challenge2'] ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {t.challenge2Goal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mission 3 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              completedMissions['challenge3']
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💧</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    3. {t.challenge3Title}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {t.challenge3Desc}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {completedMissions['challenge3'] ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {t.challenge3Goal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mission 4: Fix the Power Plant (Troubleshooting Mode) */}
          <div className="p-3.5 rounded-2xl border bg-slate-950/60 border-slate-800">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔧</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    4. {t.challenge4Title}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {t.challenge4Desc}
                  </p>
                </div>
              </div>
              {completedMissions['challenge4'] && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3" />
                  <span>Fixed</span>
                </span>
              )}
            </div>

            {/* Active Fault Diagnostic Display */}
            {activeFault !== 'none' ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 mb-3 animate-pulse-subtle">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>
                    {activeFault === 'valveStuck' && t.troubleshoot.valveStuck}
                    {activeFault === 'debrisBlocked' && t.troubleshoot.debrisBlocked}
                    {activeFault === 'wireLoose' && t.troubleshoot.wireLoose}
                    {activeFault === 'lowHead' && t.troubleshoot.lowHead}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2">
                  {activeFault === 'valveStuck' && t.troubleshoot.valveStuckFix}
                  {activeFault === 'debrisBlocked' && t.troubleshoot.debrisBlockedFix}
                  {activeFault === 'wireLoose' && t.troubleshoot.wireLooseFix}
                  {activeFault === 'lowHead' && t.troubleshoot.lowHeadFix}
                </p>
                <button
                  onClick={handleFixCurrentFault}
                  className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Repair Fault & Restore Power</span>
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 mb-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>{t.troubleshoot.normal}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 100% Operational
                </span>
              </div>
            )}

            {/* Test Fault Trigger Buttons for Students */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400">Introduce Fault:</span>
              <button
                onClick={() => onTriggerFault('valveStuck')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
              >
                Stuck Valve
              </button>
              <button
                onClick={() => onTriggerFault('debrisBlocked')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
              >
                Blocked Turbine
              </button>
              <button
                onClick={() => onTriggerFault('wireLoose')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
              >
                Loose Wire
              </button>
              <button
                onClick={() => onTriggerFault('lowHead')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
              >
                Low Head
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-md"
          >
            Back to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
