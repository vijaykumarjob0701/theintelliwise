const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { applyNewTabLinks } = require("../assets/js/open-links-new-tab.js");

function createDoc(links) {
  const anchors = links.map(function (attrs) {
    const store = Object.assign({}, attrs);
    return {
      getAttribute: function (name) {
        return Object.prototype.hasOwnProperty.call(store, name)
          ? store[name]
          : null;
      },
      setAttribute: function (name, value) {
        store[name] = value;
      }
    };
  });

  return {
    querySelectorAll: function (selector) {
      assert.equal(selector, "a[href]");
      return anchors.filter(function (anchor) {
        return anchor.getAttribute("href") != null;
      });
    },
    anchors: anchors
  };
}

test("citation and in-post links open in a new tab with safe rel", function () {
  const doc = createDoc([
    { href: "https://arxiv.org/abs/1706.03762" },
    { href: "/theintelliwise/posts/rag-semantic-caching/" },
    { href: "https://www.buymeacoffee.com/vijay07", target: "_blank", rel: "noopener noreferrer" }
  ]);

  applyNewTabLinks(doc);

  doc.anchors.forEach(function (anchor) {
    assert.equal(anchor.getAttribute("target"), "_blank");
    assert.equal(anchor.getAttribute("rel"), "noopener noreferrer");
  });
});

test("keeps existing rel tokens and adds noopener noreferrer", function () {
  const doc = createDoc([{ href: "https://github.com/vijayliebe", rel: "nofollow me" }]);

  applyNewTabLinks(doc);

  assert.equal(doc.anchors[0].getAttribute("target"), "_blank");
  assert.equal(doc.anchors[0].getAttribute("rel"), "nofollow me noopener noreferrer");
});

test("leaves same-page hash links and javascript URLs alone", function () {
  const doc = createDoc([
    { href: "#main" },
    { href: "#attention" },
    { href: "javascript:void(0)" }
  ]);

  applyNewTabLinks(doc);

  doc.anchors.forEach(function (anchor) {
    assert.equal(anchor.getAttribute("target"), null);
    assert.equal(anchor.getAttribute("rel"), null);
  });
});

test("default layout loads the rewriter on every page", function () {
  const layout = fs.readFileSync(
    path.join(__dirname, "..", "_layouts", "default.html"),
    "utf8"
  );
  assert.match(layout, /open-links-new-tab\.js/);
});

test("applies to primary nav and footer links", function () {
  const doc = createDoc([
    { href: "/theintelliwise/" },
    { href: "/theintelliwise/about/" },
    { href: "https://github.com/vijaykumarjob0701/theintelliwise" }
  ]);

  applyNewTabLinks(doc);

  doc.anchors.forEach(function (anchor) {
    assert.equal(anchor.getAttribute("target"), "_blank");
    assert.match(anchor.getAttribute("rel"), /noopener/);
    assert.match(anchor.getAttribute("rel"), /noreferrer/);
  });
});
