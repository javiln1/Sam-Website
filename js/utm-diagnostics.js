// UTM Diagnostics Script - For testing and debugging
// Add ?utm_source=instagram&utm_medium=bio&utm_campaign=main-funnel&utm_term=test&utm_content=hero to URL to test

(function() {
  // Wait for UTM script to load
  setTimeout(function() {
    console.log("=== UTM DIAGNOSTICS ===");
    
    // Check if UTM script loaded
    if (window.__UTM__) {
      console.log("✅ UTM script loaded successfully");
      
      // Show stored UTMs
      const stored = window.__UTM__.read();
      console.log("📊 Stored UTMs:", stored);
      
      // Check current URL
      const currentURL = new URLSearchParams(window.location.search);
      const urlUTMs = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
        const v = currentURL.get(k);
        if (v) urlUTMs[k] = v;
      });
      console.log("🔗 Current URL UTMs:", urlUTMs);
      
      // Check iframes
      const iframes = document.querySelectorAll('iframe[src]');
      console.log("🖼️ Found iframes:", iframes.length);
      iframes.forEach((iframe, i) => {
        console.log(`  Iframe ${i + 1}:`, iframe.src);
        const iframeURL = new URL(iframe.src);
        const iframeUTMs = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
          const v = iframeURL.searchParams.get(k);
          if (v) iframeUTMs[k] = v;
        });
        console.log(`    UTMs in iframe ${i + 1}:`, iframeUTMs);
      });
      
      // Check hidden inputs
      const hiddenInputs = document.querySelectorAll('input[name^="utm_"]');
      console.log("📝 Hidden UTM inputs found:", hiddenInputs.length);
      hiddenInputs.forEach(input => {
        console.log(`  ${input.name}: "${input.value}"`);
      });
      
    } else {
      console.log("❌ UTM script not loaded");
    }
    
    console.log("=== END DIAGNOSTICS ===");
  }, 1000);
})();
