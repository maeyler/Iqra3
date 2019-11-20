"use strict";
/**
 * The code version.
 */
const VERSION = "V3.13a";

/**
 * Location for data files
 */
const DATA_URL = "https://maeyler.github.io/Iqra3/data/";

/**
 * Translating Arabic letters to Buckwalter.
 * 
 * uses BWC object in src="buckwalter.js"
 * code from https://github.com/stts-se/buckwalter-converter
 *
 * @param {string} s  Arabic string 
 * @returns {string}  Buckwalter transliteration 
 */
function toBuckwalter(s) {
    return BWC.convert(BWC.a2bMap, s).output
}

/**
 * Translating to Arabic letters back from Buckwalter.
 * 
 * @param {string} s  Buckwalter transliteration
 * @returns {string}  Arabic string
 */
function toArabic(s) {
    return BWC.convert(BWC.b2aMap, s).output
}

