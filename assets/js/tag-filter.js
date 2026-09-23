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
  var searchTimer = null;
  var lastSearchTerm = "";
  var SEARCH_DEBOUNCE_MS = 600;
  var MIN_SEARCH_LENGTH = 2;

  function track(name, params) {
    if (typeof gtag !== "function") return;
    gtag("event", name, params || {});
  }

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

  function visibleCount() {
    var n = 0;
    cards.forEach(function (card) {
      if (!card.hidden) n += 1;
    });
    return n;
  }

  function slugFromHref(href) {
    var parts = (href || "").split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
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

  function trackSearch() {
    if (!search) return;
    var term = search.value.trim();
    if (term.length < MIN_SEARCH_LENGTH) return;
    var key = term.toLowerCase();
    if (key === lastSearchTerm) return;
    lastSearchTerm = key;
    track("search", {
      search_term: term.slice(0, 100),
      results_count: visibleCount()
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeTag = chip.getAttribute("data-tag") || "all";
      applyFilters();
      track("tag_click", { tag_name: activeTag.slice(0, 100) });
    });
  });

  if (search) {
    search.addEventListener("input", function () {
      applyFilters();
      if (searchTimer) window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(trackSearch, SEARCH_DEBOUNCE_MS);
    });
  }

  cards.forEach(function (card) {
    var link = card.querySelector(".writing-card__title a");
    if (!link) return;
    link.addEventListener("click", function () {
      var title = (link.textContent || "").trim();
      track("post_card_click", {
        post_title: title.slice(0, 100),
        post_slug: slugFromHref(link.getAttribute("href")),
        link_url: link.getAttribute("href") || ""
      });
    });
  });

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
