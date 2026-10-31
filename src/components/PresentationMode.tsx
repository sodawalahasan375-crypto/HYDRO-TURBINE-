/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, LogOut, CheckCircle, Sparkles } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { soundManager } from '../audio/soundEffects';

interface PresentationModeProps {
  language: Language;
  isOpen: boolean;
  onExit: () => void;
  currentStep: number;
  onSetStep: (step: number) => void;
  onCameraFocus: (viewKey: string) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  language,
  isOpen,
  onExit,
  currentStep,
  onSetStep,
  onCameraFocus,
}) => {
  if (!isOpen) return null;
  const t = translations[language];
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const presentationSteps = [
    {
      id: 1,
      cam: 'full',
      title: 'Welcome to the Hydroelectric Exhibition Model',
      highlight: 'Full Laboratory Setup',
      desc: 'Ladies, gentlemen, teachers and students! Today we demonstrate how natural flowing water can be harnessed to generate clean, green, renewable electricity with zero smoke or pollution.',
    },
    {
      id: 2,
      cam: 'dam',
      title: 'Step 1: Elevated Water Reservoir (Stored Energy)',
      highlight: 'Water Reservoir & Dam',
      desc: 'Water is stored high up in an elevated reservoir. Because of its elevation, this water possesses Gravitational Potential Energy. The higher the dam (the water head), the higher the potential energy.',
    },
    {
      id: 3,
      cam: 'turbine',
      title: 'Step 2: Penstock Nozzle & Pelton Turbine',
      highlight: 'Penstock & Runner Blades',
      desc: 'When we open the sluice gate, water accelerates down the pipe, converting potential energy into high-velocity kinetic energy! The concentrated jet strikes the curved turbine buckets, causing the wheel to rotate rapidly.',
    },
    {
      id: 4,
      cam: 'generator',
      title: 'Step 3: Rotating Shaft & Electromagnetic Induction',
      highlight: 'Shaft, Rotor Magnet & Stator Coils',
      desc: 'The spinning runner turns the drive shaft connected directly to the electric generator. Inside, permanent magnets rotate past stationary copper coils. According to Faraday’s Law of Induction, this movement pushes free electrons to create electrical current.',
    },
    {
      id: 5,
      cam: 'bulb',
      title: 'Step 4: Electricity Generation & Glowing Light Bulb',
      highlight: 'Transmission Wires & Filament Bulb',
      desc: 'The electric current flows through the copper transmission circuit straight to our demonstration bulb. The electrical energy forces through the filament, illuminating the room! Energy was not created from nothing—it simply transformed from water into light!',
    },
  ];

  const currentStepData = presentationSteps.find((s) => s.id === currentStep) || presentationSteps[0];

  // Auto-play timer
  useEffect(() => {
    let timer: number;
    if (isAutoPlaying) {
      timer = window.setTimeout(() => {
        if (currentStep < presentationSteps.length) {
          goToStep(currentStep + 1);
        } else {
          setIsAutoPlaying(false);
        }
      }, 8500); // 8.5 seconds per step for 2-3 min demo
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStep]);

  const goToStep = (step: number) => {
    soundManager.playClick();
    onSetStep(step);
    const stepObj = presentationSteps.find((s) => s.id === step);
    if (stepObj) {
      onCameraFocus(stepObj.cam);
    }
  };

  const handleNext = () => {
    if (currentStep < presentationSteps.length) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Presentation Banner */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-black uppercase text-emerald-300">
              Science Exhibition Live Demonstration
            </div>
            <div className="text-[11px] text-slate-300">
              Step {currentStep} of {presentationSteps.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto play toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isAutoPlaying
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>{t.pause}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{t.autoPlay}</span>
              </>
            )}
          </button>

          {/* Exit Presentation */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-rose-500/50 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.exitPresentation}</span>
          </button>
        </div>
      </div>

      {/* Center/Bottom Presenter Dialogue Card */}
      <div className="w-full max-w-3xl mx-auto bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md pointer-events-auto animate-fade-in mb-4">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
              {currentStep}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white font-['Fredoka',sans-serif]">
              {currentStepData.title}
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {currentStepData.highlight}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mb-4">
          {currentStepData.desc}
        </p>

        {/* Navigation & Step Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {presentationSteps.map((s) => (
              <button
                key={s.id}
                onClick={() => goToStep(s.id)}
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  s.id === currentStep
                    ? 'bg-emerald-400 text-slate-950 scale-110 shadow-md shadow-emerald-400/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === presentationSteps.length}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>{t.nextStep}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
