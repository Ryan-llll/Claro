# Claro  — Inclusive Multilingual Study Platform

> **Built for the neoCedrus Hackathon (neoHack) at Al Akhawayn University (AUI)**  
> **Theme:** "Tech for Inclusivity"  
> **Cost:** $0 Total (Google Gemini API Free Tier + Local PostgreSQL & Prisma + Browser-Native Web Speech API)

---

## 🌟 The 3 Accessible Study Modes

1. **French & Darija Bridge (ESL / Multilingual Freshmen):**
   - Plain-English big picture summary of dense lecture slides.
   - Interactive vocabulary glossary showing **Simple English**, **French** (for French-Bac & Prépas graduates), and **Moroccan Darija** (natural intuitive explanations in Latin script with Arabic numeral phonetics like 7, 3, 9).
   - One-click pronunciation audio and copy tools.

2. **Bite-Sized Flashcards (ADHD Focus):**
   - Shows **one bite-sized card at a time** (maximum 3 concise bullet points) to prevent cognitive overload.
   - Real-time progress bar with visual dots and time estimates (~2-3 mins focus).
   - Hidden **"Reveal Answer" active-recall challenge** with keyboard shortcut (`Space` to reveal, `← / →` to navigate).
   - Confetti celebration upon card completion.

3. **Dyslexia & Audio Mode (Dyslexic & Auditory Learners):**
   - High-comfort **warm cream reading background** (`#FDFBF7`) designed to eliminate glare and visual stress.
   - Lexend / Dyslexia-optimized typography with wide letter tracking (`tracking-wide`) and line spacing.
   - Interactive **Reading Ruler** that tracks the cursor to prevent line jumping.
   - `A-` and `A+` font size adjusters.
   - **Browser-native speech player (`window.speechSynthesis`)**: Play, Pause, Resume, Stop, and speed selection (`0.85x`, `1.0x`, `1.25x`, `1.5x`) with zero external API latency or cost.

---

## ⚡ Instant PostgreSQL & SHA-256 Caching

When a student or judge uploads a lecture (`.pdf`, `.docx`, or `.pptx`):
1. The backend hashes the file buffer using **SHA-256**.
2. If already in PostgreSQL, it returns the structured digest in **under 20ms** (`cached: true`).
3. If not found, **officeparser** extracts the slide content, calls **Gemini 2.5 Flash**, and saves the result to PostgreSQL.
4. **Offline Stage-Safety:** If offline or if no Gemini key is provided, a realistic fallback generator ensures the app **never crashes** during live stage demos in Auditorium 4.

---

## 🚀 Running the App

### 1. Backend (`backend/`)
```bash
cd backend
npm install
npx prisma db push
npm run seed     # Pre-caches sample AUI lectures into PostgreSQL
npm run dev      # Starts on http://localhost:4001
```

### 2. Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev      # Starts on http://localhost:5174 (or 5173)
```

---

## ⌨️ Keyboard Shortcuts

- **`1`**: Switch to French & Darija Bridge
- **`2`**: Switch to ADHD Bite-Sized Flashcards
- **`3`**: Switch to Dyslexia & Audio Mode
- **`Space`**: Reveal / Hide Active-Recall Answer (in ADHD mode)
- **`← / →`**: Previous / Next Flashcard
