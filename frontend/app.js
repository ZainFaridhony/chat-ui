const chatContainer = document.getElementById("chatContainer");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");
const messageTemplate = document.getElementById("messageTemplate");

const API_BASE_URL = "http://localhost:8000";

const roles = {
  user: {
    alignment: "justify-end",
    bubbleClasses: "bg-sky-500 text-white",
    label: "You",
  },
  assistant: {
    alignment: "justify-start",
    bubbleClasses: "bg-slate-800 text-slate-100",
    label: "AI",
  },
};

const createMessageElement = (role, content, isLoading = false) => {
  const node = messageTemplate.content.firstElementChild.cloneNode(true);
  const config = roles[role] || roles.assistant;
  node.classList.add(config.alignment);
  const bubble = node.querySelector(".message-bubble");
  bubble.classList.add(config.bubbleClasses);
  if (isLoading) {
    bubble.innerHTML = `<span class="flex items-center gap-2 text-slate-300"><span class="h-2 w-2 animate-pulse rounded-full bg-current"></span><span class="h-2 w-2 animate-pulse rounded-full bg-current" style="animation-delay: 150ms"></span><span class="h-2 w-2 animate-pulse rounded-full bg-current" style="animation-delay: 300ms"></span></span>`;
  } else {
    bubble.innerHTML = marked.parse(content);
  }
  return node;
};

const scrollToBottom = () => {
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
};

const resetForm = () => {
  chatForm.reset();
  filePreview.innerHTML = "";
};

const renderFilePreview = (files) => {
  filePreview.innerHTML = "";
  Array.from(files).forEach((file) => {
    const container = document.createElement("div");
    container.className = "flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs";
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      img.className = "h-10 w-10 rounded object-cover";
      container.appendChild(img);
    }
    const info = document.createElement("div");
    info.innerHTML = `<p class="font-medium text-slate-200 truncate">${file.name}</p><p class="text-slate-500">${(file.size / 1024).toFixed(1)} KB</p>`;
    container.appendChild(info);
    filePreview.appendChild(container);
  });
};

fileInput.addEventListener("change", (event) => {
  if (event.target.files.length) {
    renderFilePreview(event.target.files);
  } else {
    filePreview.innerHTML = "";
  }
});

const appendMessage = (role, content, isLoading = false) => {
  const messageEl = createMessageElement(role, content, isLoading);
  chatContainer.appendChild(messageEl);
  scrollToBottom();
  return messageEl;
};

const updateMessageContent = (messageEl, content) => {
  const bubble = messageEl.querySelector(".message-bubble");
  bubble.innerHTML = marked.parse(content);
};

const setLoadingState = (state) => {
  messageInput.disabled = state;
  fileInput.disabled = state;
  chatForm.querySelector("button[type='submit']").disabled = state;
};

const sendMessage = async (text, files) => {
  const formData = new FormData();
  formData.append("text", text);
  if (files) {
    Array.from(files).forEach((file) => formData.append("files", file));
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch response");
  }

  const data = await response.json();
  return data.response;
};

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  const files = fileInput.files;

  if (!text && (!files || !files.length)) {
    return;
  }

  const userMessageEl = appendMessage("user", text || "(file message)");
  const aiMessageEl = appendMessage("assistant", "", true);

  try {
    setLoadingState(true);
    const aiResponse = await sendMessage(text, files);
    updateMessageContent(aiMessageEl, aiResponse);
  } catch (error) {
    updateMessageContent(aiMessageEl, `**Error:** ${error.message}`);
  } finally {
    setLoadingState(false);
    resetForm();
  }
});

appendMessage("assistant", "Hello! I'm ready to help. Ask me anything or share a file to get started.");
