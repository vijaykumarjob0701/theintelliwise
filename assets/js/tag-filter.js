(function () {
  var root = document.querySelector("[data-tag-filter]");
  var search = document.querySelector("[data-writing-search]");
  var cards = document.querySelectorAll("[data-writing-card]");
  var status = document.querySelector("[data-filter-status]");
  var empty = document.querySelector("[data-filter-empty]");
  var topics = document.querySelector("[data-topics-panel]");
  if (!cards.length) return;

  var chips = root ? root.querySelectorAll("[data-tag]") : [];
  var activeTag = "all";

  function query() {
    return search ? search.value.trim().toLowerCase() : "";
  }

  function matchesTag(card, tag) {
    if (tag === "all") return true;
    var haystack = card.getAttribute("data-tags") || "";
    return haystack.indexOf("|" + tag + "|") !== -1;
  }

  function matchesSearch(card, q) {
    if (!q) return true;
    var hay = card.getAttribute("data-search") || "";
    return hay.indexOf(q) !== -1;
  }

  function applyFilters() {
    var tag = activeTag;
    var q = query();
    var visible = 0;

    chips.forEach(function (chip) {
      chip.setAttribute(
        "aria-pressed",
        chip.getAttribute("data-tag") === tag ? "true" : "false"
      );
    });

    cards.forEach(function (card) {
      var show = matchesTag(card, tag) && matchesSearch(card, q);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;

    if (status) {
      var parts = [];
      if (tag !== "all") parts.push("tagged #" + tag);
      if (q) parts.push("matching “" + q + "”");
      if (parts.length === 0) {
        status.textContent = "Showing all " + visible + " posts.";
      } else {
        status.textContent =
          "Showing " + visible + " posts " + parts.join(" and ") + ".";
      }
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeTag = chip.getAttribute("data-tag") || "all";
      applyFilters();
    });
  });

  if (search) {
    search.addEventListener("input", applyFilters);
  }

  function syncTopicsOpen() {
    if (!topics) return;
    var summary = topics.querySelector("summary");
    var desktop = window.matchMedia("(min-width: 56rem)").matches;
    if (desktop) {
      topics.open = true;
      if (summary) summary.setAttribute("tabindex", "-1");
    } else if (summary) {
      summary.removeAttribute("tabindex");
    }
  }

  syncTopicsOpen();
  window.addEventListener("resize", syncTopicsOpen);

  applyFilters();
})();
