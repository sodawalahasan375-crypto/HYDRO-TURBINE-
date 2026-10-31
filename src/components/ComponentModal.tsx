/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, HelpCircle, Activity, ShieldCheck, MapPin } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { soundManager } from '../audio/soundEffects';

interface ComponentModalProps {
  language: Language;
  componentId: string | null;
  onClose: () => void;
  onFocusComponent: (id: string) => void;
}

export const ComponentModal: React.FC<ComponentModalProps> = ({
  language,
  componentId,
  onClose,
  onFocusComponent,
}) => {
  if (!componentId) return null;
  const t = translations[language];
  const comp = t.components[componentId] || t.components['turbine'];

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  const handleCameraFocus = () => {
    soundManager.playClick();
    if (componentId === 'dam') onFocusComponent('dam');
    else if (componentId === 'penstock' || componentId === 'turbine') onFocusComponent('turbine');
    else if (componentId === 'shaft' || componentId === 'generator') onFocusComponent('generator');
    else if (componentId === 'wires' || componentId === 'bulb') onFocusComponent('bulb');
    else onFocusComponent('full');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-fade-in">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-8">
          <div className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-2">
            🔬 Component Explorer
          </div>
          <h2 className="text-2xl font-black text-white font-['Fredoka',sans-serif]">
            {comp.name}
          </h2>
          <p className="text-xs text-sky-300 font-medium mt-0.5">
            {comp.tagline}
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* 1. What is it? */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>What is it?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {comp.whatIsIt}
            </p>
          </div>

          {/* 2. What it does */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>What does it do?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {comp.whatItDoes}
            </p>
          </div>

          {/* 3. Why it is important */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Why is it important?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {comp.whyImportant}
            </p>
          </div>

          {/* 4. Real-world example */}
          <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-800/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 mb-1">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Real-world example</span>
            </div>
            <p className="text-slate-200 font-medium leading-relaxed">
              {comp.realWorldExample}
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleCameraFocus}
            className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Zoom Camera to {comp.name.split(' ')[0]}
          </button>

          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition-colors cursor-pointer shadow-md"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
