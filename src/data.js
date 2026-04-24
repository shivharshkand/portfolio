/* global window */
// Canonical project data — extracted from Shivharsh's portfolio PDF.

export const SYSTEMS = [
  {
    id: 'crutch-haptics',
    code: 'SYS::01',
    name: 'Haptic Load-Symmetry Crutch',
    short: 'Bilateral Force-Feedback System',
    course: 'MAE 219 · Haptics & Human-Centered Design',
    year: '2025',
    domain: 'Haptics · Embedded',
    tags: ['ESP32', 'Embedded C', 'FSR Sensors', 'Servo Actuators', '3D Print · TPU', 'Closed-Loop'],
    oneline: 'Body-grounded haptic cueing for crutch gait balance.',
    problem:
      'Crutch users cannot reliably estimate bilateral load, leading to asymmetry, axillobrachial injury and prolonged recovery. Existing visual/auditory feedback systems add cognitive load to an already demanding task.',
    approach:
      'Designed a full hardware+firmware stack — TPU crutch tips housing FSRs, ESP32 analog front-end, servo-driven tappers on custom forearm handles. Firmware implements per-crutch nonlinear calibration, exponential filtering and adaptive tap frequency over three imbalance regions.',
    insight:
      'Haptic cueing partitioned into severity regions lets the user correct gait without any visual or auditory burden — the hardware disappears and only the gait remains.',
    results: [
      'Detected asymmetries up to 8.18 kg in pilot study',
      '39 tap events generated across trial',
      '48.8 % of trial time maintained balanced loading',
      'Mean tap frequency 4.29 Hz during active feedback',
    ],
    metrics: [
      { k: 'Max asymmetry', v: '8.18', u: 'kg' },
      { k: 'Tap frequency', v: '4.29', u: 'Hz' },
      { k: 'Balanced time', v: '48.8', u: '%' },
      { k: 'Tap events', v: '39', u: '' },
    ],
    diagram: 'crutch',
    plot: 'tapTrain',
    images: {
      main: '/images/crutch-main.jpg',
      detail: '/images/crutch-detailed.png',
    },
    overview:
      'A closed-loop haptic feedback system embedded directly into a pair of crutches. Force sensors in the tips measure bilateral ground reaction force; on-body servo tappers deliver proportional tactile cues to the forearm whenever load asymmetry crosses severity thresholds. The user hears and sees nothing — the gait correction happens through touch.',
    role:
      'Sole designer and builder. Responsible for mechanical CAD of handles and crutch tips, PCB-free wiring harness, embedded C firmware (calibration · filtering · thresholds · tap scheduler · trend detector), and the pilot study protocol.',
    architecture: [
      { label: 'FSR × 2', sub: 'GFH-10, press-fit TPU tip' },
      { label: 'ESP32', sub: 'Analog front-end · Control' },
      { label: 'Calibration', sub: '30-pt nonlinear, exp filter' },
      { label: 'Severity regions', sub: '<3 · 4 · ≥5 kg' },
      { label: 'Tap scheduler', sub: 'Adaptive frequency + trend' },
      { label: 'Servo × 2', sub: 'Forearm tappers' },
    ],
    process: ['Concept sketch & sensor survey', 'TPU tip geometry iteration', 'FSR voltage-divider bench test', 'Handle CAD · servo mount', 'Firmware state machine draft'],
    prototype: ['TPU crutch tip', 'Handle assembly', 'ESP32 wiring', 'Servo tapper'],
    future:
      'Multi-subject IRB study with motion-capture ground truth; replace discrete tappers with graded vibrotactile; adaptive thresholds learned per patient.',
  },
  {
    id: 'hybrid-thermal',
    code: 'SYS::02',
    name: 'UAS Hybrid Powertrain Thermal Testbench',
    short: 'Instrumentation + CFD Validation',
    course: 'MAE 156B · Capstone',
    year: '2025',
    domain: 'Thermal · DAQ',
    tags: ['Thermocouples', 'ESP32 DAQ', 'VESC', 'ANSYS Fluent', 'CNC Machining', 'Arduino'],
    oneline: 'Stator thermal characterization, 0–3000 RPM. ASME 2nd Place.',
    problem:
      'Hybrid drone PCB stators heat up unpredictably under load. No standard testbench existed to characterize thermal behavior across the full RPM range, and a supplier delay threatened the capstone timeline.',
    approach:
      'Built a physical motor testbench with thermocouples bonded directly to the PCB stator, ESP32 logging, Arduino+VESC rotor drive across 0–3000 RPM. ANSYS Fluent CFD predicted rotor-induced airflow; hardware validated the simulation.',
    insight:
      'Rotor geometry was the dominant lever on peak stator temperature — optimizing airflow reduced peak temp by 45 % without changing stator design.',
    results: [
      '45 % reduction in peak stator temperature',
      'Validated across full 0–3000 RPM range',
      'ASME San Diego — 2nd Place, Winter 2025',
      'CNC in-house save prevented a 3-week delay',
    ],
    metrics: [
      { k: 'Peak temp', v: '−45', u: '%' },
      { k: 'Max RPM', v: '3000', u: '' },
      { k: 'Award', v: '2nd', u: 'ASME' },
      { k: 'TC channels', v: '6', u: '' },
    ],
    diagram: 'testbench',
    plot: 'thermal',
    images: {
      main: '/images/thermal-main.png',
      detail: '/images/thermal-detailed.png',
    },
    overview:
      'A fully instrumented motor testbench characterizing thermal behavior of a hybrid-drone PCB stator. The rig couples direct-bonded thermocouples and an ESP32 DAQ to an Arduino+VESC motor drive, producing a clean dataset validated against ANSYS Fluent CFD of the rotor-stator airflow.',
    role:
      'Hardware lead. Designed fixturing, bonded and routed thermocouples, wrote the ESP32 logger, configured VESC drive profiles, and — when the PCB supplier delayed rotors — sourced a shop and CNC-machined aluminum replacements to keep the schedule.',
    architecture: [
      { label: 'Rotor drive', sub: 'Arduino + VESC' },
      { label: 'PCB Stator', sub: 'Device under test' },
      { label: 'TC × 6', sub: 'Bonded to stator' },
      { label: 'ESP32 DAQ', sub: 'Stream + log' },
      { label: 'ANSYS Fluent', sub: 'Airflow sim' },
      { label: 'Correlation', sub: 'Sim vs measurement' },
    ],
    process: ['Thermal budget back-of-envelope', 'Testbench CAD', 'Thermocouple bonding plan', 'RPM step-plateau protocol', 'CFD mesh study'],
    prototype: ['Assembled testbench', 'Stator with TCs', 'CNC rotor', 'DAQ logger'],
    future:
      'Closed-loop thermal derating from live telemetry; parametric rotor sweep in CFD; field-representative load profiles beyond step-plateau.',
  },
  {
    id: 'youbot-mobmani',
    code: 'SYS::03',
    name: 'Mobile Manipulation — KUKA youBot',
    short: 'Trajectory Gen + Feedforward-PI',
    course: 'MAE 204 · Robotic Planning & Estimation',
    year: '2024',
    domain: 'Robotics · Control',
    tags: ['Python', 'FK/IK', 'SE(3) Trajectory', 'Feedforward + PI', 'Jacobian Control', 'CoppeliaSim'],
    oneline: '9-DOF holonomic pick-and-place from scratch.',
    problem:
      'A Mecanum-wheeled base coupled to a 5-DOF arm is a 9-DOF system where chassis and arm must be co-controlled. Off-the-shelf stacks hide the math needed to evaluate a custom controller — and the system must converge from large initial offsets before the pick even begins.',
    approach:
      'Built a modular Python pipeline: 8-segment SE(3) trajectory generator, feedforward-plus-PI feedback, body-frame Jacobian pseudoinversion with singularity thresholding, Euler integration, and anti-windup. Evaluated three controller configurations in CoppeliaSim.',
    insight:
      'Anti-windup combined with Jacobian thresholding was the difference between convergence and integrator runaway in the high-gain case — stability lives at the numerical boundary.',
    results: [
      'Error convergence within 200 time steps',
      'Handled 0.2 m / 30° initial offsets',
      'Three controller configs all completed pick-and-place',
      'Peak manipulability ≈ 1.7 during reorientation',
    ],
    metrics: [
      { k: 'Convergence', v: '<200', u: 'steps' },
      { k: 'Init offset', v: '0.2 m', u: '30°' },
      { k: 'Configs', v: '3', u: '' },
      { k: 'Manipulability', v: '~1.7', u: '' },
    ],
    diagram: 'youbot',
    plot: 'ffpi',
    images: {
      main: '/images/youbot-main.png',
      detail: '/images/youbot-detailed.png',
    },
    overview:
      'A from-scratch mobile-manipulation stack for the KUKA youBot — trajectory generation, feedforward-plus-PI feedback, body-frame Jacobian inversion and Euler integration — evaluated across well-tuned, aggressive and novel-task configurations in CoppeliaSim.',
    role:
      'Implemented the entire pipeline in Python. Derived the body-frame Jacobian, wrote the singularity-aware pseudoinverse, tuned Kp/Ki across configurations, and ran the CoppeliaSim scene 6 evaluations.',
    architecture: [
      { label: 'Traj Gen', sub: '8-segment SE(3)' },
      { label: 'FF+PI', sub: 'Xerr + feedforward twist' },
      { label: 'Jacobian', sub: 'Pseudoinverse · threshold' },
      { label: 'Euler Int.', sub: 'Chassis + joint update' },
      { label: 'Anti-windup', sub: 'Integrator clamp' },
      { label: 'CoppeliaSim', sub: 'Scene 6 eval' },
    ],
    process: ['Kinematics derivation', 'SE(3) trajectory sketch', 'Jacobian + pinv notes', 'Gain sweep plan'],
    prototype: ['Sim snapshot', 'Error plot', 'Manipulability plot', 'CSV trace'],
    future: 'Port to hardware with encoder feedback; replace PI with LQR on linearized body dynamics; real-time in ROS 2.',
  },
  {
    id: 'soniccar',
    code: 'SYS::04',
    name: 'SonicCar — Voice-Controlled AV',
    short: 'ROS2 + LLM + LiDAR Safety',
    course: 'ECE/MAE 148 · Autonomous Vehicles',
    year: '2025',
    domain: 'Autonomy · ROS2',
    tags: ['ROS2', 'Jetson Nano', 'VESC', 'LiDAR', 'Google Gemini', 'Roboflow CV', 'FastDDS'],
    oneline: 'Natural-language driving with independent hardware safety.',
    problem:
      'Voice as a natural AV interface beyond fixed keywords — while keeping real-world safety on an independent hardware path. Cross-device ROS 2 discovery on a shared university network would not behave.',
    approach:
      'Wake-word → speech-to-text → Gemini intent parser → structured ROS 2 commands on /steering_commands. LiDAR subscriber overrides motion inside 0.4 m. OAK-D stop-sign model trained on 453 images at a 90 % confidence gate. FastDDS discovery server at 11888 fixed the cross-device problem.',
    insight:
      'The LLM plans; cheap independent safeguards override. Keep the probabilistic layer out of the safety path.',
    results: [
      'End-to-end voice → drive loop operational',
      'LiDAR override @ 0.4 m threshold',
      'Stop-sign detection @ 90 % confidence',
      'FastDDS cleanly resolved cross-device discovery',
    ],
    metrics: [
      { k: 'LiDAR stop', v: '0.4', u: 'm' },
      { k: 'Stop-sign conf.', v: '90', u: '%' },
      { k: 'Training imgs', v: '453', u: '' },
      { k: 'Wake word', v: 'Sonic', u: '' },
    ],
    diagram: 'soniccar',
    plot: 'soniccar',
    images: {
      main: '/images/sonic-main.png',
      detail: '/images/sonic-detailed.png',
    },
    overview:
      'A voice-controlled autonomous RC car on Jetson Nano — speech recognition → LLM intent parsing → ROS 2 motor control — with LiDAR obstacle avoidance and camera-based stop-sign detection on independent paths.',
    role:
      'Full-stack: ROS 2 nodes, FastDDS configuration, Gemini prompt design, Roboflow training pipeline, tkinter operator GUI with emergency stop.',
    architecture: [
      { label: 'Mic', sub: 'Wake word "Sonic"' },
      { label: 'Gemini LLM', sub: 'Intent parse' },
      { label: 'ROS 2 bus', sub: '/steering_commands' },
      { label: 'LiDAR', sub: '0.4 m override' },
      { label: 'OAK-D', sub: 'Stop-sign 90 %' },
      { label: 'VESC', sub: 'Throttle + steer' },
    ],
    process: ['Wake-word state machine', 'Gemini prompt iterations', 'FastDDS config', 'Roboflow labeling'],
    prototype: ['Assembled car', 'Jetson wiring', 'GUI screenshot', 'Stop-sign dataset'],
    future: 'On-device distilled intent model; nav2 integration; multi-command sequencing; field trials outdoors.',
  },
  {
    id: 'twip-ccd',
    code: 'SYS::05',
    name: 'TWIP Control Co-Design',
    short: 'Nested MDO + LQR Synthesis',
    course: 'MAE 270 · Multidisciplinary Design Optimization',
    year: '2025',
    domain: 'Optimization · Controls',
    tags: ['Python', 'LQR', 'SLSQP', 'Nonlinear Sim', 'State-Space', 'MDO'],
    oneline: 'Morphology and controller, jointly optimized.',
    problem:
      'Conventional design fixes TWIP morphology first and synthesizes a controller after. This decoupling ignores the coupling between geometry, inertia and control authority — and throws actuator at bad geometry.',
    approach:
      'Nested MDO: outer SLSQP over {h, m_b, r}; inner loop re-synthesizes LQR and runs nonlinear closed-loop sim with smooth saturation + slew limits. Six-term objective penalizes pitch · effort · peak torque · torque rate · wheel speed · compactness. KKT verified post-convergence.',
    insight:
      'Optimal morphology is not a point — it shifts with disturbance magnitude. At 5° the optimizer wants wheels; at 20° it wants low CoM. Body mass wants to be minimum. Always.',
    results: [
      'KKT stationarity ~10⁻³',
      'r shifts from 0.064 m (5°) → 0.018 m (20°)',
      'CoM height collapses at high disturbance',
      'Physical 3D-printed prototype validated behavior',
    ],
    metrics: [
      { k: 'KKT', v: '~10⁻³', u: '' },
      { k: 'Wheel r', v: '0.064→0.018', u: 'm' },
      { k: 'Scenarios', v: '4', u: '' },
      { k: 'Design vars', v: '3 + LQR', u: '' },
    ],
    diagram: 'twip',
    plot: 'twip',
    images: {
      main: '/images/twip-main.png',
      detail: '/images/twip-detailed.png',
    },
    overview:
      'A simulation-based control co-design framework that jointly optimizes TWIP morphology parameters (CoM height, body mass, wheel radius) and LQR gains in a nested MDO loop. Evaluated across disturbance conditions from 5° to 20° and validated on a 3D-printed prototype.',
    role:
      'Derivation of linearized EoM, state-space parameterization, implementation of the nested SLSQP + LQR loop, bound-aware finite differences, KKT verification, and the physical prototype build + test.',
    architecture: [
      { label: 'Morphology x', sub: 'h · m_b · r' },
      { label: 'State-Space', sub: 'A(x), B(x)' },
      { label: 'LQR Synth.', sub: 'K = LQR(A,B,Q,R)' },
      { label: 'Nonlinear sim', sub: 'Sat. + slew limit' },
      { label: 'Objective J', sub: '6-term penalty' },
      { label: 'SLSQP', sub: 'Outer optimizer' },
    ],
    process: ['Lagrangian derivation', 'State-space parameterization', 'Objective shaping', 'Gradient schema'],
    prototype: ['3D-printed TWIP', 'Driver board', 'Sim trace', 'KKT log'],
    future: 'Robust CCD with uncertainty sets; actuator selection as discrete design variable; hardware-in-the-loop identification.',
  },
  {
    id: 'franck',
    code: 'SYS::06',
    name: '"Franck" Pick-and-Place Robot',
    short: 'Electromechanical Competition Build',
    course: 'MAE 3 · Introduction to Engineering',
    year: '2023',
    domain: 'Mechatronics',
    tags: ['SolidWorks', 'Laser Cut Acrylic', '3D Printing', 'DC Gearmotors', 'Rack & Pinion'],
    oneline: 'Designed, built, won.',
    problem:
      'Head-to-head MAE 3 competition: pick spheres off variable-height posts and deposit them, under strict dimension/weight/power constraints.',
    approach:
      'Full CAD in SolidWorks: laser-cut acrylic chassis, 3D-printed gear/clamp/brackets, three DC geared motors (drive / arm lift via gear-and-rack / clamp via rack-and-pinion). FBD-based statics analysis of lift capacity.',
    insight:
      'The simplified FBD underestimated lift — real friction at shaft/upright contacts added margin. Bench reality beats paper.',
    results: [
      '46.5 competition points — defeated opponent',
      'Predicted lift 128.7 g → measured 180 g',
      '15-pt sphere placed on 15-pt post, 1.5× multiplier',
      'Three-motor system wired and debugged in a week',
    ],
    metrics: [
      { k: 'Score', v: '46.5', u: 'pts' },
      { k: 'Actual lift', v: '180', u: 'g' },
      { k: 'Predicted', v: '128.7', u: 'g' },
      { k: 'DOF', v: '3', u: '' },
    ],
    diagram: 'franck',
    plot: 'franck',
    images: {
      main: '/images/franck-main.png',
      detail: '/images/franck-detailed.png',
    },
    overview:
      'A competition-ready pick-and-place robot built in a constrained timeline: laser-cut chassis, 3D-printed mechanism, three DC motors — all designed, fabricated, wired and debugged by a small team.',
    role: 'Mechanical CAD, fabrication, wiring, statics analysis, and in-competition driving.',
    architecture: [
      { label: 'Chassis', sub: 'Laser-cut 0.25" acrylic' },
      { label: 'Drive', sub: 'Straight DC geared motor' },
      { label: 'Arm lift', sub: 'Bent motor + gear-and-rack' },
      { label: 'Clamp', sub: '90° motor · rack-and-pinion' },
      { label: 'FBD', sub: 'Spring + torque + masses' },
    ],
    process: ['Concept sketches', 'Parallel-rail arm linkage', 'Gear train layout', 'Rack length iteration'],
    prototype: ['Assembled robot', 'Gear train', 'Clamp mechanism', 'Competition photo'],
    future: 'Encoder feedback for closed-loop arm angle; lighter composite chassis; a scoring sensor on the clamp.',
  },
  {
    id: 'softrobot-terrain',
    code: 'SYS::07',
    name: 'Terrain-Adaptive Soft Robot',
    short: 'Vibration + Contact Geometry',
    course: 'MAE 249 · Soft Robotics',
    year: '2024',
    domain: 'Soft Robotics',
    tags: ['TPU Printing', 'Fusion 360', 'Kinovea Tracking', 'SMA-Origami', 'Experimental'],
    oneline: 'Surface geometry as the actuator for granular locomotion.',
    problem:
      'Vibration-driven soft robots work on solids via anisotropic friction, but sand jams, fluidizes and drifts laterally. No systematic study of what contact geometry enables controlled linear locomotion on granular media.',
    approach:
      'Printed three TPU body designs (flat control, Christmas Tree, novel longitudinal ridge) at 15–20 % infill with forward-biased motor divots. Tested on solid + sand across controlled trials; tracked motion in Kinovea; iterated to 2/3/4-tooth longitudinal variants. Designed a morphing SMA-origami undershell concept.',
    insight:
      'On granular media, longitudinal ridges aligned with the direction of travel beat Christmas-Tree anisotropy — the right geometry on sand is not the right geometry on solid. So give the robot two.',
    results: [
      '4-tooth longitudinal: ~9 cm forward travel on sand',
      '<1 cm lateral deviation',
      'Morphing concept: 54 cm vs 23 cm / 3 cm fixed',
      '6 geometry iterations tested end-to-end',
    ],
    metrics: [
      { k: 'Fwd travel', v: '~9', u: 'cm' },
      { k: 'Lateral', v: '<1', u: 'cm' },
      { k: 'Morphing total', v: '54', u: 'cm' },
      { k: 'Iterations', v: '6', u: '' },
    ],
    diagram: 'softrobot',
    plot: 'softrobot',
    images: {
      main: '/images/soft-main.png',
      detail: '/images/soft-detailed.png',
    },
    overview:
      'An experimental investigation of how contact geometry shapes vibration-driven soft-robot locomotion on granular media — and a proposal for a morphing SMA-origami undershell that switches geometries to match terrain.',
    role: 'Design, printing, experimental protocol, Kinovea analysis, morphing undershell concept CAD.',
    architecture: [
      { label: 'Body', sub: 'TPU, forward-biased divot' },
      { label: 'Motor', sub: 'Eccentric vibration' },
      { label: 'Undershell A', sub: 'Longitudinal (sand)' },
      { label: 'Undershell B', sub: 'Christmas Tree (solid)' },
      { label: 'SMA-origami', sub: 'Mountain/valley fold' },
    ],
    process: ['Literature map', 'Geometry sketches', 'Trial protocol', 'Kinovea overlays', 'Origami fold schematic'],
    prototype: ['TPU bodies', 'Sandbox rig', 'Tracked frame', 'Origami model'],
    future: 'Closed-loop geometry switching via onboard IMU; granular-fluid CFD to predict geometries; multi-terrain benchmark.',
  },
  {
    id: 'crutch-on-you',
    code: 'SYS::08',
    name: 'Crutch On You — Startup',
    short: 'Assistive Device · Blackstone LaunchPad',
    course: 'Co-Founded · Feb 2026',
    year: '2026',
    domain: 'Startup · Hardware',
    tags: ['SolidWorks', 'FDM Prototyping', 'Medical Device', 'User Research', 'Patent Prep'],
    oneline: 'A waist-supported crutch alternative.',
    problem:
      'Traditional axillary crutches cause 70,000+ US injuries annually — armpit strain, nerve compression, restricted hand mobility, poor posture, muscle atrophy. After a Grade-3 meniscus tear, I lived the failure modes.',
    approach:
      '80+ structured user interviews → mechanical spec: 2-DOF waist support with adjustable load paths anchored at the waistline, combined with an ergonomic forearm crutch. Five hardware iterations in SolidWorks → FDM.',
    insight:
      'The load path is the product. Move the anchor from the armpit to the waist and every downstream failure mode — nerve compression, hand-mobility loss, posture collapse — improves simultaneously.',
    results: [
      '80+ user interviews · 31 discovery',
      '5+ functional FDM iterations validated',
      'UCSD Blackstone LaunchPad Winter 2026',
      'Targets $730M global TAM · $4.3M SOM',
    ],
    metrics: [
      { k: 'Interviews', v: '80+', u: '' },
      { k: 'Iterations', v: '5+', u: '' },
      { k: 'Global TAM', v: '$730', u: 'M' },
      { k: 'Program', v: 'Blackstone', u: 'UCSD' },
    ],
    diagram: 'crutchonyou',
    plot: 'crutchonyou',
    images: {
      main: '/images/coy-main.png',
      detail: '/images/coy-detailed.png',
    },
    overview:
      'A co-founded startup building a waist-supported crutch alternative that eliminates upper-body strain, restores hand mobility, and promotes confident load-bearing during recovery — now in functional prototype and patent-prep.',
    role: 'Co-founder and hardware lead. Ran discovery interviews, led all mechanical design in SolidWorks, drove the 5+ FDM iterations, and is leading patent preparation and investor pitching.',
    architecture: [
      { label: '2-DOF waist support', sub: 'Anchor at waistline' },
      { label: 'Adjustable load path', sub: 'Per-user geometry' },
      { label: 'Forearm bipod', sub: 'Stability assist' },
      { label: 'Ergonomic handle', sub: 'Hand-free posture' },
    ],
    process: ['Discovery interview script', 'Load-path sketches', 'Waist-mechanism DOE', 'FDM iteration log'],
    prototype: ['Waist mechanism', 'Assembled prototype', 'User-test photo', 'Patent figure'],
    future: 'IRB clinical pilot with collegiate athletes; design-for-manufacture; Series-pre-seed; orthopedic partnership.',
  },
];

if (typeof window !== 'undefined') window.SYSTEMS = SYSTEMS;
