import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { 
  Shield, Zap, Skull, ShoppingCart, Lock, Unlock, AlertTriangle, Gavel, RefreshCw, 
  Cpu, Atom, Target, Eye, Trophy, Medal, TrendingUp, Info, Crown, Activity, User, 
  Users, ChevronsUp, Hexagon, ClipboardList, Swords, Brain, Volume2, VolumeX, List, 
  CheckCircle2, PlusCircle, Quote, Siren, Award, History, Trash2, X, Package, Dices, 
  Sparkles, Radio, BookOpen, Timer, Wifi, WifiOff
} from 'lucide-react';

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

const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'clase-6c';
const appId = rawAppId.replace(/\//g, '_'); 

// --- 3. DATOS CONSTANTES ---
const INITIAL_TEAMS = [
  { 
    id: 'ironman', name: 'Iron Man', points: 0, 
    theme: 'bg-red-900/30 shadow-red-500/20', border: 'border-red-500/50', 
    accent: 'text-red-400', barColor: 'bg-red-500', iconKey: 'cpu', 
    password: 'arc_reactor_85', members: ['Juandi', 'Ernesto', 'Carmen', 'Bea'], 
    quote: "Yo soy Iron Man.", 
    gif: "https://i.ibb.co/27K5dCBM/b751779a4a3bbc38f9268036cdb5af5a.gif"
  },
  { 
    id: 'cap', name: 'Capitán América', points: 0, 
    theme: 'bg-blue-900/30 shadow-blue-500/20', border: 'border-blue-500/50', 
    accent: 'text-blue-400', barColor: 'bg-blue-500', iconKey: 'shield', 
    password: 'escudo_vibranium', members: ['Sara', 'Araceli', 'Nagore', 'Alex'], 
    quote: "Podría hacer esto todo el día.", 
    gif: "https://i.ibb.co/XqT34sz/189868-C0-D40619-AD55-4-B4-C-BE57-9005-D2506967-0-1643400842.gif"
  },
  { 
    id: 'thor', name: 'Thor', points: 0, 
    theme: 'bg-yellow-900/30 shadow-yellow-500/20', border: 'border-yellow-500/50', 
    accent: 'text-yellow-400', barColor: 'bg-yellow-400', iconKey: 'zap', 
    password: 'stormbreaker_trueno', members: ['Javi', 'Guille', 'Yma', 'Iker'], 
    quote: "¡Por las barbas de Odín!", 
    gif: "https://i.ibb.co/PsFhhF1g/f604e46c6979b173d319fc064ed5c0dc.gif"
  },
  { 
    id: 'hulk', name: 'Hulk', points: 0, 
    theme: 'bg-green-900/30 shadow-green-500/20', border: 'border-green-500/50', 
    accent: 'text-green-400', barColor: 'bg-green-500', iconKey: 'atom', 
    password: 'gamma_smash_verde', members: ['Oliver', 'Félix', 'Sofía'], 
    quote: "¡HULK... APLASTA!", 
    gif: "https://i.ibb.co/BV1dZJCH/tumblr-nkx9ln-Ha8c1tiwiyxo1-640.gif"
  },
  { 
    id: 'widow', name: 'Viuda Negra', points: 0, 
    theme: 'bg-gray-800/50 shadow-red-900/20', border: 'border-red-500/50', 
    accent: 'text-red-500', barColor: 'bg-red-600', iconKey: 'target', 
    password: 'sala_roja_007', members: ['Sara', 'Sebas', 'Héctor', 'Alejandro'], 
    quote: "A estas alturas, nada dura para siempre.", 
    gif: "https://i.ibb.co/JjJQnWcH/0c2a5632830679-569563b0d45b2.gif"
  },
  { 
    id: 'strange', name: 'Dr. Strange', points: 0, 
    theme: 'bg-purple-900/30 shadow-purple-500/20', border: 'border-purple-500/50', 
    accent: 'text-purple-400', barColor: 'bg-purple-500', iconKey: 'eye', 
    password: 'sanctum_agomoto', members: ['Derek', 'Liah', 'Dani', 'Cata'], 
    quote: "Dormammu, he venido a negociar.", 
    gif: "https://i.ibb.co/M5VX25W0/tumblr-n11ui8-Bh-NU1r8bj4ko1-500.gif"
  },
];

const REWARDS_LIST = [
  { id: 1, name: 'Suministros', cost: 20, desc: 'Snack en clase' },
  { id: 2, name: 'DJ S.H.I.E.L.D.', cost: 15, desc: 'Elegir canción' },
  { id: 3, name: 'Indulto', cost: 30, desc: 'Perdón de tarea' },
  { id: 4, name: 'Aliado', cost: 35, desc: 'Sentarse con un amigo' },
  { id: 5, name: 'Archivos', cost: 40, desc: '5 min apuntes examen' },
  { id: 6, name: 'Descanso Táctico', cost: 10, desc: '5 min sin hacer nada' },
  { id: 7, name: 'Comandante', cost: 25, desc: 'Ayudante del profesor' },
  { id: 8, name: 'Espionaje', cost: 60, desc: 'Pista examen' },
  { id: 9, name: 'Hackeo', cost: 80, desc: 'Fondo pantalla profe' },
  { id: 10, name: 'Cine', cost: 150, desc: 'Película en clase' },
  { id: 11, name: 'Capitán', cost: 50, desc: 'Juego EF' },
  { id: 12, name: 'Sin Botas', cost: 15, desc: 'Estar en calcetines' }
];

const PENALTIES_LIST = [
  "Tablas multiplicar", "Copiar verbos", "Dibujo locomotor", "Capitales Europa", "Recoger clase",
  "Informe de Daños (Redacción)", "Limpieza de Cubierta (Estanterías)", "Silencio de Radio (5 min)",
  "Patrulla (Vuelta al patio)", "Orden Alfabético (Biblioteca)"
];

const MISSION_BATTERY = [
  { category: "Comportamiento", text: "OPERACIÓN SILENCIO" }, 
  { category: "Orden", text: "PROTOCOLO LIMPIEZA" },
  { category: "Académico", text: "ENTREGA PUNTUAL" }, 
  { category: "Social", text: "TRABAJO EN EQUIPO" }
];

const INFINITY_STONES = [
  { threshold: 100, color: 'text-blue-400', name: 'Espacio', perk: 'Teletransporte' },
  { threshold: 200, color: 'text-red-500', name: 'Realidad', perk: 'Ilusión' },
  { threshold: 300, color: 'text-purple-500', name: 'Poder', perk: 'Potencia' },
  { threshold: 400, color: 'text-yellow-400', name: 'Mente', perk: 'Clarividencia' },
  { threshold: 500, color: 'text-green-500', name: 'Tiempo', perk: 'Retroceso' },
  { threshold: 600, color: 'text-orange-500', name: 'Alma', perk: 'Sacrificio' }
];

const MULTIVERSE_EVENTS = [
  { title: "CHASQUIDO INVERSO", desc: "¡El universo se reequilibra! Todos ganan +5 puntos.", points: 5, type: 'good' },
  { title: "INVASIÓN SKRULL", desc: "Revisión sorpresa de material.", points: 0, type: 'neutral' },
  { title: "FALLO EN MATRIX", desc: "La próxima tarea vale DOBLE puntuación.", points: 0, type: 'good' },
  { title: "ATAQUE DE ULTRÓN", desc: "Hackeo de sistemas. Todos pierden -2 puntos.", points: -2, type: 'bad' },
  { title: "VISITA DE STAN LEE", desc: "¡Excelsior! 5 minutos de tiempo libre.", points: 0, type: 'good' },
  { title: "TORMENTA CUÁNTICA", desc: "Cambio de sitios aleatorio.", points: 0, type: 'neutral' },
];

const DUEL_CHALLENGES = ["Piedra, Papel o Tijera", "Duelo de miradas", "Pregunta de Mates", "Deletreo rápido", "El que parpadee pierde", "Adivinanza"];

const ACADEMIC_QUESTIONS = [
  { q: "¿Cuál es la capital de Francia?", a: "París" },
  { q: "Calcula: 12 x 12", a: "144" },
  { q: "¿Cuál es el río más largo de la Península Ibérica?", a: "El Tajo" },
  { q: "¿Cómo se llama el triángulo con 3 lados iguales?", a: "Equilátero" },
  { q: "¿Cuál es el planeta más grande del Sistema Solar?", a: "Júpiter" },
  { q: "Analiza el verbo: 'Cantábamos'", a: "1ª persona del plural, pretérito imperfecto de indicativo" },
  { q: "¿Quién escribió El Quijote?", a: "Miguel de Cervantes" },
  { q: "¿Qué órgano bombea la sangre?", a: "El corazón" },
  { q: "Capital de Italia", a: "Roma" },
  { q: "¿Cuántos minutos hay en 2 horas y media?", a: "150 minutos" }
];

const BOSS_MAX_HP = 700;
const ICONS = { cpu: Cpu, shield: Shield, zap: Zap, atom: Atom, target: Target, eye: Eye };
const TICKER_MESSAGES = [ "CAPITÁN AMÉRICA: 'PUEDO HACER ESTO TODO EL DÍA'", "TONY STARK: 'YO SOY IRON MAN'", "AVENGERS: ¡REUNÍOS!", "THOR: 'POR LAS BARBAS DE ODÍN'", "BLACK PANTHER: '¡WAKANDA POR SIEMPRE!'", "HULK: ¡APLASTA EL EXAMEN!" ];

const LOOT_ITEMS = [
  { text: "¡NADA! Thanos se lo ha robado.", val: 0 },
  { text: "¡NADA! Inténtalo de nuevo.", val: 0 },
  { text: "1 Punto Extra", val: 1 },
  { text: "5 Puntos Extra", val: 5 },
  { text: "¡RECOMPENSA! Elegir música.", val: 0 },
  { text: "¡PREMIO GORDO! 20 Puntos.", val: 20 }
];

// Estilos Helpers
const CTRL_BTN_CLASS = "flex-1 py-1.5 rounded-sm text-[10px] font-bold font-mono transition-all uppercase tracking-wider active:scale-95 border cursor-pointer select-none";
const ACTION_BTN_CLASS = "w-full py-2 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer select-none";

const getRankInfo = (p) => {
  if (p < 0) return { title: 'AMENAZA', color: 'text-red-500', glow: 'shadow-red-900/50', iconScale: 1 };
  if (p < 100) return { title: 'RECLUTA', color: 'text-slate-400', glow: 'shadow-none', iconScale: 1 };
  if (p < 200) return { title: 'AGENTE', color: 'text-blue-300', glow: 'shadow-blue-500/20', iconScale: 1.1 };
  if (p < 400) return { title: 'VENGADOR', color: 'text-yellow-400', glow: 'shadow-yellow-500/30', iconScale: 1.25 };
  return { title: 'LEYENDA', color: 'text-purple-300', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]', iconScale: 1.5 };
};

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("ErrorBoundary catch:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900 text-white font-mono h-screen flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold mb-4">⚠️ ERROR DEL SISTEMA</h1>
          <p className="mb-4">Ha ocurrido un fallo crítico. Por favor, recarga la página.</p>
          <pre className="bg-black p-4 rounded border border-red-500 overflow-auto max-w-2xl text-xs">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-white text-red-900 font-bold rounded hover:bg-gray-200">
            REINICIAR SISTEMA
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- COMPONENTE PRINCIPAL ---
function AvengersTracker() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedInId, setLoggedInId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); 
  
  // UI States
  const [modal, setModal] = useState(null);
  const [selTeam, setSelTeam] = useState(null);
  const [pass, setPass] = useState('');
  const [penalty, setPenalty] = useState(null);
  const [lootResult, setLootResult] = useState(null);
  const [multiverseEvent, setMultiverseEvent] = useState(null);
  const [mission, setMission] = useState(MISSION_BATTERY[0].text);
  const [customMission, setCustomMission] = useState('');
  const [history, setHistory] = useState([]);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [redAlertMode, setRedAlertMode] = useState(false);
  const [sound, setSound] = useState(false);
  const [cerebro, setCerebro] = useState({ active: false, target: null, searching: false });
  const [confetti, setConfetti] = useState({ active: false, x: 0, y: 0 });
  const [toast, setToast] = useState(null);
  const [secretCount, setSecretCount] = useState(0);
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionAvailable, setQuestionAvailable] = useState(false);
  
  // New States for Features
  const [timerTarget, setTimerTarget] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(null); 
  const [timerInput, setTimerInput] = useState(5);
  const [duelData, setDuelData] = useState(null);

  // Auth Effect
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!auth) {
            setUseLocal(true);
            return;
        }
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           try { await signInWithCustomToken(auth, __initial_auth_token); } 
           catch(e) { await signInAnonymously(auth); }
        } else { await signInAnonymously(auth); }
      } catch (e) {
        console.warn("Auth fallida, modo local:", e);
        setUseLocal(true);
        setLoading(false);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Data Effect
  useEffect(() => {
    if (useLocal || !user || !db) {
        if (useLocal) setLoading(false);
        return;
    }

    let unsub;
    try {
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'avengers_teams');
      unsub = onSnapshot(colRef, (snap) => {
        if (snap.empty) {
          INITIAL_TEAMS.forEach(async (t) => {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', t.id), t);
          });
        } else {
          const tArr = []; let fMission=null; let fAlert=false; let fHist=[]; let fTimer=null;
          snap.docs.forEach(d => {
            if (d.id === 'mission_control') {
              const data = d.data(); fMission=data.text; fAlert=data.alert; fHist=data.history||[]; fTimer=data.timerEnd;
            } else { tArr.push(d.data()); }
          });
          const merged = tArr.map(t => ({...INITIAL_TEAMS.find(it=>it.id===t.id)||t, points: t.points})).filter(t=>t.id).sort((a,b)=>b.points-a.points);
          if(merged.length>0) setTeams(merged);
          if(fMission) setMission(fMission);
          if(fAlert!==undefined) setRedAlertMode(fAlert);
          if(fTimer) setTimerTarget(fTimer); else setTimerTarget(null);
          setHistory((fHist||[]).reverse().slice(0,50));
        }
        setLoading(false);
      }, (e) => {
        console.warn("Firebase falló (permisos o red), pasando a local:", e);
        setUseLocal(true);
        setLoading(false);
      });
    } catch (e) {
        setUseLocal(true);
        setLoading(false);
    }
    return () => unsub && unsub();
  }, [user, useLocal]);

  // Main Loop
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIdx(prev => (prev + 1) % TICKER_MESSAGES.length);
      
      const now = new Date();
      const timeVal = now.getHours() + now.getMinutes()/60;
      if (timeVal >= 9 && timeVal <= 12.5) setQuestionAvailable(true); else setQuestionAvailable(false);

      if (timerTarget) {
        const diff = timerTarget - Date.now();
        if (diff <= 0) {
            setTimeLeft("00:00");
        } else {
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }
      } else {
          setTimeLeft(null);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [timerTarget]);

  // LOGIC
  const showToast = (msg, type = 'info') => setToast({ message: msg, type });
  const speak = (text) => {
    if (!sound || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES'; u.rate = 1.1; window.speechSynthesis.speak(u);
  };
  const triggerConfetti = (e) => {
    if(!e) return;
    setConfetti({ active: true, x: e.clientX, y: e.clientY });
    setTimeout(() => setConfetti({ active: false, x: 0, y: 0 }), 1000);
  };
  const triggerSecretConfetti = () => {
    setConfetti({ active: true, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setTimeout(() => setConfetti({ active: false, x: 0, y: 0 }), 1000);
  };
  
  // Data Handlers (Hybrid)
  const safeUpdate = async (docId, data, merge=true) => {
      if (useLocal) {
          if (docId === 'mission_control') {
              if(data.text) setMission(data.text);
              if(data.alert !== undefined) setRedAlertMode(data.alert);
              if(data.history) setHistory(prev => [...data.history, ...prev]);
              if(data.timerEnd !== undefined) setTimerTarget(data.timerEnd);
          } else {
              setTeams(prev => prev.map(t => t.id === docId ? {...t, ...data} : t).sort((a,b)=>b.points-a.points));
          }
          return;
      }
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', docId), data, {merge});
      } catch(e) {
          console.error("Write error", e);
          setUseLocal(true); // Fallback if write fails
          showToast("Error de conexión. Pasando a modo Local.", "error");
      }
  };

  const logAction = async (txt) => {
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    if(useLocal) {
        setHistory(prev => [{time, text:txt}, ...prev]);
    } else {
        const ref = doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', 'mission_control');
        try { 
            await updateDoc(ref, { history: arrayUnion({ time, text: txt }) }).catch(async () => {
                 await setDoc(ref, { history: [{ time, text: txt }] }, { merge: true });
            });
        } catch (e) {}
    }
  };

  const handlePts = async (tid, amt, e) => {
    if (!isAdmin && !(loggedInId === tid && amt < 0)) return;
    if (amt > 0) triggerConfetti(e);
    const t = teams.find(i => i.id === tid);
    if (!t) return;
    if (amt > 0) speak(`Puntos para ${t.name}`);
    await safeUpdate(tid, { points: t.points + amt });
    if (amt !== 0) logAction(`${t.name}: ${amt > 0 ? '+' : ''}${amt} pts`);
  };

  const handleBuy = async (teamId, cost) => {
    if (!isAdmin && loggedInId !== teamId) { showToast("Sin permiso", "error"); return false; }
    const t = teams.find(tm => tm.id === teamId);
    if (t.points >= cost) {
      speak(`Compra de ${t.name}`);
      await handlePts(teamId, -cost);
      logAction(`${t.name} gastó ${cost} pts`);
      if(!modal?.includes('loot')) setModal(null);
      showToast("Compra exitosa", "success");
      return true;
    } else { showToast("Fondos insuficientes", "error"); return false; }
  };
  const openLootBox = async (teamId) => {
    const cost = 15;
    const bought = await handleBuy(teamId, cost);
    if(bought) {
        speak("Abriendo caja...");
        setTimeout(() => {
            const item = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)];
            setLootResult(item);
            if(item.val > 0) handlePts(teamId, item.val);
            logAction(`${teams.find(t=>t.id===teamId).name} loot: ${it.text}`);
        }, 1500); 
    }
  };
  const startDuel = () => {
    if (teams.length < 2) return;
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const t1 = shuffled[0];
    const t2 = shuffled[1];
    const challenge = DUEL_CHALLENGES[Math.floor(Math.random() * DUEL_CHALLENGES.length)];
    setDuelData({ t1, t2, challenge });
    setModal('duel');
    speak("Protocolo Civil War iniciado");
  };
  const resolveDuel = (winnerId) => {
    if (!winnerId) { setModal(null); return; }
    const winner = teams.find(t => t.id === winnerId);
    handlePts(winnerId, 5);
    logAction(`CIVIL WAR: ${winner.name} ganó el duelo`);
    speak(`Victoria para ${winner.name}`);
    setModal(null);
  };
  const setTimer = async (minutes) => {
    const end = Date.now() + (minutes * 60 * 1000);
    await safeUpdate('mission_control', { timerEnd: end });
    setModal(null); speak(`Cuenta atrás de ${minutes} minutos`);
  };
  const stopTimer = async () => {
    await safeUpdate('mission_control', { timerEnd: null });
  };
  const triggerMultiverse = () => {
     setModal('multiverse');
     speak("Brecha detectada...");
     setTimeout(() => {
        const event = MULTIVERSE_EVENTS[Math.floor(Math.random() * MULTIVERSE_EVENTS.length)];
        setMultiverseEvent(event);
        speak(event.title);
        if (event.points !== 0) {
            teams.forEach(t => handlePts(t.id, event.points));
            logAction(`MULTIVERSO: ${event.title} (${event.points} pts)`);
        }
     }, 2000);
  };
  const checkPass = (e) => {
    e.preventDefault();
    const p = pass.toLowerCase().trim();
    if (p === 'director_fury_00') { setIsAdmin(true); setLoggedInId(null); setModal(null); setPass(''); speak("Hola Director"); return; }
    const t = INITIAL_TEAMS.find(tm => tm.password === p);
    if (t) { setLoggedInId(t.id); setIsAdmin(false); setModal(null); setPass(''); speak(`Hola ${t.name}`); return; }
    window.alert("Acceso denegado"); 
  };
  const handleLogoClick = () => {
    setSecretCount(prev => prev + 1);
    if (secretCount + 1 >= 5) { speak("Protocolo Fiesta"); triggerSecretConfetti(); setSecretCount(0); }
  };
  const activateCerebro = () => {
    setCerebro({ active: true, target: null, searching: true });
    speak("Buscando sujeto");
    const all = teams.flatMap(t => t.members);
    let i = 0;
    const interval = setInterval(() => {
      setCerebro(prev => ({ ...prev, target: all[Math.floor(Math.random() * all.length)] }));
      i++;
      if (i > 20) { clearInterval(interval); setCerebro(prev => ({ ...prev, searching: false })); speak("Sujeto localizado"); }
    }, 100);
  };
  const reset = async () => {
    if (!window.confirm("¿Reiniciar temporada?")) return;
    teams.forEach(t => safeUpdate(t.id, {points: 0}));
    safeUpdate('mission_control', { history: [], timerEnd: null });
    speak("Reinicio completado");
  };
  const updateM = async (txt) => {
    if(!isAdmin) return;
    await safeUpdate('mission_control', { text: txt });
    setModal(null); speak("Misión actualizada");
  };
  const toggleAlert = async () => {
    if(!isAdmin) return;
    const s = !redAlertMode; setRedAlertMode(s);
    await safeUpdate('mission_control', { alert: s });
    if(s) { speak("Alerta Roja"); logAction("ALERTA ROJA"); } else logAction("Alerta desactivada");
  };
  const spinPenalty = () => {
    const p = PENALTIES_LIST[Math.floor(Math.random() * PENALTIES_LIST.length)];
    setPenalty(p);
    if (selTeam) logAction(`${selTeam.name} sanción: ${p}`);
  };

  const openDailyQuestion = () => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const q = ACADEMIC_QUESTIONS[dayOfYear % ACADEMIC_QUESTIONS.length];
    setDailyQuestion(q);
    setShowAnswer(false);
    setModal('dailyQuestion');
    speak("Transmisión entrante.");
  };

  // Variables calculadas
  const totalPoints = teams.reduce((a, b) => a + Math.max(0, b.points), 0);
  const maxPoints = Math.max(...teams.map(t => t.points), 50);
  const bossDefeated = totalPoints >= BOSS_MAX_HP;
  const bossProgress = Math.min(100, (totalPoints / BOSS_MAX_HP) * 100);
  const leaderId = teams.length > 0 ? teams[0].id : null;
  const loggedInTeam = teams.find(t => t.id === loggedInId);

  if (errorMsg) return <div className="p-10 text-red-500 bg-black h-screen font-mono">ERROR: {errorMsg}</div>;
  if (loading) return <div className="p-10 text-cyan-500 bg-black h-screen font-mono animate-pulse">CARGANDO SISTEMA S.H.I.E.L.D...</div>;

  return (
    <div className={`min-h-screen bg-[#020617] text-white font-sans pb-20 overflow-x-hidden ${redAlertMode ? 'border-4 border-red-600' : ''}`}>
      {confetti.active && (<div className="fixed pointer-events-none z-50" style={{left: confetti.x, top: confetti.y}}>{[...Array(40)].map((_,i) => <div key={i} className="absolute w-2 h-2 rounded-full animate-confetti" style={{ backgroundColor: ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'][Math.floor(Math.random() * 5)], '--tx': `${(Math.random() - 0.5) * 300}px`, '--ty': `${(Math.random() - 0.5) * 300}px`, '--r': `${Math.random() * 360}deg` }} />)}</div>)}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className={`relative z-20 w-full p-4 border-b flex flex-wrap justify-between items-center gap-4 ${redAlertMode ? 'bg-red-900/90 border-red-500' : 'bg-slate-900/90 border-cyan-500/30'}`}>
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={handleLogoClick}>
            <div className={`absolute inset-0 blur-lg opacity-40 group-hover:opacity-80 transition-opacity rounded-full ${redAlertMode ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
            <img src="https://i.ibb.co/Ndt35H2Z/SHIELD-CSB.png" alt="S.H.I.E.L.D." className="w-10 h-10 object-contain relative z-10 active:scale-95 transition-transform" />
          </div>
          <div><h1 className="text-xl font-black tracking-[0.2em] leading-none">AVENGERS <span className={redAlertMode ? "text-red-300" : "text-cyan-500"}>INITIATIVE</span></h1><div className={`flex items-center gap-2 text-[10px] font-mono mt-0.5 ${redAlertMode ? 'text-red-300' : 'text-cyan-400/70'}`}><span className="animate-pulse">● {redAlertMode ? 'ALERTA MÁXIMA' : 'ONLINE'}</span> | <span>CLASE 6ºC</span></div></div>
        </div>
        
        {timeLeft && (
           <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/80 border-2 border-cyan-500 px-6 py-2 rounded-full shadow-2xl animate-pulse flex items-center gap-3">
              <Timer className="text-cyan-400 animate-spin" />
              <span className="text-2xl font-mono font-bold text-white">{timeLeft}</span>
              {isAdmin && <button onClick={stopTimer} className="text-red-500 hover:text-white"><X size={16}/></button>}
           </div>
        )}

        <div className="flex gap-2 items-center">
            {useLocal && <span className="text-[10px] text-orange-500 font-mono bg-orange-900/20 px-2 py-1 rounded border border-orange-500/50 flex items-center gap-1"><WifiOff size={10}/> LOCAL</span>}
          {isAdmin && (<><button onClick={() => setModal('timerConfig')} className="p-2 rounded border bg-blue-900/50 border-blue-500 hover:text-white"><Timer size={16}/></button><button onClick={startDuel} className="p-2 rounded border bg-orange-900/50 border-orange-500 hover:text-orange-300"><Swords size={16}/></button><button onClick={triggerMultiverse} className="p-2 rounded border bg-purple-900/50 border-purple-500 hover:text-purple-300 animate-pulse"><Dices size={16}/></button><button onClick={toggleAlert} className={`p-2 rounded border ${redAlertMode ? 'bg-red-600 border-white animate-pulse' : 'bg-slate-800 border-slate-600 hover:text-red-400'}`}><Siren size={16}/></button><button onClick={() => setModal('history')} className="p-2 rounded border bg-slate-800 border-slate-600 hover:text-white"><History size={16}/></button><button onClick={reset} className="p-2 rounded border bg-slate-800 border-slate-600 hover:text-red-500"><Trash2 size={16}/></button></>)}
          <button onClick={() => setSound(!sound)} className={`p-2 rounded border ${sound ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800 border-slate-700'}`}>{sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button>
          <button onClick={activateCerebro} className="flex gap-2 px-3 py-1.5 bg-purple-900/20 border border-purple-500/40 rounded-sm text-purple-300 text-xs font-bold uppercase"><Brain size={14}/> CEREBRO</button>
          <button onClick={() => setModal('catalog')} className="flex gap-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-sm text-slate-400 text-xs font-bold uppercase"><Info size={14}/> INFO</button>
          {!isAdmin && !loggedInId && <button onClick={() => setModal('login')} className="flex gap-1 px-3 py-1.5 bg-cyan-900/40 border border-cyan-500/50 rounded-sm text-cyan-300 text-xs font-bold"><Lock size={14}/> LOGIN</button>}
          {(isAdmin || loggedInId) && <button onClick={() => {setIsAdmin(false); setLoggedInId(null);}} className="flex gap-1 px-3 py-1.5 bg-yellow-900/40 border border-yellow-500/50 rounded-sm text-yellow-400 text-xs font-bold"><Unlock size={14}/> SALIR</button>}
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
        <aside className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/80 border border-cyan-500/20 rounded-sm p-5 shadow-lg flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
             <h3 className="text-lg font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-cyan-500/20 pb-2"><TrendingUp size={20} /> Clasificación</h3>
             <div className="space-y-3 flex-1">
                {teams.map((t, i) => {
                   const pct = Math.max((t.points / maxPoints) * 100, 0);
                   const isNeg = t.points < 0;
                   const clr = i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-slate-500";
                   return (
                      <div key={t.id}>
                         <div className="flex justify-between items-center mb-1 text-xs font-bold uppercase tracking-wide"><span className={`flex items-center gap-2 ${clr}`}>{i === 0 && <Crown size={12} className="animate-bounce" />} #{i + 1} {t.name}</span><span className={isNeg ? "text-red-400" : "text-cyan-300"}>{t.points}</span></div>
                         <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${isNeg ? 'bg-red-600' : t.barColor}`} style={{ width: `${Math.min(pct, 100)}%` }}></div></div>
                      </div>
                   );
                })}
             </div>
          </div>
          
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-sm p-5 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.5)] bg-purple-900/50"><img src="https://i.ibb.co/7NjPsfgb/183d8eefe6fe041dd1169fdeaab016f8.gif" alt="Thanos" className="w-full h-full object-cover" /></div>
                  <div><h3 className="text-sm font-black text-purple-400 uppercase leading-none mb-1">Amenaza: Thanos</h3><span className="text-xs font-mono text-purple-200">{totalPoints}/{BOSS_MAX_HP} DAÑO</span></div>
               </div>
               <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-purple-900 relative"><div className={`h-full transition-all duration-1000 flex items-center justify-center ${bossDefeated ? 'bg-green-500' : 'bg-gradient-to-r from-purple-600 to-red-500'}`} style={{width: `${bossProgress}%`}}></div></div>
               {bossDefeated && <p className="text-center text-xs font-bold text-green-400 mt-2 animate-pulse">¡AMENAZA NEUTRALIZADA!</p>}
            </div>
          </div>

          <div onClick={() => isAdmin && setModal('mission')} className={`bg-slate-900/80 border border-blue-500/20 rounded-sm p-5 shadow-lg relative overflow-hidden group ${isAdmin?'cursor-pointer hover:border-blue-400':''}`}>
             <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-2"><ClipboardList size={16}/> Misión Prioritaria</h3>
             <p className="text-sm font-bold text-white leading-relaxed font-mono">"{mission}"</p>
             {isAdmin && <span className="absolute top-2 right-2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"><List size={12}/></span>}
          </div>
        </aside>

        <section className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          {teams.map(t => {
            const Icon = ICONS[t.iconKey] || Shield;
            const isMine = loggedInId === t.id;
            const isLeader = t.id === leaderId;
            const isNeg = t.points < 0;
            const isCrit = t.points < -20;
            const rInfo = getRankInfo(t.points);

            return (
              <div key={t.id} className={`relative group rounded p-[1px] transition-all duration-300 ${isMine ? 'scale-[1.02] z-10' : 'hover:scale-[1.01]'} ${isCrit ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`}>
                <div className={`absolute inset-0 rounded bg-gradient-to-b ${t.theme} opacity-30`}></div>
                {isLeader && <div className="absolute -top-3 -right-3 z-30 transform rotate-12"><Crown size={32} className="text-yellow-400 drop-shadow-lg animate-bounce" fill="currentColor" fillOpacity={0.3}/></div>}
                
                <div className={`h-full bg-slate-950/90 border ${isMine ? 'border-yellow-500/50' : t.border.split(' ')[0]} p-5 rounded-sm backdrop-blur-xl flex flex-col justify-between shadow-xl relative overflow-hidden`}>
                  <div className="absolute -right-0 -bottom-0 w-64 h-64 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-110" style={{ mixBlendMode: 'luminosity' }}>
                     <img src={t.gif} alt={t.name} className="w-full h-full object-cover opacity-50" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex gap-3 items-center">
                         <div className={`w-12 h-12 rounded-full border-2 border-white/20 bg-slate-900/50 shadow-inner overflow-hidden ${t.accent}`}><img src={t.gif} alt="icon" className="w-full h-full object-cover" /></div>
                         <div><div className={`text-[9px] font-black uppercase tracking-widest ${rInfo.color}`}>{rInfo.title}</div><h2 className="text-lg font-black uppercase tracking-wider text-white truncate max-w-[120px]">{t.name}</h2></div>
                      </div>
                      <span className={`text-3xl font-black font-mono tracking-tighter ${t.points < 0 ? 'text-red-400' : 'text-white'}`}>{t.points}</span>
                    </div>
                    <div className="flex gap-1 mb-3 relative z-10">
                       {t.points >= 100 && <Award size={14} className="text-blue-400" />}
                       {t.points >= 300 && <Award size={14} className="text-purple-400" />}
                       {t.points >= 500 && <Award size={14} className="text-yellow-400" />}
                    </div>
                    <div className="flex justify-between bg-slate-900/50 p-1.5 rounded mb-4 border border-white/5 relative z-10">
                      {INFINITY_STONES.map((s,i) => {
                        const isActive = t.points >= s.threshold;
                        return (<div key={i} title={`${s.name}: ${s.perk}`} className="cursor-help"><Hexagon size={14} className={`transition-all duration-500 ${isActive ? s.color + ' fill-current opacity-100' : 'text-slate-800 fill-slate-900 opacity-50'}`} strokeWidth={isActive ? 0 : 2} /></div>);
                      })}
                    </div>
                    <div className="mb-4 relative z-10 pl-2 border-l border-white/10"><div className="text-[9px] uppercase tracking-widest opacity-50 font-bold text-slate-300 mb-1">OPERATIVOS</div><div className="text-xs text-slate-300 font-mono leading-relaxed">{t.members.join(' • ')}</div></div>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <div className="mb-4 relative pl-3 border-l-2 border-white/10 group-hover:border-white/30 transition-colors"><p className={`text-xs italic font-medium leading-tight ${t.accent} opacity-80`}>"{t.quote}"</p></div>
                    {isAdmin && (
                      <div className="grid gap-1">
                        <div className="flex gap-1">{[1,5,10].map(v => <button key={v} onClick={(e)=>handlePts(t.id, v, e)} className={`${CTRL_BTN_CLASS} bg-green-900/20 text-green-400 border-green-500/30 hover:bg-green-500 hover:text-black`}>+{v}</button>)}</div>
                        <div className="flex gap-1">{[-1,-5,-10].map(v => <button key={v} onClick={(e)=>handlePts(t.id, v, e)} className={`${CTRL_BTN_CLASS} bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-black`}>{v}</button>)}</div>
                        <div className="flex gap-1 mt-1">
                          <button onClick={()=>{setSelTeam(t); setModal('shop');}} className={`${CTRL_BTN_CLASS} bg-yellow-900/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500 hover:text-black flex justify-center gap-1`}><ShoppingCart size={12}/> TIENDA</button>
                          <button onClick={()=>{setSelTeam(t); setPenalty(null); setModal('penalty');}} className={`${CTRL_BTN_CLASS} flex items-center justify-center gap-1 ${isNeg ? 'bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'}`}><Gavel size={12}/> SANCIÓN</button>
                        </div>
                      </div>
                    )}
                    {isMine && !isAdmin && <button onClick={()=>{setSelTeam(t); setModal('shop');}} className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs rounded-sm shadow-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"><ShoppingCart size={14}/> ARMERÍA</button>}
                  </div>
                </div>
              </div>
            );
          })}
       </section>
      </main>

      <footer className="fixed bottom-0 w-full bg-slate-950 border-t border-cyan-900 h-8 flex items-center overflow-hidden z-50">
        <div className="px-4 bg-cyan-900/50 h-full flex items-center text-[10px] font-bold text-cyan-200">NEWS</div>
        <div className="flex-1 whitespace-nowrap overflow-hidden"><div className="animate-[marquee_25s_linear_infinite] text-[10px] font-mono text-cyan-400/70 pt-1">{TICKER_MESSAGES[tickerIdx]}</div></div>
      </footer>

      {/* --- MODALS --- */}
      {modal === 'multiverse' && multiverseEvent && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
             <div className="text-center animate-in zoom-in max-w-lg w-full relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl animate-pulse"></div>
                <div className="relative z-10 bg-slate-900 border-2 border-purple-500 p-8 rounded-lg shadow-2xl">
                    <Sparkles size={64} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-purple-300 uppercase tracking-widest mb-4 border-b border-purple-500/30 pb-4">{multiverseEvent.title}</h2>
                    <p className="text-xl font-medium text-white mb-6 leading-relaxed">{multiverseEvent.desc}</p>
                    {multiverseEvent.points !== 0 && <div className={`inline-block px-4 py-2 rounded font-bold text-lg mb-6 ${multiverseEvent.points > 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{multiverseEvent.points > 0 ? '+' : ''}{multiverseEvent.points} PTS GLOBAL</div>}
                    <button onClick={()=>setModal(null)} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded uppercase tracking-wider transition-colors">Cerrar Brecha</button>
                </div>
             </div>
         </div>
      )}

      {modal === 'duel' && duelData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
             <div className="text-center animate-in zoom-in max-w-lg w-full relative bg-slate-900 border-2 border-orange-500 p-8 rounded-lg">
                 <Swords size={64} className="mx-auto text-orange-500 mb-4 animate-pulse" />
                 <h2 className="text-2xl font-black text-orange-400 uppercase tracking-widest mb-2">CIVIL WAR</h2>
                 <p className="text-white text-lg font-bold mb-6">{duelData.challenge}</p>
                 <div className="flex justify-between items-center gap-4 mb-6">
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-2 border-2 ${duelData.t1.accent} overflow-hidden`}><img src={duelData.t1.gif} className="w-full h-full object-cover"/></div>
                        <p className="text-xs font-bold text-white">{duelData.t1.name}</p>
                    </div>
                    <div className="text-2xl font-black text-white">VS</div>
                    <div className="text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-2 border-2 ${duelData.t2.accent} overflow-hidden`}><img src={duelData.t2.gif} className="w-full h-full object-cover"/></div>
                        <p className="text-xs font-bold text-white">{duelData.t2.name}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={()=>resolveDuel(duelData.t1.id)} className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded">GANA {duelData.t1.name}</button>
                    <button onClick={()=>resolveDuel(duelData.t2.id)} className="py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded">GANA {duelData.t2.name}</button>
                 </div>
                 <button onClick={()=>setModal(null)} className="mt-4 text-xs text-slate-500 underline">Cancelar Duelo</button>
             </div>
        </div>
      )}

      {modal === 'timerConfig' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-cyan-500/50 p-6 rounded-sm w-full max-w-sm shadow-2xl">
               <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><List size={20}/> CRONÓMETRO</h3>
               <div className="flex gap-2 mb-4">
                  {[5, 10, 15, 30].map(m => (
                      <button key={m} onClick={()=>setTimerInput(m)} className={`flex-1 py-2 border ${timerInput===m?'bg-cyan-900/50 border-cyan-400 text-white':'bg-black border-slate-700 text-slate-400'} rounded font-bold`}>{m}m</button>
                  ))}
               </div>
               <input type="number" value={timerInput} onChange={e=>setTimerInput(parseInt(e.target.value))} className="w-full bg-black border border-slate-700 p-2 text-white mb-4 text-center font-mono" />
               <button onClick={()=>setTimer(timerInput)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded uppercase">INICIAR CUENTA ATRÁS</button>
               <button onClick={()=>setModal(null)} className="w-full mt-2 text-slate-500 text-xs">Cancelar</button>
           </div>
        </div>
      )}

      {modal === 'dailyQuestion' && dailyQuestion && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
             <div className="text-center animate-in zoom-in max-w-lg w-full relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl animate-pulse"></div>
                <div className="relative z-10 bg-slate-900 border-2 border-cyan-500 p-8 rounded-lg shadow-2xl">
                    <BookOpen size={64} className="mx-auto text-cyan-400 mb-4" />
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">PROTOCOLO OJO DE HALCÓN</h2>
                    <p className="text-xs text-cyan-400 mb-6 font-mono">NIVEL DE ACCESO: 6º PRIMARIA</p>
                    <div className="bg-black/50 p-6 rounded border border-white/10 mb-6"><p className="text-xl font-bold text-white leading-relaxed">"{dailyQuestion.q}"</p></div>
                    {showAnswer ? (<div className="bg-green-900/30 border border-green-500/50 p-4 rounded mb-6 animate-in fade-in"><p className="text-xs text-green-400 uppercase font-bold mb-1">SOLUCIÓN DESCLASIFICADA:</p><p className="text-lg text-white font-bold">{dailyQuestion.a}</p></div>) : isAdmin ? (<button onClick={()=>setShowAnswer(true)} className="mb-6 text-xs text-slate-500 underline hover:text-white">Ver Solución (Solo Director)</button>) : null}
                    {isAdmin && showAnswer && (<div className="grid grid-cols-2 gap-2 mb-6">{teams.map(t => (<button key={t.id} onClick={() => { handlePts(t.id, 5); setModal(null); }} className="p-2 bg-slate-800 hover:bg-green-600 border border-white/10 rounded text-xs text-white font-bold transition-colors">+5 Pts {t.name}</button>))}</div>)}
                    <button onClick={()=>setModal(null)} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded uppercase tracking-wider transition-colors">Cerrar Transmisión</button>
                </div>
             </div>
         </div>
      )}

      {modal === 'history' && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setModal(null)}></div>
          <div className="relative bg-slate-900 border border-slate-600 w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="bg-slate-800/80 p-4 border-b border-slate-600 flex justify-between items-center"><h3 className="text-lg font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><History size={18} /> Bitácora</h3><button onClick={() => setModal(null)}>✕</button></div>
            <div className="p-4 overflow-y-auto bg-black/40 font-mono text-xs text-slate-400">
              {history.length === 0 ? <p className="text-center py-4">Sin registros.</p> : <ul className="space-y-2">{history.map((l, i) => <li key={i} className="flex gap-4 border-b border-white/5 pb-1"><span>{l.time}</span><span>{l.text}</span></li>)}</ul>}
            </div>
          </div>
        </div>
      )}

      {modal === 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setModal(null)}></div>
          <div className="relative bg-slate-900 border border-cyan-500/30 p-8 rounded-sm w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Lock size={20} /> Acceso</h3>
            <form onSubmit={checkPass} className="space-y-4">
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-black/50 border border-cyan-900 rounded-sm p-4 text-center text-white tracking-[0.5em] focus:border-cyan-500 outline-none transition-colors font-mono" placeholder="••••••••" autoFocus />
              <div className="flex gap-2"><button type="button" onClick={()=>setModal(null)} className="flex-1 bg-slate-800 py-2 text-xs text-slate-400 font-bold">CANCELAR</button><button type="submit" className="flex-1 bg-cyan-600 py-2 text-xs text-black font-bold">ENTRAR</button></div>
            </form>
          </div>
        </div>
      )}

      {modal === 'shop' && selTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setModal(null)}></div>
          <div className="relative bg-slate-900 border border-yellow-500/30 w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl">
            <div className="bg-yellow-900/20 p-6 border-b border-yellow-500/20 flex justify-between items-center">
              <div><h3 className="text-xl font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2"><ShoppingCart size={20} /> Armería</h3><div className="flex items-center gap-4 mt-2 text-sm"><span className="text-slate-400">Equipo: <span className="text-white font-bold">{selTeam.name}</span></span><span className="text-slate-400">Saldo: <span className="text-yellow-400 font-bold font-mono text-lg">{selTeam.points}</span></span></div></div>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 grid gap-4 max-h-[60vh] overflow-y-auto">
              <div className="mb-4 bg-purple-900/20 border border-purple-500/40 p-4 rounded-sm flex justify-between items-center animate-pulse"><div className="flex gap-4"><div className="bg-purple-500/20 p-3 rounded-sm text-purple-300"><Package size={24}/></div><div><h4 className="font-bold text-purple-200">CAJA DE WAKANDA</h4><p className="text-xs text-purple-400">¿Te atreves? Resultado aleatorio.</p></div></div><button onClick={() => openLootBox(selTeam.id)} disabled={selTeam.points < 15} className={`px-6 py-2 rounded-sm font-bold font-mono text-sm border ${selTeam.points >= 15 ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400' : 'bg-transparent text-slate-600 border-slate-800'}`}>15 PTS</button></div>
              {lootResult && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"><div className="text-center animate-in zoom-in"><Package size={64} className="mx-auto text-yellow-400 mb-4 animate-bounce" /><h2 className="text-3xl font-black text-white mb-2">{lootResult.text}</h2><button onClick={()=>setLootResult(null)} className="mt-8 px-6 py-2 bg-slate-700 text-white rounded text-xs uppercase">Cerrar</button></div></div>}
              {REWARDS_LIST.map((reward) => (<div key={reward.id} className="group relative bg-black/40 border border-white/5 hover:border-yellow-500/50 rounded-sm p-4 transition-all hover:bg-yellow-900/10 flex justify-between items-center"><div className="flex items-start gap-4"><div className="bg-yellow-500/10 p-3 rounded-sm text-yellow-500 group-hover:scale-110 transition-transform"><Zap size={20} /></div><div><h4 className="font-bold text-slate-200 group-hover:text-yellow-400 transition-colors uppercase tracking-wide">{reward.name}</h4><p className="text-xs text-slate-500 mt-1">{reward.desc}</p></div></div><button onClick={() => handleBuy(selTeam.id, reward.cost)} disabled={selTeam.points < reward.cost} className={`px-6 py-2 rounded-sm font-bold font-mono text-sm border transition-all duration-300 ${selTeam.points >= reward.cost ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500 hover:text-black shadow-lg' : 'bg-transparent text-slate-600 border-slate-800 cursor-not-allowed'}`}>{reward.cost} PTS</button></div>))}
            </div>
          </div>
        </div>
      )}

      {modal === 'penalty' && selTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setModal(null)}></div>
          <div className="relative bg-slate-900 border border-red-500/50 p-6 rounded-sm w-full max-w-lg shadow-2xl">
            <div className="bg-red-950/50 p-8 text-center border-b border-red-900/50"><div className="mx-auto bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-pulse"><Skull size={40} className="text-red-500" /></div><h3 className="text-2xl font-black text-red-500 uppercase tracking-[0.2em] mb-2">Zona de Castigo</h3><p className="text-red-200/60 text-sm">Medidas disciplinarias para {selTeam.name}</p></div>
            <div className="p-8">
              {!penalty ? (<button onClick={spinPenalty} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-sm shadow-[0_0_30px_rgba(220,38,38,0.4)] flex justify-center gap-3"><RefreshCw size={20} /> GENERAR SANCIÓN</button>) : (<div className="animate-in zoom-in duration-300"><div className="bg-black/50 p-6 rounded-sm border border-red-500/30 mb-6 text-center"><p className="text-xs text-red-400 mb-3">Sentencia:</p><p className="text-xl font-bold text-white leading-relaxed font-mono">"{penalty}"</p></div><div className="flex gap-3"><button onClick={spinPenalty} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-sm font-bold text-xs uppercase">Reintentar</button><button onClick={() => setModal(null)} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-sm font-bold text-xs uppercase shadow-lg">Ejecutar</button></div></div>)}
            </div>
          </div>
        </div>
      )}

      {modal === 'catalog' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setModal(null)}></div>
          <div className="relative bg-slate-900 border border-blue-500/30 w-full max-w-6xl rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-slate-800/80 p-6 border-b border-blue-500/20 flex justify-between items-center"><h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2"><Info size={24} className="text-blue-400" /> Archivos</h3><button onClick={() => setModal(null)}>✕</button></div>
            <div className="p-6 overflow-y-auto grid md:grid-cols-3 gap-8">
              <div><h4 className="text-lg font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-yellow-500/20 pb-2"><Zap size={18} /> Ventajas</h4><div className="space-y-3">{REWARDS_LIST.map((r) => (<div key={r.id} className="bg-yellow-900/10 border border-yellow-500/10 p-3 rounded-sm flex justify-between items-start"><div><p className="font-bold text-slate-200 text-sm">{r.name}</p><p className="text-xs text-slate-500 mt-0.5">{r.desc}</p></div><span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-sm text-xs font-mono font-bold whitespace-nowrap">{r.cost} PTS</span></div>))}</div></div>
              <div><h4 className="text-lg font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-blue-500/20 pb-2"><Hexagon size={18} /> Gemas</h4><div className="space-y-3">{INFINITY_STONES.map((s, index) => (<div key={index} className="bg-slate-800/50 border border-white/5 p-3 rounded-sm flex items-start gap-3"><div className={`mt-1 ${s.color.split(' ')[0]}`}><Hexagon size={16} fill="currentColor" /></div><div><p className={`font-bold text-sm uppercase ${s.color.split(' ')[0]}`}>Gema del {s.name} <span className="text-xs text-slate-500 ml-1">({s.threshold} pts)</span></p><p className="text-xs text-slate-300 mt-0.5">{s.perk}</p></div></div>))}</div></div>
              <div><h4 className="text-lg font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-500/20 pb-2"><AlertTriangle size={18} /> Sanciones</h4><div className="space-y-3">{PENALTIES_LIST.map((p, index) => (<div key={index} className="bg-red-900/10 border border-red-500/10 p-3 rounded-sm flex items-start gap-3"><div className="bg-red-500/20 p-1.5 rounded-sm text-red-400 mt-0.5"><Skull size={12} /></div><p className="text-sm text-slate-300 leading-relaxed">{p}</p></div>))}</div></div>
            </div>
          </div>
        </div>
      )}

      {modal === 'mission' && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setModal(null)}></div>
          <div className="relative bg-slate-900 border border-blue-500/30 w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-slate-800/80 p-6 border-b border-blue-500/20 flex justify-between items-center"><h3 className="text-xl font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList size={24} /> Órdenes Tácticas</h3><button onClick={() => setModal(null)}>✕</button></div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 bg-blue-900/10 border border-blue-500/20 p-4 rounded-sm"><div className="flex gap-2"><input type="text" value={customMission} onChange={(e) => setCustomMission(e.target.value)} placeholder="Escribir misión..." className="flex-1 bg-black/50 border border-blue-500/30 rounded-sm px-3 py-2 text-white outline-none text-sm" /><button onClick={() => updateM(customMission)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-wider">Activar</button></div></div>
              <div className="space-y-6">{['Comportamiento', 'Académico', 'Organización', 'Social', 'Especial'].map(cat => (<div key={cat}><h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">{cat}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{MISSION_BATTERY.filter(m => m.category === cat).map((m, i) => (<button key={i} onClick={() => updateM(m.text)} className="text-left bg-slate-800/50 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 p-3 rounded-sm transition-all group flex items-start gap-3">{mission === m.text ? <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" /> : <PlusCircle size={16} className="text-slate-500 group-hover:text-blue-400 mt-0.5 shrink-0" />}<span className={`text-sm ${mission === m.text ? 'text-green-300 font-bold' : 'text-slate-300 group-hover:text-white'}`}>{m.text}</span></button>))}</div></div>))}</div>
            </div>
          </div>
        </div>
      )}

      {cerebro.active && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer" onClick={()=>{if(!cerebro.searching)setCerebro({...cerebro, active:false})}}>
          <div className="text-center">
            <Brain size={80} className="mx-auto text-purple-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-purple-400 uppercase tracking-widest mb-4">PROTOCOLO CEREBRO</h2>
            <div className="text-4xl font-mono font-bold text-white">{cerebro.target || "RASTREANDO..."}</div>
            {!cerebro.searching && <div className="mt-8 text-xs text-slate-500 animate-bounce">CLICK PARA CERRAR</div>}
          </div>
        </div>
      )}

      <style>{`
        .animate-confetti { animation: confetti 1s ease-out forwards; }
        @keyframes confetti { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) rotate(var(--r)); opacity: 0; } }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </div>
  );
}

// Wrapper Principal
export default function App() {
  return (
    <ErrorBoundary>
      <AvengersTracker />
    </ErrorBoundary>
  );
}
