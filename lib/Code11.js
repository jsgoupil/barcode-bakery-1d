'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Code 11
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
function Code11() {
    Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'];
    this._code = [    // 0 added to add an extra space
        '000010',   /* 0 */
        '100010',   /* 1 */
        '010010',   /* 2 */
        '110000',   /* 3 */
        '001010',   /* 4 */
        '101000',   /* 5 */
        '011000',   /* 6 */
        '000110',   /* 7 */
        '100100',   /* 8 */
        '100000',   /* 9 */
        '001000'    /* - */
    ];
}

inherits(Code11, Barcode1D);

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Code11.prototype.draw = function(im) {
    // Starting Code
    this._drawChar(im, '001100', true);

    // Chars
    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this._findCode(this._text[i]), true);
    }

    // Checksum
    this._calculateChecksum();
    c = this._checksumValue.length;
    for (i = 0; i < c; i++) {
        this._drawChar(im, this._code[this._checksumValue[i]], true);
    }

    // Ending Code
    this._drawChar(im, '00110', true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Code11.prototype.getDimension = function (w, h) {
    var startlength = 8;

    var textlength = 0;
    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        textlength += this._getIndexLength(this._findIndex(this._text[i]));
    }

    var checksumlength = 0;
    this._calculateChecksum();
    c = this._checksumValue.length;
    for (var i = 0; i < c; i++) {
        checksumlength += this._getIndexLength(this._checksumValue[i]);
    }
    
    var endlength = 7;
    
    w += startlength + textlength + checksumlength + endlength;
    h += this._thickness;

    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
Code11.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Code11', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Code11', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Code11.prototype._calculateChecksum = function() {
    // Checksum
    // First CheckSUM "C"
    // The "C" checksum character is the modulo 11 remainder of the sum of the weighted
    // value of the data characters. The weighting value starts at "1" for the right-most
    // data character, 2 for the second to last, 3 for the third-to-last, and so on up to 20.
    // After 10, the sequence wraps around back to 1.

    // Second CheckSUM "K"
    // Same as CheckSUM "C" but we count the CheckSum "C" at the end
    // After 9, the sequence wraps around back to 1.
    var sequence_multiplier = [10, 9];
    var temp_text = this._text;
    this._checksumValue = [];
    for (var z = 0; z < 2; z++) {
        var c = temp_text.length;

        // We don't display the K CheckSum if the original text had a length less than 10
        if (c <= 10 && z === 1) {
            break;
        }

        var checksum = 0;
        for (var i = c, j = 0; i > 0; i--, j++) {
            var multiplier = i % sequence_multiplier[z];
            if (multiplier === 0) {
                multiplier = sequence_multiplier[z];
            }

            checksum += this._findIndex(temp_text[j]) * multiplier;
        }

        this._checksumValue[z] = checksum % 11;
        temp_text += this._keys[this._checksumValue[z]];
    }
};

/**
 * Overloaded method to display the checksum.
 */
Code11.prototype._processChecksum = function () {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }
    
    if (this._checksumValue !== false) {
        var ret = '';
        var c = this._checksumValue.length;
        for (var i = 0; i < c; i++) {
            ret += this._keys[this._checksumValue[i]];
        }
        
        return ret;
    }
    
    return false;
};

Code11.prototype._getIndexLength = function (index) {
    var length = 0;
    if (index !== -1) {
        length += 6;
        length += Utility.substrCount(this._code[index], "1");
    }
    
    return length;
};

module.exports = Code11;