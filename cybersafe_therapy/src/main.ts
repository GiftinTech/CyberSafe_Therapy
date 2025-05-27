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

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const textarea = document.querySelector('.js-user-input') as HTMLInputElement;

if (textarea) {
  textarea.focus();

  // Move cursor to the end
  const length = textarea.value.length;
  textarea.setSelectionRange(length, length);

  // Scroll to the bottom just in case
  textarea.scrollTop = textarea.scrollHeight;
}

let messages = {
  history: [] as { role: 'user' | 'model'; parts: { text: string }[] }[],
};

loadHistory();

function saveHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(messages.history));
}

function loadHistory() {
  const saved = localStorage.getItem('chatHistory');
  const chatWindow = document.querySelector('.js_chat_window .js_chat')!;
  chatWindow.innerHTML = '';
  if (saved) {
    try {
      messages.history = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse chat history from localStorage', e);
      messages.history = [];
    }
  }
  // If no history, add welcome message
  if (messages.history.length === 0) {
    messages.history.push({
      role: 'model',
      parts: [
        { text: "Hello! I'm your AI therapist. How can I help you feel safer online today?" },
      ],
    });
    saveHistory();
  }
  // Render all messages
  messages.history.forEach((msg) => {
    const side = msg.role === 'user' ? 'user' : 'model';
    chatWindow.insertAdjacentHTML(
      'beforeend',
      `<div class="${side}"><p>${msg.parts[0].text}</p></div>`
    );
  });
}

async function main() {
  let userMessage = textarea.value.trim();
  if (!userMessage) return;
  textarea.value = '';
  console.log('user: ', userMessage);

  // Add user's message to history and UI
  messages.history.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });
  saveHistory();

  const chatWindow = document.querySelector('.js_chat_window .js_chat')!;
  chatWindow.insertAdjacentHTML('beforeend', `<div class="user"><p>${userMessage}</p></div>`);

  // Show only the loader while waiting for the model's response
  const loader = document.createElement('span');
  loader.className = 'loader js_loader';
  loader.textContent = '...'; // Optional: for visibility
  chatWindow.appendChild(loader);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  await new Promise((resolve) => setTimeout(resolve, 50));

  let fullText = '';
  let errorOccurred = false;
  let modelWrapper: HTMLDivElement | null = null;
  let modelText: HTMLParagraphElement | null = null;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history: messages.history,
    });

    const stream1 = await chat.sendMessageStream({
      message: userMessage,
    });

    let hasFirstChunk = false;

    for await (const chunk of stream1) {
      if (!hasFirstChunk) {
        // On first chunk, remove loader and add model container
        loader.remove();
        modelWrapper = document.createElement('div');
        modelWrapper.className = 'model js_model';
        modelText = document.createElement('p');
        modelWrapper.appendChild(modelText);
        chatWindow.appendChild(modelWrapper);
        hasFirstChunk = true;
      }
      fullText += chunk.text;
      if (modelText) modelText.textContent = fullText;
    }
  } catch (err) {
    errorOccurred = true;
    loader.remove();
    if (modelWrapper) modelWrapper.remove(); // Remove the empty model container if it exists
    console.error('Model failed to respond:', err);
  }

  // If there was a response, update history
  if (!errorOccurred && fullText.trim()) {
    messages.history.push({
      role: 'model',
      parts: [{ text: fullText }],
    });
    saveHistory();
  }
  console.log('Full conversation history:', messages.history);
  console.log('Model response:', fullText);
}

const sendButton = document.querySelector('.js-send-button') as HTMLButtonElement;
sendButton.addEventListener('click', async () => {
  await main();
});

const clearBtn = document.querySelector('.js_clear_button') as HTMLButtonElement;
clearBtn.addEventListener('click', () => {
  messages.history = [];
  saveHistory();
  loadHistory();
  console.log('Chat history cleared');
});

// On page load
loadHistory();
