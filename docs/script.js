/* WalkScroll site — minimal, dependency-free JS.
   All content remains available with JS disabled (FAQ uses <details>). */

(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close the menu after choosing a section
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Analytics placeholder ----------
     Replace this stub with your GA4 / analytics call once configured.
     Event names in use across the site:
       app_store_click, hero_download_click, guide_download_click,
       screenshot_view, faq_expand, final_cta_click, outbound_click,
       scroll_depth
  ------------------------------------------------ */
  function track(eventName, params) {
    // Example once GA4 is installed:
    // if (typeof gtag === "function") gtag("event", eventName, params);
    if (window.console && console.debug) console.debug("[analytics]", eventName, params || {});
  }

  /* Clicks on elements carrying data-event */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-event]");
    if (!el) return;
    track(el.getAttribute("data-event"), {
      platform: el.getAttribute("data-platform") || undefined,
      location: el.getAttribute("data-location") || undefined,
      question: el.getAttribute("data-question") || undefined,
      href: el.href || undefined
    });
  });

  /* FAQ expand tracking (toggle events don't bubble as clicks reliably) */
  document.querySelectorAll(".faq details[data-event]").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) track("faq_expand", { question: d.getAttribute("data-question") });
    });
  });

  /* Outbound-link tracking (any external link without an explicit event) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='http']");
    if (!a || a.hasAttribute("data-event")) return;
    if (a.hostname !== location.hostname) {
      track("outbound_click", { href: a.href });
    }
  });

  /* Scroll-depth tracking: fires once at 25 / 50 / 75 / 100% */
  var marks = [25, 50, 75, 100];
  var fired = {};
  function onScroll() {
    var doc = document.documentElement;
    var depth = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
    marks.forEach(function (m) {
      if (depth >= m && !fired[m]) {
        fired[m] = true;
        track("scroll_depth", { percent: m });
      }
    });
    if (fired[100]) window.removeEventListener("scroll", onScroll);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Screenshot visibility tracking */
  if ("IntersectionObserver" in window) {
    var seen = false;
    var shots = document.getElementById("screenshots");
    if (shots) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !seen) {
            seen = true;
            track("screenshot_view", {});
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 }).observe(shots);
    }
  }
})();
