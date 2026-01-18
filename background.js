/* Copyright (c) 2026 @superman2775
 * All rights reserved.
 *
 * Permission is granted to use this script for educational purposes only.
 * Redistribution, modification, or commercial use of this code, in whole or in part,
 * is prohibited without explicit written permission from the author.
 */


//Hack Club AI’s API is blocked by the CORS security when called directly from the page
//To avoid this, request is sent from background script, which has the right permissions and returns the result to the assistant popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "hackclub-chat") {
    const { apiKey, model, messages } = msg;

    fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, messages })
    })
      .then(r => r.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));

    return true; // async
  }
});
