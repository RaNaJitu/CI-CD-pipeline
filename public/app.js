async function loadPipeline() {
  const res = await fetch("/api/pipeline");
  if (!res.ok) throw new Error("Failed to load pipeline data");
  return res.json();
}

function setLiveEnv(env) {
  const label = document.getElementById("live-env-label");
  const wrap = document.getElementById("live-env");
  label.textContent = `Running as ${env.short} · ${env.label}`;
  wrap.style.setProperty("--env-color", env.color);
  wrap.querySelector(".live-dot").style.background = env.color;
  wrap.querySelector(".live-dot").style.boxShadow = `0 0 10px ${env.color}`;
}

function renderTrack(pipeline) {
  const track = document.getElementById("pipeline-track");
  track.innerHTML = "";

  pipeline.forEach((env, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "env-card";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.dataset.id = env.id;
    btn.style.setProperty("--env-color", env.color);
    btn.innerHTML = `
      <span class="env-short">${env.short}</span>
      <h3>${env.label}</h3>
      <p>${env.description}</p>
    `;
    btn.addEventListener("click", () => selectEnv(pipeline, env.id));
    track.appendChild(btn);

    if (index === 0) {
      // default selection handled after loop
    }
  });
}

function selectEnv(pipeline, id) {
  const env = pipeline.find((p) => p.id === id);
  if (!env) return;

  document.querySelectorAll(".env-card").forEach((card) => {
    card.setAttribute("aria-selected", card.dataset.id === id ? "true" : "false");
  });

  const panel = document.getElementById("env-panel");
  const badge = document.getElementById("panel-badge");
  const title = document.getElementById("panel-title");
  const desc = document.getElementById("panel-desc");
  const steps = document.getElementById("panel-steps");
  const learn = document.getElementById("panel-learn");

  panel.hidden = false;
  // re-trigger animation
  panel.style.animation = "none";
  void panel.offsetWidth;
  panel.style.animation = "";

  badge.textContent = env.short;
  badge.style.background = `color-mix(in srgb, ${env.color} 22%, transparent)`;
  badge.style.color = env.color;
  title.textContent = env.label;
  desc.textContent = env.description;

  steps.innerHTML = env.steps.map((s) => `<li>${s}</li>`).join("");
  learn.innerHTML = env.learn.map((s) => `<li>${s}</li>`).join("");

  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderConcepts(concepts) {
  const grid = document.getElementById("concept-grid");
  const items = [
    { title: "CI", body: concepts.ci },
    { title: "CD", body: concepts.cd },
    { title: "DEV → Stage → Prod", body: concepts.flow },
  ];

  grid.innerHTML = items
    .map(
      (item) => `
      <article class="concept-card">
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </article>
    `
    )
    .join("");
}

async function init() {
  try {
    const data = await loadPipeline();
    setLiveEnv(data.currentEnv);
    renderTrack(data.pipeline);
    renderConcepts(data.concepts);
    selectEnv(data.pipeline, "dev");

    document.getElementById("btn-tour").addEventListener("click", () => {
      document.getElementById("pipeline").scrollIntoView({ behavior: "smooth" });
      selectEnv(data.pipeline, "dev");
    });

    document.getElementById("btn-concepts").addEventListener("click", () => {
      document.getElementById("concepts").scrollIntoView({ behavior: "smooth" });
    });
  } catch (err) {
    console.error(err);
    document.getElementById("live-env-label").textContent = "API unavailable";
  }
}

init();
