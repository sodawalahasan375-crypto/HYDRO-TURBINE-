/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHydraulicPower,
  calculateJetVelocity,
  calculateTurbineRpm,
  calculateElectricalPower,
  calculateBulbVisuals,
  computeSimulationStep,
  DENSITY_WATER_KG_M3,
  GRAVITY_M_S2,
} from './physics';

test('Hydraulic power calculates correctly based on P = rho * g * Q * H', () => {
  const flowM3s = 0.01; // 10 L/s
  const headMeters = 5;
  const expected = DENSITY_WATER_KG_M3 * GRAVITY_M_S2 * flowM3s * headMeters;
  const actual = calculateHydraulicPower(flowM3s, headMeters);
  assert.ok(Math.abs(actual - expected) < 0.001);

  // Zero flow or head yields zero power
  assert.equal(calculateHydraulicPower(0, 5), 0);
  assert.equal(calculateHydraulicPower(0.01, 0), 0);
});

test('Torricelli jet velocity scales with sqrt(2 * g * H)', () => {
  const head = 4.903325; // 2 * g * H = 2 * 9.80665 * 4.903325 = 9.80665^2 => velocity ~ 9.8 m/s
  const velocity = calculateJetVelocity(head);
  assert.ok(Math.abs(velocity - 9.80665) < 0.01);
  assert.equal(calculateJetVelocity(0), 0);
});

test('Turbine RPM responds to jet velocity, flow rate and blockage', () => {
  const v = 10;
  const normalRpm = calculateTurbineRpm(v, 80, false);
  assert.ok(normalRpm > 0, 'Turbine should spin when water flows');

  const fasterRpm = calculateTurbineRpm(v * 1.4, 80, false);
  assert.ok(fasterRpm > normalRpm, 'Higher velocity head should increase RPM');

  const blockedRpm = calculateTurbineRpm(v, 80, true);
  assert.equal(blockedRpm, 0, 'Blocked turbine should have 0 RPM');

  const zeroFlowRpm = calculateTurbineRpm(v, 0, false);
  assert.equal(zeroFlowRpm, 0, 'Zero flow should result in 0 RPM');
});

test('Electrical power calculations and disconnection fault', () => {
  const hydPower = 100;
  const rpm = 500;
  const normal = calculateElectricalPower(hydPower, rpm, false);
  assert.ok(normal.electricalWatts > 0);
  assert.ok(normal.efficiency > 0.5 && normal.efficiency <= 0.85);

  const disconnected = calculateElectricalPower(hydPower, rpm, true);
  assert.equal(disconnected.electricalWatts, 0, 'Disconnected generator yields 0 W');
  assert.equal(disconnected.efficiency, 0);
});

test('Bulb brightness transitions from off to full brightness', () => {
  const off = calculateBulbVisuals(0);
  assert.equal(off.brightnessPercent, 0);
  assert.equal(off.lumens, 0);

  const low = calculateBulbVisuals(10);
  assert.ok(low.brightnessPercent > 0 && low.brightnessPercent < 50);

  const bright = calculateBulbVisuals(75);
  assert.equal(bright.brightnessPercent, 100);
  assert.ok(bright.lumens > 700);
});

test('computeSimulationStep aggregates full state accurately', () => {
  const stoppedState = computeSimulationStep({
    isRunning: false,
    waterFlowPercent: 50,
    waterHeightMeters: 5,
  });
  assert.equal(stoppedState.flowRateLps, 0);
  assert.equal(stoppedState.electricalPowerWatts, 0);
  assert.equal(stoppedState.bulbBrightnessPercent, 0);

  const runningState = computeSimulationStep(
    {
      isRunning: true,
      waterFlowPercent: 60,
      waterHeightMeters: 6,
    },
    100, // previous energy
    1.0 // 1 second
  );
  assert.ok(runningState.flowRateLps > 0);
  assert.ok(runningState.turbineRpm > 100);
  assert.ok(runningState.electricalPowerWatts > 10);
  assert.ok(runningState.bulbBrightnessPercent > 20);
  assert.ok(runningState.energyJoulesTotal > 100);
});
