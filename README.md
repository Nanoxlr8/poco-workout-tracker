<div align="center">

<img src="icons/icon-192.png" alt="Poco Workout icon" width="96" height="96">

# Poco Workout Tracker

**An Arabic-first, offline-ready workout tracker for clean 10-rep strength training.**

**متتبع تمارين عربي أولاً لبناء القوة البدنية بتكرارات نظيفة ومتقنة.**

![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/server-Python%203-3776AB?logo=python&logoColor=white)
![RTL](https://img.shields.io/badge/UI-Arabic%20%2F%20RTL-00BFA5)
![Offline](https://img.shields.io/badge/data-local%20only-00C853)

</div>

## Screenshots

| Today's workout | Progress chart |
|:---:|:---:|
| <img src="docs/images/desktop-today.png" alt="Today view" width="100%"> | <img src="docs/images/desktop-progress.png" alt="Progress view" width="100%"> |
| Weekly rhythm, day selector, session goal and warm-up | Streak, totals and per-exercise rep curve toward the 10-rep target |
| **Workout history** | **Weekly plan** |
| <img src="docs/images/desktop-history.png" alt="History view" width="100%"> | <img src="docs/images/desktop-plan.png" alt="Plan view" width="100%"> |
| Every completed session with sets, reps and load | Editable 7-day split of hard, recovery and rest days |

<div align="center">

| Mobile: today | Mobile: logging sets | Mobile: progress |
|:---:|:---:|:---:|
| <img src="docs/images/mobile-today.png" alt="Mobile today" width="240"> | <img src="docs/images/mobile-sets.png" alt="Mobile set logging" width="240"> | <img src="docs/images/mobile-progress.png" alt="Mobile progress" width="240"> |

<sub>Screenshots use generated demo data.</sub>

</div>

## Features

| | Feature | |
|:---:|---|---|
| 🏋️ | **Set logging** | Load, reps stepper, RIR and one-tap completion per set |
| ⏱️ | **Rest & warm-up timers** | Auto rest countdown with ±15s/+30s and timed warm-up drills |
| 🔄 | **Weekly rhythm** | Hard / recovery / light / rest days laid out at a glance |
| 📈 | **Progressive overload** | Streak, total reps and per-exercise progression chart |
| 🕒 | **History** | Previous-session hints shown next to each exercise |
| ✏️ | **Plan editor** | Add, edit or reset exercises for any day |
| 💾 | **Local auto-save** | Saves to `workout_progress.json` plus a Markdown log; JSON export/import |
| 📱 | **Installable PWA** | Works on your phone over local Wi-Fi, with offline caching |

## Run

Run `start_app.bat`, then open the local URL it prints. The application stores progress in `workout_progress.json`; this personal history is deliberately excluded from version control.

## Files

- `index.html`, `app.js`, and `styles.css` provide the application interface.
- `serve.py` starts the local server.
- `manifest.json` and `sw.js` support the installable web application.
