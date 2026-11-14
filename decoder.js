/* Smart Text Decoder: dictionary-assisted English word reconstruction. */
(function (global) {
  "use strict";

  const FALLBACK_WORDS = (
    "a i an and are as at be been but by can do for from had has have he her hers him his how " +
    "i if in into is it its just me my no not of on or our out she so than that the their them " +
    "there these they this to too up us was we were what when where which who will with would " +
    "you your hello world test text host website smart decoder decode readable sentence words " +
    "this is a good example welcome home please thank thanks have been are was were can could " +
    "make made get got go going see look use using want need about after again all also any " +
    "because before between both come day did different every first found give great here high " +
    "important know like little long many more most much new next now only other over people " +
    "right same say some such take tell then think through time two very well work year"
  ).split(/\s+/);

  const commonRank = new Map();
  const fallbackSet = new Set(FALLBACK_WORDS);
  FALLBACK_WORDS.forEach((word, index) => commonRank.set(word, index + 1));

  let dictionary = new Set(FALLBACK_WORDS);
  let dictionaryReady = false;

  function loadDictionary() {
    return Promise.all([
      fetch("words.txt").then(r => r.ok ? r.text() : "").catch(() => ""),
      fetch("common-words.txt").then(r => r.ok ? r.text() : "").catch(() => "")
    ]).then(([allWords, frequentWords]) => {
      if (allWords) {
        for (const word of allWords.toLowerCase().split(/\s+/)) {
          if (/^[a-z]+$/.test(word)) dictionary.add(word);
        }
      }
      if (frequentWords) {
        let rank = 1;
        for (const word of frequentWords.toLowerCase().split(/\s+/)) {
          if (/^[a-z]+$/.test(word) && !commonRank.has(word)) commonRank.set(word, rank);
          rank++;
        }
      }
      dictionaryReady = Boolean(allWords);
      return dictionaryReady;
    });
  }

  function wordScore(word) {
    if (commonRank.has(word)) {
      const rank = commonRank.get(word);
      return 8.5 + Math.log(10001 - Math.min(rank, 10000)) * 0.8;
    }
    if (dictionary.has(word)) return 4.0 + Math.min(word.length, 12) * 0.12;
    return -Infinity;
  }

  function segmentLetters(raw) {
    const text = raw.toLowerCase().replace(/[^a-z]/g, "");
    if (!text) return raw;
    if (text.length < 4) return raw;

    const n = text.length;
    const best = Array(n + 1).fill(null);
    best[0] = { score: 0, words: [] };

    for (let i = 0; i < n; i++) {
      if (!best[i]) continue;
      const maxLen = Math.min(20, n - i);
      for (let len = 1; len <= maxLen; len++) {
        const word = text.slice(i, i + len);
        if (len === 1 && word !== "a" && word !== "i") continue;
        const score = wordScore(word);
        if (!Number.isFinite(score)) continue;
        const next = i + len;
        const candidateScore = best[i].score + score - 1.15;
        if (!best[next] || candidateScore > best[next].score) {
          best[next] = { score: candidateScore, words: best[i].words.concat(word) };
        }
      }
    }

    if (!best[n] || best[n].words.length === 0) return raw;
    const result = best[n].words.join(" ");
    // Do not force a low-confidence or implausibly fragmented interpretation.
    if (best[n].words.length > Math.ceil(text.length / 2)) return raw;
    return restoreCase(raw, result);
  }

  function restoreCase(original, decoded) {
    if (original && original === original.toUpperCase()) return decoded.toUpperCase();
    if (original && original[0] === original[0].toUpperCase()) {
      return decoded.charAt(0).toUpperCase() + decoded.slice(1);
    }
    return decoded;
  }

  function decodeDottedMatch(match) {
    const parts = match.split(".").filter(Boolean);
    if (!parts.length) return match;

    const output = [];
    let singles = [];

    function flushSingles() {
      if (!singles.length) return;
      output.push(segmentLetters(singles.join("")));
      singles = [];
    }

    for (const part of parts) {
      if (/^[A-Za-z0-9]$/.test(part)) {
        singles.push(part);
      } else {
        flushSingles();
        output.push(part);
      }
    }
    flushSingles();
    return output.join(" ");
  }

  function decodeLine(line) {
    // Dotted groups: multi-letter chunks separated by dots are words;
    // runs of single letters are joined and dictionary-segmented.
    let text = line.replace(/[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)+\.?/g, decodeDottedMatch);

    // Single spaces separate encoded letters; 2+ spaces separate words.
    const chunks = text.split(/(\s{2,})/);
    text = chunks.map(chunk => {
      if (/^\s{2,}$/.test(chunk)) return " ";
      if (!chunk.trim()) return chunk;
      const tokens = chunk.trim().split(/\s+/);
      if (tokens.length > 1 && tokens.every(token => /^[A-Za-z]$/.test(token))) {
        return segmentLetters(tokens.join(""));
      }
      return chunk;
    }).join("");

    return text;
  }

  function decodeText(value) {
    return value.split(/\r\n|\r|\n/).map(decodeLine).join("\n");
  }

  global.SmartDecoder = {
    decodeText,
    loadDictionary,
    get dictionaryReady() { return dictionaryReady; }
  };
})(window);
