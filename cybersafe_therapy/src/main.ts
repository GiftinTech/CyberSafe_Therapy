// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// const run = async () => {
//   const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
//   const chat = model.startChat({
//     history: [
//       {
//         role: 'user',
//         parts: 'Hello, I have 2 dogs',
//       },
//       {
//         role: 'model',
//         parts: 'Great to meet you. What would you like to know?',
//       },
//     ],
//     generationConfig:
//       maxOutputTokens: 100,
//     },
//   });

//   const message = 'How many paws are in my house?';

//   const result = await chat.sendMessageStream(message);
//   for await (const chunk of result) {
//     console.log(chunk.text);
//     console.log('_'.repeat(80));
//   }

//   const response = await result.response;
//   const text = response.text();
//   console.log(text);
// };
// run();

import "./tailwind.css";
import { setTheme, getPreferredTheme, toggleTheme } from "./landing-page";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const textarea = document.querySelector(".js-user-input") as HTMLInputElement;

// Theme toggle functionality
setTheme(getPreferredTheme());
window.addEventListener("message", function (e) {
  if (e.data && e.data.type === "theme") setTheme(e.data.theme);
});
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    toggleTheme();
    // Broadcast theme change to opener (index.html) or child (chat.html)
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          { type: "theme", theme: getPreferredTheme() },
          "*",
        );
      } catch (e) {}
    }
    if ((window as any).chatWindow && !(window as any).chatWindow.closed) {
      try {
        (window as any).chatWindow.postMessage(
          { type: "theme", theme: getPreferredTheme() },
          "*",
        );
      } catch (e) {}
    }
  });
}

if (textarea) {
  textarea.focus();

  // Move cursor to the end
  const length = textarea.value.length;
  textarea.setSelectionRange(length, length);

  // Scroll to the bottom just in case
  textarea.scrollTop = textarea.scrollHeight;
}

let messages = {
  history: [] as { role: "user" | "model"; parts: { text: string }[] }[],
};

loadHistory();

function saveHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(messages.history));
}

function loadHistory() {
  const saved = localStorage.getItem("chatHistory");
  const chatWindow = document.querySelector(".js_chat_window .js_chat")!;
  chatWindow.innerHTML = "";
  if (saved) {
    try {
      messages.history = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse chat history from localStorage", e);
      messages.history = [];
    }
  }

  const modelInitChat =
    "Hello! I'm your AI therapist. How can I help you feel safer online today?";
  chatWindow.insertAdjacentHTML(
    "beforeend",
    `<div class="model js_model"><p>${modelInitChat}</p></div>`,
  );

  // Render all messages
  messages.history.forEach((msg) => {
    const side = msg.role === "user" ? "user" : "model";
    chatWindow.insertAdjacentHTML(
      "beforeend",
      `<div class="${side}"><p>${msg.parts[0].text}</p></div>`,
    );
  });
}

async function main() {
  let userMessage = textarea.value.trim();
  if (!userMessage) return;
  textarea.value = "";
  console.log("user: ", userMessage);

  // Add user's message to history and UI
  messages.history.push({
    role: "user",
    parts: [{ text: userMessage }],
  });
  saveHistory();

  const chatWindow = document.querySelector(".js_chat_window .js_chat")!;
  chatWindow.insertAdjacentHTML(
    "beforeend",
    `<div class="user js_user"><p>${userMessage}</p></div>`,
  );

  // Show only the loader while waiting for the model's response
  const loader = document.createElement("span");
  loader.className = "loader js_loader";
  chatWindow.appendChild(loader);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  await new Promise((resolve) => setTimeout(resolve, 50));

  let fullText = "";
  let errorOccurred = false;
  let modelWrapper: HTMLDivElement | null = null;
  let modelText: HTMLParagraphElement | null = null;

  try {
    const chat = model.startChat({
      history: messages.history,
    });

    const result = await chat.sendMessageStream(userMessage);

    let hasFirstChunk = false;

    for await (const chunk of result.stream) {
      if (!hasFirstChunk) {
        // On first chunk, remove loader and add model container
        loader.remove();
        modelWrapper = document.createElement("div");
        modelWrapper.className = "model js_model";
        modelText = document.createElement("p");
        modelWrapper.appendChild(modelText);
        chatWindow.appendChild(modelWrapper);
        hasFirstChunk = true;
      }
      fullText += chunk.text();
      if (modelText) modelText.textContent = fullText;
    }
  } catch (err) {
    errorOccurred = true;
    loader.remove();
    if (modelWrapper) modelWrapper.remove(); // Remove the empty model container if it exists
    console.error("Model failed to respond:", err);
  }

  // If there was a response, update history
  if (!errorOccurred && fullText.trim()) {
    messages.history.push({
      role: "model",
      parts: [{ text: fullText }],
    });
    saveHistory();
  }
  console.log("Full conversation history:", messages.history);
  console.log("Model response:", fullText);
}

const sendButton = document.querySelector(
  ".js-send-button",
) as HTMLButtonElement;
sendButton.addEventListener("click", async () => {
  await main();
});

const clearBtn = document.querySelector(
  ".js_clear_button",
) as HTMLButtonElement;
clearBtn.addEventListener("click", () => {
  messages.history = [];
  saveHistory();
  loadHistory();
  console.log("Chat history cleared");
});

// On page load
loadHistory();
