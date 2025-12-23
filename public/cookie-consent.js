/**
 * Cookie Consent Banner - Vanilla JavaScript
 * Handles GDPR-compliant cookie consent with Google Tag Manager integration
 */

(function() {
  'use strict';

  // Cookie utility functions
  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Check if consent has already been given
  function hasConsent() {
    return getCookie('cookiesAccepted') !== null;
  }

  // Get consent value
  function getConsentValue() {
    return getCookie('cookiesAccepted') === 'true';
  }

  // Initialize Google Tag Manager only after consent
  function initGTM() {
    if (window.gtmInitialized) return;
    
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    
    var f = document.getElementsByTagName('script')[0];
    var j = document.createElement('script');
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5H2RW89Q';
    f.parentNode.insertBefore(j, f);
    
    window.gtmInitialized = true;
    
    // Add noscript iframe for GTM
    var noscript = document.createElement('noscript');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-5H2RW89Q';
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  }

  // Track e-commerce events (only if consent given)
  window.trackEvent = function(eventName, eventParams) {
    if (getConsentValue() && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams
      });
    }
  };

  // Create and show cookie consent banner
  function showConsentBanner() {
    // Create banner container
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = '\
      <div class="cookie-consent-content">\
        <div class="cookie-consent-text">\
          <p><strong>🍪 We value your privacy</strong></p>\
          <p>We use cookies to enhance your browsing experience, analyze site traffic, and improve our services. By clicking "Accept", you consent to our use of cookies for analytics purposes.</p>\
        </div>\
        <div class="cookie-consent-buttons">\
          <button id="cookie-reject" class="cookie-btn cookie-btn-reject" aria-label="Reject cookies">Reject</button>\
          <button id="cookie-accept" class="cookie-btn cookie-btn-accept" aria-label="Accept cookies">Accept</button>\
        </div>\
      </div>\
    ';

    // Apply styles
    var style = document.createElement('style');
    style.textContent = '\
      #cookie-consent-banner {\
        position: fixed;\
        bottom: 0;\
        left: 0;\
        right: 0;\
        background: #1a1a2e;\
        color: #ffffff;\
        padding: 16px 20px;\
        z-index: 99999;\
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);\
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\
        animation: slideUp 0.3s ease-out;\
      }\
      @keyframes slideUp {\
        from { transform: translateY(100%); }\
        to { transform: translateY(0); }\
      }\
      .cookie-consent-content {\
        max-width: 1200px;\
        margin: 0 auto;\
        display: flex;\
        flex-wrap: wrap;\
        align-items: center;\
        justify-content: space-between;\
        gap: 16px;\
      }\
      .cookie-consent-text {\
        flex: 1;\
        min-width: 280px;\
      }\
      .cookie-consent-text p {\
        margin: 0 0 8px 0;\
        font-size: 14px;\
        line-height: 1.5;\
      }\
      .cookie-consent-text p:last-child {\
        margin-bottom: 0;\
      }\
      .cookie-consent-buttons {\
        display: flex;\
        gap: 12px;\
        flex-shrink: 0;\
      }\
      .cookie-btn {\
        padding: 10px 24px;\
        border: none;\
        border-radius: 6px;\
        font-size: 14px;\
        font-weight: 600;\
        cursor: pointer;\
        transition: all 0.2s ease;\
      }\
      .cookie-btn:focus {\
        outline: 2px solid #4ade80;\
        outline-offset: 2px;\
      }\
      .cookie-btn-accept {\
        background: #16a34a;\
        color: white;\
      }\
      .cookie-btn-accept:hover {\
        background: #15803d;\
      }\
      .cookie-btn-reject {\
        background: transparent;\
        color: #d1d5db;\
        border: 1px solid #4b5563;\
      }\
      .cookie-btn-reject:hover {\
        background: #374151;\
        color: white;\
      }\
      @media (max-width: 600px) {\
        #cookie-consent-banner {\
          padding: 12px 16px;\
        }\
        .cookie-consent-content {\
          flex-direction: column;\
          text-align: center;\
        }\
        .cookie-consent-buttons {\
          width: 100%;\
          justify-content: center;\
        }\
        .cookie-btn {\
          flex: 1;\
          max-width: 140px;\
        }\
      }\
    ';
    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Handle accept
    document.getElementById('cookie-accept').addEventListener('click', function() {
      setCookie('cookiesAccepted', 'true', 365);
      banner.style.animation = 'slideDown 0.3s ease-in forwards';
      setTimeout(function() {
        banner.remove();
        initGTM();
      }, 300);
    });

    // Handle reject
    document.getElementById('cookie-reject').addEventListener('click', function() {
      setCookie('cookiesAccepted', 'false', 180);
      banner.style.animation = 'slideDown 0.3s ease-in forwards';
      setTimeout(function() {
        banner.remove();
      }, 300);
    });

    // Add slideDown animation
    var slideDownStyle = document.createElement('style');
    slideDownStyle.textContent = '@keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }';
    document.head.appendChild(slideDownStyle);
  }

  // Initialize on DOM ready
  function init() {
    if (hasConsent()) {
      // User has already made a choice
      if (getConsentValue()) {
        // Consent was given, initialize GTM
        initGTM();
      }
      // If rejected, do nothing (no tracking)
    } else {
      // No choice made yet, show banner
      showConsentBanner();
    }
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
