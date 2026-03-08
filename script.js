const STORAGE_KEY = "portfolio_projects_v1";
const CHATBOT_PROJECT_TITLE = "AI Chatbot Assistant";

const sampleProjects = [
  {
    id: crypto.randomUUID(),
    title: "Personal Dashboard",
    description: "A dashboard for tasks, weather, and daily habits.",
    tech: ["HTML", "CSS", "JavaScript"],
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    videoUrl: "",
    githubUrl: "",
    liveUrl: "",
  },
  {
    id: crypto.randomUUID(),
    title: "Game Prototype",
    description: "A quick browser game prototype with score tracking.",
    tech: ["Canvas", "JavaScript"],
    imageUrl: "",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    githubUrl: "",
    liveUrl: "",
  },
  {
    id: crypto.randomUUID(),
    title: CHATBOT_PROJECT_TITLE,
    description: "A fully functioning conversational chatbot with real-time user interaction. The chatbot is given a sarcastic and crass personality which allows it to ridicule the user in case of spelling mistakes and also allows it to deny answering a question if it is asked 3 or more times.",
    tech: ["Python", "LLM API", "UI/UX"],
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
    videoUrl: "",
    githubUrl: "",
    liveUrl: "https://ai-chatbot-backend-wr1i.onrender.com",
  },
];

let projects = loadProjects();

const projectGrid = document.getElementById("project-grid");
const projectForm = document.getElementById("project-form");
const resetBtn = document.getElementById("reset-projects");
const yearEl = document.getElementById("year");

const seeded = seedChatbotProject();
const synced = syncChatbotProjectFromSample();
if (seeded || synced) {
  saveProjects();
}

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (projectGrid) {
  renderProjects();
}

if (projectForm && projectGrid) {
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(projectForm);
    const title = String(formData.get("title") || "").trim();

    if (!title) return;

    const techList = String(formData.get("tech") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const project = {
      id: crypto.randomUUID(),
      title,
      description: String(formData.get("description") || "").trim(),
      tech: techList,
      imageUrl: String(formData.get("imageUrl") || "").trim(),
      videoUrl: String(formData.get("videoUrl") || "").trim(),
      githubUrl: String(formData.get("githubUrl") || "").trim(),
      liveUrl: String(formData.get("liveUrl") || "").trim(),
    };

    projects.unshift(project);
    saveProjects();
    renderProjects();
    projectForm.reset();
  });
}

if (resetBtn && projectGrid) {
  resetBtn.addEventListener("click", () => {
    const shouldReset = window.confirm("Reset to sample projects? This removes your saved project list.");
    if (!shouldReset) return;

    projects = structuredClone(sampleProjects);
    saveProjects();
    renderProjects();
  });
}

function loadProjects() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(sampleProjects);

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return structuredClone(sampleProjects);
    return parsed;
  } catch {
    return structuredClone(sampleProjects);
  }
}

function seedChatbotProject() {
  const alreadyExists = projects.some((project) => project.title === CHATBOT_PROJECT_TITLE);
  if (alreadyExists) return false;

  const chatbotProject = sampleProjects.find((project) => project.title === CHATBOT_PROJECT_TITLE);
  if (!chatbotProject) return false;

  projects.unshift(structuredClone(chatbotProject));
  return true;
}

function syncChatbotProjectFromSample() {
  const currentIndex = projects.findIndex((project) => project.title === CHATBOT_PROJECT_TITLE);
  if (currentIndex < 0) return false;

  const sample = sampleProjects.find((project) => project.title === CHATBOT_PROJECT_TITLE);
  if (!sample) return false;

  const current = projects[currentIndex];
  const next = {
    ...current,
    description: sample.description,
    tech: structuredClone(sample.tech),
    imageUrl: sample.imageUrl,
    liveUrl: sample.liveUrl,
  };

  const changed = JSON.stringify(current) !== JSON.stringify(next);
  if (!changed) return false;

  projects[currentIndex] = next;
  return true;
}

function normalizeChatbotUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";

  const withProtocol = /^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(raw)
    ? `http://${raw}`
    : raw;

  if (!/^https?:\/\//i.test(withProtocol)) {
    return "";
  }

  try {
    const value = new URL(withProtocol);
    return value.href;
  } catch {
    return "";
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function renderProjects() {
  if (!projectGrid) return;

  if (!projects.length) {
    projectGrid.innerHTML = '<p class="muted">No projects yet. Add one using the form above.</p>';
    return;
  }

  projectGrid.innerHTML = projects
    .map((project) => {
      const media = renderMedia(project);
      const tags = project.tech?.length
        ? `<div class="tags">${project.tech.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
        : "";

      const links = [
        project.githubUrl ? `<a href="${escapeAttr(project.githubUrl)}" target="_blank" rel="noreferrer">GitHub ↗</a>` : "",
        project.liveUrl
          ? `<a href="${escapeAttr(project.liveUrl)}" target="_blank" rel="noreferrer">${
              project.title === CHATBOT_PROJECT_TITLE ? "Chat with my AI Bot" : "Live Demo ↗"
            }</a>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `
        <article class="project-card">
          <div class="project-media">${media}</div>
          <div class="project-content">
            <h3>${escapeHtml(project.title)}</h3>
            ${project.description ? `<p>${escapeHtml(project.description)}</p>` : ""}
            ${tags}
            ${links ? `<div class="project-links">${links}</div>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMedia(project) {
  if (project.videoUrl) {
    if (isYouTube(project.videoUrl)) {
      const embed = toYouTubeEmbed(project.videoUrl);
      if (embed) {
        return `<iframe src="${escapeAttr(embed)}" title="${escapeAttr(project.title)} video" loading="lazy" allowfullscreen></iframe>`;
      }
    }

    if (isDirectVideo(project.videoUrl)) {
      return `<video controls preload="metadata" src="${escapeAttr(project.videoUrl)}"></video>`;
    }

    return `<iframe src="${escapeAttr(project.videoUrl)}" title="${escapeAttr(project.title)} video" loading="lazy" allowfullscreen></iframe>`;
  }

  if (project.imageUrl) {
    return `<img src="${escapeAttr(project.imageUrl)}" alt="${escapeAttr(project.title)} preview" loading="lazy" />`;
  }

  return `<div style="height:100%;display:grid;place-items:center;color:#91a3df;">No media</div>`;
}

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function isYouTube(url) {
  return /youtube\.com|youtu\.be/i.test(url);
}

function toYouTubeEmbed(url) {
  try {
    const value = new URL(url);

    if (value.hostname.includes("youtu.be")) {
      const id = value.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (value.hostname.includes("youtube.com")) {
      if (value.pathname === "/watch") {
        const id = value.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      if (value.pathname.startsWith("/embed/")) {
        return url;
      }
    }

    return "";
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
