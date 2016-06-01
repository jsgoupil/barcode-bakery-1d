'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - UPC-A
 *
 * UPC-A contains
 *    - 2 system digits (1 not provided, a 0 is added automatically)
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
var ean13 = require('./ean13');
var ParseException = barcodeBakeryCommon.ParseException;
var Label = barcodeBakeryCommon.Label;

/**
 * Constructor.
 */
function Upca() {
    ean13.call(this);
}

inherits(Upca, ean13);

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Upca.prototype.draw = function(im) {
    // The following code is exactly the same as EAN13. We just add a 0 in front of the code !
    this._text = '0' + this._text; // We will remove it at the end... don't worry

    ean13.prototype.draw.call(this, im);

    // We remove the 0 in front, as we said :)
    this._text = this._text.substr(1);
};

/**
 * Draws the extended bars on the image.
 *
 * @param resource im
 * @param int plus
 */
Upca.prototype._drawExtendedBars = function(im, plus) {
    var temp_text = this._text + this._keys[this._checksumValue];
    var rememberX = this._positionX;
    var rememberH = this._thickness;

    // We increase the bars
    // First 2 Bars
    this._thickness = this._thickness + parseInt(plus / this._scale, 10);
    this._positionX = 0;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    // Attemping to increase the 2 following bars
    this._positionX += 1;
    temp_value = this._findCode(temp_text[1]);
    this._drawChar(im, temp_value, false);

    // Center Guard Bar
    this._positionX += 36;
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    // Attemping to increase the 2 last bars
    this._positionX += 37;
    temp_value = this._findCode(temp_text[12]);
    this._drawChar(im, temp_value, true);

    // Completly last bars
    this._drawSingleBar(im, Barcode.COLOR_FG);
    this._positionX += 2;
    this._drawSingleBar(im, Barcode.COLOR_FG);

    this._positionX = rememberX;
    this._thickness = rememberH;
};

/**
 * Adds the default label.
 */
Upca.prototype._addDefaultLabel = function() {
    if (this._isDefaultEanLabelEnabled()) {
        this._processChecksum();
        var label = this.getLabel();
        var font = this._font;

        this._labelLeft = new Label(label.substr(0, 1), font, Label.POSITION_LEFT, Label.ALIGN_BOTTOM);
        this._labelLeft.setSpacing(4 * this._scale);

        this._labelCenter1 = new Label(label.substr(1, 5), font, Label.POSITION_BOTTOM, Label.ALIGN_LEFT);
        var labelCenter1Dimension = this._labelCenter1.getDimension();
        this._labelCenter1.setOffset((this._scale * 44 - labelCenter1Dimension[0]) / 2 + this._scale * 6);

        this._labelCenter2 = new Label(label.substr(6, 5), font, Label.POSITION_BOTTOM, Label.ALIGN_LEFT);
        this._labelCenter2.setOffset((this._scale * 44 - labelCenter1Dimension[0]) / 2 + this._scale * 45);

        this._labelRight = new Label(this._keys[this._checksumValue], font, Label.POSITION_RIGHT, Label.ALIGN_BOTTOM);
        this._labelRight.setSpacing(4 * this._scale);
        
        var labelDimension;
        if (this._alignLabel) {
            labelDimension = this._labelCenter1.getDimension();
            this._labelLeft.setOffset(labelDimension[1]);
            this._labelRight.setOffset(labelDimension[1]);
        } else {
            labelDimension = this._labelLeft.getDimension();
            this._labelLeft.setOffset(labelDimension[1] / 2);
            labelDimension = this._labelLeft.getDimension();
            this._labelRight.setOffset(labelDimension[1] / 2);
        }

        this.addLabel(this._labelLeft);
        this.addLabel(this._labelCenter1);
        this.addLabel(this._labelCenter2);
        this.addLabel(this._labelRight);
    }
};

/**
 * Check correct length.
 */
Upca.prototype._checkCorrectLength = function() {
    // If we have 12 chars, just flush the last one without throwing anything
    var c = this._text.length;
    if (c === 12) {
        this._text = this._text.substr(0, 11);
    } else if (c !== 11) {
        throw new ParseException('Upca', 'Must contain 11 digits, the 12th digit is automatically added.');
    }
};

module.exports = Upca;