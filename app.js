(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const input = $("inputText");
  const output = $("outputText");
  const status = $("status");
  const live = $("liveToggle");
  let timer = null;

  function counts() {
    $("inputCount").textContent = `${input.value.length.toLocaleString()} characters`;
    $("outputCount").textContent = `${output.value.length.toLocaleString()} characters`;
  }

  function decode(showStatus = true) {
    output.value = SmartDecoder.decodeText(input.value);
    counts();
    if (showStatus) {
      status.textContent = input.value.trim() ? "Reconstruction complete." : "Paste text to begin.";
    }
  }

  input.addEventListener("input", () => {
    counts();
    if (live.checked) {
      clearTimeout(timer);
      timer = setTimeout(() => decode(false), 120);
      status.textContent = "Decoding…";
    }
  });

  $("decodeButton").addEventListener("click", () => decode(true));
  $("clearButton").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    counts();
    status.textContent = "Cleared.";
    input.focus();
  });

  $("copyButton").addEventListener("click", async () => {
    if (!output.value) { status.textContent = "There is no result to copy."; return; }
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Copied to clipboard.";
    } catch {
      output.focus(); output.select();
      status.textContent = document.execCommand("copy") ? "Copied to clipboard." : "Select and copy the result manually.";
    }
  });

  $("replaceButton").addEventListener("click", () => {
    input.value = output.value;
    decode(false);
    status.textContent = "Result moved into the input box.";
    input.focus();
  });

  $("downloadButton").addEventListener("click", () => {
    if (!output.value) { status.textContent = "There is no result to download."; return; }
    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "decoded-text.txt"; a.click();
    URL.revokeObjectURL(url);
  });

  counts();
  SmartDecoder.loadDictionary().then(ready => {
    $("engineLabel").textContent = ready
      ? "Engine: full English dictionary loaded"
      : "Engine: built-in fallback dictionary";
    status.textContent = ready
      ? "Dictionary ready. Paste text to begin."
      : "Ready with built-in dictionary; full dictionary could not be loaded.";
    if (input.value && live.checked) decode(false);
  });
})();
