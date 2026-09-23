(function () {
  var root = document.querySelector("[data-tag-filter]");
  if (!root) return;

  var chips = root.querySelectorAll("[data-tag]");
  var cards = document.querySelectorAll("[data-writing-card]");
  var status = document.querySelector("[data-filter-status]");

  function matchesTag(card, tag) {
    if (tag === "all") return true;
    var haystack = card.getAttribute("data-tags") || "";
    return haystack.indexOf("|" + tag + "|") !== -1;
  }

  function applyFilter(tag) {
    var visible = 0;

    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-tag") === tag ? "true" : "false");
    });

    cards.forEach(function (card) {
      var show = matchesTag(card, tag);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (status) {
      if (tag === "all") {
        status.textContent = "Showing all " + visible + " posts.";
      } else {
        status.textContent = "Showing " + visible + " posts tagged " + tag + ".";
      }
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyFilter(chip.getAttribute("data-tag") || "all");
    });
  });
})();
