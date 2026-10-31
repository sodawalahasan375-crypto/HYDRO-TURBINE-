/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Scale, Leaf, Droplets, Zap, Sun } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { soundManager } from '../audio/soundEffects';

interface FactsModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const FactsModal: React.FC<FactsModalProps> = ({ language, isOpen, onClose }) => {
  if (!isOpen) return null;
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'facts' | 'compare'>('facts');

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-sky-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-yellow-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm pointer-events-auto animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="mb-4 pr-8">
          <div className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 mb-2">
            💡 Science Discovery
          </div>
          <h2 className="text-2xl font-black text-white font-['Fredoka',sans-serif]">
            {t.didYouKnowTitle}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {t.didYouKnowSubtitle}
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('facts');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'facts'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fun Hydro Facts</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('compare');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>3 Scales Comparison</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Facts */}
        {activeTab === 'facts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {t.facts.map((fact) => (
              <div
                key={fact.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {getIcon(fact.icon)}
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {fact.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {fact.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Three Scales Comparison */}
        {activeTab === 'compare' && (
          <div className="space-y-3">
            {t.comparisons.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border ${
                  idx === 1
                    ? 'bg-sky-950/40 border-sky-500/50 ring-1 ring-sky-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-cyan-400">{idx + 1}.</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.scale}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 self-start sm:self-auto">
                    {item.powerOutput}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 mt-2 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-400 block text-[11px]">Mechanism:</span>
                    {item.mechanism}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block text-[11px]">Application:</span>
                    {item.application}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-md"
          >
            Close & Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
