/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SimulationInputs {
  isRunning: boolean;
  waterFlowPercent: number; // 0 to 100%
  waterHeightMeters: number; // 1 to 10 meters (effective head H)
  isBlocked?: boolean;
  isDisconnected?: boolean;
  isSlowMotion?: boolean;
}

export interface SimulationOutputs {
  flowRateLps: number; // Liters per second (Q in L/s)
  flowRateM3s: number; // m^3/s
  waterHeadMeters: number; // H in meters
  jetVelocityMs: number; // v = sqrt(2 * g * H) in m/s
  hydraulicPowerWatts: number; // P_hyd = rho * g * Q * H
  turbineRpm: number; // Rotations per minute
  generatorEfficiency: number; // e.g. 0.75 - 0.82
  electricalPowerWatts: number; // P_elec = P_hyd * efficiency
  bulbBrightnessPercent: number; // 0 to 100%
  bulbLumensEstimate: number; // Simulated lumens
  bulbColorHex: string; // Dynamic warm-amber to bright incandescent white
  energyJoulesTotal: number; // Cumulative energy
  energyWattHours: number; // Cumulative Wh
}

export const DENSITY_WATER_KG_M3 = 1000;
export const GRAVITY_M_S2 = 9.80665;
export const MAX_FLOW_LPS = 12.0; // Miniature lab scale: max 12 Liters/sec
export const BASE_TURBINE_RADIUS_M = 0.12;

/**
 * Calculates hydraulic power according to standard physics:
 * P = rho * g * Q * H
 */
export function calculateHydraulicPower(flowRateM3s: number, headMeters: number): number {
  if (flowRateM3s <= 0 || headMeters <= 0) return 0;
  return DENSITY_WATER_KG_M3 * GRAVITY_M_S2 * flowRateM3s * headMeters;
}

/**
 * Calculates theoretical Torricelli nozzle jet velocity:
 * v = sqrt(2 * g * H)
 */
export function calculateJetVelocity(headMeters: number): number {
  if (headMeters <= 0) return 0;
  return Math.sqrt(2 * GRAVITY_M_S2 * headMeters);
}

/**
 * Calculates turbine RPM based on jet velocity, water flow, and mechanical load
 */
export function calculateTurbineRpm(
  jetVelocityMs: number,
  flowPercent: number,
  isBlocked = false
): number {
  if (isBlocked || flowPercent <= 0 || jetVelocityMs <= 0) return 0;

  // Pelton turbine optimal blade speed is approx 45% of water jet speed:
  // u = 0.45 * v = omega * r = (2 * pi * N / 60) * r
  // N = (0.45 * v * 60) / (2 * pi * r)
  const theoreticalMaxRpm = (0.46 * jetVelocityMs * 60) / (2 * Math.PI * BASE_TURBINE_RADIUS_M);
  
  // Real turbine throttled by flow rate (mass flow pushes blades against friction)
  const flowFactor = Math.pow(flowPercent / 100, 0.7);
  return Math.round(theoreticalMaxRpm * flowFactor);
}

/**
 * Calculates electrical power taking into account turbine & generator conversion efficiency
 */
export function calculateElectricalPower(
  hydraulicPowerWatts: number,
  turbineRpm: number,
  isDisconnected = false
): { electricalWatts: number; efficiency: number } {
  if (isDisconnected || hydraulicPowerWatts <= 0 || turbineRpm <= 0) {
    return { electricalWatts: 0, efficiency: 0 };
  }

  // Realistic efficiency curve: peaks around 78% at nominal RPM, lower at very low RPM
  const rpmFactor = Math.min(1.0, turbineRpm / 600);
  const efficiency = 0.76 * Math.max(0.2, rpmFactor);
  const electricalWatts = Math.round(hydraulicPowerWatts * efficiency * 10) / 10;

  return {
    electricalWatts,
    efficiency: Math.round(efficiency * 100) / 100,
  };
}

/**
 * Calculates light bulb brightness percentage (0-100%) and color temperature
 * Standard 60W equivalent lab model: turns on visibly around 5W, full brightness at 60W+
 */
export function calculateBulbVisuals(electricalWatts: number): {
  brightnessPercent: number;
  lumens: number;
  colorHex: string;
} {
  if (electricalWatts <= 0.5) {
    return {
      brightnessPercent: 0,
      lumens: 0,
      colorHex: '#334155', // Cold dark filament
    };
  }

  // Non-linear perception curve for glowing bulb
  // Threshold at 3W, reaches 100% around 65W
  const normalizedPower = Math.min(1.0, Math.max(0, (electricalWatts - 2) / 60));
  const brightnessPercent = Math.round(Math.pow(normalizedPower, 0.65) * 100);
  const lumens = Math.round(brightnessPercent * 8.5); // Up to ~850 lumens

  // Color temperature shifts from dim red-orange (1800K) to golden-yellow (2700K) to bright daylight white (4000K)
  let colorHex = '#ff5722'; // Dim orange glow
  if (brightnessPercent > 70) {
    colorHex = '#fff8e7'; // Brilliant warm white
  } else if (brightnessPercent > 40) {
    colorHex = '#ffc107'; // Bright golden yellow
  } else if (brightnessPercent > 15) {
    colorHex = '#ff9800'; // Amber
  }

  return {
    brightnessPercent,
    lumens,
    colorHex,
  };
}

/**
 * Main step calculator for the simulation loop
 */
export function computeSimulationStep(
  inputs: SimulationInputs,
  previousEnergyJoules = 0,
  deltaTimeSeconds = 0.05
): SimulationOutputs {
  if (!inputs.isRunning || inputs.waterFlowPercent <= 0) {
    return {
      flowRateLps: 0,
      flowRateM3s: 0,
      waterHeadMeters: inputs.waterHeightMeters,
      jetVelocityMs: 0,
      hydraulicPowerWatts: 0,
      turbineRpm: 0,
      generatorEfficiency: 0,
      electricalPowerWatts: 0,
      bulbBrightnessPercent: 0,
      bulbLumensEstimate: 0,
      bulbColorHex: '#334155',
      energyJoulesTotal: previousEnergyJoules,
      energyWattHours: Math.round((previousEnergyJoules / 3600) * 100) / 100,
    };
  }

  const flowRateLps = (inputs.waterFlowPercent / 100) * MAX_FLOW_LPS;
  const flowRateM3s = flowRateLps / 1000;
  const waterHeadMeters = Math.max(1, inputs.waterHeightMeters);

  const jetVelocityMs = calculateJetVelocity(waterHeadMeters);
  const hydraulicPowerWatts = calculateHydraulicPower(flowRateM3s, waterHeadMeters);
  const turbineRpm = calculateTurbineRpm(jetVelocityMs, inputs.waterFlowPercent, inputs.isBlocked);
  const { electricalWatts, efficiency } = calculateElectricalPower(
    hydraulicPowerWatts,
    turbineRpm,
    inputs.isDisconnected
  );
  const bulbVisuals = calculateBulbVisuals(electricalWatts);

  const newEnergyJoules = previousEnergyJoules + electricalWatts * deltaTimeSeconds;
  const energyWattHours = Math.round((newEnergyJoules / 3600) * 100) / 100;

  return {
    flowRateLps: Math.round(flowRateLps * 10) / 10,
    flowRateM3s,
    waterHeadMeters,
    jetVelocityMs: Math.round(jetVelocityMs * 10) / 10,
    hydraulicPowerWatts: Math.round(hydraulicPowerWatts * 10) / 10,
    turbineRpm,
    generatorEfficiency: efficiency,
    electricalPowerWatts: electricalWatts,
    bulbBrightnessPercent: bulbVisuals.brightnessPercent,
    bulbLumensEstimate: bulbVisuals.lumens,
    bulbColorHex: bulbVisuals.colorHex,
    energyJoulesTotal: Math.round(newEnergyJoules * 10) / 10,
    energyWattHours,
  };
}
