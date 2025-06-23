# 🧠 Deite A2 – AI Mental Wellness Companion

Deite A2 is a mental wellness companion that replaces traditional therapy with a personalized AI chatbot named Deite. Users can talk to Deite about their emotions, daily experiences, or social interactions — such as asking, “Was I rude to my friend?” or “Did I overreact?” The AI provides honest and empathetic reflections to support emotional clarity.

The app also includes a **Day Reflect** section, where daily conversations are automatically summarized into journal entries. Users can revisit and reflect on any past day — enhancing self-awareness, emotional regulation, and cognitive growth.

Deite is powered by **LLaMA 3**, trained to act as a therapeutic assistant, and deployed using **RunPod pods** for scalable, fast inference.

---

![License](https://img.shields.io/badge/license-MIT-green)
![Last Commit](https://img.shields.io/github/last-commit/VasudevJamdagniGaur/deite-a2)

---

## 📚 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

---

## ✨ Features

- 🤖 AI chatbot for emotional support and daily reflections
- 📘 "Day Reflect" – an automated emotional journal
- 🔍 Memory recall by date (e.g., “What happened on May 5?”)
- 🧠 LLaMA 3-powered mental health insights
- 🔐 Secure user sessions and data handling
- 🌐 Mobile & web support (React / Flutter)

---

## 🚀 Getting Started

### Prerequisites

- Node.js or Flutter installed
- Firebase account (for authentication and DB)
- RunPod account for model deployment

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/deite-a2.git
cd deite-a2

# Frontend
cd client
npm install
npm run dev

# Backend
cd ../server
npm install
npm run dev
