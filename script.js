/* =========================================================================
   Efromatika · script.js
   Semua logika aplikasi: routing, autentikasi, komdis, mentor, sinkronisasi
   ke Google Spreadsheet lewat Apps Script.
   ========================================================================= */

/* ---------------------------------------------------------------------
   0. KONFIGURASI — SESUAIKAN BAGIAN INI
   --------------------------------------------------------------------- */

// URL Web App hasil deploy Google Apps Script (lihat apps-script/Code.gs
// dan README.md untuk cara deploy).
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXgDTcQ_bjX8d22_xI2_eN-sXbyeAz1OSgIpHmgPU1zaWOc6UpWzQKgTxhcMtweRCsCQ/exec";

// Email yang tidak boleh login sama sekali.
const blacklist = [ ];

// Email yang boleh membuka menu Penilaian Komdis.
const komdis_account = [ "admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'fazri.komdis@efro.id', 'mdaffa.komdis@efro.id', 'porman.komdis@efro.id', 'primsa.komdis@efro.id', 'nazwa.komdis@efro.id', 'annisa.komdis@efro.id', 'astri.komdis@efro.id' ];

// Email yang boleh membuka menu Penilaian Mentor.
const mentor_account = [ "admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'amelia.mentor@efro.id', 'herviana.mentor@efro.id', 'theresia.mentor@efro.id', 'shintia.mentor@efro.id', 'aniela.mentor@efro.id', 'winda.mentor@efro.id', 'asyita.mentor@efro.id', 'anatasya.mentor@efro.id' ];

// Komdis per kelompok: hanya email di dalam array boleh membuka kelompok itu.
const komdis_group = {
  1: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'primsa.komdis@efro.id'],
  2: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'mdaffa.komdis@efro.id'],
  3: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'fazri.komdis@efro.id'],
  4: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'porman.komdis@efro.id'],
  5: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'annisa.komdis@efro.id'],
  6: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'astri.komdis@efro.id'],
  7: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'nazwa.komdis@efro.id']
};

// Mentor per kelompok: hanya email di dalam array boleh membuka kelompok itu.
const mentor_group = {
  1: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'asyita.mentor@efro.id'],
  2: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'theresia.mentor@efro.id'],
  3: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'anatasya.mentor@efro.id'],
  4: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'shintia.mentor@efro.id'],
  5: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'herviana.mentor@efro.id'],
  6: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'aniela.mentor@efro.id'],
  7: ["admin@efro.id", 'dipa.subdep@efro.id', 'annisa.subdep@efro.id', 'ropaska.subdep@efro.id', 'daniel.subdep@efro.id', 'boy.subdep@efro.id', 'winda.mentor@efro.id']
};

// Daftar peserta. Format: NIM -> { name, group }
const catra = {
  "125160001": { name: "KHAYLA AZIZAH RAHMAN", group: 5 },
  "125160002": { name: "DELLA AULIA NUR SAFITRI", group: 5 },
  "125160003": { name: "ROSSA INOVA DA SILVA", group: 5 },
  "125160004": { name: "SALSA TIARA SEPRIANI", group: 5 },
  "125160005": { name: "M. ILHAM AL FAJRI", group: 7 },
  "125160006": { name: "VERA DWI APRILIA", group: 6 },
  "125160007": { name: "FAUZIAH AULIA FADILA", group: 4 },
  "125160008": { name: "KAYSA JULIETA PUSPITA", group: 6 },
  "125160009": { name: "SEPIA ANGGUN SAPUTRI", group: 3 },
  "125160010": { name: "ANABEL NOVELINA MANURUNG", group: 4 },
  "125160011": { name: "RIRIN MARCELINA MANURUNG", group: 2 },
  "125160012": { name: "SOPIA PAKPAHAN", group: 3 },
  "125160013": { name: "THESSA MINARIA LUMBAN SIANTAR", group: 2 },
  "125160014": { name: "DAMAR SAPUTRA", group: 4 },
  "125160015": { name: "RENDI ARIANTO SIHOTANG", group: 6 },
  "125160017": { name: "SELVIA TIA IVANKA", group: 1 },
  "125160018": { name: "ALDI EKO PURNAMA", group: 4 },
  "125160019": { name: "RAMA ADITIYA", group: 5 },
  "125160020": { name: "SABILA ALLISYA PUTRI", group: 2 },
  "125160022": { name: "LAURA NIVOLIN", group: 4 },
  "125160023": { name: "RIKA RAHAYU", group: 3 },
  "125160024": { name: "HANI SAFIRA BELA", group: 5 },
  "125160025": { name: "SUCI NAYLA SYIFA", group: 1 },
  "125160026": { name: "ALIFIA INDAH PRATIWI", group: 3 },
  "125160027": { name: "NORA JESICA SEPTIANI SIMATUPANG", group: 7 },
  "125160028": { name: "ALDO FEBRIANSYAH", group: 1 },
  "125160029": { name: "RT. DEWI LAILATUL UMANIYYAH", group: 7 },
  "125160030": { name: "NURUL FITRIYANI", group: 5 },
  "125160031": { name: "MIYA ARINI DAMANIK", group: 6 },
  "125160032": { name: "BIMA ALANDIKA", group: 1 },
  "125160034": { name: "OLDA EYUNIKE SIAHAAN", group: 7 },
  "125160035": { name: "GEBI MASRIDA NABABAN", group: 6 },
  "125160036": { name: "JOSUA FRANSISCO SITUMEANG", group: 3 },
  "125160037": { name: "GRACE THEODORA NATALINA MANURUNG", group: 3 },
  "125160038": { name: "DHEA AMELIA", group: 1 },
  "125160039": { name: "JULIUS SIMAMORA", group: 5 },
  "125160040": { name: "FAZLUR YAZID", group: 1 },
  "125160041": { name: "HILARIUS JANNOELTA TARIGAN GIRSANG", group: 3 },
  "125160042": { name: "YULY FLOWER SIREGAR", group: 7 },
  "125160043": { name: "PRISCILLA SYALOMITA GINTING", group: 6 },
  "125160044": { name: "SYAHIRA LULU RAMADHANI", group: 1 },
  "125160045": { name: "KHOIRUNNISAA GHASSANI PUTRI", group: 7 },
  "125160046": { name: "AZWA ARDIYANTI AMDIAH", group: 6 },
  "125160047": { name: "BINTANG XERREND VERIXA", group: 7 },
  "125160048": { name: "ALDI KURNIAWAN", group: 2 },
  "125160049": { name: "ARINDYA SALSABILA AYU", group: 2 },
  "125160050": { name: "FARA DWI YUSDITA", group: 6 },
  "125160051": { name: "ZATMIATY", group: 2 },
  "125160052": { name: "LAUREN AULIA RAMONA", group: 4 },
  "125160053": { name: "GRACE RADOTIMA SIMANJUNTAK", group: 5 },
  "125160054": { name: "MAZMUR SILAEN", group: 6 },
  "125160055": { name: "YODHA IDMONIA RAZAN", group: 3 },
  "125160056": { name: "PUTRI LESTARI", group: 4 },
  "125160059": { name: "HESTI SAKINATUN", group: 2 },
  "125160060": { name: "JOYANTI GULTOM", group: 4 },
  "125160061": { name: "RACHEL OLANDA ELIZABETH SITINJAK", group: 4 },
  "125160062": { name: "DESYA CANTIKA ANGGRAINI", group: 3 },
  "125160063": { name: "NAYLA NUR AZIZAH", group: 6 },
  "125160064": { name: "WAHYU AKBAR FAJARI", group: 6 },
  "125160065": { name: "TIARA SINAGA", group: 3 },
  "125160066": { name: "SINKY DWI SARI TAMSAR", group: 3 },
  "125160067": { name: "ULI MUSLIHAH", group: 2 },
  "125160068": { name: "MARWA NADYA HASANAH", group: 1 },
  "125160070": { name: "M.RIFQI SAIFULLAH", group: 2 },
  "125160071": { name: "WULAN PANCAWATI", group: 2 },
  "125160072": { name: "SILVA NOVITASARI", group: 7 },
  "125160073": { name: "ANA ESTIANI", group: 4 },
  "125160074": { name: "HERTY ROMAITO HABEAHAN", group: 7 },
  "125160075": { name: "AURA RAHMA AZKYA PUTRI", group: 1 },
  "125160076": { name: "NURMALA SAFITRI", group: 4 },
  "125160077": { name: "ELISA ANGGRAINI", group: 7 },
  "125160078": { name: "YUKO GERARD EDRA PANJAITAN", group: 7 },
  "125160079": { name: "RAMASARI HASIBUAN", group: 1 },
  "125160080": { name: "RIZA TRIANDINI", group: 5 },
  "125160081": { name: "M.RASYA AGUSTIAN", group: 2 },
  "125160082": { name: "VIZKA AKDITYA", group: 5 },
  "125160083": { name: "FELECIA LIDWINA BR SINAGA", group: 1 }
};

const MEETING_COUNT = 10;
const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 menit

/* ---------------------------------------------------------------------
   1. STATE
   --------------------------------------------------------------------- */

const state = {
  user: null,           // { email }
  route: { name: "home" },
  violationsCache: {},  // group -> { rows... } loaded from sheet
  mentorCache: {}       // "group-meeting" -> rows loaded from sheet
};

const groupsOf = (obj, email) =>
  Object.keys(obj).filter((g) => (obj[g] || []).includes(email)).map(Number);

const allGroupNumbers = () =>
  [...new Set(Object.values(catra).map((p) => p.group))].sort((a, b) => a - b);

const participantsInGroup = (g) =>
  Object.entries(catra)
    .filter(([, p]) => p.group === Number(g))
    .map(([nim, p]) => ({ nim, ...p }))
    .sort((a, b) => a.name.localeCompare(b.name));

/* ---------------------------------------------------------------------
   2. TEMA (dark / light)
   --------------------------------------------------------------------- */

function initTheme() {
  const saved = localStorage.getItem("efro-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved ? saved === "dark" : prefersDark;
  document.documentElement.classList.toggle("dark", isDark);
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  document.getElementById("iconSun").classList.toggle("hidden", !isDark);
  document.getElementById("iconMoon").classList.toggle("hidden", isDark);
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("efro-theme", isDark ? "dark" : "light");
  updateThemeIcon(isDark);
});

/* ---------------------------------------------------------------------
   3. TOAST
   --------------------------------------------------------------------- */

let toastTimer = null;
function toast(msg, kind = "default") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove(
    "border-red-600", "text-red-700", "border-ink-900", "text-ink-900",
    "border-green-600", "text-green-700"
  );
  if (kind === "error") el.classList.add("border-red-600", "text-red-700");
  else if (kind === "success") el.classList.add("border-green-600", "text-green-700");
  else el.classList.add("border-ink-900", "text-ink-900");

  el.classList.remove("opacity-0", "pointer-events-none");
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.add("opacity-0", "pointer-events-none");
    el.classList.remove("show");
  }, 3200);
}

/* ---------------------------------------------------------------------
   4. IDLE / AUTO-LOGOUT (5 menit tanpa interaksi)
   --------------------------------------------------------------------- */

let idleTimer = null;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (!state.user) return;
  idleTimer = setTimeout(async () => {
    toast("Sesi berakhir karena tidak ada aktivitas.", "error");
    await doLogout();
  }, IDLE_LIMIT_MS);
}
["click", "keydown", "mousemove", "touchstart", "scroll"].forEach((evt) =>
  window.addEventListener(evt, () => resetIdleTimer(), { passive: true })
);

/* ---------------------------------------------------------------------
   5. AUTH
   --------------------------------------------------------------------- */

function waitForFirebase() {
  return new Promise((resolve) => {
    if (window.FB && window.FB.ready) return resolve();
    window.addEventListener("fb-ready", () => resolve(), { once: true });
  });
}

async function doLogin(email, password) {
  if (blacklist.includes(email.trim().toLowerCase())) {
    throw new Error("Akun ini tidak diizinkan untuk masuk.");
  }
  await window.FB.signIn(email.trim(), password);
}

async function doLogout() {
  try {
    await window.FB.signOutUser();
  } catch (e) {
    console.error(e);
  }
  state.user = null;
  navigate({ name: "login" });
}

/* ---------------------------------------------------------------------
   6. ROUTER / RENDER
   --------------------------------------------------------------------- */

const appEl = document.getElementById("app");

function clone(tplId) {
  return document.getElementById(tplId).content.cloneNode(true);
}

function navigate(route) {
  state.route = route;
  render();
}

function render() {
  if (!state.user) {
    renderLogin();
    return;
  }
  renderShell();
}

function renderLoading() {
  appEl.innerHTML = "";
  appEl.appendChild(clone("tpl-loading"));
}

function renderLogin() {
  appEl.innerHTML = "";
  appEl.appendChild(clone("tpl-login"));

  const form = document.getElementById("loginForm");
  const errEl = document.getElementById("loginError");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.classList.add("hidden");
    const btn = document.getElementById("loginSubmit");
    btn.disabled = true;
    btn.textContent = "Memeriksa…";
    try {
      await doLogin(
        document.getElementById("loginEmail").value,
        document.getElementById("loginPassword").value
      );
      // onAuthChange listener will pick this up and re-render.
    } catch (err) {
      errEl.textContent = friendlyAuthError(err);
      errEl.classList.remove("hidden");
      btn.disabled = false;
      btn.textContent = "Masuk";
    }
  });
}

function friendlyAuthError(err) {
  const msg = String(err && err.message || err);
  if (msg.includes("tidak diizinkan")) return msg;
  if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
    return "Email atau kata sandi salah.";
  }
  if (msg.includes("auth/too-many-requests")) return "Terlalu banyak percobaan. Coba lagi nanti.";
  if (msg.includes("auth/invalid-email")) return "Format email tidak valid.";
  return "Gagal masuk. Coba lagi.";
}

function renderShell() {
  appEl.innerHTML = "";
  appEl.appendChild(clone("tpl-shell"));

  document.getElementById("userEmail").textContent = state.user.email;
  document.getElementById("logoutBtn").addEventListener("click", doLogout);
  document.getElementById("brandHome").addEventListener("click", () => navigate({ name: "home" }));

  const isKomdis = komdis_account.includes(state.user.email);
  const isMentor = mentor_account.includes(state.user.email);
  const badge = document.getElementById("roleBadge");
  if (isKomdis && isMentor) badge.textContent = "Komdis · Mentor";
  else if (isKomdis) badge.textContent = "Komdis";
  else if (isMentor) badge.textContent = "Mentor";
  else badge.textContent = "Peserta";

  renderMain();
}

function renderMain() {
  const main = document.getElementById("mainView");
  main.innerHTML = "";

  const r = state.route;
  const isKomdis = komdis_account.includes(state.user.email);
  const isMentor = mentor_account.includes(state.user.email);

  if (r.name === "home") return renderHome(main, isKomdis, isMentor);
  if (r.name === "komdis-groups") {
    if (!isKomdis) return renderForbidden(main);
    return renderKomdisGroups(main);
  }
  if (r.name === "komdis-table") {
    if (!isKomdis || !groupsOf(komdis_group, state.user.email).includes(Number(r.group))) {
      return renderForbidden(main);
    }
    return renderKomdisTable(main, Number(r.group));
  }
  if (r.name === "mentor-groups") {
    if (!isMentor) return renderForbidden(main);
    return renderMentorGroups(main);
  }
  if (r.name === "mentor-meetings") {
    if (!isMentor || !groupsOf(mentor_group, state.user.email).includes(Number(r.group))) {
      return renderForbidden(main);
    }
    return renderMentorMeetings(main, Number(r.group));
  }
  if (r.name === "mentor-table") {
    if (!isMentor || !groupsOf(mentor_group, state.user.email).includes(Number(r.group))) {
      return renderForbidden(main);
    }
    return renderMentorTable(main, Number(r.group), Number(r.meeting));
  }
  renderHome(main, isKomdis, isMentor);
}

function renderForbidden(main) {
  main.appendChild(clone("tpl-forbidden"));
}

/* ---------------------------------------------------------------------
   7. HOME
   --------------------------------------------------------------------- */

function renderHome(main, isKomdis, isMentor) {
  main.appendChild(clone("tpl-home"));
  const cards = document.getElementById("homeCards");

  const cardHtml = (title, desc, disabled, onClick, tag) => {
    const div = document.createElement("div");
    div.className = `group relative rounded-2xl border-2 p-6 transition-all ${
      disabled
        ? "border-ink-900/10 dark:border-white/10 opacity-50 cursor-not-allowed"
        : "border-ink-900 dark:border-white/20 bg-white dark:bg-ink-800 shadow-[4px_4px_0_0_#1D1F24] dark:shadow-[4px_4px_0_0_#FFE600] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1D1F24] dark:hover:shadow-[6px_6px_0_0_#FFE600] cursor-pointer"
    }`;
    div.innerHTML = `
      <span class="text-[10px] font-mono uppercase tracking-widest text-brand-700 dark:text-brand">${tag}</span>
      <h3 class="text-xl font-extrabold mt-2">${title}</h3>
      <p class="text-sm text-ink-500 dark:text-ink-300 mt-1">${desc}</p>
      <span class="inline-block mt-4 text-sm font-semibold ${disabled ? "" : "group-hover:translate-x-1 transition-transform"}">${disabled ? "Tidak tersedia" : "Buka →"}</span>
    `;
    if (!disabled) div.addEventListener("click", onClick);
    return div;
  };

  cards.appendChild(
    cardHtml(
      "Penilaian Komdis",
      "Catat dan tinjau pelanggaran peserta per kelompok, per pertemuan.",
      !isKomdis,
      () => navigate({ name: "komdis-groups" }),
      "Komisi Disiplin"
    )
  );
  cards.appendChild(
    cardHtml(
      "Penilaian Mentor",
      "Beri nilai keaktifan, loyalitas, tugas, dan lainnya tiap pertemuan.",
      !isMentor,
      () => navigate({ name: "mentor-groups" }),
      "Mentor"
    )
  );
}

/* ---------------------------------------------------------------------
   8. KOMDIS — pilih kelompok
   --------------------------------------------------------------------- */

function renderGroupGrid(main, { eyebrow, title, myGroups, onOpen, backRoute }) {
  main.appendChild(clone("tpl-group-grid"));
  document.getElementById("groupGridEyebrow").textContent = eyebrow;
  document.getElementById("groupGridTitle").textContent = title;
  main.querySelector("[data-back]").addEventListener("click", () => navigate(backRoute));

  const wrap = document.getElementById("groupCards");
  allGroupNumbers().forEach((g) => {
    const accessible = myGroups.includes(g);
    const count = participantsInGroup(g).length;
    const div = document.createElement("div");
    div.className = `group-card rounded-2xl border-2 p-5 transition-all ${
      accessible
        ? "border-ink-900 dark:border-white/20 bg-white dark:bg-ink-800 shadow-[3px_3px_0_0_#1D1F24] dark:shadow-[3px_3px_0_0_#FFE600] hover:-translate-y-1 cursor-pointer"
        : "locked border-ink-900/10 dark:border-white/10 bg-ink-100 dark:bg-ink-800/40"
    }`;
    div.innerHTML = `
      <p class="font-mono text-xs uppercase tracking-widest text-brand-700 dark:text-brand">Kelompok</p>
      <h3 class="text-3xl font-extrabold mt-1">${g}</h3>
      <p class="text-sm text-ink-500 dark:text-ink-300 mt-1">${count} peserta</p>
      ${accessible ? "" : '<p class="text-xs mt-3 font-semibold text-red-500">Tidak dapat diakses</p>'}
    `;
    if (accessible) div.addEventListener("click", () => onOpen(g));
    wrap.appendChild(div);
  });
}

function renderKomdisGroups(main) {
  renderGroupGrid(main, {
    eyebrow: "Komisi Disiplin",
    title: "Pilih kelompok",
    myGroups: groupsOf(komdis_group, state.user.email),
    onOpen: (g) => navigate({ name: "komdis-table", group: g }),
    backRoute: { name: "home" }
  });
}

/* ---------------------------------------------------------------------
   9. KOMDIS — tabel pelanggaran
   --------------------------------------------------------------------- */

const violationClass = {
  "Ringan": "v-ringan",
  "Sedang Kategori I": "v-sedang1",
  "Sedang Kategori II": "v-sedang2",
  "Berat": "v-berat"
};
const violationAbbr = {
  "Ringan": "R",
  "Sedang Kategori I": "S1",
  "Sedang Kategori II": "S2",
  "Berat": "B"
};
// Higher = more severe. Used to pick the badge color when a participant
// has more than one violation in the same pertemuan.
const violationSeverity = {
  "Ringan": 1,
  "Sedang Kategori I": 2,
  "Sedang Kategori II": 3,
  "Berat": 4
};

function worstViolation(list) {
  return list.reduce((worst, v) =>
    (violationSeverity[v.type] || 0) > (violationSeverity[worst.type] || 0) ? v : worst
  , list[0]);
}

async function renderKomdisTable(main, group) {
  main.appendChild(clone("tpl-komdis-table"));
  document.getElementById("komdisTitle").textContent = `Kelompok ${group}`;
  main.querySelector("[data-back]").addEventListener("click", () => navigate({ name: "komdis-groups" }));

  // header sub-columns (pertemuan 1..10)
  const headRow = document.querySelectorAll("#komdisBody")[0]; // placeholder to keep lint happy
  const subHeadRow = main.querySelectorAll("thead tr")[1];
  for (let i = 1; i <= MEETING_COUNT; i++) {
    const th = document.createElement("th");
    th.className = "px-2 py-2 text-center min-w-[46px]";
    th.textContent = i;
    subHeadRow.appendChild(th);
  }

  const state$ = document.getElementById("komdisLoadState");
  state$.textContent = "Memuat…";

  const participants = participantsInGroup(group);
  const tbody = document.getElementById("komdisBody");
  renderKomdisRows(tbody, participants, {});

  let violations = {};
  try {
    violations = await fetchViolations(group);
    state.violationsCache[group] = violations;
    state$.textContent = "Tersinkron";
  } catch (e) {
    console.error(e);
    state$.textContent = "Gagal memuat dari Spreadsheet";
    toast("Gagal memuat data pelanggaran. Periksa koneksi/Apps Script URL.", "error");
  }
  renderKomdisRows(tbody, participants, violations);

  document.getElementById("addViolationBtn").addEventListener("click", () => openViolationModal(group));
}

function renderKomdisRows(tbody, participants, violations) {
  tbody.innerHTML = "";
  participants.forEach((p) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-ink-900/5 dark:hover:bg-white/5";
    const cells = [];
    cells.push(`<td class="sticky left-0 bg-white dark:bg-ink-900 px-3 py-2 font-mono text-xs">${p.nim}</td>`);
    cells.push(`<td class="sticky left-[64px] bg-white dark:bg-ink-900 px-3 py-2 font-semibold">${p.name}</td>`);

    let total = 0;
    for (let m = 1; m <= MEETING_COUNT; m++) {
      const list = (violations[p.nim] || {})[m] || [];
      if (list.length) {
        total += list.length;
        const worst = worstViolation(list);
        const cls = violationClass[worst.type] || "";
        const label = list.length > 1 ? String(list.length) : (violationAbbr[worst.type] || "?");
        const title = list
          .map((v) => `${v.type}${v.date ? " · " + v.date : ""}`)
          .join("\n");
        cells.push(`<td class="px-2 py-2 text-center"><span class="violation-dot ${cls}" title="${title}">${label}</span></td>`);
      } else {
        cells.push(`<td class="px-2 py-2 text-center"><span class="violation-dot v-none">·</span></td>`);
      }
    }

    const totalCls = total > 0 ? "bg-ink-900 text-brand dark:bg-brand dark:text-ink-900" : "text-ink-400 dark:text-ink-500";
    cells.push(`<td class="px-3 py-2 text-center font-bold"><span class="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1 rounded-lg text-xs ${totalCls}">${total}</span></td>`);

    tr.innerHTML = cells.join("");
    tbody.appendChild(tr);
  });
}

/* ---------------------------------------------------------------------
   10. Modal tambah pelanggaran
   --------------------------------------------------------------------- */

function openViolationModal(group) {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("hidden");
  overlay.classList.add("flex");

  const participantSel = document.getElementById("violationParticipant");
  participantSel.innerHTML = participantsInGroup(group)
    .map((p) => `<option value="${p.nim}">${p.name} — ${p.nim}</option>`)
    .join("");

  const meetingSel = document.getElementById("violationMeeting");
  meetingSel.innerHTML = Array.from({ length: MEETING_COUNT }, (_, i) => i + 1)
    .map((m) => `<option value="${m}">Pertemuan ${m}</option>`)
    .join("");

  const closeModal = () => {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    form.reset();
    errEl.classList.add("hidden");
  };
  document.getElementById("modalClose").onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  const form = document.getElementById("violationForm");
  const errEl = document.getElementById("violationError");

  form.onsubmit = async (e) => {
    e.preventDefault();
    errEl.classList.add("hidden");
    const btn = document.getElementById("violationSubmit");
    btn.disabled = true;
    btn.textContent = "Menyimpan…";

    const nim = participantSel.value;
    const meeting = meetingSel.value;
    const type = document.getElementById("violationType").value;
    const date = document.getElementById("violationDate").value;
    const fileInput = document.getElementById("violationFile");
    const file = fileInput.files[0];
    const participant = catra[nim];

    try {
      let fileBase64 = null, fileName = null, mimeType = null;
      if (file) {
        fileBase64 = await fileToBase64(file);
        fileName = file.name;
        mimeType = file.type || "application/octet-stream";
      }

      await postToAppsScript({
        action: "addViolation",
        group,
        nim,
        name: participant.name,
        meeting,
        type,
        date: date || "",
        fileName,
        mimeType,
        fileBase64
      });

      // Update local cache + table immediately (optimistic).
      state.violationsCache[group] = state.violationsCache[group] || {};
      state.violationsCache[group][nim] = state.violationsCache[group][nim] || {};
      state.violationsCache[group][nim][meeting] = state.violationsCache[group][nim][meeting] || [];
      state.violationsCache[group][nim][meeting].push({ type, date });
      const tbody = document.getElementById("komdisBody");
      if (tbody) renderKomdisRows(tbody, participantsInGroup(group), state.violationsCache[group]);

      toast("Pelanggaran berhasil disimpan.", "success");
      closeModal();
    } catch (err) {
      console.error(err);
      errEl.textContent = "Gagal menyimpan. Periksa koneksi atau konfigurasi Apps Script.";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "Simpan Pelanggaran";
    }
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------------------------------------------
   11. MENTOR — pilih kelompok / pertemuan / tabel nilai
   --------------------------------------------------------------------- */

function renderMentorGroups(main) {
  renderGroupGrid(main, {
    eyebrow: "Mentor",
    title: "Pilih kelompok",
    myGroups: groupsOf(mentor_group, state.user.email),
    onOpen: (g) => navigate({ name: "mentor-meetings", group: g }),
    backRoute: { name: "home" }
  });
}

function renderMentorMeetings(main, group) {
  main.appendChild(clone("tpl-mentor-meetings"));
  document.getElementById("mentorMeetingsTitle").textContent = `Kelompok ${group} — pilih pertemuan`;
  main.querySelector("[data-back]").addEventListener("click", () => navigate({ name: "mentor-groups" }));

  const wrap = document.getElementById("meetingCards");
  for (let m = 1; m <= MEETING_COUNT; m++) {
    const div = document.createElement("div");
    div.className = "rounded-2xl border-2 border-ink-900 dark:border-white/20 bg-white dark:bg-ink-800 p-5 text-center shadow-[3px_3px_0_0_#1D1F24] dark:shadow-[3px_3px_0_0_#FFE600] hover:-translate-y-1 cursor-pointer transition-all";
    div.innerHTML = `
      <p class="font-mono text-[10px] uppercase tracking-widest text-brand-700 dark:text-brand">Pertemuan</p>
      <h3 class="text-2xl font-extrabold mt-1">${m}</h3>
    `;
    div.addEventListener("click", () => navigate({ name: "mentor-table", group, meeting: m }));
    wrap.appendChild(div);
  }
}

const MENTOR_COLUMNS = [
  { key: "keaktifan", label: "Keaktifan" },
  { key: "loyalitas", label: "Loyalitas" },
  { key: "tugas", label: "Tugas" },
  { key: "kedisiplinan", label: "Kedisiplinan" },
  { key: "kehadiran", label: "Kehadiran" },
  { key: "kerjasama", label: "Kerjasama" },
  { key: "penerapan5s", label: "Penerapan 5S" }
];

async function renderMentorTable(main, group, meeting) {
  main.appendChild(clone("tpl-mentor-table"));
  document.getElementById("mentorTableTitle").textContent = `Kelompok ${group} · Pertemuan ${meeting}`;
  main.querySelector("[data-back]").addEventListener("click", () => navigate({ name: "mentor-meetings", group }));

  const loadState = document.getElementById("mentorLoadState");
  loadState.textContent = "Memuat…";

  const participants = participantsInGroup(group);
  const tbody = document.getElementById("mentorBody");
  const cacheKey = `${group}-${meeting}`;

  let scores = {};
  try {
    scores = await fetchMentorScores(group, meeting);
    state.mentorCache[cacheKey] = scores;
    loadState.textContent = "Tersinkron";
  } catch (e) {
    console.error(e);
    loadState.textContent = "Gagal memuat dari Spreadsheet";
    toast("Gagal memuat nilai. Periksa koneksi/Apps Script URL.", "error");
  }

  renderMentorRows(tbody, participants, scores);

  document.getElementById("mentorSaveBtn").addEventListener("click", async () => {
    const btn = document.getElementById("mentorSaveBtn");
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = "Menyimpan…";

    const rows = participants.map((p) => {
      const row = { nim: p.nim, name: p.name };
      MENTOR_COLUMNS.forEach((col) => {
        const input = tbody.querySelector(`input[data-nim="${p.nim}"][data-col="${col.key}"]`);
        row[col.key] = input ? input.value : "";
      });
      return row;
    });

    try {
      await postToAppsScript({ action: "saveMentorScores", group, meeting, rows });
      tbody.querySelectorAll(".dirty").forEach((el) => el.classList.remove("dirty"));
      toast("Penilaian tersimpan.", "success");
    } catch (err) {
      console.error(err);
      toast("Gagal menyimpan penilaian.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

function renderMentorRows(tbody, participants, scores) {
  tbody.innerHTML = "";
  participants.forEach((p) => {
    const row = scores[p.nim] || {};
    const tr = document.createElement("tr");
    const cells = [
      `<td class="sticky left-0 bg-white dark:bg-ink-900 px-3 py-2 font-mono text-xs">${p.nim}</td>`,
      `<td class="sticky left-[64px] bg-white dark:bg-ink-900 px-3 py-2 font-semibold">${p.name}</td>`
    ];
    MENTOR_COLUMNS.forEach((col) => {
      const val = row[col.key] ?? "";
      cells.push(`<td class="px-2 py-2"><input class="score-input" type="text" inputmode="numeric" data-nim="${p.nim}" data-col="${col.key}" value="${val}" /></td>`);
    });
    tr.innerHTML = cells.join("");
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".score-input").forEach((input) => {
    input.addEventListener("input", () => input.classList.add("dirty"));
  });
}

/* ---------------------------------------------------------------------
   12. Komunikasi dengan Google Apps Script (Spreadsheet backend)
   --------------------------------------------------------------------- */

async function fetchViolations(group) {
  const url = `${APPS_SCRIPT_URL}?action=getViolations&group=${encodeURIComponent(group)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  // Expected shape: { "125160001": { "1": {type, date}, "3": {...} }, ... }
  return data || {};
}

async function fetchMentorScores(group, meeting) {
  const url = `${APPS_SCRIPT_URL}?action=getMentorScores&group=${encodeURIComponent(group)}&meeting=${encodeURIComponent(meeting)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  // Expected shape: { "125160001": { keaktifan: "80", ... }, ... }
  return data || {};
}

// POST using text/plain content-type to avoid a CORS preflight
// (Apps Script Web Apps don't handle OPTIONS preflight well).
async function postToAppsScript(payload) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

/* ---------------------------------------------------------------------
   13. BOOTSTRAP
   --------------------------------------------------------------------- */

(async function init() {
  initTheme();
  renderLoading();
  await waitForFirebase();

  window.FB.onAuthChange((user) => {
    if (user && !blacklist.includes(user.email)) {
      state.user = { email: user.email };
      resetIdleTimer();
      // Reload always lands back on the home dashboard behind a fresh
      // auth check — never assumes a still-valid session.
      navigate({ name: "home" });
    } else {
      if (user && blacklist.includes(user.email)) {
        window.FB.signOutUser();
        toast("Akun ini diblokir dari sistem.", "error");
      }
      state.user = null;
      render();
    }
  });
})();
