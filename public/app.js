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

function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function renderTrack(pipeline) {
  const track = document.getElementById("pipeline-track");
  clearChildren(track);

  pipeline.forEach((env) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "env-card";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.dataset.id = env.id;
    btn.style.setProperty("--env-color", env.color);

    const short = document.createElement("span");
    short.className = "env-short";
    short.textContent = env.short;

    const title = document.createElement("h3");
    title.textContent = env.label;

    const desc = document.createElement("p");
    desc.textContent = env.description;

    btn.append(short, title, desc);
    btn.addEventListener("click", () => selectEnv(pipeline, env.id));
    track.appendChild(btn);
  });
}

function fillList(listEl, items, ordered) {
  clearChildren(listEl);
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    listEl.appendChild(li);
  });
  if (ordered) {
    listEl.setAttribute("role", "list");
  }
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
  panel.style.animation = "none";
  void panel.offsetWidth;
  panel.style.animation = "";

  badge.textContent = env.short;
  badge.style.background = `color-mix(in srgb, ${env.color} 22%, transparent)`;
  badge.style.color = env.color;
  title.textContent = env.label;
  desc.textContent = env.description;

  fillList(steps, env.steps, true);
  fillList(learn, env.learn, false);

  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderConcepts(concepts) {
  const grid = document.getElementById("concept-grid");
  clearChildren(grid);

  const items = [
    { title: "CI", body: concepts.ci },
    { title: "CD", body: concepts.cd },
    { title: "DEV → Stage → Prod", body: concepts.flow },
  ];

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "concept-card";

    const heading = document.createElement("h3");
    heading.textContent = item.title;

    const body = document.createElement("p");
    body.textContent = item.body;

    article.append(heading, body);
    grid.appendChild(article);
  });
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
