<<<<<<< HEAD
# OmniLearnAI
Omni learn AI, A project for Codeversity, IIT Gandhinagar
=======
# OmniLearn AI 🚀

A high-performance, multimodal learning application that transforms any topic into a complete educational module including text explanations, diagrams, audio lessons, interactive quizzes, and visual content.

## ✨ Features

- **1. AI Topic Explanation**: Deep-dives powered by Groq (Llama 3.3) with markdown formatting.
- **2. Question & Solution Generator**: Interactive MCQs with detailed corrective feedback.
- **3. Difficulty & Age Customization**: Education logic tailored (e.g., Explain Quantum Physics to a 5-year-old vs. PhD student).
- **4. Multimodal Output**:
    - **Text**: Rich Markdown.
    - **Diagrams**: Dynamic Mermaid.js flowcharts and mindmaps.
    - **Audio**: Groq Orpheus TTS (Text-to-Speech) for lesson audio.
    - **Visual Video**: Canvas-based audio visualizer synced to lesson audio.
- **5. Accuracy Verification**: Built-in verification check notes for every topic.
- **6. Multi-language Support**: Native content generation in English, Spanish, French, German, Hindi, and more.
- **7. Auto Topic Breakdown**: Step-by-step logical progression of the core subject.
- **8. PDF Worksheet Generator**: One-click download of the entire module using `jspdf` and `html2canvas`.

## 🛠 Prerequisites

- Node.js 18.x or later
- [Groq](https://console.groq.com) API Key

## 🚀 Getting Started

1. **Clone the repository and install dependencies**:
    ```bash
    npm install
    ```

2. **Environment Setup**:
   Create a `.env.local` file in the root directory:
    ```
    GROQ_API_KEY=gsk_your_key_here
    DATABASE_URL="file:./dev.db"
    ```
   Get your Groq key at [console.groq.com/keys](https://console.groq.com/keys). Optional: `GEMINI_API_KEY` for enhanced video script and diagrams.

3. **Database** (for Study Planner, Worksheet, Progress, Contact, Auth, Admin):
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

4. **Run the Development Server**:
    ```bash
    npm run dev
    ```

5. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 New Pages & APIs (OmniLearnAI)

- **Study Planner** (`/planner`): Exam date → daily plan, editable cards, progress bar. APIs: `POST /api/planner/generate`, `GET /api/planner/:userId`, `PUT /api/planner/update`.
- **Worksheet Generator** (`/worksheet`): Topic + difficulty → worksheet record; PDF preview/download. APIs: `POST /api/pdf/worksheet`, `GET /api/worksheet/:id`.
- **Progress Dashboard** (`/progress`): XP, badges, weaknesses, weekly activity. APIs: `GET /api/progress/:userId`, `POST /api/progress/add`.
- **Weakness Detector** (`/weakness`): Upload answer sheet URL → summary and topic suggestions. APIs: `POST /api/weakness/upload`, `POST /api/weakness/analyze`.
- **Pricing** (`/pricing`), **About** (`/about`), **Contact** (`/contact`): Static/contact form. API: `POST /api/contact/submit`.
- **Auth** (`/auth/login`, `/auth/signup`, `/auth/forgot`): Login, signup, reset (placeholder). APIs: `POST /api/auth/signup`, `login`, `reset`, `google`.
- **Admin** (`/admin`): User list, stats, delete user. APIs: `GET /api/admin/users`, `GET /api/admin/stats`, `DELETE /api/admin/user/:id`.
- **Help chatbot**: Navbar button opens modal; `POST /api/chatbot/help` (FAQ-based).
- **Dark mode**: Toggle in navbar; preference saved in `localStorage`.

The main learning-lessons page (Home) is unchanged. All new code is in new files.

## 🏗 Project Structure

- `app/api/ai/`: Server-side endpoints for Content and Audio generation (unchanged).
- `app/api/planner/`, `worksheet/`, `progress/`, `weakness/`, `contact/`, `auth/`, `admin/`, `chatbot/`: New API routes.
- `prisma/schema.prisma`: DB models (User, StudyPlan, Worksheet, Progress, WeaknessReport, ContactMessage).
- `lib/db.ts`: Prisma client singleton.
- `components/multimodal/`: Diagrams, quiz, breakdown, visualizer (unchanged).
- `components/ui/`: ThemeProvider, DarkModeToggle. `components/layout/`: Navbar. `components/chatbot/`: ChatbotModal.
- `lib/groq.ts`, `lib/utils.ts`: Core AI and PDF export (unchanged).

## 📝 Usage

1. Enter a topic (e.g., "The Life Cycle of Stars").
2. Set the target Age and Difficulty level.
3. Select the preferred language.
4. Click **Generate Module**.
5. Interact with the audio visualizer, review the mindmap, and take the quiz.
6. Export the worksheet as a PDF for offline study.

## 🛡 Troubleshooting

- **Mermaid Errors**: If a diagram doesn't render, try a more specific topic name. Complex nesting can sometimes trigger Mermaid parser errors.
- **Audio Loading**: Large explanations take a few seconds to buffer through the Groq TTS API (Orpheus). Audio is returned as WAV.
- **PDF Formatting**: Heavy diagrams might take a moment to render to canvas during PDF export. Ensure the page is fully scrolled/loaded before exporting.
>>>>>>> master
