'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Interleaved 2 of 5
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
function I25() {
    Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    this._code = [
        '00110',    /* 0 */
        '10001',    /* 1 */
        '01001',    /* 2 */
        '11000',    /* 3 */
        '00101',    /* 4 */
        '10100',    /* 5 */
        '01100',    /* 6 */
        '00011',    /* 7 */
        '10010',    /* 8 */
        '01010'     /* 9 */
    ];

    this.setChecksum(false);
    this.setRatio(2);
}

inherits(I25, Barcode1D);

/**
 * Sets the checksum.
 *
 * @param bool checksum
 */
I25.prototype.setChecksum = function(checksum) {
    this._checksum = !!checksum;
};

/**
 * Sets the ratio of the black bar compared to the white bars.
 *
 * @param int ratio
 */
I25.prototype.setRatio = function(ratio) {
    this._ratio = parseInt(ratio, 10);
};

/**
 * Draws the barcode.
 *
 * @param resource im
 */
I25.prototype.draw = function(im) {
    var temp_text = this._text;

    // Checksum
    if (this._checksum === true) {
        this._calculateChecksum();
        temp_text += this._keys[this._checksumValue];
    }

    // Starting Code
    this._drawChar(im, '0000', true);

    // Chars
    var c = temp_text.length;
    for (var i = 0; i < c; i += 2) {
        var temp_bar = '';
        var c2 = this._findCode(temp_text[i]).length;
        for (var j = 0; j < c2; j++) {
            temp_bar += this._findCode(temp_text[i]).substr(j, 1);
            temp_bar += this._findCode(temp_text[i + 1]).substr(j, 1);
        }

        this._drawChar(im, this.__changeBars(temp_bar), true);
    }

    // Ending Code
    this._drawChar(im, this.__changeBars('100'), true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
I25.prototype.getDimension = function(w, h) {
    var textlength = (3 + (this._ratio + 1) * 2) * this._text.length;

    var startlength = 4;
    var checksumlength = 0;
    if (this._checksum === true) {
        checksumlength = (3 + (this._ratio + 1) * 2);
    }

    var endlength = 2 + (this._ratio + 1);

    w += startlength + textlength + checksumlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
}

/**
 * Validates the input.
 */
I25.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('I25', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('I25', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    // Must be even
    if (c % 2 !== 0 && this._checksum === false) {
        throw new ParseException('I25', 'I25 must contain an even amount of digits if checksum is false.');
    } else if (c % 2 === 0 && this._checksum === true) {
        throw new ParseException('I25', 'I25 must contain an odd amount of digits if checksum is true.');
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
I25.prototype._calculateChecksum = function() {
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
I25.prototype._processChecksum = function() {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }

    if (this._checksumValue !== false) {
        return this._keys[this._checksumValue];
    }

    return false;
};

/**
 * Changes the size of the bars based on the ratio
 *
 * @param string bar
 * @return string
 */
I25.prototype.__changeBars = function(bar) {
    var arr = bar.split('');
    if (this._ratio > 1) {
        var c = arr.length;
        for (var i = 0; i < c; i++) {
            arr[i] = arr[i] === '1' ? this._ratio.toString() : arr[i];
        }
    }

    return arr.join('');
};


module.exports = I25;