/**
 * Cookie Consent Banner – GDPR compliant
 * Loads Google Tag Manager ONLY after consent
 */

(function () {
  "use strict";

  const GTM_ID = "GTM-5H2RW89R";
  const COOKIE_NAME = "cookiesAccepted";

  // ---------------- COOKIE HELPERS ----------------
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  // ---------------- GTM INIT ----------------
  function initGTM() {
    if (window.gtmInitialized) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(script);

    window.gtmInitialized = true;
  }

  // ---------------- EVENT TRACKING (SAFE) ----------------
  window.trackEvent = function (eventName, params = {}) {
    if (getCookie(COOKIE_NAME) === "true" && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  };

  // ---------------- CONSENT UI ----------------
  function showBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-consent-banner";
    banner.innerHTML = `
      <div class="cookie-box">
        <div class="cookie-text">
          <strong>🍪 We respect your privacy</strong>
          <p>
            We use cookies for analytics and secure payments.
            Accepting helps us improve Alphadom.
          </p>
        </div>
        <div class="cookie-actions">
          <button id="cookie-reject">Reject</button>
          <button id="cookie-accept">Accept</button>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #1a1a2e;
        color: #fff;
        padding: 16px;
        z-index: 99999;
        font-family: system-ui, sans-serif;
      }
      .cookie-box {
        max-width: 1200px;
        margin: auto;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .cookie-text p {
        margin: 6px 0 0;
        font-size: 14px;
      }
      .cookie-actions button {
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        font-weight: 600;
        cursor: pointer;
      }
      #cookie-accept {
        background: #16a34a;
        color: #fff;
      }
      #cookie-reject {
        background: transparent;
        color: #ccc;
        border: 1px solid #555;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    document.getElementById("cookie-accept").addEventListener("click", () => {
      setCookie(COOKIE_NAME, "true", 365);
      banner.remove();
      initGTM();
    });

    document.getElementById("cookie-reject").addEventListener("click", () => {
      setCookie(COOKIE_NAME, "false", 180);
      banner.remove();
    });
  }

  // ---------------- INIT ----------------
  function init() {
    const consent = getCookie(COOKIE_NAME);

    if (consent === "true") {
      initGTM();
    } else if (consent === null) {
      showBanner();
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
