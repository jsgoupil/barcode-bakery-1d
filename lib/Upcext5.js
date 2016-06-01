'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - UPC Supplemental Barcode 2 digits
 *
 * Working with UPC-A, UPC-E, EAN-13, EAN-8
 * This includes 5 digits (normaly for suggested retail price)
 * Must be placed next to UPC or EAN Code
 * If 90000 -> No suggested Retail Price
 * If 99991 -> Book Complimentary (normally free)
 * If 90001 to 98999 -> Internal Purpose of Publisher
 * If 99990 -> Used by the National Association of College Stores to mark used books
 * If 0xxxx -> Price Expressed in British Pounds (xx.xx)
 * If 5xxxx -> Price Expressed in U.S. dollars (US$xx.xx)
 *
 *--------------------------------------------------------------------
 * Copyright (C) Jean-Sebastien Goupil
 * http://www.barcodebakery.com
 */
var inherits = require('util').inherits;
var barcodeBakeryCommon = require('barcode-bakery-common');
var Barcode1D = barcodeBakeryCommon.Barcode1D;
var ParseException = barcodeBakeryCommon.ParseException;
var Label = barcodeBakeryCommon.Label;
var Utility = barcodeBakeryCommon.Utility;

/**
 * Constructor.
 */
function Upcext5() {
    Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    this._code = [
        '2100',     /* 0 */
        '1110',     /* 1 */
        '1011',     /* 2 */
        '0300',     /* 3 */
        '0021',     /* 4 */
        '0120',     /* 5 */
        '0003',     /* 6 */
        '0201',     /* 7 */
        '0102',     /* 8 */
        '2001'      /* 9 */
    ];

    // Parity, 0=Odd, 1=Even. Depending Checksum
    this._codeParity = [
        [1, 1, 0, 0, 0],   /* 0 */
        [1, 0, 1, 0, 0],   /* 1 */
        [1, 0, 0, 1, 0],   /* 2 */
        [1, 0, 0, 0, 1],   /* 3 */
        [0, 1, 1, 0, 0],   /* 4 */
        [0, 0, 1, 1, 0],   /* 5 */
        [0, 0, 0, 1, 1],   /* 6 */
        [0, 1, 0, 1, 0],   /* 7 */
        [0, 1, 0, 0, 1],   /* 8 */
        [0, 0, 1, 0, 1]    /* 9 */
    ];
}

inherits(Upcext5, Barcode1D);

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Upcext5.prototype.draw = function(im) {
    // Checksum
    this._calculateChecksum();

    // Starting Code
    this._drawChar(im, '001', true);

    // Code
    for (var i = 0; i < 5; i++) {
        this._drawChar(im, Upcext5.__inverse(this._findCode(this._text[i]), this._codeParity[this._checksumValue][i]), false);
        if (i < 4) {
            this._drawChar(im, '00', false);    // Inter-char
        }
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
Upcext5.prototype.getDimension = function(w, h) {
    var startlength = 4;
    var textlength = 5 * 7;
    var intercharlength = 2 * 4;

    w += startlength + textlength + intercharlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Adds the default label.
 */
Upcext5.prototype._addDefaultLabel = function() {
    Barcode1D.prototype._addDefaultLabel.call(this);

    if (this._defaultLabel !== null) {
        this._defaultLabel.setPosition(Label.POSITION_TOP);
    }
};

/**
 * Validates the input.
 */
Upcext5.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Upcext5', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Upcext5', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    // Must contain 5 digits
    if (c !== 5) {
        throw new ParseException('Upcext5', 'Must contain 5 digits.');
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Upcext5.prototype._calculateChecksum = function() {
    // Calculating Checksum
    // Consider the right-most digit of the message to be in an "odd" position,
    // and assign odd/even to each character moving from right to left
    // Odd Position = 3, Even Position = 9
    // Multiply it by the number
    // Add all of that and do ?mod10
    var odd = true;
    this._checksumValue = 0;
    var c = this._text.length;
    var multiplier;
    for (var i = c; i > 0; i--) {
        if (odd === true) {
            multiplier = 3;
            odd = false;
        } else {
            multiplier = 9;
            odd = true;
        }

        if (this._keys[this._text[i - 1]] === undefined) {
            return;
        }

        this._checksumValue += this._keys[this._text[i - 1]] * multiplier;
    }

    this._checksumValue = this._checksumValue % 10;
};

/**
 * Overloaded method to display the checksum.
 */
Upcext5.prototype._processChecksum = function() {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }

    if (this._checksumValue !== false) {
        return this._keys[this._checksumValue];
    }

    return false;
};

/**
 * Inverses the string when the inverse parameter is equal to 1.
 *
 * @param string text
 * @param int inverse
 * @return string
 */
Upcext5.__inverse = function(text, inverse) {
    inverse = typeof inverse === "undefined" ? 1 : inverse;
    if (inverse === 1) {
        text = Utility.strrev(text);
    }

    return text;
};

module.exports = Upcext5;