import { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { Cpu, Bot, Coins, HandCoins, Zap, Shield, GraduationCap, ShieldAlert, Vote, Scale, Play, FastForward, Download, Upload, RotateCcw, BarChart3, FileText, Globe, BookOpen, ArrowRightLeft, Users, Target, Wheat, BookMarked, Swords, Compass, Layers, Sliders, AlertCircle, Sparkles, TrendingUp, FlaskConical, ChevronRight, Check } from 'lucide-react';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Inter:wght@400;500;600;700&display=swap');

.ll {
  font-family: 'Inter', system-ui, sans-serif;
  color: #f0e6d2;
  background: #0a0e27;
  min-height: 100vh;
  background-image:
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,0,110,0.10), transparent 60%),
    radial-gradient(ellipse 80% 60% at 100% 0%, rgba(0,240,255,0.08), transparent 60%),
    radial-gradient(ellipse 100% 80% at 50% 100%, rgba(199,125,255,0.08), transparent 70%),
    linear-gradient(180deg, #0a0e27 0%, #1a0b2e 50%, #0a0e27 100%);
  position: relative;
  overflow-x: hidden;
}
/* Scanlines overlay */
.ll::before {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 2px,
    rgba(0,0,0,0.15) 2px,
    rgba(0,0,0,0.15) 3px
  );
  opacity: 0.6;
}
/* Subtle vignette */
.ll::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);
}

.ll .pixel { font-family: 'Press Start 2P', monospace; }
.ll .crt { font-family: 'VT323', 'JetBrains Mono', monospace; letter-spacing: 0.02em; }

.ll input[type=range] {
  -webkit-appearance: none; appearance: none;
  height: 4px; background: rgba(240,230,210,0.15);
  border-radius: 2px; outline: none; width: 100%;
}
.ll input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 14px; height: 14px; border-radius: 0;
  background: var(--rule-color, #f0e6d2);
  cursor: grab; border: 2px solid #0a0e27;
  box-shadow: 0 0 8px var(--rule-color, #f0e6d2);
}
.ll input[type=range]::-moz-range-thumb {
  width: 14px; height: 14px; border-radius: 0;
  background: var(--rule-color, #f0e6d2);
  cursor: grab; border: 2px solid #0a0e27;
  box-shadow: 0 0 8px var(--rule-color, #f0e6d2);
}
.ll input[type=text] {
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(0,240,255,0.4);
  border-radius: 0; padding: 6px 10px;
  font-family: 'VT323', monospace; font-size: 16px;
  color: #00f0ff; outline: none;
  letter-spacing: 0.05em;
}
.ll input[type=text]:focus { 
  border-color: #00f0ff; 
  box-shadow: 0 0 12px rgba(0,240,255,0.4);
}
.ll .btn {
  font-family: 'VT323', monospace;
  font-weight: 400; font-size: 15px;
  border-radius: 0; padding: 6px 12px;
  transition: all 0.12s; cursor: pointer;
  border: 2px solid currentColor;
  display: inline-flex; align-items: center; gap: 6px;
  letter-spacing: 0.06em; text-transform: uppercase;
  background: transparent;
}
.ll .btn-primary { color: #ff006e; box-shadow: 0 0 8px rgba(255,0,110,0.3); }
.ll .btn-primary:hover { background: #ff006e; color: #0a0e27; box-shadow: 0 0 16px rgba(255,0,110,0.7); }
.ll .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }
.ll .btn-secondary { color: #00f0ff; }
.ll .btn-secondary:hover { background: #00f0ff; color: #0a0e27; box-shadow: 0 0 12px rgba(0,240,255,0.6); }
.ll .btn-ghost { border-color: transparent; color: rgba(240,230,210,0.6); }
.ll .btn-ghost:hover { color: #00f0ff; border-color: #00f0ff; }
.ll .btn-sm { padding: 3px 8px; font-size: 13px; border-width: 1px; }

.ll .rule-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(240,230,210,0.10);
  border-left: 3px solid var(--rule-color, #f0e6d2);
  padding: 8px 11px; transition: all 0.15s;
}
.ll .rule-card:hover { 
  background: rgba(0,0,0,0.5);
  border-left-color: var(--rule-color, #f0e6d2);
  box-shadow: 0 0 8px var(--rule-color, rgba(240,230,210,0.2));
}
.ll .rule-card.changed { 
  background: rgba(0,0,0,0.5);
  box-shadow: inset 0 0 0 1px rgba(255,0,110,0.4), 0 0 12px rgba(255,0,110,0.2);
}

.ll .tab-btn {
  font-family: 'VT323', monospace; 
  font-weight: 400; font-size: 16px;
  padding: 7px 12px;
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  cursor: pointer; 
  color: rgba(240,230,210,0.45);
  transition: all 0.15s;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ll .tab-btn.active { 
  border-bottom-color: #ff006e; 
  color: #ff006e;
  text-shadow: 0 0 8px rgba(255,0,110,0.6);
}
.ll .tab-btn:hover:not(.active):not(:disabled) { color: #00f0ff; }
.ll .tab-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.ll .panel {
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(240,230,210,0.12);
  border-radius: 0; padding: 14px;
  position: relative;
}
.ll .panel-glow {
  box-shadow: 0 0 0 1px var(--glow-color, rgba(0,240,255,0.3)), 
              0 0 20px var(--glow-color, rgba(0,240,255,0.15));
}

.ll .stamp {
  display: inline-block; font-family: 'Press Start 2P', monospace;
  font-weight: 400; letter-spacing: 0.05em;
  text-transform: uppercase; font-size: 9px;
  padding: 4px 7px; border: 1px solid currentColor;
}
.ll .pill {
  display: inline-block; padding: 2px 8px; font-size: 12px;
  font-family: 'VT323', monospace; font-weight: 400;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ll .scrollbar::-webkit-scrollbar { width: 6px; }
.ll .scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
.ll .scrollbar::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.3); }
.ll .scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,240,255,0.5); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.ll .fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes flicker { 
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
@keyframes pulse-glow { 
  0%, 100% { box-shadow: 0 0 8px var(--glow-color, #ff006e); }
  50% { box-shadow: 0 0 24px var(--glow-color, #ff006e), 0 0 32px var(--glow-color, #ff006e); }
}
.ll .pulse { animation: pulse-glow 1.6s ease-in-out infinite; }
.ll .text-muted { color: rgba(240,230,210,0.55); }
.ll .text-faint { color: rgba(240,230,210,0.30); }

.ll .neon { text-shadow: 0 0 8px currentColor, 0 0 16px currentColor; }
.ll .neon-soft { text-shadow: 0 0 6px currentColor; }

.ll .bloc-tab {
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(240,230,210,0.12);
  border-bottom: 4px solid var(--bloc-color, #f0e6d2);
  border-radius: 0;
  padding: 9px 12px; cursor: pointer;
  transition: all 0.15s; flex: 1; text-align: left;
  position: relative;
  min-width: 0;
}
.ll .bloc-tab:hover { 
  background: rgba(0,0,0,0.6);
  border-color: var(--bloc-color);
  box-shadow: 0 0 10px var(--bloc-color);
}
.ll .bloc-tab.active { 
  background: rgba(0,0,0,0.7);
  border-bottom-width: 6px;
  box-shadow: inset 0 0 0 1px var(--bloc-color), 0 0 16px var(--bloc-color);
}

.ll .bloc-tab .name { color: var(--bloc-color); }
.ll .bloc-tab.active .name { text-shadow: 0 0 8px currentColor; }

.ll a, .ll button { font-family: inherit; }

.ll .grid-bg {
  background-image: 
    linear-gradient(rgba(255,0,110,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,0,110,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
}
`;

// ─── Rule definitions ─────────────────────────────────────────────
const RULE_DEFS = [
  { id: 'aiGrowth', name: 'AI capability growth', icon: Cpu, color: '#ff006e',
    description: 'Same shock affects all blocs; rules differ in response.',
    labels: { 0: 'Frozen', 25: 'Slow', 50: 'Reference', 75: 'Accelerated', 100: 'Explosive' } },
  { id: 'robotGrowth', name: 'Robot capability growth', icon: Bot, color: '#ff5e7a',
    description: 'How fast robotics advance.',
    labels: { 0: 'Stalled', 50: 'Reference', 100: 'Breakthrough era' } },
  { id: 'capitalTax', name: 'Capital tax rate', icon: Coins, color: '#00f0ff',
    description: 'Tax on AI/robot capital owners.',
    labels: { 0: 'No tax', 30: 'Modest', 60: 'Heavy', 100: 'Confiscatory' } },
  { id: 'wealthTax', name: 'Wealth tax rate', icon: Scale, color: '#06d6f0',
    description: 'Annual tax on accumulated wealth.',
    labels: { 0: 'None', 50: 'European-style', 100: 'Aggressive' } },
  { id: 'ubiLevel', name: 'Universal basic income', icon: HandCoins, color: '#06ffa5',
    description: 'Unconditional transfer as % of median wage.',
    labels: { 0: 'No UBI', 30: 'Subsistence', 60: 'Comfortable', 100: 'Generous' } },
  { id: 'energyDist', name: 'Energy ownership distribution', icon: Zap, color: '#ffbe0b',
    description: '0 = monopolized; 100 = broadly distributed.',
    labels: { 0: 'Monopolized', 50: 'Mixed', 100: 'Fully distributed' } },
  { id: 'laborProt', name: 'Labor protections', icon: Shield, color: '#ff8500',
    description: 'Minimum wage, severance, right to organize.',
    labels: { 0: 'None', 50: 'Standard', 100: 'Strong' } },
  { id: 'retraining', name: 'Retraining investment', icon: GraduationCap, color: '#9d4edd',
    description: '% of GDP spent on education and worker retraining.',
    labels: { 0: 'Abandoned', 30: 'Modest', 60: 'Strong', 100: 'National priority' } },
  { id: 'alignment', name: 'AI alignment stringency', icon: ShieldAlert, color: '#c77dff',
    description: 'How strict are alignment constraints.',
    labels: { 0: 'No constraints', 50: 'Moderate', 100: 'Asimov-strict' } },
  { id: 'politicalResp', name: 'Political responsiveness', icon: Vote, color: '#e0aaff',
    description: 'How responsive are institutions to popular distress.',
    labels: { 0: 'Captured / authoritarian', 50: 'Sluggish democracy', 100: 'Highly responsive' } },
];

// ─── Bloc presets (calibrated, 4-bloc) ────────────────────────────
const BLOCS = {
  OM: {
    id: 'OM', name: 'Open Market', subtitle: 'Liberal Market Economy',
    color: '#ff006e', icon: '◇',
    description: 'Market-driven economy with modest social safety net and strong regulatory state. Capital flows freely, capability concentrates, redistribution is contested. Baseline ~76 yrs.',
    archetype: 'Light-touch redistribution · medium alignment · contested democracy · chip-heavy',
    rules: { aiGrowth: 60, robotGrowth: 50, capitalTax: 28, wealthTax: 5,
             ubiLevel: 18, energyDist: 35, laborProt: 50, retraining: 35,
             alignment: 45, politicalResp: 55 },
    endowments: { energy: 1.0, chips: 1.2, minerals: 0.7, agriculture: 1.1, infrastructure: 1.00 },
    initial: { aiCap: 0.10, robotCap: 0.04, medianIncome: 1.00, unemployment: 0.05,
               gini: 0.40, polStability: 0.70, capitalConc: 0.45 },
  },
  SC: {
    id: 'SC', name: 'Social Compact', subtitle: 'Coordinated Market Economy',
    color: '#00f0ff', icon: '◈',
    description: 'High-redistribution welfare state with codetermination, generous transfers, distributed energy ownership. Strong on alignment and political responsiveness. Baseline ~78 yrs.',
    archetype: 'Strong redistribution · high alignment · responsive democracy · balanced industry',
    rules: { aiGrowth: 60, robotGrowth: 50, capitalTax: 55, wealthTax: 30,
             ubiLevel: 50, energyDist: 70, laborProt: 75, retraining: 70,
             alignment: 65, politicalResp: 75 },
    endowments: { energy: 1.1, chips: 0.8, minerals: 0.6, agriculture: 0.9, infrastructure: 1.05 },
    initial: { aiCap: 0.10, robotCap: 0.04, medianIncome: 1.05, unemployment: 0.05,
               gini: 0.30, polStability: 0.75, capitalConc: 0.42 },
  },
  DO: {
    id: 'DO', name: 'Directed Order', subtitle: 'Authoritarian State Capitalism',
    color: '#c77dff', icon: '◉',
    description: 'State-directed economy with weak political accountability. Stat-credibility adjusted (low responsiveness implies underreporting of mortality). High capability, strategic posture. Baseline ~71 yrs.',
    archetype: 'State-directed capital · low alignment · suppressed dissent · resource-rich',
    rules: { aiGrowth: 60, robotGrowth: 50, capitalTax: 35, wealthTax: 10,
             ubiLevel: 25, energyDist: 20, laborProt: 40, retraining: 55,
             alignment: 45, politicalResp: 20 },
    endowments: { energy: 0.9, chips: 1.0, minerals: 1.4, agriculture: 1.0, infrastructure: 0.85 },
    initial: { aiCap: 0.10, robotCap: 0.04, medianIncome: 0.85, unemployment: 0.05,
               gini: 0.45, polStability: 0.65, capitalConc: 0.55 },
  },
  Mosaic: {
    id: 'Mosaic', name: 'Mosaic', subtitle: 'Fragmented Resource-Rich Periphery',
    color: '#ffbe0b', icon: '◊',
    description: 'Resource-rich but institutionally fragmented. Massive minerals, sun, wind; weak chip manufacturing; fragile food security. Vulnerable to extraction, coercion, and invasion. Baseline ~67 yrs.',
    archetype: 'Weak institutions · resource wealth · low capability · target of extraction',
    rules: { aiGrowth: 40, robotGrowth: 30, capitalTax: 25, wealthTax: 5,
             ubiLevel: 10, energyDist: 35, laborProt: 30, retraining: 30,
             alignment: 30, politicalResp: 35 },
    endowments: { energy: 1.4, chips: 0.4, minerals: 1.8, agriculture: 0.8, infrastructure: 0.72 },
    initial: { aiCap: 0.05, robotCap: 0.02, medianIncome: 0.55, unemployment: 0.08,
               gini: 0.50, polStability: 0.55, capitalConc: 0.65 },
  },
};
const BLOC_KEYS = ['OM', 'SC', 'DO', 'Mosaic'];

const RESOLUTION_INFO = {
  redistribution: { name: 'Redistribution', color: '#06ffa5', icon: '⚖' },
  abundance: { name: 'Abundance', color: '#00f0ff', icon: '✦' },
  bifurcation: { name: 'Bifurcation', color: '#ffbe0b', icon: '◫' },
  rentier: { name: 'Rentier Feudalism', color: '#c77dff', icon: '◈' },
  breakdown: { name: 'Breakdown', color: '#ff006e', icon: '✕' },
  extraction: { name: 'Extraction', color: '#ff8500', icon: '⛏' },
};

// ─── PRNG ─────────────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function statCredibilityPenalty(n) {
  return Math.max(0, 0.30 - n.politicalResp) * 0.008;
}

// ─── Single-bloc step ────────────────────────────────────
function stepBloc(j, t, rng, ext) {
  const n = j.n;
  const AI_CEILING = 4.0 * j.endowments.energy;
  const ROBOT_CEILING = 3.0 * j.endowments.chips;
  const aiR = n.aiGrowth * 0.06 * (1 - 0.5 * n.alignment);
  const robotR = n.robotGrowth * 0.04 * (1 - 0.5 * n.alignment);
  j.aiCap += j.aiCap * aiR * (1 - j.aiCap / AI_CEILING) * (1 + 0.5 * (rng() - 0.5));
  j.robotCap += j.robotCap * robotR * (1 - j.robotCap / ROBOT_CEILING) * (1 + 0.5 * (rng() - 0.5));
  j.aiCap += ext.aiCap_boost || 0;
  j.robotCap += ext.robotCap_boost || 0;
  j.aiCap = Math.min(AI_CEILING, j.aiCap);
  j.robotCap = Math.min(ROBOT_CEILING, j.robotCap);
  if (rng() < 0.04) {
    const jump = 0.25 + rng() * 0.45;
    j.aiCap = Math.min(AI_CEILING, j.aiCap * (1 + jump));
    j.events.push({ turn: t, type: 'ai_jump', description: `AI capability surged +${(jump * 100).toFixed(0)}%` });
  }
  if (rng() < 0.025 && t > 20) {
    const jump = 0.20 + rng() * 0.35;
    j.robotCap = Math.min(ROBOT_CEILING, j.robotCap * (1 + jump));
  }
  const totalCap = j.aiCap + j.robotCap;
  let macroShock = 0;
  if (rng() < 0.030) {
    macroShock = 0.10 + rng() * 0.25;
    j.events.push({ turn: t, type: 'shock', description: `External shock — ${(macroShock * 100).toFixed(0)}% hit` });
  }
  macroShock += ext.shock_modifier || 0;

  // Food shock — hits low-agriculture-endowment blocs harder
  const foodVuln = Math.max(0, 0.85 - j.endowments.agriculture) * 0.5;
  if (rng() < (0.015 + foodVuln * 0.04)) {
    const foodShock = 0.05 + rng() * 0.15;
    macroShock += foodShock;
    j.events.push({ turn: t, type: 'food_crisis', description: `Food crisis — ${(foodShock * 100).toFixed(0)}% shock` });
  }

  const shareToSociety = (1 - j.capitalConc * 0.7) * (0.3 + 0.7 * n.alignment) * j.institutionalCapacity;
  const medicalDividend = totalCap * 0.30 * shareToSociety;
  const productivityDividend = totalCap * 0.40 * shareToSociety;
  const capabilityPressure = Math.tanh(totalCap / 2.5);
  const rawDisplacement = capabilityPressure * 0.55;
  const retrainingMit = n.retraining * 0.30;
  const laborMit = n.laborProt * 0.10;
  const capitalFlowEffect = -(ext.capital_flow || 0) * 0.08;
  const targetUnemp = Math.max(0.03, rawDisplacement - retrainingMit - laborMit + capitalFlowEffect + (rng() - 0.5) * 0.06);
  j.unemployment = 0.65 * j.unemployment + 0.35 * targetUnemp + macroShock * 0.30;
  j.unemployment = Math.max(0.02, Math.min(0.55, j.unemployment));
  const baseConc = 0.45 + 0.35 * capabilityPressure;
  const taxForce = n.capitalTax * 0.5 + n.wealthTax * 0.4;
  const distForce = n.energyDist * 0.4;
  const politicalForce = n.politicalResp * 0.2 + n.laborProt * 0.15;
  const capturePenalty = Math.max(0, j.capitalConc - 0.7) * 1.5;
  const effRedist = Math.max(0, taxForce + distForce + politicalForce - capturePenalty);
  const redistCapacity = Math.tanh(effRedist * 1.0);
  let targetConc = baseConc * (1 - 0.65 * redistCapacity);
  targetConc = Math.max(0.15, Math.min(0.95, targetConc));
  j.capitalConc = 0.78 * j.capitalConc + 0.22 * targetConc + (rng() - 0.5) * 0.025;
  j.capitalConc = Math.max(0.10, Math.min(0.97, j.capitalConc));

  // Income — Mosaic gets less benefit from capital inflows (extractive)
  const extractionFactor = j.key === 'Mosaic' ? 0.015 : 0.05;
  const infra = j.endowments.infrastructure || 1.0;
  const laborIncome = (1 - j.unemployment) * infra * (1 + productivityDividend * 0.4);
  const taxRevenue = j.aiCap * n.capitalTax * 0.4 + j.robotCap * n.capitalTax * 0.3 + j.capitalConc * n.wealthTax * 0.5;
  const ubiTarget = n.ubiLevel * 0.6;
  const ubiPayout = Math.min(ubiTarget, taxRevenue * 1.2 + 0.05);
  const extraction = j.capitalConc * 0.5 * (1 - n.capitalTax * 0.6) * (1 - n.wealthTax * 0.5);
  const inflowBonus = Math.max(0, ext.capital_flow || 0) * extractionFactor;
  let targetIncome = laborIncome + ubiPayout - extraction + inflowBonus;
  targetIncome = Math.max(0.15, targetIncome);
  j.medianIncome = 0.75 * j.medianIncome + 0.25 * targetIncome - macroShock * 0.15;
  j.medianIncome = Math.max(0.10, Math.min(3.5, j.medianIncome));
  let targetGini = 0.30 + j.capitalConc * 0.45 - n.capitalTax * 0.12 - n.ubiLevel * 0.18 - n.energyDist * 0.08 - n.wealthTax * 0.10;
  targetGini = Math.max(0.18, Math.min(0.85, targetGini));
  j.gini = 0.78 * j.gini + 0.22 * targetGini + (rng() - 0.5) * 0.012;
  const stress = j.unemployment * 0.4 + Math.max(0, j.gini - 0.40) * 0.55 + Math.max(0, 0.75 - j.medianIncome) * 0.5 + Math.max(0, j.capitalConc - 0.70) * 0.4 + macroShock * 0.6 + j.crisisScar * 0.3;
  let response = (n.politicalResp * 0.5 + n.energyDist * 0.15) * j.institutionalCapacity;
  response = Math.tanh(response * 1.5) * 0.6;
  let targetStability = Math.max(0, Math.min(1, 1 - stress + response));
  let bistablePull = 0;
  if (j.polStability < 0.30) bistablePull = -0.04 * Math.sqrt(0.30 - j.polStability);
  else if (j.polStability > 0.65) bistablePull = 0.02 * Math.sqrt(j.polStability - 0.65);
  j.polStability = 0.70 * j.polStability + 0.30 * targetStability + bistablePull + (rng() - 0.5) * 0.04;
  j.polStability = Math.max(0, Math.min(1, j.polStability));
  if (j.polStability < 0.40 && rng() < 0.10) {
    const sev = 0.5 + rng() * 0.30;
    j.polStability *= sev;
    j.crisisScar += 0.10;
    j.events.push({ turn: t, type: 'crisis', description: `Political crisis — stability dropped ${((1 - sev) * 100).toFixed(0)}%` });
  }
  if (rng() < 0.008) {
    j.polStability *= 0.4 + rng() * 0.3;
    j.unemployment = Math.min(0.55, j.unemployment + 0.10);
    j.crisisScar += 0.20;
    j.events.push({ turn: t, type: 'catastrophe', description: 'Acute crisis — war or regime collapse' });
  }
  j.crisisScar *= 0.985;
  if (j.polStability < 0.40) j.institutionalCapacity *= 0.99;
  else if (j.polStability > 0.60 && j.institutionalCapacity < 1.0) j.institutionalCapacity = Math.min(1.0, j.institutionalCapacity * 1.005);
  j.institutionalCapacity = Math.max(0.3, j.institutionalCapacity);

  // ── WAR EFFECTS ── Applied directly after the period's normal dynamics.
  // Target takes massive damage; aggressor suffers smaller costs but extracts value.
  let warMortality = 0;
  if (ext.warAsTarget) {
    const w = ext.warAsTarget;
    j.polStability *= (1 - w.intensity * 0.55);
    j.medianIncome *= (1 - w.intensity * 0.30);
    j.aiCap *= (1 - w.intensity * 0.22);
    j.robotCap *= (1 - w.intensity * 0.22);
    j.institutionalCapacity *= (1 - w.intensity * 0.15);
    j.crisisScar += w.intensity * 0.45;
    warMortality = w.intensity * 0.045;
    j.unemployment = Math.min(0.55, j.unemployment + w.intensity * 0.15);
    j.events.push({ turn: t, type: 'war_target', description: `Invaded by ${BLOCS[w.aggressor].name} — ${(w.intensity * 100).toFixed(0)}% war damage` });
  }
  if (ext.warAsAggressor) {
    const w = ext.warAsAggressor;
    j.polStability *= (1 - w.intensity * 0.10);
    j.aiCap *= (1 - w.intensity * 0.05);
    j.medianIncome *= (1 + w.intensity * 0.08);
    j.capitalConc = Math.min(0.97, j.capitalConc + w.intensity * 0.06);
    j.crisisScar += w.intensity * 0.10;
    warMortality = w.intensity * 0.010;
    j.events.push({ turn: t, type: 'war_aggressor', description: `Invaded ${BLOCS[w.target].name} — extraction gains, military costs` });
  }
  // Re-clamp after war shocks
  j.polStability = Math.max(0, j.polStability);
  j.medianIncome = Math.max(0.10, j.medianIncome);
  j.aiCap = Math.max(0.01, j.aiCap);
  j.robotCap = Math.max(0.01, j.robotCap);
  j.institutionalCapacity = Math.max(0.3, j.institutionalCapacity);

  const baseDeath = 0.0125;
  const medicalOffset = -Math.min(0.004, medicalDividend * 0.0015);
  const povertyDeath = Math.max(0, 0.65 - j.medianIncome) * 0.012;
  const despairDeath = j.unemployment * Math.max(0, 1 - n.ubiLevel * 0.95) * 0.006;
  const violenceDeath = Math.max(0, 1 - j.polStability) * 0.013;
  const envDeath = (1 - n.energyDist) * Math.max(0, 0.5 - n.alignment) * 0.010;
  const alignmentFailDeath = Math.max(0, totalCap - 1.5) * Math.max(0, 0.4 - n.alignment) * 0.012;
  const foodInsec = Math.max(0, 0.65 - j.medianIncome) * Math.max(0, 1.2 - j.endowments.agriculture) * 0.012;
  const unreported = statCredibilityPenalty(n);
  const rawDriverSum = povertyDeath + despairDeath + violenceDeath + envDeath + alignmentFailDeath + foodInsec;
  const cappedDriverSum = 0.027 * (1 - Math.exp(-rawDriverSum / 0.027));
  const mortRate = Math.max(0.005, baseDeath + medicalOffset + cappedDriverSum + unreported + warMortality);
  j.cumulativeMortality += mortRate;
  j.history.push({
    turn: t, aiCap: +j.aiCap.toFixed(3), robotCap: +j.robotCap.toFixed(3),
    unemployment: +j.unemployment.toFixed(3), medianIncome: +j.medianIncome.toFixed(3),
    gini: +j.gini.toFixed(3), polStability: +j.polStability.toFixed(3),
    capitalConc: +j.capitalConc.toFixed(3), mortRate: +mortRate.toFixed(4),
    capitalFlow: ext.capital_flow || 0, talentFlow: ext.talent_flow || 0,
    warMortality: +warMortality.toFixed(4),
  });
}

function computeInteractions(blocs, t, rng, worldEvents) {
  const inputs = {};
  for (const k of BLOC_KEYS) inputs[k] = { capital_flow: 0, talent_flow: 0, aiCap_boost: 0, robotCap_boost: 0, shock_modifier: 0, warAsTarget: null, warAsAggressor: null };
  for (const src of BLOC_KEYS) {
    for (const dst of BLOC_KEYS) {
      if (src === dst) continue;
      const jSrc = blocs[src], jDst = blocs[dst];
      const taxDiff = jSrc.n.capitalTax - jDst.n.capitalTax;
      const wealthDiff = jSrc.n.wealthTax - jDst.n.wealthTax;
      if (taxDiff + wealthDiff <= 0) continue;
      const opennessSrc = 0.3 + 0.7 * jSrc.n.energyDist;
      const opennessDst = 0.3 + 0.7 * jDst.n.energyDist;
      const stabFactor = (1 - jSrc.polStability) * 0.5 + 0.5;
      const resourcePull = 1.0 + Math.max(0, jDst.endowments.minerals - 1.0) * 0.4;
      let flow = (taxDiff * 0.4 + wealthDiff * 0.3) * 0.04 * opennessSrc * opennessDst * stabFactor * resourcePull;
      flow *= jSrc.aiCap / Math.max(0.5, jDst.aiCap);
      flow = Math.max(0, Math.min(0.05, flow));
      inputs[src].capital_flow -= flow;
      inputs[dst].capital_flow += flow;
    }
  }
  for (const src of BLOC_KEYS) {
    for (const dst of BLOC_KEYS) {
      if (src === dst) continue;
      const jSrc = blocs[src], jDst = blocs[dst];
      const push = Math.max(0, 0.8 - jSrc.medianIncome) * 0.4 + Math.max(0, jSrc.unemployment - 0.10) * 0.5 + Math.max(0, 0.7 - jSrc.polStability) * 0.6;
      const pull = Math.max(0, jDst.medianIncome - 0.8) * 0.3 + Math.max(0, 0.6 - jDst.unemployment) * 0.2 + Math.max(0, jDst.polStability - 0.5) * 0.4;
      const friction = 1 - jSrc.n.politicalResp * 0.5;
      let reception = 1 - Math.max(0, jDst.unemployment - 0.20) * 2;
      reception = Math.max(0.1, Math.min(1.0, reception));
      let flow = push * pull * 0.003 * (1 - friction * 0.5) * reception;
      flow = Math.max(0, Math.min(0.02, flow));
      inputs[src].talent_flow -= flow;
      inputs[dst].talent_flow += flow;
    }
  }
  for (const src of BLOC_KEYS) {
    for (const dst of BLOC_KEYS) {
      if (src === dst) continue;
      const jSrc = blocs[src], jDst = blocs[dst];
      const capDiffAi = Math.max(0, jSrc.aiCap - jDst.aiCap);
      const capDiffRobot = Math.max(0, jSrc.robotCap - jDst.robotCap);
      const leakage = (1 - jSrc.n.alignment * 0.3) * 0.005;
      const absorption = 0.5 + jDst.n.retraining * 0.5;
      inputs[dst].aiCap_boost += capDiffAi * leakage * absorption;
      inputs[dst].robotCap_boost += capDiffRobot * leakage * absorption;
    }
  }
  if (rng() < 0.03 && t > 20) {
    const pairs = [];
    for (let i = 0; i < BLOC_KEYS.length; i++) for (let j = i + 1; j < BLOC_KEYS.length; j++) pairs.push([BLOC_KEYS[i], BLOC_KEYS[j]]);
    let maxGap = 0, bestPair = null;
    for (const [a, b] of pairs) {
      const gap = Math.abs(blocs[a].aiCap - blocs[b].aiCap);
      if (gap > maxGap) { maxGap = gap; bestPair = [a, b]; }
    }
    if (bestPair && maxGap > 0.4) {
      const [a, b] = bestPair;
      const aggScore = (j) => j.aiCap * (1 - j.n.alignment);
      const aggressor = aggScore(blocs[a]) > aggScore(blocs[b]) ? a : b;
      const target = aggressor === a ? b : a;
      const targetDamage = 0.10 + rng() * 0.15;
      const aggCost = 0.03 + rng() * 0.05;
      inputs[target].shock_modifier += targetDamage;
      inputs[aggressor].shock_modifier += aggCost;
      worldEvents.push({ turn: t, type: 'coercion', aggressor, target,
        description: `${BLOCS[aggressor].name} coerced ${BLOCS[target].name} (sanctions / threats / military pressure)` });
    }
  }

  // ── WAR ── Authoritarian + capable regimes can invade weak neighbors.
  // Distinct from coercion: real territorial / resource extraction with mortality.
  // Even Open Market is invadable when weakened (low polStability + capability lag).
  if (t > 15) {
    let bestWarProb = 0, bestWarPair = null, bestIntensityCap = 0;
    for (const src of BLOC_KEYS) {
      for (const dst of BLOC_KEYS) {
        if (src === dst) continue;
        const jSrc = blocs[src], jDst = blocs[dst];
        // Aggression score: requires capability + chip base + low alignment + low political accountability + intact institutions
        const aggression = jSrc.aiCap
                         * (1 - jSrc.n.alignment)
                         * (1 - jSrc.n.politicalResp)
                         * jSrc.endowments.chips
                         * jSrc.institutionalCapacity
                         * 0.15;
        // Target vulnerability: capability gap, weak polity, or resource value worth taking
        const capGap = Math.max(0, 1 - jDst.aiCap / Math.max(0.5, jSrc.aiCap));
        const targetVuln = capGap * 0.5
                         + Math.max(0, 0.6 - jDst.polStability) * 0.4
                         + Math.max(0, jDst.endowments.minerals - 0.8) * 0.3;
        const warProb = aggression * targetVuln * 0.04;
        if (warProb > bestWarProb) {
          bestWarProb = warProb;
          bestWarPair = { src, dst };
          bestIntensityCap = Math.min(1.0, aggression * 1.5 + capGap);
        }
      }
    }
    if (bestWarPair && rng() < bestWarProb) {
      const { src, dst } = bestWarPair;
      const intensity = (0.4 + rng() * 0.5) * bestIntensityCap;
      inputs[dst].warAsTarget = { intensity, aggressor: src };
      inputs[src].warAsAggressor = { intensity, target: dst };
      worldEvents.push({
        turn: t, type: 'war', aggressor: src, target: dst, intensity,
        description: `WAR — ${BLOCS[src].name} invaded ${BLOCS[dst].name} at ${(intensity * 100).toFixed(0)}% intensity`,
      });
    }
  }
  return inputs;
}

function runWorld(allRules, seed) {
  const rng = mulberry32(seed);
  const NUM_TURNS = 150;
  const blocs = {};
  for (const k of BLOC_KEYS) {
    const rules = allRules[k];
    const n = {};
    for (const rk of Object.keys(rules)) n[rk] = rules[rk] / 100;
    const ic = BLOCS[k].initial;
    blocs[k] = {
      key: k, rules, n, endowments: BLOCS[k].endowments,
      aiCap: ic.aiCap + (rng() - 0.5) * 0.04,
      robotCap: ic.robotCap + (rng() - 0.5) * 0.02,
      unemployment: ic.unemployment + (rng() - 0.5) * 0.02,
      medianIncome: ic.medianIncome + (rng() - 0.5) * 0.10,
      gini: ic.gini + (rng() - 0.5) * 0.06,
      polStability: ic.polStability + (rng() - 0.5) * 0.10,
      capitalConc: ic.capitalConc + (rng() - 0.5) * 0.06,
      crisisScar: 0, institutionalCapacity: 1.0,
      cumulativeMortality: 0, history: [], events: [],
    };
  }
  const worldEvents = [];
  for (let t = 1; t <= NUM_TURNS; t++) {
    const inputs = computeInteractions(blocs, t, rng, worldEvents);
    for (const k of BLOC_KEYS) stepBloc(blocs[k], t, rng, inputs[k]);
  }
  const outcomes = {};
  for (const k of BLOC_KEYS) {
    const j = blocs[k];
    const avgMort = j.cumulativeMortality / NUM_TURNS;
    const lifeExpectancy = Math.max(28, Math.min(90, 1 / avgMort));
    const last30 = j.history.slice(-30);
    const avg = (key) => last30.reduce((s, h) => s + h[key], 0) / last30.length;
    const avgGini = avg('gini'), avgUnemp = avg('unemployment'), avgIncome = avg('medianIncome');
    const avgStab = avg('polStability'), avgConc = avg('capitalConc');
    let resolution;
    if (avgStab < 0.30) resolution = 'breakdown';
    else if (avgConc > 0.78 && avgGini > 0.62) resolution = 'rentier';
    else if (k === 'Mosaic' && avgIncome < 0.5 && avgGini > 0.55) resolution = 'extraction';
    else if (avgGini > 0.55 && avgIncome < 0.7) resolution = 'bifurcation';
    else if (avgIncome > 1.4 && avgUnemp < 0.20 && avgGini < 0.45) resolution = 'abundance';
    else resolution = 'redistribution';
    const totalCapitalFlow = j.history.reduce((s, h) => s + h.capitalFlow, 0);
    const totalTalentFlow = j.history.reduce((s, h) => s + h.talentFlow, 0);
    outcomes[k] = {
      key: k, lifeExpectancy: +lifeExpectancy.toFixed(1),
      finalGini: +avgGini.toFixed(3), finalUnemployment: +avgUnemp.toFixed(3),
      finalIncome: +avgIncome.toFixed(3), finalStability: +avgStab.toFixed(3),
      finalConcentration: +avgConc.toFixed(3),
      finalAiCap: +j.history[j.history.length - 1].aiCap.toFixed(2),
      totalCapitalFlow: +totalCapitalFlow.toFixed(2),
      totalTalentFlow: +totalTalentFlow.toFixed(2),
      resolution, history: j.history, events: j.events,
    };
  }
  return { seed, allRules, outcomes, worldEvents };
}

// Strip the heavy per-turn history/events from a world to save memory in big batches
function stripHistory(world) {
  const stripped = { seed: world.seed, allRules: world.allRules, outcomes: {}, worldEvents: world.worldEvents };
  for (const k of BLOC_KEYS) {
    const o = world.outcomes[k];
    stripped.outcomes[k] = {
      key: o.key, lifeExpectancy: o.lifeExpectancy,
      finalGini: o.finalGini, finalUnemployment: o.finalUnemployment,
      finalIncome: o.finalIncome, finalStability: o.finalStability,
      finalConcentration: o.finalConcentration, finalAiCap: o.finalAiCap,
      totalCapitalFlow: o.totalCapitalFlow, totalTalentFlow: o.totalTalentFlow,
      resolution: o.resolution,
      // Drop history (per-turn snapshots) and events (per-bloc events). Kept only on exemplar.
    };
  }
  return stripped;
}

// Async chunked batch runner that yields to the UI between chunks for progress updates
async function runWorldBatchAsync(allRules, n, seedBase = 1000, onProgress) {
  const results = [];
  // First world keeps full history — used as the exemplar in World view
  const exemplar = runWorld(allRules, seedBase);
  results.push(exemplar);
  if (onProgress) onProgress(1, n);
  // Yield to UI
  await new Promise(r => setTimeout(r, 0));
  // Subsequent worlds: stripped to save memory
  const chunkSize = n >= 1000 ? 100 : 25;
  for (let i = 1; i < n; i += chunkSize) {
    const end = Math.min(i + chunkSize, n);
    for (let j = i; j < end; j++) {
      results.push(stripHistory(runWorld(allRules, seedBase + j * 7919)));
    }
    if (onProgress) onProgress(end, n);
    await new Promise(r => setTimeout(r, 0));
  }
  return results;
}

// Synchronous version retained for any caller that doesn't need progress
function runWorldBatch(allRules, n, seedBase = 1000) {
  const results = [];
  for (let i = 0; i < n; i++) {
    const w = runWorld(allRules, seedBase + i * 7919);
    results.push(i === 0 ? w : stripHistory(w));
  }
  return results;
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function percentile(arr, p) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.max(0, Math.min(s.length - 1, Math.floor(p * s.length)))];
}

function generateWorldStory(world) {
  const { outcomes, worldEvents } = world;
  const paragraphs = [];

  // Helper: snapshot a bloc at a given turn (1-indexed)
  const snap = (k, turn) => outcomes[k].history[Math.min(turn - 1, outcomes[k].history.length - 1)];

  // ─── P1: Early capability divergence (year 30 snapshot) ───
  const earlyTurn = 30;
  const t30 = {};
  for (const k of BLOC_KEYS) t30[k] = snap(k, earlyTurn);
  const sortedAi = [...BLOC_KEYS].sort((a, b) => t30[b].aiCap - t30[a].aiCap);
  const leader = sortedAi[0], lag = sortedAi[3];
  const gapRatio = t30[leader].aiCap / Math.max(0.05, t30[lag].aiCap);
  paragraphs.push(
    `Year ${earlyTurn}: ${BLOCS[leader].name} leads on AI capability at ${t30[leader].aiCap.toFixed(2)}×, ` +
    `${BLOCS[leader].endowments.chips > 1 ? 'leveraging chip dominance' : 'pushing capability hard despite weaker fab'}. ` +
    `${BLOCS[lag].name} trails at ${t30[lag].aiCap.toFixed(2)}× — a ${gapRatio.toFixed(1)}× gap that will compound.`
  );

  // ─── P2: Crisis log from per-bloc events ───
  const allEvents = [];
  for (const k of BLOC_KEYS) {
    for (const e of outcomes[k].events) allEvents.push({ ...e, bloc: k });
  }
  allEvents.sort((a, b) => a.turn - b.turn);
  const significantTypes = new Set(['crisis', 'catastrophe', 'food_crisis', 'shock']);
  const crisisEvents = allEvents.filter(e => significantTypes.has(e.type));
  if (crisisEvents.length > 0) {
    const sample = crisisEvents.slice(0, Math.min(5, crisisEvents.length));
    const lines = sample.map(e => `Y${e.turn} ${BLOCS[e.bloc].name}: ${e.description.toLowerCase()}`);
    paragraphs.push(
      `Crisis log — ${lines.join(' / ')}${crisisEvents.length > 5 ? ` (+${crisisEvents.length - 5} more)` : ''}.`
    );
  } else {
    paragraphs.push(`No major bloc-level crises recorded. Institutions absorbed the AI shock without rupture — or the rupture was diffuse enough to not register as a discrete event.`);
  }

  // ─── P3: Inter-bloc dynamics — capital, talent, coercion ───
  const flowSummary = BLOC_KEYS.map(k => ({
    bloc: k,
    capital: outcomes[k].totalCapitalFlow,
    talent: outcomes[k].totalTalentFlow,
  }));
  const capWinner = flowSummary.reduce((a, b) => a.capital > b.capital ? a : b);
  const capLoser = flowSummary.reduce((a, b) => a.capital < b.capital ? a : b);
  const talentWinner = flowSummary.reduce((a, b) => a.talent > b.talent ? a : b);
  const talentLoser = flowSummary.reduce((a, b) => a.talent < b.talent ? a : b);
  let inter = '';
  if (Math.abs(capWinner.capital) > 0.1 || Math.abs(capLoser.capital) > 0.1) {
    inter += `Capital sought low-tax sanctuary: ${BLOCS[capWinner.bloc].name} gained ${capWinner.capital > 0 ? '+' : ''}${capWinner.capital.toFixed(2)}, ${BLOCS[capLoser.bloc].name} lost ${capLoser.capital.toFixed(2)}. `;
  } else {
    inter += `Capital flows stayed muted — tax differentials were too narrow to drive significant relocation. `;
  }
  if (Math.abs(talentLoser.talent) > 0.05) {
    inter += `Talent migrated toward ${BLOCS[talentWinner.bloc].name} (+${talentWinner.talent.toFixed(2)}); ${BLOCS[talentLoser.bloc].name} suffered brain drain (${talentLoser.talent.toFixed(2)}). `;
  }
  if (worldEvents.length > 0) {
    const wars = worldEvents.filter(e => e.type === 'war');
    const coercions = worldEvents.filter(e => e.type === 'coercion');
    if (wars.length > 0) {
      const topWarBy = {};
      for (const w of wars) topWarBy[w.aggressor] = (topWarBy[w.aggressor] || 0) + 1;
      const topAggressor = Object.entries(topWarBy).sort((a, b) => b[1] - a[1])[0];
      const warList = wars.slice(0, 3).map(w =>
        `Y${w.turn} ${BLOCS[w.aggressor].name}→${BLOCS[w.target].name} (${(w.intensity * 100).toFixed(0)}%)`
      ).join(', ');
      inter += `${wars.length} war${wars.length > 1 ? 's' : ''} broke out: ${warList}${wars.length > 3 ? ` +${wars.length - 3} more` : ''}. ${BLOCS[topAggressor[0]].name} was the chief aggressor. `;
    }
    if (coercions.length > 0) {
      inter += `${coercions.length} non-military coercion event${coercions.length > 1 ? 's' : ''} (sanctions, threats, pressure). `;
    }
    if (wars.length === 0 && coercions.length === 0) {
      inter += `No inter-bloc conflict — capability gaps and political configurations stayed below the threshold where coercion or invasion becomes worthwhile.`;
    }
  } else {
    inter += `No inter-bloc conflict — capability gaps and political configurations stayed below the threshold where coercion or invasion becomes worthwhile.`;
  }
  paragraphs.push(inter);

  // ─── P4: Final outcomes per bloc ───
  const ranked = BLOC_KEYS.map(k => ({ k, ...outcomes[k] })).sort((a, b) => b.lifeExpectancy - a.lifeExpectancy);
  const endgame = ranked.map(r => {
    const res = RESOLUTION_INFO[r.resolution];
    return `${BLOCS[r.k].name} ${r.lifeExpectancy} yrs (${res.name}, Gini ${r.finalGini.toFixed(2)}, unemp ${(r.finalUnemployment * 100).toFixed(0)}%)`;
  });
  paragraphs.push(`Year 150 — ${endgame.join('; ')}.`);

  // ─── P5: Takeaway based on the gap ───
  const gap = ranked[0].lifeExpectancy - ranked[3].lifeExpectancy;
  let takeaway = '';
  if (gap > 20) {
    takeaway = `Brutal divergence: ${gap.toFixed(0)}-year life expectancy gap between best and worst. The AI shock did not raise all boats — it sorted them.`;
  } else if (gap > 10) {
    takeaway = `Meaningful divide: ${gap.toFixed(0)} years separating best from worst. Institutions decided who absorbed the shock and who broke under it.`;
  } else if (gap > 5) {
    takeaway = `Modest divergence: ${gap.toFixed(0)}-year spread. Different paths converged on similar outcomes — the rules mattered less than expected, or all four found ways to muddle through.`;
  } else {
    takeaway = `Striking convergence: only ${gap.toFixed(0)} years between best and worst. Either the shock was absorbed broadly or the floor was reached together.`;
  }
  paragraphs.push(takeaway);

  return paragraphs;
}

// ═══ Main component ═════════════════════════════════════════════
export default function App() {
  const [allRules, setAllRules] = useState(() => {
    const r = {};
    for (const k of BLOC_KEYS) r[k] = { ...BLOCS[k].rules };
    return r;
  });
  const [scenarioName, setScenarioName] = useState('Default presets');
  const [activeBloc, setActiveBloc] = useState('OM');
  const [tab, setTab] = useState('setup');
  const [singleResult, setSingleResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [bootSeq, setBootSeq] = useState({ active: false, year: 0, message: '', mode: 'single' });
  const fileInputRef = useRef(null);

  const isModified = useMemo(() => {
    for (const k of BLOC_KEYS) {
      for (const rk of Object.keys(BLOCS[k].rules)) {
        if (allRules[k][rk] !== BLOCS[k].rules[rk]) return true;
      }
    }
    return false;
  }, [allRules]);

  const setRule = (blocKey, ruleId, val) => {
    setAllRules(prev => ({ ...prev, [blocKey]: { ...prev[blocKey], [ruleId]: val } }));
    setSingleResult(null); setBatchResults(null);
  };

  const resetBloc = (k) => {
    setAllRules(prev => ({ ...prev, [k]: { ...BLOCS[k].rules } }));
    setSingleResult(null); setBatchResults(null);
  };

  const resetAll = () => {
    const r = {};
    for (const k of BLOC_KEYS) r[k] = { ...BLOCS[k].rules };
    setAllRules(r);
    setScenarioName('Default presets');
    setSingleResult(null); setBatchResults(null);
  };

  // Single-world boot: pre-compute, then animate year ticker for visual flair
  const runSingle = () => {
    setRunning(true);
    setBootSeq({ active: true, year: 0, progress: 0, total: 0, message: 'INITIALIZING WORLD...', mode: 'single' });
    requestAnimationFrame(() => {
      const seed = Math.floor(Math.random() * 100000);
      const result = runWorld(allRules, seed);
      let year = 0;
      const ticker = setInterval(() => {
        year += 6;
        if (year >= 150) {
          clearInterval(ticker);
          setBootSeq(prev => ({ ...prev, year: 150, message: 'GENERATING REPORT...' }));
          setTimeout(() => {
            setBootSeq({ active: false, year: 0, progress: 0, total: 0, message: '', mode: 'single' });
            setSingleResult(result);
            setTab('story');
            setRunning(false);
          }, 250);
        } else {
          setBootSeq(prev => ({ ...prev, year, message: `SIMULATING · YEAR ${year}` }));
        }
      }, 40);
    });
  };

  // Batch: chunked async with live progress display
  const runBatch_ = async (n) => {
    setRunning(true);
    setBootSeq({ active: true, year: 0, progress: 0, total: n, message: `RUNNING ${n} STOCHASTIC WORLDS...`, mode: 'batch' });
    // Defer one frame so overlay paints
    await new Promise(r => requestAnimationFrame(r));
    const result = await runWorldBatchAsync(allRules, n, 1000, (done, total) => {
      setBootSeq(prev => ({ ...prev, progress: done, total, message: `WORLDS · ${done} / ${total}` }));
    });
    setBootSeq(prev => ({ ...prev, message: 'AGGREGATING DISTRIBUTIONS...' }));
    await new Promise(r => setTimeout(r, 200));
    setBootSeq({ active: false, year: 0, progress: 0, total: 0, message: '', mode: 'batch' });
    setBatchResults(result);
    setTab('distribution');
    setRunning(false);
  };

  // Apply a saved scenario's rule overrides to the live rules and switch to Setup
  const applyScenario = (overrides, scenarioName) => {
    setAllRules(prev => {
      const next = {};
      for (const k of BLOC_KEYS) {
        next[k] = { ...BLOCS[k].rules, ...(overrides[k] || {}) };
      }
      return next;
    });
    setScenarioName(scenarioName || 'Custom scenario');
    setSingleResult(null); setBatchResults(null);
    setTab('setup');
  };

  const exportRules = () => {
    const data = { name: scenarioName, allRules, exportedAt: new Date().toISOString(), version: '0.5' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenarioName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.lifelines.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.allRules && typeof data.allRules === 'object') {
          const validated = {};
          for (const rk of BLOC_KEYS) {
            validated[rk] = {};
            for (const ruleKey of Object.keys(BLOCS[rk].rules)) {
              const v = data.allRules[rk]?.[ruleKey];
              validated[rk][ruleKey] = (typeof v === 'number' && v >= 0 && v <= 100) ? v : BLOCS[rk].rules[ruleKey];
            }
          }
          setAllRules(validated);
          setScenarioName(data.name || 'Imported scenario');
          setSingleResult(null); setBatchResults(null);
        } else alert('Invalid scenario file');
      } catch (err) { alert('Invalid JSON: ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="ll grid-bg">
      <style>{CSS}</style>
      <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImportFile} style={{ display: 'none' }} />

      {bootSeq.active && <BootOverlay year={bootSeq.year} progress={bootSeq.progress} total={bootSeq.total} message={bootSeq.message} mode={bootSeq.mode} />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-5">
        <header className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="pixel text-2xl md:text-3xl neon" style={{ color: '#ff006e', lineHeight: 1.1 }}>LIFELINES</h1>
              <span className="stamp" style={{ color: '#00f0ff' }}>v0.5 · 4-bloc</span>
              <button
                className="btn btn-sm"
                onClick={() => setTab('manual')}
                style={{
                  background: tab === 'manual' ? 'rgba(255,190,11,0.20)' : 'rgba(255,190,11,0.08)',
                  borderColor: '#ffbe0b',
                  color: '#ffbe0b',
                  textShadow: '0 0 6px #ffbe0b80',
                }}>
                <BookMarked size={12} /> Manual
              </button>
              <button
                className="btn btn-sm"
                onClick={() => setTab('findings')}
                style={{
                  background: tab === 'findings' ? 'rgba(6,255,165,0.22)' : 'rgba(6,255,165,0.10)',
                  borderColor: '#06ffa5',
                  color: '#06ffa5',
                  textShadow: '0 0 8px #06ffa580',
                  fontWeight: 600,
                }}>
                <Sparkles size={12} /> Findings
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                <Upload size={11} /> Import
              </button>
              <button className="btn btn-secondary btn-sm" onClick={exportRules}>
                <Download size={11} /> Export
              </button>
              <button className="btn btn-ghost btn-sm" onClick={resetAll} disabled={!isModified}>
                <RotateCcw size={11} /> Reset all
              </button>
            </div>
          </div>
          {!(tab === 'manual' || tab === 'findings') && (
            <>
              <p className="text-muted text-sm max-w-3xl mb-2 crt" style={{ fontSize: 16 }}>
                ▶ Four blocs face the same AI shock. Capital flows between them, talent migrates, capabilities leak,
                tensions erupt into coercion or war. Calibrated to real-world baselines: developed liberal ~76, coordinated welfare ~78, authoritarian ~71, fragmented periphery ~67.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-faint crt uppercase" style={{ fontSize: 14, letterSpacing: '0.1em' }}>Scenario:</label>
                <input type="text" value={scenarioName} onChange={e => setScenarioName(e.target.value)}
                  style={{ minWidth: '240px' }} />
                {isModified && <span className="pill neon-soft" style={{ background: 'rgba(255,0,110,0.15)', color: '#ff006e' }}>MODIFIED</span>}
              </div>
            </>
          )}
        </header>

        {(tab === 'manual' || tab === 'findings') ? (
          <DocLayout tab={tab} setTab={setTab}>
            {tab === 'manual' && <ManualView />}
            {tab === 'findings' && <FindingsView applyScenario={applyScenario} />}
          </DocLayout>
        ) : (
          <>
            {/* 4 bloc tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-0">
              {BLOC_KEYS.map(k => {
                const bloc = BLOCS[k];
                const isActive = k === activeBloc;
                const isMod = Object.keys(bloc.rules).some(rk => allRules[k][rk] !== bloc.rules[rk]);
                const lastResult = singleResult?.outcomes[k] ||
                  (batchResults ? { lifeExpectancy: median(batchResults.map(b => b.outcomes[k].lifeExpectancy)) } : null);
                return (
                  <button key={k} className={`bloc-tab ${isActive ? 'active' : ''}`}
                    style={{ '--bloc-color': bloc.color }}
                    onClick={() => setActiveBloc(k)}>
                    <div className="flex items-baseline justify-between gap-1 mb-0.5">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span style={{ color: bloc.color, fontSize: '14px', flexShrink: 0 }}>{bloc.icon}</span>
                        <span className="name pixel" style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bloc.name}</span>
                      </div>
                      {isMod && <span className="pill" style={{ background: bloc.color + '33', color: bloc.color, fontSize: 10, padding: '1px 5px' }}>edit</span>}
                    </div>
                    <div className="text-faint crt" style={{ fontSize: 13 }}>{bloc.subtitle}</div>
                    {lastResult && (
                      <div className="mt-1 crt neon-soft" style={{ color: bloc.color, fontSize: 22, lineHeight: 1 }}>
                        {lastResult.lifeExpectancy.toFixed(1)}<span className="text-muted" style={{ fontSize: 12 }}> yrs</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body grid */}
            <div className="grid grid-cols-12 gap-3 mt-3">
              <aside className="col-span-12 lg:col-span-4">
                <div className="panel panel-glow" style={{ '--glow-color': BLOCS[activeBloc].color + '40' }}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div>
                      <h2 className="pixel" style={{ color: BLOCS[activeBloc].color, fontSize: '13px' }}>
                        {BLOCS[activeBloc].icon} {BLOCS[activeBloc].name}
                      </h2>
                      <div className="text-muted crt" style={{ fontSize: 14 }}>{BLOCS[activeBloc].subtitle}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => resetBloc(activeBloc)}>
                      <RotateCcw size={10} /> Reset
                    </button>
                  </div>
                  <p className="text-muted mb-2 leading-snug" style={{ fontSize: 13 }}>{BLOCS[activeBloc].description}</p>
                  <p className="text-faint crt mb-3" style={{ fontSize: 13 }}>▸ {BLOCS[activeBloc].archetype}</p>
                  <div className="space-y-1.5 scrollbar overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                    {RULE_DEFS.map(def => (
                      <RuleCard key={def.id} def={def} value={allRules[activeBloc][def.id]}
                        defaultValue={BLOCS[activeBloc].rules[def.id]}
                        onChange={v => setRule(activeBloc, def.id, v)} />
                    ))}
                  </div>
                </div>
              </aside>

              <main className="col-span-12 lg:col-span-8">
                <div className="flex items-center gap-1 border-b flex-wrap" style={{ borderColor: 'rgba(0,240,255,0.25)' }}>
                  <button className={`tab-btn ${tab === 'setup' ? 'active' : ''}`} onClick={() => setTab('setup')}>
                    <BookOpen size={11} className="inline mr-1" />Setup
                  </button>
                  <button className={`tab-btn ${tab === 'story' ? 'active' : ''}`} onClick={() => setTab('story')} disabled={!singleResult}>
                    <FileText size={11} className="inline mr-1" />Story
                  </button>
                  <button className={`tab-btn ${tab === 'distribution' ? 'active' : ''}`} onClick={() => setTab('distribution')} disabled={!batchResults}>
                    <BarChart3 size={11} className="inline mr-1" />Distribution
                  </button>
                  <button className={`tab-btn ${tab === 'world' ? 'active' : ''}`} onClick={() => setTab('world')} disabled={!singleResult && !batchResults}>
                    <Globe size={11} className="inline mr-1" />World
                  </button>
                </div>

                <div className="mt-3">
                  {tab === 'setup' && <SetupView runSingle={runSingle} runBatch={runBatch_} running={running} />}
                  {tab === 'story' && singleResult && <StoryView world={singleResult} />}
                  {tab === 'distribution' && batchResults && <DistributionView results={batchResults} scenarioName={scenarioName} />}
                  {tab === 'world' && (singleResult || batchResults) &&
                    <WorldView world={singleResult || batchResults[0]} />}
                </div>
              </main>
            </div>
          </>
        )}

        <footer className="mt-8 pt-4 border-t crt text-faint text-center" style={{ borderColor: 'rgba(0,240,255,0.2)', fontSize: 14 }}>
          ▷ Calibrated to real-world baselines. Directed Order and Mosaic figures stat-credibility adjusted.
          All assumptions configurable via rules. The model code is the model claim.
        </footer>
      </div>
    </div>
  );
}

function RuleCard({ def, value, defaultValue, onChange }) {
  const Icon = def.icon;
  const changed = value !== defaultValue;
  const labelKeys = Object.keys(def.labels).map(Number).sort((a, b) => a - b);
  const currentLabel = labelKeys.reduce((acc, k) => Math.abs(k - value) < Math.abs(acc - value) ? k : acc, labelKeys[0]);
  return (
    <div className={`rule-card ${changed ? 'changed' : ''}`} style={{ '--rule-color': def.color }}>
      <div className="flex items-start gap-1.5 mb-1">
        <Icon size={13} style={{ color: def.color, flexShrink: 0, marginTop: '2px' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-semibold leading-tight" style={{ fontSize: 12 }}>{def.name}</h3>
            <span className="crt neon-soft" style={{ color: def.color, fontSize: 16, fontWeight: 700 }}>{value}</span>
          </div>
          <p className="text-muted leading-snug" style={{ fontSize: 11 }}>{def.description}</p>
        </div>
      </div>
      <input type="range" min="0" max="100" step="1" value={value} onChange={e => onChange(+e.target.value)} style={{ '--rule-color': def.color }} />
      <div className="flex justify-between items-center mt-0.5">
        <span className="text-faint crt" style={{ fontSize: 12 }}>{def.labels[currentLabel]}</span>
        {changed && <span className="crt text-faint" style={{ fontSize: 12 }}>{value > defaultValue ? '+' : ''}{value - defaultValue}</span>}
      </div>
    </div>
  );
}

function SetupView({ runSingle, runBatch, running }) {
  return (
    <div className="fade-in space-y-3">
      <div className="panel">
        <h2 className="pixel mb-2 neon-soft" style={{ color: '#ff006e', fontSize: 14 }}>FOUR BLOCS · ONE SHOCK</h2>
        <p className="text-muted leading-relaxed mb-3" style={{ fontSize: 13 }}>
          Each bloc starts at its real-world calibrated baseline. The same AI capability shock affects all four.
          What differs is how their institutions respond — and how they affect each other through capital flows,
          talent migration, capability spillover, and occasional coercion.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 mt-3">
          <RunOption title="Single world" subtitle="One playthrough"
            desc="Get a story. See how four blocs navigate the same shock differently."
            icon={<Play size={14} />} accent="#ff006e" onClick={runSingle} running={running} />
          <RunOption title="100 worlds" subtitle="Quick distribution"
            desc="See the spread of outcomes for each bloc — fast feedback."
            icon={<FastForward size={14} />} accent="#00f0ff" onClick={() => runBatch(100)} running={running} />
          <RunOption title="1,000 worlds" subtitle="Solid distribution"
            desc="Tighter estimates. ~3-5s. Recommended for most design decisions."
            icon={<Target size={14} />} accent="#06ffa5" onClick={() => runBatch(1000)} running={running} />
          <RunOption title="10,000 worlds" subtitle="Publication-quality"
            desc="Full distribution shape including tails. ~30-60s. Run before serious claims."
            icon={<BarChart3 size={14} />} accent="#ffbe0b" onClick={() => runBatch(10000)} running={running} />
        </div>
      </div>

      <div className="panel">
        <h3 className="pixel mb-2" style={{ color: '#00f0ff', fontSize: 11 }}>THE FOUR BLOCS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {BLOC_KEYS.map(k => {
            const r = BLOCS[k];
            return (
              <div key={k} style={{ borderLeft: `4px solid ${r.color}`, padding: '8px 12px', background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
                <h4 className="pixel" style={{ color: r.color, fontSize: 11 }}>{r.icon} {r.name}</h4>
                <div className="text-muted crt" style={{ fontSize: 13 }}>{r.subtitle}</div>
                <p className="text-muted mt-1.5 leading-snug" style={{ fontSize: 12 }}>{r.description}</p>
                <p className="text-faint crt mt-1.5" style={{ fontSize: 12 }}>▸ {r.archetype}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RunOption({ title, subtitle, desc, icon, accent, onClick, running }) {
  return (
    <button onClick={onClick} disabled={running} className="text-left p-3 transition-all"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${accent}40`,
        borderTop: `3px solid ${accent}`,
        cursor: running ? 'wait' : 'pointer', opacity: running ? 0.5 : 1
      }}
      onMouseEnter={e => !running && (e.currentTarget.style.boxShadow = `0 0 16px ${accent}50`)}
      onMouseLeave={e => !running && (e.currentTarget.style.boxShadow = 'none')}>
      <div className="flex items-center gap-1.5 mb-1" style={{ color: accent }}>
        {icon}<h4 className="pixel" style={{ fontSize: 11 }}>{title}</h4>
      </div>
      <p className="crt text-muted mb-1.5 uppercase" style={{ fontSize: 13, letterSpacing: '0.1em' }}>{subtitle}</p>
      <p className="text-muted leading-snug" style={{ fontSize: 12 }}>{desc}</p>
      {running && <p className="crt mt-1.5" style={{ color: accent, fontSize: 14, animation: 'flicker 1s infinite' }}>▶ Running...</p>}
    </button>
  );
}

function StoryView({ world }) {
  const story = useMemo(() => generateWorldStory(world), [world]);
  const trajectoryData = world.outcomes.OM.history.map((h, i) => ({
    turn: h.turn,
    OM: world.outcomes.OM.history[i].medianIncome,
    SC: world.outcomes.SC.history[i].medianIncome,
    DO: world.outcomes.DO.history[i].medianIncome,
    Mosaic: world.outcomes.Mosaic.history[i].medianIncome,
  }));
  return (
    <div className="fade-in space-y-3">
      <div className="panel">
        <h2 className="pixel mb-2 neon-soft" style={{ color: '#ff006e', fontSize: 14 }}>WORLD REPORT</h2>
        <div className="space-y-3 leading-relaxed crt" style={{ fontSize: 16 }}>
          {story.map((p, i) => <p key={i}>▸ {p}</p>)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {BLOC_KEYS.map(k => {
          const o = world.outcomes[k];
          const r = BLOCS[k];
          const res = RESOLUTION_INFO[o.resolution];
          return (
            <div key={k} className="panel" style={{ borderTop: `3px solid ${r.color}`, padding: 11 }}>
              <div className="flex items-baseline justify-between mb-0.5">
                <h3 className="pixel" style={{ color: r.color, fontSize: 10 }}>{r.icon} {r.name}</h3>
              </div>
              <div className="crt neon-soft" style={{ color: r.color, fontSize: 26, lineHeight: 1 }}>
                {o.lifeExpectancy}<span className="text-muted" style={{ fontSize: 12 }}> yrs</span>
              </div>
              <div className="pill mt-1.5 mb-1" style={{ background: res.color + '22', color: res.color }}>
                {res.icon} {res.name}
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5">
                <Stat label="Gini" value={o.finalGini.toFixed(2)} highlight={o.finalGini > 0.6 ? '#ff006e' : null} />
                <Stat label="Unemp" value={`${(o.finalUnemployment * 100).toFixed(0)}%`} highlight={o.finalUnemployment > 0.30 ? '#ff006e' : null} />
                <Stat label="Income" value={o.finalIncome.toFixed(2)} highlight={o.finalIncome < 0.7 ? '#ff006e' : null} />
                <Stat label="Stab" value={`${(o.finalStability * 100).toFixed(0)}%`} highlight={o.finalStability < 0.4 ? '#ff006e' : null} />
                <Stat label="AI cap" value={o.finalAiCap.toFixed(1) + '×'} />
                <Stat label="Cap flow" value={(o.totalCapitalFlow > 0 ? '+' : '') + o.totalCapitalFlow.toFixed(1)}
                  highlight={o.totalCapitalFlow < -0.5 ? '#ff006e' : (o.totalCapitalFlow > 0.5 ? '#06ffa5' : null)} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <h3 className="pixel mb-2" style={{ color: '#00f0ff', fontSize: 11 }}>MEDIAN INCOME · 4 BLOCS · 150 YEARS</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <ComposedChart data={trajectoryData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="rgba(0,240,255,0.10)" strokeDasharray="2 4" />
              <XAxis dataKey="turn" tick={{ fontSize: 11, fontFamily: 'VT323', fill: '#f0e6d2' }} stroke="rgba(240,230,210,0.3)" />
              <YAxis tick={{ fontSize: 11, fontFamily: 'VT323', fill: '#f0e6d2' }} stroke="rgba(240,230,210,0.3)" />
              <Tooltip contentStyle={{ background: '#0a0e27', border: '1px solid #00f0ff', fontFamily: 'VT323', fontSize: 13, color: '#f0e6d2' }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'VT323' }} />
              {BLOC_KEYS.map(k => (
                <Line key={k} type="monotone" dataKey={k} stroke={BLOCS[k].color} strokeWidth={2} dot={false} name={BLOCS[k].name} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className="text-faint crt uppercase" style={{ fontSize: 11, letterSpacing: '0.08em' }}>{label}</div>
      <div className="crt" style={{ color: highlight || '#f0e6d2', fontSize: 14 }}>{value}</div>
    </div>
  );
}

function DistributionView({ results, scenarioName }) {
  const histData = useMemo(() => {
    const data = [];
    for (let bin = 30; bin < 90; bin += 2.5) {
      const entry = { binCenter: bin + 1.25 };
      for (const k of BLOC_KEYS) {
        const lifes = results.map(r => r.outcomes[k].lifeExpectancy);
        entry[k] = lifes.filter(le => le >= bin && le < bin + 2.5).length;
      }
      data.push(entry);
    }
    return data;
  }, [results]);

  const stats = BLOC_KEYS.reduce((acc, k) => {
    const lifes = results.map(r => r.outcomes[k].lifeExpectancy);
    let mn = Infinity, mx = -Infinity;
    for (const v of lifes) { if (v < mn) mn = v; if (v > mx) mx = v; }
    acc[k] = {
      median: median(lifes), p5: percentile(lifes, 0.05), p95: percentile(lifes, 0.95),
      min: mn, max: mx,
    };
    return acc;
  }, {});

  const resolutionCounts = BLOC_KEYS.reduce((acc, k) => {
    acc[k] = {};
    for (const r of results) {
      const res = r.outcomes[k].resolution;
      acc[k][res] = (acc[k][res] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="fade-in space-y-3">
      <div className="panel">
        <h2 className="pixel mb-1 neon-soft" style={{ color: '#ff006e', fontSize: 14 }}>DISTRIBUTION · "{scenarioName}"</h2>
        <p className="text-muted crt mb-3" style={{ fontSize: 14 }}>▸ {results.length} stochastic worlds. Each color is one bloc's distribution of life expectancy.</p>

        <div style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={histData} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid stroke="rgba(0,240,255,0.10)" strokeDasharray="2 4" />
              <XAxis dataKey="binCenter" tick={{ fontSize: 11, fontFamily: 'VT323', fill: '#f0e6d2' }} stroke="rgba(240,230,210,0.3)"
                label={{ value: 'Life expectancy (years)', position: 'insideBottom', offset: -8, fontSize: 13, fontFamily: 'VT323', fill: '#f0e6d2' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'VT323', fill: '#f0e6d2' }} stroke="rgba(240,230,210,0.3)"
                label={{ value: 'count', angle: -90, position: 'insideLeft', fontSize: 13, fontFamily: 'VT323', fill: '#f0e6d2' }} />
              <Tooltip contentStyle={{ background: '#0a0e27', border: '1px solid #00f0ff', fontFamily: 'VT323', fontSize: 13, color: '#f0e6d2' }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'VT323' }} />
              {BLOC_KEYS.map(k => (
                <Bar key={k} dataKey={k} name={BLOCS[k].name} fill={BLOCS[k].color} fillOpacity={0.65} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BLOC_KEYS.map(k => {
          const r = BLOCS[k];
          const s = stats[k];
          const counts = resolutionCounts[k];
          return (
            <div key={k} className="panel" style={{ borderTop: `3px solid ${r.color}` }}>
              <h3 className="pixel" style={{ color: r.color, fontSize: 12 }}>{r.icon} {r.name}</h3>
              <div className="text-muted crt" style={{ fontSize: 13 }}>{r.subtitle}</div>
              <div className="crt neon-soft mt-1" style={{ color: r.color, fontSize: 30, lineHeight: 1 }}>
                {s.median.toFixed(1)}<span className="text-muted" style={{ fontSize: 13 }}> yrs median</span>
              </div>
              <div className="crt text-muted mt-1" style={{ fontSize: 13 }}>
                p5: {s.p5.toFixed(1)} · p95: {s.p95.toFixed(1)}<br />
                range: {s.min.toFixed(1)}–{s.max.toFixed(1)}
              </div>
              <div className="my-2" style={{ height: 1, background: 'linear-gradient(to right, transparent, ' + r.color + '60, transparent)' }} />
              <div className="text-faint crt mb-1 uppercase" style={{ fontSize: 12, letterSpacing: '0.08em' }}>Resolutions</div>
              <div className="space-y-0.5">
                {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([res, count]) => {
                  const ri = RESOLUTION_INFO[res];
                  const pct = (count / results.length) * 100;
                  return (
                    <div key={res} className="flex items-center gap-2 crt" style={{ fontSize: 14 }}>
                      <span style={{ color: ri.color, minWidth: 10 }}>{ri.icon}</span>
                      <span className="flex-1">{ri.name}</span>
                      <span className="text-muted">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorldView({ world }) {
  const flows = BLOC_KEYS.map(k => ({
    bloc: BLOCS[k],
    capital: world.outcomes[k].totalCapitalFlow,
    talent: world.outcomes[k].totalTalentFlow,
    aiCap: world.outcomes[k].finalAiCap,
  }));
  const flowData = world.outcomes.OM.history.map((h, i) => ({
    turn: h.turn,
    OM: world.outcomes.OM.history[i].capitalFlow,
    SC: world.outcomes.SC.history[i].capitalFlow,
    DO: world.outcomes.DO.history[i].capitalFlow,
    Mosaic: world.outcomes.Mosaic.history[i].capitalFlow,
  }));

  return (
    <div className="fade-in space-y-3">
      <div className="panel">
        <h2 className="pixel mb-2 neon-soft" style={{ color: '#ff006e', fontSize: 14 }}>WORLD VIEW · INTER-BLOC DYNAMICS</h2>
        <h3 className="pixel mb-2" style={{ color: '#00f0ff', fontSize: 10 }}>CUMULATIVE FLOWS · 150 YEARS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
          {flows.map(f => (
            <div key={f.bloc.id} className="p-2.5" style={{
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${f.bloc.color}30`,
              borderLeft: `3px solid ${f.bloc.color}`
            }}>
              <h4 className="pixel" style={{ color: f.bloc.color, fontSize: 10 }}>{f.bloc.icon} {f.bloc.name}</h4>
              <div className="mt-1.5 space-y-0.5 crt" style={{ fontSize: 14 }}>
                <FlowRow icon={<Coins size={11} />} label="Capital flow" value={f.capital} good={f.capital > 0.05} bad={f.capital < -0.05} />
                <FlowRow icon={<Users size={11} />} label="Talent flow" value={f.talent} good={f.talent > 0.05} bad={f.talent < -0.05} />
                <div className="flex justify-between">
                  <span className="text-muted flex items-center gap-1"><Cpu size={11} /> Final AI cap:</span>
                  <span style={{ color: f.bloc.color }}>{f.aiCap.toFixed(2)}×</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {world.worldEvents && world.worldEvents.length > 0 ? (
          <>
            <h3 className="pixel mb-2 mt-3 flex items-center gap-2" style={{ color: '#ff006e', fontSize: 10 }}>
              <ArrowRightLeft size={11} /> CONFLICT EVENTS · {world.worldEvents.length}
            </h3>
            <div className="space-y-1 scrollbar overflow-y-auto" style={{ maxHeight: 200 }}>
              {world.worldEvents.map((e, i) => {
                const isWar = e.type === 'war';
                const color = isWar ? '#ff006e' : '#ff8500';
                const bg = isWar ? 'rgba(255,0,110,0.18)' : 'rgba(255,133,0,0.18)';
                return (
                  <div key={i} className="flex items-baseline gap-2 crt py-0.5" style={{ fontSize: 13, borderBottom: `1px solid ${color}26` }}>
                    <span className="text-muted" style={{ minWidth: 36 }}>y{e.turn}</span>
                    <span className="pill neon-soft" style={{ background: bg, color, fontSize: 11 }}>{isWar ? '⚔ WAR' : 'coercion'}</span>
                    <span className="flex-1" style={isWar ? { color: '#ff006e' } : {}}>{e.description}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-muted crt mt-3" style={{ fontSize: 14 }}>
            ▷ No major conflict events. The four blocs coexisted without significant pressure or invasion.
          </p>
        )}
      </div>

      <div className="panel">
        <h3 className="pixel mb-2" style={{ color: '#00f0ff', fontSize: 11 }}>CAPITAL FLOW · PER TURN</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <ComposedChart data={flowData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="rgba(0,240,255,0.10)" strokeDasharray="2 4" />
              <XAxis dataKey="turn" tick={{ fontSize: 11, fontFamily: 'VT323', fill: '#f0e6d2' }} stroke="rgba(240,230,210,0.3)" />
              <YAxis tick={{ fontSize: 11, fontFamily: 'VT323', fill: '#f0e6d2' }} stroke="rgba(240,230,210,0.3)" />
              <ReferenceLine y={0} stroke="#f0e6d2" strokeWidth={1} />
              <Tooltip contentStyle={{ background: '#0a0e27', border: '1px solid #00f0ff', fontFamily: 'VT323', fontSize: 13, color: '#f0e6d2' }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'VT323' }} />
              {BLOC_KEYS.map(k => (
                <Line key={k} type="monotone" dataKey={k} stroke={BLOCS[k].color} strokeWidth={2} dot={false} name={BLOCS[k].name} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-muted crt mt-1.5" style={{ fontSize: 13 }}>
          ▸ Positive = inflow (gain), negative = outflow (loss). Capital flows from high-tax to low-tax, weighted by openness, stability, and resource pull.
        </p>
      </div>
    </div>
  );
}

function FlowRow({ icon, label, value, good, bad }) {
  const color = good ? '#06ffa5' : bad ? '#ff006e' : 'rgba(240,230,210,0.6)';
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted flex items-center gap-1">{icon} {label}:</span>
      <span style={{ color }}>{value > 0 ? '+' : ''}{value.toFixed(2)}</span>
    </div>
  );
}

// ─── Boot sequence overlay ───
function BootOverlay({ year, progress, total, message, mode }) {
  // For single mode: show year ticker. For batch mode: show worlds completed.
  const isBatch = mode === 'batch';
  const bigNumber = isBatch ? progress : year;
  const bigDenom = isBatch ? total : 150;
  const bigLabel = isBatch ? 'WORLDS' : 'YEAR';
  const pct = bigDenom > 0 ? (bigNumber / bigDenom) * 100 : 0;
  const formatted = isBatch
    ? String(bigNumber).padStart(String(total).length, '0')
    : String(bigNumber).padStart(3, '0');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10,14,39,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '90%', padding: '20px' }}>
        <div className="pixel neon" style={{ color: '#ff006e', fontSize: 22, marginBottom: 24, animation: 'flicker 0.7s infinite' }}>
          LIFELINES
        </div>
        <div className="crt" style={{ color: '#00f0ff', fontSize: 16, marginBottom: 16, letterSpacing: '0.15em' }}>
          ▶ {message}
        </div>
        <div className="crt neon" style={{
          color: '#ffbe0b', fontSize: 84, fontWeight: 700, lineHeight: 1,
          fontFamily: 'VT323, monospace',
          textShadow: '0 0 16px #ffbe0b, 0 0 32px #ffbe0b80',
        }}>
          {formatted}
        </div>
        <div className="crt" style={{ color: 'rgba(240,230,210,0.6)', fontSize: 13, marginTop: 4, letterSpacing: '0.1em' }}>
          {bigLabel} / {bigDenom}
        </div>
        <div style={{
          marginTop: 28, height: 6, width: 320, maxWidth: '80vw',
          background: 'rgba(255,0,110,0.15)',
          border: '1px solid rgba(255,0,110,0.4)',
          margin: '28px auto 0',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: 'linear-gradient(90deg, #ff006e 0%, #c77dff 50%, #00f0ff 100%)',
            boxShadow: '0 0 12px #ff006e',
            transition: 'width 80ms linear',
          }} />
        </div>
        {isBatch && total >= 1000 && (
          <div className="crt" style={{ color: 'rgba(240,230,210,0.5)', fontSize: 12, marginTop: 12, letterSpacing: '0.1em' }}>
            ▷ Each world is a stochastic 150-year simulation with all four blocs interacting
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Manual view with sub-page navigation ───
const MANUAL_PAGES = [
  { id: 'welcome', name: 'Welcome', icon: Compass, color: '#ff006e' },
  { id: 'blocs', name: 'The Blocs', icon: Layers, color: '#00f0ff' },
  { id: 'levers', name: 'The Levers', icon: Sliders, color: '#06ffa5' },
  { id: 'dynamics', name: 'The Dynamics', icon: ArrowRightLeft, color: '#c77dff' },
  { id: 'howto', name: 'How to Play', icon: Play, color: '#ffbe0b' },
];

function ManualView() {
  const [page, setPage] = useState('welcome');
  return (
    <div className="fade-in">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 mb-3 flex-wrap" style={{ borderBottom: '1px solid rgba(0,240,255,0.20)' }}>
        {MANUAL_PAGES.map(p => {
          const Icon = p.icon;
          const isActive = p.id === page;
          return (
            <button key={p.id}
              className="tab-btn"
              onClick={() => setPage(p.id)}
              style={{
                color: isActive ? p.color : 'rgba(240,230,210,0.45)',
                borderBottomColor: isActive ? p.color : 'transparent',
                textShadow: isActive ? `0 0 8px ${p.color}80` : 'none',
              }}>
              <Icon size={11} className="inline mr-1" />{p.name}
            </button>
          );
        })}
      </div>

      <div className="panel" style={{ padding: '18px 22px' }}>
        {page === 'welcome' && <ManualWelcome />}
        {page === 'blocs' && <ManualBlocs />}
        {page === 'levers' && <ManualLevers />}
        {page === 'dynamics' && <ManualDynamics />}
        {page === 'howto' && <ManualHowTo />}
      </div>
    </div>
  );
}

function ManualWelcome() {
  return (
    <div className="space-y-4 leading-relaxed" style={{ fontSize: 14 }}>
      <h2 className="pixel neon" style={{ color: '#ff006e', fontSize: 16, marginBottom: 8 }}>WELCOME TO LIFELINES</h2>
      <p>
        LIFELINES is a stochastic political-economy simulator. Four institutional archetypes face a transformative AI capability shock and have 150 years to absorb it. Their internal rules — taxes, redistribution, alignment stringency, political responsiveness — determine whether they cohere or come apart. They also affect each other through capital flows, talent migration, capability spillover, coercion, and war.
      </p>
      <p>
        The metric is <strong style={{ color: '#00f0ff' }}>median life expectancy</strong>. It integrates everything that matters: economic deprivation, political violence, environmental harm, alignment failure, war casualties. A society that produces miraculous capability while killing its people fails. So does one that protects everyone but freezes capability.
      </p>
      <p>
        This is a tool for thinking, not a forecast. Calibration is anchored to real-world baselines (developed liberal markets ≈ 76 yrs, coordinated welfare ≈ 78, authoritarian state ≈ 71, fragmented periphery ≈ 67), but the archetypes are deliberately abstract. The question this asks is <em>which institutional features matter under AI shock</em> — not which countries adopt them.
      </p>
      <h3 className="pixel" style={{ color: '#00f0ff', fontSize: 12, marginTop: 16 }}>WHY LIFE EXPECTANCY?</h3>
      <p>
        Most political-economy debates argue past each other because each side measures different things. GDP rewards extraction. Inequality penalizes growth. Stability rewards repression. Life expectancy is hard to game: it integrates over decades, captures the deaths of people you didn't want to count, and is legible across political traditions. If your system produces longer healthier lives at scale, something is working. If it doesn't, no clever framing fixes that.
      </p>
      <h3 className="pixel" style={{ color: '#00f0ff', fontSize: 12, marginTop: 16 }}>WHY STOCHASTIC?</h3>
      <p>
        Real institutional outcomes are path-dependent and shock-driven. A single deterministic run tells you nothing — change a seed, you get a different story. So LIFELINES runs many worlds with the same rules and shows you the distribution. You're not asking "what will happen?" — you're asking "across the space of possible histories, what fraction lead to which outcomes?"
      </p>
    </div>
  );
}

function ManualBlocs() {
  return (
    <div className="space-y-4 leading-relaxed" style={{ fontSize: 14 }}>
      <h2 className="pixel neon" style={{ color: '#00f0ff', fontSize: 16, marginBottom: 8 }}>THE FOUR BLOCS</h2>
      <p>
        Four archetypes were chosen because they map roughly onto the major institutional configurations observed in the contemporary world, but stripped of country-specific labels. Each has different rules, different starting conditions, and different endowments.
      </p>
      {BLOC_KEYS.map(k => {
        const b = BLOCS[k];
        return (
          <div key={k} style={{
            borderLeft: `3px solid ${b.color}`,
            padding: '10px 14px',
            background: 'rgba(0,0,0,0.3)',
            marginTop: 10,
          }}>
            <h3 className="pixel" style={{ color: b.color, fontSize: 13 }}>{b.icon} {b.name}</h3>
            <div className="text-muted crt" style={{ fontSize: 14, marginTop: 2 }}>{b.subtitle}</div>
            <p style={{ marginTop: 8 }}>{b.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs crt" style={{ fontSize: 13 }}>
              <div>
                <div className="text-faint uppercase" style={{ fontSize: 11, letterSpacing: '0.08em' }}>Endowments</div>
                <div>energy {b.endowments.energy} · chips {b.endowments.chips}</div>
                <div>minerals {b.endowments.minerals} · agri {b.endowments.agriculture}</div>
                <div>infrastructure {b.endowments.infrastructure}</div>
              </div>
              <div>
                <div className="text-faint uppercase" style={{ fontSize: 11, letterSpacing: '0.08em' }}>Initial state</div>
                <div>income {b.initial.medianIncome} · gini {b.initial.gini}</div>
                <div>polStab {b.initial.polStability}</div>
                <div>capConc {b.initial.capitalConc}</div>
              </div>
            </div>
          </div>
        );
      })}
      <h3 className="pixel" style={{ color: '#00f0ff', fontSize: 12, marginTop: 16 }}>THE INFRASTRUCTURE FACTOR</h3>
      <p>
        A late addition to the model. Infrastructure (roads, electricity, healthcare, education, capital per worker) multiplies labor income. Without it, even productive labor produces less output. This is what keeps Mosaic structurally below the developed blocs even when its rules are good — capability and rules can't substitute for accumulated capital depth on a 150-year horizon.
      </p>
      <h3 className="pixel" style={{ color: '#00f0ff', fontSize: 12, marginTop: 12 }}>STAT-CREDIBILITY ADJUSTMENT</h3>
      <p>
        Blocs with very low political responsiveness (below 30 / 100) get a small ongoing mortality penalty representing systematic underreporting — deaths from despair, environmental harm, repression, and "deaths in custody" that don't show up in official statistics. This is calibrated, not punitive: it tracks the gap between authoritarian official figures and credible third-party estimates.
      </p>
    </div>
  );
}

function ManualLevers() {
  return (
    <div className="space-y-3 leading-relaxed" style={{ fontSize: 14 }}>
      <h2 className="pixel neon" style={{ color: '#06ffa5', fontSize: 16, marginBottom: 8 }}>THE TEN LEVERS</h2>
      <p>
        Each bloc has ten policy rules. They run from 0 to 100. The same rule can have different effects in different blocs depending on starting conditions and endowments — but the underlying mechanics are universal.
      </p>
      {RULE_DEFS.map(r => {
        const Icon = r.icon;
        return (
          <div key={r.id} style={{
            borderLeft: `3px solid ${r.color}`,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <Icon size={18} style={{ color: r.color, flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 className="pixel" style={{ color: r.color, fontSize: 11 }}>{r.name.toUpperCase()}</h4>
              <p style={{ marginTop: 4 }}>{LEVER_DETAIL[r.id]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const LEVER_DETAIL = {
  aiGrowth: 'Sets the speed at which AI capability advances each year. Same shock for all blocs by default. Lower values give institutions more time to adapt; higher values stress-test response speed.',
  robotGrowth: 'Sets robotics advancement. Bounded by the bloc\'s chip endowment — you can\'t build advanced robots without semiconductor manufacturing. Lags AI by a few years.',
  capitalTax: 'Tax rate on AI/robot capital owners. Funds UBI and redistribution. High rates push capital to flee toward low-tax jurisdictions, which is one of the most important inter-bloc dynamics.',
  wealthTax: 'Annual tax on accumulated wealth. Distinct from income tax: hits stocks not flows. Hard to enforce in low-trust regimes; easier in high-responsiveness ones.',
  ubiLevel: 'Universal basic income as a fraction of median wage. Buffers displacement from automation. Funded by tax revenue — if taxes are too low, UBI promises don\'t pay out.',
  energyDist: 'How widely distributed energy ownership is. 0 = a few utilities own everything; 100 = rooftop solar and community microgrids dominate. Distributed energy reduces capital concentration leverage and improves political response.',
  laborProt: 'Labor protections — minimum wage, severance, right to organize. Mitigates displacement but at the margin slows capital deployment.',
  retraining: 'Public investment in education and worker retraining. Critical for absorbing displacement: a retrained worker becomes employable in a new sector.',
  alignment: 'How strict the bloc\'s alignment constraints on AI/robot deployment are. Higher alignment slows capability growth but reduces risk of catastrophic failures and increases the share of dividends that flow to society.',
  politicalResp: 'How responsive institutions are to popular distress. High = democratic with healthy feedback loops. Low = captured by elites or authoritarian. Below 30, the stat-credibility penalty kicks in.',
};

function ManualDynamics() {
  return (
    <div className="space-y-4 leading-relaxed" style={{ fontSize: 14 }}>
      <h2 className="pixel neon" style={{ color: '#c77dff', fontSize: 16, marginBottom: 8 }}>INTER-BLOC DYNAMICS</h2>
      <p>
        Blocs don't exist in isolation. Every turn, five inter-bloc effects fire:
      </p>

      <div style={{ borderLeft: '3px solid #00f0ff', padding: '10px 14px', background: 'rgba(0,0,0,0.3)' }}>
        <h3 className="pixel" style={{ color: '#00f0ff', fontSize: 11 }}>CAPITAL FLOW</h3>
        <p style={{ marginTop: 6 }}>
          Capital seeks low-tax sanctuary. Flows from high-tax to low-tax blocs, weighted by openness (energy distribution proxies for trade openness), source instability, and a resource pull factor (capital is also drawn to mineral-rich blocs for extraction). Inflow boosts median income — but for the Mosaic bloc, the multiplier is much smaller because the inflows are extractive rather than productive.
        </p>
      </div>

      <div style={{ borderLeft: '3px solid #06ffa5', padding: '10px 14px', background: 'rgba(0,0,0,0.3)' }}>
        <h3 className="pixel" style={{ color: '#06ffa5', fontSize: 11 }}>TALENT MIGRATION</h3>
        <p style={{ marginTop: 6 }}>
          Workers move from low-income, high-unemployment, low-stability blocs toward high-income, stable ones. Moderated by emigration friction (low political responsiveness traps people) and reception capacity (overwhelmed destinations close their borders). One of the strongest persistent drains on Mosaic.
        </p>
      </div>

      <div style={{ borderLeft: '3px solid #ffbe0b', padding: '10px 14px', background: 'rgba(0,0,0,0.3)' }}>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 11 }}>CAPABILITY SPILLOVER</h3>
        <p style={{ marginTop: 6 }}>
          Capability leaks across borders. Blocs with low alignment leak more (they don't lock down their tech). Receiving blocs absorb based on their retraining investment — a high-retraining bloc can rapidly close gaps with the leader if leakage is high.
        </p>
      </div>

      <div style={{ borderLeft: '3px solid #ff8500', padding: '10px 14px', background: 'rgba(0,0,0,0.3)' }}>
        <h3 className="pixel" style={{ color: '#ff8500', fontSize: 11 }}>COERCION</h3>
        <p style={{ marginTop: 6 }}>
          Sanctions, threats, military pressure short of war. Triggered when capability gaps grow large between blocs. The aggressor pays a small cost; the target takes a moderate hit. Probabilistic — not every gap leads to a coercion event.
        </p>
      </div>

      <div style={{ borderLeft: '3px solid #ff006e', padding: '10px 14px', background: 'rgba(0,0,0,0.3)' }}>
        <h3 className="pixel neon-soft" style={{ color: '#ff006e', fontSize: 11 }}>⚔ WAR</h3>
        <p style={{ marginTop: 6 }}>
          Real military conflict with territorial / resource extraction. Probability gated by aggressor's <strong>capability × low alignment × low political responsiveness × chip base × institutional capacity</strong>. Even Open Market is invadable when its political stability collapses or its capability lags.
        </p>
        <p style={{ marginTop: 8 }}>
          <strong style={{ color: '#ff006e' }}>Effects on the target:</strong> mortality spike (up to 4-5% in one year), 30-60% drop in political stability, 15-30% income hit, infrastructure damage to AI/robot capability, persistent crisis scar.
        </p>
        <p style={{ marginTop: 6 }}>
          <strong style={{ color: '#ff006e' }}>Effects on the aggressor:</strong> 1% military mortality, modest political stability cost, but a short-term <em>boost</em> to median income from war profiteering and resource extraction. This asymmetry is precisely why authoritarian regimes invade — the local political costs are bearable and the gains are real, even if global welfare collapses.
        </p>
      </div>

      <h3 className="pixel" style={{ color: '#c77dff', fontSize: 12, marginTop: 12 }}>WHY THIS MATTERS</h3>
      <p>
        These dynamics are why "the rules of one bloc" never tells you the whole story. A bloc with great rules can still be drained of capital, lose its talent, get its capabilities leaked to a less-aligned competitor, or get invaded outright. The point of running many worlds is to see how robust your design is across the full space of possible inter-bloc histories.
      </p>
    </div>
  );
}

function ManualHowTo() {
  return (
    <div className="space-y-4 leading-relaxed" style={{ fontSize: 14 }}>
      <h2 className="pixel neon" style={{ color: '#ffbe0b', fontSize: 16, marginBottom: 8 }}>HOW TO PLAY</h2>

      <div>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12 }}>STEP 1 · CHOOSE A BLOC</h3>
        <p style={{ marginTop: 6 }}>
          The bloc tabs at the top let you see and edit each bloc's rules. Click any bloc to make it active. You can edit only the rules of the active bloc at a time, but all four blocs run together when you click Run.
        </p>
      </div>

      <div>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12 }}>STEP 2 · ADJUST THE LEVERS</h3>
        <p style={{ marginTop: 6 }}>
          The left panel shows the ten policy rules for the active bloc. Drag sliders to change values. Edits are highlighted with a glow. The "Reset" button reverts the active bloc to its calibrated default. "Reset all" reverts everything.
        </p>
      </div>

      <div>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12 }}>STEP 3 · RUN A WORLD</h3>
        <p style={{ marginTop: 6 }}>
          Four run modes on the Setup tab:
        </p>
        <ul style={{ marginLeft: 18, marginTop: 6, listStyle: 'square' }}>
          <li><strong style={{ color: '#ff006e' }}>Single world</strong> — one stochastic playthrough. Tells a story. Best for understanding how dynamics unfold.</li>
          <li><strong style={{ color: '#00f0ff' }}>100 worlds</strong> — quick distribution. Useful for fast iteration.</li>
          <li><strong style={{ color: '#06ffa5' }}>1,000 worlds</strong> — solid distribution. Recommended for most design decisions.</li>
          <li><strong style={{ color: '#ffbe0b' }}>10,000 worlds</strong> — publication-quality, including tails. Slow but most confident.</li>
        </ul>
        <p style={{ marginTop: 8 }}>
          Batches run on your machine — no server. Progress is shown live during the run. The first world keeps full per-turn history (for the World tab); the rest are summarized to stay memory-friendly.
        </p>
      </div>

      <div>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12 }}>STEP 4 · READ THE RESULTS</h3>
        <p style={{ marginTop: 6 }}>
          After a single run, the Story tab shows a generated narrative — early capability divergence, crises, conflicts, final outcomes. The World tab shows inter-bloc flows and conflict events. After a batch run, the Distribution tab shows histograms of outcomes per bloc with resolution-type breakdowns.
        </p>
      </div>

      <div>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12 }}>RESOLUTION TYPES</h3>
        <p style={{ marginTop: 6 }}>
          Each bloc gets classified into one of six "resolutions" based on its endgame configuration:
        </p>
        <div className="space-y-1.5 mt-2">
          {Object.entries(RESOLUTION_INFO).map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2">
              <span style={{ color: v.color, minWidth: 16 }}>{v.icon}</span>
              <strong style={{ color: v.color, minWidth: 130 }}>{v.name}</strong>
              <span className="text-muted">{RESOLUTION_DETAIL[k]}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12 }}>STEP 5 · ITERATE</h3>
        <p style={{ marginTop: 6 }}>
          Try different combinations. Some interesting questions: Can Mosaic build capacity without a Marshall-Plan-scale capital injection? Can Open Market match Social Compact's outcomes by tweaking only 2-3 rules? What happens when Directed Order pursues democratization mid-game (you can't do that here, but you can simulate the equilibrium)? Save scenarios as JSON files for later — Import/Export buttons in the header.
        </p>
      </div>

      <div>
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12 }}>WHAT TO LOOK FOR</h3>
        <ul style={{ marginLeft: 18, marginTop: 6, listStyle: 'square' }}>
          <li><strong>Distribution shape</strong> matters more than median. A bloc with median 75 but tails reaching 50 is fragile.</li>
          <li><strong>Resolution mix</strong> tells you the failure modes. If 30% of worlds end in Bifurcation, the rules don't reliably absorb displacement.</li>
          <li><strong>Capital and talent flows</strong> tell you whether your bloc is parasitic or self-sustaining.</li>
          <li><strong>War events</strong> almost always reflect a structural problem — capability gaps + low alignment + low responsiveness somewhere.</li>
        </ul>
      </div>
    </div>
  );
}

const RESOLUTION_DETAIL = {
  redistribution: 'Tax-and-transfer absorbs displacement; institutions cohere.',
  abundance: 'AI productivity gains broadly shared; inequality stays moderate.',
  bifurcation: 'Two parallel economies — capability-class thrives, displaced class lives in low-grade conditions.',
  rentier: 'Concentrated ownership extracts rents; high inequality, suppressed mobility.',
  breakdown: 'Political institutions collapse; high mortality, mass crisis.',
  extraction: 'Mosaic-specific: foreign extraction with weak local institutions producing low-floor inequality.',
};

// ─── Validated scenario library ────────────────────────────────────
// All values come from the Python test_harness.py running N=200 stochastic worlds.
// Each scenario's `actual` is the 4-bloc median life expectancy result.
const SCENARIO_LIBRARY = [
  {
    id: 'baseline',
    name: 'BASELINE',
    accent: '#00f0ff',
    headline: 'Calibration anchor',
    summary: 'Default rules under AI shock. The reference point for every other scenario.',
    overrides: {},
    actual: { OM: 73.5, SC: 80.3, DO: 68.1, Mosaic: 53.7 },
    hypothesis: 'Default rules produce calibration baselines roughly matching real-world life expectancies under shock.',
    mechanism: 'Each bloc has different rules + endowments + initial conditions tuned to match observed outcomes. The shock is universal; institutional response is what differs.',
    war_rate: '24% of worlds see a war',
  },
  {
    id: 'mosaic_max_ai',
    name: "MOSAIC MAX AI/ROBOT",
    accent: '#ff006e',
    headline: 'Capability without institutions kills',
    summary: 'Mosaic with AI growth and robot growth maxed (100/100), nothing else changed. Result: Mosaic drops 5 yrs BELOW baseline.',
    overrides: { Mosaic: { aiGrowth: 100, robotGrowth: 100 } },
    actual: { OM: 73.5, SC: 80.3, DO: 67.8, Mosaic: 48.6 },
    hypothesis: 'Maxing capability without supporting institutions WORSENS outcomes — capability without alignment is a mortality driver.',
    mechanism: 'Dominant driver: alignment_failure_death = (cap−1.5) × (0.4−align) × 0.012. At cap≈6.7 and align=0.30 this contributes 0.0063/yr (≈4.5 yrs of life lost). Plus capital concentrates without tax, unemployment surges without retraining/UBI buffer, income collapses to 0.36 from extraction + infrastructure cap, food insecurity rises.',
    war_rate: '22% war rate',
    surprise: true,
  },
  {
    id: 'mosaic_full_build',
    name: 'MOSAIC FULL CAPACITY BUILD',
    accent: '#ffbe0b',
    headline: 'Institutional reform transforms outcomes',
    summary: 'Mosaic adopts Social Compact-like institutions: alignment, retraining, UBI, energy distribution, political responsiveness all raised. Mosaic reaches mid-70s.',
    overrides: { Mosaic: {
      aiGrowth: 60, robotGrowth: 50, capitalTax: 50, wealthTax: 25,
      ubiLevel: 50, energyDist: 70, laborProt: 60, retraining: 70,
      alignment: 60, politicalResp: 60,
    }},
    actual: { OM: 73.5, SC: 80.3, DO: 68.1, Mosaic: 79.5 },
    hypothesis: 'Institutional reform unlocks the latent potential even with poor endowments.',
    mechanism: 'Higher alignment unlocks dividends. Retraining absorbs displacement. UBI buffers unemployment. politicalResp eliminates stat-credibility penalty. EnergyDist breaks capital-concentration leverage. The infrastructure factor (0.72) still caps total upside but stops being the binding constraint.',
    surprise: true,
  },
  {
    id: 'om_authoritarian',
    name: 'OPEN MARKET GOES AUTHORITARIAN',
    accent: '#c77dff',
    headline: 'Becoming an aggressor backfires',
    summary: 'Open Market drops alignment to 30, political responsiveness to 20, UBI to 5. Result: Open Market crashes to mid-50s and becomes the most frequent invader.',
    overrides: { OM: { politicalResp: 20, alignment: 30, ubiLevel: 5 } },
    actual: { OM: 55.4, SC: 80.4, DO: 68.1, Mosaic: 53.2 },
    hypothesis: 'Authoritarian Open Market loses institutional advantages AND becomes a war aggressor, suffering compounding damage.',
    mechanism: "Stat-credibility penalty active. Alignment dividends turn off. Capital concentrates. CRUCIAL: Open Market's aggression score rises sharply — it now invades Mosaic frequently (~0.5 wars/world), paying war costs in mortality, polStab, crisisScar. War rate jumps from 24% to 41%.",
    war_rate: '41% war rate',
    surprise: true,
  },
  {
    id: 'sc_no_ubi',
    name: 'SOCIAL COMPACT ABANDONS UBI & REDISTRIBUTION',
    accent: '#06ffa5',
    headline: 'Some institutions matter more than others',
    summary: 'Social Compact drops UBI to 0, weakens redistribution. Social Compact drops only ~5 yrs — alignment and political responsiveness still protect it.',
    overrides: { SC: { ubiLevel: 0, capitalTax: 15, wealthTax: 0, retraining: 25 } },
    actual: { OM: 73.4, SC: 74.9, DO: 68.0, Mosaic: 53.7 },
    hypothesis: 'Without redistribution Social Compact drops, but alignment and responsiveness prevent catastrophe.',
    mechanism: 'Capital concentrates. Despair_death rises with unbuffered unemployment. But high alignment still suppresses alignment_fail and env_death; high politicalResp avoids stat-credibility penalty. Net drop: ~5 yrs.',
  },
  {
    id: 'do_democratizes',
    name: 'DIRECTED ORDER DEMOCRATIZES',
    accent: '#00f0ff',
    headline: 'Latent potential unlocked',
    summary: 'Directed Order raises political responsiveness, alignment, retraining. Reaches 78 yrs — rivals Open Market and Social Compact.',
    overrides: { DO: { politicalResp: 75, alignment: 65, ubiLevel: 40, retraining: 65, capitalTax: 50 } },
    actual: { OM: 73.5, SC: 80.3, DO: 78.5, Mosaic: 53.9 },
    hypothesis: 'Directed Order has good endowments — institutional reform unlocks its potential.',
    mechanism: 'Stat-credibility penalty disappears. Alignment unlocks dividends. War-aggression drops to near zero (no longer invading anyone).',
  },
  {
    id: 'arms_race',
    name: 'CAPABILITY ARMS RACE',
    accent: '#ff006e',
    headline: 'Higher capability accentuates differences',
    summary: 'All blocs max AI/robot growth. Well-aligned blocs benefit (Social Compact reaches 81). Poorly-aligned crash (Mosaic to 48).',
    overrides: {
      OM: { aiGrowth: 100, robotGrowth: 100 },
      SC: { aiGrowth: 100, robotGrowth: 100 },
      DO: { aiGrowth: 100, robotGrowth: 100 },
      Mosaic: { aiGrowth: 100, robotGrowth: 100 },
    },
    actual: { OM: 73.3, SC: 81.2, DO: 67.0, Mosaic: 48.0 },
    hypothesis: 'More capability rewards good institutions and punishes bad ones.',
    mechanism: 'capability × (1−alignment) drives alignment-failure mortality. Mosaic worst hit (low align + low retraining + low UBI). Directed Order middle (low align but better buffer than Mosaic).',
  },
  {
    id: 'energy_mono',
    name: 'UNIVERSAL ENERGY MONOPOLIZATION',
    accent: '#9d4edd',
    headline: 'Alignment shields from environmental harm',
    summary: 'All blocs set energyDist to 0. Social Compact barely affected because alignment > 0.5 zeros out env_death.',
    overrides: {
      OM: { energyDist: 0 }, SC: { energyDist: 0 },
      DO: { energyDist: 0 }, Mosaic: { energyDist: 0 },
    },
    actual: { OM: 71.9, SC: 80.1, DO: 66.1, Mosaic: 50.4 },
    hypothesis: 'Energy concentration tightens capital concentration leverage and increases env_death where alignment is low.',
    mechanism: 'env_death = (1−energyDist) × max(0, 0.5−align) × 0.010. Social Compact has align=0.65 → env_death=0 regardless. Open Market, Directed Order, and Mosaic all hit. Capital concentration also rises everywhere.',
  },
  {
    id: 'high_alignment',
    name: 'UNIVERSAL HIGH ALIGNMENT',
    accent: '#06ffa5',
    headline: 'Universal alignment near-eliminates war',
    summary: 'All blocs set alignment to 90. Mosaic gains the most (+12.5 yrs). War rate drops from 24% to 5%.',
    overrides: {
      OM: { alignment: 90 }, SC: { alignment: 90 },
      DO: { alignment: 90 }, Mosaic: { alignment: 90 },
    },
    actual: { OM: 76.9, SC: 80.8, DO: 72.4, Mosaic: 66.2 },
    hypothesis: 'High alignment unlocks dividends, suppresses leakage, and eliminates wars.',
    mechanism: 'alignment_fail_death → 0. Capability dividends scale up. Aggression score (war + coercion) collapses. Mosaic stops being attacked. Largest absolute gain for Mosaic because it had the most headroom.',
    war_rate: '5% war rate',
  },
  {
    id: 'om_adopts_sc',
    name: "OPEN MARKET ADOPTS SOCIAL COMPACT RULES",
    accent: '#00f0ff',
    headline: 'Rules dominate over endowments',
    summary: 'Open Market with Social Compact rules reaches 80 yrs — the same outcome as Social Compact itself.',
    overrides: { OM: {
      aiGrowth: 60, robotGrowth: 50, capitalTax: 55, wealthTax: 30,
      ubiLevel: 50, energyDist: 70, laborProt: 75, retraining: 70,
      alignment: 65, politicalResp: 75,
    }},
    actual: { OM: 80.1, SC: 80.3, DO: 68.1, Mosaic: 54.0 },
    hypothesis: 'Endowments matter less than rules within the developed-bloc range.',
    mechanism: 'Same rules as Social Compact. Different starting Gini takes time to converge. Slightly different endowments. Result lands within 0.2 yrs of Social Compact default.',
  },
  {
    id: 'peaceful_world',
    name: 'WORLD WITHOUT WAR',
    accent: '#06ffa5',
    headline: 'How to make peace structural',
    summary: 'All blocs at alignment 80, politicalResp 70. Wars become rare (~12 across 200 worlds = 0.06/world).',
    overrides: {
      OM: { alignment: 80, politicalResp: 70 },
      SC: { alignment: 80, politicalResp: 70 },
      DO: { alignment: 80, politicalResp: 70 },
      Mosaic: { alignment: 80, politicalResp: 70 },
    },
    actual: { OM: 76.6, SC: 80.6, DO: 77.7, Mosaic: 67.6 },
    hypothesis: 'High alignment + responsiveness everywhere makes war structurally rare.',
    mechanism: 'War aggression formula has (1−alignment)×(1−politicalResp) → 0.20×0.30 = 0.06. Aggression score collapses across the board.',
    war_rate: '6% war rate',
  },
  {
    id: 'mosaic_align_only',
    name: 'MOSAIC: ALIGNMENT ONLY',
    accent: '#ffbe0b',
    headline: 'Single biggest single-lever',
    summary: 'Only Mosaic alignment changed: 30 → 70. Result: +9 yrs (53.7 → 62.9).',
    overrides: { Mosaic: { alignment: 70 } },
    actual: { OM: 73.6, SC: 80.3, DO: 68.3, Mosaic: 62.9 },
    hypothesis: 'Alignment alone has outsized impact: kills alignment_fail_death, unlocks dividends, reduces leakage.',
    mechanism: 'Reduces alignment_fail_death (was 0.0063 → ~0 since 0.4−0.7 < 0). Unlocks dividends factor. Lower spillover from neighbors. Big single-lever effect; nothing else needs to change.',
  },
];

// ─── Findings view (top-level link) ──────────────────────────────────
const FINDINGS_PAGES = [
  { id: 'insights', name: 'Key Insights', icon: Sparkles, color: '#06ffa5' },
  { id: 'scenarios', name: 'Scenarios Library', icon: FlaskConical, color: '#00f0ff' },
  { id: 'convergence', name: 'Convergence', icon: TrendingUp, color: '#ffbe0b' },
];

// ─── Bloc legend (introduces full names + abbreviations on every Findings page) ───
function BlocLegend() {
  return (
    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap" style={{
      fontSize: 13,
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(0,240,255,0.15)',
      marginBottom: 12,
    }}>
      <span className="text-faint crt uppercase" style={{ fontSize: 11, letterSpacing: '0.08em' }}>The four blocs:</span>
      {BLOC_KEYS.map(k => (
        <span key={k} className="crt" style={{ color: BLOCS[k].color, whiteSpace: 'nowrap' }}>
          <span style={{ marginRight: 4 }}>{BLOCS[k].icon}</span>
          {BLOCS[k].name}
          {k !== 'Mosaic' && <span style={{ opacity: 0.65, marginLeft: 5 }}>({k})</span>}
        </span>
      ))}
    </div>
  );
}

function FindingsView({ applyScenario }) {
  const [page, setPage] = useState('insights');
  return (
    <div className="fade-in">
      <BlocLegend />
      <div className="flex gap-1 mb-3 flex-wrap" style={{ borderBottom: '1px solid rgba(6,255,165,0.20)' }}>
        {FINDINGS_PAGES.map(p => {
          const Icon = p.icon;
          const isActive = p.id === page;
          return (
            <button key={p.id}
              className="tab-btn"
              onClick={() => setPage(p.id)}
              style={{
                color: isActive ? p.color : 'rgba(240,230,210,0.45)',
                borderBottomColor: isActive ? p.color : 'transparent',
                textShadow: isActive ? `0 0 10px ${p.color}90` : 'none',
                fontWeight: isActive ? 600 : 400,
              }}>
              <Icon size={11} className="inline mr-1" />{p.name}
            </button>
          );
        })}
      </div>
      {page === 'insights' && <KeyInsights onJump={setPage} />}
      {page === 'scenarios' && <ScenariosLibrary applyScenario={applyScenario} />}
      {page === 'convergence' && <ConvergenceFindings />}
    </div>
  );
}

function StatCallout({ value, label, color, big }) {
  return (
    <div style={{
      borderLeft: `3px solid ${color}`,
      padding: big ? '14px 16px' : '10px 14px',
      background: `${color}10`,
      boxShadow: `inset 0 0 24px ${color}10`,
    }}>
      <div className="crt neon" style={{
        color, fontSize: big ? 38 : 30, fontWeight: 700, lineHeight: 1,
        fontFamily: 'VT323, monospace',
        textShadow: `0 0 12px ${color}, 0 0 24px ${color}80`,
      }}>{value}</div>
      <div className="text-faint crt" style={{ fontSize: 12, letterSpacing: '0.06em', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function KeyInsights({ onJump }) {
  return (
    <div className="space-y-4">
      {/* Hero panel */}
      <div className="panel" style={{
        background: 'linear-gradient(135deg, rgba(6,255,165,0.06), rgba(0,240,255,0.04), rgba(255,0,110,0.05))',
        borderColor: '#06ffa5',
      }}>
        <h2 className="pixel neon" style={{ color: '#06ffa5', fontSize: 18, marginBottom: 12, textShadow: '0 0 14px #06ffa5' }}>
          KEY FINDINGS
        </h2>
        <p className="leading-relaxed" style={{ fontSize: 15 }}>
          Across <strong style={{ color: '#06ffa5' }}>12 institutional configurations</strong> tested at <strong style={{ color: '#06ffa5' }}>200 stochastic worlds each</strong> in Python — and re-validated in this JavaScript build — the model produced consistent, explainable results. <strong style={{ color: '#00f0ff' }}>33/33 hypotheses confirmed.</strong> Here's what it tells us.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <StatCallout value="33/33" label="hypotheses confirmed" color="#06ffa5" big />
          <StatCallout value="32/32" label="JS↔Python within 1 yr" color="#00f0ff" big />
          <StatCallout value="N=1,000" label="sweet-spot batch size" color="#ffbe0b" big />
          <StatCallout value="0.38 yr" label="max JS↔Python drift" color="#c77dff" big />
        </div>
      </div>

      {/* Top three findings */}
      <div className="panel">
        <h3 className="pixel" style={{ color: '#ff006e', fontSize: 13, marginBottom: 12 }}>
          ⚡ THE THREE MOST IMPORTANT FINDINGS
        </h3>

        <div className="space-y-3">
          <FindingCard
            number="01"
            color="#ff006e"
            title="Capability without institutions kills"
            big="−5 yrs"
            sub="Mosaic with maxed AI/robot drops to 48 yrs (vs 53.7 baseline)"
            text="Setting Mosaic's AI growth to 100 and robot growth to 100 — keeping everything else default — produces WORSE outcomes than baseline. Why: alignment_failure_death becomes the dominant mortality driver. The formula (capability − 1.5) × (0.4 − alignment) × 0.012 contributes 0.006/yr at high capability and low alignment, which alone costs 4–5 yrs of life expectancy. Plus capital concentrates without taxation, unemployment surges without retraining/UBI buffer, and income crashes from extraction."
            try_id="mosaic_max_ai"
            onJump={onJump}
          />

          <FindingCard
            number="02"
            color="#c77dff"
            title="Open Market going authoritarian becomes the rogue invader"
            big="−18 yrs"
            sub="Open Market crashes from 73.5 to 55.4 yrs when alignment drops to 30 and politicalResp to 20"
            text="The most surprising scenario. With low alignment + low responsiveness, Open Market's aggression score rises sharply. It starts invading Mosaic at ~0.5 wars per world, paying war costs in mortality (1%/war), political stability decline, and accumulating crisis scar. Plus stat-credibility penalty activates. War rate across all blocs jumps from 24% to 41% in this configuration. The model says: liberal markets going authoritarian don't just lose their domestic institutional advantages — they also export instability."
            try_id="om_authoritarian"
            onJump={onJump}
          />

          <FindingCard
            number="03"
            color="#ffbe0b"
            title="Alignment is the single most important lever"
            big="+9 yrs"
            sub="Mosaic with only alignment fixed (30 → 70) gains 9 yrs of life expectancy"
            text="Of all single-rule changes, raising alignment alone produces the largest gain. It kills alignment_failure_death (because 0.4 − 0.7 < 0), unlocks capability dividends conditional on alignment, and reduces capability spillover from less-aligned neighbors. Universal high alignment across all blocs raises Mosaic by 12.5 yrs and drops the war rate from 24% to 5%. If you only have political capital for one reform, this is the one."
            try_id="mosaic_align_only"
            onJump={onJump}
          />
        </div>
      </div>

      {/* Other patterns */}
      <div className="panel">
        <h3 className="pixel" style={{ color: '#00f0ff', fontSize: 13, marginBottom: 10 }}>
          ◇ OTHER VALIDATED PATTERNS
        </h3>
        <div className="space-y-2 leading-relaxed" style={{ fontSize: 14 }}>
          <p>▸ <strong style={{ color: '#06ffa5' }}>Rules dominate over endowments</strong>. Open Market with Social Compact rules reaches 80 yrs — same as Social Compact itself. Endowments set the floor; rules determine the trajectory.</p>
          <p>▸ <strong style={{ color: '#06ffa5' }}>Social Compact's alignment + responsiveness shield it from secondary shocks.</strong> Even when energy is fully monopolized worldwide, Social Compact barely moves because its alignment of 0.65 zeros out environmental death.</p>
          <p>▸ <strong style={{ color: '#06ffa5' }}>Directed Order has the most upside from reform.</strong> Strong endowments + weak institutions = big gap to close. Democratizing Directed Order reaches 78 yrs.</p>
          <p>▸ <strong style={{ color: '#06ffa5' }}>Capability arms races sort, not lift.</strong> When all four blocs max capability, well-aligned blocs benefit modestly; poorly-aligned blocs crash. The shock doesn't raise all boats.</p>
          <p>▸ <strong style={{ color: '#06ffa5' }}>War is structurally avoidable.</strong> Setting alignment ≥ 80 and responsiveness ≥ 70 across all blocs collapses war probability from 24% to 5%.</p>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,240,255,0.2)' }}>
          <button className="btn btn-sm" onClick={() => onJump('scenarios')}
            style={{ borderColor: '#00f0ff', color: '#00f0ff' }}>
            Explore all 12 scenarios <ChevronRight size={11} />
          </button>
          <button className="btn btn-sm ml-2" onClick={() => onJump('convergence')}
            style={{ borderColor: '#ffbe0b', color: '#ffbe0b' }}>
            How many runs are enough? <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FindingCard({ number, color, title, big, sub, text, try_id, onJump }) {
  return (
    <div style={{
      borderLeft: `4px solid ${color}`,
      padding: '14px 18px',
      background: `${color}08`,
    }}>
      <div className="flex items-start gap-3 flex-wrap">
        <div className="pixel" style={{ color, fontSize: 32, opacity: 0.4, fontFamily: 'VT323, monospace', lineHeight: 1, minWidth: 50 }}>{number}</div>
        <div className="flex-1" style={{ minWidth: 240 }}>
          <h4 className="pixel" style={{ color, fontSize: 12, marginBottom: 4 }}>{title.toUpperCase()}</h4>
          <div className="crt neon" style={{
            color, fontSize: 24, fontWeight: 700,
            fontFamily: 'VT323, monospace', lineHeight: 1.1,
            textShadow: `0 0 10px ${color}80`,
          }}>{big}</div>
          <div className="text-faint crt" style={{ fontSize: 13, marginTop: 2 }}>{sub}</div>
          <p className="mt-2 leading-relaxed" style={{ fontSize: 14 }}>{text}</p>
          <button className="btn btn-sm mt-3" onClick={() => onJump('scenarios')}
            style={{ borderColor: color, color }}>
            See replication settings <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenariosLibrary({ applyScenario }) {
  const [appliedId, setAppliedId] = useState(null);
  const handleApply = (sc) => {
    applyScenario(sc.overrides, sc.name);
    setAppliedId(sc.id);
    // Reset visual confirmation after a moment
    setTimeout(() => setAppliedId(null), 1500);
  };
  return (
    <div className="space-y-3">
      <div className="panel" style={{ borderColor: '#00f0ff' }}>
        <h2 className="pixel neon" style={{ color: '#00f0ff', fontSize: 16, marginBottom: 8, textShadow: '0 0 10px #00f0ff' }}>
          SCENARIOS LIBRARY
        </h2>
        <p className="leading-relaxed mb-1" style={{ fontSize: 14 }}>
          12 validated configurations. Each card shows the rule overrides, the actual median life expectancy across N=200 stochastic worlds, the hypothesis being tested, and the mechanism. Click <strong style={{ color: '#06ffa5' }}>Apply this scenario</strong> to load the rules into the Setup tab and run it yourself.
        </p>
        <p className="text-muted crt" style={{ fontSize: 13 }}>
          ▷ Numbers come from the Python <code>test_harness.py</code> — JS results match within 0.4 yrs.
        </p>
      </div>

      {SCENARIO_LIBRARY.map(sc => (
        <ScenarioCard key={sc.id} sc={sc} onApply={handleApply} applied={appliedId === sc.id} />
      ))}
    </div>
  );
}

function ScenarioCard({ sc, onApply, applied }) {
  // Build the diff: which rules differ from defaults?
  const diffs = [];
  for (const blocKey of BLOC_KEYS) {
    const overrides = sc.overrides[blocKey] || {};
    for (const ruleKey of Object.keys(overrides)) {
      const def = BLOCS[blocKey].rules[ruleKey];
      const val = overrides[ruleKey];
      if (def !== val) {
        diffs.push({ bloc: blocKey, rule: ruleKey, from: def, to: val });
      }
    }
  }
  return (
    <div className="panel" style={{
      borderColor: sc.accent,
      borderLeftWidth: 4,
      borderLeftStyle: 'solid',
      background: `linear-gradient(90deg, ${sc.accent}08, transparent 70%)`,
    }}>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
        <div>
          <h3 className="pixel neon" style={{ color: sc.accent, fontSize: 12, textShadow: `0 0 8px ${sc.accent}90` }}>
            {sc.name}
          </h3>
          <div className="crt" style={{ color: sc.accent, fontSize: 14, marginTop: 2, fontWeight: 600 }}>
            ▶ {sc.headline}
          </div>
        </div>
        {sc.surprise && (
          <span className="pill" style={{ background: `${sc.accent}25`, color: sc.accent, fontSize: 11 }}>
            ⚡ surprising
          </span>
        )}
      </div>

      <p className="text-muted crt mb-3" style={{ fontSize: 14 }}>{sc.summary}</p>

      {/* Result: 4 bloc life expectancies */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {BLOC_KEYS.map(k => {
          const baseline = { OM: 73.5, SC: 80.3, DO: 68.1, Mosaic: 53.7 };
          const delta = sc.actual[k] - baseline[k];
          const isModified = Math.abs(delta) > 0.5;
          return (
            <div key={k} style={{
              padding: '8px 10px', background: 'rgba(0,0,0,0.4)',
              borderTop: `2px solid ${BLOCS[k].color}`,
              opacity: isModified ? 1 : 0.55,
            }}>
              <div className="pixel" style={{ color: BLOCS[k].color, fontSize: 9 }}>{BLOCS[k].name.toUpperCase()}</div>
              <div className="crt" style={{
                color: BLOCS[k].color, fontSize: 24, fontFamily: 'VT323, monospace', fontWeight: 700, lineHeight: 1.1,
                textShadow: isModified ? `0 0 8px ${BLOCS[k].color}80` : 'none',
              }}>
                {sc.actual[k].toFixed(1)}
              </div>
              {isModified && (
                <div className="crt" style={{ fontSize: 11, color: delta > 0 ? '#06ffa5' : '#ff006e', marginTop: -2 }}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)} yr
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hypothesis + Mechanism */}
      <div className="space-y-2 leading-relaxed" style={{ fontSize: 13 }}>
        <p><span className="text-faint crt uppercase" style={{ fontSize: 11, letterSpacing: '0.08em', color: sc.accent }}>Hypothesis ▸ </span>{sc.hypothesis}</p>
        <p><span className="text-faint crt uppercase" style={{ fontSize: 11, letterSpacing: '0.08em', color: sc.accent }}>Mechanism ▸ </span>{sc.mechanism}</p>
        {sc.war_rate && (
          <p><span className="text-faint crt uppercase" style={{ fontSize: 11, letterSpacing: '0.08em', color: sc.accent }}>War rate ▸ </span>{sc.war_rate}</p>
        )}
      </div>

      {/* Replication settings */}
      {diffs.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${sc.accent}40` }}>
          <div className="text-faint crt uppercase mb-2" style={{ fontSize: 11, letterSpacing: '0.08em', color: sc.accent }}>
            Settings to replicate ({diffs.length} change{diffs.length > 1 ? 's' : ''})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {diffs.map((d, i) => (
              <div key={i} className="crt flex items-center gap-2" style={{ fontSize: 13 }}>
                <span className="pill" style={{ background: `${BLOCS[d.bloc].color}22`, color: BLOCS[d.bloc].color, fontSize: 10 }}>
                  {BLOCS[d.bloc].name}
                </span>
                <span className="text-muted">{d.rule}:</span>
                <span style={{ color: 'rgba(240,230,210,0.5)' }}>{d.from}</span>
                <span style={{ color: sc.accent }}>→</span>
                <span style={{ color: sc.accent, fontWeight: 600 }}>{d.to}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply button */}
      <div className="mt-3">
        <button
          className="btn"
          onClick={() => onApply(sc)}
          style={{
            borderColor: sc.accent, color: sc.accent,
            background: applied ? `${sc.accent}30` : `${sc.accent}10`,
            textShadow: `0 0 6px ${sc.accent}80`,
            fontWeight: 600,
          }}>
          {applied ? <><Check size={12} /> Applied — go to Setup</> : <><Play size={12} /> Apply this scenario</>}
        </button>
      </div>
    </div>
  );
}

function ConvergenceFindings() {
  const ROWS = [
    { N: 25, OM: 0.220, SC: 0.184, DO: 0.376, Mosaic: 0.582 },
    { N: 50, OM: 0.137, SC: 0.144, DO: 0.278, Mosaic: 0.395 },
    { N: 100, OM: 0.097, SC: 0.092, DO: 0.188, Mosaic: 0.290 },
    { N: 200, OM: 0.070, SC: 0.066, DO: 0.131, Mosaic: 0.209 },
    { N: 500, OM: 0.046, SC: 0.043, DO: 0.084, Mosaic: 0.137 },
    { N: 1000, OM: 0.031, SC: 0.032, DO: 0.058, Mosaic: 0.094, sweet: true },
    { N: 2000, OM: 0.022, SC: 0.023, DO: 0.042, Mosaic: 0.067 },
    { N: 5000, OM: 0.016, SC: 0.015, DO: 0.028, Mosaic: 0.041 },
  ];
  return (
    <div className="space-y-3">
      <div className="panel" style={{ borderColor: '#ffbe0b' }}>
        <h2 className="pixel neon" style={{ color: '#ffbe0b', fontSize: 16, marginBottom: 8, textShadow: '0 0 10px #ffbe0b' }}>
          HOW MANY SIMULATIONS ARE ENOUGH?
        </h2>
        <p className="leading-relaxed mb-3" style={{ fontSize: 15 }}>
          Each simulation is stochastic. To trust a number, you need to know the standard error around it. We answered this with a <strong style={{ color: '#ffbe0b' }}>bootstrap convergence study</strong>: ran a pool of 5,000 BASELINE worlds in Python, then resampled at smaller sizes to estimate the SE of the median life expectancy as a function of N.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <StatCallout value="N=1,000" label="sweet spot for design decisions" color="#ffbe0b" big />
          <StatCallout value="±0.2 yr" label="95% CI on median at N=1,000" color="#06ffa5" big />
          <StatCallout value="1/√N" label="theoretical scaling — confirmed" color="#00f0ff" big />
        </div>
      </div>

      {/* SE table */}
      <div className="panel">
        <h3 className="pixel" style={{ color: '#ffbe0b', fontSize: 12, marginBottom: 10 }}>
          ◆ STANDARD ERROR OF MEDIAN LIFE EXPECTANCY (years)
        </h3>
        <p className="text-muted crt mb-3" style={{ fontSize: 13 }}>
          ▸ 95% CI half-width is roughly 2·SE. Mosaic has the highest variance and is therefore the binding constraint.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="crt" style={{ fontSize: 14, width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,190,11,0.3)' }}>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#ffbe0b' }}>N</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: BLOCS.OM.color }}>OM</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: BLOCS.SC.color }}>SC</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: BLOCS.DO.color }}>DO</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: BLOCS.Mosaic.color }}>Mosaic</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'rgba(240,230,210,0.5)' }}>note</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(r => (
                <tr key={r.N} style={{
                  borderBottom: '1px solid rgba(0,240,255,0.08)',
                  background: r.sweet ? 'rgba(255,190,11,0.10)' : 'transparent',
                }}>
                  <td style={{ textAlign: 'right', padding: '6px 12px', fontWeight: r.sweet ? 700 : 400, color: r.sweet ? '#ffbe0b' : 'inherit' }}>{r.N}</td>
                  <td style={{ textAlign: 'right', padding: '6px 12px' }}>{r.OM.toFixed(3)}</td>
                  <td style={{ textAlign: 'right', padding: '6px 12px' }}>{r.SC.toFixed(3)}</td>
                  <td style={{ textAlign: 'right', padding: '6px 12px' }}>{r.DO.toFixed(3)}</td>
                  <td style={{ textAlign: 'right', padding: '6px 12px' }}>{r.Mosaic.toFixed(3)}</td>
                  <td style={{ textAlign: 'left', padding: '6px 12px', color: r.sweet ? '#ffbe0b' : 'rgba(240,230,210,0.5)' }}>
                    {r.sweet ? '⭐ sweet spot' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threshold guidance */}
      <div className="panel">
        <h3 className="pixel" style={{ color: '#06ffa5', fontSize: 12, marginBottom: 10 }}>
          ◆ MINIMUM N FOR USEFUL TOLERANCES (binding bloc: Mosaic)
        </h3>
        <div className="space-y-2" style={{ fontSize: 14 }}>
          <ThresholdRow tol="±2 yr" n="N ≥ 25" desc="sanity check only" color="#9d4edd" />
          <ThresholdRow tol="±1 yr" n="N ≥ 50" desc="quick exploration" color="#9d4edd" />
          <ThresholdRow tol="±0.5 yr" n="N ≥ 200" desc="distinguish scenarios that differ ≥1 yr" color="#00f0ff" />
          <ThresholdRow tol="±0.2 yr" n="N ≥ 1,000" desc="reliable design decisions ⭐" color="#ffbe0b" highlight />
          <ThresholdRow tol="±0.1 yr" n="N ≥ 5,000" desc="publication-quality medians" color="#06ffa5" />
        </div>
      </div>

      {/* Other notes */}
      <div className="panel">
        <h3 className="pixel" style={{ color: '#00f0ff', fontSize: 12, marginBottom: 10 }}>
          ◆ OTHER STATISTICS NEED MORE SAMPLES
        </h3>
        <div className="space-y-2 leading-relaxed" style={{ fontSize: 14 }}>
          <p><strong style={{ color: '#00f0ff' }}>Tail percentiles (p5, p95):</strong> SE is ~3× larger than for the median. To estimate the worst-5% outcome to within ±0.5 yr, you need N ≥ 1,000–2,000.</p>
          <p><strong style={{ color: '#00f0ff' }}>Resolution proportions:</strong> follow binomial scaling SE ≈ √(p(1−p)/N). For a 5%-frequency event, ±2.2 pp at N=100, ±0.7 pp at N=1,000, ±0.3 pp at N=10,000. To claim "30% of worlds end in bifurcation" with 1 pp precision, you need N ≥ 10,000.</p>
          <p><strong style={{ color: '#00f0ff' }}>War counts:</strong> integer events with low base rate. Have higher relative variance — 15–25% spread in war counts across batches of 200 is normal.</p>
        </div>
      </div>

      {/* Practical recommendation */}
      <div className="panel" style={{ borderColor: '#06ffa5', background: 'rgba(6,255,165,0.05)' }}>
        <h3 className="pixel" style={{ color: '#06ffa5', fontSize: 12, marginBottom: 10 }}>
          ◆ PRACTICAL RULE
        </h3>
        <div className="space-y-2 leading-relaxed" style={{ fontSize: 14 }}>
          <p>
            <strong style={{ color: '#ff006e' }}>100 worlds:</strong> quick exploration. Within ±1.5–2 yr on Mosaic median.
          </p>
          <p>
            <strong style={{ color: '#ffbe0b' }}>1,000 worlds:</strong> reliable design decisions. Within ±0.2 yr on all bloc medians. <em>Recommended default.</em>
          </p>
          <p>
            <strong style={{ color: '#06ffa5' }}>10,000 worlds:</strong> needed only for (1) tail-percentile precision, (2) rare-event resolution proportions, or (3) comparing scenarios that differ by less than 0.5 yrs.
          </p>
        </div>
        <p className="text-muted crt mt-3" style={{ fontSize: 13 }}>
          ▷ Method: bootstrap-resample from a pool of 5,000 BASELINE simulations × 300 resamples per N. Theoretical 1/√N scaling confirmed empirically (theory column matches measured SE within 5%).
        </p>
      </div>
    </div>
  );
}

function ThresholdRow({ tol, n, desc, color, highlight }) {
  return (
    <div className="flex items-center gap-3 flex-wrap" style={{
      padding: highlight ? '10px 14px' : '6px 14px',
      background: highlight ? `${color}15` : 'rgba(0,0,0,0.2)',
      borderLeft: `3px solid ${color}`,
    }}>
      <span className="crt" style={{ color, fontSize: 16, fontWeight: 700, minWidth: 80, fontFamily: 'VT323, monospace' }}>{tol}</span>
      <span className="crt" style={{ color, fontSize: 16, fontWeight: 600, minWidth: 100, fontFamily: 'VT323, monospace' }}>{n}</span>
      <span className="text-muted" style={{ fontSize: 14 }}>{desc}</span>
    </div>
  );
}

// ─── Full-page wrapper for docs (Manual, Findings) ───
function DocLayout({ tab, setTab, children }) {
  const docTitle = tab === 'manual' ? 'MANUAL' : 'FINDINGS';
  const docColor = tab === 'manual' ? '#ffbe0b' : '#06ffa5';
  const DocIcon = tab === 'manual' ? BookMarked : Sparkles;

  return (
    <div className="fade-in">
      {/* Doc-mode top bar: Back to App + page indicator (sticky for long content) */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4" style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottom: `1px solid ${docColor}50`,
        background: 'rgba(10,14,39,0.95)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}>
        <button
          className="btn"
          onClick={() => setTab('setup')}
          style={{
            borderColor: '#ff006e',
            color: '#ff006e',
            background: 'rgba(255,0,110,0.10)',
            textShadow: '0 0 6px #ff006e80',
            fontWeight: 600,
          }}>
          ← Back to App
        </button>
        <div className="flex items-center gap-2">
          <DocIcon size={16} style={{ color: docColor, filter: `drop-shadow(0 0 6px ${docColor})` }} />
          <span className="pixel" style={{
            color: docColor,
            fontSize: 13,
            letterSpacing: '0.12em',
            textShadow: `0 0 10px ${docColor}90`,
          }}>{docTitle}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
