'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Codabar
 *
 *--------------------------------------------------------------------
 * Copyright (C) Jean-Sebastien Goupil
 * http://www.barcodebakery.com
 */
var inherits = require('util').inherits;
var barcodeBakeryCommon = require('barcode-bakery-common');
var Barcode1D = barcodeBakeryCommon.Barcode1D;
var ParseException = barcodeBakeryCommon.ParseException;
var Utility = barcodeBakeryCommon.Utility;

/**
 * Constructor.
 */
function Codabar() {
    Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '', ':', '/', '.', '+', 'A', 'B', 'C', 'D'];
    this._code = [    // 0 added to add an extra space
        '00000110',     /* 0 */
        '00001100',     /* 1 */
        '00010010',     /* 2 */
        '11000000',     /* 3 */
        '00100100',     /* 4 */
        '10000100',     /* 5 */
        '01000010',     /* 6 */
        '01001000',     /* 7 */
        '01100000',     /* 8 */
        '10010000',     /* 9 */
        '00011000',     /* - */
        '00110000',     /*  */
        '10001010',     /* : */
        '10100010',     /* / */
        '10101000',     /* . */
        '00111110',     /* + */
        '00110100',     /* A */
        '01010010',     /* B */
        '00010110',     /* C */
        '00011100'      /* D */
    ];
}

inherits(Codabar, Barcode1D);

/**
 * Parses the text before displaying it.
 *
 * @param mixed text
 */
Codabar.prototype.parse = function(text) {
    Barcode1D.prototype.parse.call(this, text.toUpperCase()); // Only Capital Letters are Allowed
}

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Codabar.prototype.draw = function(im) {
    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this._findCode(this._text[i]), true);
    }

    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Codabar.prototype.getDimension = function(w, h) {
    var textLength = 0,
        c = this._text.length,
        index;
    for (var i = 0; i < c; i++) {
        index = this._findIndex(this._text[i]);
        if (index !== false) {
            textLength += 8;
            textLength += Utility.substrCount(this._code[index], '1');
        }
    }

    w += textLength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
Codabar.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Codabar', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Codabar', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    // Must start by A, B, C or D
    if (c == 0 || (this._text[0] !== 'A' && this._text[0] !== 'B' && this._text[0] !== 'C' && this._text[0] !== 'D')) {
        throw new ParseException('Codabar', 'The text must start by the character A, B, C, or D.');
    }

    // Must end by A, B, C or D
    var c2 = c - 1;
    if (c2 === 0 || (this._text[c2] !== 'A' && this._text[c2] !== 'B' && this._text[c2] !== 'C' && this._text[c2] !== 'D')) {
        throw new ParseException('Codabar', 'The text must end by the character A, B, C, or D.');
    }

    Barcode1D.prototype._validate.call(this);
};

module.exports = Codabar;