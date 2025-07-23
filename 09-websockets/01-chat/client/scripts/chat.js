document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  let currentUser;

  try {
    const response = await fetch("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }
      throw new Error("Failed to fetch profile");
    }

    currentUser = await response.json();
    document.getElementById("username-display").textContent =
      currentUser.username;
  } catch (error) {
    console.error("Profile fetch error:", error);
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  const socket = io("http://localhost:3000", {
    auth: { token },
  });

  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.getElementById("messages");
  const messageInput = document.getElementById("msg");

  try {
    const response = await fetch("/chat/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const messages = await response.json();
      for (const message of messages) {
        outputMessage(message);
      }
    }
  } catch (error) {
    console.error("History fetch error:", error);
  }

  socket.on("connect_error", (error) => {
    if (error.message === "auth error") {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  });

  socket.on("message", (message) => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (!msg) return;

    socket.emit("chatMessage", {
      username: currentUser.displayName,
      text: msg,
    });

    messageInput.value = "";
    messageInput.focus();
  });

  function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");

    if (message.username === "System") {
      div.classList.add("system");
    } else if (message.username === currentUser.username) {
      div.classList.add("outgoing");
    } else {
      div.classList.add("incoming");
    }

    const time = new Date(message.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    div.innerHTML = `
                    <div class="meta">
                        ${message.username ? `<span>${message.username}</span> •` : ""} 
                        <span>${time}</span>
                    </div>
                    <p class="text">${message.text}</p>
                `;

    chatMessages.appendChild(div);
  }
});
