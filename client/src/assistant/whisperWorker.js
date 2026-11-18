// ══════════════════════════════════════════
//  LokArt AI Assistant — Whisper Web Worker
//  Runs entirely in browser — no Google/cloud
//  Uses: @xenova/transformers (ONNX Runtime)
// ══════════════════════════════════════════

import { pipeline, env } from "@xenova/transformers";

// Allow remote model download, cache locally in browser
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1; // stable single-thread for Workers

// Singleton — model is loaded once and reused across transcriptions
class WhisperSingleton {
  static MODEL = "Xenova/whisper-tiny"; // ~40 MB, multilingual (EN + NE + HI)
  static instance = null;

  static async getInstance(progress_callback) {
    if (!this.instance) {
      this.instance = await pipeline(
        "automatic-speech-recognition",
        this.MODEL,
        { progress_callback }
      );
    }
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  const { type, audio, language } = event.data;

  if (type === "transcribe") {
    try {
      // Load (or reuse cached) model — reports download progress on first run
      const transcriber = await WhisperSingleton.getInstance((info) => {
        self.postMessage({ type: "progress", data: info });
      });

      self.postMessage({ type: "processing" });

      const result = await transcriber(audio, {
        language: language || "english",
        task: "transcribe",
        chunk_length_s: 30,
        return_timestamps: false,
      });

      const text = (result?.text || "").trim();
      if (text) {
        self.postMessage({ type: "result", text });
      } else {
        self.postMessage({ type: "no_speech" });
      }
    } catch (err) {
      self.postMessage({ type: "error", message: err.message });
    }
  }
});
