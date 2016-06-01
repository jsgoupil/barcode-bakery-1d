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
function OtherCode() {
    Barcode1D.call(this);
    
    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
}

inherits(OtherCode, Barcode1D);

/**
 * Draws the barcode.
 *
 * @param resource im
 */
OtherCode.prototype.draw = function (im) {
    this._drawChar(im, this._text, true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Gets the label.
 * If the label was set to BCGBarcode1D::AUTO_LABEL, the label will display the value from the text parsed.
 *
 * @return string
 */
OtherCode.prototype.getLabel = function () {
    var label = this._label;
    if (this._label === Barcode1D.AUTO_LABEL) {
        label = '';
    }
    
    return label;
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
OtherCode.prototype.getDimension = function (w, h) {
    var array = this._text.split('').map(Number);
    var textlength = Utility.arraySum(array) + array.length;

    w += textlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
OtherCode.prototype._validate = function () {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('OtherCode', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('OtherCode', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    Barcode1D.prototype._validate.call(this);
};

module.exports = OtherCode;