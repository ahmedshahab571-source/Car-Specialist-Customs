/* Car Specialist Customs — lightweight interactions (no dependencies) */
(function () {
  "use strict";

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.querySelector(".nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var mobile = document.getElementById("mobileMenu");
  if (toggle && mobile) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      mobile.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) {
        panel.style.maxHeight = expanded ? null : panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    // Re-trigger the animation every time an element enters or leaves the
    // viewport (so scrolling back up and down replays it), not just once.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle("is-in", e.isIntersecting);
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Form handling ---------- */
  var forms = document.querySelectorAll("form[data-enquiry]");

  var showError = function (field, msg) {
    field.classList.add("invalid");
    var e = field.querySelector(".field-error");
    if (e && msg) e.textContent = msg;
  };
  var clearError = function (field) { field.classList.remove("invalid"); };

  var validate = function (form) {
    var ok = true;
    form.querySelectorAll(".field").forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input || !input.required) return;
      var val = (input.value || "").trim();
      if (!val) { showError(field, "This field is required."); ok = false; return; }
      if (input.type === "tel") {
        var digits = val.replace(/[^0-9]/g, "");
        if (digits.length < 7) { showError(field, "Enter a valid phone number."); ok = false; return; }
      }
      clearError(field);
    });
    return ok;
  };

  forms.forEach(function (form) {
    // live-clear errors on input
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("invalid") && (input.value || "").trim()) {
          clearError(field);
        }
      });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = form.querySelector(".form-status");
      var btn = form.querySelector("button[type=submit]");

      if (status) { status.className = "form-status"; }

      if (!validate(form)) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      // Honeypot: if filled, silently pretend success (bot)
      var hp = form.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) { return; }

      if (btn) btn.classList.add("is-loading");

      var action = form.getAttribute("action") || "";
      var isPlaceholder = /YOUR_FORM_ID/i.test(action);

      var finishSuccess = function () {
        if (btn) btn.classList.remove("is-loading");
        form.reset();
        if (status) {
          status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
            "Thank you! Your enquiry has been received. We’ll contact you shortly.";
          status.className = "form-status form-status--success is-visible";
          status.setAttribute("role", "status");
          status.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };
      var finishError = function () {
        if (btn) btn.classList.remove("is-loading");
        if (status) {
          status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>' +
            "Sorry, something went wrong. Please call us on 0161 524 3872 or try again.";
          status.className = "form-status form-status--error is-visible";
          status.setAttribute("role", "alert");
        }
      };

      // If the Formspree endpoint hasn't been configured yet, don't hit the network.
      if (isPlaceholder) {
        setTimeout(finishSuccess, 700); // demo/success feedback until real ID is added
        return;
      }

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) { finishSuccess(); }
          else { res.json().then(finishError).catch(finishError); }
        })
        .catch(finishError);
    });
  });

  /* ---------- In-page navigation: smooth scroll + arrival animation ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      // replay the "arrive" animation on the destination section
      target.classList.remove("nav-arrive");
      void target.offsetWidth; // force reflow so the animation restarts
      target.classList.add("nav-arrive");
    });
  });

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
