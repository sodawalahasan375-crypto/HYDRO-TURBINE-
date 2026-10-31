/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { soundManager } from '../audio/soundEffects';

interface GuideDialogueProps {
  language: Language;
  currentStageId: number;
  onSetStage: (stageId: number) => void;
  onClose?: () => void;
  isSpeechMuted: boolean;
  onToggleSpeech: () => void;
  onCameraFocus?: (viewKey: string) => void;
}

export const GuideDialogue: React.FC<GuideDialogueProps> = ({
  language,
  currentStageId,
  onSetStage,
  onClose,
  isSpeechMuted,
  onToggleSpeech,
  onCameraFocus,
}) => {
  const t = translations[language];
  const stage = t.stages.find((s) => s.id === currentStageId) || t.stages[0];
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-speak dialogue when stage changes if speech is not muted
  useEffect(() => {
    if (!isSpeechMuted) {
      setIsSpeaking(true);
      soundManager.speak(stage.guideText, language, () => {
        setIsSpeaking(false);
      });
    } else {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
    }
  }, [stage, language, isSpeechMuted]);

  const handleStageChange = (newStage: number) => {
    if (newStage >= 1 && newStage <= t.stages.length) {
      soundManager.playClick();
      onSetStage(newStage);

      // Auto focus camera to relevant component
      if (onCameraFocus) {
        if (newStage === 1) onCameraFocus('dam');
        else if (newStage === 2) onCameraFocus('turbine');
        else if (newStage === 3) onCameraFocus('generator');
        else if (newStage === 4) onCameraFocus('bulb');
        else if (newStage === 5) onCameraFocus('full');
      }
    }
  };

  const handleReplayVoice = () => {
    soundManager.playClick();
    setIsSpeaking(true);
    soundManager.speak(stage.guideText, language, () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="absolute top-4 left-4 z-30 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-2xl p-4 text-slate-100 backdrop-blur-md animate-fade-in pointer-events-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* Guide Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center text-lg">
            <span>🧑‍🔬</span>
          </div>
          <div>
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1">
              <span>{t.guideCharacterName}</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <div className="text-[11px] font-semibold text-slate-300">
              {stage.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Replay speech button */}
          <button
            onClick={handleReplayVoice}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Read Dialogue"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Mute Speech button */}
          <button
            onClick={onToggleSpeech}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isSpeechMuted ? 'Turn voice narration on' : 'Mute voice narration'}
          >
            {isSpeechMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Concept badge */}
      <div className="mb-2">
        <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">
          {stage.concept}
        </span>
      </div>

      {/* Guide Speech Text */}
      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mb-3">
        "{stage.guideText}"
      </p>

      {/* Stage 5 Special Energy Flowchart */}
      {currentStageId === 5 && (
        <div className="mb-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
          <div className="text-amber-300 font-bold text-center text-xs pb-1 border-b border-slate-800">
            ⚡ Energy Transformation Chain
          </div>
          <div className="flex items-center gap-1.5 text-sky-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{t.energyFlow.step1}</span>
          </div>
          <div className="text-slate-500 pl-4">↓ (Potential → Kinetic)</div>
          <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{t.energyFlow.step2}</span>
          </div>
          <div className="text-slate-500 pl-4">↓ (Kinetic → Mechanical)</div>
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{t.energyFlow.step3}</span>
          </div>
          <div className="text-slate-500 pl-4">↓ (Mechanical → Magnetic)</div>
          <div className="flex items-center gap-1.5 text-purple-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{t.energyFlow.step4}</span>
          </div>
          <div className="text-slate-500 pl-4">↓ (Induction → Current)</div>
          <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t.energyFlow.step5}</span>
          </div>
          <div className="text-slate-500 pl-4">↓ (Electrical → Visible Light)</div>
          <div className="flex items-center gap-1.5 text-yellow-300 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>{t.energyFlow.step6} 💡</span>
          </div>
        </div>
      )}

      {/* Stage Dots & Navigation Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
        {/* Step dots */}
        <div className="flex items-center gap-1">
          {t.stages.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStageChange(s.id)}
              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                s.id === currentStageId
                  ? 'bg-amber-400 text-slate-950 scale-110 shadow-sm shadow-amber-400/50'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleStageChange(currentStageId - 1)}
            disabled={currentStageId === 1}
            className="p-1 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            title={t.prevStep}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStageChange(currentStageId + 1)}
            disabled={currentStageId === t.stages.length}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-sm cursor-pointer"
          >
            <span>{t.nextStep}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
