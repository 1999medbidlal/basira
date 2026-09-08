// Cloudflare Pages Function: /api/health
export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    status: "HEALTHY",
    service: "Basira - Visual Reading Assistant",
    version: "1.0.0-PROD",
    edge_colo: context.request.cf?.colo || "EDGE-CF",
    features: ["Tesseract.js WebAssembly OCR", "Interactive Dynamic Highlighting", "TTS Narration Reader"],
    timestamp: new Date().toISOString()
  }, null, 2), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
