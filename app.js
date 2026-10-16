/**
 * Poco F5 Workout Tracker & Calisthenics Progression App
 * Tailored for Poco F5 (AMOLED 120Hz, Android PWA)
 * Complete Program based on workout_plan_ai_handoff.md
 */

// --- Audio & Haptic Feedback ---
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 600, duration = 0.1, type = 'sine') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  playRestCompleteChime() {
    if (!this.enabled) return;
    this.init();
    this.playBeep(587.33, 0.15, 'triangle'); // D5
    setTimeout(() => this.playBeep(880.00, 0.35, 'triangle'), 160); // A5
  }

  playSetCompleteBeep() {
    this.playBeep(784, 0.08, 'sine');
  }
}

const sound = new SoundController();

function triggerHaptic(pattern = [40]) {
  if (window.navigator && window.navigator.vibrate) {
    const vibEnabled = document.getElementById('setting-vibration-enabled')?.checked ?? true;
    if (vibEnabled) {
      window.navigator.vibrate(pattern);
    }
  }
}

// --- Default Data Structure ---
const DEFAULT_PLAN = {
  monday: {
    id: 'monday',
    nameAr: 'الاثنين',
    nameEn: 'Monday',
    sessionType: 'Workout A',
    goalAr: 'قوة الجزء العلوي',
    goalEn: 'Upper-body strength',
    rhythm: 'hard',
    warmup: [
      { id: 'w1', nameAr: 'دوران الكتفين', nameEn: 'Arm Circles', target: '10–15 reps each direction', timerSec: 0 },
      { id: 'w2', nameAr: 'تحريك لوح الكتف', nameEn: 'Scapular Push-ups', target: '2 × 8–10 reps', timerSec: 0 },
      { id: 'w3', nameAr: 'التعلق من العقلة', nameEn: 'Dead Hang', target: '2 × 15–30 sec', timerSec: 30 },
      { id: 'w4', nameAr: 'كارديو خفيف (اختياري)', nameEn: 'Light Cardio', target: '2–3 min', timerSec: 150 }
    ],
    exercises: [
      { id: 'e1', nameAr: 'العقلة – قبضة علوية', nameEn: 'Pull-ups', sets: 3, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: 'قبضة علوية واسعة، سحب نظيف حتى الصدر' },
      { id: 'e2', nameAr: 'تمرين الضغط', nameEn: 'Push-ups', sets: 3, targetReps: 10, restSec: 105, load: 'وزن الجسم', notes: 'استقامة كاملة للجذع ونزول كامل' },
      { id: 'e3', nameAr: 'المتوازي / غطس المتوازي', nameEn: 'Dips', sets: 3, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: 'نزول لزاوية 90 درجة مع دفع قوي' },
      { id: 'e4', nameAr: 'العقلة – قبضة سفلية', nameEn: 'Chin-ups', sets: 2, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: 'تركيز على البايسبس والظهر' },
      { id: 'e5', nameAr: 'حمل الأوزان أثناء المشي', nameEn: "Farmer's Carry", sets: 3, targetReps: 45, isTimed: true, restSec: 90, load: 'أوزان ثقيلة', notes: '30–60 ثانية مشي بكتفين مشدودين' }
    ]
  },
  tuesday: {
    id: 'tuesday',
    nameAr: 'الثلاثاء',
    nameEn: 'Tuesday',
    sessionType: 'Recovery',
    goalAr: 'استشفاء وكارديو خفيف',
    goalEn: 'Recovery & light cardio',
    rhythm: 'recovery',
    warmup: [],
    exercises: [
      { id: 'e6', nameAr: 'المشي الخفيف', nameEn: 'Walking', sets: 1, targetReps: 25, isTimed: true, restSec: 0, load: 'سرعة معتدلة', notes: '20–30 دقيقة مشي مريح، شدة 3-4/10' },
      { id: 'e7', nameAr: 'دوران الكتفين', nameEn: 'Arm Circles', sets: 2, targetReps: 15, restSec: 45, load: 'وزن الجسم', notes: '2 × 15 تكرار في الاتجاهين' },
      { id: 'e8', nameAr: 'تحريك لوح الكتف', nameEn: 'Scapular Push-ups', sets: 2, targetReps: 10, restSec: 60, load: 'وزن الجسم', notes: '2 × 10 تكرارات لمرونة الكتف' },
      { id: 'e9', nameAr: 'إطالات خفيفة ومرونة', nameEn: 'Light Mobility', sets: 1, targetReps: 10, isTimed: true, restSec: 0, load: 'استرخاء', notes: '5–10 دقائق إطالات لطيفة' }
    ]
  },
  wednesday: {
    id: 'wednesday',
    nameAr: 'الأربعاء',
    nameEn: 'Wednesday',
    sessionType: 'Workout B',
    goalAr: 'قوة الجزء العلوي',
    goalEn: 'Upper-body strength',
    rhythm: 'hard',
    warmup: [
      { id: 'w1', nameAr: 'دوران الكتفين', nameEn: 'Arm Circles', target: '10–15 reps each direction', timerSec: 0 },
      { id: 'w2', nameAr: 'تحريك لوح الكتف', nameEn: 'Scapular Push-ups', target: '2 × 8–10 reps', timerSec: 0 },
      { id: 'w3', nameAr: 'التعلق من العقلة', nameEn: 'Dead Hang', target: '2 × 15–30 sec', timerSec: 30 },
      { id: 'w4', nameAr: 'كارديو خفيف (اختياري)', nameEn: 'Light Cardio', target: '2–3 min', timerSec: 150 }
    ],
    exercises: [
      { id: 'e10', nameAr: 'تمرين الضغط', nameEn: 'Push-ups', sets: 3, targetReps: 10, restSec: 105, load: 'وزن الجسم', notes: 'البدء بتمرين الضغط بكامل القوة' },
      { id: 'e11', nameAr: 'العقلة – قبضة سفلية', nameEn: 'Chin-ups', sets: 3, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: '3 جولات × 10 تكرارات' },
      { id: 'e12', nameAr: 'المتوازي / غطس المتوازي', nameEn: 'Dips', sets: 3, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: '3 جولات × 10 تكرارات نظيفة' },
      { id: 'e13', nameAr: 'العقلة – قبضة علوية', nameEn: 'Pull-ups', sets: 2, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: '2 جولات × 10 تكرارات' },
      { id: 'e14', nameAr: 'حمل الأوزان أثناء المشي', nameEn: "Farmer's Carry", sets: 3, targetReps: 45, isTimed: true, restSec: 90, load: 'أوزان ثقيلة', notes: '30–60 ثانية مشي' }
    ]
  },
  thursday: {
    id: 'thursday',
    nameAr: 'الخميس',
    nameEn: 'Thursday',
    sessionType: 'Recovery',
    goalAr: 'استشفاء ومرونة',
    goalEn: 'Recovery & mobility',
    rhythm: 'recovery',
    warmup: [],
    exercises: [
      { id: 'e15', nameAr: 'المشي الخفيف', nameEn: 'Walking', sets: 1, targetReps: 25, isTimed: true, restSec: 0, load: 'سرعة مريحة', notes: '20–30 دقيقة مشي لتنشيط الدورة الدموية' },
      { id: 'e16', nameAr: 'إطالات لطيفة ومرونة', nameEn: 'Gentle Stretching', sets: 1, targetReps: 10, isTimed: true, restSec: 0, load: 'استرخاء', notes: '5–10 دقائق إطالات بدون أي ضغط أو عقلة شاقة' }
    ]
  },
  friday: {
    id: 'friday',
    nameAr: 'الجمعة',
    nameEn: 'Friday',
    sessionType: 'Workout A',
    goalAr: 'قوة الجزء العلوي',
    goalEn: 'Upper-body strength',
    rhythm: 'hard',
    warmup: [
      { id: 'w1', nameAr: 'دوران الكتفين', nameEn: 'Arm Circles', target: '10–15 reps each direction', timerSec: 0 },
      { id: 'w2', nameAr: 'تحريك لوح الكتف', nameEn: 'Scapular Push-ups', target: '2 × 8–10 reps', timerSec: 0 },
      { id: 'w3', nameAr: 'التعلق من العقلة', nameEn: 'Dead Hang', target: '2 × 15–30 sec', timerSec: 30 },
      { id: 'w4', nameAr: 'كارديو خفيف (اختياري)', nameEn: 'Light Cardio', target: '2–3 min', timerSec: 150 }
    ],
    exercises: [
      { id: 'e17', nameAr: 'العقلة – قبضة علوية', nameEn: 'Pull-ups', sets: 3, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: 'الجلسة الثالثة للأسبوع، ثبات في الأداء' },
      { id: 'e18', nameAr: 'تمرين الضغط', nameEn: 'Push-ups', sets: 3, targetReps: 10, restSec: 105, load: 'وزن الجسم', notes: 'التحكم بالنزول (Eccentric tempo)' },
      { id: 'e19', nameAr: 'المتوازي / غطس المتوازي', nameEn: 'Dips', sets: 3, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: 'حماية الكتف و1-2 تكرار بالاحتياط' },
      { id: 'e20', nameAr: 'العقلة – قبضة سفلية', nameEn: 'Chin-ups', sets: 2, targetReps: 10, restSec: 150, load: 'وزن الجسم', notes: '2 جولات × 10' },
      { id: 'e21', nameAr: 'حمل الأوزان أثناء المشي', nameEn: "Farmer's Carry", sets: 3, targetReps: 45, isTimed: true, restSec: 90, load: 'أوزان ثقيلة', notes: '3 × 30-60 ثانية' }
    ]
  },
  saturday: {
    id: 'saturday',
    nameAr: 'السبت',
    nameEn: 'Saturday',
    sessionType: 'Light Full-Body',
    goalAr: 'نشاط خفيف وتقوية الجزء السفلي',
    goalEn: 'Active recovery + lower body',
    rhythm: 'light',
    warmup: [],
    exercises: [
      { id: 'e22', nameAr: 'المشي أو ركوب الدراجة', nameEn: 'Walking or Cycling', sets: 1, targetReps: 30, isTimed: true, restSec: 0, load: 'وتيرة خفيفة', notes: '20–40 دقيقة لتنشيط الجسم' },
      { id: 'e23', nameAr: 'القرفصاء', nameEn: 'Squats', sets: 3, targetReps: 10, restSec: 90, load: 'وزن الجسم', notes: '3 × 10 تكرارات متقنة للأرجل' },
      { id: 'e24', nameAr: 'الطعنات', nameEn: 'Lunges', sets: 2, targetReps: 10, restSec: 90, load: 'وزن الجسم', notes: '2 × 10 لكل رجل بالتناوب' },
      { id: 'e25', nameAr: 'رفع السمانة', nameEn: 'Calf Raises', sets: 3, targetReps: 10, restSec: 60, load: 'وزن الجسم', notes: 'ثبات ثانية في القمة' },
      { id: 'e26', nameAr: 'تمارين عضلات البطن والوسط', nameEn: 'Light Core', sets: 3, targetReps: 12, restSec: 60, load: 'وزن الجسم', notes: 'بلانك أو رفع أرجل خفيف' }
    ]
  },
  sunday: {
    id: 'sunday',
    nameAr: 'الأحد',
    nameEn: 'Sunday',
    sessionType: 'Complete Rest',
    goalAr: 'راحة تامة واسترخاء',
    goalEn: 'Complete recovery',
    rhythm: 'rest',
    warmup: [],
    exercises: [
      { id: 'e27', nameAr: 'راحة سلبية تامة', nameEn: 'Passive Rest', sets: 1, targetReps: 0, restSec: 0, load: 'استرخاء', notes: 'لا يوجد تمرين منظم اليوم. حركة يومية عادية ونوم عميق' }
    ]
  }
};

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// --- State Manager ---
class AppState {
  constructor() {
    this.plan = this.loadPlan();
    this.history = this.loadHistory();
    this.activeDayKey = this.getTodayKey();
    this.currentSessionLogs = this.loadSessionLogs(this.activeDayKey);
    this.warmupChecked = {};
  }

  loadPlan() {
    try {
      const saved = localStorage.getItem('poco_workout_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse plan from storage', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PLAN));
  }

  savePlan(newPlan) {
    this.plan = newPlan;
    localStorage.setItem('poco_workout_plan', JSON.stringify(newPlan));
  }

  resetPlanToDefault() {
    this.plan = JSON.parse(JSON.stringify(DEFAULT_PLAN));
    localStorage.setItem('poco_workout_plan', JSON.stringify(this.plan));
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('poco_workout_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }

  saveHistory(newHistory) {
    this.history = newHistory;
    localStorage.setItem('poco_workout_history', JSON.stringify(newHistory));
    this.syncWithServer();
  }

  getTodayKey() {
    const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const map = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    return map[dayIndex] || 'monday';
  }

  loadSessionLogs(dayKey) {
    try {
      const key = `poco_session_${dayKey}_${new Date().toISOString().slice(0, 10)}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }

  saveCurrentSessionLog() {
    const key = `poco_session_${this.activeDayKey}_${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(key, JSON.stringify(this.currentSessionLogs));
    this.syncWithServer();
  }

  async syncWithServer() {
    try {
      const payload = {
        plan: this.plan,
        history: this.history,
        currentSession: this.currentSessionLogs,
        activeDay: this.activeDayKey,
        lastUpdated: new Date().toISOString()
      };
      const res = await fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const badge = document.getElementById('sync-status-badge');
        if (badge) {
          badge.textContent = '☁️ محفوظ في Downloads';
          badge.style.color = '#00E676';
        }
      }
    } catch (e) {
      // Running offline or outside local network
      const badge = document.getElementById('sync-status-badge');
      if (badge) {
        badge.textContent = '📱 محفوظ على الهاتف (Offline)';
        badge.style.color = '#94A3B8';
      }
    }
  }
}

const state = new AppState();

// --- Rest Timer Class ---
class RestTimer {
  constructor() {
    this.intervalId = null;
    this.remainingSec = 0;
    this.totalSec = 0;
    this.exerciseName = '';
    this.barEl = document.getElementById('rest-timer-bar');
    this.displayEl = document.getElementById('rest-timer-display');
    this.titleEl = document.getElementById('rest-exercise-name');
  }

  start(seconds, exName = 'راحة بين الجولات') {
    this.stop();
    this.totalSec = seconds;
    this.remainingSec = seconds;
    this.exerciseName = exName;

    this.titleEl.textContent = `راحة: ${exName}`;
    this.updateDisplay();
    this.barEl.classList.remove('hidden');

    this.intervalId = setInterval(() => {
      this.remainingSec--;
      this.updateDisplay();

      if (this.remainingSec <= 0) {
        this.finish();
      }
    }, 1000);
  }

  updateDisplay() {
    const mins = Math.floor(Math.max(0, this.remainingSec) / 60);
    const secs = Math.max(0, this.remainingSec) % 60;
    this.displayEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  addSeconds(sec) {
    this.remainingSec = Math.max(5, this.remainingSec + sec);
    this.updateDisplay();
  }

  finish() {
    this.stop();
    this.barEl.classList.add('hidden');
    sound.playRestCompleteChime();
    triggerHaptic([150, 70, 150, 70, 250]);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  skip() {
    this.stop();
    this.barEl.classList.add('hidden');
  }
}

const restTimer = new RestTimer();

// --- Warmup Modal Timer ---
let warmupTimerInterval = null;
let warmupRemaining = 30;
let warmupTotal = 30;

function openWarmupTimer(item) {
  const modal = document.getElementById('warmup-timer-modal');
  document.getElementById('warmup-modal-title').textContent = `${item.nameAr} (${item.nameEn})`;
  document.getElementById('warmup-modal-desc').textContent = item.target;
  warmupTotal = item.timerSec || 30;
  warmupRemaining = warmupTotal;
  document.getElementById('warmup-modal-timer-num').textContent = warmupRemaining;
  document.getElementById('btn-warmup-start').textContent = '▶ ابدأ العداد';
  
  if (warmupTimerInterval) {
    clearInterval(warmupTimerInterval);
    warmupTimerInterval = null;
  }
  modal.classList.add('open');
}

function toggleWarmupTimer() {
  const btn = document.getElementById('btn-warmup-start');
  if (warmupTimerInterval) {
    clearInterval(warmupTimerInterval);
    warmupTimerInterval = null;
    btn.textContent = '▶ استئناف';
  } else {
    sound.init();
    btn.textContent = '⏸ إيقاف مؤقت';
    warmupTimerInterval = setInterval(() => {
      warmupRemaining--;
      document.getElementById('warmup-modal-timer-num').textContent = warmupRemaining;
      if (warmupRemaining <= 0) {
        clearInterval(warmupTimerInterval);
        warmupTimerInterval = null;
        btn.textContent = '✔ اكتمل!';
        sound.playRestCompleteChime();
        triggerHaptic([120, 60, 200]);
      }
    }, 1000);
  }
}

function resetWarmupTimer() {
  if (warmupTimerInterval) {
    clearInterval(warmupTimerInterval);
    warmupTimerInterval = null;
  }
  warmupRemaining = warmupTotal;
  document.getElementById('warmup-modal-timer-num').textContent = warmupRemaining;
  document.getElementById('btn-warmup-start').textContent = '▶ ابدأ العداد';
}

// --- UI Rendering Functions ---

function renderRhythmChain() {
  const container = document.getElementById('rhythm-chain-container');
  if (!container) return;
  container.innerHTML = '';

  const shortNames = {
    monday: 'الاثنين (A)',
    tuesday: 'الثلاثاء (استشفاء)',
    wednesday: 'الأربعاء (B)',
    thursday: 'الخميس (استشفاء)',
    friday: 'الجمعة (A)',
    saturday: 'السبت (أرجل)',
    sunday: 'الأحد (راحة)'
  };

  DAY_KEYS.forEach((key) => {
    const day = state.plan[key];
    const node = document.createElement('div');
    node.className = `rhythm-node ${day.rhythm} ${key === state.activeDayKey ? 'active-day' : ''}`;
    node.textContent = shortNames[key];
    node.addEventListener('click', () => {
      switchDay(key);
    });
    container.appendChild(node);
  });
}

function renderDaySelector() {
  const container = document.getElementById('day-selector-carousel');
  if (!container) return;
  container.innerHTML = '';

  DAY_KEYS.forEach((key) => {
    const day = state.plan[key];
    const chip = document.createElement('div');
    chip.className = `day-chip ${key === state.activeDayKey ? 'active' : ''}`;
    
    chip.innerHTML = `
      <span class="day-chip-name">${day.nameAr}</span>
      <span class="day-chip-tag">${day.sessionType}</span>
    `;

    chip.addEventListener('click', () => {
      switchDay(key);
    });
    container.appendChild(chip);
  });
}

function renderHeroCard() {
  const day = state.plan[state.activeDayKey];
  document.getElementById('hero-session-tag').textContent = day.sessionType;
  document.getElementById('hero-title').textContent = `${day.goalAr} (${day.nameAr})`;
  document.getElementById('hero-subtitle').textContent = `الهدف: ${day.goalEn} • إيقاع: ${day.rhythm.toUpperCase()}`;
  
  const totalSets = day.exercises.reduce((sum, e) => sum + (e.sets || 0), 0);
  document.getElementById('hero-stat-exercises').textContent = day.exercises.length;
  document.getElementById('hero-stat-sets').textContent = totalSets;
  document.getElementById('hero-stat-target').textContent = '10 Reps';
}

function renderWarmupSection() {
  const day = state.plan[state.activeDayKey];
  const list = document.getElementById('warmup-list-container');
  const section = document.getElementById('warmup-accordion');
  if (!day.warmup || day.warmup.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  list.innerHTML = '';

  day.warmup.forEach((item) => {
    const isDone = state.warmupChecked[item.id] || false;
    const row = document.createElement('div');
    row.className = 'warmup-item';
    
    const hasTimer = item.timerSec && item.timerSec > 0;

    row.innerHTML = `
      <div class="warmup-item-left">
        <div class="warmup-checkbox ${isDone ? 'checked' : ''}" data-id="${item.id}">
          ${isDone ? '✓' : ''}
        </div>
        <div>
          <div class="warmup-text-ar">${item.nameAr}</div>
          <div class="warmup-text-en">${item.nameEn} • ${item.target}</div>
        </div>
      </div>
      ${hasTimer ? `<button class="warmup-timer-btn" data-timer-id="${item.id}">⏱ ${item.timerSec}s</button>` : ''}
    `;

    row.querySelector('.warmup-checkbox').addEventListener('click', (e) => {
      state.warmupChecked[item.id] = !state.warmupChecked[item.id];
      sound.playSetCompleteBeep();
      triggerHaptic([30]);
      renderWarmupSection();
    });

    if (hasTimer) {
      row.querySelector('.warmup-timer-btn').addEventListener('click', () => {
        openWarmupTimer(item);
      });
    }

    list.appendChild(row);
  });
}

function getLastHistorySet(exerciseNameAr) {
  for (let i = state.history.length - 1; i >= 0; i--) {
    const session = state.history[i];
    if (session.exercises && session.exercises[exerciseNameAr]) {
      const logs = session.exercises[exerciseNameAr];
      if (logs.length > 0) {
        return logs.map(s => `${s.reps}r`).join(', ');
      }
    }
  }
  return null;
}

function renderExercises() {
  const container = document.getElementById('exercises-list-container');
  const day = state.plan[state.activeDayKey];
  container.innerHTML = '';

  day.exercises.forEach((ex, exIndex) => {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.id = `card-exercise-${ex.id}`;

    const prevHistoryStr = getLastHistorySet(ex.nameAr);

    // Header
    const header = document.createElement('div');
    header.className = 'exercise-header';
    header.innerHTML = `
      <div style="display: flex; align-items: flex-start; flex: 1;">
        <div class="exercise-number">${exIndex + 1}</div>
        <div class="exercise-title-group">
          <div class="exercise-ar-title">${ex.nameAr}</div>
          <div class="exercise-en-title">(${ex.nameEn})</div>
        </div>
      </div>
      <div class="exercise-target-badge">
        ${ex.sets} × ${ex.targetReps}${ex.isTimed ? 's' : ''} | ⏱ ${ex.restSec}s
      </div>
    `;
    card.appendChild(header);

    if (prevHistoryStr) {
      const prevEl = document.createElement('div');
      prevEl.className = 'prev-reference-text';
      prevEl.textContent = `📋 الجلسة السابقة: ${prevHistoryStr}`;
      card.appendChild(prevEl);
    }

    // Sets List
    const setsList = document.createElement('div');
    setsList.className = 'sets-list';
    setsList.style.marginTop = '10px';

    if (!state.currentSessionLogs[ex.id]) {
      state.currentSessionLogs[ex.id] = [];
    }

    for (let s = 1; s <= ex.sets; s++) {
      let setLog = state.currentSessionLogs[ex.id][s - 1];
      if (!setLog) {
        setLog = {
          setNum: s,
          load: ex.load || 'وزن الجسم',
          reps: ex.targetReps || 10,
          rir: '1-2',
          done: false
        };
        state.currentSessionLogs[ex.id][s - 1] = setLog;
      }

      const row = document.createElement('div');
      row.className = `set-row ${setLog.done ? 'done' : ''}`;
      row.innerHTML = `
        <div class="set-number">${s}</div>
        <div class="set-load-input-container">
          <input type="text" class="set-load-input" value="${setLog.load}" placeholder="الوزن / النوع">
        </div>
        <div class="set-reps-stepper">
          <button class="stepper-btn btn-minus">-</button>
          <input type="number" class="stepper-val" value="${setLog.reps}" min="0" max="99">
          <button class="stepper-btn btn-plus">+</button>
        </div>
        <select class="set-rir-select" title="Reps In Reserve">
          <option value="0" ${setLog.rir === '0' ? 'selected' : ''}>0 RIR</option>
          <option value="1-2" ${setLog.rir === '1-2' ? 'selected' : ''}>1-2 RIR</option>
          <option value="3+" ${setLog.rir === '3+' ? 'selected' : ''}>3+ RIR</option>
        </select>
        <button class="set-check-btn" title="إتمام الجولة">
          ${setLog.done ? '✓' : '○'}
        </button>
      `;

      // Event listeners for Set Row
      const loadInput = row.querySelector('.set-load-input');
      const valInput = row.querySelector('.stepper-val');
      const minusBtn = row.querySelector('.btn-minus');
      const plusBtn = row.querySelector('.btn-plus');
      const rirSelect = row.querySelector('.set-rir-select');
      const checkBtn = row.querySelector('.set-check-btn');

      loadInput.addEventListener('change', (e) => {
        setLog.load = e.target.value;
        state.saveCurrentSessionLog();
      });

      minusBtn.addEventListener('click', () => {
        setLog.reps = Math.max(0, parseInt(valInput.value || 0) - 1);
        valInput.value = setLog.reps;
        triggerHaptic([20]);
        state.saveCurrentSessionLog();
      });

      plusBtn.addEventListener('click', () => {
        setLog.reps = parseInt(valInput.value || 0) + 1;
        valInput.value = setLog.reps;
        triggerHaptic([20]);
        state.saveCurrentSessionLog();
      });

      valInput.addEventListener('change', (e) => {
        setLog.reps = Math.max(0, parseInt(e.target.value) || 0);
        state.saveCurrentSessionLog();
      });

      rirSelect.addEventListener('change', (e) => {
        setLog.rir = e.target.value;
        state.saveCurrentSessionLog();
      });

      checkBtn.addEventListener('click', () => {
        sound.init();
        setLog.done = !setLog.done;
        row.classList.toggle('done', setLog.done);
        checkBtn.textContent = setLog.done ? '✓' : '○';

        state.saveCurrentSessionLog();

        if (setLog.done) {
          sound.playSetCompleteBeep();
          triggerHaptic([40, 30, 40]);
          if (ex.restSec && ex.restSec > 0) {
            restTimer.start(ex.restSec, ex.nameAr);
          }
        }
      });

      setsList.appendChild(row);
    }

    card.appendChild(setsList);
    container.appendChild(card);
  });
}

function switchDay(key) {
  state.activeDayKey = key;
  state.currentSessionLogs = state.loadSessionLogs(key);
  renderRhythmChain();
  renderDaySelector();
  renderHeroCard();
  renderWarmupSection();
  renderExercises();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- History & Stats Rendering ---

function renderHistory() {
  const container = document.getElementById('history-list-container');
  if (!container) return;
  container.innerHTML = '';

  if (state.history.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
        <div style="font-size: 40px; margin-bottom: 8px;">🏋️‍♂️</div>
        <div style="font-size: 15px; font-weight: 700; color: #FFFFFF;">لا يوجد تمارين مسجلة بعد</div>
        <div style="font-size: 12px; margin-top: 4px;">أكمل أول جلسة تدريبية واضغط على "إنهاء وتسجيل التمرين"</div>
      </div>
    `;
    return;
  }

  // Render recent first
  const sorted = [...state.history].reverse();
  sorted.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    const exCount = Object.keys(item.exercises || {}).length;

    let exDetailsHtml = '';
    for (const [name, sets] of Object.entries(item.exercises || {})) {
      const summary = sets.map(s => `${s.reps}r (${s.load})`).join(' | ');
      exDetailsHtml += `<div style="font-size: 11px; margin-top: 2px;"><strong style="color:#FFF;">${name}:</strong> ${summary}</div>`;
    }

    card.innerHTML = `
      <div class="history-card-header">
        <div>
          <div class="history-session">${item.dayName} • ${item.sessionType}</div>
          <div class="history-date">📅 ${item.dateFormatted}</div>
        </div>
        <div style="text-align: left;">
          <div class="history-summary">${item.totalReps} تكرار</div>
          <div style="font-size: 10px; color: var(--text-dim);">${item.totalSets} جولات</div>
        </div>
      </div>
      <div style="background: var(--bg-card); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
        ${exDetailsHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAnalytics() {
  const totalWorkouts = state.history.length;
  const totalReps = state.history.reduce((sum, h) => sum + (h.totalReps || 0), 0);
  
  // Calculate streak
  let streak = 0;
  if (state.history.length > 0) {
    streak = 1;
    // approximate weekly cadence
    streak = Math.min(totalWorkouts, 7);
  }

  document.getElementById('kpi-total-workouts').textContent = totalWorkouts;
  document.getElementById('kpi-total-reps').textContent = totalReps;
  document.getElementById('kpi-streak').textContent = `${streak} 🔥`;

  renderProgressChart();
}

function renderProgressChart() {
  const container = document.getElementById('progression-chart-svg-container');
  const select = document.getElementById('chart-exercise-select');
  const exKey = select.value;

  // Filter history for selected exercise
  const dataPoints = [];
  const exerciseArMap = {
    pullups: 'العقلة – قبضة علوية',
    pushups: 'تمرين الضغط',
    dips: 'المتوازي / غطس المتوازي',
    chinups: 'العقلة – قبضة سفلية',
    squats: 'القرفصاء'
  };

  const targetName = exerciseArMap[exKey] || 'العقلة – قبضة علوية';

  state.history.forEach(h => {
    if (h.exercises && h.exercises[targetName]) {
      const sets = h.exercises[targetName];
      const maxRep = Math.max(...sets.map(s => s.reps || 0));
      dataPoints.push({
        date: h.dateFormatted.slice(5),
        val: maxRep
      });
    }
  });

  if (dataPoints.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 12px;">
        لا توجد بيانات مسجلة لتمرين "${targetName}" بعد.<br>سجل تمرينك اليوم لترى منحنى التطور!
      </div>
    `;
    return;
  }

  // Draw clean SVG Line Chart
  const width = container.clientWidth || 320;
  const height = 160;
  const padding = 28;

  const maxVal = Math.max(12, ...dataPoints.map(d => d.val));
  const minVal = 0;

  const points = dataPoints.map((d, i) => {
    const x = padding + (i / Math.max(1, dataPoints.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.val - minVal) / (maxVal - minVal)) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  let dotsHtml = '';
  points.forEach(p => {
    dotsHtml += `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00F5FF" stroke="#05070E" stroke-width="2" />
      <text x="${p.x}" y="${p.y - 8}" fill="#F8FAFC" font-size="10" font-weight="bold" text-anchor="middle">${p.val}</text>
      <text x="${p.x}" y="${height - 10}" fill="#94A3B8" font-size="9" text-anchor="middle">${p.date}</text>
    `;
  });

  container.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <!-- Target 10-Rep Guide Line -->
      <line x1="${padding}" y1="${height - padding - ((10 - minVal) / (maxVal - minVal)) * (height - padding * 2)}" 
            x2="${width - padding}" y2="${height - padding - ((10 - minVal) / (maxVal - minVal)) * (height - padding * 2)}" 
            stroke="rgba(0, 230, 118, 0.4)" stroke-dasharray="4 4" stroke-width="1.5" />
      <text x="${width - padding}" y="${height - padding - ((10 - minVal) / (maxVal - minVal)) * (height - padding * 2) - 4}" 
            fill="#00E676" font-size="9" text-anchor="end">هدف 10 تكرارات</text>

      <path d="${pathD}" fill="none" stroke="#00F5FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${dotsHtml}
    </svg>
  `;
}

// --- Plan Overview & Editor ---

function renderPlanOverview() {
  const container = document.getElementById('plan-days-overview-container');
  if (!container) return;
  container.innerHTML = '';

  DAY_KEYS.forEach(key => {
    const day = state.plan[key];
    const card = document.createElement('div');
    card.className = 'workout-hero-card';
    card.style.padding = '14px';
    card.style.marginBottom = '0';

    let exercisesHtml = '';
    day.exercises.forEach((e, idx) => {
      exercisesHtml += `
        <li style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span>${idx + 1}. ${e.nameAr} (${e.nameEn})</span>
          <span style="color: var(--primary);">${e.sets} × ${e.targetReps}</span>
        </li>
      `;
    });

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div>
          <span class="hero-session-tag">${day.sessionType}</span>
          <span style="font-weight: 800; font-size: 15px; margin-right: 8px;">${day.nameAr}</span>
        </div>
        <span style="font-size: 11px; color: var(--text-muted);">${day.goalAr}</span>
      </div>
      <ul style="list-style: none; padding: 0;">
        ${exercisesHtml}
      </ul>
    `;

    container.appendChild(card);
  });
}

function openPlanEditor() {
  const modal = document.getElementById('plan-editor-modal');
  const daySelect = document.getElementById('edit-day-select');
  daySelect.value = state.activeDayKey;
  renderPlanEditorDay();
  modal.classList.add('open');
}

function renderPlanEditorDay() {
  const dayKey = document.getElementById('edit-day-select').value;
  const day = state.plan[dayKey];
  const container = document.getElementById('editable-exercises-container');
  container.innerHTML = '';

  day.exercises.forEach((ex, idx) => {
    const item = document.createElement('div');
    item.className = 'warmup-item';
    item.style.flexDirection = 'column';
    item.style.alignItems = 'stretch';
    item.style.gap = '8px';

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 800; font-size: 14px;">${idx + 1}. ${ex.nameAr}</span>
        <div style="display: flex; gap: 4px;">
          <button class="btn-secondary btn-move-up" data-idx="${idx}" style="padding: 2px 8px; width: auto;" ${idx === 0 ? 'disabled' : ''}>▲</button>
          <button class="btn-secondary btn-move-down" data-idx="${idx}" style="padding: 2px 8px; width: auto;" ${idx === day.exercises.length - 1 ? 'disabled' : ''}>▼</button>
          <button class="btn-danger btn-delete-ex" data-idx="${idx}" style="padding: 2px 8px; width: auto;">🗑</button>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
        <div>
          <label style="font-size: 10px; color: var(--text-muted);">الجولات</label>
          <input type="number" class="form-input ex-edit-sets" value="${ex.sets}" min="1" max="10" style="padding: 6px;">
        </div>
        <div>
          <label style="font-size: 10px; color: var(--text-muted);">التكرارات</label>
          <input type="number" class="form-input ex-edit-reps" value="${ex.targetReps}" min="1" max="100" style="padding: 6px;">
        </div>
        <div>
          <label style="font-size: 10px; color: var(--text-muted);">الراحة (ثانية)</label>
          <input type="number" class="form-input ex-edit-rest" value="${ex.restSec}" min="0" max="300" step="15" style="padding: 6px;">
        </div>
      </div>
    `;

    // Handlers
    item.querySelector('.btn-move-up')?.addEventListener('click', () => {
      if (idx > 0) {
        const temp = day.exercises[idx];
        day.exercises[idx] = day.exercises[idx - 1];
        day.exercises[idx - 1] = temp;
        renderPlanEditorDay();
      }
    });

    item.querySelector('.btn-move-down')?.addEventListener('click', () => {
      if (idx < day.exercises.length - 1) {
        const temp = day.exercises[idx];
        day.exercises[idx] = day.exercises[idx + 1];
        day.exercises[idx + 1] = temp;
        renderPlanEditorDay();
      }
    });

    item.querySelector('.btn-delete-ex')?.addEventListener('click', () => {
      if (confirm(`هل تريد حذف تمرين "${ex.nameAr}"؟`)) {
        day.exercises.splice(idx, 1);
        renderPlanEditorDay();
      }
    });

    item.querySelector('.ex-edit-sets').addEventListener('change', (e) => {
      ex.sets = parseInt(e.target.value) || 3;
    });
    item.querySelector('.ex-edit-reps').addEventListener('change', (e) => {
      ex.targetReps = parseInt(e.target.value) || 10;
    });
    item.querySelector('.ex-edit-rest').addEventListener('change', (e) => {
      ex.restSec = parseInt(e.target.value) || 90;
    });

    container.appendChild(item);
  });
}

function addNewExercisePrompt() {
  const dayKey = document.getElementById('edit-day-select').value;
  const day = state.plan[dayKey];

  const nameAr = prompt('أدخل اسم التمرين بالعربية (مثال: تمرين الضغط الماسي):');
  if (!nameAr) return;
  const nameEn = prompt('أدخل الاسم بالإنجليزية (مثال: Diamond Push-ups):') || '';
  const sets = parseInt(prompt('عدد الجولات:', '3')) || 3;
  const reps = parseInt(prompt('الهدف من التكرارات:', '10')) || 10;
  const rest = parseInt(prompt('وقت الراحة بالثواني:', '90')) || 90;

  day.exercises.push({
    id: `custom_${Date.now()}`,
    nameAr: nameAr.trim(),
    nameEn: nameEn.trim(),
    sets,
    targetReps: reps,
    restSec: rest,
    load: 'وزن الجسم',
    notes: 'تمرين مخصص'
  });

  renderPlanEditorDay();
}

function savePlanModifications() {
  state.savePlan(state.plan);
  document.getElementById('plan-editor-modal').classList.remove('open');
  renderPlanOverview();
  renderHeroCard();
  renderExercises();
  alert('تم حفظ تعديلات البرنامج بنجاح!');
}

// --- Complete Session Action ---
function completeActiveWorkout() {
  const day = state.plan[state.activeDayKey];
  const logs = state.currentSessionLogs;

  let totalSets = 0;
  let totalReps = 0;
  const recordedExercises = {};

  for (const ex of day.exercises) {
    if (logs[ex.id]) {
      const doneSets = logs[ex.id].filter(s => s.done);
      if (doneSets.length > 0) {
        recordedExercises[ex.nameAr] = doneSets;
        totalSets += doneSets.length;
        totalReps += doneSets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);
      }
    }
  }

  if (totalSets === 0) {
    if (!confirm('لم تقم بتعليم أي جولة كمكتملة بعد. هل ترغب في تسجيل التمرين على أي حال؟')) {
      return;
    }
  }

  const sessionEntry = {
    id: `sess_${Date.now()}`,
    date: new Date().toISOString(),
    dateFormatted: new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
    dayKey: state.activeDayKey,
    dayName: day.nameAr,
    sessionType: day.sessionType,
    totalSets,
    totalReps,
    exercises: recordedExercises
  };

  state.history.push(sessionEntry);
  state.saveHistory(state.history);

  // Show celebration modal
  document.getElementById('celeb-sets').textContent = totalSets;
  document.getElementById('celeb-reps').textContent = totalReps;
  
  // Next day recommendation
  const currentIdx = DAY_KEYS.indexOf(state.activeDayKey);
  const nextDayKey = DAY_KEYS[(currentIdx + 1) % DAY_KEYS.length];
  document.getElementById('celeb-next').textContent = state.plan[nextDayKey].sessionType;

  sound.playRestCompleteChime();
  triggerHaptic([100, 50, 100, 50, 300]);
  document.getElementById('celebration-modal').classList.add('open');
}

// --- Tab Switching ---
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId)?.classList.add('active');
      triggerHaptic([20]);

      if (targetId === 'tab-plan') {
        renderPlanOverview();
      } else if (targetId === 'tab-history') {
        renderHistory();
      } else if (targetId === 'tab-progress') {
        renderAnalytics();
      }
    });
  });
}

// --- Data Export & Import ---
function exportDataJSON() {
  const data = {
    plan: state.plan,
    history: state.history,
    exportDate: new Date().toISOString(),
    app: 'Poco Workout Tracker'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `poco_workout_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.plan) {
        state.savePlan(data.plan);
      }
      if (data.history) {
        state.saveHistory(data.history);
      }
      alert('تم استيراد البيانات بنجاح!');
      window.location.reload();
    } catch (err) {
      alert('خطأ: الملف غير صالح.');
    }
  };
  reader.readAsText(file);
}

// --- Event Listeners Init ---
function initEvents() {
  setupTabs();

  // Audio Toggle
  const soundToggle = document.getElementById('btn-sound-toggle');
  soundToggle.addEventListener('click', () => {
    sound.enabled = !sound.enabled;
    soundToggle.textContent = sound.enabled ? '🔔' : '🔕';
    triggerHaptic([20]);
  });

  // Today shortcut
  document.getElementById('btn-today-shortcut').addEventListener('click', () => {
    switchDay(state.getTodayKey());
    triggerHaptic([30]);
  });

  // Rest Timer Controls
  document.getElementById('timer-minus-15').addEventListener('click', () => restTimer.addSeconds(-15));
  document.getElementById('timer-plus-30').addEventListener('click', () => restTimer.addSeconds(30));
  document.getElementById('timer-skip-btn').addEventListener('click', () => restTimer.skip());

  // Warmup Accordion Toggle
  const warmupToggle = document.getElementById('warmup-accordion-toggle');
  const warmupContent = document.getElementById('warmup-list-container');
  const warmupIcon = document.getElementById('warmup-accordion-icon');
  warmupToggle.addEventListener('click', () => {
    const isHidden = warmupContent.style.display === 'none';
    warmupContent.style.display = isHidden ? 'flex' : 'none';
    warmupIcon.textContent = isHidden ? '▼' : '◀';
  });

  // Warmup modal buttons
  document.getElementById('btn-warmup-start').addEventListener('click', toggleWarmupTimer);
  document.getElementById('btn-warmup-reset').addEventListener('click', resetWarmupTimer);
  document.getElementById('btn-warmup-close').addEventListener('click', () => {
    if (warmupTimerInterval) {
      clearInterval(warmupTimerInterval);
      warmupTimerInterval = null;
    }
    document.getElementById('warmup-timer-modal').classList.remove('open');
  });

  // Plan Editor
  document.getElementById('btn-open-plan-editor').addEventListener('click', openPlanEditor);
  document.getElementById('edit-day-select').addEventListener('change', renderPlanEditorDay);
  document.getElementById('btn-add-exercise-to-day').addEventListener('click', addNewExercisePrompt);
  document.getElementById('btn-save-plan-changes').addEventListener('click', savePlanModifications);
  document.getElementById('btn-close-plan-editor').addEventListener('click', () => {
    document.getElementById('plan-editor-modal').classList.remove('open');
  });

  // Reset Plan
  document.getElementById('btn-reset-default-plan').addEventListener('click', () => {
    if (confirm('هل أنت متأكد من استعادة خطة التمارين الأصلية المنصوص عليها في وثيقة AI Handoff؟')) {
      state.resetPlanToDefault();
      renderPlanOverview();
      renderHeroCard();
      renderExercises();
      alert('تمت استعادة الخطة الأصلية بنجاح!');
    }
  });

  // Complete Workout
  document.getElementById('btn-complete-workout').addEventListener('click', completeActiveWorkout);
  document.getElementById('btn-close-celebration').addEventListener('click', () => {
    document.getElementById('celebration-modal').classList.remove('open');
  });

  // Chart Exercise Selector
  document.getElementById('chart-exercise-select').addEventListener('change', renderProgressChart);

  // Clear History
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    if (confirm('هل تريد مسح سجل التمارين بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      state.saveHistory([]);
      renderHistory();
      renderAnalytics();
    }
  });

  // Backup & Restore
  document.getElementById('btn-export-json').addEventListener('click', exportDataJSON);
  const importTrigger = document.getElementById('btn-import-json-trigger');
  const importInput = document.getElementById('file-import-input');
  importTrigger.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importDataJSON(e.target.files[0]);
    }
  });

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  }
}

// --- App Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  renderRhythmChain();
  renderDaySelector();
  renderHeroCard();
  renderWarmupSection();
  renderExercises();
  state.syncWithServer();
});
