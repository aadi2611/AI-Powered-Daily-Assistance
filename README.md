# 🗨️ Daily Chatbot

Daily Chatbot is a modern, responsive chatbot web application built with **Next.js**, **TypeScript**, and **Tailwind CSS**.  
It provides a sleek and interactive chat interface with theme switching, customizable UI, and ready-to-use API routes for AI model integration.

---

## ✨ Features

- 💬 **Chat Interface** – Clean, user-friendly chat screen with message history.
- 🖥 **Next.js 13+ App Router** – Optimized routing and server components.
- 🎨 **Beautiful UI** – Built with [shadcn/ui](https://ui.shadcn.com) & Tailwind CSS.
- 🌗 **Dark/Light Mode** – Toggle between themes instantly.
- ⚡ **API-Ready** – Integrated `/api/chat` route for custom AI/chatbot backends.
- 📱 **Responsive Design** – Works seamlessly on desktop, tablet, and mobile.

---

## 🛠 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), shadcn/ui, Radix UI
- **Backend:** Next.js API Routes
- **State Management:** React Hooks, custom hooks (`use-toast`, `use-mobile`)

---

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/daily-chatbot.git
cd daily-chatbot
2️⃣ Install Dependencies
This project uses pnpm (recommended), but you can use npm or yarn.

bash
Copy code
pnpm install
or

bash
Copy code
npm install
3️⃣ Run the Development Server
bash
Copy code
pnpm dev
or

bash
Copy code
npm run dev
Then, open http://localhost:3000 in your browser.

🧩 Project Structure
csharp
Copy code
daily-chatbot/
├── app/                # Next.js app directory
│   ├── api/            # API routes (chat endpoint)
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main chat page
├── components/         # UI components (chat interface, theme toggle, etc.)
├── hooks/              # Custom React hooks
├── public/             # Static assets (images, logos)
├── styles/             # Global styles
└── package.json        # Project dependencies
🤝 Contributing
Pull requests are welcome!
For major changes, please open an issue first to discuss what you would like to change.

📜 License
This project is licensed under the MIT License.

💡 Future Improvements
Add user authentication

Persist chat history in a database

Connect to OpenAI or other LLMs for smarter responses

Add multi-language support

