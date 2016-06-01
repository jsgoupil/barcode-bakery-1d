'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - EAN-13
 *
 * EAN-13 contains
 *    - 2 system digits (1 not displayed but coded with parity)
 *    - 5 manufacturer code digits
 *    - 5 product digits
 *    - 1 checksum digit
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
function Ean13() {
    Barcode1D.call(this);

    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Left-Hand Odd Parity starting with a space
    // Left-Hand Even Parity is the inverse (0=0012) starting with a space
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

    // Parity, 0=Odd, 1=Even for manufacturer code. Depending on 1st System Digit
    this._codeParity = [
        [0, 0, 0, 0, 0],   /* 0 */
        [0, 1, 0, 1, 1],   /* 1 */
        [0, 1, 1, 0, 1],   /* 2 */
        [0, 1, 1, 1, 0],   /* 3 */
        [1, 0, 0, 1, 1],   /* 4 */
        [1, 1, 0, 0, 1],   /* 5 */
        [1, 1, 1, 0, 0],   /* 6 */
        [1, 0, 1, 0, 1],   /* 7 */
        [1, 0, 1, 1, 0],   /* 8 */
        [1, 1, 0, 1, 0]    /* 9 */
    ];

    this.alignDefaultLabel(true);
}

inherits(Ean13, Barcode1D);

/**
 * Adds the default label.
 */
Ean13.prototype.alignDefaultLabel = function(align) {
    this._alignLabel = !!align;
};

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Ean13.prototype.draw = function(im) {
    this._drawBars(im);
    this._drawText(im, 0, 0, this._positionX, this._thickness);

    if (this._isDefaultEanLabelEnabled()) {
        var dimension = this._labelCenter1.getDimension();
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
Ean13.prototype.getDimension = function(w, h) {
    var startlength = 3;
    var centerlength = 5;
    var textlength = 12 * 7;
    var endlength = 3;

    w += startlength + centerlength + textlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Adds the default label.
 */
Ean13.prototype._addDefaultLabel = function() {
    var labelDimension;
    if (this._isDefaultEanLabelEnabled()) {
        this._processChecksum();
        var label = this.getLabel();
        var font = this._font;

        this._labelLeft = new Label(label.substr(0, 1), font, Label.POSITION_LEFT, Label.ALIGN_BOTTOM);
        this._labelLeft.setSpacing(4 * this._scale);

        this._labelCenter1 = new Label(label.substr(1, 6), font, Label.POSITION_BOTTOM, Label.ALIGN_LEFT);
        var labelCenter1Dimension = this._labelCenter1.getDimension();
        this._labelCenter1.setOffset((this._scale * 44 - labelCenter1Dimension[0]) / 2 + this._scale * 2);

        this._labelCenter2 = new Label(label.substr(7, 5) + this._keys[this._checksumValue], font, Label.POSITION_BOTTOM, Label.ALIGN_LEFT);
        this._labelCenter2.setOffset((this._scale * 44 - labelCenter1Dimension[0]) / 2 + this._scale * 48);

        if (this._alignLabel) {
            labelDimension = this._labelCenter1.getDimension();
            this._labelLeft.setOffset(labelDimension[1]);
        } else {
            labelDimension = this._labelLeft.getDimension();
            this._labelLeft.setOffset(labelDimension[1] / 2);
        }

        this.addLabel(this._labelLeft);
        this.addLabel(this._labelCenter1);
        this.addLabel(this._labelCenter2);
    }
};

/**
 * Checks if the default ean label is enabled.
 *
 * @return bool
 */
Ean13.prototype._isDefaultEanLabelEnabled = function() {
    var label = this.getLabel();
    var font = this._font;
    return label !== null && label !== '' && font !== null && this._defaultLabel !== null;
};

/**
 * Validates the input.
 */
Ean13.prototype._validate = function() {
    var c = this._text.length;
    if (c === 0) {
        throw new ParseException('Ean13', 'No data has been entered.');
    }

    this._checkCharsAllowed();
    this._checkCorrectLength();

    Barcode1D.prototype._validate.call(this);
};

/**
 * Check chars allowed.
 */
Ean13.prototype._checkCharsAllowed = function() {
    // Checking if all chars are allowed
    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        if (Utility.arraySearch(this._keys, this._text[i]) === false) {
            throw new ParseException('Ean13', 'The character \'' + this._text[i] + '\' is not allowed.');
        }
    }
};

    /**
     * Check correct length.
     */
Ean13.prototype._checkCorrectLength = function() {
    // If we have 13 chars, just flush the last one without throwing anything
    var c = this._text.length;
    if (c === 13) {
        this._text = this._text.substr(0, 12);
    } else if (c !== 12) {
        throw new ParseException('Ean13', 'Must contain 12 digits, the 13th digit is automatically added.');
    }
};

/**
 * Overloaded method to calculate checksum.
 */
Ean13.prototype._calculateChecksum = function() {
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
Ean13.prototype._processChecksum = function() {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }

    if (this._checksumValue !== false) {
        return this._keys[this._checksumValue];
    }

    return false;
}

/**
 * Draws the bars
 *
 * @param resource im
 */
Ean13.prototype._drawBars = function(im) {
    // Checksum
    this._calculateChecksum();
    var temp_text = this._text + this._keys[this._checksumValue];

    // Starting Code
    this._drawChar(im, '000', true);

    // Draw Second Code
    this._drawChar(im, this._findCode(temp_text[1]), false);

    // Draw Manufacturer Code
    for (var i = 0; i < 5; i++) {
        this._drawChar(im, Ean13.__inverse(this._findCode(temp_text[i + 2]), this._codeParity[parseInt(temp_text[0], 10)][i]), false);
    }

    // Draw Center Guard Bar
    this._drawChar(im, '00000', false);

    // Draw Product Code
    for (i = 7; i < 13; i++) {
        this._drawChar(im, this._findCode(temp_text[i]), true);
    }

    // Draw Right Guard Bar
    this._drawChar(im, '000', true);
};

/**
 * Draws the extended bars on the image.
 *
 * @param resource im
 * @param int plus
 */
Ean13.prototype._drawExtendedBars = function(im, plus) {
    var rememberX = this._positionX;
    var rememberH = this._thickness;

    // We increase the bars
    this._thickness = this._thickness + parseInt(plus / this._scale, 10);
    this._positionX = 0;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    // Center Guard Bar
    this._positionX += 44;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    // Last Bars
    this._positionX += 44;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    this._positionX = rememberX;
    this._thickness = rememberH;
}

/**
 * Inverses the string when the inverse parameter is equal to 1.
 *
 * @param string text
 * @param int inverse
 * @return string
 */
Ean13.__inverse = function(text, inverse) {
    inverse = typeof inverse === "undefined" ? 1 : inverse;
    if (inverse === 1) {
        text = Utility.strrev(text);
    }

    return text;
};


module.exports = Ean13;