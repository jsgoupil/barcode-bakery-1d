'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - MSI Plessey
 *
 *--------------------------------------------------------------------
 * Copyright (C) Jean-Sebastien Goupil
 * http://www.barcodebakery.com
 */
var inherits = require('util').inherits;
var barcodeBakeryCommon = require('barcode-bakery-common');
var Barcode1D = barcodeBakeryCommon.Barcode1D;
var ParseException = barcodeBakeryCommon.ParseException;
var ArgumentException = barcodeBakeryCommon.ArgumentException;
var Utility = barcodeBakeryCommon.Utility;

/**
 * Constructor.
 */
function Msi() {
        Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    this._code = [
        '01010101',     /* 0 */
        '01010110',     /* 1 */
        '01011001',     /* 2 */
        '01011010',     /* 3 */
        '01100101',     /* 4 */
        '01100110',     /* 5 */
        '01101001',     /* 6 */
        '01101010',     /* 7 */
        '10010101',     /* 8 */
        '10010110'      /* 9 */
    ];

    this.setChecksum(0);
}

inherits(Msi, Barcode1D);

/**
 * Sets how many checksums we display. 0 to 2.
 *
 * @param int checksum
 */
Msi.prototype.setChecksum = function(checksum) {
    checksum = parseInt(checksum, 10);
    if (checksum < 0 && checksum > 2) {
        throw new ArgumentException('The checksum must be between 0 and 2 included.', 'checksum');
    }

    this.__checksum = checksum;
};

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Msi.prototype.draw = function(im) {
    // Checksum
    this._calculateChecksum();

    // Starting Code
    this._drawChar(im, '10', true);

    // Chars
    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this._findCode(this._text[i]), true);
    }

    c = this._checksumValue.length;
    for (i = 0; i < c; i++) {
        this._drawChar(im, this._findCode(this._checksumValue[i]), true);
    }

    // Ending Code
    this._drawChar(im, '010', true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Msi.prototype.getDimension = function(w, h) {
    var textlength = 12 * this._text.length;
    var startlength = 3;
    var checksumlength = this.__checksum * 12;
    var endlength = 4;

    w += startlength + textlength + checksumlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
Msi.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Msi', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Msi', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Msi.prototype._calculateChecksum = function() {
    // Forming a new number
    // If the original number is even, we take all even position
    // If the original number is odd, we take all odd position
    // 123456 = 246
    // 12345 = 135
    // Multiply by 2
    // Add up all the digit in the result (270 : 2+7+0)
    // Add up other digit not used.
    // 10 - (? Modulo 10). If result = 10, change to 0
    var last_text = this._text;
    this._checksumValue = [];
    for (var i = 0; i < this.__checksum; i++) {
        var new_text = '';
        var new_number = 0;
        var c = last_text.length;
        var starting;
        if (c % 2 === 0) { // Even
            starting = 1;
        } else {
            starting = 0;
        }

        for (var j = starting; j < c; j += 2) {
            new_text += last_text[j];
        }

        new_text = String(parseInt(new_text, 10) * 2);
        var c2 = new_text.length;
        for (j = 0; j < c2; j++) {
            new_number += parseInt(new_text[j], 10);
        }

        for (j = (starting === 0) ? 1 : 0; j < c; j += 2) {
            new_number += parseInt(last_text[j], 10);
        }

        new_number = (10 - new_number % 10) % 10;
        this._checksumValue.push(new_number);
        last_text += new_number;
    }
};

/**
 * Overloaded method to display the checksum.
 */
Msi.prototype._processChecksum = function() {
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

module.exports = Msi;