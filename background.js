// background.js
let extractedPrice = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setPrice') {
    extractedPrice = message.price;
  }
});

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'popup.html' });
});
