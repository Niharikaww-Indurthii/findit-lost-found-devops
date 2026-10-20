(() => {
  const KEY = "findit-items-v1";
  const today = new Date().toISOString().slice(0, 10);
  const seedItems = [
    {id:"seed-1",name:"Wireless headphones",category:"Electronics",status:"Lost",location:"Central Library · Study zone",date:today,description:"Black over-ear headphones in a soft zip case.",emoji:"🎧",seed:true},
    {id:"seed-2",name:"Blue water bottle",category:"Accessories",status:"Found",location:"Sports complex · Entrance",date:today,description:"Reusable blue bottle with a small star sticker.",emoji:"🧴",seed:true},
    {id:"seed-3",name:"Student ID card",category:"Cards & IDs",status:"Found",location:"Main cafeteria · Counter",date:today,description:"Student ID card picked up near the cafeteria counter.",emoji:"🪪",seed:true},
    {id:"seed-4",name:"Canvas backpack",category:"Bags",status:"Lost",location:"Engineering block · Room 204",date:today,description:"Olive canvas backpack with a keychain attached.",emoji:"🎒",seed:true},
    {id:"seed-5",name:"Data structures textbook",category:"Books",status:"Lost",location:"Computer lab · Desk row B",date:today,description:"Textbook with handwritten notes on the inside cover.",emoji:"📚",seed:true},
    {id:"seed-6",name:"Silver keychain",category:"Accessories",status:"Found",location:"Main gate · Security desk",date:today,description:"Small silver keyring with two keys. No labels shown.",emoji:"🔑",seed:true}
  ];
  const emojiMap = {"Electronics":"🎧","Accessories":"🔑","Cards & IDs":"🪪","Bags":"🎒","Books":"📚","Other":"📦"};
  const classMap = {"Electronics":"electronics","Accessories":"accessories","Cards & IDs":"cards","Bags":"bags","Books":"books","Other":"other"};
  const $ = id => document.getElementById(id);
  let status = "All";
  let toastTimer;

  function loadItems() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) return [...saved, ...seedItems];
    } catch (e) {}
    return [...seedItems];
  }
  let items = loadItems();
  function persist() {
    // Only user-created reports are saved in this browser; seed examples are restored on every visit.
    localStorage.setItem(KEY, JSON.stringify(items.filter(item => !item.seed)));
  }
  function prettyDate(date) {
    if (!date) return "Date not provided";
    const d = new Date(date + "T12:00:00");
    return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function showToast(message) {
    $("toast").textContent = message;
    $("toast").classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.add("hidden"), 3400);
  }
  function updateStats() {
    $("totalCount").textContent = items.length;
    $("lostCount").textContent = items.filter(i => i.status === "Lost").length;
    $("foundCount").textContent = items.filter(i => i.status === "Found").length;
    $("todayCount").textContent = items.filter(i => i.date === today).length;
    $("allTabCount").textContent = items.length;
    $("lostTabCount").textContent = items.filter(i => i.status === "Lost").length;
    $("foundTabCount").textContent = items.filter(i => i.status === "Found").length;
  }
  function render() {
    updateStats();
    const query = $("searchInput").value.trim().toLowerCase();
    const category = $("categoryFilter").value;
    const visible = items.filter(item => {
      const matchesQuery = [item.name,item.category,item.location,item.description].join(" ").toLowerCase().includes(query);
      return matchesQuery && (status === "All" || item.status === status) && (category === "All" || item.category === category);
    }).sort((a,b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    $("resultsLabel").textContent = `Showing ${visible.length} of ${items.length} items`;
    $("itemGrid").innerHTML = visible.map(item => {
      const safeName = escapeHtml(item.name);
      return `<article class="item-card">
        <div class="item-visual visual-${classMap[item.category] || "other"}">
          <span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span>
          <span class="item-emoji">${escapeHtml(item.emoji || emojiMap[item.category] || "📦")}</span>
        </div>
        <div class="item-content">
          <div class="item-meta"><span class="category-label">${escapeHtml(item.category)}</span><span>REPORT #${escapeHtml(String(item.id).slice(-5).toUpperCase())}</span></div>
          <h3>${safeName}</h3><p class="item-description">${escapeHtml(item.description)}</p>
          <div class="item-location"><span>⌖</span>${escapeHtml(item.location)}</div>
          <div class="item-footer"><span class="item-date">${prettyDate(item.date)}</span><button class="contact-button" data-item-id="${escapeHtml(item.id)}">View details ↗</button></div>
        </div>
      </article>`;
    }).join("");
    $("emptyState").classList.toggle("hidden", visible.length > 0);
    $("itemGrid").classList.toggle("hidden", visible.length === 0);
  }
  function openModal(defaultStatus) {
    $("reportModal").classList.remove("hidden");
    if (defaultStatus) $("itemStatus").value = defaultStatus;
    $("itemDate").value = today;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("itemName").focus(), 50);
  }
  function closeModal() {
    $("reportModal").classList.add("hidden");
    document.body.style.overflow = "";
  }
  ["openReportTop","openReportHero","openReportBottom","emptyReportBtn"].forEach(id => $(id).addEventListener("click", () => openModal()));
  $("closeModal").addEventListener("click", closeModal);
  $("reportModal").addEventListener("click", e => { if (e.target === $("reportModal")) closeModal(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("searchInput").focus(); }
  });
  $("browseBtn").addEventListener("click", () => $("browse").scrollIntoView({behavior:"smooth"}));
  $("searchInput").addEventListener("input", render);
  $("categoryFilter").addEventListener("change", render);
  $("statusTabs").addEventListener("click", e => {
    const btn = e.target.closest("button[data-status]");
    if (!btn) return;
    status = btn.dataset.status;
    $("statusTabs").querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
  $("clearFilters").addEventListener("click", () => {
    $("searchInput").value = "";
    $("categoryFilter").value = "All";
    status = "All";
    $("statusTabs").querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.status === "All"));
    render();
  });
  $("itemGrid").addEventListener("click", e => {
    const button = e.target.closest("[data-item-id]");
    if (!button) return;
    const item = items.find(i => i.id === button.dataset.itemId);
    if (!item) return;
    alert(`${item.status.toUpperCase()} ITEM: ${item.name}\n\nCategory: ${item.category}\nLocation: ${item.location}\nDate: ${prettyDate(item.date)}\n\nDetails: ${item.description}\n\nFor privacy, this demo does not publish contact details. Follow your campus lost-property process to arrange a safe return.`);
  });
  $("reportForm").addEventListener("submit", e => {
    e.preventDefault();
    const item = {
      id: "user-" + Date.now(),
      name: $("itemName").value.trim(),
      category: $("itemCategory").value,
      status: $("itemStatus").value,
      location: $("itemLocation").value.trim(),
      date: $("itemDate").value,
      description: $("itemDescription").value.trim(),
      emoji: emojiMap[$("itemCategory").value] || "📦",
      createdAt: new Date().toISOString(),
      seed: false
    };
    if (!item.name || !item.location || !item.date || !item.description) {
      showToast("Please complete all fields.");
      return;
    }
    items.unshift(item);
    persist();
    render();
    $("reportForm").reset();
    closeModal();
    showToast("Your report was added to this browser's community board!");
    $("browse").scrollIntoView({behavior:"smooth"});
  });
  render();
})();
