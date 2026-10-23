(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Navigation */
  const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  const onScroll = () => nav.classList.toggle("solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("#menu a").forEach(a => a.addEventListener("click", () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); }));
  const links = $$("#menu a:not(.cta)");
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => io.observe(s));

  /* Hero stats (count up once on load) */
  const last = PERFORMANCE[2026];
  const stats = [
    [last.candidates, "students in 2026", 0],
    [TEACHERS.length, "teachers on staff", 0],
    [last.pass, "% pass rate", 1],
    [YEARS.length, "years on record", 0]
  ];
  $("#heroStats").innerHTML = stats.map(s => `<li><b data-v="${s[0]}" data-d="${s[2]}">0</b><span>${s[1]}</span></li>`).join("");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("#heroStats b").forEach(b => {
    const v = +b.dataset.v, d = +b.dataset.d;
    if (reduce) { b.textContent = v.toFixed(d); return; }
    const t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / 1400);
      b.textContent = (v * (1 - Math.pow(1 - p, 3))).toFixed(d);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
  const vid = $(".bg-video");
  if (reduce && vid) { vid.removeAttribute("autoplay"); vid.pause(); }

  /* Generic sortable, filterable table */
  function makeTable(opts) {
    const table = $(opts.table), body = $("tbody", table);
    let sortK = null, dir = 1;
    function render() {
      const q = $(opts.search).value.trim().toLowerCase();
      const rows = opts.rows.filter(r => opts.filter(r, q)).sort((a, b) => {
        if (!sortK) return 0;
        const x = a[sortK], y = b[sortK];
        return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * dir;
      });
      body.innerHTML = rows.length ? rows.map(opts.row).join("") : `<tr><td colspan="${$$("th", table).length}" class="empty">No records match. Clear the search or filters.</td></tr>`;
      $(opts.count).textContent = rows.length + " of " + opts.rows.length + " records";
      if (opts.after) opts.after(body);
    }
    $$("th[data-k]", table).forEach(th => {
      th.tabIndex = 0;
      const go = () => {
        const k = th.dataset.k; dir = sortK === k ? -dir : 1; sortK = k;
        $$("th", table).forEach(t => t.removeAttribute("aria-sort"));
        th.setAttribute("aria-sort", dir === 1 ? "ascending" : "descending");
        render();
      };
      th.addEventListener("click", go);
      th.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    opts.inputs.forEach(i => $(i).addEventListener("input", render));
    render();
  }

  function initRecords() {
    if (initRecords.done) return; initRecords.done = true;
  /* Teachers */
  [...new Set(TEACHERS.map(t => t.dept))].forEach(d => $("#tDept").insertAdjacentHTML("beforeend", `<option>${esc(d)}</option>`));
  makeTable({
    table: "#tTable", rows: TEACHERS, search: "#tSearch", count: "#tCount", inputs: ["#tSearch", "#tDept"],
    filter: (r, q) => (!$("#tDept").value || r.dept === $("#tDept").value) && (r.name + r.subject + r.id).toLowerCase().includes(q),
    row: t => `<tr><td>${t.id}</td><td><strong>${esc(t.name)}</strong></td><td>${esc(t.subject)}</td><td>${esc(t.dept)}</td><td>${esc(t.qual)}</td><td>${t.joined}</td><td>${esc(t.classes)}</td></tr>`
  });

  /* Students */
  [...new Set(STUDENTS.map(s => s.cls))].sort().forEach(c => $("#sClass").insertAdjacentHTML("beforeend", `<option>${c}</option>`));
  makeTable({
    table: "#sTable", rows: STUDENTS, search: "#sSearch", count: "#sCount", inputs: ["#sSearch", "#sClass", "#sGender"],
    filter: (r, q) => (!$("#sClass").value || r.cls === $("#sClass").value) && (!$("#sGender").value || r.gender === $("#sGender").value) && (r.name + r.id).toLowerCase().includes(q),
    row: s => `<tr><td>${s.id}</td><td><button class="link" data-id="${s.id}">${esc(s.name)}</button></td><td>${s.cls}</td><td>${s.gender}</td><td>${s.house}</td><td>${s.avg}%</td><td><span class="grade g${s.grade}">${s.grade}</span></td></tr>`,
    after: body => $$(".link", body).forEach(b => b.addEventListener("click", () => openStudent(b.dataset.id)))
  });

  }

  /* Student modal */
  const modal = $("#modal");
  function openStudent(id) {
    const s = STUDENTS.find(x => x.id === id);
    $("#mTitle").textContent = s.name;
    $("#mSub").textContent = `${s.id} · Class ${s.cls} · House ${s.house}`;
    const ys = Object.keys(s.hist);
    $("#mBody").innerHTML = `<table class="mini"><thead><tr><th>Year</th><th>Average</th><th></th></tr></thead><tbody>` +
      ys.map(y => `<tr><td>${y}</td><td>${s.hist[y]}%</td><td><div class="meter"><i style="width:${s.hist[y]}%"></i></div></td></tr>`).join("") + `</tbody></table>`;
    modal.hidden = false; $("#mClose").focus();
  }
  const closeModal = () => { modal.hidden = true; };
  $("#mClose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  /* Performance table */
  $("#pTable tbody").innerHTML = YEARS.map((y, i) => {
    const p = PERFORMANCE[y], prev = PERFORMANCE[YEARS[i - 1]];
    const best = SUBJECTS[p.subj.indexOf(Math.max(...p.subj))];
    const diff = prev ? (p.avg - prev.avg) : null;
    return `<tr><td><strong>${y}</strong></td><td>${p.candidates}</td><td>${p.avg}%</td><td>${p.pass}%</td><td>${p.dist}</td><td>${best}</td><td>${diff === null ? "Baseline" : `<span class="${diff >= 0 ? "up" : "down"}">${diff >= 0 ? "+" : ""}${diff.toFixed(1)} pts</span>`}</td></tr>`;
  }).join("");

  /* Year tabs + subject bars */
  const tabs = $("#yearTabs");
  tabs.innerHTML = YEARS.map(y => `<button role="tab" data-y="${y}" aria-selected="false">${y}</button>`).join("");
  function showYear(y) {
    $$("button", tabs).forEach(b => b.setAttribute("aria-selected", b.dataset.y == y));
    $("#yearTitle").textContent = "Subject averages, " + y;
    $("#bars").innerHTML = SUBJECTS.map((s, i) => `<div class="bar"><span>${s}</span><div class="track"><i style="width:0" data-w="${PERFORMANCE[y].subj[i]}"></i></div><b>${PERFORMANCE[y].subj[i]}%</b></div>`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => $$("#bars i").forEach(i => i.style.width = i.dataset.w + "%")));
  }
  tabs.addEventListener("click", e => { if (e.target.dataset.y) showYear(e.target.dataset.y); });
  showYear(2026);

  /* Trend chart (inline SVG) */
  (function () {
    const W = 640, H = 320, L = 44, R = 20, T = 20, B = 40, lo = 50, hi = 90;
    const x = i => L + i * (W - L - R) / (YEARS.length - 1);
    const y = v => T + (hi - v) * (H - T - B) / (hi - lo);
    let g = "";
    for (let v = lo; v <= hi; v += 10) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}</text>`;
    YEARS.forEach((yr, i) => g += `<text x="${x(i)}" y="${H - 14}" text-anchor="middle" class="ax">${yr}</text>`);
    const line = (key, cls) => {
      const pts = YEARS.map((yr, i) => `${x(i)},${y(PERFORMANCE[yr][key])}`).join(" ");
      return `<polyline points="${pts}" class="ln ${cls}"/>` + YEARS.map((yr, i) => `<circle cx="${x(i)}" cy="${y(PERFORMANCE[yr][key])}" r="4.5" class="dot ${cls}"><title>${yr}: ${PERFORMANCE[yr][key]}%</title></circle>`).join("");
    };
    $("#trend").innerHTML = g + line("pass", "pass") + line("avg", "avg");
  })();

  /* Gallery lightbox */
  const lb = $("#lightbox");
  $$(".gallery img").forEach(img => img.addEventListener("click", () => { $("img", lb).src = img.src; $("img", lb).alt = img.alt; lb.hidden = false; }));
  lb.addEventListener("click", () => { lb.hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { lb.hidden = true; closeModal(); } });

  /* Contact form (front-end only) */
  $("#contactForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, msg = $("#formMsg");
    if (!f.n.value.trim() || !f.m.value.trim()) { msg.textContent = "Enter your name and a message before sending."; msg.className = "form-msg err"; return; }
    msg.textContent = "Your email app should open with the message ready to send."; msg.className = "form-msg ok"; location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Message from " + f.n.value.trim()) + "&body=" + encodeURIComponent(f.m.value.trim());
  });


  /* Contacts */
  const MAIL = "peterkiiza803@gmail.com", WA = "256701959431";

  /* Admission form: opens an email, with WhatsApp as a backup */
  $("#admForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, m = $("#admMsg");
    if (!f.sname.value.trim() || !f.pname.value.trim() || !f.pphone.value.trim()) {
      m.textContent = "Enter the student’s name, the parent’s name and a phone number."; m.className = "form-msg err"; return;
    }
    const subject = "Admission application: " + f.sname.value.trim();
    const body = ["Student: " + f.sname.value.trim(), "Date of birth: " + (f.dob.value || "-"), "Sex: " + f.sex.value, "Class applying for: " + f.cls.value,
      "Previous school: " + (f.prev.value.trim() || "-"), "Parent or guardian: " + f.pname.value.trim(), "Phone: " + f.pphone.value.trim(),
      "Email: " + (f.pmail.value.trim() || "-"), "Notes: " + (f.note.value.trim() || "-")].join("\n");
    m.className = "form-msg ok";
    m.innerHTML = 'Your email app should open with the application ready to send. If it does not, <a href="https://wa.me/' + WA + '?text=' + encodeURIComponent(subject + "\n" + body) + '" target="_blank" rel="noopener">send it on WhatsApp</a>.';
    location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  /* Login. Note: this runs in the browser only, so it keeps casual visitors out
     but is not real security. See README for how to add a server. */
  const H = s => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16); };
  const ACCOUNTS = { "eb4a28089edc6820": "admin", "6187c980c10d1d86": "staff" };
  const store = { get() { try { return sessionStorage.getItem("urdt-user"); } catch (e) { return null; } }, set(v) { try { v ? sessionStorage.setItem("urdt-user", v) : sessionStorage.removeItem("urdt-user"); } catch (e) {} } };
  const lm = $("#loginModal"), lbtn = $("#loginBtn");
  function setAuth(user) {
    const on = !!user;
    $$("[data-lock]").forEach(x => x.hidden = on);
    $$(".gated").forEach(x => x.hidden = !on);
    lbtn.textContent = on ? "Log out (" + user + ")" : "Staff login";
    if (on) initRecords();
  }
  const openLogin = () => { lm.hidden = false; $("#loginForm").u.focus(); };
  const closeLogin = () => { lm.hidden = true; $("#lMsg").textContent = ""; };
  lbtn.addEventListener("click", () => { if (store.get()) { store.set(null); setAuth(null); } else openLogin(); });
  $$("[data-login]").forEach(b => b.addEventListener("click", openLogin));
  $("#lClose").addEventListener("click", closeLogin);
  lm.addEventListener("click", e => { if (e.target === lm) closeLogin(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLogin(); });
  $("#loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, user = ACCOUNTS[H(f.u.value.trim().toLowerCase() + ":" + f.p.value)];
    if (!user) { $("#lMsg").textContent = "Wrong username or password. Check both and try again."; return; }
    store.set(user); f.reset(); closeLogin(); setAuth(user);
    location.hash = "#teachers";
  });
  setAuth(store.get());

  $("#yr").textContent = new Date().getFullYear();
})();
