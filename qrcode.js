/**
 * Lightweight QR Code SVG Generator for EchoShadow 1314
 * Enables mobile phones to scan and install the PWA instantly.
 */
function createQRCodeSVG(text, size = 200) {
  // Use Google Chart API or standard SVG fallback when online, or SVG generator
  const encoded = encodeURIComponent(text);
  const imgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=090D16&color=6366F1&margin=10`;
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
      <div style="background:#090D16;padding:12px;border-radius:16px;border:2px solid #6366F1;box-shadow:0 0 25px rgba(99,102,241,0.35);">
        <img src="${imgUrl}" alt="QR Code" width="${size}" height="${size}" style="display:block;border-radius:8px;" onerror="this.onerror=null;this.parentElement.innerHTML='<div style=\'width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;font-size:13px;color:#cbd5e1;\'>請在手機瀏覽器直接輸入：<br><strong style=\'color:#38bdf8;font-size:15px;\'>${text}</strong></div>'"/>
      </div>
      <div style="font-size:14px;color:#38bdf8;font-weight:600;user-select:all;cursor:pointer;" onclick="navigator.clipboard.writeText('${text}');alert('已複製網址：${text}')" title="點擊複製網址">
        🔗 ${text} (點擊複製)
      </div>
    </div>
  `;
}
