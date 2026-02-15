const runBtn = document.getElementById("runBtn");
const themeBtn = document.getElementById("themeBtn");
const codeInput = document.getElementById("codeInput");
const outputBox = document.getElementById("outputBox");
const rootElement = document.documentElement;

rootElement.setAttribute("data-theme", "dark");
themeBtn.textContent = "Light";

function setOutput(text, type) {
  outputBox.textContent = text;
  outputBox.classList.remove("success", "error", "neutral");
  outputBox.classList.add(type);
}

themeBtn.addEventListener("click", () => {
  const current = rootElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  rootElement.setAttribute("data-theme", next);
  themeBtn.textContent = next === "dark" ? "Light" : "Dark";
});

runBtn.addEventListener("click", async () => {
  runBtn.disabled = true;
  runBtn.classList.add("loading");

  try {
    setOutput("Running...", "neutral");

    const response = await fetch("/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: codeInput.value })
    });

    const data = await response.json();

    if (data && data.success) {
      setOutput(data.output || "(Program finished with no output)", "success");
    } else {
      const message = data && data.error ? data.error : "Execution failed";
      setOutput(message, "error");
    }
  } catch (error) {
    setOutput("Server error while executing code.", "error");
  } finally {
    runBtn.disabled = false;
    runBtn.classList.remove("loading");
  }
});
