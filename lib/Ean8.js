'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - EAN-8
 *
 * EAN-8 contains
 *    - 4 digits
 *    - 3 digits
 *    - 1 checksum
 *
 * The checksum is always displayed.
 *
 *--------------------------------------------------------------------
 * Copyright (C) Jean-Sebastien Goupil
 * http://www.barcodebakery.com
 */
var inherits = require('util').inherits;
var barcodeBakeryCommon = require('barcode-bakery-common');
var Barcode = barcodeBakeryCommon.Barcode;
var Barcode1D = barcodeBakeryCommon.Barcode1D;
var ParseException = barcodeBakeryCommon.ParseException;
var Label = barcodeBakeryCommon.Label;
var Utility = barcodeBakeryCommon.Utility;

/**
 * Constructor.
 */
function Ean8() {
    Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Left-Hand Odd Parity starting with a space
    // Right-Hand is the same of Left-Hand starting with a bar
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
}

inherits(Ean8, Barcode1D);

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Ean8.prototype.draw = function(im) {
    // Checksum
    this._calculateChecksum();
    var temp_text = this._text + this._keys[this._checksumValue];

    // Starting Code
    this._drawChar(im, '000', true);

    // Draw First 4 Chars (Left-Hand)
    for (var i = 0; i < 4; i++) {
        this._drawChar(im, this._findCode(temp_text[i]), false);
    }

    // Draw Center Guard Bar
    this._drawChar(im, '00000', false);

    // Draw Last 4 Chars (Right-Hand)
    for (i = 4; i < 8; i++) {
        this._drawChar(im, this._findCode(temp_text[i]), true);
    }

    // Draw Right Guard Bar
    this._drawChar(im, '000', true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);

    if (this._isDefaultEanLabelEnabled()) {
        var dimension = this._labelRight.getDimension();
        this.__drawExtendedBars(im, dimension[1] - 2);
    }
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Ean8.prototype.getDimension = function(w, h) {
    var startlength = 3;
    var centerlength = 5;
    var textlength = 8 * 7;
    var endlength = 3;

    w += startlength + centerlength + textlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Adds the default label.
 */
Ean8.prototype._addDefaultLabel = function() {
    if (this._isDefaultEanLabelEnabled()) {
        this._processChecksum();
        var label = this.getLabel();
        var font = this._font;

        this._labelLeft = new Label(label.substr(0, 4), font, Label.POSITION_BOTTOM, Label.ALIGN_LEFT);
        var labelLeftDimension = this._labelLeft.getDimension();
        this._labelLeft.setOffset((this._scale * 30 - labelLeftDimension[0]) / 2 + this._scale * 2);

        this._labelRight = new Label(label.substr(4, 3) + this._keys[this._checksumValue], font, Label.POSITION_BOTTOM, Label.ALIGN_LEFT);
        var labelRightDimension = this._labelRight.getDimension();
        this._labelRight.setOffset((this._scale * 30 - labelRightDimension[0]) / 2 + this._scale * 34);

        this.addLabel(this._labelLeft);
        this.addLabel(this._labelRight);
    }
};

/**
 * Checks if the default ean label is enabled.
 *
 * @return bool
 */
Ean8.prototype._isDefaultEanLabelEnabled = function() {
    var label = this.getLabel();
    var font = this._font;
    return label !== null && label !== '' && font !== null && this._defaultLabel !== null;
};

    /**
     * Validates the input.
     */
Ean8.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Ean8', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Ean8', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    // If we have 8 chars just flush the last one
    if (c === 8) {
        this._text = this._text.substr(0, 7);
    } else if (c !== 7) {
        throw new ParseException('Ean8', 'Must contain 7 digits, the 8th digit is automatically added.');
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Ean8.prototype._calculateChecksum = function() {
    // Calculating Checksum
    // Consider the right-most digit of the message to be in an "odd" position,
    // and assign odd/even to each character moving from right to left
    // Odd Position = 3, Even Position = 1
    // Multiply it by the number
    // Add all of that and do 10-(?mod10)
    var odd = true;
    this._checksumValue = 0;
    var c = this._text.length;
    var multiplier;
    for (var i = c; i > 0; i--) {
        if (odd === true) {
            multiplier = 3;
            odd = false;
        } else {
            multiplier = 1;
            odd = true;
        }

        if (this._keys[this._text[i - 1]] === undefined) {
            return;
        }

        this._checksumValue += this._keys[this._text[i - 1]] * multiplier;
    }

    this._checksumValue = (10 - this._checksumValue % 10) % 10;
};

/**
 * Overloaded method to display the checksum.
 */
Ean8.prototype._processChecksum = function() {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }

    if (this._checksumValue !== false) {
        return this._keys[this._checksumValue];
    }

    return false;
};

/**
 * Draws the extended bars on the image.
 *
 * @param resource im
 * @param int plus
 */
Ean8.prototype.__drawExtendedBars = function(im, plus) {
    var rememberX = this._positionX;
    var rememberH = this._thickness;

    // We increase the bars
    this._thickness = this._thickness + parseInt(plus / this._scale, 10);
    this._positionX = 0;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    // Center Guard Bar
    this._positionX += 30;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    // Last Bars
    this._positionX += 30;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    this._positionX = rememberX;
    this._thickness = rememberH;
};

module.exports = Ean8;