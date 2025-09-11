// UTM Tracking Utility for Ecom Uprise
// Captures, persists, and injects UTM parameters across all forms and embeds
(function () {
  const KEY = "pp_utm";
  
  function getUTMsFromURL() {
    const p = new URLSearchParams(window.location.search);
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
    const out = {};
    let found = false;
    keys.forEach(k => {
      const v = p.get(k);
      if (v) { out[k] = v; found = true; }
    });
    return found ? out : null;
  }
  
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
  }
  
  function write(obj) {
    if (!obj) return;
    const current = read();
    const merged = { ...current, ...obj };
    localStorage.setItem(KEY, JSON.stringify(merged));
  }
  
  // 1) Capture on first hit
  const fromURL = getUTMsFromURL();
  if (fromURL) {
    write({ ...fromURL, first_touch: Date.now() });
    console.info("[UTM] Captured from URL:", fromURL);
  } else {
    console.info("[UTM] No UTMs in URL; using stored:", read());
  }

  // 2) Populate hidden inputs on DOM ready
  function populateHiddenInputs(root=document) {
    const data = read();
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
    keys.forEach(k => {
      const inputs = root.querySelectorAll(`input[name="${k}"]`);
      inputs.forEach(inp => { if (data[k]) inp.value = data[k]; });
    });
    console.info("[UTM] Populated hidden inputs:", data);
  }

  // 3) Append UTMs to iframe src (Typeform/others)
  function appendUTMsToIframes(root=document) {
    const data = read();
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
    if (!Object.keys(data).some(k => keys.includes(k))) return;
    
    root.querySelectorAll("iframe[src]").forEach(ifr => {
      const src = new URL(ifr.src, window.location.origin);
      // Only append if not already present
      let changed = false;
      keys.forEach(k => {
        if (data[k] && !src.searchParams.get(k)) {
          src.searchParams.set(k, data[k]);
          changed = true;
        }
      });
      if (changed) {
        ifr.src = src.toString();
        console.info("[UTM] Appended to iframe:", ifr, ifr.src);
      }
    });
  }

  // 4) Preserve UTMs on internal navigation
  function preserveUTMsOnLinks() {
    const data = read();
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
    if (!Object.keys(data).some(k => keys.includes(k))) return;
    
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('/') || href.includes(window.location.hostname))) {
        const url = new URL(href, window.location.origin);
        let changed = false;
        keys.forEach(k => {
          if (data[k] && !url.searchParams.get(k)) {
            url.searchParams.set(k, data[k]);
            changed = true;
          }
        });
        if (changed) {
          link.href = url.toString();
        }
      }
    });
  }

  // Expose minimal API
  window.__UTM__ = { 
    read, 
    populateHiddenInputs, 
    appendUTMsToIframes,
    preserveUTMsOnLinks
  };
  
  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", function() {
    window.__UTM__.populateHiddenInputs();
    window.__UTM__.appendUTMsToIframes();
    window.__UTM__.preserveUTMsOnLinks();
  });
  
  // Re-run iframe injection when new iframes are added (for dynamic content)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IFRAME') {
              window.__UTM__.appendUTMsToIframes(node.parentNode);
            } else {
              window.__UTM__.appendUTMsToIframes(node);
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();