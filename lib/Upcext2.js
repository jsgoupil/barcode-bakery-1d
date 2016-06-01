'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - UPC Supplemental Barcode 2 digits
 *
 * Working with UPC-A, UPC-E, EAN-13, EAN-8
 * This includes 2 digits (normaly for publications)
 * Must be placed next to UPC or EAN Code
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
function Upcext2() {
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

    // Parity, 0=Odd, 1=Even. Depending on ?%4
    this._codeParity = [
        [0, 0],    /* 0 */
        [0, 1],    /* 1 */
        [1, 0],    /* 2 */
        [1, 1]     /* 3 */
    ];
}

inherits(Upcext2, Barcode1D);

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Upcext2.prototype.draw = function(im) {
    // Starting Code
    this._drawChar(im, '001', true);

    // Code
    for (var i = 0; i < 2; i++) {
        this._drawChar(im, Upcext2.__inverse(this._findCode(this._text[i]), this._codeParity[parseInt(this._text, 10) % 4][i]), false);
        if (i === 0) {
            this._drawChar(im, '00', false);    // Inter-char
        }
    }

    this._drawText(im, 0, 0, this._positionX, this._thickness);
}

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Upcext2.prototype.getDimension = function(w, h) {
    var startlength = 4;
    var textlength = 2 * 7;
    var intercharlength = 2;

    w += startlength + textlength + intercharlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
}

/**
 * Adds the default label.
 */
Upcext2.prototype._addDefaultLabel = function() {
    Barcode1D.prototype._addDefaultLabel.call(this);

    if (this._defaultLabel !== null) {
        this._defaultLabel.setPosition(Label.POSITION_TOP);
    }
}

/**
 * Validates the input.
 */
Upcext2.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Upcext2', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Upcext2', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    // Must contain 2 digits
    if (c !== 2) {
        throw new ParseException('Upcext2', 'Must contain 2 digits.');
    }

    Barcode1D.prototype._validate.call(this);
}

/**
 * Inverses the string when the inverse parameter is equal to 1.
 *
 * @param string text
 * @param int inverse
 * @return string
 */
Upcext2.__inverse = function(text, inverse) {
    inverse = typeof inverse === "undefined" ? 1 : inverse;
    if (inverse === 1) {
        text = Utility.strrev(text);
    }

    return text;
};

module.exports = Upcext2;