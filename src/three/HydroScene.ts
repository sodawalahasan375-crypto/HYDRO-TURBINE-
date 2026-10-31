/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Pre-allocated math objects to avoid garbage collection inside render loop
const _vec3 = new THREE.Vector3();
const _color = new THREE.Color();

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  full: {
    position: [12, 10, 16],
    target: [0, 4, 0],
  },
  dam: {
    position: [-6, 11, 10],
    target: [-5.5, 7.5, 0],
  },
  turbine: {
    position: [2.5, 4.2, 5.5],
    target: [0.5, 3.2, 0],
  },
  generator: {
    position: [6.5, 4.5, 5.0],
    target: [4.2, 3.2, 0],
  },
  bulb: {
    position: [8.5, 5.5, 5.5],
    target: [7.2, 4.5, 0],
  },
};

export class HydroScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private isDisposed: boolean = false;

  // Camera animation
  private targetCamPos = new THREE.Vector3(12, 10, 16);
  private targetCamLook = new THREE.Vector3(0, 4, 0);
  private currentCamLook = new THREE.Vector3(0, 4, 0);
  private isUserInteracting = false;
  private pointerDownPos = { x: 0, y: 0 };
  private spherical = { radius: 22, theta: 0.8, phi: 1.1 };
  private isDragging = false;

  // Interactive 3D objects
  private interactables: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-999, -999);
  private hoveredObject: THREE.Object3D | null = null;
  public onComponentClick?: (componentId: string) => void;
  public onComponentHover?: (componentId: string | null) => void;

  // Mechanical Components
  private reservoirWaterMesh!: THREE.Mesh;
  private reservoirTankGroup!: THREE.Group;
  private penstockMesh!: THREE.Mesh;
  private penstockWaterMesh!: THREE.Mesh;
  private penstockParticles!: THREE.Points;
  private penstockParticleCount = 120;
  private penstockParticleProgress: Float32Array = new Float32Array(120);

  // Turbine
  private turbineRunnerGroup!: THREE.Group;
  private turbineBlades: THREE.Mesh[] = [];
  private waterJetMesh!: THREE.Mesh;
  private waterJetMaterial!: THREE.MeshStandardMaterial;
  private splashParticles!: THREE.Points;
  private splashCount = 160;
  private splashVelocities: Float32Array = new Float32Array(160 * 3);

  // Shaft and Generator
  private shaftMesh!: THREE.Mesh;
  private generatorRotorGroup!: THREE.Group;
  private northPoleMesh!: THREE.Mesh;
  private southPoleMesh!: THREE.Mesh;
  private statorCoils: THREE.Mesh[] = [];
  private magneticFieldMesh!: THREE.Mesh;
  private generatorCasingMesh!: THREE.Mesh;

  // Electrical Wire Particles
  private wireElectronParticles!: THREE.Points;
  private wireParticleCount = 80;
  private wireCurve!: THREE.CatmullRomCurve3;

  // Light Bulb
  private bulbGlassMesh!: THREE.Mesh;
  private bulbFilamentMesh!: THREE.Mesh;
  private bulbFilamentMat!: THREE.MeshStandardMaterial;
  private bulbLight!: THREE.PointLight;
  private bulbHaloMesh!: THREE.Mesh;
  private bulbHaloMat!: THREE.MeshBasicMaterial;

  // Collection Tank
  private lowerWaterMesh!: THREE.Mesh;
  private lowerWaterMaterial!: THREE.MeshStandardMaterial;

  // State
  private currentRpm = 0;
  private currentFlowPercent = 0;
  private currentHeadHeight = 5;
  private currentBulbBrightness = 0;
  private currentWatts = 0;
  private isSlowMotion = false;
  private isExploreInside = false;
  private isBlocked = false;
  private isDisconnected = false;
  private startTime = performance.now();

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep slate laboratory / dusk valley
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.022);

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.2,
      120
    );
    this.camera.position.set(12, 10, 16);
    this.camera.lookAt(0, 4, 0);

    // 5. Procedural Room Environment for PBR Reflections
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 6. Lighting
    this.setupLighting();

    // 7. Build Procedural 3D World & Hydro Components
    this.buildWorld();
    this.buildHydroPlant();

    // 8. Event Listeners
    this.bindEvents();

    // 9. Start Render Loop
    this.startLoop();
  }

  private setupLighting() {
    // Cool sky / warm ground ambient hemisphere
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.1);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    // Warm Sun Directional Light (Key Light)
    const sunLight = new THREE.DirectionalLight(0xfff1dc, 2.0);
    sunLight.position.set(15, 25, 12);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 60;
    const d = 16;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Rim/Accent Light from opposite side
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(-15, 10, -10);
    this.scene.add(rimLight);
  }

  private buildWorld() {
    // Laboratory Pedestal / Mountain Valley base
    const baseGroup = new THREE.Group();

    // Stylized laboratory workbench top
    const benchGeo = new THREE.BoxGeometry(26, 1.2, 16);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.75,
      metalness: 0.15,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.6, 0);
    bench.receiveShadow = !this.isSoftwareGl;
    baseGroup.add(bench);

    // Polished aluminum trim bevel around table
    const trimGeo = new THREE.BoxGeometry(26.3, 0.25, 16.3);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.25,
      metalness: 0.85,
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, 0.05, 0);
    baseGroup.add(trim);

    // Soft Contact Shadow Plane under plant
    const shadowGeo = new THREE.PlaneGeometry(24, 14);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.02;
    baseGroup.add(shadowPlane);

    // Miniature stylized pine trees around dam for laboratory scale
    const treePositions = [
      [-9, 0, -5],
      [-10, 0, -3],
      [-9.5, 0, 4],
      [-11, 0, 2],
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      const tree = this.createStylizedTree();
      tree.position.set(tx, ty, tz);
      baseGroup.add(tree);
    });

    this.scene.add(baseGroup);
  }

  private createStylizedTree(): THREE.Group {
    const group = new THREE.Group();
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.8, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.4;
    group.add(trunk);

    // Foliage cones (3 tiers)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
    for (let i = 0; i < 3; i++) {
      const coneGeo = new THREE.ConeGeometry(0.75 - i * 0.18, 0.9, 7);
      const cone = new THREE.Mesh(coneGeo, leafMat);
      cone.position.y = 0.8 + i * 0.55;
      group.add(cone);
    }
    return group;
  }

  private buildHydroPlant() {
    // -------------------------------------------------------------
    // A. ELEVATED WATER RESERVOIR & DAM (X: ~ -6, Y: ~ 6 to 9)
    // -------------------------------------------------------------
    this.reservoirTankGroup = new THREE.Group();
    this.reservoirTankGroup.position.set(-6.5, 0, 0);

    // Dam masonry support pillars (reinforced concrete look)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.1,
    });
    for (let px of [-1.6, 1.6]) {
      for (let pz of [-1.6, 1.6]) {
        const pillarGeo = new THREE.BoxGeometry(0.6, 8, 0.6);
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, 4, pz);
        pillar.castShadow = !this.isSoftwareGl;
        this.reservoirTankGroup.add(pillar);
      }
    }

    // Steel cross braces
    const braceMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
    const braceGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6);
    const brace1 = new THREE.Mesh(braceGeo, braceMat);
    brace1.rotation.z = Math.PI / 4;
    brace1.position.set(0, 3.5, 1.6);
    this.reservoirTankGroup.add(brace1);

    // Tank Upper Basin Structure
    const basinOuterGeo = new THREE.CylinderGeometry(2.2, 2.0, 3.2, 24);
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan-blue
      roughness: 0.35,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const basinOuter = new THREE.Mesh(basinOuterGeo, basinMat);
    basinOuter.position.y = 7.6;
    basinOuter.castShadow = !this.isSoftwareGl;
    basinOuter.name = 'dam';
    this.reservoirTankGroup.add(basinOuter);
    this.interactables.push(basinOuter);

    // Tank Top Rim (Metallic silver)
    const rimGeo = new THREE.TorusGeometry(2.22, 0.12, 12, 24);
    const rim = new THREE.Mesh(rimGeo, braceMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 9.2;
    this.reservoirTankGroup.add(rim);

    // Water inside Reservoir (Level animates with Head Height slider)
    const waterGeo = new THREE.CylinderGeometry(2.1, 1.95, 2.6, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    this.reservoirWaterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.reservoirWaterMesh.position.y = 7.4;
    this.reservoirTankGroup.add(this.reservoirWaterMesh);

    // Intake Sluice Valve Box on the side
    const valveGeo = new THREE.BoxGeometry(0.8, 1.0, 0.8);
    const valveMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.6 });
    const valve = new THREE.Mesh(valveGeo, valveMat);
    valve.position.set(2.0, 6.4, 0);
    valve.name = 'dam';
    this.reservoirTankGroup.add(valve);
    this.interactables.push(valve);

    this.scene.add(this.reservoirTankGroup);

    // -------------------------------------------------------------
    // B. PENSTOCK PIPE & NOZZLE (Runs from X: -4.5 down to X: 0.2)
    // -------------------------------------------------------------
    const penstockPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, 6.4, 0),
      new THREE.Vector3(-3.2, 5.5, 0),
      new THREE.Vector3(-1.8, 4.0, 0),
      new THREE.Vector3(-0.6, 3.25, 0),
      new THREE.Vector3(0.0, 3.25, 0),
    ]);

    // Outer Transparent Acrylic Pipe
    const pipeGeo = new THREE.TubeGeometry(penstockPath, 32, 0.35, 16, false);
    const pipeMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      roughness: 0.1,
      metalness: 0.05,
      transparent: true,
      opacity: this.isSoftwareGl ? 0.45 : 0.65,
      depthWrite: false,
    });
    this.penstockMesh = new THREE.Mesh(pipeGeo, pipeMat);
    this.penstockMesh.name = 'penstock';
    this.scene.add(this.penstockMesh);
    this.interactables.push(this.penstockMesh);

    // Inner Water Core Mesh
    const waterCoreGeo = new THREE.TubeGeometry(penstockPath, 32, 0.28, 16, false);
    const waterCoreMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
    });
    this.penstockWaterMesh = new THREE.Mesh(waterCoreGeo, waterCoreMat);
    this.scene.add(this.penstockWaterMesh);

    // Animated Water Bubble/Droplet Particles inside penstock
    const particlePositions = new Float32Array(this.penstockParticleCount * 3);
    for (let i = 0; i < this.penstockParticleCount; i++) {
      this.penstockParticleProgress[i] = i / this.penstockParticleCount;
      const pt = penstockPath.getPointAt(this.penstockParticleProgress[i]);
      particlePositions[i * 3] = pt.x;
      particlePositions[i * 3 + 1] = pt.y;
      particlePositions[i * 3 + 2] = pt.z;
    }
    const penstockParticleGeo = new THREE.BufferGeometry();
    penstockParticleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const penstockParticleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.9,
    });
    this.penstockParticles = new THREE.Points(penstockParticleGeo, penstockParticleMat);
    this.scene.add(this.penstockParticles);

    // Brass Tapered Injector Nozzle at end of pipe
    const nozzleGeo = new THREE.CylinderGeometry(0.12, 0.35, 0.55, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.rotation.z = -Math.PI / 2;
    nozzle.position.set(0.25, 3.25, 0);
    nozzle.name = 'penstock';
    this.scene.add(nozzle);
    this.interactables.push(nozzle);

    // High velocity water jet hitting the turbine
    const jetGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.7, 12);
    this.waterJetMaterial = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    this.waterJetMesh = new THREE.Mesh(jetGeo, this.waterJetMaterial);
    this.waterJetMesh.rotation.z = -Math.PI / 2;
    this.waterJetMesh.position.set(0.85, 3.25, 0);
    this.scene.add(this.waterJetMesh);

    // Splash Spray Particles at point of impact
    const splashPositions = new Float32Array(this.splashCount * 3);
    for (let i = 0; i < this.splashCount; i++) {
      splashPositions[i * 3] = 1.15;
      splashPositions[i * 3 + 1] = 3.25;
      splashPositions[i * 3 + 2] = 0;
      this.splashVelocities[i * 3] = (Math.random() - 0.2) * 2.5;
      this.splashVelocities[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      this.splashVelocities[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    const splashGeo = new THREE.BufferGeometry();
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    this.splashParticles = new THREE.Points(splashGeo, splashMat);
    this.scene.add(this.splashParticles);

    // -------------------------------------------------------------
    // C. TURBINE RUNNER & BLADES (At X: 1.25, Y: 3.25, Z: 0)
    // -------------------------------------------------------------
    this.turbineRunnerGroup = new THREE.Group();
    this.turbineRunnerGroup.position.set(1.25, 3.25, 0);

    // Central Wheel Disk (Vibrant cyan/teal)
    const diskGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 24);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan runner wheel
      roughness: 0.3,
      metalness: 0.6,
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.rotation.x = Math.PI / 2;
    this.turbineRunnerGroup.add(disk);

    // 12 Curved Pelton Spoon Cups (Blades)
    const numBlades = 12;
    for (let i = 0; i < numBlades; i++) {
      const angle = (i / numBlades) * Math.PI * 2;
      const bladeGroup = new THREE.Group();
      bladeGroup.rotation.z = angle;

      // Curved spoon cup geometry
      const cupGeo = new THREE.SphereGeometry(0.22, 12, 10, 0, Math.PI, 0, Math.PI / 2);
      const cupMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xf59e0b : 0xec4899, // Alternate Amber & Pink for high visibility of rotation!
        roughness: 0.3,
        metalness: 0.5,
      });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.y = 0.72;
      cup.rotation.x = Math.PI / 2;
      bladeGroup.add(cup);

      // Arm connecting cup to hub
      const armGeo = new THREE.BoxGeometry(0.08, 0.28, 0.08);
      const arm = new THREE.Mesh(armGeo, diskMat);
      arm.position.y = 0.55;
      bladeGroup.add(arm);

      this.turbineRunnerGroup.add(bladeGroup);
      this.turbineBlades.push(cup);
    }

    // Interactive hit target for turbine
    const turbineHitBox = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 0.5, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    turbineHitBox.rotation.x = Math.PI / 2;
    turbineHitBox.name = 'turbine';
    this.turbineRunnerGroup.add(turbineHitBox);
    this.interactables.push(turbineHitBox);

    this.scene.add(this.turbineRunnerGroup);

    // Turbine Housing / Splash Casing (Semi-transparent)
    const casingGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.8, 20);
    const casingMat = new THREE.MeshPhysicalMaterial({
      color: 0x64748b,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const turbineCasing = new THREE.Mesh(casingGeo, casingMat);
    turbineCasing.rotation.x = Math.PI / 2;
    turbineCasing.position.set(1.25, 3.25, 0);
    turbineCasing.name = 'turbine';
    this.scene.add(turbineCasing);
    this.interactables.push(turbineCasing);

    // -------------------------------------------------------------
    // D. CONNECTING SHAFT (From X: 1.25 through X: 3.5 to generator)
    // -------------------------------------------------------------
    const shaftGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.2, 16);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Polished chrome steel
      roughness: 0.15,
      metalness: 0.95,
    });
    this.shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    this.shaftMesh.rotation.z = Math.PI / 2;
    this.shaftMesh.position.set(2.35, 3.25, 0);
    this.shaftMesh.name = 'shaft';
    this.scene.add(this.shaftMesh);
    this.interactables.push(this.shaftMesh);

    // Bearing blocks supporting the shaft
    for (let bx of [1.9, 2.8]) {
      const blockGeo = new THREE.BoxGeometry(0.3, 0.8, 0.4);
      const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.5 });
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(bx, 2.85, 0);
      block.name = 'shaft';
      this.scene.add(block);
      this.interactables.push(block);
    }

    // -------------------------------------------------------------
    // E. GENERATOR & ROTATING MAGNET (At X: 4.2, Y: 3.25, Z: 0)
    // -------------------------------------------------------------
    const generatorBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.6, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.3 })
    );
    generatorBase.position.set(4.2, 2.65, 0);
    generatorBase.name = 'generator';
    this.scene.add(generatorBase);
    this.interactables.push(generatorBase);

    // Stator Coils (Copper wire spools arranged around the rotor)
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Bright copper wire
      roughness: 0.35,
      metalness: 0.75,
    });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const coilGeo = new THREE.TorusGeometry(0.28, 0.12, 12, 20);
      const coil = new THREE.Mesh(coilGeo, copperMat);
      coil.position.set(4.2, 3.25 + Math.sin(angle) * 0.55, Math.cos(angle) * 0.55);
      coil.rotation.y = Math.PI / 2;
      coil.name = 'generator';
      this.scene.add(coil);
      this.statorCoils.push(coil);
      this.interactables.push(coil);
    }

    // Rotating Permanent Magnet (Rotor)
    this.generatorRotorGroup = new THREE.Group();
    this.generatorRotorGroup.position.set(4.2, 3.25, 0);

    // North Pole (Red with white 'N')
    const northGeo = new THREE.BoxGeometry(0.35, 0.8, 0.4);
    const northMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.4 });
    this.northPoleMesh = new THREE.Mesh(northGeo, northMat);
    this.northPoleMesh.position.y = 0.4;
    this.generatorRotorGroup.add(this.northPoleMesh);

    // South Pole (Blue with white 'S')
    const southGeo = new THREE.BoxGeometry(0.35, 0.8, 0.4);
    const southMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.4 });
    this.southPoleMesh = new THREE.Mesh(southGeo, southMat);
    this.southPoleMesh.position.y = -0.4;
    this.generatorRotorGroup.add(this.southPoleMesh);

    // Interactive target for generator
    const genHitBox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 1.2, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    genHitBox.rotation.z = Math.PI / 2;
    genHitBox.name = 'generator';
    this.generatorRotorGroup.add(genHitBox);
    this.interactables.push(genHitBox);

    this.scene.add(this.generatorRotorGroup);

    // Magnetic field halo (illuminates when electricity generates)
    const fieldGeo = new THREE.TorusGeometry(0.68, 0.05, 12, 24);
    const fieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
    });
    this.magneticFieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
    this.magneticFieldMesh.position.set(4.2, 3.25, 0);
    this.magneticFieldMesh.rotation.y = Math.PI / 2;
    this.scene.add(this.magneticFieldMesh);

    // Transparent protective casing around generator
    const genCasingGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.1, 24);
    const genCasingMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.generatorCasingMesh = new THREE.Mesh(genCasingGeo, genCasingMat);
    this.generatorCasingMesh.rotation.z = Math.PI / 2;
    this.generatorCasingMesh.position.set(4.2, 3.25, 0);
    this.generatorCasingMesh.name = 'generator';
    this.scene.add(this.generatorCasingMesh);
    this.interactables.push(this.generatorCasingMesh);

    // -------------------------------------------------------------
    // F. ELECTRICAL WIRES & PULSING CURRENT
    // -------------------------------------------------------------
    this.wireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(4.7, 3.5, 0.3),
      new THREE.Vector3(5.4, 4.3, 0.5),
      new THREE.Vector3(6.2, 4.4, 0.4),
      new THREE.Vector3(7.0, 4.2, 0.1),
    ]);

    const wireTubeGeo = new THREE.TubeGeometry(this.wireCurve, 24, 0.05, 8, false);
    const wireTubeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Insulated blue cable
      roughness: 0.5,
      metalness: 0.2,
    });
    const wireMesh = new THREE.Mesh(wireTubeGeo, wireTubeMat);
    wireMesh.name = 'wires';
    this.scene.add(wireMesh);
    this.interactables.push(wireMesh);

    // Animated glowing electric energy pulses traveling through the wire
    const wirePos = new Float32Array(this.wireParticleCount * 3);
    for (let i = 0; i < this.wireParticleCount; i++) {
      const p = this.wireCurve.getPointAt(i / this.wireParticleCount);
      wirePos[i * 3] = p.x;
      wirePos[i * 3 + 1] = p.y;
      wirePos[i * 3 + 2] = p.z;
    }
    const wireParticleGeo = new THREE.BufferGeometry();
    wireParticleGeo.setAttribute('position', new THREE.BufferAttribute(wirePos, 3));
    const wireParticleMat = new THREE.PointsMaterial({
      color: 0xfacc15, // Golden electric sparkle
      size: 0.16,
      transparent: true,
      opacity: 0.0,
    });
    this.wireElectronParticles = new THREE.Points(wireParticleGeo, wireParticleMat);
    this.scene.add(this.wireElectronParticles);

    // -------------------------------------------------------------
    // G. LIGHT BULB (At X: 7.2, Y: 4.5, Z: 0)
    // -------------------------------------------------------------
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(7.2, 4.2, 0);

    // Socket base (Brass screw thread)
    const socketGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.4, 16);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.position.y = 0.2;
    socket.name = 'bulb';
    bulbGroup.add(socket);
    this.interactables.push(socket);

    // Glass Envelope
    const glassGeo = new THREE.SphereGeometry(0.55, 20, 20);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.05,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.bulbGlassMesh = new THREE.Mesh(glassGeo, glassMat);
    this.bulbGlassMesh.position.y = 0.75;
    this.bulbGlassMesh.name = 'bulb';
    bulbGroup.add(this.bulbGlassMesh);
    this.interactables.push(this.bulbGlassMesh);

    // Filament Wire
    const filamentGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16);
    this.bulbFilamentMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.4,
    });
    this.bulbFilamentMesh = new THREE.Mesh(filamentGeo, this.bulbFilamentMat);
    this.bulbFilamentMesh.position.y = 0.72;
    bulbGroup.add(this.bulbFilamentMesh);

    // PointLight casting warm illumination on the scene
    this.bulbLight = new THREE.PointLight(0xffedd5, 0, 14, 1.5);
    this.bulbLight.position.set(0, 0.75, 0);
    bulbGroup.add(this.bulbLight);

    // Outer Glow Halo
    const haloGeo = new THREE.SphereGeometry(0.85, 16, 16);
    this.bulbHaloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.bulbHaloMesh = new THREE.Mesh(haloGeo, this.bulbHaloMat);
    this.bulbHaloMesh.position.y = 0.75;
    bulbGroup.add(this.bulbHaloMesh);

    this.scene.add(bulbGroup);

    // -------------------------------------------------------------
    // H. WATER COLLECTION TANK & TAILRACE (Below turbine at Y: 0.2)
    // -------------------------------------------------------------
    const tankGroup = new THREE.Group();
    tankGroup.position.set(1.2, 0, 0);

    // Basin Walls
    const tankWallGeo = new THREE.BoxGeometry(3.2, 1.0, 2.6);
    const tankWallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.75,
      metalness: 0.2,
    });
    const tankWall = new THREE.Mesh(tankWallGeo, tankWallMat);
    tankWall.position.y = 0.5;
    tankWall.name = 'tank';
    tankGroup.add(tankWall);
    this.interactables.push(tankWall);

    // Water level inside collection basin
    const lowerWaterGeo = new THREE.BoxGeometry(3.0, 0.8, 2.4);
    this.lowerWaterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    this.lowerWaterMesh = new THREE.Mesh(lowerWaterGeo, this.lowerWaterMaterial);
    this.lowerWaterMesh.position.y = 0.45;
    tankGroup.add(this.lowerWaterMesh);

    this.scene.add(tankGroup);
  }

  private bindEvents() {
    const el = this.renderer.domElement;

    // Pointer hover & raycasting
    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isDragging) {
        const dx = e.clientX - this.pointerDownPos.x;
        const dy = e.clientY - this.pointerDownPos.y;
        this.spherical.theta -= dx * 0.005;
        this.spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, this.spherical.phi - dy * 0.005));
        this.pointerDownPos = { x: e.clientX, y: e.clientY };
        this.isUserInteracting = true;

        // Update target camera from spherical
        this.targetCamPos.x = this.targetCamLook.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
        this.targetCamPos.y = this.targetCamLook.y + this.spherical.radius * Math.cos(this.spherical.phi);
        this.targetCamPos.z = this.targetCamLook.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
      }
    });

    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    const stopDrag = () => {
      this.isDragging = false;
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    // Zoom on wheel
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(6, Math.min(38, this.spherical.radius + e.deltaY * 0.02));
      this.isUserInteracting = true;
      this.targetCamPos.x = this.targetCamLook.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
      this.targetCamPos.y = this.targetCamLook.y + this.spherical.radius * Math.cos(this.spherical.phi);
      this.targetCamPos.z = this.targetCamLook.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
    }, { passive: false });

    // Click handler for 3D components
    el.addEventListener('click', () => {
      if (this.hoveredObject && this.onComponentClick) {
        this.onComponentClick(this.hoveredObject.name);
      }
    });

    // Window resize
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setCameraPreset(presetKey: string) {
    const preset = CAMERA_PRESETS[presetKey] || CAMERA_PRESETS.full;
    this.targetCamPos.set(...preset.position);
    this.targetCamLook.set(...preset.target);
    this.isUserInteracting = false;

    // Recalculate spherical coords for smooth manual continuation
    _vec3.subVectors(this.targetCamPos, this.targetCamLook);
    this.spherical.radius = _vec3.length();
    this.spherical.phi = Math.acos(Math.max(-1, Math.min(1, _vec3.y / this.spherical.radius)));
    this.spherical.theta = Math.atan2(_vec3.x, _vec3.z);
  }

  public updateState(
    flowPercent: number,
    headHeight: number,
    rpm: number,
    watts: number,
    brightness: number,
    bulbColorHex: string,
    isSlowMotion: boolean,
    isExploreInside: boolean,
    isBlocked: boolean,
    isDisconnected: boolean
  ) {
    this.currentFlowPercent = flowPercent;
    this.currentHeadHeight = headHeight;
    this.currentRpm = rpm;
    this.currentWatts = watts;
    this.currentBulbBrightness = brightness;
    this.isSlowMotion = isSlowMotion;
    this.isExploreInside = isExploreInside;
    this.isBlocked = isBlocked;
    this.isDisconnected = isDisconnected;

    // 1. Reservoir Water Level responds to height
    const targetScaleY = 0.5 + (headHeight / 10) * 0.7;
    this.reservoirWaterMesh.scale.y = targetScaleY;
    this.reservoirWaterMesh.position.y = 7.0 + targetScaleY * 0.6;

    // 2. Explore Inside mode: make generator and turbine casing invisible or wireframe
    if (this.generatorCasingMesh) {
      (this.generatorCasingMesh.material as THREE.Material).opacity = isExploreInside ? 0.08 : 0.35;
    }

    // 3. Bulb Lighting and Emissive visuals
    const normBrightness = brightness / 100;
    this.bulbLight.intensity = normBrightness * 3.5;
    _color.set(bulbColorHex);
    this.bulbLight.color = _color;

    if (brightness > 0) {
      this.bulbFilamentMat.emissive.set(_color);
      this.bulbFilamentMat.emissiveIntensity = 0.5 + normBrightness * 4.5;
      this.bulbHaloMat.color.set(_color);
      this.bulbHaloMat.opacity = normBrightness * 0.65;
    } else {
      this.bulbFilamentMat.emissive.set(0x000000);
      this.bulbFilamentMat.emissiveIntensity = 0;
      this.bulbHaloMat.opacity = 0;
    }

    // 4. Jet visibility
    const isJetActive = flowPercent > 0 && !isBlocked;
    this.waterJetMesh.visible = isJetActive;
    this.waterJetMesh.scale.set(
      Math.max(0.2, flowPercent / 100),
      Math.max(0.2, flowPercent / 100),
      Math.max(0.2, flowPercent / 100)
    );
  }

  private startLoop() {
    let lastTime = performance.now();

    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 75);
        }
      };
      this.frameId = window.setTimeout(poll, 6);
    };

    const tick = () => {
      if (this.isDisposed) return;
      const now = performance.now();
      const rawDelta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const timeScale = this.isSlowMotion ? 0.25 : 1.0;
      const dt = rawDelta * timeScale;
      const elapsedTime = (now - this.startTime) / 1000;

      // Smooth camera interpolation
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCamPos.x, 3.5, rawDelta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCamPos.y, 3.5, rawDelta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCamPos.z, 3.5, rawDelta);

      this.currentCamLook.x = THREE.MathUtils.damp(this.currentCamLook.x, this.targetCamLook.x, 4.0, rawDelta);
      this.currentCamLook.y = THREE.MathUtils.damp(this.currentCamLook.y, this.targetCamLook.y, 4.0, rawDelta);
      this.currentCamLook.z = THREE.MathUtils.damp(this.currentCamLook.z, this.targetCamLook.z, 4.0, rawDelta);
      this.camera.lookAt(this.currentCamLook);

      // 1. Rotate Turbine Runner & Connecting Shaft
      if (this.currentRpm > 0 && !this.isBlocked) {
        // radians per second = RPM * 2pi / 60
        const radSpeed = (this.currentRpm * 2 * Math.PI) / 60;
        this.turbineRunnerGroup.rotation.z -= radSpeed * dt;
        this.shaftMesh.rotation.y += radSpeed * dt;
        this.generatorRotorGroup.rotation.x += radSpeed * dt;
      }

      // 2. Animate Water Particles in Penstock Pipe
      if (this.currentFlowPercent > 0) {
        const flowSpeed = (this.currentFlowPercent / 100) * (0.8 + this.currentHeadHeight * 0.15) * dt;
        const penstockGeo = this.penstockParticles.geometry;
        const positions = penstockGeo.attributes.position.array as Float32Array;
        const path = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-4.5, 6.4, 0),
          new THREE.Vector3(-3.2, 5.5, 0),
          new THREE.Vector3(-1.8, 4.0, 0),
          new THREE.Vector3(-0.6, 3.25, 0),
          new THREE.Vector3(0.0, 3.25, 0),
        ]);

        for (let i = 0; i < this.penstockParticleCount; i++) {
          this.penstockParticleProgress[i] = (this.penstockParticleProgress[i] + flowSpeed) % 1.0;
          const pt = path.getPointAt(this.penstockParticleProgress[i]);
          positions[i * 3] = pt.x + (Math.sin(i * 99 + elapsedTime * 5) * 0.08);
          positions[i * 3 + 1] = pt.y + (Math.cos(i * 77 + elapsedTime * 5) * 0.08);
          positions[i * 3 + 2] = pt.z + (Math.sin(i * 33) * 0.08);
        }
        penstockGeo.attributes.position.needsUpdate = true;
      }

      // 3. Splash Spray Particles at turbine
      if (this.currentFlowPercent > 0 && !this.isBlocked) {
        const splashGeo = this.splashParticles.geometry;
        const pos = splashGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < this.splashCount; i++) {
          pos[i * 3] += this.splashVelocities[i * 3] * dt;
          pos[i * 3 + 1] += this.splashVelocities[i * 3 + 1] * dt - 4.5 * dt * dt; // gravity
          pos[i * 3 + 2] += this.splashVelocities[i * 3 + 2] * dt;

          // Reset when falling below water surface
          if (pos[i * 3 + 1] < 0.6) {
            pos[i * 3] = 1.15;
            pos[i * 3 + 1] = 3.25;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          }
        }
        splashGeo.attributes.position.needsUpdate = true;
        this.splashParticles.visible = true;
      } else {
        this.splashParticles.visible = false;
      }

      // 4. Electric Wire Electron Pulses
      const wireMat = this.wireElectronParticles.material as THREE.PointsMaterial;
      if (this.currentWatts > 0 && !this.isDisconnected) {
        wireMat.opacity = Math.min(1.0, 0.3 + (this.currentWatts / 60) * 0.7);
        const wirePos = (this.wireElectronParticles.geometry.attributes.position.array as Float32Array);
        const shiftSpeed = (0.5 + (this.currentWatts / 50) * 1.5) * dt;

        for (let i = 0; i < this.wireParticleCount; i++) {
          const t = ((i / this.wireParticleCount) + elapsedTime * shiftSpeed) % 1.0;
          const p = this.wireCurve.getPointAt(t);
          wirePos[i * 3] = p.x;
          wirePos[i * 3 + 1] = p.y + Math.sin(t * Math.PI * 6 + elapsedTime * 10) * 0.04;
          wirePos[i * 3 + 2] = p.z;
        }
        this.wireElectronParticles.geometry.attributes.position.needsUpdate = true;

        // Animate magnetic field halo around generator
        if (this.magneticFieldMesh) {
          (this.magneticFieldMesh.material as THREE.MeshBasicMaterial).opacity = Math.min(0.65, (this.currentWatts / 60) * 0.65);
          this.magneticFieldMesh.rotation.z += 2.0 * dt;
        }
      } else {
        wireMat.opacity = 0;
        if (this.magneticFieldMesh) {
          (this.magneticFieldMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }

      // 5. Water Ripples in lower collection tank
      if (this.lowerWaterMesh) {
        this.lowerWaterMesh.position.y = 0.45 + Math.sin(elapsedTime * 3) * 0.02;
      }

      // 6. Raycasting for hover inspection
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactables, false);
      if (intersects.length > 0) {
        const topHit = intersects[0].object;
        if (this.hoveredObject !== topHit) {
          this.hoveredObject = topHit;
          this.renderer.domElement.style.cursor = 'pointer';
          if (this.onComponentHover) {
            this.onComponentHover(topHit.name);
          }
        }
      } else {
        if (this.hoveredObject !== null) {
          this.hoveredObject = null;
          this.renderer.domElement.style.cursor = 'default';
          if (this.onComponentHover) {
            this.onComponentHover(null);
          }
        }
      }

      // 7. Render frame
      this.renderer.render(this.scene, this.camera);

      // Pace software WebGL or requestAnimationFrame
      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  public dispose() {
    this.isDisposed = true;
    if (this.isSoftwareGl) {
      clearTimeout(this.frameId);
    } else {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('resize', this.onResize);
    try {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    } catch {
      // dispose cleanup
    }
  }
}
