(() => {
  "use strict";

  // ---------- dom ----------
  const $ = (id) => document.getElementById(id);
  const tickerEl = $("ticker"), elapsedEl = $("elapsed"), burnEl = $("burnRate"),
        peopleEl = $("peopleCount"), witEl = $("wit"),
        titleEl = $("title"), participantsEl = $("participants"),
        currencyEl = $("currency"), rateEl = $("rate"),
        startPauseBtn = $("startPause"), resetBtn = $("reset"),
        shareCard = $("shareCard"), reportEl = $("report"),
        shareBtn = $("share"), copyBtn = $("copy"), copyHint = $("copyHint");

  // ---------- state ----------
  const state = {
    running: false,
    startedAt: 0,      // timestamp when the current run segment began
    elapsedMs: 0,      // accumulated ms before the current segment
    timerId: null,
  };

  const WIT_LINES = [
    [0,       "press start. watch money evaporate."],
    [1,       "that's a coffee. keep going."],
    [50,      "that's lunch for the team."],
    [200,     "a decent dinner. still in the meeting."],
    [500,     "a weekend getaway just burned."],
    [1500,    "a used laptop. gone."],
    [5000,    "this could have funded a small hackathon."],
    [15000,   "someone's monthly salary just evaporated."],
    [50000,   "you could have hired a person for this."],
    [150000,  "congratulations, you bought a car. in a meeting."],
  ];

  // Rough USD value of one unit, for the coffee equivalent. Approximate.
  const TO_USD = { IDR: 1/16200, USD: 1, EUR: 1.08, GBP: 1.27, JPY: 1/149,
                   SGD: 0.74, AUD: 0.66, MYR: 0.21, INR: 0.012, PHP: 0.017 };

  // ---------- helpers ----------
  const cfg = () => ({
    title: titleEl.value.trim(),
    participants: Math.max(1, parseInt(participantsEl.value, 10) || 1),
    currency: currencyEl.value,
    rate: Math.max(0, parseFloat(rateEl.value) || 0),
  });

  const fmt = (amount, currency) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency", currency, maximumFractionDigits: amount < 100 ? 2 : 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const pad = (n) => String(n).padStart(2, "0");
  const fmtElapsed = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };

  const elapsedNow = () =>
    state.elapsedMs + (state.running ? Date.now() - state.startedAt : 0);

  const costNow = () => {
    const c = cfg();
    return (elapsedNow() / 3_600_000) * c.participants * c.rate;
  };

  const coffees = (costUsd) => Math.floor(costUsd / 5);

  function witFor(costUsd) {
    let line = WIT_LINES[0][1];
    for (const [threshold, text] of WIT_LINES) {
      if (costUsd >= threshold) line = text;
    }
    return line;
  }

  // ---------- render ----------
  function render() {
    const c = cfg();
    const cost = costNow();
    const costUsd = cost * (TO_USD[c.currency] ?? 1);

    tickerEl.textContent = fmt(cost, c.currency);
    elapsedEl.textContent = fmtElapsed(elapsedNow());
    burnEl.textContent = `${fmt(c.participants * c.rate / 60, c.currency)}/min`;
    peopleEl.textContent = c.participants;
    witEl.textContent = witFor(costUsd);

    const showReport = !state.running && elapsedNow() > 0;
    shareCard.hidden = !showReport;
    if (showReport) {
      const name = c.title ? ` “${c.title}”` : "";
      const cups = coffees(costUsd);
      reportEl.innerHTML =
        `This${name} meeting with <strong>${c.participants} people</strong> ` +
        `lasted <strong>${fmtElapsed(elapsedNow())}</strong> and cost ` +
        `<strong>${fmt(cost, c.currency)}</strong>` +
        (cups >= 1 ? ` — that's <strong>${cups}</strong> cups of coffee.` : ".") +
        ` It could have been an email.`;
    }
  }

  // ---------- controls ----------
  function start() {
    state.running = true;
    state.startedAt = Date.now();
    tickerEl.classList.add("running");
    startPauseBtn.textContent = "pause";
    startPauseBtn.classList.add("pause");
    state.timerId = setInterval(render, 250);
    render();
  }

  function pause() {
    state.elapsedMs = elapsedNow();
    state.running = false;
    clearInterval(state.timerId);
    tickerEl.classList.remove("running");
    startPauseBtn.textContent = state.elapsedMs > 0 ? "resume" : "start";
    startPauseBtn.classList.remove("pause");
    render();
  }

  startPauseBtn.addEventListener("click", () => (state.running ? pause() : start()));

  resetBtn.addEventListener("click", () => {
    if (state.running) pause();
    state.elapsedMs = 0;
    startPauseBtn.textContent = "start";
    render();
  });

  // ---------- share ----------
  const shareText = () => reportEl.textContent;

  shareBtn.addEventListener("click", async () => {
    const text = shareText();
    if (navigator.share) {
      try { await navigator.share({ title: "meetingmeter", text }); return; }
      catch { /* user dismissed — fall through to copy */ }
    }
    await copyText(text);
  });

  copyBtn.addEventListener("click", () => copyText(shareText()));

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    copyHint.hidden = false;
    setTimeout(() => (copyHint.hidden = true), 2000);
  }

  // ---------- persistence ----------
  const KEY = "meetingmeter.cfg.v1";
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        t: titleEl.value, p: participantsEl.value,
        c: currencyEl.value, r: rateEl.value,
      }));
    } catch { /* private mode — ignore */ }
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!s) return;
      titleEl.value = s.t ?? "";
      participantsEl.value = s.p ?? 4;
      currencyEl.value = s.c ?? "IDR";
      rateEl.value = s.r ?? 150000;
    } catch { /* ignore */ }
  }
  [titleEl, participantsEl, currencyEl, rateEl].forEach((el) =>
    el.addEventListener("input", () => { save(); render(); })
  );

  // ---------- init ----------
  load();
  render();
})();
