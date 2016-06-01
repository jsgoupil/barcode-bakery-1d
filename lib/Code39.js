'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Code 39
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
function Code39() {
    Barcode1D.call(this);
    
    this._starting = this._ending = 43;
    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-', '.', ' ', '', '/', '+', '%', '*'];
    this._code = [     // 0 added to add an extra space
        '0001101000',   /* 0 */
        '1001000010',   /* 1 */
        '0011000010',   /* 2 */
        '1011000000',   /* 3 */
        '0001100010',   /* 4 */
        '1001100000',   /* 5 */
        '0011100000',   /* 6 */
        '0001001010',   /* 7 */
        '1001001000',   /* 8 */
        '0011001000',   /* 9 */
        '1000010010',   /* A */
        '0010010010',   /* B */
        '1010010000',   /* C */
        '0000110010',   /* D */
        '1000110000',   /* E */
        '0010110000',   /* F */
        '0000011010',   /* G */
        '1000011000',   /* H */
        '0010011000',   /* I */
        '0000111000',   /* J */
        '1000000110',   /* K */
        '0010000110',   /* L */
        '1010000100',   /* M */
        '0000100110',   /* N */
        '1000100100',   /* O */
        '0010100100',   /* P */
        '0000001110',   /* Q */
        '1000001100',   /* R */
        '0010001100',   /* S */
        '0000101100',   /* T */
        '1100000010',   /* U */
        '0110000010',   /* V */
        '1110000000',   /* W */
        '0100100010',   /* X */
        '1100100000',   /* Y */
        '0110100000',   /* Z */
        '0100001010',   /* - */
        '1100001000',   /* . */
        '0110001000',   /*   */
        '0101010000',   /*  */
        '0101000100',   /* / */
        '0100010100',   /* + */
        '0001010100',   /* % */
        '0100101000'    /* * */
    ];

    this.setChecksum(false);
}

inherits(Code39, Barcode1D);

/**
 * Sets if we display the checksum.
 *
 * @param bool checksum
 */
Code39.prototype.setChecksum = function(checksum) {
    this._checksum = !!checksum;
};

/**
 * Parses the text before displaying it.
 *
 * @param mixed text
 */
Code39.prototype.parse = function(text) {
    Barcode1D.prototype.parse.call(this, text.toUpperCase());
};

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Code39.prototype.draw = function(im) {
    // Starting *
    this._drawChar(im, this._code[this._starting], true);

    // Chars
    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this._findCode(this._text[i]), true);
    }

    // Checksum (rarely used)
    if (this._checksum === true) {
        this._calculateChecksum();
        this._drawChar(im, this._code[this._checksumValue % 43], true);
    }

    // Ending *
    this._drawChar(im, this._code[this._ending], true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Code39.prototype.getDimension = function(w, h) {
    var textlength = 13 * this._text.length;
    var startlength = 13;
    var checksumlength = 0;
    if (this._checksum === true) {
        checksumlength = 13;
    }

    var endlength = 13;

    w += startlength + textlength + checksumlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
Code39.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Code39', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Code39', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    if (this._text.indexOf('*') !== -1) {
        throw new ParseException('Code39', 'The character \'*\' is not allowed.');
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Code39.prototype._calculateChecksum = function() {
    this._checksumValue = 0;
    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        this._checksumValue += this._findIndex(this._text[i]);
    }

    this._checksumValue = this._checksumValue % 43;
};

/**
 * Overloaded method to display the checksum.
 */
Code39.prototype._processChecksum = function() {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }

    if (this._checksumValue !== false) {
        return this._keys[this._checksumValue];
    }

    return false;
};

module.exports = Code39;