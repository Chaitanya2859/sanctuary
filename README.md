<div align="center">

# 🌿 Sanctuary

### *Mindful Awareness & Emotional Eating Recovery*

A gentle, non-judgmental space to transform your relationship with food — one mindful pause at a time.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: Personal](https://img.shields.io/badge/License-Personal_Wellbeing-a8e6cf?style=for-the-badge)](#license)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Environment Variables](#-environment-variables) · [Architecture](#-architecture) · [Ethical Commitment](#-ethical-commitment)

---

<img src="https://img.shields.io/badge/AI_Powered-Groq_%2B_Gemini-blueviolet?style=flat-square" alt="AI Powered"/>
<img src="https://img.shields.io/badge/Design-Neomorphic_%2F_Glassmorphic-teal?style=flat-square" alt="Design"/>
<img src="https://img.shields.io/badge/Auth-Firebase_Google_Login-orange?style=flat-square" alt="Auth"/>

</div>

---

## 🌱 About

**Sanctuary** is built on a simple belief: *awareness is the first step to change*.

Emotional eating is rarely about food. It's about feelings that need a voice. Sanctuary gives you that space — to pause, to notice, and to respond to yourself with the same kindness you'd offer a friend. There are no calories counted here, no weight goals, no judgment. Just you, your feelings, and a gentle nudge toward the present moment.

Whether you're in the early stages of recognizing patterns, or deep in the work of recovery, Sanctuary meets you exactly where you are.

---

## ✨ Features

### 🧠 Dual-Provider AI Reflections
After every check-in, Sanctuary generates a compassionate, personalized response — not advice, not judgment, just a thoughtful reflection.

- **Primary Engine — Groq (Llama 3.3 70B):** Near-instant reflections with high emotional nuance.
- **Fallback Engine — Google Gemini 2.0 Flash-Lite:** Seamless fallback for 100% uptime.
- **Secure Architecture:** All AI calls are routed through a server-side `/api/ai` endpoint. Your keys are never exposed to the browser.
- **Ethical Prompting:** The AI is explicitly instructed to avoid diet culture, weight commentary, and calorie talk — always.

### 📊 Progress Dashboard
Your journey, visualized:

| Metric | Description |
|---|---|
| **Consistency Streak** | Days in a row you've checked in |
| **Mindful Pause Rate** | % of urges where you paused before acting |
| **Emotional Heatmap** | Discover patterns in mood and hunger over time |
| **Weekly AI Reflection** | A gentle, AI-generated summary of your week's rhythm |

### 🎧 Grounding Soundboard
A minimalist ASMR-style soundboard to help you anchor yourself during moments of emotional intensity or urge. Powered by web-optimized, locally hosted audio assets — no external requests, no loading delays.

Sounds include rain, forest ambience, soft tones, and more — chosen specifically to activate the parasympathetic nervous system.

### 🔒 Privacy-First Architecture
- **Firebase Authentication** — Secure, Google-based login with no password storage.
- **Cloud Firestore** — Your reflections are stored privately in your own Firebase project.
- **Zero Third-Party Tracking** — No analytics SDKs, no ad pixels.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Animations** | [Framer Motion / Motion](https://motion.dev/) |
| **Auth & Database** | [Firebase](https://firebase.google.com/) (Auth + Firestore) |
| **Primary AI** | [Groq — Llama 3.3 70B](https://groq.com/) |
| **Fallback AI** | [Google Gemini 2.0 Flash-Lite](https://ai.google.dev/) |
| **Styling** | Vanilla CSS — Neomorphic & Glassmorphic design principles |

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18 or higher
- A **[Groq API Key](https://console.groq.com/)** (free tier available)
- A **[Google Gemini API Key](https://aistudio.google.com/app/apikey)** (free tier available)
- A **[Firebase project](https://console.firebase.google.com/)** with Authentication and Firestore enabled

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/sanctuary.git
cd sanctuary
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Then open `.env` and fill in your keys:

```env
# AI Providers
GROQ_API_KEY="your_groq_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
```

**4. Add your Firebase config**

Download your Firebase Web App config and save it as `firebase-applet-config.json` in the project root. It should look like this:

```json
{
  "apiKey": "...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "...",
  "appId": "..."
}
```

> **Where to find this:** Firebase Console → Project Settings → Your Apps → Web App → Config

**5. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Sanctuary is now running locally.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Primary AI engine key (Groq) |
| `GEMINI_API_KEY` | ✅ Yes | Fallback AI engine key (Gemini) |

Firebase configuration is managed via `firebase-applet-config.json` in the project root rather than environment variables, to support Firebase's recommended Web SDK initialization pattern.

---

## 🏗️ Architecture

```
sanctuary/
├── app/
│   ├── api/
│   │   └── ai/             # Server-side AI bridge (Groq → Gemini fallback)
│   ├── dashboard/          # Progress dashboard & heatmaps
│   ├── check-in/           # Hunger & emotion check-in flow
│   └── soundboard/         # Grounding ASMR soundboard
├── components/             # Shared UI components
├── lib/
│   ├── firebase.ts         # Firebase initialization
│   └── ai.ts               # AI provider abstraction layer
├── firebase-applet-config.json
└── .env
```

### AI Routing Flow

```
Client check-in
     │
     ▼
POST /api/ai  (server-side)
     │
     ├─── Try Groq (Llama 3.3 70B) ──── ✅ Success → Return reflection
     │
     └─── Fallback: Gemini 2.0 Flash-Lite ── ✅ Success → Return reflection
```

API keys live exclusively on the server. The client receives only the generated reflection text.

---

## 🌍 Ethical Commitment

Sanctuary is designed to be a **safe haven** — not a diet app in disguise.

Our AI prompts are explicitly engineered to:

- ❌ **Never** mention weight, BMI, calories, or "clean eating"
- ❌ **Never** frame food as "good" or "bad"
- ✅ **Always** validate the user's feelings without judgment
- ✅ **Always** promote curiosity and self-compassion over control
- ✅ **Focus** on the **Mindful Pause** as the core practice — not willpower, not restriction

If you're a developer extending this project, please read and honor the system prompt in `/app/api/ai/route.ts` before modifying AI behavior.

---

## 🤝 Contributing

This is a personal wellbeing project, but thoughtful contributions are welcome — especially around:

- Accessibility improvements
- Additional grounding soundscapes
- Localization / i18n support
- Offline-first PWA capabilities

Please open an issue before submitting a PR to discuss your idea first.

---

## 📄 License

This project is intended for **personal wellbeing and mindful awareness**. It is not a medical device, a clinical tool, or a substitute for professional mental health care.

If you are struggling with an eating disorder, please reach out to a qualified professional or contact the **[National Alliance for Eating Disorders Helpline](https://www.allianceforeatingdisorders.com/find-a-provider/)**.

---

<div align="center">

*Built with 🌿 and the belief that you are worthy of gentleness.*

</div>
