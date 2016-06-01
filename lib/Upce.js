'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - UPC-E
 *
 * You can provide a UPC-A code (without dash), the code will transform
 * it into a UPC-E format if it's possible.
 * UPC-E contains
 *    - 1 system digits (not displayed but coded with parity)
 *    - 6 digits
 *    - 1 checksum digit (not displayed but coded with parity)
 *
 * The text returned is the UPC-E without the checksum.
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
function Upce() {
    Barcode1D.call(this);

    this._codeParity = [];
    this._labelLeft = null;
    this._labelCenter = null;
    this._labelRight = null;

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Odd Parity starting with a space
    // Even Parity is the inverse (0=0012) starting with a space
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

    // Parity, 0=Odd, 1=Even for manufacturer code. Depending on 1st System Digit and Checksum
    this._codeParity = [
        [
            [1, 1, 1, 0, 0, 0],    /* 0,0 */
            [1, 1, 0, 1, 0, 0],    /* 0,1 */
            [1, 1, 0, 0, 1, 0],    /* 0,2 */
            [1, 1, 0, 0, 0, 1],    /* 0,3 */
            [1, 0, 1, 1, 0, 0],    /* 0,4 */
            [1, 0, 0, 1, 1, 0],    /* 0,5 */
            [1, 0, 0, 0, 1, 1],    /* 0,6 */
            [1, 0, 1, 0, 1, 0],    /* 0,7 */
            [1, 0, 1, 0, 0, 1],    /* 0,8 */
            [1, 0, 0, 1, 0, 1]     /* 0,9 */
        ],
        [
            [0, 0, 0, 1, 1, 1],    /* 0,0 */
            [0, 0, 1, 0, 1, 1],    /* 0,1 */
            [0, 0, 1, 1, 0, 1],    /* 0,2 */
            [0, 0, 1, 1, 1, 0],    /* 0,3 */
            [0, 1, 0, 0, 1, 1],    /* 0,4 */
            [0, 1, 1, 0, 0, 1],    /* 0,5 */
            [0, 1, 1, 1, 0, 0],    /* 0,6 */
            [0, 1, 0, 1, 0, 1],    /* 0,7 */
            [0, 1, 0, 1, 1, 0],    /* 0,8 */
            [0, 1, 1, 0, 1, 0]     /* 0,9 */
        ]
    ];
}

inherits(Upce, Barcode1D);

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Upce.prototype.draw = function(im) {
    this._calculateChecksum();

    // Starting Code
    this._drawChar(im, '000', true);
    var c = this._Upce.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, Upce.__inverse(this._findCode(this._Upce[i]), this._codeParity[parseInt(this._text[0], 10)][this._checksumValue][i]), false);
    }

    // Draw Center Guard Bar
    this._drawChar(im, '00000', false);

    // Draw Right Bar
    this._drawChar(im, '0', true);
    this._text = this._text[0] + this._Upce;
    this._drawText(im, 0, 0, this._positionX, this._thickness);

    if (this._isDefaultEanLabelEnabled()) {
        var dimension = this._labelCenter.getDimension();
        this._drawExtendedBars(im, dimension[1] - 2);
    }
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Upce.prototype.getDimension = function(w, h) {
    var startlength = 3;
    var centerlength = 5;
    var textlength = 6 * 7;
    var endlength = 1;

    w += startlength + centerlength + textlength + endlength;
    h += this._thickness;
    console.log(w);
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Adds the default label.
 */
Upce.prototype._addDefaultLabel = function () {
    if (this._isDefaultEanLabelEnabled()) {
        this._processChecksum();
        var font = this._font;

        this._labelLeft = new Label(this._text.substr(0, 1), font, Label.POSITION_LEFT, Label.ALIGN_BOTTOM);
        var labelLeftDimension = this._labelLeft.getDimension();
        this._labelLeft.setSpacing(8);
        this._labelLeft.setOffset(labelLeftDimension[1] / 2);

        this._labelCenter = new Label(this._Upce, font, Label.POSITION_BOTTOM, Label.ALIGN_LEFT);
        var labelCenterDimension = this._labelCenter.getDimension();
        this._labelCenter.setOffset((this._scale * 46 - labelCenterDimension[0]) / 2 + this._scale * 2);

        this._labelRight = new Label(this._keys[this._checksumValue], font, Label.POSITION_RIGHT, Label.ALIGN_BOTTOM);
        var labelRightDimension = this._labelRight.getDimension();
        this._labelRight.setSpacing(8);
        this._labelRight.setOffset(labelRightDimension[1] / 2);

        this.addLabel(this._labelLeft);
        this.addLabel(this._labelCenter);
        this.addLabel(this._labelRight);
    }
};

/**
 * Checks if the default ean label is enabled.
 *
 * @return bool
 */
Upce.prototype._isDefaultEanLabelEnabled = function() {
    var label = this.getLabel();
    var font = this._font;
    return label !== null && label !== '' && font !== null && this._defaultLabel !== null;
};

/**
 * Validates the input.
 */
Upce.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Upce', 'No data has been entered.');
    }

    // Checking if all chars are allowed
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Upce', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }

    // Must contain 11 chars
    // Must contain 6 chars (if starting with Upce directly)
    // First Chars must be 0 or 1
    if (c !== 11 && c !== 6) {
        throw new ParseException('Upce', 'You must provide a UPC-A (11 characters) or a UPC-E (6 characters).');
    } else if (this._text[0] !== '0' && this._text[0] !== '1' && c !== 6) {
        throw new ParseException('Upce', 'UPC-A must start with 0 or 1 to be converted to UPC-E.');
    }

    // Convert part
    this._Upce = '';
    if (c !== 6) {
        // Checking if UPC-A is convertible
        var temp1 = this._text.substr(3, 3);
        if (temp1 === '000' || temp1 === '100' || temp1 === '200') { // manufacturer code ends with 100, 200 or 300
            if (this._text.substr(6, 2) === '00') { // Product must start with 00
                this._Upce = this._text.substr(1, 2) + this._text.substr(8, 3) + this._text.substr(3, 1);
            }
        } else if (this._text.substr(4, 2) === '00') { // manufacturer code ends with 00
            if (this._text.substr(6, 3) === '000') { // Product must start with 000
                this._Upce = this._text.substr(1, 3) + this._text.substr(9, 2) + '3';
            }
        } else if (this._text.substr(5, 1) === '0') { // manufacturer code ends with 0
            if (this._text.substr(6, 4) === '0000') { // Product must start with 0000
                this._Upce = this._text.substr(1, 4) + this._text.substr(10, 1) + '4';
            }
        } else { // No zero leading at manufacturer code
            var temp2 = parseInt(this._text.substr(10, 1), 10);
            if (this._text.substr(6, 4) === '0000' && temp2 >= 5 && temp2 <= 9) { // Product must start with 0000 and must end by 5, 6, 7, 8 or 9
                this._Upce = this._text.substr(1, 5) + this._text.substr(10, 1);
            }
        }
    } else {
        this._Upce = this._text;
    }

    if (this._Upce === '') {
        throw new ParseException('Upce', 'Your UPC-A can\'t be converted to UPC-E.');
    }

    if (c === 6) {
        var upca = '';

        // We convert UPC-E to UPC-A to find the checksum
        if (this._text[5] === '0' || this._text[5] === '1' || this._text[5] === '2') {
            upca = this._text.substr(0, 2) + this._text[5] + '0000' + this._text.substr(2, 3);
        } else if (this._text[5] === '3') {
            upca = this._text.substr(0, 3) + '00000' + substr(this._text, 3, 2);
        } else if (this._text[5] === '4') {
            upca = this._text.substr(0, 4) + '00000' + this._text[4];
        } else {
            upca = this._text.substr(0, 5) + '0000' + this._text[5];
        }

        this._text = '0' + upca;
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Upce.prototype._calculateChecksum = function() {
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
Upce.prototype._processChecksum = function() {
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
Upce.prototype._drawExtendedBars = function(im, plus) {
    var rememberX = this._positionX;
    var rememberH = this._thickness;

    // We increase the bars
    this._thickness = this._thickness + parseInt(plus / this._scale, 10);
    this._positionX = 0;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    var code1 = this._positionX;

    // Last Bars
    this._positionX += 46;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    this._positionX = rememberX;
    this._thickness = rememberH;
};

/**
 * Inverses the string when the inverse parameter is equal to 1.
 *
 * @param string text
 * @param int inverse
 * @return string
 */
Upce.__inverse = function(text, inverse) {
    inverse = typeof inverse === "undefined" ? 1 : inverse;
    if (inverse === 1) {
        text = Utility.strrev(text);
    }

    return text;
};

module.exports = Upce;