import { useState, useEffect, Component, useCallback, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc, setDoc, arrayUnion, increment, getDoc } from 'firebase/firestore';
import { 
  Shield, Zap, Skull, ShoppingCart, Lock, Unlock, AlertTriangle, Gavel, RefreshCw, 
  Cpu, Atom, Target, Eye, Trophy, Medal, TrendingUp, Info, Crown, Activity, User, 
  Users, ChevronsUp, Hexagon, ClipboardList, Swords, Brain, Volume2, VolumeX, List, 
  CheckCircle2, PlusCircle, Quote, Siren, Award, History, Trash2, X, Package, Dices, 
  Sparkles, Radio, BookOpen, Timer, Wifi, WifiOff, MessageSquare, ShieldCheck, Flame, Star, Calculator,
  Type, Binary, Battery, BatteryCharging, Lightbulb, Book, BatteryFull, Hand, Grid3X3, AlertOctagon, Settings, Save, Upload, Disc, Edit3, TerminalSquare, Pill, Rocket
} from 'lucide-react';

const APP_VERSION = "v12.0.0 (MARK LXXXV - ENDGAME PROTOCOL)";

// --- 1. CONFIGURACIÓN FIREBASE (HÍBRIDA) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyA22193NI-3_2OyMU8UytEKZFtdBC4nb_A",
      authDomain: "avengers-tracker.firebaseapp.com",
      projectId: "avengers-tracker",
      storageBucket: "avengers-tracker.firebasestorage.app",
      messagingSenderId: "45402048374",
      appId: "1:45402048374:web:54c90a3dbc5fb76d54dc57"
    };

// --- 2. INICIALIZACIÓN SEGURA ---
let app, auth, db;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Error inicializando Firebase:", e);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- 3. DATOS CONSTANTES ---
const INITIAL_TEAMS = [
  { 
    id: 'ironman', name: 'Iron Man', points: 0, shield: false, badges: [], prestige: 0,
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null, doublePointsUntil: 0, lastSpin: '',
    theme: 'bg-red-900/40 shadow-[0_0_20px_rgba(239,68,68,0.5)]', border: 'border-red-500', 
    accent: 'text-red-400', barColor: 'bg-red-500', iconKey: 'cpu', 
    password: 'arc_reactor_85', members: ['Juandi', 'Ernesto', 'Carmen', 'Bea'], 
    quote: "Yo soy Iron Man.", 
    gif: "https://i.ibb.co/27K5dCBM/b751779a4a3bbc38f9268036cdb5af5a.gif",
    upgrades: {}, usedCodes: [], matrixEvent: false
  },
  { 
    id: 'cap', name: 'Capitán América', points: 0, shield: false, badges: [], prestige: 0,
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null, doublePointsUntil: 0, lastSpin: '',
    theme: 'bg-blue-900/40 shadow-[0_0_20px_rgba(59,130,246,0.5)]', border: 'border-blue-500', 
    accent: 'text-blue-400', barColor: 'bg-blue-500', iconKey: 'shield', 
    password: 'escudo_vibranium', members: ['Sara', 'Araceli', 'Nagore', 'Alex'], 
    quote: "Podría hacer esto todo el día.", 
    gif: "https://i.ibb.co/XqT34sz/189868-C0-D40619-AD55-4-B4-C-BE57-9005-D2506967-0-1643400842.gif",
    upgrades: {}, usedCodes: [], matrixEvent: false
  },
  { 
    id: 'thor', name: 'Thor', points: 0, shield: false, badges: [], prestige: 0,
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null, doublePointsUntil: 0, lastSpin: '',
    theme: 'bg-yellow-900/40 shadow-[0_0_20px_rgba(234,179,8,0.5)]', border: 'border-yellow-500', 
    accent: 'text-yellow-400', barColor: 'bg-yellow-400', iconKey: 'zap', 
    password: 'stormbreaker_trueno', members: ['Javi', 'Guille', 'Yma', 'Iker'], 
    quote: "¡Por las barbas de Odín!", 
    gif: "https://i.ibb.co/PsFhhF1g/f604e46c6979b173d319fc064ed5c0dc.gif",
    upgrades: {}, usedCodes: [], matrixEvent: false
  },
  { 
    id: 'hulk', name: 'Hulk', points: 0, shield: false, badges: [], prestige: 0,
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null, doublePointsUntil: 0, lastSpin: '',
    theme: 'bg-emerald-900/40 shadow-[0_0_20px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', 
    accent: 'text-emerald-400', barColor: 'bg-emerald-500', iconKey: 'atom', 
    password: 'gamma_smash_verde', members: ['Oliver', 'Félix', 'Sofía'], 
    quote: "¡HULK... APLASTA!", 
    gif: "https://i.ibb.co/BV1dZJCH/tumblr-nkx9ln-Ha8c1tiwiyxo1-640.gif",
    upgrades: {}, usedCodes: [], matrixEvent: false
  },
  { 
    id: 'widow', name: 'Viuda Negra', points: 0, shield: false, badges: [], prestige: 0,
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null, doublePointsUntil: 0, lastSpin: '',
    theme: 'bg-rose-900/40 shadow-[0_0_20px_rgba(225,29,72,0.4)]', border: 'border-rose-600', 
    accent: 'text-rose-500', barColor: 'bg-rose-600', iconKey: 'target', 
    password: 'sala_roja_007', members: ['Sara', 'Sebas', 'Héctor', 'Alejandro'], 
    quote: "A estas alturas, nada dura para siempre.", 
    gif: "https://i.ibb.co/JjJQnWcH/0c2a5632830679-569563b0d45b2.gif",
    upgrades: {}, usedCodes: [], matrixEvent: false
  },
  { 
    id: 'strange', name: 'Dr. Strange', points: 0, shield: false, badges: [], prestige: 0,
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null, doublePointsUntil: 0, lastSpin: '',
    theme: 'bg-purple-900/40 shadow-[0_0_20px_rgba(168,85,247,0.5)]', border: 'border-purple-500', 
    accent: 'text-purple-400', barColor: 'bg-purple-500', iconKey: 'eye', 
    password: 'sanctum_agomoto', members: ['Derek', 'Liah', 'Dani', 'Cata'], 
    quote: "Dormammu, he venido a negociar.", 
    gif: "https://i.ibb.co/M5VX25W0/tumblr-n11ui8-Bh-NU1r8bj4ko1-500.gif",
    upgrades: {}, usedCodes: [], matrixEvent: false
  },
];

const ROLES = ['[HACKER]', '[CIENTÍFICO]', '[GUERRERO]', '[CAPITÁN]'];

// --- MUTADORES DIARIOS (NUEVO SISTEMA) ---
const DAILY_MODIFIERS = [
  { name: "ESTADO BASE", desc: "Sistemas estables. Sin alteraciones en la matriz.", effect: 'NONE', icon: <Shield size={14}/> },
  { name: "FIEBRE MATEMÁTICA", desc: "Hoy, los entrenamientos de Mates otorgan el DOBLE de puntos.", effect: 'DOUBLE_MATH', icon: <Calculator size={14}/> },
  { name: "MERCADO NEGRO", desc: "Las Cajas de Wakanda en la Armería cuestan la mitad (25 pts).", effect: 'CHEAP_LOOT', icon: <ShoppingCart size={14}/> },
  { name: "IRA DE THANOS", desc: "CUIDADO: Fallar una pregunta de Defensa contra Thanos resta -20 pts.", effect: 'HARD_BOSS', icon: <Skull size={14}/> },
  { name: "SOBRECARGA DEL REACTOR", desc: "Los puntos pasivos del Reactor Arc rinden el doble (+10 pts hoy).", effect: 'DOUBLE_PASSIVE', icon: <Atom size={14}/> },
  { name: "INSPIRACIÓN LINGÜÍSTICA", desc: "Los entrenamientos de Descifrar otorgan +2 puntos extra garantizados.", effect: 'BOOST_WORD', icon: <Type size={14}/> },
  { name: "FLUJO TEMPORAL", desc: "Todos los equipos ganan un 50% extra en cualquier botón de Admin (+1, +5, +10).", effect: 'ADMIN_BOOST', icon: <Zap size={14}/> }
];

const REWARDS_LIST = [
  { id: 99, name: 'Campo de Fuerza', cost: 200, desc: 'Bloquea 1 sanción automáticamente' }, 
  { id: 66, name: 'El Chasquido', cost: 300, desc: 'Quita 50% pts a 2 rivales al azar' },
  { id: 1, name: 'Suministros', cost: 100, desc: 'Snack en clase' },
  { id: 2, name: 'DJ S.H.I.E.L.D.', cost: 75, desc: 'Elegir canción' },
  { id: 3, name: 'Indulto', cost: 150, desc: 'Perdón de tarea' },
  { id: 4, name: 'Aliado', cost: 120, desc: 'Sentarse con un amigo' },
  { id: 5, name: 'Archivos', cost: 200, desc: '5 min apuntes examen' },
  { id: 6, name: 'Descanso Táctico', cost: 50, desc: '5 min sin hacer nada' },
  { id: 7, name: 'Comandante', cost: 100, desc: 'Ayudante del profesor' },
  { id: 9, name: 'Hackeo', cost: 400, desc: 'Fondo pantalla profe' },
  { id: 10, name: 'Cine', cost: 800, desc: 'Película en clase' },
  { id: 12, name: 'Sin Botas', cost: 75, desc: 'Estar en calcetines' }
];

const UPGRADES_LIST = [
  { id: 'reactorArc', name: 'Reactor Arc', cost: 300, desc: 'Genera +5 puntos pasivos cada día automáticamente.', iconKey: 'atom' },
  { id: 'oraculo', name: 'Algoritmo Oráculo', cost: 400, desc: 'Completar una batería entera da +5 extra en lugar del bonus normal.', iconKey: 'eye' }
];

const PENALTIES_LIST = [
  "Tablas multiplicar", "Copiar verbos", "Dibujo locomotor", "Capitales Europa", "Recoger clase",
  "Informe de Daños (Redacción)", "Limpieza de Cubierta (Estanterías)", "Silencio de Radio (5 min)",
  "Patrulla (Vuelta al patio)", "Orden Alfabético (Biblioteca)"
];

const BADGE_ICONS = { Star: Star, Zap: Zap, Brain: Brain, Shield: Shield, Flame: Flame, Crown: Crown, Trophy: Trophy, TerminalSquare: TerminalSquare };

const BADGES_LIST = [
    { iconKey: 'Star', name: "Excelencia", color: "text-amber-400" },
    { iconKey: 'Zap', name: "Rapidez", color: "text-cyan-400" },
    { iconKey: 'Brain', name: "Ingenio", color: "text-purple-400" },
    { iconKey: 'Shield', name: "Defensor", color: "text-emerald-400" },
    { iconKey: 'Flame', name: "Racha", color: "text-orange-400" },
    { iconKey: 'Crown', name: "TITÁN", color: "text-yellow-500" }
];

const DAILY_QUOTES = [
    "Un gran poder conlleva una gran responsabilidad.",
    "No es sobre cuánto golpeamos, sino cuánto podemos resistir.",
    "Vengadores, ¡Reuníos!",
    "La verdadera fuerza está en el corazón.",
    "El protocolo Endgame está monitorizando.",
    "Siempre hay una opción.",
    "Somos lo que elegimos proteger.",
    "El amanecer de una nueva era táctica."
];

const TICKER_MESSAGES = [ 
  "CAPITÁN AMÉRICA: 'PUEDO HACER ESTO TODO EL DÍA'", 
  "TONY STARK: 'YO SOY IRON MAN'", 
  "AVENGERS: ¡REUNÍOS!", 
  "THOR: 'POR LAS BARBAS DE ODÍN'", 
  "BLACK PANTHER: '¡WAKANDA POR SIEMPRE!'", 
  "HULK: ¡APLASTA EL EXAMEN!",
  "DR. STRANGE: 'ESTAMOS EN EL JUEGO FINAL'"
];

const MISSION_BATTERY = [
  { category: "Comportamiento", text: "OPERACIÓN SILENCIO" }, { category: "Orden", text: "PROTOCOLO LIMPIEZA" },
  { category: "Académico", text: "ENTREGA PUNTUAL" }, { category: "Social", text: "TRABAJO EN EQUIPO" }
];

const INFINITY_STONES = [
  { threshold: 100, color: 'text-cyan-400', name: 'Espacio', perk: 'Teletransporte' },
  { threshold: 200, color: 'text-red-500', name: 'Realidad', perk: 'Ilusión' },
  { threshold: 300, color: 'text-purple-500', name: 'Poder', perk: 'Potencia' },
  { threshold: 400, color: 'text-yellow-400', name: 'Mente', perk: 'Clarividencia' },
  { threshold: 500, color: 'text-emerald-500', name: 'Tiempo', perk: 'Retroceso' },
  { threshold: 600, color: 'text-orange-500', name: 'Alma', perk: 'Sacrificio' }
];

const MULTIVERSE_EVENTS = [
  { title: "CHASQUIDO INVERSO", desc: "¡El universo se reequilibra! Todos ganan +5 puntos.", points: 5, type: 'good' },
  { title: "INVASIÓN SKRULL", desc: "Revisión sorpresa de material.", points: 0, type: 'neutral' },
  { title: "FALLO EN EL SISTEMA", desc: "La próxima tarea vale DOBLE puntuación.", points: 0, type: 'good' },
  { title: "ATAQUE DE ULTRÓN", desc: "Hackeo de sistemas. Todos pierden -2 puntos.", points: -2, type: 'bad' },
  { title: "VISITA DE STAN LEE", desc: "¡Excelsior! 5 minutos de tiempo libre.", points: 0, type: 'good' },
  { title: "TORMENTA CUÁNTICA", desc: "Cambio de sitios aleatorio.", points: 0, type: 'neutral' },
];

const DUEL_CHALLENGES = ["Piedra, Papel o Tijera", "Duelo de miradas", "Pregunta de Mates", "Deletreo rápido", "El que parpadee pierde", "Adivinanza"];

const ACADEMIC_QUESTIONS = [
  { q: "¿Cuánto es 8 x 8?", a: "64" }, { q: "¿La mitad de 500?", a: "250" }, { q: "¿Cuántos lados tiene un hexágono?", a: "6" },
  { q: "¿Resultado de 100 entre 4?", a: "25" }, { q: "¿Grados de un ángulo recto?", a: "90" }, { q: "¿Cuántos minutos tiene una hora?", a: "60" },
  { q: "¿Raíz cuadrada de 81?", a: "9" }, { q: "¿El doble de 150?", a: "300" }, { q: "¿Cuánto es 12 x 10?", a: "120" },
  { q: "¿Lados de un triángulo?", a: "3" }, { q: "¿Nombre del polígono de 5 lados?", a: "Pentágono" }, { q: "¿Cifra romana V?", a: "5" },
  { q: "¿Símbolo químico del agua?", a: "H2O" }, { q: "¿Hueso más largo del cuerpo?", a: "Fémur" }, { q: "¿Órgano que bombea sangre?", a: "Corazón" },
  { q: "¿Planeta más cercano al Sol?", a: "Mercurio" }, { q: "¿Planeta conocido como el Planeta Rojo?", a: "Marte" }, { q: "¿Gas que respiramos?", a: "Oxígeno" },
  { q: "¿Capital de España?", a: "Madrid" }, { q: "¿Capital de Francia?", a: "París" }, { q: "¿Capital de Italia?", a: "Roma" },
  { q: "¿Antónimo de 'rápido'?", a: "Lento" }, { q: "¿Sinónimo de 'bonito'?", a: "Bello" }, { q: "¿Palabra que indica acción?", a: "Verbo" },
  { q: "¿En qué año se descubrió América?", a: "1492" }, { q: "¿Quién pintó la Mona Lisa?", a: "Da Vinci" }, { q: "¿Moneda de la Unión Europea?", a: "Euro" },
  { q: "Perro in English", a: "Dog" }, { q: "Gato in English", a: "Cat" }, { q: "Rojo in English", a: "Red" },
  { q: "¿Cuántas líneas tiene el pentagrama?", a: "5" }, { q: "¿Clave más común?", a: "Sol" }, { q: "¿Figura que vale 4 tiempos?", a: "Redonda" }
];

const HYDRA_WORDS = [
    "SUJETO", "PREDICADO", "VERBO", "ADJETIVO", "CELULA", "FOTOSINTESIS", "ENERGIA", "MATERIA", 
    "PLANETA", "RELIEVE", "CLIMA", "EUROPA", "DEMOCRACIA", "CONSTITUCION", "ECOSYSTEMA", "VENGADORES", "ESCUDO",
    "GRAVEDAD", "OXIGENO", "HIDROGENO", "GALAXIA", "ASTEROIDE", "VOLCAN", "TERREMOTO"
];

const COMBAT_QUESTIONS = {
  easy: [
    { q: "¿Cuántas patas tiene una araña?", a: "8" }, { q: "¿Color del caballo blanco de Santiago?", a: "BLANCO" },
    { q: "¿Capital de España?", a: "MADRID" }, { q: "¿2 x 5?", a: "10" }, { q: "¿Antónimo de 'alto'?", a: "BAJO" },
    { q: "¿Rey de la selva?", a: "LEON" }, { q: "¿Días de la semana?", a: "7" }
  ],
  medium: [
    { q: "¿Capital de Alemania?", a: "BERLIN" }, { q: "¿Símbolo químico del agua?", a: "H2O" }, { q: "¿Lados de un hexágono?", a: "6" },
    { q: "¿Planeta rojo?", a: "MARTE" }, { q: "¿7 x 8?", a: "56" }, { q: "¿País de la Torre Eiffel?", a: "FRANCIA" }
  ],
  hard: [
    { q: "¿Capital de Australia?", a: "CANBERRA" }, { q: "¿Símbolo químico del Oro?", a: "AU" }, { q: "¿12 x 12?", a: "144" },
    { q: "¿Autor del Quijote?", a: "CERVANTES" }, { q: "¿Planeta más grande?", a: "JUPITER" }, { q: "¿Río que pasa por Londres?", a: "TAMESIS" }
  ]
};

const BOSS_BASE_HP = 1500;
const ICONS = { cpu: Cpu, shield: Shield, zap: Zap, atom: Atom, target: Target, eye: Eye, atom_upg: Atom, eye_upg: Eye };

const CTRL_BTN_CLASS = "flex-1 py-1.5 rounded-sm text-[10px] font-bold font-mono transition-all uppercase tracking-wider active:scale-95 border cursor-pointer select-none";

const getRankInfo = (p) => {
  if (p < 0) return { title: 'AMENAZA', color: 'text-red-500', glow: 'shadow-red-900/50', iconScale: 1, next: 0, total: 100 };
  if (p < 100) return { title: 'RECLUTA', color: 'text-amber-600', glow: 'shadow-none', iconScale: 1, next: 100, total: 100 };
  if (p < 200) return { title: 'AGENTE', color: 'text-amber-500', glow: 'shadow-amber-500/20', iconScale: 1.1, next: 200, total: 200 };
  if (p < 400) return { title: 'VENGADOR', color: 'text-yellow-400', glow: 'shadow-yellow-500/30', iconScale: 1.25, next: 400, total: 200 };
  return { title: 'LEYENDA', color: 'text-yellow-300', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]', iconScale: 1.5, next: 1000, total: 600 };
};

const playSfx = (type) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'success') { osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5); osc.start(now); osc.stop(now + 0.5); } 
        else if (type === 'error') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now + 0.3); gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); }
        else if (type === 'click') { osc.type = 'square'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(now); osc.stop(now + 0.05); }
        else if (type === 'alarm') { 
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(400, now); 
            for(let i=0; i<5; i++) {
                osc.frequency.setValueAtTime(600, now + i*0.5);
                osc.frequency.setValueAtTime(800, now + i*0.5 + 0.25);
            }
            gain.gain.setValueAtTime(0.2, now); 
            gain.gain.linearRampToValueAtTime(0.01, now + 2.5); 
            osc.start(now); 
            osc.stop(now + 2.5); 
        }
        else if (type === 'epic') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 2);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 3);
            osc.start(now); osc.stop(now + 3);
        }
    } catch (e) {}
};

const Confeti = ({ active, x, y, massive = false }) => {
  if (!active) return null;
  const count = massive ? 150 : 40;
  return (
    <div className="pointer-events-none fixed z-[200]" style={{ left: x, top: y }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`absolute w-2 h-2 rounded-full ${massive ? 'animate-confetti-massive' : 'animate-confetti'}`} style={{ backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#a855f7', '#3b82f6', '#fff'][Math.floor(Math.random() * 6)], '--tx': `${(Math.random()-0.5)*(massive?800:300)}px`, '--ty': `${(Math.random()-0.5)*(massive?800:300)}px`, '--r': `${Math.random() * 360}deg`, animationDelay: massive ? `${Math.random()*0.2}s` : '0s' }} />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]); 
  const bg = type === 'success' ? 'bg-amber-900/40 border-amber-500' : type === 'error' ? 'bg-red-900/40 border-red-500' : 'bg-amber-900/40 border-amber-500';
  const icon = type === 'success' ? <CheckCircle2 /> : type === 'error' ? <AlertTriangle /> : <Info />;
  return (
    <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border ${bg} backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-in slide-in-from-right fade-in duration-300 max-w-sm`}>
      <div className={type === 'success' ? 'text-amber-400' : type === 'error' ? 'text-red-400' : 'text-amber-400'}>{icon}</div>
      <p className="text-sm font-bold text-white font-mono">{message}</p>
    </div>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() { 
      if (this.state.hasError) return (
          <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400 font-mono text-center">
              <AlertTriangle size={64} className="mb-4 text-red-500 animate-pulse" />
              <h1 className="text-2xl font-black mb-2">ERROR DE PROTOCOLO DETECTADO</h1>
              <p className="mb-6">El Nexo ha encontrado un conflicto crítico de renderizado.</p>
              <button onClick={() => {
                  try { localStorage.removeItem('avengers_teams_quantum'); localStorage.removeItem('avengers_mission_quantum'); } catch(e){}
                  window.location.reload();
              }} className="px-6 py-2 bg-amber-600 text-black font-bold uppercase rounded hover:bg-amber-500 transition-colors">Reiniciar Simulador (Modo Seguro)</button>
          </div>
      ); 
      return this.props.children; 
  }
}

// --- APP PRINCIPAL ---
function AvengersTracker() {
  const [teams, setTeams] = useState(() => {
     try {
         const saved = localStorage.getItem('avengers_teams_endgame');
         return saved ? JSON.parse(saved) : INITIAL_TEAMS;
     } catch (e) {
         return INITIAL_TEAMS;
     }
  });
  
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedInId, setLoggedInId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); 
  const [editMode, setEditMode] = useState({}); 
  
  // UI States
  const [modal, setModal] = useState(null);
  const [selTeam, setSelTeam] = useState(null);
  const [pass, setPass] = useState('');
  const [penalty, setPenalty] = useState(null);
  const [lootResult, setLootResult] = useState(null);
  const [multiverseEvent, setMultiverseEvent] = useState(null);
  const [mission, setMission] = useState(() => {
      try { return localStorage.getItem('avengers_mission_endgame') || MISSION_BATTERY[0].text; } catch(e) { return MISSION_BATTERY[0].text; }
  });
  const [customMission, setCustomMission] = useState('');
  const [history, setHistory] = useState([]);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [redAlertMode, setRedAlertMode] = useState(false);
  const [sound, setSound] = useState(false);
  const [cerebro, setCerebro] = useState({ active: false, target: null, searching: false, type: null }); 
  const [confetti, setConfetti] = useState({ active: false, x: 0, y: 0, massive: false });
  const [toast, setToast] = useState(null);
  const [secretCount, setSecretCount] = useState(0);
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionAvailable, setQuestionAvailable] = useState(false);
  const [furyMessage, setFuryMessage] = useState(null);
  const [newFuryMsg, setNewFuryMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [dailyQuote, setDailyQuote] = useState("");
  const [shopTab, setShopTab] = useState('rewards');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOpen, setTerminalOpen] = useState(false);
  
  const [dailyModifier, setDailyModifier] = useState(DAILY_MODIFIERS[0]);

  // OMEGA EVENT (Co-op Boss)
  const [omegaEvent, setOmegaEvent] = useState(null);
  const [omegaInput, setOmegaInput] = useState("");
  const [omegaQuestion, setOmegaQuestion] = useState(null);
  const [omegaTimeLeft, setOmegaTimeLeft] = useState(0);

  // PILL EVENT
  const [matrixTarget, setMatrixTarget] = useState(null);
  const [pillResult, setPillResult] = useState(null);

  const actionLock = useRef(false);

  const [mathState, setMathState] = useState({ active: false, questions: [], currentIdx: 0, level: 2 });
  const [mathInput, setMathInput] = useState("");
  const [streak, setStreak] = useState(0);

  const [wordState, setWordState] = useState({ active: false, word: "", scrambled: "" });
  const [wordInput, setWordInput] = useState("");

  const [combatState, setCombatState] = useState({ active: false, questions: [], currentIdx: 0, correctCount: 0 }); 
  const [combatInput, setCombatInput] = useState("");
  
  const [bossAttackState, setBossAttackState] = useState({ active: false, team: null, questions: [], currentIdx: 0, mistakes: 0 });
  const [bossMaxHp, setBossMaxHp] = useState(BOSS_BASE_HP);
  const [bossDamageTaken, setBossDamageTaken] = useState(0);
  
  const [memoryState, setMemoryState] = useState({ active: false, cards: [], flipped: [], matched: [], lock: false });

  const [timerInput, setTimerInput] = useState(5);
  const [duelData, setDuelData] = useState(null);
  
  const [starkSpinning, setStarkSpinning] = useState(false);
  const [starkPrize, setStarkPrize] = useState(null);

  const [gauntletTargets, setGauntletTargets] = useState([]);

  const closeToast = useCallback(() => setToast(null), []);

  const closeAllModals = useCallback(() => {
    if(modal === 'endgame') return; // Lock endgame
    setModal(null);
    setMathState(prev => ({ ...prev, active: false }));
    setWordState(prev => ({ ...prev, active: false }));
    setCombatState(prev => ({ ...prev, active: false }));
    setBossAttackState(prev => ({ ...prev, active: false }));
    setMemoryState(prev => ({ ...prev, active: false }));
    setStarkPrize(null);
    setGauntletTargets([]);
    setPillResult(null);
    setMatrixTarget(null);
  }, [modal]);

  useEffect(() => { localStorage.setItem('avengers_teams_endgame', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('avengers_mission_endgame', mission); }, [mission]);

  // Auth - SECURE INITIALIZATION
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!auth) { setUseLocal(true); setLoading(false); return; }
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           try { await signInWithCustomToken(auth, __initial_auth_token); } 
           catch(e) { await signInAnonymously(auth); }
        } else { await signInAnonymously(auth); }
      } catch (e) {
        console.error("Auth init error:", e);
        setUseLocal(true);
        setLoading(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const safeUpdate = async (docId, data, merge = true) => {
      if (useLocal || !db || !user) { updateLocal(docId, data); return; }
      try { 
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', docId);
          await setDoc(docRef, data, { merge }); 
      }
      catch (e) { 
          console.warn("Firebase permission blocked write. Using local state.");
          setUseLocal(true); updateLocal(docId, data);
      }
  };

  const updateLocal = (docId, data) => {
      if (docId === 'mission_control') {
          if(data.text !== undefined) setMission(data.text);
          if(data.alert !== undefined) setRedAlertMode(data.alert);
          if(data.history !== undefined) setHistory(prev => [...(data.history||[]), ...prev]);
          if(data.furyMsg !== undefined) setFuryMessage(data.furyMsg);
          if(data.bossMaxHp !== undefined) setBossMaxHp(data.bossMaxHp);
          if(data.omegaEvent !== undefined) setOmegaEvent(data.omegaEvent);
          if(data.bossDamageTaken !== undefined) setBossDamageTaken(data.bossDamageTaken);
      } else {
          setTeams(prev => prev.map(t => t.id === docId ? {...t, ...data} : t).sort((a,b)=>b.points-a.points));
      }
  };

  // Daily Quote & LAZY Daily Reset + Mutator
  useEffect(() => {
      if (!user && !useLocal) return;

      const day = new Date().getDate();
      setDailyQuote(DAILY_QUOTES[day % DAILY_QUOTES.length]);
      
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      setDailyModifier(DAILY_MODIFIERS[dayOfYear % DAILY_MODIFIERS.length]);

      const today = new Date().toDateString();
      const lastRunDate = localStorage.getItem('avengers_last_run_date_endg');
      const currentMax = parseFloat(localStorage.getItem('avengers_boss_hp_endg')) || BOSS_BASE_HP;
      
      if (lastRunDate !== today && teams.length > 0) {
          const mod = DAILY_MODIFIERS[dayOfYear % DAILY_MODIFIERS.length];
          
          setTeams(prev => prev.map(t => {
              let passivePoints = t.upgrades?.reactorArc ? (mod.effect === 'DOUBLE_PASSIVE' ? 10 : 5) : 0;
              return {
                  ...t,
                  dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0,
                  lastDaily: today, lastLoot: null, lastSpin: '',
                  points: t.points + passivePoints
              };
          }));

          const newMax = Math.floor(currentMax * 1.1);
          setBossMaxHp(newMax);
          localStorage.setItem('avengers_boss_hp_endg', newMax.toString());
          localStorage.setItem('avengers_last_run_date_endg', today);
      } else {
          setBossMaxHp(currentMax);
      }
  }, [user, useLocal]); 

  // Data Sync
  useEffect(() => {
    if (useLocal || !user || !db) { if (useLocal) setLoading(false); return; }
    try {
      const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'avengers_teams'), (snap) => {
        if (snap.empty) { setTeams(INITIAL_TEAMS); } else {
          const tArr = []; let fMission=null, fAlert=false, fHist=[], fFury=null, fShake=false, fBossHp=null, fOmega=null, fBossDmg=0;
          
          snap.docs.forEach(d => {
            if (d.id === 'mission_control') { 
                const data=d.data(); 
                fMission=data.text; fAlert=data.alert; fHist=data.history||[]; fFury=data.furyMsg; fShake=data.shaking; fBossHp=data.bossMaxHp;
                fOmega=data.omegaEvent || null; fBossDmg=data.bossDamageTaken || 0;
            }
            else { tArr.push({ id: d.id, ...d.data() }); }
          });

          const today = new Date().toDateString();
          const merged = tArr.map(t => {
             const staticData = INITIAL_TEAMS.find(it => it.id === t.id);
             if (!staticData) return t;
             let isNewDay = t.lastDaily && t.lastDaily !== today;

             return {
                 ...staticData,
                 points: t.points ?? staticData.points, 
                 shield: t.shield ?? staticData.shield,
                 badges: t.badges ?? staticData.badges,
                 prestige: t.prestige ?? staticData.prestige ?? 0,
                 dailyMath: isNewDay ? 0 : (t.dailyMath ?? 0), 
                 dailyWord: isNewDay ? 0 : (t.dailyWord ?? 0),
                 dailyCombat: isNewDay ? 0 : (t.dailyCombat ?? 0), 
                 dailyMemory: isNewDay ? 0 : (t.dailyMemory ?? 0),
                 lastLoot: isNewDay ? null : (t.lastLoot ?? null), 
                 doublePointsUntil: t.doublePointsUntil ?? 0,
                 lastSpin: isNewDay ? '' : (t.lastSpin ?? ''), 
                 gif: t.gif ?? staticData.gif,
                 upgrades: t.upgrades || {}, 
                 usedCodes: t.usedCodes || [], 
                 matrixEvent: t.matrixEvent || false
             };
          }).sort((a,b)=>b.points-a.points);

          if(merged.length > 0) setTeams(merged);
          if(fMission) setMission(fMission);
          if(fAlert!==undefined) setRedAlertMode(fAlert);
          if(fBossHp) setBossMaxHp(fBossHp); 
          setBossDamageTaken(fBossDmg);
          setOmegaEvent(fOmega);
          setFuryMessage(fFury);
          if(fShake) { setShaking(true); setTimeout(() => setShaking(false), 3000); playSfx('alarm'); }
          setHistory((fHist||[]).reverse().slice(0,50));
        }
        setLoading(false);
      }, (error) => { console.error("Snapshot error:", error); setUseLocal(true); setLoading(false); });
      return () => unsub();
    } catch { setUseLocal(true); setLoading(false); }
  }, [user, useLocal]); 

  // Matrix Event Check
  useEffect(() => {
     if (loggedInId && !isAdmin) {
         const myTeam = teams.find(t => t.id === loggedInId);
         if (myTeam && myTeam.matrixEvent && modal !== 'matrixPill') {
             setModal('matrixPill'); playSfx('alarm'); speak("Anomalía detectada en el sistema.");
         }
     }
  }, [teams, loggedInId, isAdmin, modal]);

  // Omega Event Timer
  useEffect(() => {
      if (omegaEvent?.active) {
          const interval = setInterval(() => {
              const remaining = omegaEvent.expiresAt - Date.now();
              if (remaining <= 0) {
                  clearInterval(interval);
                  if (isAdmin) {
                      safeUpdate('mission_control', { omegaEvent: { ...omegaEvent, active: false }, bossDamageTaken: bossDamageTaken - 100 });
                      logAction("ALERTA OMEGA FINALIZADA (Tiempo Agotado). Thanos se cura 100 HP.");
                      showToast("Evento Omega Fracasado. Thanos se cura.", "error");
                  }
                  setOmegaTimeLeft(0);
              } else { setOmegaTimeLeft(remaining); }
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [omegaEvent, isAdmin, bossDamageTaken]);

  // Ticker Timer
  useEffect(() => {
    const t = setInterval(() => { setTickerIdx(p => (p + 1) % TICKER_MESSAGES.length); }, 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const radioTimer = setInterval(() => {
        if (!questionAvailable && Math.random() < 0.05) { 
            setQuestionAvailable(true); setTimeout(() => setQuestionAvailable(false), 300000); 
        }
    }, 60000);
    return () => clearInterval(radioTimer);
  }, [questionAvailable]);

  const showToast = (msg, type='info') => setToast({ message: msg, type });
  const triggerConfetti = (e) => { if(e) { setConfetti({active:true, x:e.clientX, y:e.clientY, massive:false}); setTimeout(()=>setConfetti({active:false,x:0,y:0}), 1000); }};
  const triggerSecretConfetti = (massive = false) => { setConfetti({ active: true, x: window.innerWidth / 2, y: window.innerHeight / 2, massive }); setTimeout(() => setConfetti({ active: false, x: 0, y: 0, massive: false }), massive ? 4000 : 1000); };
  
  const logAction = (txt) => {
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    if (useLocal || !db || !user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', 'mission_control');
    updateDoc(docRef, { history: arrayUnion({time, text:txt}) }).catch(()=>{});
  };

  const speak = (text) => {
    if (!sound || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = 'es-ES'; u.rate = 1.1; window.speechSynthesis.speak(u);
  };

  const handlePts = async (tid, amt, e, force = false) => {
    if (!force && !isAdmin && !(loggedInId === tid && amt < 0)) return;
    const t = teams.find(i => i.id === tid);
    if (!t) return;

    let finalAmt = amt;
    // Apply Multipliers
    if (amt > 0 && t.doublePointsUntil && Date.now() < t.doublePointsUntil) finalAmt = amt * 2;
    if (amt > 0 && dailyModifier.effect === 'ADMIN_BOOST' && !force && isAdmin) finalAmt = Math.ceil(finalAmt * 1.5);

    if (amt > 0) { triggerConfetti(e); playSfx('success'); } else { playSfx('error'); }
    if (Math.abs(finalAmt) >= 5) speak(`Puntos para ${t.name}`);
    
    if (!useLocal && db && user) {
        try { 
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', tid);
            await updateDoc(docRef, { points: increment(finalAmt) }); 
        } catch(err) { safeUpdate(tid, { points: t.points + finalAmt }); }
    } else {
        safeUpdate(tid, { points: t.points + finalAmt });
    }
    if (finalAmt !== 0) logAction(`${t.name}: ${finalAmt > 0 ? '+' : ''}${finalAmt} pts`);
  };

  const handleManualEdit = async (tid, val) => {
      const newVal = parseInt(val);
      if(!isNaN(newVal)) {
          if (!useLocal && db && user) {
              try { 
                  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', tid);
                  await setDoc(docRef, { points: newVal }, { merge: true }); 
              } catch(err) { safeUpdate(tid, { points: newVal }); }
          } else { safeUpdate(tid, { points: newVal }); }
          logAction(`${teams.find(t=>t.id===tid)?.name}: Edición Manual -> ${newVal}`);
      }
      setEditMode({ ...editMode, [tid]: false });
  };

  const backupData = () => { navigator.clipboard.writeText(JSON.stringify(teams)); showToast("Copia de seguridad copiada al portapapeles", "success"); speak("Backup completado"); };
  const restoreData = async () => {
     const data = prompt("Pega aquí el código de seguridad:");
     if (data) {
         try { const parsed = JSON.parse(data); if (Array.isArray(parsed)) { parsed.forEach(t => safeUpdate(t.id, t)); showToast("Datos restaurados", "success"); speak("Sistema restaurado"); }
         } catch(e) { showToast("Error al restaurar: Código inválido", "error"); }
     }
  };

  const resetDailyLimits = async () => { 
      if (!window.confirm("¿Reiniciar los límites diarios y aplicar puntos pasivos?")) return; 
      const today = new Date().toDateString();
      teams.forEach(t => {
          let passivePoints = t.upgrades?.reactorArc ? (dailyModifier.effect === 'DOUBLE_PASSIVE' ? 10 : 5) : 0;
          let updates = { dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: today, lastSpin: '', lastLoot: null };
          if (passivePoints > 0) updates.points = t.points + passivePoints; 
          safeUpdate(t.id, updates);
      });
      speak("Protocolos reseteados."); showToast("Límites diarios reseteados.", "success"); 
  };

  const reset = async () => {
    if (!window.confirm("¿Reiniciar temporada perdiendo todo? (Para guardar prestigio, usa Endgame)")) return;
    for (const t of teams) {
        await safeUpdate(t.id, { points: 0, shield: false, badges: [], dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastLoot: null, doublePointsUntil: 0, lastSpin: '', upgrades: {}, usedCodes: [], matrixEvent: false, prestige: 0 });
    }
    safeUpdate('mission_control', { history: [], timerEnd: null, furyMsg: null, bossMaxHp: 1500, omegaEvent: null, bossDamageTaken: 0 });
    speak("Reinicio completado."); showToast("Temporada reiniciada", "success");
  };

  const clearFuryMessage = () => { safeUpdate('mission_control', { furyMsg: null }); setFuryMessage(null); speak("Transmisión finalizada"); };
  const setTimer = (minutes) => { closeAllModals(); };

  // --- TAREAS Y ROLES Y MUTADORES ---
  const handleTaskCompletion = async (tid, type) => {
      const t = teams.find(i => i.id === tid); 
      if(!t) return;
      
      let currentVal = 0;
      if(type === 'math') currentVal = t.dailyMath || 0;
      else if(type === 'word') currentVal = t.dailyWord || 0;
      else if(type === 'combat') currentVal = t.dailyCombat || 0;
      else if(type === 'memory') currentVal = t.dailyMemory || 0;

      if (currentVal >= 4) return;

      const newDaily = currentVal + 1;
      const today = new Date().toDateString();
      let update = { lastDaily: today };
      if(type === 'math') update.dailyMath = newDaily;
      else if(type === 'word') update.dailyWord = newDaily;
      else if(type === 'combat') update.dailyCombat = newDaily;
      else if(type === 'memory') update.dailyMemory = newDaily;

      let roleBonus = 0;
      let roleName = "";
      if (type === 'word') { roleBonus = 1; roleName = "Hacker"; }
      if (type === 'math') { roleBonus = 1; roleName = "Científico"; }
      if (type === 'combat') { roleBonus = 1; roleName = "Guerrero"; }
      
      let ptsToAdd = 1 + roleBonus; 
      let messageParts = [`+${ptsToAdd} ${roleBonus ? '(Bonus ' + roleName + ')' : 'Base'}`];

      // Mutadores
      if (dailyModifier.effect === 'DOUBLE_MATH' && type === 'math') { ptsToAdd *= 2; messageParts.push("x2 FIEBRE MATES"); }
      if (dailyModifier.effect === 'BOOST_WORD' && type === 'word') { ptsToAdd += 2; messageParts.push("+2 BOOSTER"); }

      // Oráculo
      if (newDaily === 4) {
          if (t.upgrades?.oraculo) { ptsToAdd += 5; messageParts.push("+5 Extra (Oráculo)"); } 
          else { ptsToAdd += 2; messageParts.push("+2 Extra (Línea)"); }
      }
      
      // Remontada
      const sorted = [...teams].sort((a,b) => b.points - a.points);
      const rank = sorted.findIndex(tm => tm.id === tid);
      if (rank >= sorted.length - 2 && sorted.length > 2) {
          ptsToAdd += 1; messageParts.push("+1 Extra (Refuerzos)");
      }

      await safeUpdate(tid, update);
      handlePts(tid, ptsToAdd, null, true); 
      speak(`Reto superado. ${ptsToAdd} puntos conseguidos.`);
      showToast(`¡Superado! ${messageParts.join(" | ")}`, "success");
      logAction(`${t.name} superó simulación de ${type} (+${ptsToAdd} pts)`);
  };

  const handleBadge = async (tid, badge) => { 
      const t = teams.find(i => i.id === tid); 
      if(!t) return; 
      // check if exists to prevent duplicates
      if (t.badges?.find(b => b.name === badge.name)) return;
      await safeUpdate(tid, { badges: [...(t.badges || []), badge] }); 
      logAction(`${t.name} ganó medalla ${badge.name}`); 
      playSfx('success'); triggerSecretConfetti(); 
  };
  
  const openShop = (team) => {
      if (!isAdmin) {
          const isCap = window.confirm(`[CONTROL DE ACCESO]\nSolo el CAPITÁN (Jugador 4) de ${team.name} está autorizado para realizar transacciones en la Armería.\n\n¿Confirmas que eres el Capitán del equipo?`);
          if (!isCap) return;
      }
      setSelTeam(team); setModal('shop');
  };

  const handleBuy = async (teamId, baseCost, itemObj) => { 
      if (!isAdmin && loggedInId !== teamId) { showToast("Sin permiso", "error"); return false; } 
      const t = teams.find(tm => tm.id === teamId); 
      
      let finalCost = baseCost;
      if (dailyModifier.effect === 'CHEAP_LOOT' && baseCost === 50 && !itemObj?.id) finalCost = 25; // Lootbox is id-less in this call flow originally, wait, I pass 50 directly. Let's fix that.

      if (t.points >= finalCost) { 
          playSfx('click'); 
          
          if (itemObj?.id === 'reactorArc' || itemObj?.id === 'oraculo') {
              if (t.upgrades && t.upgrades[itemObj.id]) { showToast("Ya posees esta mejora.", "error"); return false; }
              await safeUpdate(teamId, { [`upgrades.${itemObj.id}`]: true });
              handlePts(teamId, -finalCost, null, true);
              logAction(`${t.name} mejoró base: ${itemObj.name}`);
          }
          else if (itemObj?.id === 99) { safeUpdate(teamId, { shield: true }); handlePts(teamId, -finalCost, null, true); logAction(`${t.name} compró Escudo`); } 
          else if (itemObj?.id === 66) { 
             handlePts(teamId, -finalCost, null, true); 
             logAction(`${t.name} compró EL CHASQUIDO`); 
             speak("Yo soy... inevitable."); playSfx('alarm'); 
             const rivals = teams.filter(tm => tm.id !== teamId); 
             const shuffled = [...rivals].sort(() => 0.5 - Math.random()); 
             const victims = shuffled.slice(0, 2); 
             for (const victim of victims) { 
                 if (victim.shield) { await safeUpdate(victim.id, { shield: false }); logAction(`${victim.name} bloqueó el Chasquido`); } 
                 else { const halved = Math.floor(victim.points / 2); await handleManualEdit(victim.id, halved); logAction(`${t.name} chasqueó a ${victim.name}`); } 
             } 
             triggerSecretConfetti(); 
          } else { 
             handlePts(teamId, -finalCost, null, true); logAction(`${t.name} gastó ${finalCost} pts`); 
          } 
          closeAllModals(); showToast("Transacción exitosa", "success"); return true; 
      } else { showToast("Fondos insuficientes", "error"); playSfx('error'); return false; } 
  };
  
  const handleSnap = async () => { 
      if (!window.confirm("¿Ejecutar el Chasquido de Thanos? 2 equipos perderán la mitad de sus puntos.")) return; 
      playSfx('alarm'); speak("Yo soy... inevitable."); 
      const shuffled = [...teams].sort(() => 0.5 - Math.random()); 
      const victims = shuffled.slice(0, 2); 
      for (const team of victims) { await handleManualEdit(team.id, Math.floor(team.points / 2)); logAction(`${team.name} sufrió el Chasquido`); } 
      triggerSecretConfetti(); showToast("El equilibrio ha sido restaurado.", "info"); 
  };

  const handleBossAttack = () => { 
      if (teams.length === 0) return; 
      setShaking(true); playSfx('alarm'); speak("Thanos ataca."); 
      const randomTeam = teams[Math.floor(Math.random() * teams.length)]; 
      const randomQuestions = [...ACADEMIC_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6); 
      setBossAttackState({ active: true, team: randomTeam, questions: randomQuestions, currentIdx: 0, mistakes: 0 }); 
      setModal('bossAttack'); setTimeout(() => setShaking(false), 3000); 
  };

  const submitBossAnswer = (inputVal) => { 
      if (actionLock.current) return; actionLock.current = true; setTimeout(() => { actionLock.current = false; }, 300);
      const currentQ = bossAttackState.questions[bossAttackState.currentIdx]; 
      if (!currentQ) return;

      const isCorrect = inputVal.toUpperCase().trim() === currentQ.a.toUpperCase(); 
      let newMistakes = bossAttackState.mistakes; 
      if (isCorrect) { 
          playSfx('success'); 
      } else { 
          playSfx('error'); newMistakes++; 
          const penaltyPoints = dailyModifier.effect === 'HARD_BOSS' ? -20 : -10;
          handlePts(bossAttackState.team.id, penaltyPoints, null, true); 
          showToast(`¡FALLO! ${penaltyPoints} Puntos. La respuesta era: ${currentQ.a}`, "error"); 
      } 

      if (bossAttackState.currentIdx < 5) { setBossAttackState(prev => ({ ...prev, currentIdx: prev.currentIdx + 1, mistakes: newMistakes })); } 
      else { 
          if (newMistakes === 0) { handlePts(bossAttackState.team.id, 50, null, true); speak("Amenaza neutralizada."); showToast("¡THANOS REPELIDO! +50 Puntos", "success"); triggerSecretConfetti(); } 
          else { speak("Defensa fallida."); showToast("Ataque finalizado con daños.", "info"); } 
          closeAllModals();
      } 
  };

  // --- OMEGA EVENT ---
  const triggerOmegaAlert = async () => {
      if(!isAdmin) return;
      if (!window.confirm("¿Lanzar ALERTA OMEGA? Todos los equipos deberán colaborar para responder 20 preguntas en 10 minutos.")) return;
      playSfx('alarm'); speak("Alerta Omega. Invasión masiva detectada. Se requiere cooperación de todos los escuadrones.");
      await safeUpdate('mission_control', { omegaEvent: { active: true, target: 20, current: 0, expiresAt: Date.now() + 600000 } });
  };
  const openOmegaQuestion = () => { setOmegaQuestion(ACADEMIC_QUESTIONS[Math.floor(Math.random() * ACADEMIC_QUESTIONS.length)]); setOmegaInput(""); setModal('omegaChallenge'); };
  const submitOmegaAnswer = async () => {
      if (actionLock.current) return; actionLock.current = true; setTimeout(() => { actionLock.current = false; }, 300);
      if (!omegaQuestion || !omegaEvent) return;

      if (omegaInput.toUpperCase().trim() === omegaQuestion.a.toUpperCase()) {
          playSfx('success'); showToast("¡Acierto validado para el grupo!", "success"); closeAllModals();
          const newCurrent = (omegaEvent.current || 0) + 1;
          const updatedOmega = { ...omegaEvent, current: newCurrent };
          
          if (!useLocal && db && user) {
              try {
                  const missionRef = doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', 'mission_control');
                  await updateDoc(missionRef, { 'omegaEvent.current': increment(1) });
                  getDoc(missionRef).then(d => {
                      const currentOmega = d.data().omegaEvent;
                      if(currentOmega && currentOmega.current >= currentOmega.target && currentOmega.active) omegaEventWin();
                  });
              } catch (e) {
                  safeUpdate('mission_control', { omegaEvent: updatedOmega });
                  if (newCurrent >= omegaEvent.target) omegaEventWin();
              }
          } else {
              safeUpdate('mission_control', { omegaEvent: updatedOmega });
              if (newCurrent >= omegaEvent.target) omegaEventWin();
          }
      } else {
          playSfx('error'); showToast("Incorrecto. Intenta otra coordenada.", "error"); setOmegaInput("");
      }
  };
  const omegaEventWin = async () => {
      speak("Invasión neutralizada. Thanos ha sufrido daños críticos."); triggerSecretConfetti();
      await safeUpdate('mission_control', { 'omegaEvent.active': false, bossDamageTaken: bossDamageTaken + 200 });
      teams.forEach(t => handlePts(t.id, 50, null, true));
      logAction("🛡️ EVENTO OMEGA SUPERADO: Todos ganan +50 Pts. Thanos pierde 200 HP.");
  };
  
  // --- MATRIX PILL EVENT ---
  const triggerMatrixEvent = async (teamId) => {
      if(!isAdmin) return;
      const targetTeam = teams.find(t=>t.id===teamId); setMatrixTarget(targetTeam); setModal('matrixPill');
      playSfx('alarm'); speak(`Anomalía detectada en el equipo ${targetTeam.name}.`); logAction(`Anomalía activada para ${targetTeam.name}`);
  };
  const resolveMatrixPill = async (choice) => {
      if(!matrixTarget) return;
      const t = matrixTarget; await safeUpdate(t.id, { matrixEvent: false });
      const isChoiceGood = Math.random() > 0.5;
      const eventType = Math.random() > 0.5 ? 'points' : 'shield';

      if (eventType === 'points') {
          const val = isChoiceGood ? 30 : -15; await handlePts(t.id, val, null, true);
          setPillResult(isChoiceGood ? `Sobrecarga estable. ${t.name} gana +30 Pts.` : `Sobrecarga fallida. ${t.name} pierde -15 Pts.`);
          if(isChoiceGood) { playSfx('success'); handleBadge(t.id, { iconKey: 'Zap', name: "Superviviente", color: "text-amber-400" }); } else playSfx('error');
          logAction(`${t.name} activó ${choice} (${val > 0 ? '+30' : '-15'} pts)`);
      } else {
          if (isChoiceGood) {
              await safeUpdate(t.id, { shield: true });
              setPillResult(`Protocolo de defensa exitoso. Campo de Fuerza activado para ${t.name}.`); playSfx('success'); logAction(`${t.name} activó ${choice} (Gana Escudo)`);
          } else {
              await safeUpdate(t.id, { shield: false }); await handlePts(t.id, -15, null, true); 
              setPillResult(`Brecha de seguridad. ${t.name} pierde su escudo y -15 Pts.`); playSfx('error'); logAction(`${t.name} activó ${choice} (Pierde Escudo y -15)`);
          }
      }
  };

  // --- TERMINAL E EASTER EGGS LOGROS ---
  const handleTerminalSubmit = async (e) => {
      if (e.key === 'Enter') {
          const code = terminalInput.toUpperCase().trim();
          setTerminalInput(""); setTerminalOpen(false);

          if (!loggedInId) return;
          const t = teams.find(tm=>tm.id===loggedInId);
          if(t.usedCodes?.includes(code)) { showToast("Código ya utilizado.", "error"); return; }

          let valid = false;
          if (code === 'NEO') {
              handlePts(loggedInId, 50, null, true); showToast("SYSTEM OVERRIDE: +50 Puntos", "success"); valid = true;
          } else if (code === 'HESOYAM') {
              await safeUpdate(loggedInId, { shield: true }); showToast("CHEAT ACTIVATED: Escudo Adquirido", "success"); valid = true;
          } else if (code === 'THEREISNOSPOON') {
              await safeUpdate(loggedInId, { 'upgrades.reactorArc': true, 'upgrades.oraculo': true }); showToast("PROTOCOL UNLOCKED: Tecnologías conseguidas", "success"); valid = true;
          } else if (code === 'STAN_LEE_LIVES' || code === 'EXCELSIOR') {
              handlePts(loggedInId, 100, null, true); showToast("¡EXCELSIOR! +100 Puntos", "success"); valid = true;
          }

          if (valid) {
              playSfx('success'); triggerSecretConfetti();
              await safeUpdate(loggedInId, { usedCodes: arrayUnion(code) });
              handleBadge(loggedInId, { iconKey: 'TerminalSquare', name: "Hacker Supremo", color: "text-green-500" });
              logAction(`🕵️‍♂️ ${t.name} descubrió el código secreto: ${code}`);
          } else { showToast("Comando no reconocido.", "error"); }
      }
  };
  
  // --- ENDGAME PROTOCOL ---
  const executeEndgame = async () => {
      if(!isAdmin) return;
      playSfx('epic');
      speak("Lo logramos. Hemos salvado el universo.");
      triggerSecretConfetti(true); // Massive confetti
      setModal('endgame'); // Show cinematic modal
      
      const newBadges = teams.map(t => ({
          id: t.id,
          badge: { iconKey: 'Crown', name: `Héroe Temp ${t.prestige + 1}`, color: 'text-amber-400' }
      }));

      // Await sequence for stability
      for (const t of teams) {
          const badgeToAdd = newBadges.find(b => b.id === t.id).badge;
          await safeUpdate(t.id, { 
              points: 0, 
              prestige: t.prestige + 1,
              badges: [...(t.badges || []), badgeToAdd]
          });
      }
      await safeUpdate('mission_control', { bossDamageTaken: 0, omegaEvent: null });
      logAction("🚀 PROTOCOLO ENDGAME EJECUTADO. Universo Reiniciado. Prestigio Asignado.");
  };

  const openLootBox = async (tid) => { 
      const cost = dailyModifier.effect === 'CHEAP_LOOT' ? 25 : 50;
      if(await handleBuy(tid, cost, null)) { 
          speak("Abriendo..."); 
          setTimeout(() => { 
              const it = LOOT_ITEMS[Math.floor(Math.random()*LOOT_ITEMS.length)]; 
              setLootResult(it); 
              if(it.type === 'bad') safeUpdate(tid, { lastLoot: 'bad' }); else safeUpdate(tid, { lastLoot: 'good' }); 
              setTimeout(() => safeUpdate(tid, { lastLoot: null }), 5000); 
              if(it.val !== 0) handlePts(tid, it.val, null, true); 
              logAction(`${teams.find(t=>t.id===tid).name} loot: ${it.text}`); 
              if(it.type === 'good') playSfx('success'); else playSfx('error'); 
          }, 1500); 
      } 
  };
  
  const startDuel = () => { const s=[...teams].sort(()=>0.5-Math.random()); setDuelData({t1:s[0], t2:s[1], challenge:DUEL_CHALLENGES[Math.floor(Math.random()*DUEL_CHALLENGES.length)]}); setModal('duel'); playSfx('alarm'); speak("Civil War"); };
  const resolveDuel = (wid) => { if(wid){ const w=teams.find(t=>t.id===wid); handlePts(wid,5, null, true); logAction(`Civil War: Gana ${w.name}`); speak(`Gana ${w.name}`); playSfx('success'); } closeAllModals(); };
  const triggerMultiverse = () => { setModal('multiverse'); playSfx('alarm'); speak("Brecha"); setTimeout(() => { const e=MULTIVERSE_EVENTS[Math.floor(Math.random()*MULTIVERSE_EVENTS.length)]; setMultiverseEvent(e); speak(e.title); if(e.points!==0) { teams.forEach(t=>handlePts(t.id, e.points, null, true)); logAction(`Multiverso: ${e.title}`); } }, 2000); };
  const sendFuryMessage = () => { if(newFuryMsg.trim()) { safeUpdate('mission_control', { furyMsg: newFuryMsg }); playSfx('alarm'); speak("Mensaje de Fury"); setNewFuryMsg(""); closeAllModals(); }};
  
  const checkPass = (e) => { 
      e.preventDefault(); 
      try {
          const pExact = pass.trim(); const pLower = pExact.toLowerCase(); 
          if (pExact === 'Itinerarium@1274') { setIsAdmin(true); setLoggedInId(null); closeAllModals(); setPass(''); try{playSfx('success'); speak("Hola Director");}catch(err){} return; } 
          const t = INITIAL_TEAMS.find(tm => tm.password === pLower); 
          if (t) { setLoggedInId(t.id); setIsAdmin(false); closeAllModals(); setPass(''); try{playSfx('success'); speak(`Hola ${t.name}`);}catch(err){} return; } 
          try{playSfx('error');}catch(err){} showToast("Acceso denegado.", "error"); 
      } catch (err) { console.error("Login Error:", err); showToast("Error de sistema.", "error"); }
  };

  const handleLogoClick = () => { setSecretCount(p=>p+1); if(secretCount>4) { speak("Fiesta"); triggerSecretConfetti(); setSecretCount(0); } };
  const openCerebroMenu = () => { setCerebro({ active: true, target: null, searching: false, type: null }); };
  const activateCerebro = (type = 'member') => { const targetType = type === 'team' ? 'team' : 'member'; speak(targetType === 'team' ? "Buscando escuadrón" : "Buscando sujeto"); setCerebro({ active: true, target: null, searching: true, type: targetType }); const source = targetType === 'team' ? teams.map(t => t.name) : teams.flatMap(t => t.members); let i = 0; const interval = setInterval(() => { setCerebro(prev => ({ ...prev, target: source[Math.floor(Math.random() * source.length)] })); i++; if (i > 20) { clearInterval(interval); setCerebro(prev => ({ ...prev, searching: false })); speak("Localizado"); playSfx('success'); } }, 100); };
  const updateM = async (txt) => { if(!isAdmin) return; await safeUpdate('mission_control', { text: txt }); closeAllModals(); speak("Misión actualizada"); };
  const toggleAlert = async () => { if(!isAdmin) return; const s = !redAlertMode; setRedAlertMode(s); await safeUpdate('mission_control', { alert: s }); if(s) { speak("Alerta Roja."); logAction("ALERTA ROJA ACTIVADA"); playSfx('alarm'); } else logAction("Alerta desactivada"); };
  const spinPenalty = () => { if (selTeam.shield) { speak("Escudo activado"); playSfx('success'); safeUpdate(selTeam.id, { shield: false }); setPenalty("BLOCKED"); logAction(`${selTeam.name} bloqueó sanción`); return; } const p = PENALTIES_LIST[Math.floor(Math.random() * PENALTIES_LIST.length)]; setPenalty(p); playSfx('error'); if (selTeam) logAction(`${selTeam.name} sanción: ${p}`); };
  const openDailyQuestion = () => { const q = ACADEMIC_QUESTIONS[Math.floor(Math.random() * ACADEMIC_QUESTIONS.length)]; setDailyQuestion(q); setShowAnswer(false); setModal('dailyQ'); speak("Transmisión entrante."); setQuestionAvailable(false); };
  const openStarkRoulette = () => { if (!loggedInId) return; const t = teams.find(t => t.id === loggedInId); const today = new Date().toDateString(); if (t.lastSpin === today) { showToast("Ya has tirado hoy.", "error"); playSfx('error'); return; } setModal('roulette'); setStarkSpinning(false); setStarkPrize(null); };
  
  const spinStarkRoulette = () => { 
      if (starkSpinning) return; setStarkSpinning(true); playSfx('click'); 
      const prizes = [ { text: "+5 Puntos", val: 5, type: 'good' }, { text: "ESCUDO ACTIVADO", val: 0, shield: true, type: 'good' }, { text: "+10 Puntos", val: 10, type: 'good' }, { text: "-5 Puntos", val: -5, type: 'bad' }, { text: "INTÉNTALO DE NUEVO", val: 0, type: 'neutral' }, { text: "+3 Puntos", val: 3, type: 'good' }, { text: "BATERÍA BAJA", val: -2, type: 'bad' }, { text: "+1 Punto", val: 1, type: 'good' } ]; 
      setTimeout(() => { 
          const result = prizes[Math.floor(Math.random() * prizes.length)]; setStarkPrize(result); setStarkSpinning(false); 
          const today = new Date().toDateString(); let updates = { lastSpin: today }; 
          if (result.val !== 0) { handlePts(loggedInId, result.val, null, true); } 
          if (result.shield) { updates.shield = true; } safeUpdate(loggedInId, updates); 
          if(result.type === 'good') { playSfx('success'); triggerConfetti({clientX: window.innerWidth/2, clientY: window.innerHeight/2}); } else if (result.type === 'bad') { playSfx('error'); } 
      }, 2000); 
  };

  const generateMathQuestion = (lvl) => { if (lvl === 1) { const type = Math.random() > 0.5 ? 'int' : 'dec'; if (type === 'int') { const op = Math.random()>0.5?'+':'-'; const n1=Math.floor(Math.random()*40)+10; const n2=Math.floor(Math.random()*9)+1; const ans = op==='+'?n1+n2:n1-n2; return { q: `${n1} ${op} ${n2}`, a: ans.toString() }; } else { const n1=(Math.random()*5).toFixed(1); const n2=(Math.random()*5).toFixed(1); const ans=(parseFloat(n1)+parseFloat(n2)).toFixed(1); return { q: `${n1} + ${n2}`, a: ans }; } } if (lvl === 2) { const type = ['int', 'dec'][Math.floor(Math.random()*2)]; if (type === 'int') { const op = Math.random()>0.5?'+':'-'; const n1=Math.floor(Math.random()*500)+100; const n2=Math.floor(Math.random()*500)+50; const ans = op==='+'?n1+n2:n1-n2; return { q: `${n1} ${op} ${n2}`, a: ans.toString() }; } else { const n1=(Math.random()*50).toFixed(2); const n2=(Math.random()*20).toFixed(2); const ans=(parseFloat(n1)-parseFloat(n2)).toFixed(2); return { q: `${n1} - ${n2}`, a: ans }; } } const op = ['*','/'][Math.floor(Math.random()*2)]; if (op === '*') { const n1=Math.floor(Math.random()*50)+10; const n2=Math.floor(Math.random()*9)+2; return { q: `${n1} * ${n2}`, a: (n1*n2).toString() }; } else { const n2=Math.floor(Math.random()*9)+2; const ans=Math.floor(Math.random()*20)+5; const n1=n2*ans; return { q: `${n1} / ${n2}`, a: ans.toString() }; } };
  
  const startMathChallenge = () => { if (!loggedInId) return; const t = teams.find(t => t.id === loggedInId); if ((t.dailyMath || 0) >= 4) { showToast("Batería de Matemáticas al 100%.", "info"); playSfx('error'); return; } setMathState({ active: true, questions: [generateMathQuestion(2)], currentIdx: 0, level: 2 }); setStreak(0); setModal('mathChallenge'); speak("Iniciando entrenamiento."); };
  const submitMathAnswer = () => { 
      if (actionLock.current) return; actionLock.current = true; setTimeout(() => { actionLock.current = false; }, 300);
      const currentQ = mathState.questions[mathState.currentIdx]; if (!currentQ) return;
      const cleanInput = mathInput.trim().replace(',', '.'); 
      if (cleanInput === currentQ.a) { 
          setStreak(s => s + 1); playSfx('success'); let nextLevel = mathState.level; if (streak > 1 && nextLevel < 3) nextLevel++; 
          if (mathState.currentIdx < 4) { setMathState(prev => ({ ...prev, level: nextLevel, currentIdx: prev.currentIdx + 1, questions: [...prev.questions, generateMathQuestion(nextLevel)] })); setMathInput(""); } 
          else { handleTaskCompletion(loggedInId, 'math'); closeAllModals(); triggerSecretConfetti(); } 
      } else { 
          let nextLevel = Math.max(1, mathState.level - 1); playSfx('error'); speak("Fallo. Recalibrando nivel."); showToast(`Incorrecto. Era ${currentQ.a}.`, "info"); setMathState({ active: true, questions: [generateMathQuestion(nextLevel)], currentIdx: 0, level: nextLevel }); setMathInput(""); setStreak(0); 
      } 
  };
  
  const startWordChallenge = () => { const t = teams.find(t => t.id === loggedInId); if ((t.dailyWord || 0) >= 4) { showToast("Batería de Lengua al 100%.", "info"); playSfx('error'); return; } const word = HYDRA_WORDS[Math.floor(Math.random() * HYDRA_WORDS.length)]; const scrambled = word.split('').sort(() => 0.5 - Math.random()).join(''); setWordState({ active: true, word: word, scrambled: scrambled }); setWordInput(""); setModal('wordChallenge'); speak("Desencriptando transmisión de Hydra."); };
  const submitWordAnswer = () => { 
      if (actionLock.current) return; actionLock.current = true; setTimeout(() => { actionLock.current = false; }, 300);
      if (!wordState.active) return;
      if (wordInput.toUpperCase().trim() === wordState.word) { handleTaskCompletion(loggedInId, 'word'); closeAllModals(); } 
      else { playSfx('error'); showToast("Código incorrecto", "error"); setWordInput(""); } 
  };
  
  const startCombatChallenge = () => { if (!loggedInId) return; const t = teams.find(t => t.id === loggedInId); if ((t.dailyCombat || 0) >= 4) { showToast("Batería de Combate al 100%.", "info"); playSfx('error'); return; } const shuffled = [ ...COMBAT_QUESTIONS.easy.map(q => ({...q, diff: 'easy'})), ...COMBAT_QUESTIONS.medium.map(q => ({...q, diff: 'medium'})), ...COMBAT_QUESTIONS.hard.map(q => ({...q, diff: 'hard'})) ]; const selected = shuffled.sort(() => 0.5 - Math.random()).slice(0, 5); setCombatState({ active: true, questions: selected, currentIdx: 0, correctCount: 0 }); setCombatInput(""); setModal('combatChallenge'); speak("Simulación iniciada."); };
  const submitCombatAnswer = () => { 
      if (actionLock.current) return; actionLock.current = true; setTimeout(() => { actionLock.current = false; }, 300);
      const currentQ = combatState.questions[combatState.currentIdx]; if (!currentQ) return;
      const isCorrect = combatInput.toUpperCase().trim() === currentQ.a; 
      let newCorrectCount = combatState.correctCount + (isCorrect ? 1 : 0); 
      if (isCorrect) { playSfx('success'); showToast("¡Neutralizado!", "success"); } else { playSfx('error'); showToast(`Fallo. Era: ${currentQ.a}`, "error"); } 
      if (combatState.currentIdx < 4) { setCombatState(prev => ({ ...prev, currentIdx: prev.currentIdx + 1, correctCount: newCorrectCount })); setCombatInput(""); } 
      else { if (newCorrectCount === 5) { handleTaskCompletion(loggedInId, 'combat'); triggerSecretConfetti(); } else { showToast(`Simulación finalizada. ${newCorrectCount}/5.`, "info"); speak("Simulación fallida."); } closeAllModals(); setCombatInput(""); } 
  };
  
  const startMemoryChallenge = () => { if (!loggedInId) return; const t = teams.find(t => t.id === loggedInId); if ((t.dailyMemory || 0) >= 4) { showToast("Batería al 100%.", "info"); playSfx('error'); return; } const shuffledQs = [...ACADEMIC_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6); const cards = []; shuffledQs.forEach((item, index) => { cards.push({ id: `q-${index}`, content: item.q, type: 'q', pairId: index, isFlipped: false, isMatched: false }); cards.push({ id: `a-${index}`, content: item.a, type: 'a', pairId: index, isFlipped: false, isMatched: false }); }); cards.sort(() => 0.5 - Math.random()); setMemoryState({ active: true, cards: cards, flipped: [], matched: [], lock: false }); setModal('memoryChallenge'); speak("Sincronización iniciada."); };
  const handleCardClick = (id) => { 
      if (memoryState.lock) return; const clickedCard = memoryState.cards.find(c => c.id === id); if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return; 
      playSfx('click'); const newCards = memoryState.cards.map(c => c.id === id ? { ...c, isFlipped: true } : c); const newFlipped = [...memoryState.flipped, clickedCard]; 
      setMemoryState({ ...memoryState, cards: newCards, flipped: newFlipped }); 
      if (newFlipped.length === 2) { 
          setMemoryState(prev => ({ ...prev, lock: true })); 
          if (newFlipped[0].pairId === newFlipped[1].pairId) { 
              playSfx('success'); setTimeout(() => { 
                  const matchedCards = newCards.map(c => (c.id === newFlipped[0].id || c.id === newFlipped[1].id) ? { ...c, isMatched: true } : c); 
                  const newMatched = [...memoryState.matched, newFlipped[0].pairId]; 
                  if (newMatched.length === 6) { handleTaskCompletion(loggedInId, 'memory'); closeAllModals(); triggerSecretConfetti(); handleBadge(loggedInId, { iconKey: 'Brain', name: "Erudito", color: "text-purple-400" }); } 
                  else { setMemoryState(prev => ({ ...prev, cards: matchedCards, flipped: [], lock: false, matched: newMatched })); } 
              }, 1000); 
          } else { 
              playSfx('error'); setTimeout(() => { const resetCards = newCards.map(c => (c.id === newFlipped[0].id || c.id === newFlipped[1].id) ? { ...c, isFlipped: false } : c); setMemoryState(prev => ({ ...prev, cards: resetCards, flipped: [], lock: false })); }, 1000); 
          } 
      } 
  };

  const totalPoints = teams.reduce((a, b) => a + Math.max(0, b.points), 0);
  const maxPoints = Math.max(...teams.map(t => t.points), 50);
  const currentBossHp = Math.max(bossMaxHp - totalPoints - bossDamageTaken, 0);
  const bossDefeated = currentBossHp <= 0;
  const bossProgress = Math.min(100, ((totalPoints + bossDamageTaken) / bossMaxHp) * 100);
  const leaderId = teams.length > 0 ? [...teams].sort((a,b)=>b.points-a.points)[0].id : null;
  const loggedInTeam = teams.find(t => t.id === loggedInId);
  const sortedTeams = [...teams].sort((a,b)=>b.points-a.points);

  if (errorMsg) return <div className="p-10 text-red-500 bg-stone-950 h-screen font-mono">ERROR: {errorMsg}</div>;
  if (loading) return <div className="p-10 text-amber-500 bg-stone-950 h-screen font-mono animate-pulse flex items-center justify-center text-xl">CARGANDO PROTOCOLOS ÁUREOS...</div>;

  return (
    <div className={`min-h-screen bg-[#0f0a00] text-amber-500 font-mono selection:bg-amber-500 selection:text-black pb-28 relative overflow-hidden flex flex-col transition-colors duration-500 ${redAlertMode ? 'border-4 border-red-600' : ''} ${shaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}`}>
      <Confeti active={confetti.active} x={confetti.x} y={confetti.y} massive={confetti.massive} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* GOLDEN BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(245,158,11,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.15) 1px, transparent 1px)`, backgroundSize: '50px 50px' }}></div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1)_0%,transparent_50%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.1)_0%,transparent_50%)]"></div>

      {/* ALERTA ROJA OVERLAY GIGANTE */}
      {redAlertMode && (
        <div className="fixed inset-0 z-[45] pointer-events-none bg-red-950/60 flex flex-col items-center justify-center overflow-hidden mix-blend-color-dodge transition-all duration-500">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.1)_10px,rgba(220,38,38,0.1)_20px)] animate-pulse"></div>
            <div className="text-[12vw] font-black text-red-500 rotate-[-10deg] whitespace-nowrap animate-pulse border-y-8 border-red-600/50 w-[120%] text-center py-4 bg-red-900/30 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">
                ALERTA MÁXIMA
            </div>
            <div className="text-red-400 mt-8 text-2xl font-bold tracking-[0.5em] animate-bounce">SISTEMA EN CUARENTENA</div>
        </div>
      )}

      {/* OMEGA EVENT BANNER (GLOBAL) */}
      {omegaEvent?.active && (
         <div className="relative z-40 bg-red-900/90 border-b-4 border-red-500 text-center py-3 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
             <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] animate-pulse drop-shadow-md">🚨 ALERTA OMEGA: DEFENSA GLOBAL 🚨</h2>
             <p className="text-red-200 font-bold mb-1">Daño infligido: {omegaEvent.current} / {omegaEvent.target}</p>
             <p className="text-xs text-red-300 font-mono mb-2">TIEMPO RESTANTE: {Math.floor(omegaTimeLeft / 60000)}:{(Math.floor((omegaTimeLeft % 60000) / 1000)).toString().padStart(2, '0')}</p>
             <div className="w-full max-w-2xl mx-auto h-2 bg-black rounded-full overflow-hidden mb-3 border border-red-500/50">
                 <div className="h-full bg-red-500 transition-all duration-300" style={{width: `${(omegaEvent.current/omegaEvent.target)*100}%`}}></div>
             </div>
             {(loggedInId || isAdmin) && (
                 <button onClick={openOmegaQuestion} className="bg-white text-red-900 hover:bg-red-200 font-black px-6 py-2 rounded shadow-lg uppercase tracking-wider transition-colors">
                     ATACAR AHORA
                 </button>
             )}
         </div>
      )}

      <header className={`relative z-20 w-full p-4 border-b flex flex-wrap justify-between items-center gap-4 ${redAlertMode ? 'bg-red-900/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-[#1a1100]/90 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}>
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={handleLogoClick}>
            <div className={`absolute inset-0 blur-lg opacity-40 group-hover:opacity-80 transition-opacity rounded-full ${redAlertMode ? 'bg-red-500' : 'bg-amber-500'}`}></div>
            <img src="https://i.ibb.co/Ndt35H2Z/SHIELD-CSB.png" alt="S.H.I.E.L.D." className="w-10 h-10 object-contain relative z-10 active:scale-95 transition-transform" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 font-mono">
                <h1 className="text-xl font-black tracking-[0.2em] leading-none text-white drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">AVENGERS <span className={redAlertMode ? "text-red-500" : "text-amber-500"}>INITIATIVE</span></h1>
                <span className="text-[9px] font-bold text-amber-500/70 bg-amber-900/30 px-1 rounded border border-amber-700/50">{APP_VERSION}</span>
            </div>
            <div className="hidden md:block text-[10px] text-amber-300 mt-1 overflow-hidden whitespace-nowrap drop-shadow-sm flex items-center gap-2">
                <span className="bg-amber-900/50 px-1.5 py-0.5 rounded border border-amber-500/50 text-white flex items-center gap-1">
                    {dailyModifier.icon} {dailyModifier.name}
                </span>
                <span className="italic opacity-80">{dailyModifier.desc}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
            {useLocal && <span className="text-[10px] text-orange-500 font-mono bg-orange-900/20 px-2 py-1 rounded border border-orange-500/50 flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.3)]"><WifiOff size={10}/> LOCAL</span>}
            {questionAvailable && <button onClick={openDailyQuestion} className="animate-bounce bg-amber-900/50 border border-amber-500 px-3 py-1 rounded text-amber-300 text-xs font-bold flex gap-1 shadow-[0_0_10px_rgba(245,158,11,0.5)] hover:bg-amber-800/80 transition-colors"><Radio size={12}/> MENSAJE</button>}
            
            {loggedInId && !isAdmin && (
                <div className="flex gap-1">
                    <button onClick={startMathChallenge} className="bg-amber-900/30 border border-amber-500/50 px-3 py-1 rounded text-amber-300 text-xs font-bold flex gap-1 items-center hover:bg-amber-800/80 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Calculator size={14}/> MATES
                    </button>
                    <button onClick={startWordChallenge} className="bg-amber-900/30 border border-amber-500/50 px-3 py-1 rounded text-amber-300 text-xs font-bold flex gap-1 items-center hover:bg-amber-800/80 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Type size={14}/> DESCIFRAR
                    </button>
                    <button onClick={startCombatChallenge} className="bg-amber-900/30 border border-amber-500/50 px-3 py-1 rounded text-amber-300 text-xs font-bold flex gap-1 items-center hover:bg-amber-800/80 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Target size={14}/> COMBATE
                    </button>
                    <button onClick={startMemoryChallenge} className="bg-amber-900/30 border border-amber-500/50 px-3 py-1 rounded text-amber-300 text-xs font-bold flex gap-1 items-center hover:bg-amber-800/80 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Grid3X3 size={14}/> MEMORIA
                    </button>
                    <button onClick={openStarkRoulette} className="bg-amber-900/30 border border-amber-500/50 px-3 py-1 rounded text-amber-300 text-xs font-bold flex gap-1 items-center hover:bg-amber-800/80 transition-colors animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Disc size={14}/> RULETA
                    </button>
                </div>
            )}

            {isAdmin ? (
                <>
                  <button onClick={triggerOmegaAlert} className="p-2 rounded border bg-red-900/50 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]" title="ALERTA OMEGA"><AlertOctagon size={16}/></button>
                  <button onClick={backupData} className="p-2 rounded border bg-[#1a1100]/50 border-amber-500/40 text-amber-400 hover:text-amber-300 hover:bg-amber-900/50 transition-colors" title="Guardar Copia"><Save size={16}/></button>
                  <button onClick={restoreData} className="p-2 rounded border bg-[#1a1100]/50 border-amber-500/40 text-amber-400 hover:text-amber-300 hover:bg-amber-900/50 transition-colors" title="Restaurar Copia"><Upload size={16}/></button>
                  <button onClick={resetDailyLimits} className="p-2 rounded border bg-[#1a1100]/50 border-amber-500/40 text-amber-400 hover:text-amber-300 hover:bg-amber-900/50 transition-colors" title="Recargar Días"><RefreshCw size={16}/></button>
                  <button onClick={handleBossAttack} className="p-2 rounded border bg-red-900/30 border-red-500/50 text-red-400 hover:scale-110 transition-transform animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]" title="ATAQUE DE THANOS"><Skull size={16}/></button>
                  <button onClick={()=>setModal('fury')} className="p-2 rounded border bg-[#1a1100]/50 border-amber-500/40 text-amber-400 hover:text-amber-200 transition-colors" title="Mensaje Director"><MessageSquare size={16}/></button>
                  <button onClick={startDuel} className="p-2 rounded border bg-orange-900/20 border-orange-500/50 text-orange-400 hover:text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-colors"><Swords size={16}/></button>
                  <button onClick={triggerMultiverse} className="p-2 rounded border bg-purple-900/20 border-purple-500/50 text-purple-400 hover:text-purple-300 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-colors"><Dices size={16}/></button>
                  <button onClick={openCerebroMenu} className="p-2 rounded border bg-amber-900/20 border-amber-500/50 text-amber-400 hover:text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-colors" title="NEXO: Elegir Alumno/Equipo"><Brain size={16}/></button>
                  <button onClick={toggleAlert} className={`p-2 rounded border ${redAlertMode ? 'bg-red-900/80 border-red-400 text-red-200 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-[#1a1100]/50 border-red-900/50 text-red-500 hover:bg-red-900/30 transition-colors'}`} title="ALERTA ROJA (EMERGENCIA)"><Siren size={16}/></button>
                  <button onClick={()=>setModal('history')} className="p-2 rounded border bg-[#1a1100]/50 border-amber-500/40 text-amber-500 hover:text-amber-300 transition-colors"><History size={16}/></button>
                  <button onClick={reset} className="p-2 rounded border bg-[#1a1100]/50 border-red-900/50 text-red-500 hover:bg-red-900/30 transition-colors"><Trash2 size={16}/></button>
                  <button onClick={()=>{setIsAdmin(false); setLoggedInId(null);}} className="bg-red-900/30 border border-red-500/50 px-3 py-1 rounded text-xs font-bold text-red-400 hover:bg-red-900/60 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.2)]">SALIR</button>
                </>
            ) : loggedInId ? (
                <button onClick={()=>{setIsAdmin(false); setLoggedInId(null);}} className="bg-yellow-900/30 border border-yellow-500/50 px-3 py-1 rounded text-xs font-bold text-yellow-400 hover:bg-yellow-900/60 transition-colors shadow-[0_0_10px_rgba(250,204,21,0.2)]">SALIR</button>
            ) : (
                <button onClick={()=>setModal('login')} className="bg-amber-900/30 border border-amber-500/50 px-3 py-1 rounded text-xs font-bold text-amber-400 hover:bg-amber-900/60 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)]"><Lock size={12}/> ACCESO</button>
            )}
            <button onClick={() => setSound(!sound)} className={`p-2 rounded border ${sound ? 'bg-amber-900/40 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-stone-950 border-amber-900/50 text-amber-700'}`}>{sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button>
            <button onClick={() => setModal('catalog')} className="flex gap-1 px-3 py-1.5 bg-[#1a1100]/80 border border-amber-700/50 rounded-sm text-amber-500 hover:text-amber-300 hover:border-amber-500/50 transition-colors text-xs font-bold uppercase"><Info size={14}/> INFO</button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
        <aside className="xl:col-span-1 space-y-6">
          <div className="bg-[#1a1100]/80 border border-amber-500/30 rounded-sm p-5 shadow-[0_0_20px_rgba(245,158,11,0.1)] flex flex-col relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
             <h3 className="text-lg font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-amber-500/30 pb-2 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"><TrendingUp size={20} /> Clasificación</h3>
             <div className="space-y-3 flex-1">
                {sortedTeams.map((t, i) => {
                   const rInfo = getRankInfo(t.points);
                   const isNeg = t.points < 0;
                   const clr = i === 0 ? "text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" : i === 1 ? "text-amber-200" : i === 2 ? "text-orange-400" : "text-amber-500";
                   const nextRankPct = Math.min(100, Math.max(0, ((t.points - (rInfo.next - rInfo.total)) / rInfo.total) * 100));

                   return (
                      <div key={t.id}>
                         <div className="flex justify-between items-center mb-1 text-xs font-bold uppercase tracking-wide"><span className={`flex items-center gap-2 ${clr}`}>{i === 0 && <Crown size={12} className="animate-bounce" />} #{i + 1} {t.name} <span className="text-[9px] text-amber-600 ml-1 opacity-70 flex items-center gap-0.5"><Rocket size={8}/> {t.prestige}</span></span><span className={isNeg ? "text-red-400" : "text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"}>{t.points}</span></div>
                         <div className="h-1 bg-stone-950 rounded-full overflow-hidden mb-1 border border-amber-900/30"><div className={`h-full transition-all duration-1000 ${isNeg ? 'bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.8)]' : 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]'}`} style={{ width: `${Math.min(100, Math.max(0, (t.points / (bossMaxHp/3)) * 100))}%` }}></div></div>
                         {/* XP BAR */}
                         <div className="h-0.5 bg-stone-950 rounded-full overflow-hidden w-full opacity-50"><div className="h-full bg-amber-400/50" style={{ width: `${nextRankPct}%` }}></div></div>
                         {t.doublePointsUntil > Date.now() && (
                            <div className="text-[8px] font-bold text-yellow-400 animate-pulse mt-0.5 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">X2 PUNTOS ACTIVADO</div>
                         )}
                      </div>
                   );
                })}
             </div>
          </div>
          
          <div className="bg-[#1a1100]/80 border border-purple-500/40 rounded-sm p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden backdrop-blur-xl group">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.6)] bg-purple-900/50"><img src="https://i.ibb.co/7NjPsfgb/183d8eefe6fe041dd1169fdeaab016f8.gif" alt="Thanos" className="w-full h-full object-cover opacity-80 mix-blend-screen" /></div>
                  <div><h3 className="text-sm font-black text-purple-400 uppercase leading-none mb-1 drop-shadow-[0_0_5px_rgba(168,85,247,0.6)]">Amenaza: Thanos</h3><span className="text-xs font-mono text-purple-300">{totalPoints + bossDamageTaken}/{bossMaxHp} DAÑO</span></div>
               </div>
               <div className="h-4 bg-stone-950 rounded-full overflow-hidden border border-purple-900/50 relative"><div className={`h-full transition-all duration-1000 flex items-center justify-center ${bossDefeated ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-gradient-to-r from-purple-600 to-red-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'}`} style={{width: `${bossProgress}%`}}></div></div>
               {bossDefeated && <p className="text-center text-xs font-bold text-amber-400 mt-2 animate-pulse drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">¡AMENAZA NEUTRALIZADA!</p>}
               {bossDefeated && isAdmin && (
                  <button onClick={executeEndgame} className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse transition-all">EJECUTAR ENDGAME</button>
               )}
            </div>
          </div>

          <div onClick={() => isAdmin && setModal('mission')} className={`bg-[#1a1100]/80 border border-amber-500/30 rounded-sm p-5 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group backdrop-blur-xl ${isAdmin?'cursor-pointer hover:border-amber-400/50 transition-colors':''}`}>
             <h3 className="text-xs font-black text-amber-400 uppercase mb-2 flex gap-2 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"><ClipboardList size={14}/> Misión Prioritaria</h3>
             <p className="text-xs text-amber-100 font-mono leading-relaxed">"{mission}"</p>
          </div>
        </aside>

        <section className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          {teams.map(t => {
            const Icon = ICONS[t.iconKey] || Shield;
            const isMine = loggedInId === t.id;
            const rInfo = getRankInfo(t.points);

            const isUnderdog = (sortedTeams.findIndex(st => st.id === t.id) >= sortedTeams.length - 2) && sortedTeams.length > 2;
            const isNeg = t.points < 0;

            return (
              <div key={t.id} className={`relative group rounded p-[1px] transition-all ${isMine?'scale-[1.02] z-10':'hover:scale-[1.01]'}`}>
                <div className={`absolute inset-0 rounded bg-gradient-to-b ${t.theme} opacity-30`}></div>
                <div className={`h-full bg-stone-950/95 border ${isMine?'border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.3)]':t.border + ' shadow-[0_0_20px_rgba(245,158,11,0.05)]'} p-4 rounded backdrop-blur-xl flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute -right-0 -bottom-0 w-40 h-40 opacity-15 pointer-events-none transition-transform group-hover:scale-110" style={{mixBlendMode:'screen'}}><img src={t.gif} className="w-full h-full object-cover" onError={(e) => e.target.src="https://i.ibb.co/27K5dCBM/b751779a4a3bbc38f9268036cdb5af5a.gif"}/></div>
                  
                  {/* SHIELD OVERLAY */}
                  {t.shield && (
                      <div className="absolute top-2 right-2 z-20 text-blue-400 animate-pulse drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" title="Campo de Fuerza Activo">
                          <ShieldCheck size={32} strokeWidth={2} fill="rgba(59, 130, 246, 0.2)"/>
                      </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex gap-2 items-center">
                        <div className={`w-10 h-10 rounded-full border border-amber-500/30 bg-[#1a1100] overflow-hidden shadow-inner ${t.accent}`}><img src={t.gif} className="w-full h-full object-cover opacity-80 mix-blend-screen" onError={(e) => e.target.src="https://i.ibb.co/27K5dCBM/b751779a4a3bbc38f9268036cdb5af5a.gif"}/></div>
                        <div className="flex flex-col">
                          <div className={`text-[8px] font-black uppercase tracking-widest ${rInfo.color} drop-shadow-md`}>{rInfo.title}</div>
                          <div className="flex items-center gap-2">
                             <h2 className="text-sm font-black uppercase tracking-wider text-white truncate max-w-[140px] leading-none drop-shadow-md">
                                 {t.name}
                                 {t.prestige > 0 && <span className="ml-1.5 text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] text-xs">★{t.prestige}</span>}
                             </h2>
                             {isUnderdog && (
                                <span className="bg-amber-500 text-black text-[7px] px-1 py-0.5 rounded-sm animate-pulse font-bold shadow-[0_0_10px_rgba(245,158,11,0.8)]" title="Refuerzos de S.H.I.E.L.D. en camino (+1 Punto Extra)">
                                   🔥 BONUS
                                </span>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      {/* POINTS DISPLAY & MANUAL EDIT */}
                      <div className="flex items-center gap-2">
                          {isAdmin && editMode[t.id] ? (
                              <input 
                                type="number" 
                                autoFocus
                                defaultValue={t.points}
                                onBlur={(e) => handleManualEdit(t.id, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleManualEdit(t.id, e.target.value)}
                                className="w-16 bg-black border border-amber-500 rounded text-center text-sm font-mono text-amber-400 focus:shadow-[0_0_10px_rgba(245,158,11,0.5)] outline-none"
                              />
                          ) : (
                              <span className={`text-3xl font-black font-mono tracking-tighter ${t.points<0?'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]':'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}>{t.points}</span>
                          )}
                          {isAdmin && (
                              <button onClick={() => setEditMode({...editMode, [t.id]: true})} className="opacity-50 hover:opacity-100 text-amber-600 hover:text-amber-400 transition-colors">
                                  <Edit3 size={12}/>
                              </button>
                          )}
                      </div>
                    </div>
                    
                    {/* WAKANDA LOOT EFFECT BADGE */}
                    {t.lastLoot && (
                        <div className={`absolute top-2 right-12 z-20 px-2 py-1 rounded text-[9px] font-bold uppercase animate-pulse shadow-lg ${t.lastLoot === 'bad' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.8)]'}`}>
                            {t.lastLoot === 'bad' ? '¡MALDICIÓN!' : '¡SUERTE!'}
                        </div>
                    )}

                    {/* DAILY ENERGY CELLS (NEON STYLE) */}
                    <div className="flex flex-col gap-1.5 mb-3 mt-4">
                        <div className="flex items-center gap-2 text-[9px] text-amber-700">
                          <Calculator size={10} className="text-amber-400 drop-shadow-[0_0_2px_rgba(245,158,11,0.8)]"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-4 h-1.5 rounded-sm border ${i<(t.dailyMath||0)?'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]':'bg-stone-900 border-amber-900/50'}`}></div>)}</div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-amber-700">
                          <Type size={10} className="text-purple-500 drop-shadow-[0_0_2px_rgba(168,85,247,0.8)]"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-4 h-1.5 rounded-sm border ${i<(t.dailyWord||0)?'bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]':'bg-stone-900 border-amber-900/50'}`}></div>)}</div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-amber-700">
                          <Target size={10} className="text-red-500 drop-shadow-[0_0_2px_rgba(239,68,68,0.8)]"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-4 h-1.5 rounded-sm border ${i<(t.dailyCombat||0)?'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]':'bg-stone-900 border-amber-900/50'}`}></div>)}</div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-amber-700">
                          <Grid3X3 size={10} className="text-cyan-500 drop-shadow-[0_0_2px_rgba(6,182,212,0.8)]"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-4 h-1.5 rounded-sm border ${i<(t.dailyMemory||0)?'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]':'bg-stone-900 border-amber-900/50'}`}></div>)}</div>
                        </div>
                    </div>

                    {/* BADGES ROW */}
                    {t.badges && t.badges.length > 0 && (
                        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                            {t.badges.map((b, idx) => {
                                const BIcon = b.iconKey && BADGE_ICONS[b.iconKey] ? BADGE_ICONS[b.iconKey] : Star;
                                return (
                                    <div key={idx} className={`p-1 rounded bg-[#1a1100] border border-amber-900/50 ${b.color || 'text-yellow-400'} shadow-inner flex items-center justify-center`} title={b.name}>
                                        <BIcon size={14} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex gap-1 mb-3 relative z-10">
                       {t.points >= 100 && <Award size={14} className="text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />}
                       {t.points >= 300 && <Award size={14} className="text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />}
                       {t.points >= 500 && <Award size={14} className="text-yellow-500 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />}
                    </div>
                    <div className="flex justify-between bg-[#1a1100]/80 p-1 rounded mb-3 border border-amber-900/40 relative z-10 shadow-inner">{INFINITY_STONES.map((s,i)=>(<div key={i} title={s.name} className={t.points>=s.threshold?s.color:'text-amber-900'}><Hexagon size={12} fill="currentColor"/></div>))}</div>
                    <div className="mb-4 relative z-10 pl-2 border-l border-amber-900/50">
                        <div className="text-[9px] uppercase tracking-widest opacity-60 font-bold text-amber-500 mb-1">OPERATIVOS Y ROLES</div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                            {t.members?.map((m, idx) => (
                                <div key={idx} className="bg-amber-900/20 border border-amber-500/30 rounded px-2 py-1 text-[10px] font-mono shadow-[0_0_8px_rgba(245,158,11,0.1)] flex flex-col justify-center">
                                    <span className="text-[8px] text-amber-500/80 mb-0.5">{ROLES[idx]}</span>
                                    <span className="text-amber-200 truncate">{m}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <div className="mb-4 relative pl-3 border-l-2 border-amber-500/30 group-hover:border-amber-400/60 transition-colors"><p className={`text-xs italic font-medium leading-tight ${t.accent} opacity-90 drop-shadow-sm`}>"{t.quote}"</p></div>
                    {/* Admin and User buttons */}
                    {isAdmin && (
                      <div className="grid gap-1">
                        <div className="flex gap-1">{[1,5,10].map(v => <button key={v} onClick={(e)=>handlePts(t.id, v, e)} className={`${CTRL_BTN_CLASS} bg-amber-900/30 text-amber-400 border-amber-500/50 hover:bg-amber-500 hover:text-black hover:shadow-[0_0_10px_rgba(245,158,11,0.8)]`}>+{v}</button>)}</div>
                        <div className="flex gap-1">{[-1,-5,-10].map(v => <button key={v} onClick={(e)=>handlePts(t.id, v, e)} className={`${CTRL_BTN_CLASS} bg-red-900/30 text-red-400 border-red-500/50 hover:bg-red-500 hover:text-black hover:shadow-[0_0_10px_rgba(239,68,68,0.8)]`}>{v}</button>)}</div>
                        <div className="flex gap-1 mt-1">
                          <button onClick={()=>openShop(t)} className={`${CTRL_BTN_CLASS} bg-yellow-900/30 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500 hover:text-black flex justify-center gap-1 hover:shadow-[0_0_10px_rgba(250,204,21,0.8)]`}><ShoppingCart size={12}/> TIENDA</button>
                          <button onClick={()=>{setSelTeam(t); setPenalty(null); setModal('penalty');}} className={`${CTRL_BTN_CLASS} flex items-center justify-center gap-1 ${isNeg ? 'bg-purple-900/30 text-purple-400 border-purple-500/50 hover:bg-purple-500 hover:text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-stone-900 text-amber-800 border-amber-900/50 cursor-not-allowed'}`}><Gavel size={12}/> SANCIÓN</button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                            <button onClick={()=>setModal('badges_' + t.id)} className={`${CTRL_BTN_CLASS} bg-cyan-900/30 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_10px_rgba(34,211,238,0.8)]`}>MEDALLA</button>
                            <button onClick={()=>triggerMatrixEvent(t.id)} className={`${CTRL_BTN_CLASS} bg-fuchsia-900/50 text-fuchsia-400 border-fuchsia-500 hover:bg-fuchsia-500 hover:text-white hover:shadow-[0_0_15px_rgba(217,70,239,0.8)] flex justify-center gap-1 animate-pulse`}><Pill size={12}/> ANOMALÍA</button>
                        </div>
                      </div>
                    )}
                    {isMine && !isAdmin && <button onClick={()=>openShop(t)} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded uppercase shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:shadow-[0_0_20px_rgba(250,204,21,0.8)] transition-all tracking-wider">ARMERÍA Y MEJORAS</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
        
        {/* TERMINAL FLOTANTE (EASTER EGGS) */}
        <div className="fixed bottom-12 right-6 z-50 flex items-end justify-end">
            {terminalOpen && (
                <div className="mb-2 bg-black border border-amber-400 p-2 rounded shadow-[0_0_15px_rgba(245,158,11,0.3)] flex gap-2 animate-in slide-in-from-bottom-2">
                    <span className="text-amber-500 font-bold">&gt;_</span>
                    <input 
                        type="text" 
                        autoFocus
                        value={terminalInput}
                        onChange={(e)=>setTerminalInput(e.target.value)}
                        onKeyDown={handleTerminalSubmit}
                        className="bg-transparent border-none outline-none text-amber-300 font-mono w-40 uppercase"
                        placeholder="COMANDO..."
                    />
                </div>
            )}
            {loggedInId && !isAdmin && (
                <button onClick={()=>setTerminalOpen(!terminalOpen)} className="bg-stone-900 border border-amber-700 text-amber-500 hover:text-amber-300 hover:border-amber-400 p-3 rounded-full transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <TerminalSquare size={20} />
                </button>
            )}
        </div>

        {/* FOOTER TICKER */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950 border-t border-amber-900/50 h-8 flex items-center overflow-hidden">
          <div className="bg-stone-900 px-4 h-full flex items-center z-10 border-r border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span className="font-bold text-[10px] uppercase tracking-widest text-amber-400 whitespace-nowrap flex items-center gap-2"><Activity size={12} className="animate-pulse text-amber-500" /> S.H.I.E.L.D. COMMS</span>
          </div>
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
             <div className="absolute whitespace-nowrap animate-[marquee_25s_linear_infinite] text-[10px] font-mono text-amber-200/70 uppercase tracking-widest w-full">
               {TICKER_MESSAGES[tickerIdx]}
             </div>
          </div>
        </div>
      </main>

      {/* ENDGAME PROTOCOL MODAL */}
      {modal === 'endgame' && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white p-4 animate-in fade-in duration-1000">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.2),transparent_70%)] animate-pulse"></div>
              <Crown size={120} className="text-yellow-500 mb-8 drop-shadow-[0_0_30px_rgba(250,204,21,1)] animate-bounce" />
              <h1 className="text-6xl md:text-8xl font-black text-black uppercase tracking-[0.2em] mb-6 text-center drop-shadow-2xl">VICTORIA ABSOLUTA</h1>
              <p className="text-2xl md:text-4xl font-mono text-slate-800 text-center max-w-4xl leading-relaxed">
                  El universo ha sido salvado. Habéis demostrado que el verdadero poder reside en el trabajo en equipo, el esfuerzo y el conocimiento.
              </p>
              <p className="mt-8 text-xl font-bold text-yellow-600 uppercase tracking-widest animate-pulse">Iniciando reestructuración del multiverso...</p>
          </div>
      )}

      {/* MATRIX PILL EVENT MODAL */}
      {modal === 'matrixPill' && matrixTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4">
              <div className="bg-[#0f0a00] border-2 border-amber-400 p-8 rounded-lg w-full max-w-lg text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent_70%)] animate-pulse"></div>
                  
                  {!pillResult ? (
                      <div className="relative z-10">
                          <Zap size={64} className="mx-auto text-amber-400 mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                          <h3 className="text-2xl font-black text-amber-300 uppercase tracking-widest mb-4">ANOMALÍA DETECTADA</h3>
                          <p className="text-sm text-amber-100 mb-8 font-mono">El sistema ha interceptado al equipo <span className="font-bold text-white">{matrixTarget.name}</span>. Deben tomar una decisión ahora.</p>
                          
                          <div className="grid grid-cols-2 gap-6">
                              <button onClick={() => resolveMatrixPill('red')} className="group flex flex-col items-center gap-3 p-6 border-2 border-red-900 bg-red-950/30 hover:bg-red-900 hover:border-red-500 rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                                  <div className="w-16 h-16 rounded-full bg-red-600 shadow-[inset_0_-5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-white font-bold">R-1</div>
                                  <span className="text-xs text-red-400 font-mono group-hover:text-white">SOBRECARGA (RIESGO)</span>
                              </button>
                              <button onClick={() => resolveMatrixPill('blue')} className="group flex flex-col items-center gap-3 p-6 border-2 border-blue-900 bg-blue-950/30 hover:bg-blue-900 hover:border-blue-500 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                                  <div className="w-16 h-16 rounded-full bg-blue-600 shadow-[inset_0_-5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-white font-bold">B-2</div>
                                  <span className="text-xs text-blue-400 font-mono group-hover:text-white">CORTAFUEGOS (DEFENSA)</span>
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="animate-in zoom-in relative z-10">
                          <h3 className="text-2xl font-black text-white mb-4">RESULTADO DE LA ELECCIÓN</h3>
                          <p className="text-xl font-mono text-amber-400 mb-8">{pillResult}</p>
                          <button onClick={closeAllModals} className="px-8 py-3 bg-stone-950 border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black font-bold rounded uppercase transition-colors">VOLVER AL NEXO</button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* OMEGA CHALLENGE MODAL */}
      {modal === 'omegaChallenge' && omegaQuestion && omegaEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="bg-[#0f0a00] border-2 border-red-500 p-6 rounded-sm w-full max-w-md shadow-[0_0_30px_rgba(239,68,68,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-pulse"></div>
                  <h3 className="text-xl font-black text-red-500 mb-1 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"><Target size={24}/> OBJETIVO COMPARTIDO</h3>
                  <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-mono text-red-400">Daño Global: {omegaEvent.current} / {omegaEvent.target}</p>
                  </div>

                  <div className="bg-[#1a1100] p-6 rounded border border-red-900/50 mb-6 text-center flex flex-col gap-2 shadow-inner">
                      <p className="text-lg font-mono font-bold text-red-300 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                          {omegaQuestion.q}
                      </p>
                  </div>

                  <input 
                      type="text" 
                      value={omegaInput} 
                      onChange={(e) => setOmegaInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitOmegaAnswer()}
                      className="w-full bg-black border border-red-700 p-3 text-red-400 text-center font-bold text-xl mb-4 focus:border-red-400 outline-none focus:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-shadow uppercase"
                      placeholder="Respuesta..."
                      autoFocus
                  />
                  
                  <div className="flex gap-2">
                      <button onClick={closeAllModals} className="flex-1 py-3 text-xs text-red-600 hover:text-red-400 transition-colors">HUIR</button>
                      <button onClick={submitOmegaAnswer} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded uppercase hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-shadow">ATACAR</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODALS (STARK ROULETTE) --- */}
      {modal === 'roulette' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="bg-[#0f0a00] border-2 border-orange-500 p-8 rounded-lg w-full max-w-sm text-center shadow-[0_0_50px_rgba(249,115,22,0.3)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_70%)]"></div>
                  <Disc size={64} className={`mx-auto text-orange-500 mb-6 ${starkSpinning ? 'animate-spin' : ''}`} />
                  <h3 className="text-2xl font-black text-orange-500 uppercase tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">RULETA STARK</h3>
                  <p className="text-xs text-orange-200/50 mb-8 font-mono">ACCESO DIARIO AUTORIZADO</p>
                  
                  {starkPrize ? (
                      <div className="animate-in zoom-in">
                          <p className={`text-xl font-bold mb-2 ${starkPrize.type === 'bad' ? 'text-red-500' : starkPrize.type === 'good' ? 'text-amber-400' : 'text-amber-200'}`}>
                              {starkPrize.text}
                          </p>
                          <button onClick={closeAllModals} className="mt-6 px-8 py-3 bg-[#1a1100] border border-amber-500/50 hover:bg-amber-900/30 text-amber-400 font-bold rounded uppercase transition-colors">ACEPTAR</button>
                      </div>
                  ) : (
                      <button 
                          onClick={spinStarkRoulette} 
                          disabled={starkSpinning}
                          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase tracking-widest rounded shadow-[0_0_20px_rgba(234,88,12,0.6)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {starkSpinning ? "INICIANDO..." : "GIRAR AHORA"}
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* SHOP MODAL */}
      {modal === 'shop' && selTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={closeAllModals}></div>
          <div className="relative bg-[#0f0a00] border-2 border-yellow-500 w-full max-w-2xl rounded-sm overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.3)]">
            
            <div className="bg-yellow-900/10 p-6 border-b border-yellow-500/30 flex justify-between items-center">
              <div>
                  <h3 className="text-xl font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"><ShoppingCart size={20} /> Panel de Mejoras</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm font-mono"><span className="text-yellow-700">Equipo: <span className="text-yellow-500 font-bold">{selTeam.name}</span></span><span className="text-yellow-700">Saldo: <span className="text-yellow-400 font-bold text-lg drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{selTeam.points}</span></span></div>
              </div>
              <button onClick={closeAllModals} className="text-yellow-800 hover:text-yellow-500 transition-colors">✕</button>
            </div>

            <div className="flex border-b border-yellow-900/50 bg-[#1a1100]">
               <button onClick={() => setShopTab('rewards')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${shopTab === 'rewards' ? 'text-yellow-400 border-b-2 border-yellow-500 bg-yellow-900/20' : 'text-yellow-800 hover:text-yellow-600'}`}>Recompensas</button>
               <button onClick={() => setShopTab('tech')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${shopTab === 'tech' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-900/20' : 'text-cyan-800 hover:text-cyan-600'}`}>Tecnología</button>
            </div>

            <div className="p-6 grid gap-4 max-h-[50vh] overflow-y-auto">
              {shopTab === 'rewards' ? (
                <>
                  <div className="mb-4 bg-purple-900/10 border border-purple-500/50 p-4 rounded-sm flex justify-between items-center animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.1)]"><div className="flex gap-4"><div className="bg-purple-500/20 p-3 rounded-sm text-purple-400 border border-purple-500/30"><Package size={24}/></div><div><h4 className="font-bold text-purple-400 font-mono drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]">CAJA DE WAKANDA</h4><p className="text-xs text-purple-600 font-mono">¿Te atreves? Resultado aleatorio.</p></div></div><button onClick={() => openLootBox(selTeam.id)} disabled={selTeam.points < (dailyModifier.effect === 'CHEAP_LOOT' ? 25 : 50)} className={`px-6 py-2 rounded-sm font-bold font-mono text-sm border ${selTeam.points >= (dailyModifier.effect === 'CHEAP_LOOT' ? 25 : 50) ? 'bg-purple-900/30 hover:bg-purple-600 text-purple-300 hover:text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all' : 'bg-transparent text-purple-900 border-purple-900/50 cursor-not-allowed'}`}>{dailyModifier.effect === 'CHEAP_LOOT' ? 25 : 50} PTS</button></div>
                  {lootResult && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"><div className="text-center animate-in zoom-in"><Package size={64} className="mx-auto text-yellow-500 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" /><h2 className="text-3xl font-black text-yellow-400 mb-2 font-mono">{lootResult.text}</h2><button onClick={()=>setLootResult(null)} className="mt-8 px-6 py-2 bg-[#1a1100] border border-yellow-700 text-yellow-500 hover:bg-yellow-900/30 rounded text-xs uppercase font-mono transition-colors">Cerrar</button></div></div>}
                  {REWARDS_LIST.map((reward) => (<div key={reward.id} className="group relative bg-[#1a1100] border border-green-900/50 hover:border-yellow-500/50 rounded-sm p-4 transition-all hover:bg-yellow-900/10 flex justify-between items-center"><div className="flex items-start gap-4"><div className="bg-yellow-900/20 p-3 rounded-sm text-yellow-600 group-hover:text-yellow-400 group-hover:scale-110 transition-all border border-yellow-900/30 group-hover:border-yellow-500/50"><Zap size={20} /></div><div><h4 className="font-bold text-green-500 group-hover:text-yellow-400 transition-colors uppercase tracking-wide font-mono">{reward.name}</h4><p className="text-xs text-green-700 group-hover:text-yellow-600 mt-1 font-mono transition-colors">{reward.desc}</p></div></div><button onClick={() => handleBuy(selTeam.id, reward.cost, reward)} disabled={selTeam.points < reward.cost} className={`px-6 py-2 rounded-sm font-bold font-mono text-sm border transition-all duration-300 ${selTeam.points >= reward.cost ? 'bg-yellow-900/20 text-yellow-500 border-yellow-600 hover:bg-yellow-500 hover:text-black shadow-[0_0_10px_rgba(250,204,21,0.2)] hover:shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-transparent text-green-900 border-green-900/50 cursor-not-allowed'}`}>{reward.cost} PTS</button></div>))}
                </>
              ) : (
                <>
                  <div className="mb-4 text-center">
                      <p className="text-xs text-cyan-500 font-mono">Inversiones a largo plazo para mejorar el rendimiento del equipo.</p>
                  </div>
                  {UPGRADES_LIST.map((upg) => {
                     const isOwned = selTeam.upgrades && selTeam.upgrades[upg.id];
                     return (
                        <div key={upg.id} className={`group relative bg-[#1a1100] border rounded-sm p-4 transition-all flex justify-between items-center ${isOwned ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-cyan-900/50 hover:border-cyan-500/50'}`}>
                          <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-sm transition-all border ${isOwned ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-cyan-900/20 text-cyan-700 border-cyan-900/30'}`}>{upg.icon}</div>
                              <div>
                                  <h4 className={`font-bold uppercase tracking-wide font-mono ${isOwned ? 'text-cyan-400' : 'text-cyan-600'}`}>{upg.name}</h4>
                                  <p className="text-xs text-cyan-700 mt-1 font-mono">{upg.desc}</p>
                                  {isOwned && <p className="text-[10px] text-cyan-500 font-bold mt-2 uppercase animate-pulse">INSTALADO Y ACTIVO</p>}
                              </div>
                          </div>
                          {!isOwned ? (
                             <button onClick={() => handleBuy(selTeam.id, upg.cost, upg)} disabled={selTeam.points < upg.cost} className={`px-6 py-2 rounded-sm font-bold font-mono text-sm border transition-all duration-300 ${selTeam.points >= upg.cost ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500 hover:bg-cyan-500 hover:text-black shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-transparent text-cyan-900 border-cyan-900/50 cursor-not-allowed'}`}>{upg.cost} PTS</button>
                          ) : (
                             <div className="px-6 py-2 rounded-sm font-bold font-mono text-sm border border-cyan-500/50 bg-cyan-500/10 text-cyan-500">ADQUIRIDO</div>
                          )}
                        </div>
                     )
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GUANTELETE MODAL */}
      {modal === 'gauntlet' && loggedInTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={closeAllModals}></div>
          <div className="relative bg-[#0f0a00] border-2 border-yellow-500 w-full max-w-2xl rounded-sm overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.3)] flex flex-col max-h-[90vh]">
            <div className="bg-yellow-900/20 p-6 border-b border-yellow-500/20 flex justify-between items-center">
              <h3 className="text-xl font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"><Hand size={24} /> El Guantelete del Infinito</h3>
              <button onClick={closeAllModals} className="text-yellow-500/50 hover:text-yellow-400 transition-colors">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 bg-red-900/10 border border-red-500/20 p-4 rounded-sm text-center">
                <p className="text-sm font-bold text-red-500 uppercase tracking-widest mb-1 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]">Poder Absoluto</p>
                <p className="text-xs text-red-200">Selecciona <span className="font-bold text-white">hasta 3 equipos rivales</span> para reducir sus puntos a CERO.</p>
                <p className="text-xs text-red-200 mt-1">Coste de energía: <span className="text-yellow-500 font-bold">200 PTS</span> por cada equipo seleccionado.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {teams.filter(t => t.id !== loggedInTeam.id).map(rival => {
                   const isSelected = gauntletTargets.includes(rival.id);
                   return (
                      <button 
                        key={rival.id} 
                        onClick={() => toggleGauntletTarget(rival.id)}
                        className={`flex items-center gap-4 p-4 border rounded-sm transition-all group text-left ${isSelected ? 'bg-red-900/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#1a1100] border-amber-900/30 hover:border-yellow-500/50 hover:bg-yellow-900/20'}`}
                      >
                        <div className={`w-12 h-12 rounded-full border border-white/20 bg-black overflow-hidden shrink-0 ${rival.accent}`}>
                          <img src={rival.gif} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold uppercase tracking-wider ${isSelected ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]' : 'text-amber-300'}`}>{rival.name}</p>
                          <p className="text-xs text-amber-600 font-mono">Puntos Actuales: <span className={rival.points > 0 ? "text-amber-400" : "text-red-500"}>{rival.points}</span></p>
                          {isSelected && <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">¡OBJETIVO FIJADO!</p>}
                        </div>
                        {isSelected && <Skull size={20} className="text-red-500 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]" />}
                      </button>
                   );
                })}
              </div>
              
              <div className="flex gap-4 items-center">
                 <div className="flex-1 bg-[#1a1100] p-4 rounded border border-amber-900/50 text-center shadow-inner">
                    <p className="text-[10px] text-amber-600 uppercase tracking-widest mb-1">Coste de Energía</p>
                    <p className="text-2xl font-mono font-bold text-yellow-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">-{gauntletTargets.length * 200}</p>
                 </div>
                 <button 
                    onClick={executeGauntletSnap}
                    disabled={gauntletTargets.length === 0}
                    className={`flex-1 py-4 font-black uppercase tracking-widest rounded transition-all ${gauntletTargets.length > 0 ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'bg-stone-900 border border-amber-900/30 text-amber-900 cursor-not-allowed'}`}
                 >
                    {gauntletTargets.length > 0 ? 'Ejecutar Chasquido' : 'Selecciona Objetivo'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENALTY MODAL */}
      {modal === 'penalty' && selTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={closeAllModals}></div>
          <div className="relative bg-[#050A05] border border-red-500/50 p-6 rounded-sm w-full max-w-lg shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <div className="bg-red-950/20 p-8 text-center border-b border-red-900/50"><div className="mx-auto bg-red-900/20 border border-red-500/30 w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]"><Skull size={40} className="text-red-500 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]" /></div><h3 className="text-2xl font-black text-red-500 uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]">Zona de Castigo</h3><p className="text-red-400/60 text-sm font-mono">Medidas disciplinarias para <span className="font-bold text-red-300">{selTeam.name}</span></p></div>
            <div className="p-8">
              {!penalty ? (<button onClick={spinPenalty} className="w-full bg-red-900/30 border border-red-500/50 hover:bg-red-600 text-red-400 hover:text-black font-black py-5 rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] flex justify-center gap-3 transition-all"><RefreshCw size={20} /> GENERAR SANCIÓN</button>) : (<div className="animate-in zoom-in duration-300"><div className="bg-black/50 p-6 rounded-sm border border-red-500/30 mb-6 text-center shadow-inner"><p className="text-xs text-red-600 mb-3 uppercase tracking-widest font-mono">Sentencia:</p><div className={`text-xl font-bold font-mono p-2 rounded ${penalty==='BLOCKED'?'text-cyan-400 border border-cyan-500/50 bg-cyan-900/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]':'text-red-300 drop-shadow-md'}`}>{penalty==='BLOCKED'?'¡ESCUDO ACTIVADO! Sanción bloqueada.':penalty}</div></div><div className="flex gap-3"><button onClick={spinPenalty} className="flex-1 py-3 bg-[#1a1100] border border-red-900/50 hover:bg-red-900/20 text-red-500 rounded-sm font-bold text-xs uppercase transition-colors font-mono">Reintentar</button><button onClick={closeAllModals} className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-black rounded-sm font-bold text-xs uppercase shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] font-mono">Ejecutar</button></div></div>)}
            </div>
          </div>
        </div>
      )}

      {/* CATALOG MODAL */}
      {modal === 'catalog' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={closeAllModals}></div>
          <div className="relative bg-[#050A05] border border-green-500/40 w-full max-w-6xl rounded-sm overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col max-h-[90vh]">
            <div className="bg-[#1a1100] p-6 border-b border-green-800/50 flex justify-between items-center"><h3 className="text-2xl font-black text-green-500 uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"><Info size={24} className="text-green-400" /> Archivos</h3><button onClick={closeAllModals} className="text-green-800 hover:text-green-400 transition-colors">✕</button></div>
            <div className="p-6 overflow-y-auto grid md:grid-cols-3 gap-8">
              <div><h4 className="text-lg font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-yellow-500/30 pb-2 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] font-mono"><Zap size={18} /> Ventajas</h4><div className="space-y-3">{REWARDS_LIST.map((r) => (<div key={r.id} className="bg-yellow-900/5 border border-yellow-900/30 p-3 rounded-sm flex justify-between items-start"><div><p className="font-bold text-green-400 text-sm font-mono">{r.name}</p><p className="text-xs text-green-700 mt-0.5 font-mono">{r.desc}</p></div><span className="bg-yellow-900/20 text-yellow-500 border border-yellow-700/50 px-2 py-1 rounded-sm text-xs font-mono font-bold whitespace-nowrap">{r.cost} PTS</span></div>))}</div></div>
              <div><h4 className="text-lg font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-blue-500/30 pb-2 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)] font-mono"><Hexagon size={18} /> Gemas</h4><div className="space-y-3">{INFINITY_STONES.map((s, index) => (<div key={index} className="bg-[#1a1100] border border-green-900/30 p-3 rounded-sm flex items-start gap-3"><div className={`mt-1 ${s.color.split(' ')[0]}`}><Hexagon size={16} fill="currentColor" /></div><div><p className={`font-bold text-sm uppercase font-mono ${s.color.split(' ')[0]}`}>Gema del {s.name} <span className="text-xs text-green-700 ml-1">({s.threshold} pts)</span></p><p className="text-xs text-green-600 mt-0.5 font-mono">{s.perk}</p></div></div>))}</div></div>
              <div><h4 className="text-lg font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-500/30 pb-2 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)] font-mono"><AlertTriangle size={18} /> Sanciones</h4><div className="space-y-3">{PENALTIES_LIST.map((p, index) => (<div key={index} className="bg-red-900/5 border border-red-900/30 p-3 rounded-sm flex items-start gap-3"><div className="bg-red-900/20 border border-red-700/50 p-1.5 rounded-sm text-red-500 mt-0.5"><Skull size={12} /></div><p className="text-sm text-red-400/80 leading-relaxed font-mono">{p}</p></div>))}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {modal === 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={closeAllModals}></div>
          <div className="relative bg-[#0f0a00] border border-amber-500/50 p-8 rounded-sm w-full max-w-md shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <h3 className="text-xl font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Lock size={20} /> Acceso</h3>
            <form onSubmit={checkPass} className="space-y-4">
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-black border border-amber-800 rounded-sm p-4 text-center text-amber-400 tracking-[0.5em] focus:border-amber-500 outline-none transition-colors font-mono focus:shadow-[0_0_15px_rgba(245,158,11,0.3)]" placeholder="••••••••" autoFocus />
              <div className="flex gap-2"><button type="button" onClick={closeAllModals} className="flex-1 bg-[#1a1100] border border-amber-900/50 hover:bg-amber-900/20 py-2 text-xs text-amber-600 font-bold transition-colors">CANCELAR</button><button type="submit" className="flex-1 bg-amber-700 hover:bg-amber-600 py-2 text-xs text-black font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]">ENTRAR</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AvengersTracker />
    </ErrorBoundary>
  );
}
