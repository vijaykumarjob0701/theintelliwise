(function () {
  function isSamePageJump(href) {
    if (!href) return true;
    var value = String(href).trim();
    if (!value) return true;
    if (value.charAt(0) === "#") return true;
    return value.toLowerCase().indexOf("javascript:") === 0;
  }

  function mergeRel(existing) {
    var tokens = String(existing || "")
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.indexOf("noopener") === -1) tokens.push("noopener");
    if (tokens.indexOf("noreferrer") === -1) tokens.push("noreferrer");
    return tokens.join(" ");
  }

  function applyNewTabLinks(doc) {
    if (!doc || !doc.querySelectorAll) return;
    var links = doc.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var anchor = links[i];
      if (isSamePageJump(anchor.getAttribute("href"))) continue;
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", mergeRel(anchor.getAttribute("rel")));
    }
  }

  function boot() {
    applyNewTabLinks(document);
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { applyNewTabLinks: applyNewTabLinks };
  }
})();
