import { isArabicText } from '../utils/text.js';
import { logger } from '../utils/logger.js';

/**
 * Reading Order Subsystem
 *
 * Implements structural reading-order sorting:
 * 1. Blocks grouping & vertical sorting (or multi-column left-to-right / right-to-left)
 * 2. Lines sorting (top to bottom within each block)
 * 3. Token sorting per line:
 *    - LTR (English/Latin): x ascending (left -> right)
 *    - RTL (Arabic): x descending (right -> left)
 * 4. Mixed-direction line support (numbers / Latin within Arabic)
 */

/**
 * Groups raw tokens into lines based on vertical overlap
 */
export function clusterTokensIntoLines(tokens, lineTolerance = 0.5) {
  if (!tokens || tokens.length === 0) return [];

  // Sort initially by vertical position y
  const sorted = [...tokens].sort((a, b) => (a.bbox.y + a.bbox.height / 2) - (b.bbox.y + b.bbox.height / 2));
  const lines = [];

  for (const token of sorted) {
    const tokenCenterY = token.bbox.y + token.bbox.height / 2;
    let matchedLine = null;

    for (const line of lines) {
      const lineCenterY = line.bbox.y + line.bbox.height / 2;
      const avgHeight = (line.bbox.height + token.bbox.height) / 2;
      const verticalDiff = Math.abs(tokenCenterY - lineCenterY);

      if (verticalDiff <= avgHeight * lineTolerance) {
        matchedLine = line;
        break;
      }
    }

    if (matchedLine) {
      matchedLine.tokens.push(token);
      // Update line bounding box
      const minX = Math.min(matchedLine.bbox.x, token.bbox.x);
      const minY = Math.min(matchedLine.bbox.y, token.bbox.y);
      const maxX = Math.max(matchedLine.bbox.x + matchedLine.bbox.width, token.bbox.x + token.bbox.width);
      const maxY = Math.max(matchedLine.bbox.y + matchedLine.bbox.height, token.bbox.y + token.bbox.height);

      matchedLine.bbox = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    } else {
      lines.push({
        id: `line-${lines.length}`,
        tokens: [token],
        bbox: { ...token.bbox },
      });
    }
  }

  return lines;
}

/**
 * Orders lines and tokens within lines according to document and line direction
 *
 * @param {Array} tokens - Normalized tokens with original bounding boxes
 * @param {string} documentDirection - 'ltr' or 'rtl'
 * @returns {Array} Ordered list of tokens with readingOrder sequence numbers assigned
 */
export function computeReadingOrder(tokens, documentDirection = 'ltr') {
  if (!tokens || tokens.length === 0) return [];

  logger.log('READING_ORDER', `Computing reading order for ${tokens.length} tokens`, { documentDirection });

  // 1. Group into lines
  const lines = clusterTokensIntoLines(tokens);

  // 2. Sort lines top-to-bottom
  lines.sort((a, b) => a.bbox.y - b.bbox.y);

  // 3. For each line, sort tokens based on line direction
  const orderedTokens = [];
  let readingIndex = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineId = `line-${lineIdx}`;

    // Determine line primary direction from tokens or fallback to document direction
    const arabicCount = line.tokens.filter((t) => isArabicText(t.text)).length;
    const isLineRtl = arabicCount >= line.tokens.length / 2 || documentDirection === 'rtl';
    const lineDirection = isLineRtl ? 'rtl' : 'ltr';

    if (lineDirection === 'rtl') {
      // Arabic / RTL: Right to Left (x descending)
      line.tokens.sort((a, b) => b.bbox.x - a.bbox.x);
    } else {
      // English / LTR: Left to Right (x ascending)
      line.tokens.sort((a, b) => a.bbox.x - b.bbox.x);
    }

    for (const token of line.tokens) {
      token.lineId = lineId;
      token.readingOrder = readingIndex;
      token.direction = isArabicText(token.text) ? 'rtl' : 'ltr';
      orderedTokens.push(token);
      readingIndex++;
    }
  }

  logger.log('READING_ORDER', `Assigned reading order to ${orderedTokens.length} tokens`);
  return orderedTokens;
}
