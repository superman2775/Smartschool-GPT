/* Copyright (c) 2026 @superman2775
 * All rights reserved.
 *
 * Permission is granted to use this script for educational purposes only.
 * Redistribution, modification, or commercial use of this code, in whole or in part,
 * is prohibited without explicit written permission from the author.
 */

(function () {
  const SS_AI_STORAGE_KEY = "ss_ai_config_v4";
  const SS_AI_SETTINGS_KEY = "ss_ai_settings_v1";

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SS_AI_SETTINGS_KEY) || "{}");
    } catch {
      return { 
        buttonText: "Assistent",
        aiStyle: "beleefd",
        saveHistory: true,
        userName: "",
        userRole: "",
        userExtra: "",
        language: "",
      };
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SS_AI_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }


  const PROVIDERS = {
    groq: {
      label: "🆓 Groq (gratis)",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "llama-3.3-70b-versatile",
      type: "openai",
      free: true,
      website: "https://console.groq.com"
    },
    google_gemini: {
      label: "🆓 Google AI Studio (gratis)",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "gemini-2.5-flash",
      type: "openai",
      free: true,
      website: "https://aistudio.google.com"
    },
      openrouter: {
      label: "🆓 OpenRouter (gratis modellen)",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "qwen/qwen-2.5-7b-instruct",
      type: "openai",
      free: true,
      website: "https://openrouter.ai"
    },
    openai: {
      label: "💰 OpenAI",
      endpoint: "https://api.openai.com/v1/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "gpt-4.1-mini",
      type: "openai",
      website: "https://platform.openai.com"
    },
    mistral: {
      label: "💰 Mistral AI",
      endpoint: "https://api.mistral.ai/v1/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "mistral-small-latest",
      type: "openai",
      website: "https://console.mistral.ai"
    },
    deepseek: {
      label: "💰 DeepSeek",
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "deepseek-chat",
      type: "openai",
      free: true,
      website: "https://platform.deepseek.com"
    },
    together: {
      label: "💰 Together AI",
      endpoint: "https://api.together.xyz/v1/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "meta-llama/Llama-3.3-70B-Instruct",
      type: "openai",
      free: true,
      website: "https://api.together.xyz"
    },
    perplexity: {
      label: "💰 Perplexity AI",
      endpoint: "https://api.perplexity.ai/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer psk-",
      defaultModel: "llama-3.1-sonar-huge-128k-online",
      type: "openai",
      website: "https://www.perplexity.ai"
    },
    xai: {
      label: "💰 xAI Grok (gratis met X Premium+)",
      endpoint: "https://api.x.ai/v1/chat/completions",
      keyHeader: "Authorization",
      keyPrefix: "Bearer ",
      defaultModel: "grok-beta",
      type: "openai",
      free: true,
      website: "https://console.x.ai"
    },
    anthropic: {
      label: "💰 Anthropic (Claude)",
      endpoint: "https://api.anthropic.com/v1/messages",
      keyHeader: "x-api-key",
      keyPrefix: "",
      defaultModel: "claude-3.5-sonnet-20240620",
      type: "anthropic",
      website: "https://console.anthropic.com"
    },
  };

  function isSmppActive() {
    try {
      const saved = JSON.parse(localStorage.getItem('smppActive') || '{}');
      return !!saved.active;
    } catch {
      return false;
    }
  }

  function getSmppThemeColors() {
    const cs = getComputedStyle(document.documentElement);
    const colorAccent = cs.getPropertyValue('--color-accent').trim();
    const colorBase01 = cs.getPropertyValue('--color-base01').trim();
    const colorBase02 = cs.getPropertyValue('--color-base02').trim();
    const colorBase03 = cs.getPropertyValue('--color-base03').trim();
    const colorText   = cs.getPropertyValue('--color-text').trim();
    return { colorAccent, colorBase01, colorBase02, colorBase03, colorText };
  }

  // use smpp colors if active, else use the ones we chose
  function resolveThemeColors() {
    if (isSmppActive()) {
      const c = getSmppThemeColors();
      if (c.colorAccent && c.colorBase02) {
        return {
          accent: c.colorAccent,
          base01: c.colorBase01 || '#ffffff',
          base02: c.colorBase02 || '#f8fafc',
          base03: c.colorBase03 || '#e5e7eb',
          text:   c.colorText   || '#111827',
        };
      }
    }

    // non smpp colors
    return {
      accent: '#ff510d',
      base01: '#ffffff',
      base02: '#ff510d',
      base03: '#e5e7eb',
      text:   '#111827',
    };
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    const topnav = document.querySelector("nav.topnav");
    if (!topnav || document.querySelector(".ss-ai-assistant-btn")) return;

    const startBtn = topnav.querySelector(".js-btn-home");
    const shortcutsWrapper = topnav.querySelector('[data-shortcuts]');
    
    if (startBtn && shortcutsWrapper) {
      const aiBtnWrapper = document.createElement("div");
      aiBtnWrapper.className = "topnav__btn-wrapper";
      
      const settings = loadSettings();

      const aiBtn = document.createElement("button");
      aiBtn.className = "topnav__btn ss-ai-assistant-btn";
      aiBtn.type = "button";
      aiBtn.textContent = settings.buttonText || "Assistent";
      aiBtn.title = "AI Assistent";

      aiBtnWrapper.appendChild(aiBtn);
      startBtn.parentNode.insertBefore(aiBtnWrapper, shortcutsWrapper);
      
      createPanel();
      aiBtn.addEventListener("click", togglePanel);
    }
  }

  function loadConfig() {
    try {
      return JSON.parse(localStorage.getItem(SS_AI_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveConfig(config) {
    try {
      localStorage.setItem(SS_AI_STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }

  function createPanel() {
    if (document.querySelector(".ss-ai-assistant-panel")) return;

    const panel = document.createElement("div");
    panel.className = "ss-ai-assistant-panel";
    document.body.appendChild(panel);

    panel.innerHTML = `
      <div class="ss-ai-header">
        <span>🤖 AI Assistent</span>
        <div class="ss-ai-header-btns">
          <button class="ss-ai-settings" title="Instellingen">⚙️</button>
          <button class="ss-ai-help" title="Help">?</button>
          <button class="ss-ai-close">×</button>
        </div>
      </div>
      
      <div class="ss-ai-body">
        <label>Provider
          <select class="ss-ai-provider"></select>
        </label>
        
        <label>Model
          <input class="ss-ai-model" placeholder="Typ model ID (bijv. llama-3.3-70b)" />
        </label>
        
        <label>API Key
          <input type="password" class="ss-ai-key" placeholder="API key voor provider" />
        </label>
        
        <p><em>De gebruiker is zelf verantwoordelijk voor zijn/haar API key en de eventuele kosten die hieraan verbonden zijn.</em></p>
        
        <button class="ss-ai-save">💾 Opslaan</button>
        
        <hr>
        
        <label>Vraag
          <textarea class="ss-ai-question" rows="3" placeholder="Stel je vraag hier..."></textarea>
        </label>
        
        <button class="ss-ai-send">🚀 Verstuur</button>
        
        <p><em>AI antwoorden kunnen fouten bevatten. Controleer belangrijke info.</em></p>

        <div class="ss-ai-status"></div>
        <div class="ss-ai-answer"></div>
      </div>
      
      <div class="ss-ai-help-panel">
        <h3>🎯 Snelle start - GRATIS providers</h3>
        
        <div class="ss-ai-help-grid">
          <div><strong>🆓 <a href="https://console.groq.com" target="_blank">Groq</a></strong><br><code>llama-3.3-70b-versatile</code> (1M tokens/dag)</div>
          <div><strong>🆓 <a href="https://aistudio.google.com" target="_blank">Google AI Studio</a></strong><br><code>gemini-2.5-flash</code> (15 RPM)</div>
          <div><strong>🆓 <a href="https://openrouter.ai" target="_blank">OpenRouter</a></strong><br><code>qwen/qwen-2.5-7b-instruct</code> or <code>meta-llama/llama-3.2-1b-instruct</code></div>
        </div>

        <h4>Gebruik:</h4>
        <ol>
          <li>Klik op een 🆓 gratis provider en maak account aan. Maak vervolgens een <strong>API key</strong> aan.</li>
          <li>Selecteer dezelfde provider in de dropdown op de homepagina.</li>
          <li>Plak de API key, kies eventueel een model ID → klik <strong>💾 Opslaan</strong></li>
          <li>Stel vraag → <strong>🚀 Verstuur</strong></li>
        </ol>
        <p><em>API keys blijven lokaal opgeslagen in je browser en kunnen dus niet bekeken worden door andere gebruikers of de eigenaar van Smartschool Assistent.</em></p>
      </div>

      <div class="ss-ai-settings-panel">
        <h3>⚙️ Instellingen</h3>
        <label>Knop tekst
          <input class="ss-ai-btn-text" placeholder="Assistent">
        </label>
        <hr>
        <label>Antwoord formulering
          <select class="ss-ai-style">
            <option value="beleefd">Beleefd/Formeel</option>
            <option value="persoonlijk">Persoonlijk/Vriendelijk</option>
            <option value="direct">Direct/Zakelijk</option>
          </select>
        </label>
        <hr>
        <label>Voorkeurstaal
          <div class="ss-ai-language-wrapper">
            <input class="ss-ai-language" placeholder="Bijv. Nederlands, English, Français">
            <p class="ss-ai-personal-note"><em>Laat leeg voor automatische taal op basis van je vraag.</em></p>
          </div>
        </label>
        <hr>
        <label>
          <input type="checkbox" class="ss-ai-history">
          <span>Gespreksgeschiedenis opslaan (Vorige 20 berichten)</span>
        </label>
        <hr>
        <label>Extra gegevens (optioneel)
          <div class="ss-ai-personal-wrapper">
            <input class="ss-ai-user-name" placeholder="Naam (bijv. Lisa)">
            <input class="ss-ai-user-role" placeholder="Rol (bijv. leerling, leraar)">
            <textarea class="ss-ai-user-extra" rows="2" placeholder="Extra info (bijv. Doe alsof je een koe bent.)"></textarea>
            <p class="ss-ai-personal-note"><em>Deze gegevens worden meegestuurd naar de AI om antwoorden te personaliseren. Invullen is volledig vrijblijvend.</em></p>
          </div>
        </label>
        <button class="ss-ai-settings-save">💾 Toepassen</button>
        <div class="ss-ai-settings-status"></div>
      </div>
    `;

    injectStyles();
    setupEventListeners(panel);
    setupDrag(panel);
  }

  function setupDrag(panel) {
    const header = panel.querySelector(".ss-ai-header");
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.ss-ai-close, .ss-ai-help')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = panel.offsetLeft;
      startTop = panel.offsetTop;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      panel.style.left = (startLeft + deltaX) + 'px';
      panel.style.top = (startTop + deltaY) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }

  function setupEventListeners(panel) {
    const cfg = loadConfig();
    const els = {
      provider: panel.querySelector(".ss-ai-provider"),
      model: panel.querySelector(".ss-ai-model"),
      key: panel.querySelector(".ss-ai-key"),
      question: panel.querySelector(".ss-ai-question"),
      status: panel.querySelector(".ss-ai-status"),
      answer: panel.querySelector(".ss-ai-answer"),
      save: panel.querySelector(".ss-ai-save"),
      send: panel.querySelector(".ss-ai-send"),
      close: panel.querySelector(".ss-ai-close"),
      help: panel.querySelector(".ss-ai-help"),
      helpPanel: panel.querySelector(".ss-ai-help-panel"),
      body: panel.querySelector(".ss-ai-body"),
      settingsBtn: panel.querySelector(".ss-ai-settings"),
      settingsPanel: panel.querySelector(".ss-ai-settings-panel"),
      btnText: panel.querySelector(".ss-ai-btn-text"),
      aiStyle: panel.querySelector(".ss-ai-style"),
      history: panel.querySelector(".ss-ai-history"),
      userName: panel.querySelector(".ss-ai-user-name"),
      userRole: panel.querySelector(".ss-ai-user-role"),
      userExtra: panel.querySelector(".ss-ai-user-extra"),
      language: panel.querySelector(".ss-ai-language"),
      settingsSave: panel.querySelector(".ss-ai-settings-save"),
      settingsStatus: panel.querySelector(".ss-ai-settings-status")
    };

    const settings = loadSettings();
    els.btnText.value = settings.buttonText || "Assistent";
    els.aiStyle.value = settings.aiStyle || "beleefd";
    els.history.checked = settings.saveHistory !== false;
    if (els.userName) els.userName.value = settings.userName || "";
    if (els.userRole) els.userRole.value = settings.userRole || "";
    if (els.userExtra) els.userExtra.value = settings.userExtra || "";
    if (els.language) els.language.value = settings.language || "";


    els.status.showError = function(msg) {
      this.textContent = `❌ ${msg}`;
      this.className = "ss-ai-status error";
    };

    Object.entries(PROVIDERS).forEach(([id, p]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = p.label;
      els.provider.appendChild(opt);
    });

    function applyProvider() {
      const id = els.provider.value;
      const p = PROVIDERS[id];
      const pcfg = cfg[id] || {};
      els.model.value = pcfg.model || p.defaultModel;
      els.key.value = pcfg.apiKey || "";
    }

    els.provider.addEventListener("change", applyProvider);
    els.provider.value = "groq";
    applyProvider();

    els.close.onclick = () => {
      panel.classList.remove("ss-ai-panel-open");
      els.body.style.display = "block";
      els.helpPanel.style.display = "none";
      els.settingsPanel.style.display = "none";
    };

    els.help.onclick = () => {
      const isHelpOpen = els.helpPanel.style.display === 'block';
      if (isHelpOpen) {
        els.helpPanel.style.display = 'none';
        els.body.style.display = 'block';
        els.settingsPanel.style.display = 'none';
      } else {
        els.body.style.display = 'none';
        els.settingsPanel.style.display = 'none';
        els.helpPanel.style.display = 'block';
      }
    };

    els.settingsBtn.onclick = () => {
      const isSettingsOpen = els.settingsPanel.style.display === 'block';
      if (isSettingsOpen) {
        els.settingsPanel.style.display = 'none';
        els.body.style.display = 'block';
      } else {
        els.body.style.display = 'none';
        els.helpPanel.style.display = 'none';
        els.settingsPanel.style.display = 'block';
      }
    };

    els.settingsSave.onclick = () => {
      const newSettings = {
        buttonText: els.btnText.value.trim() || "Assistent",
        aiStyle: els.aiStyle.value,
        saveHistory: els.history.checked,
        userName: (els.userName?.value || "").trim(),
        userRole: (els.userRole?.value || "").trim(),
        userExtra: (els.userExtra?.value || "").trim(),
        language: (els.language?.value || "").trim(),
      };
      saveSettings(newSettings);
      els.settingsStatus.textContent = "✅ Instellingen opgeslagen";
      els.settingsStatus.className = "ss-ai-status ok";

      const btn = document.querySelector(".ss-ai-assistant-btn");
      if (btn) btn.textContent = newSettings.buttonText;
    };

    els.save.onclick = () => {
      const id = els.provider.value;
      cfg[id] = {
        apiKey: els.key.value.trim(),
        model: els.model.value.trim()
      };
      saveConfig(cfg);
      els.status.textContent = "✅ Opgeslagen";
      els.status.className = "ss-ai-status ok";
    };

    els.send.onclick = async () => {
      const id = els.provider.value;
      const p = PROVIDERS[id];
      const key = els.key.value.trim() || cfg[id]?.apiKey;
      const model = els.model.value.trim() || p.defaultModel;
      const question = els.question.value.trim();

      const currentSettings = loadSettings();
      const style = currentSettings.aiStyle || "beleefd";

      const language = (currentSettings.language || "").trim();
      const languageText = language
        ? `Beantwoord altijd in de volgende taal, tenzij de gebruiker expliciet iets anders vraagt: ${language}.`
        : "";

      const personalContextParts = [];
        if (currentSettings.userName) {
          personalContextParts.push(`De gebruiker heet ${currentSettings.userName}.`);
        }
        if (currentSettings.userRole) {
          personalContextParts.push(`De gebruiker is een ${currentSettings.userRole}.`);
        }
        if (currentSettings.userExtra) {
          personalContextParts.push(`Extra info over hoe je je moet gedragen/wat je moet weten: ${currentSettings.userExtra}.`);
        }
        const personalContext = personalContextParts.length
          ? `\n\nPersoonlijke context gebruiker (voor jou als AI): ${personalContextParts.join(" ")}`
          : "";


      const styleText =
        style === "beleefd"
          ? "Gebruik een beleefde, rustige schrijfstijl zoals een behulpzaam persoon. Gebruik 'u' en 'jij' waar passend in de context. Stel amper vragen terug. Werk met voorbeelden en structuur aan de hand van de behoeften van de gebruiker."
          : style === "persoonlijk"
          ? "Schrijf informeel en persoonlijk, met 'je' en 'jou'. Gebruik emoji's waar passend. Stel regelmatig vragen terug, maar niet meer dan 2. Wees vriendelijk en behulpzaam, zoals een goede vriend die je wil helpen. Gebruik voorbeelden en anekdotes om je antwoorden te verduidelijken."
          : "Schrijf direct en zakelijk, zonder overbodige uitleg. Focus op kerninformatie. Werk gestructureerd en puntsgewijs waar mogelijk. Stel geen vragen terug aan de gebruiker. Gebruik geen emoji's.";

      const styledQuestion = `${question}\n\n${styleText}${languageText ? " " + languageText : ""}${personalContext}`;

      let historyMessages = [];
        if (currentSettings.saveHistory) {
          try {
            const hist = JSON.parse(localStorage.getItem("ss_ai_history") || "[]");
            // laatste paar berichten meesturen als context
            historyMessages = hist.slice(0, 5).map(item => ({
              role: "user",
              content: `Vorige vraag: ${item.q}\nJouw antwoord was: ${item.a}`
            }));
          } catch {}
        }

      if (!question) return els.status.showError("Geen vraag");
      if (p.keyHeader && !key) return els.status.showError("Geen API key");

      els.status.textContent = "⏳ Versturen...";
      els.status.className = "ss-ai-status loading";
      els.answer.textContent = "";

      try {
        const headers = { "Content-Type": "application/json" };
        if (p.keyHeader) headers[p.keyHeader] = p.keyPrefix + key;

        const resp = await fetch(p.endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages: [
              ...historyMessages,
              { role: "user", content: styledQuestion }
            ]
          })
        });

        if (!resp.ok) throw new Error(`${resp.status}`);
        
        const data = await resp.json();
        els.answer.textContent = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);
        els.status.textContent = "✅ Klaar";
        els.status.className = "ss-ai-status ok";
          if (currentSettings.saveHistory) {
            try {
              const hist = JSON.parse(localStorage.getItem("ss_ai_history") || "[]");
              hist.unshift({
                q: question,
                a: els.answer.textContent,
                t: Date.now()
              });
              localStorage.setItem("ss_ai_history", JSON.stringify(hist.slice(0, 20)));
            } catch {}
          }
      } catch (e) {
        els.status.textContent = `❌ Fout: ${e.message}`;
        els.status.className = "ss-ai-status error";
      }
    };
  }

  function togglePanel() {
    const panel = document.querySelector(".ss-ai-assistant-panel");
    panel?.classList.toggle("ss-ai-panel-open");
  }

  function injectStyles() {
    if (document.getElementById("ss-ai-styles")) return;

    const theme = resolveThemeColors();

    const style = document.createElement("style");
    style.id = "ss-ai-styles";
    style.textContent = `
      .ss-ai-assistant-panel {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 450px;
        max-height: 80vh;
        background: var(--color-base01, ${theme.base01});
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10000;
        display: none;
        flex-direction: column;
        font-family: system-ui, sans-serif;
        border: 1px solid var(--color-base03, ${theme.base03});
        color: var(--color-text, ${theme.text});
      }

      .ss-ai-panel-open {
        display: flex;
      }

      .ss-ai-header {
        background: var(--color-base02, ${theme.base02});
        color: var(--color-text, ${theme.text});
        padding: 12px 16px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        cursor: grab;
        user-select: none;
      }

      .ss-ai-header:active {
        cursor: grabbing;
      }

      .ss-ai-header-btns {
        display: flex;
        gap: 8px;
      }

      .ss-ai-close,
      .ss-ai-help,
      .ss-ai-settings {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .ss-ai-close:hover,
      .ss-ai-help:hover,
      .ss-ai-settings:hover {
        background: rgba(255,255,255,0.2);
      }

      .ss-ai-body {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
        display: block;
        background: var(--color-base01, ${theme.base01});
        color: var(--color-text, ${theme.text});
      }

      .ss-ai-help-panel {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: none;
        background: var(--color-base01, ${theme.base01});
        border-top: 1px solid var(--color-base03, ${theme.base03});
        color: var(--color-text, ${theme.text});
      }

      .ss-ai-help-panel h3 {
        margin: 0 0 16px;
        color: var(--color-text, ${theme.text});
        font-size: 16px;
      }

      .ss-ai-help-panel h4 {
        margin: 20px 0 12px;
        color: var(--color-text, ${theme.text});
      }

      .ss-ai-help-grid {
        display: grid;
        gap: 12px;
        margin-bottom: 20px;
        font-size: 13px;
      }

      .ss-ai-help-grid div {
        padding: 12px;
        background: var(--color-base01, ${theme.base01});
        border-radius: 8px;
        border-left: 4px solid var(--color-accent, ${theme.accent});
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }

      .ss-ai-help-grid a {
        color: var(--color-accent, ${theme.accent});
        text-decoration: none;
        font-weight: 500;
      }

      .ss-ai-help-grid a:hover {
        text-decoration: underline;
      }

      .ss-ai-help-grid code {
        background: #1f2937;
        color: #a5b4fc;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Courier New', monospace;
      }

      .ss-ai-help-panel ol {
        margin: 12px 0;
        padding-left: 24px;
      }

      .ss-ai-help-panel li {
        margin-bottom: 8px;
        font-size: 13px;
      }

      .ss-ai-help-panel p {
        margin: 12px 0;
        font-size: 13px;
        color: #6b7280;
      }

      .ss-ai-body label {
        display: block;
        margin-bottom: 10px;
        font-size: 13px;
      }

      .ss-ai-body input,
      .ss-ai-body select,
      .ss-ai-body textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        margin-top: 4px;
        background: var(--color-base01, ${theme.base01});
        color: var(--color-text, ${theme.text});
      }

      .ss-ai-body input:focus,
      .ss-ai-body select:focus,
      .ss-ai-body textarea:focus {
        outline: none;
        border-color: var(--color-accent, ${theme.accent});
        box-shadow: 0 0 0 2px rgba(102,126,234,0.2);
      }

      .ss-ai-save,
      .ss-ai-send {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 8px;
      }

      .ss-ai-save {
        background: #10b981;
        color: #ffffff;
      }

      .ss-ai-send {
        background: var(--color-base02, ${theme.base02});
        color: #ffffff;
      }

      .ss-ai-save:hover {
        background: #059669;
      }

      .ss-ai-send:hover {
        background: #2563eb;
      }

      .ss-ai-status {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        margin: 8px 0;
        font-weight: 500;
      }

      .ss-ai-status.ok {
        background: #d1fae5;
        color: #065f46;
      }

      .ss-ai-status.error {
        background: #fee2e2;
        color: #991b1b;
      }

      .ss-ai-status.loading {
        background: #fef3c7;
        color: #92400e;
      }

      .ss-ai-answer {
        background: var(--color-base03, ${theme.base03});
        border-radius: 6px;
        padding: 16px;
        font-size: 13px;
        max-height: 220px;
        overflow-y: auto;
        white-space: pre-wrap;
        line-height: 1.6;
        border-left: 4px solid var(--color-accent, ${theme.accent});
        color: var(--color-text, ${theme.text});
      }

      hr {
        border: none;
        height: 1px;
        background: #e5e7eb;
        margin: 16px 0;
      }

      /* Topnav button */
      .ss-ai-assistant-btn {
        background: var(--color-accent, ${theme.accent});
        color: #ffffff;
        border: 1px solid var(--color-accent, ${theme.accent});
        padding: 10px 16px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .ss-ai-assistant-btn:active {
        background: var(--color-accent, ${theme.accent});
        transform: translateY(0);
      }

      /* Settings panel */
      .ss-ai-settings-panel {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: none;
        background: var(--color-base01, ${theme.base01});
        border-top: 1px solid var(--color-base03, ${theme.base03});
        color: var(--color-text, ${theme.text});
      }

      .ss-ai-settings-panel h3 {
        margin: 0 0 16px;
        color: var(--color-text, ${theme.text});
        font-size: 16px;
      }

      .ss-ai-settings-panel label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 13px;
      }

      .ss-ai-settings-panel input[type="checkbox"] {
        width: auto;
        margin-top: 2px;
      }

      .ss-ai-settings-panel span {
        flex: 1;
      }

      .ss-ai-settings-panel input,
      .ss-ai-settings-panel select {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        margin-top: 4px;
        background: var(--color-base01, ${theme.base01});
        color: var(--color-text, ${theme.text});
      }

      .ss-ai-settings-save {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 4px;
        background: #f59e0b;
        color: #ffffff;
      }

      .ss-ai-settings-save:hover {
        background: #d97706;
      }

      .ss-ai-settings-status {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        margin-top: 8px;
      }

      .ss-ai-personal-wrapper {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
      }

      .ss-ai-personal-wrapper input,
      .ss-ai-personal-wrapper textarea {
        width: 100%;
      }

      .ss-ai-personal-note {
        margin: 4px 0 0;
        font-size: 11px;
        color: #6b7280;
      }
    `;
    document.head.appendChild(style);
  }
})();
