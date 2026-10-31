/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { HydroScene } from './three/HydroScene';
import { computeSimulationStep, SimulationOutputs } from './simulation/physics';
import { soundManager } from './audio/soundEffects';
import { Language } from './i18n/translations';

// Components
import { TitleScreen } from './components/TitleScreen';
import { GuideDialogue } from './components/GuideDialogue';
import { HudDashboard } from './components/HudDashboard';
import { BottomControls } from './components/BottomControls';
import { ComponentModal } from './components/ComponentModal';
import { ChallengesModal, ActiveFault } from './components/ChallengesModal';
import { FactsModal } from './components/FactsModal';
import { PresentationMode } from './components/PresentationMode';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const hydroSceneRef = useRef<HydroScene | null>(null);

  // App & Intro State
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') !== '1';
    }
    return true;
  });

  const [language, setLanguage] = useState<Language>('en');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);

  // Simulation Controls State
  const [isRunning, setIsRunning] = useState(false);
  const [waterFlowPercent, setWaterFlowPercent] = useState(65);
  const [waterHeightMeters, setWaterHeightMeters] = useState(6.0);
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [isExploreInside, setIsExploreInside] = useState(false);
  const [activeCamera, setActiveCamera] = useState('full');

  // Simulation Outputs & History
  const [simData, setSimData] = useState<SimulationOutputs>(() =>
    computeSimulationStep({
      isRunning: false,
      waterFlowPercent: 0,
      waterHeightMeters: 6.0,
    })
  );
  const [powerHistory, setPowerHistory] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  // Learning Stage & Guide
  const [currentStageId, setCurrentStageId] = useState(1);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  // Modals
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isFactsOpen, setIsFactsOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [presentationStep, setPresentationStep] = useState(1);

  // Faults & Challenges
  const [activeFault, setActiveFault] = useState<ActiveFault>('none');
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [totalPoints, setTotalPoints] = useState(0);

  // Mount Three.js Scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new HydroScene(canvasMountRef.current);
    hydroSceneRef.current = scene;

    scene.onComponentClick = (componentId: string) => {
      soundManager.playClick();
      setActiveComponentId(componentId);
    };

    return () => {
      scene.dispose();
      hydroSceneRef.current = null;
    };
  }, []);

  // Main Simulation Physics Loop (Throttled at 20Hz)
  useEffect(() => {
    let energyAccum = simData.energyJoulesTotal;

    const interval = setInterval(() => {
      const isBlocked = activeFault === 'debrisBlocked';
      const isDisconnected = activeFault === 'wireLoose';
      const effectiveFlow = activeFault === 'valveStuck' ? 0 : waterFlowPercent;
      const effectiveHead = activeFault === 'lowHead' ? 1.0 : waterHeightMeters;

      const outputs = computeSimulationStep(
        {
          isRunning,
          waterFlowPercent: effectiveFlow,
          waterHeightMeters: effectiveHead,
          isBlocked,
          isDisconnected,
          isSlowMotion,
        },
        energyAccum,
        0.05
      );

      energyAccum = outputs.energyJoulesTotal;
      setSimData(outputs);

      // Update 3D Scene visuals
      if (hydroSceneRef.current) {
        hydroSceneRef.current.updateState(
          effectiveFlow,
          effectiveHead,
          outputs.turbineRpm,
          outputs.electricalPowerWatts,
          outputs.bulbBrightnessPercent,
          outputs.bulbColorHex,
          isSlowMotion,
          isExploreInside,
          isBlocked,
          isDisconnected
        );
      }

      // Update sound effects
      soundManager.updateSimulationAudio(
        effectiveFlow,
        outputs.turbineRpm,
        outputs.electricalPowerWatts
      );

      // Record power history for live graph (keep latest 18 samples)
      setPowerHistory((prev) => {
        const next = [...prev, outputs.electricalPowerWatts];
        if (next.length > 18) next.shift();
        return next;
      });

      // Check Mission Completions
      // Mission 1: Light the bulb (>= 25W)
      if (outputs.electricalPowerWatts >= 25 && !completedMissions['challenge1']) {
        setCompletedMissions((prev) => ({ ...prev, challenge1: true }));
        setTotalPoints((p) => p + 100);
        soundManager.playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }

      // Mission 2: Fastest turbine (>= 1,000 RPM)
      if (outputs.turbineRpm >= 1000 && !completedMissions['challenge2']) {
        setCompletedMissions((prev) => ({ ...prev, challenge2: true }));
        setTotalPoints((p) => p + 150);
        soundManager.playSuccessChime();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }

      // Mission 3: Save water (>= 35W while flow <= 40%)
      if (
        outputs.electricalPowerWatts >= 35 &&
        effectiveFlow <= 40 &&
        !completedMissions['challenge3']
      ) {
        setCompletedMissions((prev) => ({ ...prev, challenge3: true }));
        setTotalPoints((p) => p + 200);
        soundManager.playSuccessChime();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [
    isRunning,
    waterFlowPercent,
    waterHeightMeters,
    activeFault,
    isSlowMotion,
    isExploreInside,
    completedMissions,
  ]);

  // Audio mute toggles
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setSoundMuted(nextMuted);
  };

  const handleToggleSpeech = () => {
    const nextSpeechMuted = !isSpeechMuted;
    setIsSpeechMuted(nextSpeechMuted);
    soundManager.setSpeechMuted(nextSpeechMuted);
  };

  // Intro handlers
  const handleStartExploring = () => {
    soundManager.playClick();
    setShowIntro(false);
    setIsRunning(true);
    if (hydroSceneRef.current) {
      hydroSceneRef.current.setCameraPreset('full');
    }
  };

  const handleSkipIntro = () => {
    soundManager.playClick();
    setShowIntro(false);
    setIsRunning(true);
  };

  // Camera preset handler
  const handleSetCamera = (camKey: string) => {
    setActiveCamera(camKey);
    if (hydroSceneRef.current) {
      hydroSceneRef.current.setCameraPreset(camKey);
    }
  };

  // Reset experiment
  const handleReset = () => {
    setIsRunning(false);
    setWaterFlowPercent(50);
    setWaterHeightMeters(5.0);
    setIsSlowMotion(false);
    setIsExploreInside(false);
    setActiveFault('none');
    setActiveCamera('full');
    if (hydroSceneRef.current) {
      hydroSceneRef.current.setCameraPreset('full');
    }
  };

  // Fault handling
  const handleTriggerFault = (fault: ActiveFault) => {
    soundManager.playClick();
    setActiveFault(fault);
  };

  const handleFixFault = () => {
    setActiveFault('none');
    if (!completedMissions['challenge4']) {
      setCompletedMissions((prev) => ({ ...prev, challenge4: true }));
      setTotalPoints((p) => p + 250);
    }
  };

  // Presentation Mode handlers
  const handleStartPresentation = () => {
    soundManager.playClick();
    setIsPresentationOpen(true);
    setPresentationStep(1);
    setIsRunning(true);
    setWaterFlowPercent(75);
    setWaterHeightMeters(6.5);
    handleSetCamera('full');
  };

  const handleExitPresentation = () => {
    soundManager.playClick();
    setIsPresentationOpen(false);
    handleSetCamera('full');
  };

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]"
      data-testid="hydro-hero-app"
    >
      {/* 3D WebGL Canvas Mount (Isolated from React HUD overlays) */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        data-testid="webgl-canvas"
      />

      {/* 1. Opening Intro Screen */}
      {showIntro && (
        <TitleScreen
          language={language}
          onSetLanguage={setLanguage}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStartExploring={handleStartExploring}
          onSkipIntro={handleSkipIntro}
        />
      )}

      {/* 2. Top HUD Dashboard with Gauges & Power Sparkline */}
      {!showIntro && !isPresentationOpen && (
        <HudDashboard
          language={language}
          simData={simData}
          powerHistory={powerHistory}
          onOpenChallenges={() => setIsChallengesOpen(true)}
          onOpenFacts={() => setIsFactsOpen(true)}
          onStartPresentation={handleStartPresentation}
          onOpenComponent={setActiveComponentId}
        />
      )}

      {/* 3. Friendly Scientist Guide Dialogue & 5 Learning Stages */}
      {!showIntro && isGuideOpen && !isPresentationOpen && (
        <GuideDialogue
          language={language}
          currentStageId={currentStageId}
          onSetStage={setCurrentStageId}
          onClose={() => setIsGuideOpen(false)}
          isSpeechMuted={isSpeechMuted}
          onToggleSpeech={handleToggleSpeech}
          onCameraFocus={handleSetCamera}
        />
      )}

      {/* Re-open Guide button if closed */}
      {!showIntro && !isGuideOpen && !isPresentationOpen && (
        <button
          onClick={() => setIsGuideOpen(true)}
          className="absolute top-4 left-4 z-30 p-2.5 rounded-full bg-slate-900/90 border border-sky-500/40 hover:bg-slate-800 text-sky-400 font-bold shadow-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <span>🧑‍🔬</span>
          <span>Guide</span>
        </button>
      )}

      {/* 4. Sleek Collapsible Bottom Controls Dock */}
      {!showIntro && !isPresentationOpen && (
        <BottomControls
          language={language}
          isRunning={isRunning}
          onToggleRunning={() => setIsRunning(!isRunning)}
          flowPercent={waterFlowPercent}
          onFlowChange={setWaterFlowPercent}
          headHeight={waterHeightMeters}
          onHeadChange={setWaterHeightMeters}
          onReset={handleReset}
          isSlowMotion={isSlowMotion}
          onToggleSlowMotion={() => setIsSlowMotion(!isSlowMotion)}
          isExploreInside={isExploreInside}
          onToggleExploreInside={() => setIsExploreInside(!isExploreInside)}
          activeCamera={activeCamera}
          onSetCamera={handleSetCamera}
          onOpenComponent={setActiveComponentId}
        />
      )}

      {/* 5. Click-to-Learn Component Modal */}
      <ComponentModal
        language={language}
        componentId={activeComponentId}
        onClose={() => setActiveComponentId(null)}
        onFocusComponent={handleSetCamera}
      />

      {/* 6. Challenges & Missions Modal */}
      <ChallengesModal
        language={language}
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
        completedMissions={completedMissions}
        activeFault={activeFault}
        onTriggerFault={handleTriggerFault}
        onFixFault={handleFixFault}
        totalPoints={totalPoints}
      />

      {/* 7. Facts & Comparisons Modal */}
      <FactsModal
        language={language}
        isOpen={isFactsOpen}
        onClose={() => setIsFactsOpen(false)}
      />

      {/* 8. Science Exhibition Presentation Mode */}
      <PresentationMode
        language={language}
        isOpen={isPresentationOpen}
        onExit={handleExitPresentation}
        currentStep={presentationStep}
        onSetStep={setPresentationStep}
        onCameraFocus={handleSetCamera}
      />
    </main>
  );
}
