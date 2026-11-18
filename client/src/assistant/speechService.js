// ══════════════════════════════════════════════════════════════
//  LokArt AI Assistant — Speech Service
//
//  TWO recognition engines:
//  1. Web Speech API  → Chrome/Edge, instant, needs internet
//  2. Whisper (ONNX)  → ALL browsers, offline, ~40 MB download once
//
//  Strategy: Try Web Speech API first. If it errors with "network"
//  or the browser doesn't support it, fall back to Whisper.
// ══════════════════════════════════════════════════════════════

// ── Web Speech API helpers ────────────────
let wsInstance = null;

export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  return !!window.speechSynthesis;
}

export function getAvailableVoices(lang = "en-US") {
  if (!isSpeechSynthesisSupported()) return [];
  const prefix = lang.split("-")[0].toLowerCase();
  return window.speechSynthesis
    .getVoices()
    .filter(
      (v) =>
        v.lang.toLowerCase().startsWith(prefix) ||
        v.lang.toLowerCase() === lang.toLowerCase()
    );
}

// ── Whisper Worker singleton ──────────────
let whisperWorker = null;
let pendingWhisperCb = null;

function getWhisperWorker() {
  if (whisperWorker) return whisperWorker;

  whisperWorker = new Worker(
    new URL("./whisperWorker.js", import.meta.url),
    { type: "module" }
  );

  whisperWorker.addEventListener("message", ({ data }) => {
    if (!pendingWhisperCb) return;
    const { onResult, onError, onStatus, onEnd } = pendingWhisperCb;

    switch (data.type) {
      case "progress": {
        const info = data.data || {};
        if (info.status === "downloading" && info.total) {
          const pct = Math.round((info.loaded / info.total) * 100);
          onStatus?.(
            `⬇️ Downloading voice model: ${pct}% (one-time, then cached)`
          );
        } else if (info.status === "loading") {
          onStatus?.("🧠 Loading voice model...");
        } else if (info.status === "initiate") {
          onStatus?.("⬇️ Preparing voice model (first time only)...");
        }
        break;
      }
      case "processing":
        onStatus?.("🧠 Processing your speech...");
        break;
      case "result":
        pendingWhisperCb = null;
        onResult?.(data.text);
        onEnd?.();
        break;
      case "no_speech":
        pendingWhisperCb = null;
        onError?.("No speech detected. Please speak clearly and try again.");
        onEnd?.();
        break;
      case "error":
        pendingWhisperCb = null;
        onError?.("Voice model error: " + data.message);
        onEnd?.();
        break;
      default:
        break;
    }
  });

  return whisperWorker;
}

// ── MediaRecorder for Whisper input ──────
let mediaStream = null;
let mediaRec = null;
let audioChunks = [];
let whisperActive = false;

async function decodeAudioToFloat32(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  // Use 16 kHz — Whisper's native sample rate
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    return decoded.getChannelData(0); // mono Float32Array
  } finally {
    audioCtx.close();
  }
}

// Language code → Whisper language name
const LANG_MAP = {
  "en-US": "english",
  "ne-NP": "nepali",
  "hi-IN": "hindi",
};

// ── Main: start listening (auto-selects engine) ──
export function startListening({
  lang = "en-US",
  onResult,
  onError,
  onEnd,
  onStatus,
  onNetworkRetry,
  forceWhisper = false,
}) {
  stopListening(); // kill any active session

  // Use Whisper if: forced, or Web Speech not supported
  if (forceWhisper || !isSpeechRecognitionSupported()) {
    _startWhisper({ lang, onResult, onError, onEnd, onStatus });
    return;
  }

  // Try Web Speech API first (fast path, Chrome/Edge)
  _startWebSpeech({
    lang,
    onResult,
    onEnd,
    onStatus,
    onError: (errCode, errMsg) => {
      // Network error or service-not-allowed → auto-switch to Whisper
      if (errCode === "network" || errCode === "service-not-allowed") {
        onStatus?.("🔄 Switching to offline voice engine...");
        setTimeout(() => {
          _startWhisper({ lang, onResult, onError, onEnd, onStatus });
        }, 300);
      } else {
        onError?.(errMsg);
      }
    },
  });
}

// ── Web Speech API (Chrome/Edge fast path) ──
function _startWebSpeech({ lang, onResult, onEnd, onStatus, onError }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  wsInstance = new SR();
  wsInstance.lang = lang;
  wsInstance.continuous = false;
  wsInstance.interimResults = false;
  wsInstance.maxAlternatives = 1;

  let gotResult = false;

  wsInstance.onresult = (e) => {
    gotResult = true;
    const text = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join(" ")
      .trim();
    if (text) onResult?.(text);
  };

  wsInstance.onerror = (e) => {
    if (e.error === "aborted") return;

    const msgMap = {
      "not-allowed":
        "🎤 Microphone access denied. Click the camera/mic icon in your browser address bar → Allow microphone → then try again.",
      "no-speech": "No speech detected — please speak clearly.",
      "audio-capture": "Microphone not found. Please check that one is connected.",
      "network": null, // handled by caller — will switch to Whisper
      "service-not-allowed": null, // handled by caller — will switch to Whisper
      "language-not-supported":
        "Selected language not supported. Try English.",
    };

    const userMsg = msgMap[e.error];
    // null = caller decides (network/service errors redirect to Whisper)
    onError?.(e.error, userMsg || `Speech error: ${e.error}`);
  };

  wsInstance.onend = () => {
    wsInstance = null;
    onEnd?.();
  };

  try {
    wsInstance.start();
    onStatus?.("🎤 Listening...");
  } catch (err) {
    if (err.name !== "InvalidStateError") {
      onError?.("start-error", "Could not start microphone: " + err.message);
    }
  }
}

// ── Whisper (MediaRecorder + ONNX in Worker) ──
async function _startWhisper({ lang, onResult, onError, onEnd, onStatus }) {
  if (whisperActive) return;
  whisperActive = true;

  // 1. Request microphone
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000 },
      video: false,
    });
  } catch (err) {
    whisperActive = false;
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      onError?.(
        "🎤 Microphone access denied. Click the camera icon in your browser's address bar → Allow → try again."
      );
    } else if (err.name === "NotFoundError") {
      onError?.("No microphone detected. Please connect one and try again.");
    } else {
      onError?.("Microphone error: " + err.message);
    }
    onEnd?.();
    return;
  }

  // 2. Set up MediaRecorder
  audioChunks = [];
  const mimeType = getSupportedMimeType();
  mediaRec = mimeType
    ? new MediaRecorder(mediaStream, { mimeType })
    : new MediaRecorder(mediaStream);

  mediaRec.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRec.onstop = async () => {
    // Release mic
    mediaStream?.getTracks().forEach((t) => t.stop());
    mediaStream = null;
    whisperActive = false;

    if (audioChunks.length === 0) {
      onError?.("No audio was recorded.");
      onEnd?.();
      return;
    }

    // 3. Decode audio → Float32 → send to Whisper worker
    try {
      const blob = new Blob(audioChunks, { type: mimeType || "audio/webm" });
      let float32;
      try {
        float32 = await decodeAudioToFloat32(blob);
      } catch (decodeErr) {
        onError?.("Could not decode audio. Please try again.");
        onEnd?.();
        return;
      }

      const whisperLang = LANG_MAP[lang] || "english";
      const worker = getWhisperWorker();

      pendingWhisperCb = { onResult, onError, onEnd, onStatus };
      worker.postMessage({ type: "transcribe", audio: float32, language: whisperLang });
    } catch (err) {
      onError?.("Processing error: " + err.message);
      onEnd?.();
    }
  };

  mediaRec.start();
  onStatus?.("🎤 Recording... tap the mic button again to stop");
}

// Find supported audio MIME type
function getSupportedMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

// ── Stop all listening ────────────────────
export function stopListening() {
  // Stop Web Speech
  if (wsInstance) {
    try { wsInstance.abort(); } catch (_) {}
    wsInstance = null;
  }

  // Stop Whisper recording → triggers onstop → transcription
  if (mediaRec && mediaRec.state !== "inactive") {
    try { mediaRec.stop(); } catch (_) {}
  }
  mediaRec = null;
}

export function isWhisperRecording() {
  return whisperActive;
}

// ── Speech Synthesis (TTS) ────────────────
let currentUtterance = null;

export function speak({ text, lang = "en-US", rate = 0.95, pitch = 1, onEnd, onError }) {
  if (!isSpeechSynthesisSupported()) { onEnd?.(); return; }

  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const prefix = lang.split("-")[0].toLowerCase();
  const matched = window.speechSynthesis
    .getVoices()
    .find(
      (v) =>
        v.lang.toLowerCase() === lang.toLowerCase() ||
        v.lang.toLowerCase().startsWith(prefix)
    );
  if (matched) utterance.voice = matched;

  utterance.onend = () => { currentUtterance = null; onEnd?.(); };
  utterance.onerror = (e) => {
    currentUtterance = null;
    if (e.error !== "interrupted") onError?.(e.error);
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking() {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
}
