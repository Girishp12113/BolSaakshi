# BolSaakshi (बोल साक्षी)
> **Spoken work. Written clarity.**

BolSaakshi is an AI-assisted, voice-first civic-tech tool designed for Indian informal trade workers (electricians, plumbers, carpenters, painters, and local contractors) and their customers. It converts spoken arrangements in **Hindi, Telugu, or English** into structured, editable written agreement records with manual payment tracking and print-ready PDF export.

Built as an indie developer project for the **Meta Global AI Developer Hackathon**.

---

## The Problem
In India's trade and home services sector, arrangements typically begin with a verbal conversation on-site or over the phone. Key details—such as advance payments, who supplies raw materials (pipes, wires, primer), target completion dates, and excluded tasks (e.g. plastering, tile cutting)—are frequently left unwritten.

When memories diverge or scope expands, informal workers and customers lack documentation, leading to delayed payments and friction.

## The Solution
BolSaakshi provides an accessible, zero-account web workflow:
1. **Spoken or Typed Input**: Workers or customers describe the arrangement in **Hindi**, **Telugu**, or **English**.
2. **Audio Transcription**: Transcribes spoken audio on the server using Groq Whisper (`whisper-large-v3`).
3. **Safety Evaluation**: Evaluates incoming transcripts with Meta's `meta-llama/llama-prompt-guard-2-86m` to detect and reject adversarial prompt injection or abusive input.
4. **Structured Term Extraction**: Extracts parties, tasks, total price in INR, advance terms, and dates into a validated Zod schema.
5. **Ambiguity Flags & Human Review**: Flags missing information and requires human review. It leaves unstated deadlines and undefined materials responsibilities strictly as `null` and generates targeted clarification questions rather than inventing details.
6. **Interactive Resolution**: Answering clarification questions provides an explicit, user-reviewed path to update structured fields (completion deadline, materials responsibility, total or advance amounts) or general terms without silent overwrites.
7. **Manual Payment Tracking**: Logs advances and staged instalments, calculating total recorded payments accurately across normal, partial, overpaid, and unknown-total contracts, with explicit overpayment warnings.
8. **WhatsApp & Print Export**: Creates a prefilled WhatsApp summary link and a formal printout with physical signature and thumbprint placeholders.
9. **Accurate Self-Reported Status**: Uses clear self-reported acknowledgment labels to prevent misleading claims of mutual consent on single-user local records.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Components**: VengeanceUI (`animated-button`, `stagger-text`, `border-beam`, `copy-button`)
- **Validation**: Zod schema validation
- **Inference**: GroqCloud SDK
  - **Speech-to-Text**: `whisper-large-v3` (OpenAI model on Groq)
  - **Generative Extraction**: `openai/gpt-oss-120b` (Reasoning & JSON mode on Groq)
  - **Safety / Guardrail**: `meta-llama/llama-prompt-guard-2-86m` (Meta model on Groq)
- **Persistence**: Browser-local storage (`localStorage`)

---

## 🤖 Meta Hackathon Alignment & Safety Guard

**Transparent Model Disclosure**:
- **Generative Extraction**: Currently powered by `openai/gpt-oss-120b` on GroqCloud.
- **Speech-to-Text**: Powered by `whisper-large-v3` on GroqCloud.
- **Meta AI Model Integrated**: Live safety inference executes via Meta's **`meta-llama/llama-prompt-guard-2-86m`** on Groq (evaluating up to 1,500 characters within its 512-token context window).
- **Safety Screening Policy**: Before generative extraction, the input transcript is screened. If the safety score is `>= 0.5` (indicating prompt injection or malicious input), the server halts extraction immediately and returns HTTP `400 Bad Request` with `safetyFlagged: true`. The API response explicitly discloses whether full (`passed_full`) or partial (`passed_partial`) screening occurred, and never claims an unavailable screening check passed.
- **App-Level Public Protection**: Protects public demo routes with in-memory IP rate limiting (25 extractions/min, 15 transcriptions/min) and a 10,000-character input cap, preventing abuse without requiring mandatory accounts.
- **Meta Llama Generative Status**: Direct generative models (`llama-3.3-70b-versatile` and `llama-3.1-8b-instant`) returned `model_not_found` / 404 on the developer Groq key used for this environment. The codebase architecture (`lib/ai/provider.ts`) is fully model-agnostic: once a Groq tier or compatible provider with Meta Llama generative access is provisioned, setting `GROQ_CHAT_MODEL=llama-3.3-70b-versatile` routes extraction to Meta Llama without changing client or schema logic.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+ installed
- GroqCloud API key (free tier available at [console.groq.com](https://console.groq.com/keys))

### 2. Installation
```bash
# Clone or navigate to the repository
git clone <your-repo-url>
cd BolSaakshi
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Add your Groq API key in `.env.local`:
```env
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_CHAT_MODEL=openai/gpt-oss-120b
GROQ_WHISPER_MODEL=whisper-large-v3
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Quality Checks
```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

---

## 🌐 Deployment Instructions (Vercel & GitHub)

### Verified Repository Structure
The Git repository root (`git rev-parse --show-toplevel`) is the directory containing `package.json`, `app/`, `components/`, and `next.config.ts`.

### Deploying to Vercel
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "BolSaakshi production release"
   git remote add origin https://github.com/<your-username>/BolSaakshi.git
   git push -u origin master
   ```
2. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** and select your `BolSaakshi` repository.
   - **Root Directory**: Leave as `./` (default root).
   - **Framework Preset**: Next.js (auto-detected).
   - **Environment Variables**: Add:
     - `GROQ_API_KEY`: *(Your GroqCloud API key)*
     - `GROQ_CHAT_MODEL`: `openai/gpt-oss-120b`
     - `GROQ_WHISPER_MODEL`: `whisper-large-v3`
3. Click **Deploy**. Vercel will run `npm run build` and provision your production HTTPS URL.

---

## 🔒 Storage, Security & Legal Notice

- **Browser-Local Storage**: Saved agreement records and payment logs exist solely on your device in browser `localStorage`. Data does not automatically sync across devices and will be deleted if site data is cleared.
- **AI Processing**: Submitted audio recordings and transcripts are transmitted securely to GroqCloud exclusively for real-time speech-to-text transcription and structured term extraction, and are not retained on our application servers.
- **Manual Bookkeeping**: Payment entries are self-reported manual logs and do not integrate with or verify bank or UPI settlement gateways.
- **Legal Notice**: BolSaakshi creates digital records of verbal work arrangements to reduce confusion and payment disputes. It does not provide legal advice, does not constitute a government-notarized agreement, and makes no legal guarantees.

---

## 📄 License
MIT License. Built for the Meta Global AI Developer Hackathon 2026.
