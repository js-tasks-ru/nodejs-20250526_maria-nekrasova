document.addEventListener("DOMContentLoaded", () => {
  // Check for existing token and redirect if found
  if (localStorage.getItem("token")) {
    window.location.href = "/chat.html";
    return;
  }

  const loginForm = document.getElementById("login-form");
  const githubBtn = document.querySelector(".github-btn");

  // Handle email/password login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      // Store token and redirect
      localStorage.setItem("token", data.access_token);
      window.location.href = "/chat.html";
    } catch (error) {
      alert("Login failed. Please check your credentials and try again.");
      console.error("Login error:", error);
    }
  });

  // Handle GitHub login
  githubBtn.addEventListener("click", () => {
    window.location.href = "/auth/github";
  });
});
