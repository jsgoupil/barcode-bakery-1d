'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - ISBN-10 and ISBN-13
 *
 * You can provide an ISBN with 10 digits with or without the checksum.
 * You can provide an ISBN with 13 digits with or without the checksum.
 * Calculate the ISBN based on the EAN-13 encoding.
 *
 * The checksum is always displayed.
 *
 *--------------------------------------------------------------------
 * Copyright (C) Jean-Sebastien Goupil
 * http://www.barcodebakery.com
 */
var inherits = require('util').inherits;
var ean13 = require('./ean13');
var barcodeBakeryCommon = require('barcode-bakery-common');
var ParseException = barcodeBakeryCommon.ParseException;
var ArgumentException = barcodeBakeryCommon.ArgumentException;
var Label = barcodeBakeryCommon.Label;
var Utility = barcodeBakeryCommon.Utility;

/**
 * Constructor.
 *
 * @param int gs1
 */
function Isbn(gs1) {
    gs1 = gs1 || Isbn.GS1_AUTO;

    ean13.call(this);
    this.setGS1(gs1);
}

inherits(Isbn, ean13);

Isbn.GS1_AUTO = 0;
Isbn.GS1_PREFIX978 = 1;
Isbn.GS1_PREFIX979 = 2;

/**
 * Adds the default label.
 */
Isbn.prototype._addDefaultLabel = function() {
    if (this._isDefaultEanLabelEnabled()) {
        var Isbn = this.__createISBNText();
        var font = this._font;

        var topLabel = new Label(Isbn, font, Label.POSITION_TOP, Label.ALIGN_CENTER);

        this.addLabel(topLabel);
    }

    ean13.prototype._addDefaultLabel.call(this);
};

/**
 * Sets the first numbers of the barcode.
 *  - GS1_AUTO: Adds 978 before the code
 *  - GS1_PREFIX978: Adds 978 before the code
 *  - GS1_PREFIX979: Adds 979 before the code
 *
 * @param int gs1
 */
Isbn.prototype.setGS1 = function(gs1) {
    gs1 = parseInt(gs1, 10);
    if (gs1 !== Isbn.GS1_AUTO && gs1 !== Isbn.GS1_PREFIX978 && gs1 !== Isbn.GS1_PREFIX979) {
        throw new ArgumentException('The GS1 argument must be Isbn.GS1_AUTO, Isbn.GS1_PREFIX978, or Isbn.GS1_PREFIX979', 'gs1');
    }

    this.__gs1 = gs1;
};

/**
 * Check chars allowed.
 */
Isbn.prototype._checkCharsAllowed = function() {
    var c = this._text.length;

    // Special case, if we have 10 digits, the last one can be X
    if (c === 10) {
        if (Utility.arraySearch(this._keys, this._text[9]) === false && this._text[9] !== 'X') {
            throw new ParseException('Isbn', 'The character \'' + this._text[9] + '\' is not allowed.');
        }

        // Drop the last char
        this._text = this._text.substr(0, 9);
    }

    return ean13.prototype._checkCharsAllowed.call(this);
};

/**
 * Check correct length.
 */
Isbn.prototype._checkCorrectLength = function() {
    var c = this._text.length;

    // If we have 13 chars just flush the last one
    if (c === 13) {
        this._text = this._text.substr(0, 12);
    } else if (c === 9 || c === 10) {
        if (c === 10) {
            // Before dropping it, we check if it's legal
            if (Utility.arraySearch(this._keys, this._text[9]) === false && this._text[9] !== 'X') {
                throw new ParseException('Isbn', 'The character \'' + this._text[9] + '\' is not allowed.');
            }

            this._text = this._text.substr(0, 9);
        }

        if (this.__gs1 === Isbn.GS1_AUTO || this.__gs1 === Isbn.GS1_PREFIX978) {
            this._text = '978' + this._text;
        } else if (this.__gs1 === Isbn.GS1_PREFIX979) {
            this._text = '979' + this._text;
        }
    } else if (c !== 12) {
        throw new ParseException('Isbn', 'The code parsed must be 9, 10, 12, or 13 digits long.');
    }
};

/**
 * Creates the ISBN text.
 *
 * @return string
 */
Isbn.prototype.__createISBNText = function() {
    var Isbn = '';
    var checksum;
    if (this._text !== '') {
        // We try to create the ISBN Text... the hyphen really depends the ISBN agency.
        // We just put one before the checksum and one after the GS1 if present.
        var c = this._text.length;
        if (c === 12 || c === 13) {
            // If we have 13 characters now, just transform it temporarily to find the checksum...
            // Further in the code we take care of that anyway.
            var lastCharacter = '';
            if (c === 13) {
                lastCharacter = this._text[12];
                this._text = this._text.substr(0, 12);
            }

            checksum = this._processChecksum();
            var Isbn = 'ISBN ' + this._text.substr(0, 3) + '-' + this._text.substr(3, 9) + '-' + checksum;

            // Put the last character back
            if (c === 13) {
                this._text += lastCharacter;
            }
        } else if (c === 9 || c === 10) {
            checksum = 0;
            for (var i = 10; i >= 2; i--) {
                checksum += this._text[10 - i] * i;
            }

            checksum = 11 - checksum % 11;
            if (checksum === 10) {
                checksum = 'X'; // Changing type
            }

            Isbn = 'ISBN ' + this._text.substr(0, 9) + '-' + checksum;
        }
    }

    return Isbn;
};

module.exports = Isbn;