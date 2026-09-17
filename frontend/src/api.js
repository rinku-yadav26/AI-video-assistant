const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.error || "Something went wrong");
  }

  return data;
}

export async function analyzeUrl(source, language) {
  return request("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, language }),
  });
}

export async function analyzeFile(file, language) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  return request("/api/analyze-file", {
    method: "POST",
    body: formData,
  });
}

export async function askQuestion(question) {
  return request("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
}