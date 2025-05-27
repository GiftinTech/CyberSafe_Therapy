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
//     generationConfig: {
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

let messages = {
  history: [] as { role: 'user' | 'model'; parts: { text: string }[] }[],
};

loadHistory();
restoreChatUI();

async function main() {
  const inputElem = document.querySelector('.js-user-input') as HTMLInputElement;
  let userMessage = inputElem.value.trim();
  if (!userMessage) return;
  console.log('user: ', userMessage);

  messages.history.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });
  saveHistory;

  const chatWindow = document.querySelector('.js_chat_window .js_chat')!;
  chatWindow.insertAdjacentHTML('beforeend', `<div class="user"><p>${userMessage}</p></div>`);

  saveChatUI();

  inputElem.value = '';

  const chat = ai.chats.create({
    model: 'gemini-2.0-flash',
    history: messages.history,
  });

  let fullText = '';
  const stream1 = await chat.sendMessageStream({
    message: userMessage,
  });

  for await (const chunk of stream1) fullText += chunk.text;

  messages.history.push({
    role: 'model',
    parts: [{ text: fullText }],
  });
  saveHistory();

  chatWindow.insertAdjacentHTML('beforeend', `<div class="js_model"><p>${fullText}</p></div>`);
  saveChatUI();

  console.log('Full conversation history:', messages.history);
  console.log('Model response:', fullText);
}

function saveHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(messages.history));
}

function loadHistory() {
  const saved = localStorage.getItem('chatHistory');
  if (saved) {
    try {
      messages.history = JSON.parse(saved);

      const chatWindow = document.querySelector('.js_chat_window .js_chat');
      messages.history.forEach((msg) => {
        const side = msg.role === 'user' ? 'user' : 'model';

        chatWindow?.insertAdjacentHTML(
          'beforeend',
          `
          <div class="${side}">
            <p>${msg.parts[0].text}</p>
          </div>
        `
        );
      });
    } catch (e) {
      console.error('Failed to parse chat history from localStorage', e);
      messages.history = [];
    }
  }
}

function saveChatUI() {
  const chatHTML = document.querySelector('.js_chat_window .js_chat')!.innerHTML;
  localStorage.setItem('chatHTML', chatHTML);
}

function restoreChatUI() {
  const savedHTML = localStorage.getItem('chatHTML');
  if (savedHTML) document.querySelector('.js_chat_window .js_chat')!.innerHTML = savedHTML;
}

const sendButton = document.querySelector('.js-send-button') as HTMLButtonElement;
sendButton.addEventListener('click', async () => {
  await main();
});

const clearBtn = document.querySelector('.js_clear_button') as HTMLButtonElement;
clearBtn.addEventListener('click', () => {
  messages.history = [];
  const chatWindow = document.querySelector('.js_chat_window .js_chat')!;
  chatWindow.innerHTML = `
    <div class="model js_model">
      <p>Hello! I'm your AI therapist. How can I help you feel safer online today?</p>
    </div>
  `;

  localStorage.removeItem('chatHistory');
  localStorage.removeItem('chatHTML');
  console.log('Chat history cleared');
});
