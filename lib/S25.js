'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Standard 2 of 5
 *
 * TODO I25 and S25 ._ 1/3 or 1/2 for the big bar
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
function S25() {
    Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    this._code = [
        '0000202000',   /* 0 */
        '2000000020',   /* 1 */
        '0020000020',   /* 2 */
        '2020000000',   /* 3 */
        '0000200020',   /* 4 */
        '2000200000',   /* 5 */
        '0020200000',   /* 6 */
        '0000002020',   /* 7 */
        '2000002000',   /* 8 */
        '0020002000'    /* 9 */
    ];

    this.setChecksum(false);
};

inherits(S25, Barcode1D);

/**
 * Sets if we display the checksum.
 *
 * @param bool checksum
 */
S25.prototype.setChecksum = function(checksum) {
    this.__checksum = !!checksum;
};

/**
 * Draws the barcode.
 *
 * @param resource im
 */
S25.prototype.draw = function(im) {
    var temp_text = this._text;

    // Checksum
    if (this.__checksum === true) {
        this._calculateChecksum();
        temp_text += this._keys[this._checksumValue];
    }

    // Starting Code
    this._drawChar(im, '101000', true);

    // Chars
    var c = temp_text.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this._findCode(temp_text[i]), true);
    }

    // Ending Code
    this._drawChar(im, '10001', true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
S25.prototype.getDimension = function(w, h) {
    var c = this._text.length;
    var startlength = 8;
    var textlength = c * 14;
    var checksumlength = 0;
    if (c % 2 !== 0) {
        checksumlength = 14;
    }

    var endlength = 7;

    w += startlength + textlength + checksumlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
S25.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('S25', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('S25', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    // Must be even
    if (c % 2 !== 0 && this.__checksum === false) {
        throw new ParseException('S25', 'S25 must contain an even amount of digits if checksum is false.');
    } else if (c % 2 === 0 && this.__checksum === true) {
        throw new ParseException('S25', 'S25 must contain an odd amount of digits if checksum is true.');
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
S25.prototype._calculateChecksum = function() {
    // Calculating Checksum
    // Consider the right-most digit of the message to be in an "even" position,
    // and assign odd/even to each character moving from right to left
    // Even Position = 3, Odd Position = 1
    // Multiply it by the number
    // Add all of that and do 10-(?mod10)
    var even = true;
    this._checksumValue = 0;
    var c = this._text.length;
    var multiplier;
    for (var i = c; i > 0; i--) {
        if (even === true) {
            multiplier = 3;
            even = false;
        } else {
            multiplier = 1;
            even = true;
        }

        this._checksumValue += this._keys[this._text[i - 1]] * multiplier;
    }
    this._checksumValue = (10 - this._checksumValue % 10) % 10;
};

/**
 * Overloaded method to display the checksum.
 */
S25.prototype._processChecksum = function() {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }

    if (this._checksumValue !== false) {
        return this._keys[this._checksumValue];
    }

    return false;
};

module.exports = S25;