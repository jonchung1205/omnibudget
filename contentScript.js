// contentScript.js
const priceElement = document.querySelector('.uitk-lockup-price');
if (priceElement) {
  const price = priceElement.textContent.trim();
  chrome.runtime.sendMessage({ action: 'setPrice', price });
}
