---
# 🧠 OmniLearnAI

**OmniLearnAI** is an advanced, AI-powered multimodal learning platform — built as a submission for **Codeversity, IIT Gandhinagar**. It transforms any topic into a complete, interactive educational experience by generating explanations, diagrams, audio lessons, quizzes, and worksheets tailored to the learner’s level and needs.

---

## 🚀 Key Features

### 🎓 Intelligent Topic Learning

* **AI-driven Topic Explanation**
  Deep and structured content generation using Groq (Llama 3.3) with Markdown formatting.

* **Difficulty & Age Customization**
  Generates learning materials suited for different audiences — from children to experts.

### 🧩 Interactive & Multimodal Content

* **Diagrams & Mindmaps** rendered using **Mermaid.js**
* **Audio Lessons** via Groq Orpheus TTS (text-to-speech)
* **Interactive Quizzes** with corrective feedback
* **Multilingual Content Support** — e.g., English, Hindi, Spanish, French, German.

### 📄 Materials Generation

* **Auto Topic Breakdown** — logical step-by-step topic decomposition
* **Worksheet/PDF Generator** — export full modules or worksheets using *jspdf* + *html2canvas*
* **Verification Notes** — context accuracy checks for generated explanations

### 📈 Extended Educational Tools

* **Study Planner** — daily plan builder from an exam date
* **Progress Dashboard** — track skill growth and activity
* **Weakness Analyzer** — upload responses to get learning gaps & suggestions

---

## 🔧 Tech Stack

* **Next.js (React + Server Components)**
* **TypeScript** + Tailwind CSS + Prisma (SQLite DB)
* **AI Providers:** Groq API (required), optional Gemini key for enhanced outputs
* **Mermaid.js** for dynamic visual content

---

## 🧠 Motivation

Learning is most effective when it’s **dynamic, adaptive, and engaging**. OmniLearnAI aims to replace static PDFs with:

✔ Personalized lesson paths
✔ Audio + visual learning assets
✔ Interactive quizzes with feedback
✔ Exportable worksheets

Designed especially for student use, exam prep, and self-paced learning.

---

## 🚀 Getting Started

### 📋 Prerequisites

* **Node.js 18+**
* Groq API Key (mandatory)
* Optional: Gemini API Key (enhanced visuals/diagrams)

Create a `.env.local` file with:

```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=your_gemini_api_key_here  # optional
```

### 🛠 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Divyatmaj/OmniLearnAI.git
   cd OmniLearnAI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup database:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Run development server:

   ```bash
   npm run dev
   ```

5. Open in browser:

   ```
   http://localhost:3000
   ```

---

## 🧭 Project Structure

```
/app
  /api
    /ai/           # AI endpoints (topic, audio, visuals)
    /planner/      # Study Planner APIs
    /worksheet/    # Worksheet gen APIs
    /progress/     # Progress data APIs
    /weakness/     # Weakness analyzer
/lib              # Utils & API wrappers
/components       # UI + multimodal elements
/prisma/schema.prisma # SQLite schema
```

---

## 🧪 Usage Highlights

### 📚 Generate a Learning Module

1. Enter a topic
2. Choose age and difficulty
3. Hit **Generate**
4. Interact with:

   * Audio lesson
   * Diagrams & Mindmaps
   * Automated quizzes

### 📄 Create Worksheets

Download complete modules or topic summaries as **PDF**.

### 📊 Progress & Weakness Tools

Track progress and upload answers for automated learning gap analysis.

---

## 🤝 Contributing

We welcome contributions!

1. Fork this repo 😎
2. Create a feature branch
3. Add meaningful commits
4. Open a pull request with clear changelog

Please follow the existing **code style** and add **unit tests** where applicable.

---

## 📜 License

Distributed under the MIT License.

---

## 📞 Contact

Developed for **Codeversity, IIT Gandhinagar** — feel free to raise issues or contact maintainers for support or collaboration.

---
