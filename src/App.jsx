import { useState, useEffect, Component, useCallback } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { 
  Shield, Zap, Skull, ShoppingCart, Lock, Unlock, AlertTriangle, Gavel, RefreshCw, 
  Cpu, Atom, Target, Eye, Trophy, Medal, TrendingUp, Info, Crown, Activity, User, 
  Users, ChevronsUp, Hexagon, ClipboardList, Swords, Brain, Volume2, VolumeX, List, 
  CheckCircle2, PlusCircle, Quote, Siren, Award, History, Trash2, X, Package, Dices, 
  Sparkles, Radio, BookOpen, Timer, Wifi, WifiOff, MessageSquare, ShieldCheck, Flame, Star, Calculator,
  Type, Binary, Battery, BatteryCharging, Lightbulb, Book, BatteryFull, Hand, Grid3X3, AlertOctagon
} from 'lucide-react';

const APP_VERSION = "v3.9.0 (THANOS)";

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
    id: 'ironman', name: 'Iron Man', points: 0, shield: false, badges: [], 
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null,
    theme: 'bg-red-900/30 shadow-red-500/20', border: 'border-red-500/50', 
    accent: 'text-red-400', barColor: 'bg-red-500', iconKey: 'cpu', 
    password: 'arc_reactor_85', members: ['Juandi', 'Ernesto', 'Carmen', 'Bea'], 
    quote: "Yo soy Iron Man.", 
    gif: "https://i.ibb.co/27K5dCBM/b751779a4a3bbc38f9268036cdb5af5a.gif"
  },
  { 
    id: 'cap', name: 'Capitán América', points: 0, shield: false, badges: [], 
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null,
    theme: 'bg-blue-900/30 shadow-blue-500/20', border: 'border-blue-500/50', 
    accent: 'text-blue-400', barColor: 'bg-blue-500', iconKey: 'shield', 
    password: 'escudo_vibranium', members: ['Sara', 'Araceli', 'Nagore', 'Alex'], 
    quote: "Podría hacer esto todo el día.", 
    gif: "https://i.ibb.co/XqT34sz/189868-C0-D40619-AD55-4-B4-C-BE57-9005-D2506967-0-1643400842.gif"
  },
  { 
    id: 'thor', name: 'Thor', points: 0, shield: false, badges: [], 
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null,
    theme: 'bg-yellow-900/30 shadow-yellow-500/20', border: 'border-yellow-500/50', 
    accent: 'text-yellow-400', barColor: 'bg-yellow-400', iconKey: 'zap', 
    password: 'stormbreaker_trueno', members: ['Javi', 'Guille', 'Yma', 'Iker'], 
    quote: "¡Por las barbas de Odín!", 
    gif: "https://i.ibb.co/PsFhhF1g/f604e46c6979b173d319fc064ed5c0dc.gif"
  },
  { 
    id: 'hulk', name: 'Hulk', points: 0, shield: false, badges: [], 
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null,
    theme: 'bg-green-900/30 shadow-green-500/20', border: 'border-green-500/50', 
    accent: 'text-green-400', barColor: 'bg-green-500', iconKey: 'atom', 
    password: 'gamma_smash_verde', members: ['Oliver', 'Félix', 'Sofía'], 
    quote: "¡HULK... APLASTA!", 
    gif: "https://i.ibb.co/BV1dZJCH/tumblr-nkx9ln-Ha8c1tiwiyxo1-640.gif"
  },
  { 
    id: 'widow', name: 'Viuda Negra', points: 0, shield: false, badges: [], 
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null,
    theme: 'bg-gray-800/50 shadow-red-900/20', border: 'border-red-500/50', 
    accent: 'text-red-500', barColor: 'bg-red-600', iconKey: 'target', 
    password: 'sala_roja_007', members: ['Sara', 'Sebas', 'Héctor', 'Alejandro'], 
    quote: "A estas alturas, nada dura para siempre.", 
    gif: "https://i.ibb.co/JjJQnWcH/0c2a5632830679-569563b0d45b2.gif"
  },
  { 
    id: 'strange', name: 'Dr. Strange', points: 0, shield: false, badges: [], 
    dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: '', lastLoot: null,
    theme: 'bg-purple-900/30 shadow-purple-500/20', border: 'border-purple-500/50', 
    accent: 'text-purple-400', barColor: 'bg-purple-500', iconKey: 'eye', 
    password: 'sanctum_agomoto', members: ['Derek', 'Liah', 'Dani', 'Cata'], 
    quote: "Dormammu, he venido a negociar.", 
    gif: "https://i.ibb.co/M5VX25W0/tumblr-n11ui8-Bh-NU1r8bj4ko1-500.gif"
  },
];

const REWARDS_LIST = [
  { id: 99, name: 'Campo de Fuerza', cost: 50, desc: 'Bloquea 1 sanción automáticamente' }, 
  { id: 66, name: 'El Chasquido', cost: 50, desc: 'Quita 50% pts a 2 rivales al azar' },
  { id: 1, name: 'Suministros', cost: 20, desc: 'Snack en clase' },
  { id: 2, name: 'DJ S.H.I.E.L.D.', cost: 15, desc: 'Elegir canción' },
  { id: 3, name: 'Indulto', cost: 30, desc: 'Perdón de tarea' },
  { id: 4, name: 'Aliado', cost: 35, desc: 'Sentarse con un amigo' },
  { id: 5, name: 'Archivos', cost: 40, desc: '5 min apuntes examen' },
  { id: 6, name: 'Descanso Táctico', cost: 10, desc: '5 min sin hacer nada' },
  { id: 7, name: 'Comandante', cost: 25, desc: 'Ayudante del profesor' },
  { id: 9, name: 'Hackeo', cost: 80, desc: 'Fondo pantalla profe' },
  { id: 10, name: 'Cine', cost: 150, desc: 'Película en clase' },
  { id: 12, name: 'Sin Botas', cost: 15, desc: 'Estar en calcetines' }
];

const PENALTIES_LIST = [
  "Tablas multiplicar", "Copiar verbos", "Dibujo locomotor", "Capitales Europa", "Recoger clase",
  "Informe de Daños (Redacción)", "Limpieza de Cubierta (Estanterías)", "Silencio de Radio (5 min)",
  "Patrulla (Vuelta al patio)", "Orden Alfabético (Biblioteca)"
];

const BADGES_LIST = [
    { icon: <Star size={14}/>, name: "Excelencia", color: "text-yellow-400" },
    { icon: <Zap size={14}/>, name: "Rapidez", color: "text-blue-400" },
    { icon: <Brain size={14}/>, name: "Ingenio", color: "text-purple-400" },
    { icon: <Shield size={14}/>, name: "Defensor", color: "text-green-400" },
    { icon: <Flame size={14}/>, name: "Racha", color: "text-orange-400" },
];

const DAILY_QUOTES = [
    "Un gran poder conlleva una gran responsabilidad.",
    "No es sobre cuánto golpeamos, sino cuánto podemos resistir.",
    "Vengadores, ¡Reuníos!",
    "Solo si trabajamos juntos podremos vencer.",
    "El conocimiento es la mejor arma.",
    "Hasta el infinito y más allá.",
    "Lo que hacemos ahora define nuestro futuro.",
    "La paciencia es la clave de la victoria.",
    "Nunca te rindas, incluso cuando las probabilidades estén en contra.",
    "La verdadera fuerza está en el corazón."
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

// --- BANCO DE PREGUNTAS (100) ---
const ACADEMIC_QUESTIONS = [
  // MATEMÁTICAS
  { q: "¿Cuánto es 8 x 8?", a: "64" }, { q: "¿La mitad de 500?", a: "250" }, { q: "¿Cuántos lados tiene un hexágono?", a: "6" },
  { q: "¿Resultado de 100 entre 4?", a: "25" }, { q: "¿Grados de un ángulo recto?", a: "90" }, { q: "¿Cuántos minutos tiene una hora?", a: "60" },
  { q: "¿Raíz cuadrada de 81?", a: "9" }, { q: "¿El doble de 150?", a: "300" }, { q: "¿Cuánto es 12 x 10?", a: "120" },
  { q: "¿Lados de un triángulo?", a: "3" }, { q: "¿Nombre del polígono de 5 lados?", a: "Pentágono" }, { q: "¿Cifra romana V?", a: "5" },
  { q: "¿Cifra romana X?", a: "10" }, { q: "¿Cifra romana L?", a: "50" }, { q: "¿Cifra romana C?", a: "100" },
  { q: "¿Cuánto es 7 x 7?", a: "49" }, { q: "¿Resultado de 25 + 75?", a: "100" }, { q: "¿El triple de 33?", a: "99" },
  { q: "¿Cuántos cm hay en 1 metro?", a: "100" }, { q: "¿Cuántos gramos es 1 kilo?", a: "1000" },
  // CIENCIAS NATURALES
  { q: "¿Símbolo químico del agua?", a: "H2O" }, { q: "¿Hueso más largo del cuerpo?", a: "Fémur" }, { q: "¿Órgano que bombea sangre?", a: "Corazón" },
  { q: "¿Planeta más cercano al Sol?", a: "Mercurio" }, { q: "¿Planeta conocido como el Planeta Rojo?", a: "Marte" }, { q: "¿Gas que respiramos?", a: "Oxígeno" },
  { q: "¿Cuántos dientes tiene un adulto?", a: "32" }, { q: "¿Animal más rápido del mundo?", a: "Guepardo" }, { q: "¿Rey de la selva?", a: "León" },
  { q: "¿Proceso de las plantas para comer?", a: "Fotosíntesis" }, { q: "¿Líquido vital del cuerpo humano?", a: "Sangre" }, { q: "¿Estado del agua en hielo?", a: "Sólido" },
  { q: "¿Estado del agua en vapor?", a: "Gaseoso" }, { q: "¿Satélite natural de la Tierra?", a: "Luna" }, { q: "¿Estrella más cercana a la Tierra?", a: "Sol" },
  { q: "¿Animal que produce leche?", a: "Mamífero" }, { q: "¿Animal que nace de huevo?", a: "Ovíparo" }, { q: "¿Cuántas patas tiene una araña?", a: "8" },
  { q: "¿Insecto que fabrica miel?", a: "Abeja" }, { q: "¿Reino al que pertenecen las setas?", a: "Fungi" },
  // GEOGRAFÍA
  { q: "¿Capital de España?", a: "Madrid" }, { q: "¿Capital de Francia?", a: "París" }, { q: "¿Capital de Italia?", a: "Roma" },
  { q: "¿Capital de Alemania?", a: "Berlín" }, { q: "¿Capital de Portugal?", a: "Lisboa" }, { q: "¿Capital de Reino Unido?", a: "Londres" },
  { q: "¿Río más largo de la Península?", a: "Tajo" }, { q: "¿Río más caudaloso de la Península?", a: "Ebro" }, { q: "¿Océano entre América y Europa?", a: "Atlántico" },
  { q: "¿Continente donde está Egipto?", a: "África" }, { q: "¿Continente donde está China?", a: "Asia" }, { q: "¿País con forma de bota?", a: "Italia" },
  { q: "¿Montaña más alta del mundo?", a: "Everest" }, { q: "¿Montaña más alta de España?", a: "Teide" }, { q: "¿Desierto más grande del mundo?", a: "Sahara" },
  { q: "¿Capital de Estados Unidos?", a: "Washington" }, { q: "¿Río que pasa por Sevilla?", a: "Guadalquivir" }, { q: "¿Río que pasa por Zaragoza?", a: "Ebro" },
  { q: "¿Mar al este de España?", a: "Mediterráneo" }, { q: "¿Mar al norte de España?", a: "Cantábrico" },
  // LENGUA
  { q: "¿Antónimo de 'rápido'?", a: "Lento" }, { q: "¿Sinónimo de 'bonito'?", a: "Bello" }, { q: "¿Palabra que indica acción?", a: "Verbo" },
  { q: "¿Palabra que califica al nombre?", a: "Adjetivo" }, { q: "¿Autor de El Quijote?", a: "Cervantes" }, { q: "¿Género de 'La casa'?", a: "Femenino" },
  { q: "¿Plural de 'luz'?", a: "Luces" }, { q: "¿Sílaba tónica de 'camión'?", a: "Mión" }, { q: "¿Palabra con tilde en la última sílaba?", a: "Aguda" },
  { q: "¿Palabra con tilde en la penúltima?", a: "Llana" }, { q: "¿Palabra con tilde en la antepenúltima?", a: "Esdrújula" }, { q: "¿Letra que no suena en español?", a: "H" },
  { q: "¿Antónimo de 'verdad'?", a: "Mentira" }, { q: "¿Sinónimo de 'caminar'?", a: "Andar" }, { q: "¿Persona que escribe libros?", a: "Escritor" },
  { q: "¿Libro de definiciones?", a: "Diccionario" }, { q: "¿Signo para preguntar?", a: "Interrogación" }, { q: "¿Signo para exclamar?", a: "Exclamación" },
  { q: "¿Cuántas letras tiene el abecedario?", a: "27" }, { q: "¿Conjunto de versos?", a: "Estrofa" },
  // CULTURA
  { q: "¿En qué año se descubrió América?", a: "1492" }, { q: "¿Quién pintó la Mona Lisa?", a: "Da Vinci" }, { q: "¿Moneda de la Unión Europea?", a: "Euro" },
  { q: "¿Idioma más hablado del mundo?", a: "Chino" }, { q: "¿Dios del trueno nórdico?", a: "Thor" }, { q: "¿Primer hombre en la Luna?", a: "Armstrong" },
  { q: "¿Quién escribió Romeo y Julieta?", a: "Shakespeare" }, { q: "¿Qué se celebra el 25 de diciembre?", a: "Navidad" }, { q: "¿Color de la esperanza?", a: "Verde" },
  { q: "¿Cuántos años tiene un siglo?", a: "100" }, { q: "¿Cuántos años tiene un milenio?", a: "1000" }, { q: "¿En qué país están las pirámides?", a: "Egipto" },
  { q: "¿Instrumento para ver estrellas?", a: "Telescopio" }, { q: "¿Instrumento para ver microbios?", a: "Microscopio" }, { q: "¿Deporte rey en España?", a: "Fútbol" },
  { q: "¿Cuántos jugadores hay en un equipo de fútbol?", a: "11" }, { q: "¿Estación que caen las hojas?", a: "Otoño" }, { q: "¿Mes con menos días?", a: "Febrero" },
  { q: "¿Capital de Rusia?", a: "Moscú" }, { q: "¿País del sol naciente?", a: "Japón" }
];

const HYDRA_WORDS = [
    "SUJETO", "PREDICADO", "VERBO", "ADJETIVO", "CELULA", "FOTOSINTESIS", "ENERGIA", "MATERIA", 
    "PLANETA", "RELIEVE", "CLIMA", "EUROPA", "DEMOCRACIA", "CONSTITUCION", "ECOSYSTEMA", "VENGADORES", "ESCUDO",
    "GRAVEDAD", "OXIGENO", "HIDROGENO", "GALAXIA", "ASTEROIDE", "VOLCAN", "TERREMOTO", "HURACAN", "TORNADO",
    "ESDRUJULA", "DIPTONGO", "HIATO", "SINONIMO", "ANTONIMO", "METAFORA", "POESIA", "TEATRO", "NOVELA",
    "FRACCION", "DECIMAL", "POLIGONO", "VERTICE", "ANGULO", "DIAMETRO", "RADIO", "PERIMETRO", "MULTIGLO",
    "DIVISOR", "FACTOR", "PRODUCTO", "COCIENTE", "RESTO", "DECADA"
];

// PREGUNTAS DE COMBATE POR NIVELES
const COMBAT_QUESTIONS = {
  easy: [
    { q: "¿Cuántas patas tiene una araña?", a: "8" }, { q: "¿Color del caballo blanco de Santiago?", a: "BLANCO" },
    { q: "¿Capital de España?", a: "MADRID" }, { q: "¿2 x 5?", a: "10" }, { q: "¿Antónimo de 'alto'?", a: "BAJO" },
    { q: "¿Rey de la selva?", a: "LEON" }, { q: "¿Días de la semana?", a: "7" }, { q: "¿Estación más calurosa?", a: "VERANO" },
    { q: "¿5 + 5?", a: "10" }, { q: "¿Planeta donde vivimos?", a: "TIERRA" }, { q: "¿Color del cielo despejado?", a: "AZUL" },
    { q: "¿Fruta amarilla y curva?", a: "PLATANO" }, { q: "¿Animal que maulla?", a: "GATO" }, { q: "¿Opuesto de negro?", a: "BLANCO" },
    { q: "¿Dedos en una mano?", a: "5" }, { q: "¿Mes de la Navidad?", a: "DICIEMBRE" }, { q: "¿Instrumento para escribir?", a: "LAPIZ" },
    { q: "¿Vehículo de dos ruedas?", a: "BICICLETA" }, { q: "¿Líquido que bebemos?", a: "AGUA" }, { q: "¿Sonido de la vaca?", a: "MUU" }
  ],
  medium: [
    { q: "¿Capital de Alemania?", a: "BERLIN" }, { q: "¿Símbolo químico del agua?", a: "H2O" }, { q: "¿Lados de un hexágono?", a: "6" },
    { q: "¿Planeta rojo?", a: "MARTE" }, { q: "¿7 x 8?", a: "56" }, { q: "¿País de la Torre Eiffel?", a: "FRANCIA" },
    { q: "¿Hueso más largo del cuerpo?", a: "FEMUR" }, { q: "¿Continente de Egipto?", a: "AFRICA" }, { q: "¿Verbo de 'canción'?", a: "CANTAR" },
    { q: "¿Capital de Italia?", a: "ROMA" }, { q: "¿Capital de Portugal?", a: "LISBOA" }, { q: "¿Gas que respiramos?", a: "OXIGENO" },
    { q: "¿Animal más rápido?", a: "GUEPARDO" }, { q: "¿Triángulo 3 lados iguales?", a: "EQUILATERO" }, { q: "¿Antónimo de 'valiente'?", a: "COBARDE" },
    { q: "¿Sexto mes del año?", a: "JUNIO" }, { q: "¿País de la pizza?", a: "ITALIA" }, { q: "¿Planeta con anillos?", a: "SATURNO" },
    { q: "¿Capital de Rusia?", a: "MOSCU" }, { q: "¿Metal precioso amarillo?", a: "ORO" }
  ],
  hard: [
    { q: "¿Capital de Australia?", a: "CANBERRA" }, { q: "¿Símbolo químico del Oro?", a: "AU" }, { q: "¿12 x 12?", a: "144" },
    { q: "¿Autor del Quijote?", a: "CERVANTES" }, { q: "¿Planeta más grande?", a: "JUPITER" }, { q: "¿Río que pasa por Londres?", a: "TAMESIS" },
    { q: "¿Pintor del Guernica?", a: "PICASSO" }, { q: "¿Capital de Portugal?", a: "LISBOA" }, { q: "¿Año descubrimiento América?", a: "1492" },
    { q: "¿Raíz cuadrada de 81?", a: "9" }, { q: "¿Diosa griega sabiduría?", a: "ATENEA" }, { q: "¿Capital de Canadá?", a: "OTTAWA" },
    { q: "¿Elemento químico 'Fe'?", a: "HIERRO" }, { q: "¿Autor de Harry Potter?", a: "ROWLING" }, { q: "¿Guerra 1939-1945?", a: "SEGUNDA" },
    { q: "¿Capital de Turquía?", a: "ANKARA" }, { q: "¿Velocidad de la luz?", a: "300000" }, { q: "¿Satélite de la Tierra?", a: "LUNA" },
    { q: "¿País más grande?", a: "RUSIA" }, { q: "¿Río más largo?", a: "AMAZONAS" }
  ]
};

// BOSS BASE HP - Ahora se recalcula dinámicamente
const BOSS_BASE_HP = 1500;
const ICONS = { cpu: Cpu, shield: Shield, zap: Zap, atom: Atom, target: Target, eye: Eye };
const TICKER_MESSAGES = [ "CAPITÁN AMÉRICA: 'PUEDO HACER ESTO TODO EL DÍA'", "TONY STARK: 'YO SOY IRON MAN'", "AVENGERS: ¡REUNÍOS!", "THOR: 'POR LAS BARBAS DE ODÍN'", "BLACK PANTHER: '¡WAKANDA POR SIEMPRE!'", "HULK: ¡APLASTA EL EXAMEN!" ];

const LOOT_ITEMS = [
  { text: "¡NADA! Thanos se lo ha robado.", val: 0, type: 'bad' },
  { text: "1 Punto Extra", val: 1, type: 'good' },
  { text: "5 Puntos Extra", val: 5, type: 'good' },
  { text: "¡RECOMPENSA! Elegir música.", val: 0, type: 'good' },
  { text: "¡MALA SUERTE! -2 Puntos", val: -2, type: 'bad' },
  { text: "¡TRAMPA! -5 Puntos", val: -5, type: 'bad' },
  { text: "¡CAJA VACÍA!", val: 0, type: 'neutral' },
  { text: "2 Puntos Extra", val: 2, type: 'good' },
  { text: "¡ROBO! Pierdes 3 Puntos", val: -3, type: 'bad' },
  { text: "10 Puntos ¡LEGENDARIO!", val: 10, type: 'good' },
  { text: "¡SANCIONADO! Copiar verbos", val: 0, type: 'bad' },
  { text: "¡ESCUDO ROTO! Pierdes defensa", val: 0, type: 'bad' }, 
  { text: "¡REGALO! 3 Puntos", val: 3, type: 'good' },
  { text: "¡EXPLOSIÓN! -4 Puntos", val: -4, type: 'bad' },
  { text: "¡SUERTE! 4 Puntos", val: 4, type: 'good' },
  { text: "¡AGUJERO NEGRO! -10 Puntos", val: -10, type: 'bad' },
  { text: "¡HERENCIA! 8 Puntos", val: 8, type: 'good' },
  { text: "¡IMPUESTOS! -1 Punto", val: -1, type: 'bad' },
  { text: "¡BONUS! 6 Puntos", val: 6, type: 'good' },
  { text: "¡VISITA DE LOKI! -6 Puntos", val: -6, type: 'bad' }
];

// Estilos Helpers
const CTRL_BTN_CLASS = "flex-1 py-1.5 rounded-sm text-[10px] font-bold font-mono transition-all uppercase tracking-wider active:scale-95 border cursor-pointer select-none";
const ACTION_BTN_CLASS = "w-full py-2 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer select-none";

const getRankInfo = (p) => {
  if (p < 0) return { title: 'AMENAZA', color: 'text-red-500', glow: 'shadow-red-900/50', iconScale: 1, next: 0, total: 100 };
  if (p < 100) return { title: 'RECLUTA', color: 'text-slate-400', glow: 'shadow-none', iconScale: 1, next: 100, total: 100 };
  if (p < 200) return { title: 'AGENTE', color: 'text-blue-300', glow: 'shadow-blue-500/20', iconScale: 1.1, next: 200, total: 200 };
  if (p < 400) return { title: 'VENGADOR', color: 'text-yellow-400', glow: 'shadow-yellow-500/30', iconScale: 1.25, next: 400, total: 200 };
  return { title: 'LEYENDA', color: 'text-purple-300', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]', iconScale: 1.5, next: 1000, total: 600 };
};

// SFX
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
        
        if (type === 'success') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
            gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'error') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'click') {
            osc.type = 'square'; osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        } else if (type === 'alarm') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 1.5);
            osc.start(now); osc.stop(now + 1.5);
        }
    } catch (e) {}
};

// COMPONENTES AUXILIARES
const Confeti = ({ active, x, y }) => {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed z-50" style={{ left: x, top: y }}>
      {[...Array(40)].map((_, i) => (
        <div key={i} className="absolute w-2 h-2 rounded-full animate-confetti" style={{ backgroundColor: ['#ef4444', '#3b82f6', '#eab308'][i%3], '--tx': `${Math.random()*300-150}px`, '--ty': `${Math.random()*300-150}px`}} />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { 
    const t = setTimeout(onClose, 3000); 
    return () => clearTimeout(t); 
  }, [onClose]); 
  
  const bg = type === 'success' ? 'bg-green-500/20 border-green-500' : type === 'error' ? 'bg-red-500/20 border-red-500' : 'bg-blue-500/20 border-blue-500';
  const icon = type === 'success' ? <CheckCircle2 /> : type === 'error' ? <AlertTriangle /> : <Info />;
  return (
    <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border ${bg} backdrop-blur-md shadow-2xl animate-in slide-in-from-right fade-in duration-300 max-w-sm`}>
      <div className={type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400'}>{icon}</div>
      <p className="text-sm font-bold text-white">{message}</p>
    </div>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() { if (this.state.hasError) return <div className="p-10 text-red-500 bg-black">Error crítico. Recarga la página.</div>; return this.props.children; }
}

// --- APP PRINCIPAL ---
function AvengersTracker() {
  const [teams, setTeams] = useState(() => {
     const saved = localStorage.getItem('avengers_teams');
     return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });
  
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
  const [mission, setMission] = useState(() => localStorage.getItem('avengers_mission') || MISSION_BATTERY[0].text);
  const [customMission, setCustomMission] = useState('');
  const [history, setHistory] = useState([]);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [redAlertMode, setRedAlertMode] = useState(false);
  const [sound, setSound] = useState(false);
  const [cerebro, setCerebro] = useState({ active: false, target: null, searching: false, type: null }); 
  const [confetti, setConfetti] = useState({ active: false, x: 0, y: 0 });
  const [toast, setToast] = useState(null);
  const [secretCount, setSecretCount] = useState(0);
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionAvailable, setQuestionAvailable] = useState(false);
  const [furyMessage, setFuryMessage] = useState(null);
  const [newFuryMsg, setNewFuryMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const [dailyQuote, setDailyQuote] = useState("");
  
  // Math & Logic Challenge States
  const [mathState, setMathState] = useState({ active: false, questions: [], currentIdx: 0, level: 2 });
  const [mathInput, setMathInput] = useState("");
  const [streak, setStreak] = useState(0);

  const [wordState, setWordState] = useState({ active: false, word: "", scrambled: "" });
  const [wordInput, setWordInput] = useState("");

  const [combatState, setCombatState] = useState({ active: false, questions: [], currentIdx: 0, correctCount: 0 }); 
  const [combatInput, setCombatInput] = useState("");
  
  // Boss Attack State
  const [bossAttackState, setBossAttackState] = useState({ active: false, team: null, questions: [], currentIdx: 0, mistakes: 0 });

  const [bossMaxHp, setBossMaxHp] = useState(BOSS_BASE_HP);
  
  // MEMORY GAME STATE
  const [memoryState, setMemoryState] = useState({ active: false, cards: [], flipped: [], matched: [], lock: false });

  // Features
  const [timerInput, setTimerInput] = useState(5);
  const [duelData, setDuelData] = useState(null);

  // ESTA ES LA CLAVE: useCallback para que la función no cambie y resetee el timer del toast
  const closeToast = useCallback(() => setToast(null), []);

  // Backup local
  useEffect(() => {
    localStorage.setItem('avengers_teams', JSON.stringify(teams));
    localStorage.setItem('avengers_mission', mission);
  }, [teams, mission]);

  // Daily Quote, Boss HP Growth & Reset Logic
  useEffect(() => {
      const day = new Date().getDate();
      setDailyQuote(DAILY_QUOTES[day % DAILY_QUOTES.length]);
      
      const today = new Date().toDateString();
      const lastRunDate = localStorage.getItem('avengers_last_run_date');
      
      const currentMax = parseFloat(localStorage.getItem('avengers_boss_hp')) || BOSS_BASE_HP;
      setBossMaxHp(currentMax);

      if (lastRunDate !== today) {
          // Reset daily progress LOCAL STATE update immediately
          setTeams(prev => prev.map(t => ({ 
              ...t, 
              dailyMath: 0, 
              dailyWord: 0, 
              dailyCombat: 0,
              dailyMemory: 0,
              lastDaily: today,
              lastLoot: null // Reset loot status daily
          })));

          // Increase Boss HP by 10% daily (Compound)
          const newMax = Math.floor(currentMax * 1.1);
          setBossMaxHp(newMax);
          localStorage.setItem('avengers_boss_hp', newMax.toString());
          
          localStorage.setItem('avengers_last_run_date', today);
          
      } 
  }, []);

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!auth) { setUseLocal(true); setLoading(false); return; }
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
    if(auth) onAuthStateChanged(auth, setUser);
  }, []);

  // Data Hybrid - PERSISTENCE FIX
  useEffect(() => {
    if (useLocal || !user || !db) { if (useLocal) setLoading(false); return; }
    try {
      const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'avengers_teams'), (snap) => {
        if (snap.empty) { 
            teams.forEach(t => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', t.id), t)); 
        } else {
          const tArr = []; let fMission=null, fAlert=false, fHist=[], fFury=null, fShake=false, fBossHp=null;
          
          snap.docs.forEach(d => {
            if (d.id === 'mission_control') { 
                const data=d.data(); 
                fMission=data.text; fAlert=data.alert; fHist=data.history||[]; fFury=data.furyMsg; fShake=data.shaking; fBossHp=data.bossMaxHp;
            }
            else { tArr.push(d.data()); }
          });

          const merged = tArr.map(t => {
             const staticData = INITIAL_TEAMS.find(it => it.id === t.id);
             if (!staticData) return t;

             return {
                 ...staticData, // Keep theme, gif, name, etc.
                 points: t.points ?? staticData.points, // DB priority
                 shield: t.shield ?? staticData.shield,
                 badges: t.badges ?? staticData.badges,
                 dailyMath: t.dailyMath ?? 0,
                 dailyWord: t.dailyWord ?? 0,
                 dailyCombat: t.dailyCombat ?? 0,
                 dailyMemory: t.dailyMemory ?? 0,
                 lastLoot: t.lastLoot ?? null
             };
          }).sort((a,b)=>b.points-a.points);

          if(merged.length > 0) setTeams(merged);
          
          if(fMission) setMission(fMission);
          if(fAlert!==undefined) setRedAlertMode(fAlert);
          
          if(fBossHp) setBossMaxHp(fBossHp); 
          else if(!useLocal && bossMaxHp) safeUpdate('mission_control', {bossMaxHp: bossMaxHp}); 
          
          setFuryMessage(fFury);
          if(fShake) { setShaking(true); setTimeout(() => setShaking(false), 3000); playSfx('alarm'); }
          setHistory((fHist||[]).reverse().slice(0,50));
          
          const today = new Date().toDateString();
          merged.forEach(t => {
             if (t.lastDaily !== today) {
                 safeUpdate(t.id, { dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0, lastDaily: today, lastLoot: null });
             }
          });
        }
        setLoading(false);
      }, () => { setUseLocal(true); setLoading(false); });
      return () => unsub();
    } catch { setUseLocal(true); setLoading(false); }
  }, [user, useLocal]); 

  // Ticker
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIdx(p => (p + 1) % TICKER_MESSAGES.length);
      const h = new Date().getHours() + new Date().getMinutes()/60;
      setQuestionAvailable(h >= 9 && h <= 12.5);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Helpers
  const safeUpdate = async (docId, data, merge=true) => {
      if (useLocal || !db) { updateLocal(docId, data); return; }
      try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', docId), data, {merge:true}); }
      catch (e) { setUseLocal(true); updateLocal(docId, data); showToast("Modo Offline", "error"); }
  };

  const updateLocal = (docId, data) => {
      if (docId === 'mission_control') {
          if(data.text) setMission(data.text);
          if(data.alert !== undefined) setRedAlertMode(data.alert);
          if(data.history) setHistory(prev => [...(data.history||[]), ...prev]);
          if(data.furyMsg !== undefined) setFuryMessage(data.furyMsg);
          if(data.bossMaxHp !== undefined) setBossMaxHp(data.bossMaxHp);
      } else {
          setTeams(prev => prev.map(t => t.id === docId ? {...t, ...data} : t).sort((a,b)=>b.points-a.points));
      }
  };

  const showToast = (msg, type='info') => setToast({ message: msg, type });
  const triggerConfetti = (e) => { if(e) { setConfetti({active:true, x:e.clientX, y:e.clientY}); setTimeout(()=>setConfetti({active:false,x:0,y:0}), 1000); }};
  const triggerSecretConfetti = () => { setConfetti({ active: true, x: window.innerWidth / 2, y: window.innerHeight / 2 }); setTimeout(() => setConfetti({ active: false, x: 0, y: 0 }), 1000); };
  
  const logAction = (txt) => {
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    if (useLocal || !db) { setHistory(prev => [{time, text:txt}, ...prev]); return; }
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'avengers_teams', 'mission_control');
    updateDoc(ref, { history: arrayUnion({time, text:txt}) }).catch(() => setHistory(prev => [{time, text:txt}, ...prev]));
  };

  const speak = (text) => {
    if (!sound || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES'; u.rate = 1.1; window.speechSynthesis.speak(u);
  };

  const handlePts = (tid, amt, e, force = false) => {
    if (!force && !isAdmin && !(loggedInId === tid && amt < 0)) return;
    if (amt > 0) { triggerConfetti(e); playSfx('success'); } else { playSfx('error'); }
    const t = teams.find(i => i.id === tid);
    if (!t) return;
    if (Math.abs(amt) >= 5) speak(`Puntos para ${t.name}`);
    safeUpdate(tid, { points: t.points + amt });
    if (amt !== 0) logAction(`${t.name}: ${amt > 0 ? '+' : ''}${amt} pts`);
  };

  const handleDailyProgress = (tid, type) => {
      const t = teams.find(i => i.id === tid);
      if(!t) return;
      
      let currentVal = 0;
      if(type === 'math') currentVal = t.dailyMath || 0;
      else if(type === 'word') currentVal = t.dailyWord || 0;
      else if(type === 'combat') currentVal = t.dailyCombat || 0;
      else if(type === 'memory') currentVal = t.dailyMemory || 0;

      const newDaily = Math.min(currentVal + 1, 4);
      
      let update = {};
      if(type === 'math') update = { dailyMath: newDaily };
      else if(type === 'word') update = { dailyWord: newDaily };
      else if(type === 'combat') update = { dailyCombat: newDaily };
      else if(type === 'memory') update = { dailyMemory: newDaily };

      // Check for Global Bonus (All 4 categories completed)
      const dMath = type === 'math' ? newDaily : (t.dailyMath || 0);
      const dWord = type === 'word' ? newDaily : (t.dailyWord || 0);
      const dCombat = type === 'combat' ? newDaily : (t.dailyCombat || 0);
      const dMemory = type === 'memory' ? newDaily : (t.dailyMemory || 0);

      if (dMath === 4 && dWord === 4 && dCombat === 4 && dMemory === 4 && newDaily === 4 && currentVal < 4) {
          speak("¡Protocolo Vengador completado al 100%!");
          triggerSecretConfetti();
          showToast("¡SISTEMAS AL MÁXIMO! +4 Puntos Extra", "success");
          handlePts(tid, 4, null, true); 
      }
      
      safeUpdate(tid, update);
  };

  const handleBadge = (tid, badge) => {
      const t = teams.find(i => i.id === tid);
      if(!t) return;
      const newBadges = [...(t.badges || []), badge];
      safeUpdate(tid, { badges: newBadges });
      logAction(`${t.name} ganó medalla ${badge.name}`);
      playSfx('success'); triggerSecretConfetti();
  };

  const handleBuy = async (teamId, cost, itemId) => {
      if (!isAdmin && loggedInId !== teamId) { showToast("Sin permiso", "error"); return false; }
      const t = teams.find(tm => tm.id === teamId);
      if (t.points >= cost) {
          playSfx('click');
          if (itemId === 99) { safeUpdate(teamId, { points: t.points - cost, shield: true }); logAction(`${t.name} compró Escudo`); }
          else if (itemId === 66) { // Snap
             await safeUpdate(teamId, { points: t.points - cost });
             logAction(`${t.name} compró EL GUANTELETE`);
             // Execute Snap
             speak("Yo soy... inevitable.");
             playSfx('alarm');
             const rivals = teams.filter(tm => tm.id !== teamId);
             const shuffled = [...rivals].sort(() => 0.5 - Math.random());
             const victims = shuffled.slice(0, 2);
             for (const victim of victims) {
                 if (victim.shield) {
                     await safeUpdate(victim.id, { shield: false });
                     logAction(`${victim.name} bloqueó el Chasquido`);
                 } else {
                     const halved = Math.floor(victim.points / 2);
                     await safeUpdate(victim.id, { points: halved });
                     logAction(`${t.name} chasqueó a ${victim.name}`);
                 }
             }
             triggerSecretConfetti();
          } 
          else { 
             await safeUpdate(teamId, { points: t.points - cost }); 
             logAction(`${t.name} gastó ${cost} pts`); 
          }

          if(!modal?.includes('loot')) setModal(null);
          showToast("Compra exitosa", "success");
          return true;
      } else { showToast("Fondos insuficientes", "error"); playSfx('error'); return false; }
  };
  
  const handleSnap = async () => {
    if (!window.confirm("¿Ejecutar el Chasquido de Thanos? 2 equipos perderán la mitad de sus puntos.")) return;
    
    playSfx('alarm');
    speak("Yo soy... inevitable.");
    
    // Select 2 distinct random teams
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const victims = shuffled.slice(0, 2);
    
    for (const team of victims) {
        const newPoints = Math.floor(team.points / 2);
        const lost = team.points - newPoints;
        await safeUpdate(team.id, { points: newPoints });
        logAction(`${team.name} sufrió el Chasquido: -${lost} pts`);
    }
    
    triggerSecretConfetti(); // Visual feedback (maybe red confetti?)
    showToast("El equilibrio ha sido restaurado.", "info");
  };
  
  // BOSS ATTACK LOGIC (UPDATED)
  const handleBossAttack = () => {
    if (teams.length === 0) return;
    setShaking(true);
    playSfx('alarm');
    speak("Thanos ataca. Iniciando protocolo de defensa.");
    
    // Select random team
    const randomTeam = teams[Math.floor(Math.random() * teams.length)];
    
    // Select 6 questions (one for each stone)
    // We shuffle ACADEMIC_QUESTIONS and pick 6
    const randomQuestions = [...ACADEMIC_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    setBossAttackState({ active: true, team: randomTeam, questions: randomQuestions, currentIdx: 0, mistakes: 0 });
    setModal('bossAttack');
    
    setTimeout(() => setShaking(false), 3000);
  };
  
  const submitBossAnswer = (inputVal) => {
      const currentQ = bossAttackState.questions[bossAttackState.currentIdx];
      const isCorrect = inputVal.toUpperCase().trim() === currentQ.a.toUpperCase();
      
      let newMistakes = bossAttackState.mistakes;
      
      if (isCorrect) {
          playSfx('success');
      } else {
          playSfx('error');
          newMistakes++;
          // Immediate penalty
          handlePts(bossAttackState.team.id, -10, null, true);
          showToast(`¡FALLO! -10 Puntos. La respuesta era: ${currentQ.a}`, "error");
      }

      if (bossAttackState.currentIdx < 5) { // 6 questions (0-5)
          setBossAttackState(prev => ({ 
              ...prev, 
              currentIdx: prev.currentIdx + 1,
              mistakes: newMistakes
          }));
      } else {
          // Finished
          if (newMistakes === 0) {
              handlePts(bossAttackState.team.id, 50, null, true);
              speak("Amenaza neutralizada. Recompensa otorgada.");
              showToast("¡THANOS REPELIDO! +50 Puntos", "success");
              triggerSecretConfetti();
          } else {
              speak("Defensa fallida. El universo ha sufrido daños.");
              showToast("Ataque finalizado con daños.", "info");
          }
          setModal(null);
      }
  };

  const resetDailyLimits = async () => {
    if (!window.confirm("¿Reiniciar los límites de retos diarios para todos?")) return;
    teams.forEach(t => safeUpdate(t.id, { dailyMath: 0, dailyWord: 0, dailyCombat: 0, dailyMemory: 0 }));
    speak("Protocolos de entrenamiento reiniciados.");
    showToast("Límites diarios reseteados.", "success");
  };

  const openLootBox = async (tid) => { 
      if(handleBuy(tid, 15)) { 
          speak("Abriendo..."); 
          setTimeout(() => { 
              const it = LOOT_ITEMS[Math.floor(Math.random()*LOOT_ITEMS.length)]; 
              setLootResult(it); 
              // UPDATE TEAM LAST LOOT STATUS
              if(it.type === 'bad') safeUpdate(tid, { lastLoot: 'bad' });
              else safeUpdate(tid, { lastLoot: 'good' });

              // Reset status after 5 seconds
              setTimeout(() => safeUpdate(tid, { lastLoot: null }), 5000);

              if(it.val !== 0) handlePts(tid, it.val, null, true); 
              logAction(`${teams.find(t=>t.id===tid).name} loot: ${it.text}`); 
              if(it.type === 'good') playSfx('success'); else playSfx('error'); 
          }, 1500); 
      }
  };
  const startDuel = () => { const s=[...teams].sort(()=>0.5-Math.random()); setDuelData({t1:s[0], t2:s[1], challenge:DUEL_CHALLENGES[Math.floor(Math.random()*DUEL_CHALLENGES.length)]}); setModal('duel'); playSfx('alarm'); speak("Civil War"); };
  const resolveDuel = (wid) => { if(wid){ const w=teams.find(t=>t.id===wid); handlePts(wid,5, null, true); logAction(`Civil War: Gana ${w.name}`); speak(`Gana ${w.name}`); playSfx('success'); } setModal(null); };
  const triggerMultiverse = () => { setModal('multiverse'); playSfx('alarm'); speak("Brecha"); setTimeout(() => { const e=MULTIVERSE_EVENTS[Math.floor(Math.random()*MULTIVERSE_EVENTS.length)]; setMultiverseEvent(e); speak(e.title); if(e.points!==0) { teams.forEach(t=>handlePts(t.id, e.points, null, true)); logAction(`Multiverso: ${e.title}`); } }, 2000); };
  const sendFuryMessage = () => { if(newFuryMsg.trim()) { safeUpdate('mission_control', { furyMsg: newFuryMsg }); playSfx('alarm'); speak("Mensaje de Fury"); setNewFuryMsg(""); }};
  
  const checkPass = (e) => { e.preventDefault(); const p = pass.toLowerCase().trim(); if (p === 'director_fury_00') { setIsAdmin(true); setLoggedInId(null); setModal(null); setPass(''); playSfx('success'); speak("Hola Director"); return; } const t = INITIAL_TEAMS.find(tm => tm.password === p); if (t) { setLoggedInId(t.id); setIsAdmin(false); setModal(null); setPass(''); playSfx('success'); speak(`Hola ${t.name}`); return; } playSfx('error'); showToast("Acceso denegado", "error"); };
  const handleLogoClick = () => { setSecretCount(p=>p+1); if(secretCount>4) { speak("Fiesta"); triggerSecretConfetti(); setSecretCount(0); } };
  
  const openCerebroMenu = () => {
    setCerebro({ active: true, target: null, searching: false, type: null }); // Open menu mode
  };
  
  const activateCerebro = (type = 'member') => { // Default to member if not specified
    const targetType = type === 'team' ? 'team' : 'member';
    speak(targetType === 'team' ? "Buscando escuadrón" : "Buscando sujeto");
    setCerebro({ active: true, target: null, searching: true, type: targetType }); 
    
    // Choose source array based on type
    const source = targetType === 'team' ? teams.map(t => t.name) : teams.flatMap(t => t.members);
    
    let i = 0; 
    const interval = setInterval(() => { 
        // Random selection visual effect
        setCerebro(prev => ({ ...prev, target: source[Math.floor(Math.random() * source.length)] })); 
        i++; 
        if (i > 20) { 
            clearInterval(interval); 
            setCerebro(prev => ({ ...prev, searching: false })); 
            speak("Localizado"); 
            playSfx('success'); 
        } 
    }, 100); 
  };
  
  const reset = async () => { if (!window.confirm("¿Reiniciar temporada?")) return; teams.forEach(t => safeUpdate(t.id, {points: 0, shield: false, badges: [], dailyMath:0, dailyWord:0, dailyCombat:0, dailyMemory:0})); safeUpdate('mission_control', { history: [], timerEnd: null, furyMsg: null, bossMaxHp: 1500 }); speak("Reinicio"); };
  const updateM = async (txt) => { if(!isAdmin) return; await safeUpdate('mission_control', { text: txt }); setModal(null); speak("Misión actualizada"); };
  const toggleAlert = async () => { if(!isAdmin) return; const s = !redAlertMode; setRedAlertMode(s); await safeUpdate('mission_control', { alert: s }); if(s) { speak("Alerta Roja"); logAction("ALERTA ROJA"); playSfx('alarm'); } else logAction("Alerta desactivada"); };
  const spinPenalty = () => {
    if (selTeam.shield) {
        speak("Escudo activado"); playSfx('success');
        safeUpdate(selTeam.id, { shield: false }); 
        setPenalty("BLOCKED"); 
        logAction(`${selTeam.name} bloqueó sanción`);
        return;
    }
    const p = PENALTIES_LIST[Math.floor(Math.random() * PENALTIES_LIST.length)];
    setPenalty(p); playSfx('error');
    if (selTeam) logAction(`${selTeam.name} sanción: ${p}`);
  };

  const openDailyQuestion = () => {
    // RANDOM QUESTION FROM DATABASE (FIXED)
    const q = ACADEMIC_QUESTIONS[Math.floor(Math.random() * ACADEMIC_QUESTIONS.length)];
    setDailyQuestion(q);
    setShowAnswer(false);
    setModal('dailyQuestion');
    speak("Transmisión entrante.");
  };

  // --- ADAPTIVE MATH CHALLENGE ---
  const generateMathQuestion = (lvl) => {
      // LVL 1: Simple (Int < 50, Dec 1 digit, Frac common)
      if (lvl === 1) {
          const type = Math.random() > 0.5 ? 'int' : 'dec';
          if (type === 'int') {
              const op = Math.random()>0.5?'+':'-';
              const n1=Math.floor(Math.random()*40)+10; const n2=Math.floor(Math.random()*9)+1;
              const ans = op==='+'?n1+n2:n1-n2;
              return { q: `${n1} ${op} ${n2}`, a: ans.toString() };
          } else {
              const n1=(Math.random()*5).toFixed(1); const n2=(Math.random()*5).toFixed(1);
              const ans=(parseFloat(n1)+parseFloat(n2)).toFixed(1);
              return { q: `${n1} + ${n2}`, a: ans };
          }
      }
      // LVL 2: Standard (6th Grade)
      if (lvl === 2) {
          const type = ['int', 'dec'][Math.floor(Math.random()*2)];
          if (type === 'int') {
              const op = Math.random()>0.5?'+':'-';
              const n1=Math.floor(Math.random()*500)+100; const n2=Math.floor(Math.random()*500)+50;
              const ans = op==='+'?n1+n2:n1-n2;
              return { q: `${n1} ${op} ${n2}`, a: ans.toString() };
          } else {
              const n1=(Math.random()*50).toFixed(2); const n2=(Math.random()*20).toFixed(2);
              const ans=(parseFloat(n1)-parseFloat(n2)).toFixed(2);
              return { q: `${n1} - ${n2}`, a: ans };
          }
      }
      // LVL 3: Hard (Complex ops)
      const op = ['*','/'][Math.floor(Math.random()*2)];
      if (op === '*') {
          const n1=Math.floor(Math.random()*50)+10; const n2=Math.floor(Math.random()*9)+2;
          return { q: `${n1} * ${n2}`, a: (n1*n2).toString() };
      } else {
          const n2=Math.floor(Math.random()*9)+2; const ans=Math.floor(Math.random()*20)+5; const n1=n2*ans;
          return { q: `${n1} / ${n2}`, a: ans.toString() };
      }
  };

  const startMathChallenge = () => {
      if (!loggedInId) return;
      const t = teams.find(t => t.id === loggedInId);
      if ((t.dailyMath || 0) >= 4) { showToast("Batería de Matemáticas al 100%.", "info"); playSfx('error'); return; }
      
      // Reset to Level 2 (Medium) on start
      setMathState({ active: true, questions: [generateMathQuestion(2)], currentIdx: 0, level: 2 });
      setStreak(0); setModal('mathChallenge'); speak("Iniciando entrenamiento.");
  };

  const submitMathAnswer = () => {
     const currentQ = mathState.questions[mathState.currentIdx];
     const cleanInput = mathInput.trim().replace(',', '.'); 
     
     if (cleanInput === currentQ.a) {
         setStreak(s => s + 1); playSfx('success');
         let nextLevel = mathState.level;
         if (streak > 1 && nextLevel < 3) nextLevel++;

         if (mathState.currentIdx < 4) {
             setMathState(prev => ({ 
                 ...prev, 
                 level: nextLevel,
                 currentIdx: prev.currentIdx + 1,
                 questions: [...prev.questions, generateMathQuestion(nextLevel)] 
             }));
             setMathInput("");
         } else {
             handlePts(loggedInId, 1, null, true); // Force add
             handleDailyProgress(loggedInId, 'math');
             logAction(`${teams.find(t=>t.id===loggedInId).name} completó Mates.`);
             setModal(null); showToast("¡Correcto! +1 Punto", "success"); speak("Excelente trabajo."); triggerSecretConfetti();
         }
     } else {
         let nextLevel = Math.max(1, mathState.level - 1);
         playSfx('error');
         speak("Fallo. Recalibrando nivel.");
         showToast(`Incorrecto. Era ${currentQ.a}. Bajando dificultad...`, "info");
         setMathState({ 
             active: true, 
             questions: [generateMathQuestion(nextLevel)], 
             currentIdx: 0, 
             level: nextLevel 
         });
         setMathInput("");
         setStreak(0);
     }
  };

  // HYDRA WORD CHALLENGE
  const startWordChallenge = () => {
      const t = teams.find(t => t.id === loggedInId);
      if ((t.dailyWord || 0) >= 4) { showToast("Batería de Lengua al 100%.", "info"); playSfx('error'); return; }

      const word = HYDRA_WORDS[Math.floor(Math.random() * HYDRA_WORDS.length)];
      const scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
      setWordState({ active: true, word: word, scrambled: scrambled });
      setWordInput("");
      setModal('wordChallenge');
      speak("Desencriptando transmisión de Hydra.");
  };

  const submitWordAnswer = () => {
      if (wordInput.toUpperCase().trim() === wordState.word) {
          handlePts(loggedInId, 1, null, true); // Force add
          handleDailyProgress(loggedInId, 'word');
          playSfx('success');
          logAction(`${teams.find(t=>t.id===loggedInId).name} desencriptó ${wordState.word}`);
          setModal(null);
          showToast("¡Código Descifrado! +1 Punto", "success");
      } else {
          playSfx('error');
          showToast("Código incorrecto", "error");
          setWordInput("");
      }
  };
  
  // COMBAT CHALLENGE (TRIVIA)
  const startCombatChallenge = () => {
      if (!loggedInId) return;
      const t = teams.find(t => t.id === loggedInId);
      if ((t.dailyCombat || 0) >= 4) { showToast("Batería de Combate al 100%.", "info"); playSfx('error'); return; }

      const shuffled = [
        ...COMBAT_QUESTIONS.easy.map(q => ({...q, diff: 'easy'})),
        ...COMBAT_QUESTIONS.medium.map(q => ({...q, diff: 'medium'})),
        ...COMBAT_QUESTIONS.hard.map(q => ({...q, diff: 'hard'}))
      ];
      
      // Select random 5 questions now
      const selected = shuffled.sort(() => 0.5 - Math.random()).slice(0, 5);
      
      setCombatState({ active: true, questions: selected, currentIdx: 0, correctCount: 0 });
      setCombatInput("");
      setModal('combatChallenge');
      speak("Simulación de combate iniciada. Tanda de 5 objetivos.");
  };
  
  const submitCombatAnswer = () => {
      const currentQ = combatState.questions[combatState.currentIdx];
      const isCorrect = combatInput.toUpperCase().trim() === currentQ.a;
      
      let newCorrectCount = combatState.correctCount + (isCorrect ? 1 : 0);
      
      if (isCorrect) {
          playSfx('success');
          showToast("¡Objetivo neutralizado!", "success");
      } else {
          playSfx('error');
          showToast(`Fallo. Era: ${currentQ.a}`, "error");
      }

      if (combatState.currentIdx < 4) { // Changed to 4 (index 0 to 4 is 5 items)
          setCombatState(prev => ({ ...prev, currentIdx: prev.currentIdx + 1, correctCount: newCorrectCount }));
          setCombatInput("");
      } else {
          if (newCorrectCount === 5) { // Check for 5 correct
              handlePts(loggedInId, 1, null, true); // 1 point for the set
              handleDailyProgress(loggedInId, 'combat');
              logAction(`${teams.find(t=>t.id===loggedInId).name} superó la simulación (5/5).`);
              showToast("¡Simulación Perfecta! +1 Punto", "success");
              speak("Simulación completada con éxito.");
              triggerSecretConfetti();
          } else {
              showToast(`Simulación finalizada. ${newCorrectCount}/5 aciertos.`, "info");
              speak("Simulación fallida. Se requiere 100% de efectividad.");
          }
          setModal(null);
          setCombatInput("");
      }
  };

  // MEMORY CHALLENGE (NEW)
  const startMemoryChallenge = () => {
      if (!loggedInId) return;
      const t = teams.find(t => t.id === loggedInId);
      if ((t.dailyMemory || 0) >= 4) { showToast("Batería de Memoria al 100%.", "info"); playSfx('error'); return; }

      // Generate pairs
      const shuffledQs = [...ACADEMIC_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6);
      const cards = [];
      shuffledQs.forEach((item, index) => {
         cards.push({ id: `q-${index}`, content: item.q, type: 'q', pairId: index, isFlipped: false, isMatched: false });
         cards.push({ id: `a-${index}`, content: item.a, type: 'a', pairId: index, isFlipped: false, isMatched: false });
      });
      // Shuffle cards
      cards.sort(() => 0.5 - Math.random());
      
      setMemoryState({ active: true, cards: cards, flipped: [], matched: [], lock: false });
      setModal('memoryChallenge');
      speak("Protocolo de Sincronización iniciado.");
  };

  const handleCardClick = (id) => {
      if (memoryState.lock) return;
      const clickedCard = memoryState.cards.find(c => c.id === id);
      if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

      playSfx('click');

      // Flip card
      const newCards = memoryState.cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
      const newFlipped = [...memoryState.flipped, clickedCard];
      
      setMemoryState({ ...memoryState, cards: newCards, flipped: newFlipped });

      if (newFlipped.length === 2) {
          setMemoryState(prev => ({ ...prev, lock: true }));
          // Check match
          if (newFlipped[0].pairId === newFlipped[1].pairId) {
              playSfx('success');
              setTimeout(() => {
                  const matchedCards = newCards.map(c => (c.id === newFlipped[0].id || c.id === newFlipped[1].id) ? { ...c, isMatched: true } : c);
                  const newMatched = [...memoryState.matched, newFlipped[0].pairId];
                  
                  // Check win
                  if (newMatched.length === 6) {
                      handlePts(loggedInId, 1, null, true);
                      handleDailyProgress(loggedInId, 'memory');
                      logAction(`${teams.find(t=>t.id===loggedInId).name} completó Sincronización.`);
                      setModal(null);
                      showToast("¡Sincronización Completa! +1 Punto", "success");
                      speak("Sistemas sincronizados.");
                      triggerSecretConfetti();
                  } else {
                     setMemoryState(prev => ({ ...prev, cards: matchedCards, flipped: [], lock: false, matched: newMatched }));
                  }
              }, 1000);
          } else {
              playSfx('error');
              setTimeout(() => {
                  const resetCards = newCards.map(c => (c.id === newFlipped[0].id || c.id === newFlipped[1].id) ? { ...c, isFlipped: false } : c);
                  setMemoryState(prev => ({ ...prev, cards: resetCards, flipped: [], lock: false }));
              }, 1000);
          }
      }
  };

  // Render Vars
  const totalPoints = teams.reduce((a, b) => a + Math.max(0, b.points), 0);
  const maxPoints = Math.max(...teams.map(t => t.points), 50);
  const bossDefeated = totalPoints >= bossMaxHp;
  const bossProgress = Math.min(100, (totalPoints / bossMaxHp) * 100);
  const leaderId = teams.length > 0 ? teams[0].id : null;
  const loggedInTeam = teams.find(t => t.id === loggedInId);

  if (errorMsg) return <div className="p-10 text-red-500 bg-black h-screen font-mono">ERROR: {errorMsg}</div>;
  if (loading) return <div className="p-10 text-cyan-500 bg-black h-screen font-mono animate-pulse">CARGANDO SISTEMA S.H.I.E.L.D...</div>;

  return (
    <div className={`min-h-screen bg-[#020617] text-white font-sans pb-20 overflow-x-hidden ${redAlertMode ? 'border-4 border-red-600' : ''} ${shaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}`}>
      {confetti.active && (<div className="fixed pointer-events-none z-50" style={{left: confetti.x, top: confetti.y}}>{[...Array(40)].map((_,i) => <div key={i} className="absolute w-2 h-2 rounded-full animate-confetti" style={{ backgroundColor: ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'][Math.floor(Math.random() * 5)], '--tx': `${Math.random()*300-150}px`, '--ty': `${Math.random()*300-150}px`, '--r': `${Math.random() * 360}deg` }} />)}</div>)}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <header className={`relative z-20 w-full p-4 border-b flex flex-wrap justify-between items-center gap-4 ${redAlertMode ? 'bg-red-900/90 border-red-500' : 'bg-slate-900/90 border-cyan-500/30'}`}>
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={handleLogoClick}>
            <div className={`absolute inset-0 blur-lg opacity-40 group-hover:opacity-80 transition-opacity rounded-full ${redAlertMode ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
            <img src="https://i.ibb.co/Ndt35H2Z/SHIELD-CSB.png" alt="S.H.I.E.L.D." className="w-10 h-10 object-contain relative z-10 active:scale-95 transition-transform" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-black tracking-[0.2em] leading-none">AVENGERS <span className={redAlertMode ? "text-red-300" : "text-cyan-500"}>INITIATIVE</span></h1>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-800/50 px-1 rounded border border-slate-700">{APP_VERSION}</span>
            </div>
            {/* DAILY QUOTE BANNER */}
            <div className="hidden md:block text-[10px] text-cyan-400/80 font-mono mt-1 overflow-hidden whitespace-nowrap">
                <span className="animate-pulse">▮</span> {dailyQuote}
            </div>
          </div>
        </div>
        
        {/* CRONOMETER REMOVED */}

        <div className="flex gap-2 items-center">
            {useLocal && <span className="text-[10px] text-orange-500 font-mono bg-orange-900/20 px-2 py-1 rounded border border-orange-500/50 flex items-center gap-1"><WifiOff size={10}/> LOCAL</span>}
            {questionAvailable && <button onClick={openDailyQuestion} className="animate-bounce bg-yellow-500/20 border border-yellow-500 px-3 py-1 rounded text-yellow-300 text-xs font-bold flex gap-1"><Radio size={12}/> MENSAJE</button>}
            
            {/* STUDENT TRAINING BUTTONS */}
            {loggedInId && (
                <div className="flex gap-1">
                    <button onClick={startMathChallenge} className="bg-green-500/20 border border-green-500 px-3 py-1 rounded text-green-300 text-xs font-bold flex gap-1 items-center hover:bg-green-500/40 transition-colors">
                        <Calculator size={14}/> MATES
                    </button>
                    <button onClick={startWordChallenge} className="bg-purple-500/20 border border-purple-500 px-3 py-1 rounded text-purple-300 text-xs font-bold flex gap-1 items-center hover:bg-purple-500/40 transition-colors">
                        <Type size={14}/> DESCIFRAR
                    </button>
                    <button onClick={startCombatChallenge} className="bg-red-500/20 border border-red-500 px-3 py-1 rounded text-red-300 text-xs font-bold flex gap-1 items-center hover:bg-red-500/40 transition-colors">
                        <Target size={14}/> COMBATE
                    </button>
                    {/* NEW MEMORY BUTTON */}
                    <button onClick={startMemoryChallenge} className="bg-cyan-500/20 border border-cyan-500 px-3 py-1 rounded text-cyan-300 text-xs font-bold flex gap-1 items-center hover:bg-cyan-500/40 transition-colors">
                        <Grid3X3 size={14}/> MEMORIA
                    </button>
                </div>
            )}

            {isAdmin ? (
                <>
                  <button onClick={resetDailyLimits} className="p-2 rounded border bg-green-900/50 border-green-500 hover:text-green-300" title="Recargar Días"><RefreshCw size={16}/></button>
                  <button onClick={handleSnap} className="p-2 rounded border bg-slate-800 border-yellow-500 text-yellow-400 hover:scale-110 transition-transform" title="CHASQUIDO"><Hand size={16}/></button>
                  <button onClick={handleBossAttack} className="p-2 rounded border bg-red-900/80 border-red-500 text-white hover:scale-110 transition-transform animate-pulse" title="ATAQUE DE THANOS"><Skull size={16}/></button>
                  <button onClick={()=>setModal('fury')} className="p-2 rounded border bg-slate-800 border-slate-600 hover:text-cyan-400" title="Mensaje Fury"><MessageSquare size={16}/></button>
                  <button onClick={startDuel} className="p-2 rounded border bg-orange-900/50 border-orange-500 hover:text-orange-300"><Swords size={16}/></button>
                  <button onClick={triggerMultiverse} className="p-2 rounded border bg-purple-900/50 border-purple-500 hover:text-purple-300 animate-pulse"><Dices size={16}/></button>
                  <button onClick={openCerebroMenu} className="p-2 rounded border bg-pink-900/50 border-pink-500 hover:text-pink-300" title="CEREBRO: Elegir Alumno/Equipo"><Brain size={16}/></button>
                  <button onClick={toggleAlert} className={`p-2 rounded border ${redAlertMode ? 'bg-red-600 border-white animate-pulse' : 'bg-slate-800 border-slate-600 hover:text-red-400'}`}><Siren size={16}/></button>
                  <button onClick={()=>setModal('history')} className="p-2 rounded border bg-slate-800 border-slate-600 hover:text-white"><History size={16}/></button>
                  <button onClick={reset} className="p-2 rounded border bg-slate-800 border-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                  <button onClick={()=>{setIsAdmin(false); setLoggedInId(null);}} className="bg-red-900/50 border border-red-500 px-3 py-1 rounded text-xs font-bold">SALIR</button>
                </>
            ) : loggedInId ? (
                <button onClick={()=>{setIsAdmin(false); setLoggedInId(null);}} className="bg-yellow-900/50 border border-yellow-500 px-3 py-1 rounded text-xs font-bold">SALIR</button>
            ) : (
                <button onClick={()=>setModal('login')} className="bg-cyan-900/50 border border-cyan-500 px-3 py-1 rounded text-xs font-bold"><Lock size={12}/> ACCESO</button>
            )}
            <button onClick={() => setSound(!sound)} className={`p-2 rounded border ${sound ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800 border-slate-700'}`}>{sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button>
            <button onClick={() => setModal('catalog')} className="flex gap-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-sm text-slate-400 text-xs font-bold uppercase"><Info size={14}/> INFO</button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
        <aside className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/80 border border-cyan-500/20 rounded-sm p-5 shadow-lg flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
             <h3 className="text-lg font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-cyan-500/20 pb-2"><TrendingUp size={20} /> Clasificación</h3>
             <div className="space-y-3 flex-1">
                {teams.map((t, i) => {
                   const rInfo = getRankInfo(t.points);
                   const isNeg = t.points < 0;
                   const clr = i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-slate-500";
                   const nextRankPct = Math.min(100, Math.max(0, ((t.points - (rInfo.next - rInfo.total)) / rInfo.total) * 100));

                   return (
                      <div key={t.id}>
                         <div className="flex justify-between items-center mb-1 text-xs font-bold uppercase tracking-wide"><span className={`flex items-center gap-2 ${clr}`}>{i === 0 && <Crown size={12} className="animate-bounce" />} #{i + 1} {t.name} <span className="text-[9px] text-slate-500 ml-1 opacity-70">NVL {Math.floor(t.points/100)}</span></span><span className={isNeg ? "text-red-400" : "text-cyan-300"}>{t.points}</span></div>
                         <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-1"><div className={`h-full transition-all duration-1000 ${isNeg ? 'bg-red-600' : t.barColor}`} style={{ width: `${Math.min(100, Math.max(0, (t.points / (bossMaxHp/3)) * 100))}%` }}></div></div>
                         {/* XP BAR */}
                         <div className="h-0.5 bg-slate-900 rounded-full overflow-hidden w-full opacity-50"><div className="h-full bg-white/50" style={{ width: `${nextRankPct}%` }}></div></div>
                      </div>
                   );
                })}
             </div>
          </div>
          
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-sm p-5 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.5)] bg-purple-900/50"><img src="https://i.ibb.co/7NjPsfgb/183d8eefe6fe041dd1169fdeaab016f8.gif" alt="Thanos" className="w-full h-full object-cover" /></div>
                  <div><h3 className="text-sm font-black text-purple-400 uppercase leading-none mb-1">Amenaza: Thanos</h3><span className="text-xs font-mono text-purple-200">{totalPoints}/{bossMaxHp} DAÑO</span></div>
               </div>
               <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-purple-900 relative"><div className={`h-full transition-all duration-1000 flex items-center justify-center ${bossDefeated ? 'bg-green-500' : 'bg-gradient-to-r from-purple-600 to-red-500'}`} style={{width: `${bossProgress}%`}}></div></div>
               {bossDefeated && <p className="text-center text-xs font-bold text-green-400 mt-1 animate-pulse">¡AMENAZA NEUTRALIZADA!</p>}
            </div>
          </div>

          <div onClick={() => isAdmin && setModal('mission')} className={`bg-slate-900/80 border border-blue-500/20 rounded-sm p-5 shadow-lg relative overflow-hidden group ${isAdmin?'cursor-pointer hover:border-blue-400':''}`}>
             <h3 className="text-xs font-black text-blue-300 uppercase mb-2 flex gap-2"><ClipboardList size={14}/> Misión Prioritaria</h3>
             <p className="text-xs text-white font-mono">"{mission}"</p>
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
              <div key={t.id} className={`relative group rounded p-[1px] transition-all ${isMine?'scale-[1.02] z-10':'hover:scale-[1.01]'}`}>
                <div className={`absolute inset-0 rounded bg-gradient-to-b ${t.theme} opacity-30`}></div>
                <div className={`h-full bg-slate-950/90 border ${isMine?'border-yellow-500':t.border.split(' ')[0]} p-4 rounded backdrop-blur-xl flex flex-col justify-between shadow-xl relative overflow-hidden`}>
                  <div className="absolute -right-0 -bottom-0 w-40 h-40 opacity-10 pointer-events-none transition-transform group-hover:scale-110" style={{mixBlendMode:'luminosity'}}><img src={t.gif} className="w-full h-full object-cover"/></div>
                  
                  {/* SHIELD OVERLAY */}
                  {t.shield && (
                      <div className="absolute top-2 right-2 z-20 text-blue-400 animate-pulse drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" title="Campo de Fuerza Activo">
                          <ShieldCheck size={32} strokeWidth={2} fill="rgba(59, 130, 246, 0.2)"/>
                      </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex gap-2 items-center"><div className={`w-10 h-10 rounded-full border border-white/20 bg-slate-900 overflow-hidden ${t.accent}`}><img src={t.gif} className="w-full h-full object-cover"/></div><div><div className={`text-[8px] font-black uppercase tracking-widest ${rInfo.color}`}>{rInfo.title}</div><h2 className="text-sm font-black uppercase tracking-wider text-white">{t.name}</h2></div></div>
                      <span className={`text-2xl font-black font-mono tracking-tighter ${t.points<0?'text-red-400':'text-white'}`}>{t.points}</span>
                    </div>
                    
                    {/* WAKANDA LOOT EFFECT BADGE */}
                    {t.lastLoot && (
                        <div className={`absolute top-2 right-12 z-20 px-2 py-1 rounded text-[9px] font-bold uppercase animate-pulse shadow-lg ${t.lastLoot === 'bad' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                            {t.lastLoot === 'bad' ? '¡MALDICIÓN!' : '¡SUERTE!'}
                        </div>
                    )}

                    {/* DAILY ENERGY CELLS */}
                    <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Calculator size={10} className="text-green-400"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full border border-green-900 ${i<(t.dailyMath||0)?'bg-green-400 animate-pulse':'bg-black/50'}`}></div>)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Type size={10} className="text-purple-400"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full border border-purple-900 ${i<(t.dailyWord||0)?'bg-purple-400 animate-pulse':'bg-black/50'}`}></div>)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Target size={10} className="text-red-400"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full border border-red-900 ${i<(t.dailyCombat||0)?'bg-red-400 animate-pulse':'bg-black/50'}`}></div>)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Grid3X3 size={10} className="text-cyan-400"/>
                          <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full border border-cyan-900 ${i<(t.dailyMemory||0)?'bg-cyan-400 animate-pulse':'bg-black/50'}`}></div>)}</div>
                        </div>
                    </div>

                    {/* BADGES ROW */}
                    {t.badges && t.badges.length > 0 && (
                        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                            {t.badges.map((b, idx) => (
                                <div key={idx} className={`p-1 rounded bg-slate-800 border border-white/10 ${b.color}`} title={b.name}>{b.icon}</div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-1 mb-3 relative z-10">
                       {t.points >= 100 && <Award size={14} className="text-blue-400" />}
                       {t.points >= 300 && <Award size={14} className="text-purple-400" />}
                       {t.points >= 500 && <Award size={14} className="text-yellow-400" />}
                    </div>
                    <div className="flex justify-between bg-slate-900/50 p-1 rounded mb-3 border border-white/5 relative z-10">{INFINITY_STONES.map((s,i)=>(<div key={i} title={s.name} className={t.points>=s.threshold?s.color:'text-slate-800'}><Hexagon size={12} fill="currentColor"/></div>))}</div>
                    <div className="mb-4 relative z-10 pl-2 border-l border-white/10"><div className="text-[9px] uppercase tracking-widest opacity-50 font-bold text-slate-300 mb-1">OPERATIVOS</div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                        {t.members.map((m, idx) => (
                            <div key={idx} className="bg-cyan-900/20 border border-cyan-500/30 rounded px-2 py-1 text-[10px] text-cyan-100 font-mono text-center shadow-[0_0_5px_rgba(6,182,212,0.1)]">
                                {m}
                            </div>
                        ))}
                    </div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <div className="mb-4 relative pl-3 border-l-2 border-white/10 group-hover:border-white/30 transition-colors"><p className={`text-xs italic font-medium leading-tight ${t.accent} opacity-80`}>"{t.quote}"</p></div>
                    {isAdmin && (
                      <div className="grid gap-1">
                        <div className="flex gap-1">{[1,5,10].map(v => <button key={v} onClick={(e)=>handlePts(t.id, v, e)} className={`${CTRL_BTN_CLASS} bg-green-900/20 text-green-400 border-green-500/30 hover:bg-green-500 hover:text-black`}>+{v}</button>)}</div>
                        <div className="flex gap-1">{[-1,-5,-10].map(v => <button key={v} onClick={(e)=>handlePts(t.id, v, e)} className={`${CTRL_BTN_CLASS} bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-black`}>{v}</button>)}</div>
                        <div className="flex gap-1 mt-1">
                          <button onClick={()=>{setSelTeam(t); setModal('shop');}} className={`${CTRL_BTN_CLASS} bg-yellow-900/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500 hover:text-black flex justify-center gap-1`}><ShoppingCart size={12}/> TIENDA</button>
                          <button onClick={()=>{setSelTeam(t); setPenalty(null); setModal('penalty');}} className={`${CTRL_BTN_CLASS} flex items-center justify-center gap-1 ${isNeg ? 'bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-500 hover:text-white' : 'bg-slate-600 text-slate-600 border-slate-700 cursor-not-allowed'}`}><Gavel size={12}/> SANCIÓN</button>
                        </div>
                        <div className="flex gap-1 mt-1">
                            <button onClick={()=>setModal('badges_' + t.id)} className={`${CTRL_BTN_CLASS} bg-blue-900/20 text-blue-300 border-blue-500/30 hover:bg-blue-600 hover:text-white`}>MEDALLA</button>
                        </div>
                      </div>
                    )}
                    {isMine && !isAdmin && <button onClick={()=>{setSelTeam(t); setModal('shop');}} className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs rounded uppercase shadow-lg">ARMERÍA</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
        <div className="fixed bottom-1 right-1 z-[60] text-[8px] text-white/10 font-mono select-none pointer-events-none">{APP_VERSION}</div>
      </main>

      <footer className="fixed bottom-0 w-full bg-slate-950 border-t border-cyan-900 h-6 flex items-center overflow-hidden z-50">
        <div className="px-4 bg-cyan-900/50 h-full flex items-center text-[9px] font-bold text-cyan-200">NEWS</div>
        <div className="flex-1 whitespace-nowrap overflow-hidden"><div className="animate-[marquee_20s_linear_infinite] text-[9px] font-mono text-cyan-400/70">{TICKER_MESSAGES[tickerIdx]}</div></div>
      </footer>

      {/* --- MODALS --- */}

      {/* BOSS ATTACK MODAL */}
      {modal === 'bossAttack' && bossAttackState.active && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
             <div className="bg-slate-900 border-4 border-red-600 p-6 rounded-lg w-full max-w-lg shadow-[0_0_50px_rgba(220,38,38,0.5)] relative overflow-hidden animate-in zoom-in duration-300">
                 
                 <div className="flex justify-between items-center mb-6 border-b border-red-900/50 pb-4">
                     <h3 className="text-2xl font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                         <Skull size={32} className="animate-pulse"/> PROTOCOLO GUANTELETE
                     </h3>
                     <div className="text-xs font-mono text-slate-400">OBJETIVO: {bossAttackState.team.name}</div>
                 </div>

                 <div className="mb-8">
                     <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase">
                         <span>Gema {bossAttackState.currentIdx + 1}/6</span>
                         <span>Fallos: <span className="text-red-500">{bossAttackState.mistakes}</span></span>
                     </div>
                     <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div 
                            className="h-full transition-all duration-500" 
                            style={{ 
                                width: `${((bossAttackState.currentIdx) / 6) * 100}%`,
                                backgroundColor: ['#3b82f6', '#ef4444', '#a855f7', '#eab308', '#22c55e', '#f97316'][bossAttackState.currentIdx] 
                            }}
                         ></div>
                     </div>
                 </div>

                 <div className="bg-black/50 p-6 rounded border border-white/10 mb-6 text-center min-h-[8rem] flex items-center justify-center">
                     <p className="text-xl font-bold text-white leading-relaxed">
                         {bossAttackState.questions[bossAttackState.currentIdx].q}
                     </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <button 
                         onClick={() => submitBossAnswer("INCORRECTO")} 
                         className="py-4 bg-red-900/20 hover:bg-red-600 border border-red-600 text-red-200 font-bold uppercase rounded transition-all"
                     >
                         FALLO (-10 PTS)
                     </button>
                     <button 
                         onClick={() => submitBossAnswer(bossAttackState.questions[bossAttackState.currentIdx].a)} 
                         className="py-4 bg-green-900/20 hover:bg-green-600 border border-green-600 text-green-200 font-bold uppercase rounded transition-all"
                     >
                         ACIERTO
                     </button>
                 </div>
                 
                 <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-500 font-mono">RESPUESTA: <span className="text-slate-300 font-bold">{bossAttackState.questions[bossAttackState.currentIdx].a}</span></p>
                 </div>
             </div>
         </div>
      )}

      {/* MATH CHALLENGE MODAL (STUDENT TRAINING) */}
      {modal === 'mathChallenge' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="bg-slate-900 border-2 border-green-500 p-6 rounded-sm w-full max-w-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 animate-pulse"></div>
                  <h3 className="text-xl font-black text-green-400 mb-1 flex items-center gap-2"><Brain size={24}/> ENTRENAMIENTO MATEMÁTICO</h3>
                  <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-mono text-green-600/70">NIVEL {mathState.level} | FASE {mathState.currentIdx + 1} / 5</p>
                      {streak > 1 && <div className="text-orange-500 text-xs font-bold flex items-center animate-pulse"><Flame size={12}/> x{streak}</div>}
                  </div>

                  <div className="bg-black p-6 rounded border border-green-900 mb-6 text-center flex flex-col gap-2">
                      <p className="text-4xl font-mono font-bold text-white tracking-widest">
                          {mathState.questions[mathState.currentIdx].q}
                      </p>
                      {mathState.questions[mathState.currentIdx].hint && <p className="text-[10px] text-slate-500">{mathState.questions[mathState.currentIdx].hint}</p>}
                  </div>

                  <input 
                      type="text" 
                      value={mathInput} 
                      onChange={(e) => setMathInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitMathAnswer()}
                      className="w-full bg-slate-800 border border-green-700 p-3 text-white text-center font-bold text-xl mb-4 focus:border-green-400 outline-none"
                      placeholder="Resultado"
                      autoFocus
                  />
                  
                  <div className="flex gap-2">
                      <button onClick={() => setModal(null)} className="flex-1 py-3 text-xs text-slate-500 hover:text-white">ABORTAR</button>
                      <button onClick={submitMathAnswer} className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded uppercase">CONFIRMAR</button>
                  </div>
              </div>
          </div>
      )}

      {/* WORD CHALLENGE MODAL */}
      {modal === 'wordChallenge' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="bg-slate-900 border-2 border-purple-500 p-6 rounded-sm w-full max-w-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50 animate-pulse"></div>
                  <h3 className="text-xl font-black text-purple-400 mb-4 flex items-center gap-2"><Binary size={24}/> DESCIFRADO HYDRA</h3>
                  
                  <div className="bg-black p-6 rounded border border-purple-900 mb-6 text-center">
                      <p className="text-3xl font-mono font-bold text-purple-200 tracking-[0.5em] animate-pulse">
                          {wordState.scrambled}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2">ORDENA LAS LETRAS</p>
                  </div>

                  <input 
                      type="text" 
                      value={wordInput} 
                      onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && submitWordAnswer()}
                      className="w-full bg-slate-800 border border-purple-700 p-3 text-white text-center font-bold text-xl mb-4 focus:border-purple-400 outline-none uppercase"
                      placeholder="SOLUCIÓN"
                      autoFocus
                  />
                  
                  <div className="flex gap-2">
                      <button onClick={() => setModal(null)} className="flex-1 py-3 text-xs text-slate-500 hover:text-white">ABORTAR</button>
                      <button onClick={submitWordAnswer} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded uppercase">ENVIAR CÓDIGO</button>
                  </div>
              </div>
          </div>
      )}
      
      {/* COMBAT CHALLENGE MODAL */}
      {modal === 'combatChallenge' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="bg-slate-900 border-2 border-red-500 p-6 rounded-sm w-full max-w-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-pulse"></div>
                  <h3 className="text-xl font-black text-red-400 mb-4 flex items-center gap-2"><Target size={24}/> SIMULACIÓN COMBATE</h3>
                  <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-mono text-red-400/70">OBJETIVO {combatState.currentIdx + 1} / 5</p>
                  </div>
                  
                  <div className="bg-black p-6 rounded border border-red-900 mb-6 text-center">
                      <p className="text-lg font-bold text-white leading-relaxed">
                          {combatState.questions[combatState.currentIdx].q}
                      </p>
                  </div>

                  <input 
                      type="text" 
                      value={combatInput} 
                      onChange={(e) => setCombatInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && submitCombatAnswer()}
                      className="w-full bg-slate-800 border border-red-700 p-3 text-white text-center font-bold text-xl mb-4 focus:border-red-400 outline-none uppercase"
                      placeholder="RESPUESTA"
                      autoFocus
                  />
                  
                  <div className="flex gap-2">
                      <button onClick={() => setModal(null)} className="flex-1 py-3 text-xs text-slate-500 hover:text-white">ABORTAR</button>
                      <button onClick={submitCombatAnswer} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded uppercase">DISPARAR</button>
                  </div>
              </div>
          </div>
      )}

      {/* MEMORY CHALLENGE MODAL */}
      {modal === 'memoryChallenge' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="bg-slate-900 border-2 border-cyan-500 p-6 rounded-sm w-full max-w-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 animate-pulse"></div>
                  <h3 className="text-xl font-black text-cyan-400 mb-4 flex items-center gap-2"><Grid3X3 size={24}/> PROTOCOLO SINCRONIZACIÓN</h3>
                  <p className="text-xs text-slate-400 mb-4 font-mono">EMPAREJA LOS CONCEPTOS</p>

                  <div className="grid grid-cols-4 gap-3">
                      {memoryState.cards.map((card) => (
                          <div 
                              key={card.id} 
                              onClick={() => handleCardClick(card.id)}
                              className={`h-24 rounded border flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                  card.isMatched ? 'bg-green-900/50 border-green-500' :
                                  card.isFlipped ? 'bg-cyan-900/50 border-cyan-400' : 
                                  'bg-slate-800 border-slate-700 hover:bg-slate-700'
                              }`}
                          >
                              {card.isFlipped || card.isMatched ? (
                                  <p className="text-xs font-bold text-white text-center p-2 leading-tight">{card.content}</p>
                              ) : (
                                  <Shield size={32} className="text-slate-600 opacity-20" />
                              )}
                          </div>
                      ))}
                  </div>

                  <button onClick={() => setModal(null)} className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold uppercase rounded">CANCELAR</button>
              </div>
          </div>
      )}

      {/* BADGE SELECTION MODAL */}
      {modal?.startsWith('badges_') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
              <div className="bg-slate-900 border border-blue-500/50 p-6 rounded-sm w-full max-w-sm shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">OTORGAR CONDECORACIÓN</h3>
                  <div className="grid grid-cols-2 gap-2">
                      {BADGES_LIST.map((b, idx) => (
                          <button key={idx} onClick={() => { handleBadge(modal.split('_')[1], b); setModal(null); }} className={`p-3 border border-white/10 rounded flex flex-col items-center gap-2 hover:bg-slate-800 ${b.color}`}>
                              {b.icon}
                              <span className="text-xs font-bold">{b.name}</span>
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setModal(null)} className="mt-4 w-full text-xs text-slate-500">Cancelar</button>
              </div>
          </div>
      )}

      {furyMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 animate-in zoom-in duration-300">
              <div className="max-w-2xl w-full border-4 border-red-600 bg-slate-900 p-8 shadow-[0_0_50px_rgba(220,38,38,0.5)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
                  <div className="flex flex-col items-center gap-6 text-center relative z-10">
                      <div className="bg-red-600 text-black p-3 rounded-full animate-bounce"><Shield size={64} /></div>
                      <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase">PRIORIDAD ALPHA</h1>
                      <div className="w-full h-px bg-red-600/50 my-2"></div>
                      <p className="text-2xl md:text-3xl font-mono text-red-400 font-bold leading-relaxed typing-effect">{furyMessage}</p>
                      {isAdmin && <button onClick={clearFuryMessage} className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs uppercase tracking-widest rounded border border-slate-600">Cancelar Alerta</button>}
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
              </div>
          </div>
      )}

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
                    <div className="text-center"><div className={`w-16 h-16 rounded-full mx-auto mb-2 border-2 ${duelData.t1.accent} overflow-hidden`}><img src={duelData.t1.gif} className="w-full h-full object-cover"/></div><p className="text-xs font-bold text-white">{duelData.t1.name}</p></div>
                    <div className="text-2xl font-black text-white">VS</div>
                    <div className="text-center"><div className={`w-16 h-16 rounded-full mx-auto mb-2 border-2 ${duelData.t2.accent} overflow-hidden`}><img src={duelData.t2.gif} className="w-full h-full object-cover"/></div><p className="text-xs font-bold text-white">{duelData.t2.name}</p></div>
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
      
      {modal === 'fury' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-500 p-6 rounded-sm w-full max-w-md shadow-2xl">
               <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><MessageSquare size={20}/> MENSAJE DE FURY</h3>
               <textarea value={newFuryMsg} onChange={e=>setNewFuryMsg(e.target.value)} className="w-full bg-black border border-slate-700 p-4 text-white mb-4 font-mono text-sm h-32" placeholder="Escribe el mensaje urgente..." />
               <button onClick={()=> { sendFuryMessage(); setModal(null); }} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded uppercase mb-2">ENVIAR A TODOS</button>
               <button onClick={clearFuryMessage} className="w-full bg-red-900/50 hover:bg-red-900 text-red-300 font-bold py-2 rounded uppercase text-xs mb-2">BORRAR MENSAJE ACTUAL</button>
               <button onClick={()=>setModal(null)} className="w-full mt-2 text-slate-500 text-xs">Cancelar</button>
           </div>
        </div>
      )}

      {modal === 'dailyQ' && dailyQuestion && (
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
              {REWARDS_LIST.map((reward) => (<div key={reward.id} className="group relative bg-black/40 border border-white/5 hover:border-yellow-500/50 rounded-sm p-4 transition-all hover:bg-yellow-900/10 flex justify-between items-center"><div className="flex items-start gap-4"><div className="bg-yellow-500/10 p-3 rounded-sm text-yellow-500 group-hover:scale-110 transition-transform"><Zap size={20} /></div><div><h4 className="font-bold text-slate-200 group-hover:text-yellow-400 transition-colors uppercase tracking-wide">{reward.name}</h4><p className="text-xs text-slate-500 mt-1">{reward.desc}</p></div></div><button onClick={() => handleBuy(selTeam.id, reward.cost, reward.id)} disabled={selTeam.points < reward.cost} className={`px-6 py-2 rounded-sm font-bold font-mono text-sm border transition-all duration-300 ${selTeam.points >= reward.cost ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500 hover:text-black shadow-lg' : 'bg-transparent text-slate-600 border-slate-800 cursor-not-allowed'}`}>{reward.cost} PTS</button></div>))}
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
              {!penalty ? (<button onClick={spinPenalty} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-sm shadow-[0_0_30px_rgba(220,38,38,0.4)] flex justify-center gap-3"><RefreshCw size={20} /> GENERAR SANCIÓN</button>) : (<div className="animate-in zoom-in duration-300"><div className="bg-black/50 p-6 rounded-sm border border-red-500/30 mb-6 text-center"><p className="text-xs text-red-400 mb-3">Sentencia:</p><div className={`text-xl font-bold font-mono p-2 rounded ${penalty==='BLOCKED'?'text-blue-300 border border-blue-500':'text-white'}`}>{penalty==='BLOCKED'?'¡ESCUDO ACTIVADO! Sanción bloqueada.':penalty}</div></div><div className="flex gap-3"><button onClick={spinPenalty} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-sm font-bold text-xs uppercase">Reintentar</button><button onClick={() => setModal(null)} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-sm font-bold text-xs uppercase shadow-lg">Ejecutar</button></div></div>)}
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
              <div className="mb-6 bg-blue-900/10 border border-blue-500/20 p-4 rounded-sm">
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Órdenes Manuales del Director</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customMission} 
                    onChange={(e) => setCustomMission(e.target.value)} 
                    placeholder="Escribir misión..." 
                    className="flex-1 bg-black/50 border border-blue-500/30 rounded-sm px-3 py-2 text-white outline-none text-sm focus:border-blue-400 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && customMission.trim() && updateM(customMission)}
                  />
                  <button 
                    onClick={() => { if (customMission.trim()) updateM(customMission); }} 
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!customMission.trim()}
                  >
                    Activar
                  </button>
                </div>
              </div>
              <div className="space-y-6">{['Comportamiento', 'Académico', 'Organización', 'Social', 'Especial'].map(cat => (<div key={cat}><h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">{cat}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{MISSION_BATTERY.filter(m => m.category === cat).map((m, i) => (<button key={i} onClick={() => updateM(m.text)} className="text-left bg-slate-800/50 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 p-3 rounded-sm transition-all group flex items-start gap-3">{mission === m.text ? <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" /> : <PlusCircle size={16} className="text-slate-500 group-hover:text-blue-400 mt-0.5 shrink-0" />}<span className={`text-sm ${mission === m.text ? 'text-green-300 font-bold' : 'text-slate-300 group-hover:text-white'}`}>{m.text}</span></button>))}</div></div>))}</div>
            </div>
          </div>
        </div>
      )}

      {cerebro.active && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={()=>{if(!cerebro.searching)setCerebro({...cerebro, active:false})}}></div>
          <div className="relative z-10 text-center bg-slate-900/80 p-8 rounded-xl border border-purple-500/30 backdrop-blur-sm max-w-lg w-full mx-4 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            
            {/* IF NO MODE SELECTED */}
            {!cerebro.type ? (
               <>
                 <Brain size={80} className="mx-auto text-purple-500 mb-6 animate-pulse" />
                 <h2 className="text-2xl font-black text-purple-400 uppercase tracking-widest mb-6">PROTOCOLO CEREBRO</h2>
                 <p className="text-sm text-slate-300 mb-8">Seleccione el objetivo del rastreo:</p>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); activateCerebro('member'); }}
                        className="py-6 bg-purple-900/50 hover:bg-purple-600 border border-purple-500 text-white font-black uppercase tracking-widest rounded transition-all active:scale-95 flex flex-col items-center gap-2"
                    >
                        <User size={32}/> OPERATIVO
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); activateCerebro('team'); }}
                        className="py-6 bg-cyan-900/50 hover:bg-cyan-600 border border-cyan-500 text-white font-black uppercase tracking-widest rounded transition-all active:scale-95 flex flex-col items-center gap-2"
                    >
                        <Users size={32}/> ESCUADRÓN
                    </button>
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setCerebro({...cerebro, active:false}); }}
                    className="mt-6 text-slate-500 text-xs hover:text-white underline"
                >
                    CANCELAR RASTREO
                </button>
               </>
            ) : (
               // IF MODE SELECTED (SEARCHING OR RESULT)
               <>
                 <div className={`mb-6 ${cerebro.searching ? 'animate-spin' : ''}`}>
                    {cerebro.type === 'team' ? <Users size={64} className="mx-auto text-cyan-400"/> : <Brain size={64} className="mx-auto text-purple-500"/>}
                 </div>
                 <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">
                    {cerebro.searching ? "RASTREANDO..." : (cerebro.type === 'team' ? "ESCUADRÓN LOCALIZADO" : "SUJETO LOCALIZADO")}
                 </h2>
                 
                 <div className="text-3xl md:text-5xl font-mono font-black text-white mb-8 min-h-[4rem] flex items-center justify-center p-4 bg-black/40 rounded border border-white/10">
                    {cerebro.target || <span className="animate-pulse text-slate-500">...</span>}
                 </div>
                
                 {!cerebro.searching && (
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); activateCerebro(cerebro.type); }}
                            className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16}/> RE-ESCANEAR
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setCerebro({...cerebro, active:false}); }}
                            className="py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest rounded transition-all active:scale-95"
                        >
                            CERRAR
                        </button>
                    </div>
                 )}
               </>
            )}

          </div>
        </div>
      )}

      <style>{`
        .animate-confetti { animation: confetti 1s ease-out forwards; }
        @keyframes confetti { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) rotate(var(--r)); opacity: 0; } }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
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
