const BOM = 0xFEFF

/**
 * Strip Byte Order Mark (BOM) from beginning of string
 * @param {string} str
 * @returns {string}
 */
function stripBOM (str) {
  if (str.charCodeAt(0) === BOM) return str.slice(1)
  return str
}

module.exports = {stripBOM}
