/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'hi';

export interface ComponentInfo {
  id: string;
  name: string;
  tagline: string;
  whatIsIt: string;
  whatItDoes: string;
  whyImportant: string;
  realWorldExample: string;
}

export interface ScienceFact {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ComparisonItem {
  id: string;
  title: string;
  scale: string;
  powerOutput: string;
  mechanism: string;
  application: string;
}

export interface Translations {
  appName: string;
  subtitle: string;
  startExploring: string;
  skipIntro: string;
  presentationMode: string;
  exitPresentation: string;
  nextStep: string;
  prevStep: string;
  stepOf: string;
  autoPlay: string;
  pause: string;
  guideVoice: string;
  guideCharacterName: string;
  audioOn: string;
  audioOff: string;
  
  // Controls
  startWater: string;
  stopWater: string;
  waterFlow: string;
  waterHeight: string;
  resetExperiment: string;
  slowMotion: string;
  normalSpeed: string;
  exploreInside: string;
  cameraViews: string;
  camFull: string;
  camDam: string;
  camTurbine: string;
  camGenerator: string;
  camBulb: string;

  // Meters
  flowRate: string;
  headPressure: string;
  turbineSpeed: string;
  electricityGenerated: string;
  bulbBrightness: string;
  totalEnergy: string;
  efficiency: string;
  flowLow: string;
  flowMedium: string;
  flowHigh: string;

  // Learning Stages
  stages: {
    id: number;
    title: string;
    concept: string;
    guideText: string;
  }[];

  // Flowchart energy sequence
  energyFlow: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
  };

  // Challenges
  challengesTitle: string;
  challengesSubtitle: string;
  challenge1Title: string;
  challenge1Desc: string;
  challenge1Goal: string;
  challenge2Title: string;
  challenge2Desc: string;
  challenge2Goal: string;
  challenge3Title: string;
  challenge3Desc: string;
  challenge3Goal: string;
  challenge4Title: string;
  challenge4Desc: string;
  challenge4Goal: string;
  completed: string;
  inProgress: string;
  congratulations: string;
  pointsEarned: string;

  // Troubleshooting faults
  troubleshoot: {
    normal: string;
    valveStuck: string;
    valveStuckFix: string;
    debrisBlocked: string;
    debrisBlockedFix: string;
    wireLoose: string;
    wireLooseFix: string;
    lowHead: string;
    lowHeadFix: string;
    problemSolved: string;
  };

  // Click-to-learn Components
  components: Record<string, ComponentInfo>;

  // Science Facts & Comparisons
  didYouKnowTitle: string;
  didYouKnowSubtitle: string;
  facts: ScienceFact[];
  comparisonsTitle: string;
  comparisons: ComparisonItem[];
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "HYDRO HERO – LET'S MAKE ELECTRICITY!",
    subtitle: "Can you turn flowing water into electricity? Explore the science of clean hydro power!",
    startExploring: "START EXPLORING",
    skipIntro: "Skip Introduction",
    presentationMode: "Exhibition Mode",
    exitPresentation: "Exit Exhibition",
    nextStep: "Next Stage",
    prevStep: "Previous Stage",
    stepOf: "Stage {curr} of {total}",
    autoPlay: "Auto-Play Tour",
    pause: "Pause Tour",
    guideVoice: "Voice Narration",
    guideCharacterName: "Dr. Splash (Hydro Scientist)",
    audioOn: "Sound FX On",
    audioOff: "Sound FX Off",

    startWater: "START WATER",
    stopWater: "STOP WATER",
    waterFlow: "WATER FLOW",
    waterHeight: "RESERVOIR HEIGHT (HEAD)",
    resetExperiment: "RESET EXPERIMENT",
    slowMotion: "SLOW MOTION",
    normalSpeed: "NORMAL SPEED",
    exploreInside: "SEE INSIDE MECHANISM",
    cameraViews: "Camera Focus",
    camFull: "Overview",
    camDam: "Dam & Lake",
    camTurbine: "Water Turbine",
    camGenerator: "Generator Magnet",
    camBulb: "Light Bulb",

    flowRate: "Water Flow",
    headPressure: "Water Head (Height)",
    turbineSpeed: "Turbine Speed",
    electricityGenerated: "Electric Power",
    bulbBrightness: "Bulb Brightness",
    totalEnergy: "Accumulated Energy",
    efficiency: "Plant Efficiency",
    flowLow: "Gentle",
    flowMedium: "Steady",
    flowHigh: "Maximum",

    stages: [
      {
        id: 1,
        title: "STAGE 1 – Water has energy!",
        concept: "Gravitational Potential Energy",
        guideText: "Hey, Scientist! Water stored high above the ground in a reservoir possesses gravitational potential energy. When we let it flow down, that stored energy is ready for action!"
      },
      {
        id: 2,
        title: "STAGE 2 – Meet the turbine!",
        concept: "Kinetic Energy to Mechanical Rotation",
        guideText: "Look at the penstock nozzle! Rushing water shoots out with immense speed and force, pushing directly against curved turbine blades to make the wheel spin rapidly!"
      },
      {
        id: 3,
        title: "STAGE 3 – The generator works!",
        concept: "Electromagnetic Induction",
        guideText: "The spinning turbine turns a heavy steel shaft connected into the generator. Inside, strong magnets spin around copper wire coils, pushing electrons to create electrical current!"
      },
      {
        id: 4,
        title: "STAGE 4 – Light up the bulb!",
        concept: "Electrical Energy into Light & Heat",
        guideText: "Wow! Look through the wires! Electric current rushes through the circuit straight into the bulb's filament, glowing brilliantly bright! We just made clean hydroelectricity!"
      },
      {
        id: 5,
        title: "STAGE 5 – Understand the complete process!",
        concept: "The Full Conservation of Energy Chain",
        guideText: "Let's review the magical chain: Water stored at height turns into moving kinetic energy, spinning the mechanical turbine, turning the electromagnetic generator, creating electric current that lights our world!"
      }
    ],

    energyFlow: {
      step1: "WATER STORED AT HEIGHT",
      step2: "MOVING WATER JET",
      step3: "ROTATING TURBINE",
      step4: "ELECTRIC GENERATOR",
      step5: "FLOWING ELECTRICITY",
      step6: "GLOWING LIGHT BULB"
    },

    challengesTitle: "BECOME A HYDRO HERO!",
    challengesSubtitle: "Complete interactive science missions and earn your Hydro Engineer badges!",
    challenge1Title: "Light the Bulb",
    challenge1Desc: "Turn on the water and adjust flow to generate at least 25 Watts of electricity to light the laboratory bulb.",
    challenge1Goal: "Target: >= 25 Watts",
    challenge2Title: "Fastest Turbine",
    challenge2Desc: "Raise the reservoir height and crank water flow to push the turbine runner above 1,000 RPM!",
    challenge2Goal: "Target: >= 1,000 RPM",
    challenge3Title: "Save Water Challenge",
    challenge3Desc: "Generate useful electricity (>= 35 Watts) while keeping water flow at or below 40% (Hint: boost reservoir height!).",
    challenge3Goal: "Target: >= 35W with Flow <= 40%",
    challenge4Title: "Fix the Power Plant",
    challenge4Desc: "Oh no, electricity stopped! Click on the faulty component in the 3D scene or panel to diagnose and repair it.",
    challenge4Goal: "Target: Repair faulty component",
    completed: "COMPLETED",
    inProgress: "MISSION IN PROGRESS",
    congratulations: "Outstanding Science Work!",
    pointsEarned: "Hydro Points Earned",

    troubleshoot: {
      normal: "All systems running normally.",
      valveStuck: "PROBLEM DETECTED: Sluice valve is shut! Water cannot reach the penstock.",
      valveStuckFix: "Click START WATER to open the valve gate.",
      debrisBlocked: "PROBLEM DETECTED: Fallen branch stuck in the turbine runner blades!",
      debrisBlockedFix: "Click the TURBINE in the 3D scene to clear the obstacle.",
      wireLoose: "PROBLEM DETECTED: Generator terminal wire popped loose!",
      wireLooseFix: "Click the GENERATOR / WIRES to reconnect the copper circuit.",
      lowHead: "PROBLEM DETECTED: Reservoir water height is too low to produce pressure.",
      lowHeadFix: "Slide RESERVOIR HEIGHT slider up to at least 4 meters.",
      problemSolved: "All components repaired! Electricity restored!"
    },

    components: {
      dam: {
        id: "dam",
        name: "Water Reservoir & Dam",
        tagline: "Stores water at height to create water pressure",
        whatIsIt: "A reinforced elevated basin that holds back a large body of water at a high elevation.",
        whatItDoes: "It stores massive amounts of water, creating gravitational potential energy proportional to its height (called hydraulic head).",
        whyImportant: "Without height difference, water wouldn't have sufficient pressure or gravitational force to shoot out and spin the turbine blades.",
        realWorldExample: "The Hoover Dam in the USA (221m high) or the Tehri Dam in Uttarakhand, India (260m high)."
      },
      penstock: {
        id: "penstock",
        name: "Penstock & High-Velocity Nozzle",
        tagline: "Channels pressurized water into a powerful jet stream",
        whatIsIt: "A heavy-duty reinforced pipe tapering down into a narrow directional nozzle aimed at the runner blades.",
        whatItDoes: "It converts water's potential energy into intense kinetic velocity according to Torricelli's Law (v = √(2gh)).",
        whyImportant: "The narrow nozzle creates a concentrated, high-speed jet that transfers momentum directly onto the turbine cups.",
        realWorldExample: "High-pressure steel penstocks used in mountain hydro plants, withstanding pressures over 50 atmospheres."
      },
      turbine: {
        id: "turbine",
        name: "Pelton Water Turbine Runner",
        tagline: "Converts water jet kinetic energy into spinning mechanical motion",
        whatIsIt: "A precision wheel surrounded by specially curved split buckets (blades) designed to capture rushing water.",
        whatItDoes: "When the water jet hits the spoon-shaped cups, the water is deflected 180 degrees, transferring almost all its momentum into rotational spin.",
        whyImportant: "Without the turbine, there is no way to harness moving water into mechanical shaft rotation.",
        realWorldExample: "Pelton wheel turbines invented by Lester Pelton in 1878, still widely used in mountain hydroelectric stations."
      },
      shaft: {
        id: "shaft",
        name: "Drive Shaft & Bearings",
        tagline: "Transmits rotary mechanical torque to the generator",
        whatIsIt: "A solid forged steel axle supported by low-friction ball bearings.",
        whatItDoes: "Transfers the spinning rotational power from the turbine runner directly to the generator rotor at identical speed.",
        whyImportant: "Keeps the electrical generator high and dry away from wet splashing water while transferring torque.",
        realWorldExample: "Giant forged steel shafts in commercial power houses weighing more than 50 tons each."
      },
      generator: {
        id: "generator",
        name: "Electromagnetic Generator",
        tagline: "Transforms rotational movement into clean electric current",
        whatIsIt: "An electrical machine with rotating permanent or electromagnets (rotor) surrounded by stationary copper coils (stator).",
        whatItDoes: "As magnets spin past copper wire loops, changing magnetic flux induces an electric current via Faraday's Law of Induction.",
        whyImportant: "This is the heart of electricity generation—converting physical mechanical motion into electrical charge.",
        realWorldExample: "Bicycle dynamos that light your bike light as you pedal, and giant multi-megawatt hydro generators."
      },
      wires: {
        id: "wires",
        name: "Transmission Wires & Circuit",
        tagline: "Carries electric charge to the consumer",
        whatIsIt: "Conductive copper wires wrapped in insulation connecting the generator terminals to the light load.",
        whatItDoes: "Provides a closed continuous path for free electrons to flow from positive to negative potentials.",
        whyImportant: "Electricity requires a complete circuit to deliver power; if a wire breaks, current stops instantly.",
        realWorldExample: "High-voltage overhead power lines carrying clean hydroelectricity hundreds of miles across countries."
      },
      bulb: {
        id: "bulb",
        name: "Incandescent / LED Light Bulb",
        tagline: "Demonstrates useful electrical power as visible illumination",
        whatIsIt: "A glass vacuum enclosure with a tungsten filament and base terminal.",
        whatItDoes: "When electrical current forces through the thin resistive filament, it heats up until it glows with bright warm light.",
        whyImportant: "Visibly demonstrates that energy cannot be destroyed—it simply transforms from water at height into light!",
        realWorldExample: "Homes, schools, and city streetlights illuminated daily by hydroelectric power plants."
      },
      tank: {
        id: "tank",
        name: "Tailrace & Water Collection Basin",
        tagline: "Safely returns water back to the river or recirculation cycle",
        whatIsIt: "A lower reservoir or calm canal where spent water drains after exiting the turbine runner.",
        whatItDoes: "Calms the turbulent discharge water and channels it downstream back to rivers or back to pumped reservoirs.",
        whyImportant: "Hydroelectricity does NOT consume or dirty water! 100% of the water flows back safely for agriculture and nature.",
        realWorldExample: "River tailraces and modern pumped-storage reservoirs that pump water back up at night."
      }
    },

    didYouKnowTitle: "DID YOU KNOW? HYDRO SCIENCE FACTS",
    didYouKnowSubtitle: "Fascinating science behind one of Earth's greatest renewable energy wonders!",
    facts: [
      {
        id: "f1",
        title: "Clean & Zero Fuel",
        description: "Hydroelectric power plants create electricity without burning any coal, gas, or oil. They emit zero smoke or direct greenhouse gases during operation!",
        icon: "Leaf"
      },
      {
        id: "f2",
        title: "Water is Never Consumed",
        description: "The water passing through a turbine is not destroyed or chemically changed. 100% of it continues down the river for drinking, farming, and ecosystems.",
        icon: "Droplets"
      },
      {
        id: "f3",
        title: "Instant Giant Battery",
        description: "Hydro plants can start up in less than 90 seconds! When a city suddenly needs power, operators open the gates and electricity flows almost immediately.",
        icon: "Zap"
      },
      {
        id: "f4",
        title: "Nature's Water Cycle",
        description: "The sun evaporates ocean water, forming rain clouds that refill mountain lakes. That means hydropower is powered by the sun and gravity combined!",
        icon: "Sun"
      }
    ],

    comparisonsTitle: "COMPARING HYDRO POWER AT THREE SCALES",
    comparisons: [
      {
        id: "c1",
        title: "Hand Dynamo / Bicycle Bottle Dynamo",
        scale: "Pocket / Bicycle Scale",
        powerOutput: "Approx. 3 – 6 Watts",
        mechanism: "Your hand or bicycle tire turns a tiny magnet inside a plastic case.",
        application: "Lights a small headlight or charges an emergency flashlight."
      },
      {
        id: "c2",
        title: "Miniature Science Lab Model (Our Simulation!)",
        scale: "Classroom / Laboratory Scale",
        powerOutput: "Approx. 10 – 80 Watts",
        mechanism: "Small elevated tank, 12 L/s nozzle, 24cm Pelton turbine, small DC generator.",
        application: "Illuminates bright demonstration light bulbs and powers lab meters."
      },
      {
        id: "c3",
        title: "Mega Hydroelectric Power Station (Tehri / Hoover / Three Gorges)",
        scale: "Continental Power Grid Scale",
        powerOutput: "2,000,000 to 22,500,000,000 Watts (22.5 GW!)",
        mechanism: "Giant 200m concrete dams, steel penstocks 8m wide, 400-ton Francis turbines.",
        application: "Supplies clean electricity to millions of homes, hospitals, trains, and entire cities."
      }
    ]
  },

  hi: {
    appName: "हाइड्रो हीरो – चलो बिजली बनाएं!",
    subtitle: "क्या आप बहते पानी से बिजली बना सकते हैं? स्वच्छ जलविद्युत के विज्ञान को समझें!",
    startExploring: "शुरू करें",
    skipIntro: "परिचय छोड़ें",
    presentationMode: "प्रदर्शनी मोड",
    exitPresentation: "प्रदर्शनी से बाहर निकलें",
    nextStep: "अगला चरण",
    prevStep: "पिछला चरण",
    stepOf: "चरण {curr} / {total}",
    autoPlay: "ऑटो-प्ले टूर",
    pause: "रोकें",
    guideVoice: "आवाज वाचन",
    guideCharacterName: "डॉ. स्प्लैश (वैज्ञानिक)",
    audioOn: "ध्वनि चालू",
    audioOff: "ध्वनि बंद",

    startWater: "पानी शुरू करें",
    stopWater: "पानी बंद करें",
    waterFlow: "पानी का बहाव",
    waterHeight: "जलाशय की ऊंचाई (हेड)",
    resetExperiment: "प्रयोग रीसेट करें",
    slowMotion: "धीमी गति (स्लो मोशन)",
    normalSpeed: "सामान्य गति",
    exploreInside: "आंतरिक मशीन देखें",
    cameraViews: "कैमरा दृश्य",
    camFull: "संपूर्ण दृश्य",
    camDam: "बांध और झील",
    camTurbine: "जल टरबाइन",
    camGenerator: "जनरेटर चुंबक",
    camBulb: "प्रकाश बल्ब",

    flowRate: "पानी का बहाव",
    headPressure: "पानी की ऊंचाई",
    turbineSpeed: "टरबाइन की गति",
    electricityGenerated: "उत्पादित विद्युत",
    bulbBrightness: "बल्ब की चमक",
    totalEnergy: "कुल ऊर्जा",
    efficiency: "दक्षता",
    flowLow: "धीमा",
    flowMedium: "मध्यम",
    flowHigh: "अधिकतम",

    stages: [
      {
        id: 1,
        title: "चरण 1 – पानी में ऊर्जा होती है!",
        concept: "गुरुत्वाकर्षण स्थितिज ऊर्जा",
        guideText: "नमस्ते नन्हें वैज्ञानिक! ऊंचाई पर स्थित जलाशय में जमा पानी में स्थितिज ऊर्जा होती है। जब पानी नीचे बहता है, तो यह ऊर्जा काम करने के लिए तैयार हो जाती है!"
      },
      {
        id: 2,
        title: "चरण 2 – टरबाइन से मिलें!",
        concept: "गतिज ऊर्जा से घूर्णन गति",
        guideText: "पाइप के नोजल को देखें! तेज रफ्तार से निकलता पानी सीधे टरबाइन के पंखों से टकराता है और उन्हें तेजी से घुमाता है!"
      },
      {
        id: 3,
        title: "चरण 3 – जनरेटर काम करता है!",
        concept: "विद्युत चुम्बकीय प्रेरण",
        guideText: "घूमती हुई टरबाइन जनरेटर से जुड़े शाफ्ट को घुमाती है। जनरेटर के अंदर तांबे के तारों के बीच चुंबक घूमता है, जिससे बिजली बनती है!"
      },
      {
        id: 4,
        title: "चरण 4 – बल्ब जलाएं!",
        concept: "विद्युत ऊर्जा से प्रकाश",
        guideText: "अरे वाह! तारों में बिजली दौड़ रही है और हमारा बल्ब जगमगा उठा है! हमने बहते पानी से स्वच्छ बिजली बना ली!"
      },
      {
        id: 5,
        title: "चरण 5 – पूरी प्रक्रिया को समझें!",
        concept: "ऊर्जा संरक्षण की पूरी श्रृंखला",
        guideText: "ऊंचाई पर जमा पानी -> बहता हुआ पानी -> घूमती टरबाइन -> जनरेटर -> बिजली -> जलता हुआ बल्ब!"
      }
    ],

    energyFlow: {
      step1: "ऊंचाई पर संचित पानी",
      step2: "तेज बहता पानी",
      step3: "घूमती हुई टरबाइन",
      step4: "विद्युत जनरेटर",
      step5: "तारों में बहती बिजली",
      step6: "रोशन होता बल्ब"
    },

    challengesTitle: "हाइड्रो हीरो बनें!",
    challengesSubtitle: "रोमांचक विज्ञान मिशन पूरे करें और पदक जीतें!",
    challenge1Title: "बल्ब जलाएं",
    challenge1Desc: "पानी खोलें और कम से कम 25 वॉट बिजली बनाकर बल्ब को रोशन करें।",
    challenge1Goal: "लक्ष्य: >= 25 वॉट",
    challenge2Title: "सबसे तेज टरबाइन",
    challenge2Desc: "ऊंचाई और बहाव बढ़ाकर टरबाइन को 1,000 RPM से ज्यादा रफ्तार पर घुमाएं!",
    challenge2Goal: "लक्ष्य: >= 1,000 RPM",
    challenge3Title: "पानी बचाओ चुनौती",
    challenge3Desc: "कम पानी (बहाव <= 40%) का उपयोग करके 35 वॉट बिजली बनाएं (ऊंचाई बढ़ाएं!)।",
    challenge3Goal: "लक्ष्य: >= 35W, बहाव <= 40%",
    challenge4Title: "पावर प्लांट ठीक करें",
    challenge4Desc: "बिजली बंद हो गई है! 3D मॉडल में खराब हिस्से पर क्लिक करके समस्या हल करें।",
    challenge4Goal: "लक्ष्य: खराबी की पहचान कर मरम्मत करें",
    completed: "पूर्ण हुआ",
    inProgress: "मिशन जारी है",
    congratulations: "शानदार काम!",
    pointsEarned: "हाइड्रो पॉइंट्स मिले",

    troubleshoot: {
      normal: "सभी प्रणालियां ठीक से काम कर रही हैं।",
      valveStuck: "समस्या: वाल्व बंद है! पानी टरबाइन तक नहीं पहुंच पा रहा।",
      valveStuckFix: "पानी का वाल्व खोलने के लिए 'पानी शुरू करें' पर क्लिक करें।",
      debrisBlocked: "समस्या: टरबाइन के ब्लेड में कचरा फंस गया है!",
      debrisBlockedFix: "3D दृश्य में टरबाइन पर क्लिक करके रुकावट हटाएं।",
      wireLoose: "समस्या: जनरेटर का तार ढीला हो गया है!",
      wireLooseFix: "सर्किट जोड़ने के लिए जनरेटर / तार पर क्लिक करें।",
      lowHead: "समस्या: जलाशय का जल स्तर बहुत कम है।",
      lowHeadFix: "जलाशय की ऊंचाई को कम से कम 4 मीटर तक बढ़ाएं।",
      problemSolved: "समस्या ठीक हो गई! बिजली फिर से चालू है!"
    },

    components: {
      dam: {
        id: "dam",
        name: "जलाशय और बांध",
        tagline: "ऊंचाई पर पानी रोककर दबाव बनाता है",
        whatIsIt: "एक मजबूत बांध जो ऊंचाई पर भारी मात्रा में पानी एकत्र करता है।",
        whatItDoes: "यह पानी में गुरुत्वाकर्षण स्थितिज ऊर्जा संचित करता है।",
        whyImportant: "ऊंचाई के बिना पानी में टरबाइन घुमाने जितना दबाव नहीं होगा।",
        realWorldExample: "उत्तराखंड का टिहरी बांध (260 मीटर ऊंचा) या अमेरिका का हूवर बांध।"
      },
      penstock: {
        id: "penstock",
        name: "पेनस्टॉक और नोजल",
        tagline: "दबावयुक्त पानी को तेज धार में बदलता है",
        whatIsIt: "एक मजबूत पाइप जो आगे चलकर एक संकीर्ण नोजल में बदलता है।",
        whatItDoes: "यह पानी की स्थितिज ऊर्जा को अत्यधिक गतिज ऊर्जा में बदलता है।",
        whyImportant: "पतला नोजल पानी की बहुत तेज धार बनाता है जो टरबाइन को घुमाती है।",
        realWorldExample: "पर्वतीय जलविद्युत संयंत्रों में प्रयुक्त स्टील के विशाल पाइप।"
      },
      turbine: {
        id: "turbine",
        name: "पेल्टन वाटर टरबाइन",
        tagline: "पानी की गति को घूर्णन गति में बदलता है",
        whatIsIt: "घुमावदार कप जैसी पत्तियों वाला पहिया जो पानी से घूमता है।",
        whatItDoes: "पानी की धार इससे टकराकर पहिये को तीव्र गति से घुमाती है।",
        whyImportant: "इसके बिना पानी की शक्ति को यांत्रिक गति में नहीं बदला जा सकता।",
        realWorldExample: "लेस्टर पेल्टन द्वारा आविष्कृत पेल्टन व्हील टरबाइन।"
      },
      shaft: {
        id: "shaft",
        name: "ड्राइव शाफ्ट और बेयरिंग",
        tagline: "टरबाइन की गति को जनरेटर तक पहुंचाता है",
        whatIsIt: "मजबूत स्टील की धुरी जो बेयरिंग पर घूमती है।",
        whatItDoes: "टरबाइन के घूमने की शक्ति को जनरेटर तक स्थानांतरित करता है।",
        whyImportant: "जनरेटर को पानी से दूर और सूखा रखता है।",
        realWorldExample: "विशाल बिजली घरों में लगे 50 टन से अधिक वजन वाले शाफ्ट।"
      },
      generator: {
        id: "generator",
        name: "विद्युत जनरेटर",
        tagline: "घूमने की गति को बिजली में बदलता है",
        whatIsIt: "एक उपकरण जिसमें तांबे की कुंडलियों के बीच चुंबक घूमता है।",
        whatItDoes: "फैराडे के नियम के अनुसार गति को विद्युत धारा में बदलता है।",
        whyImportant: "यह बिजली बनाने का मुख्य केंद्र है।",
        realWorldExample: "साइकिल में लगने वाला डायनेमो और बड़े बिजली घरों के जनरेटर।"
      },
      wires: {
        id: "wires",
        name: "विद्युत तार और परिपथ",
        tagline: "बिजली को बल्ब तक ले जाता है",
        whatIsIt: "तांबे के चालक तार जिन पर सुरक्षात्मक आवरण होता है।",
        whatItDoes: "बिजली के इलेक्ट्रॉनों के बहने के लिए एक बंद मार्ग बनाता है।",
        whyImportant: "तार टूट जाने पर बिजली का प्रवाह रुक जाता है।",
        realWorldExample: "खंभों पर लगे तार जो शहरों तक बिजली पहुंचाते हैं।"
      },
      bulb: {
        id: "bulb",
        name: "प्रकाश बल्ब",
        tagline: "बिजली को रोशनी में बदलता है",
        whatIsIt: "कांच का बल्ब जिसमें टंगस्टन का पतला तार होता है।",
        whatItDoes: "बिजली बहने पर तार गर्म होकर चमकने लगता है।",
        whyImportant: "यह साबित करता है कि बहते पानी की ऊर्जा रोशनी बन चुकी है!",
        realWorldExample: "हमारे घरों और स्कूलों में जलने वाले बल्ब।"
      },
      tank: {
        id: "tank",
        name: "निचला जल संग्रह टैंक",
        tagline: "पानी को दोबारा नदी में लौटाता है",
        whatIsIt: "निचला तालाब जहां टरबाइन से निकला पानी जमा होता है।",
        whatItDoes: "पानी को शांत करके पुनः नदी या खेतों की ओर भेजता है।",
        whyImportant: "जलविद्युत पानी को गंदा या नष्ट नहीं करती! 100% पानी सुरक्षित लौटता है।",
        realWorldExample: "बांधों के निचले हिस्से से निकलने वाली नदियां।"
      }
    },

    didYouKnowTitle: "क्या आप जानते हैं? जलविद्युत के रोचक तथ्य",
    didYouKnowSubtitle: "प्रकृति की सबसे स्वच्छ ऊर्जा के रहस्य!",
    facts: [
      {
        id: "f1",
        title: "स्वच्छ और ईंधन मुक्त",
        description: "जलविद्युत बनाने में कोई कोयला या तेल नहीं जलाया जाता। इसमें कोई धुआं नहीं निकलता!",
        icon: "Leaf"
      },
      {
        id: "f2",
        title: "पानी कभी नष्ट नहीं होता",
        description: "टरबाइन से निकलने के बाद 100% पानी सुरक्षित रहता है और खेती व पीने के काम आता है।",
        icon: "Droplets"
      },
      {
        id: "f3",
        title: "तुरंत शुरू होने वाली ऊर्जा",
        description: "जलविद्युत संयंत्र 90 सेकंड में शुरू हो सकते हैं, जब भी शहर को तुरंत बिजली की जरूरत हो!",
        icon: "Zap"
      },
      {
        id: "f4",
        title: "प्रकृति का जल चक्र",
        description: "सूरज पानी को भाप बनाता है, बारिश से झील भरती है, और गुरुत्वाकर्षण से बिजली बनती है!",
        icon: "Sun"
      }
    ],

    comparisonsTitle: "तीन स्तरों पर जलविद्युत की तुलना",
    comparisons: [
      {
        id: "c1",
        title: "हाथ का डायनेमो / साइकिल डायनेमो",
        scale: "छोटा पैमाना",
        powerOutput: "लगभग 3 – 6 वॉट",
        mechanism: "हाथ या साइकिल का पहिया छोटे चुंबक को घुमाता है।",
        application: "साइकिल की छोटी लाइट जलाने के लिए।"
      },
      {
        id: "c2",
        title: "विज्ञान प्रयोगशाला मॉडल (हमारा सिमुलेशन!)",
        scale: "कक्षा / प्रयोगशाला पैमाना",
        powerOutput: "लगभग 10 – 80 वॉट",
        mechanism: "छोटा टैंक, पेल्टन टरबाइन और छोटा डीसी जनरेटर।",
        application: "प्रयोगशाला के बल्ब और मीटर को रोशन करने के लिए।"
      },
      {
        id: "c3",
        title: "विशाल जलविद्युत स्टेशन (टिहरी बांध / थ्री गॉर्जेस)",
        scale: "राष्ट्रीय ग्रिड पैमाना",
        powerOutput: "2,000,000 से 22,500,000,000 वॉट तक!",
        mechanism: "200 मीटर ऊंचे बांध और 400 टन भारी टरबाइन।",
        application: "लाखों घरों, अस्पतालों, रेलगाड़ियों और पूरे शहरों को बिजली देता है।"
      }
    ]
  }
};
