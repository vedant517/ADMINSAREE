const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeValue = (value) => {
  const cleaned = String(value || "ITEM").replace(/[^\x20-\x7e]/g, "").trim();
  return cleaned || "ITEM";
};

export const createCode128Svg = (value, options = {}) => {
  const text = normalizeValue(value);
  const height = Number(options.height || 58);
  const moduleWidth = Number(options.moduleWidth || 2);
  const quietZone = Number(options.quietZone ?? 10);
  const codes = [104];

  for (const char of text) {
    const code = char.charCodeAt(0);
    codes.push(code >= 32 && code <= 126 ? code - 32 : 0);
  }

  const checksum = codes.reduce((sum, code, index) => sum + code * (index === 0 ? 1 : index), 0) % 103;
  codes.push(checksum, 106);

  let x = quietZone;
  const bars = [];
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    for (let i = 0; i < pattern.length; i += 1) {
      const width = Number(pattern[i]) * moduleWidth;
      if (i % 2 === 0) {
        bars.push(`<rect x="${x}" y="0" width="${width}" height="${height}" />`);
      }
      x += width;
    }
  }

  const width = x + quietZone;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height + 22}" width="${width}" height="${height + 22}" role="img" aria-label="Barcode ${escapeXml(text)}"><rect width="${width}" height="${height + 22}" fill="#fff"/><g fill="#111">${bars.join("")}</g><text x="${width / 2}" y="${height + 16}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" letter-spacing="1">${escapeXml(text)}</text></svg>`;
};
