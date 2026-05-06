# 🚗 Car Assistant — Voice-Powered Navigation Demo

A real-time voice navigation assistant built with the **OpenAI Agents SDK (Voice Agents)**, Next.js, and a custom fake map engine. The agent automatically warns drivers about nearby traffic signs and answers traffic-related questions by voice.

---

## ✨ Features

### Core Features
- **Voice Agent** — Powered by OpenAI Realtime API (WebRTC). The agent speaks and listens in real time with no manual push-to-talk.
- **Fake Map Engine** — A coordinate-based SVG map (100×100 grid) with fixed road layouts and randomized traffic signs.
- **Auto-Warning System** — When the car is placed on the map, the agent immediately calls the map context tool and announces relevant warnings.
- **Traffic Q&A** — Ask the agent questions like *"Can I park here?"* or *"What's the speed limit?"* and get accurate answers based on the current map data.
- **Conversation Log** — All voice exchanges (both user and agent) are transcribed and displayed as text in real time.
---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes (Node.js) |
| Voice Agent | OpenAI Agents SDK (`@openai/agents`) — Realtime Voice Agents via WebRTC |
| Map | Custom SVG map engine with proximity detection logic |
| Language | TypeScript |

---

## 🤖 AI Models

| Role | Model | Description |
|---|---|---|
| **Voice Agent** | `gpt-4o-mini-realtime-preview` | Drives the real-time speech-to-speech conversation. Processes user audio, calls tools, and generates spoken responses with low latency over WebRTC. |
| **Speech-to-Text** | `gpt-4o-mini-transcribe` | Transcribes the user's voice input into text in real time, used to display the conversation log on screen. |

---

## 📋 Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys) with access to the Realtime API (`gpt-4o-realtime-preview` or `gpt-4o-mini-realtime-preview`)

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd car-assistant
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Copy the example env file and add your OpenAI API key:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace the placeholder:

```env
OPENAI_API_KEY=sk-proj-your-key-here
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

### 5. (Optional) Expose via ngrok for microphone access

Browsers require **HTTPS** to grant microphone permissions. If you're testing on a remote device or need a public HTTPS URL, use [ngrok](https://ngrok.com/) to tunnel your local server:

```bash
ngrok http 4000
```

ngrok will provide a public `https://xxxx.ngrok.io` URL that you can open in any browser with full microphone access.

---

## 📁 Project Structure

```
car-assistant/
├── app/
│   ├── api/
│   │   ├── token/route.ts        # Generates ephemeral WebRTC token
│   │   └── zones/route.ts        # Returns zone data
│   ├── layout.tsx
│   └── page.tsx                  # Main page
├── components/
│   ├── MapCanvas.tsx             # SVG map renderer
│   ├── ControlPanel.tsx          # Zone/car controls + voice agent controls
│   └── AgentLog.tsx              # Real-time conversation transcript
└── lib/
    ├── mapData.ts                # Zone definitions, fixed roads, sign generation
    ├── proximityEngine.ts        # Direction-aware proximity detection
    ├── agentTools.ts             # Tool definitions for the RealtimeAgent
    └── useVoiceAgent.ts          # Voice session hook (WebRTC)
```

---

## 🗺 Map Data

### Road Grid (Fixed — shared across all zones)

All zones use the same **3×4 road grid** on a 100×100 coordinate space:

| Road | Type | Coordinate | Name |
|---|---|---|---|
| h1 | Horizontal | y = 20 | North Street |
| h2 | Horizontal | y = 55 | Main Street |
| h3 | Horizontal | y = 88 | South Street |
| v1 | Vertical | x = 20 | First Ave |
| v2 | Vertical | x = 40 | Second Ave |
| v3 | Vertical | x = 60 | Third Ave |
| v4 | Vertical | x = 80 | Fourth Ave |

This produces **12 intersections** (e.g. `(20,20)`, `(40,55)`, `(80,88)`) and **7 mid-road entry slots** where signs can be placed.

---

### Zones (5 total)

Each zone shares the same road layout but has a **different sign configuration** generated randomly on each "Random Zone" click. Signs are distributed across 19 available slots (12 intersections + 7 road entries), with 60% probability drawn from each zone's preferred sign types.

| Zone | Signs | Preferred Sign Types | Description |
|---|---|---|---|
| **Shibuya** | 8 | No Parking, Traffic Light, Crossing, Stop Sign | Busy urban shopping district with strict parking rules |
| **Downtown** | 9 | Traffic Light, Speed Limit 30, No Parking, Yield | City center with mixed traffic and many intersections |
| **School Zone** | 8 | Speed Limit 30, Crossing, Stop Sign, No Parking | Residential area near school with low speed limits |
| **Highway Entry** | 7 | Speed Limit 80, Speed Limit 60, No Entry, Yield | Highway on-ramp area with high speed limits |
| **Quiet Suburb** | 6 | Speed Limit 30, Crossing, Yield, Stop Sign | Residential neighborhood with relaxed traffic rules |

---

### Traffic Signs (9 types)

| Sign | Type | Warning Announced |
|---|---|---|
| 🚫 | No Parking | "No parking zone nearby. You cannot park here." |
| 🔢 | Speed Limit 30 | "Speed limit is 30 km/h ahead. Please slow down." |
| 🔢 | Speed Limit 60 | "Speed limit is 60 km/h on this road." |
| 🔢 | Speed Limit 80 | "Speed limit is 80 km/h on this road." |
| 🚦 | Traffic Light | "Traffic light ahead. Prepare to stop." |
| 🛑 | Stop Sign | "Stop sign ahead. You must stop completely." |
| 🚸 | Pedestrian Crossing | "Pedestrian crossing ahead. Watch for pedestrians." |
| ⛔ | No Entry | "No entry zone ahead. Do not proceed in this direction." |
| ⚠️ | Yield | "Yield sign ahead. Give way to oncoming traffic." |

---
