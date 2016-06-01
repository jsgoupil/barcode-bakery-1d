'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Code 39 Extended
 *
 *--------------------------------------------------------------------
 * Copyright (C) Jean-Sebastien Goupil
 * http://www.barcodebakery.com
 */
var inherits = require('util').inherits;
var Code39 = require('./Code39');
var barcodeBakeryCommon = require('barcode-bakery-common');
var Barcode1D = barcodeBakeryCommon.Barcode1D;
var ParseException = barcodeBakeryCommon.ParseException;
var Utility = barcodeBakeryCommon.Utility;

/**
 * Constructor.
 */
function Code39extended() {
    Code39.call(this);

    // We just put parenthesis around special characters.
    this._keys[Code39extended.EXTENDED_1] = '($)';
    this._keys[Code39extended.EXTENDED_2] = '(/)';
    this._keys[Code39extended.EXTENDED_3] = '(+)';
    this._keys[Code39extended.EXTENDED_4] = '(%)';
}

inherits(Code39extended, Code39);

Code39extended.EXTENDED_1 = 39;
Code39extended.EXTENDED_2 = 40;
Code39extended.EXTENDED_3 = 41;
Code39extended.EXTENDED_4 = 42;

/**
 * Parses the text before displaying it.
 *
 * @param mixed text
 */
Code39extended.prototype.parse = function(text) {
    this._text = text;

    var data = [];
    var indcheck = [];

    var c = this._text.length;
    for (var i = 0; i < c; i++) {
        var pos = Utility.arraySearch(this._keys, this._text[i]);
        if (pos === false) {
            // Search in extended?
            var extended = this.__getExtendedVersion(this._text[i]);
            if (extended === false) {
                throw new ParseException('Code39extended', 'The character \'' + this._text[i] + '\' is not allowed.');
            } else {
                var extc = extended.length;
                for (var j = 0; j < extc; j++) {
                    var v = extended[j];
                    if (v === '') {
                        indcheck.push(Code39extended.EXTENDED_1);
                        data.push(this._code[Code39extended.EXTENDED_1]);
                    } else if (v === '%') {
                        indcheck.push(Code39extended.EXTENDED_2);
                        data.push(this._code[Code39extended.EXTENDED_2]);
                    } else if (v === '/') {
                        indcheck.push(Code39extended.EXTENDED_3);
                        data.push(this._code[Code39extended.EXTENDED_3]);
                    } else if (v === '+') {
                        indcheck.push(Code39extended.EXTENDED_4);
                        data.push(this._code[Code39extended.EXTENDED_4]);
                    } else {
                        var pos2 = Utility.arraySearch(this._keys, v);
                        indcheck.push(pos2);
                        data.push(this._code[pos2]);
                    }
                }
            }
        } else {
            indcheck.push(pos);
            data.push(this._code[pos]);
        }
    }

    this.__setData([indcheck, data]);
    this._addDefaultLabel();
};

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Code39extended.prototype.draw = function(im) {
    // Starting *
    this._drawChar(im, this._code[this._starting], true);
    var c = this.__data.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this.__data[i], true);
    }

    // Checksum (rarely used)
    if (this._checksum === true) {
        this._drawChar(im, this._code[this._checksumValue % 43], true);
    }

    // Ending *
    this._drawChar(im, this._code[this._ending], true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Code39extended.prototype.getDimension = function(w, h) {
    var textlength = 13 * this.__data.length;
    var startlength = 13;
    var checksumlength = 0;
    if (this._checksum === true) {
        checksumlength = 13;
    }

    var endlength = 13;

    w += startlength + textlength + checksumlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
Code39extended.prototype._validate = function() {
    var c = this.__data.length;
    if (c === 0) {
        throw new ParseException('Code39extended', 'No data has been entered.');
    }

    Code39.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Code39extended.prototype._calculateChecksum = function() {
    this._checksumValue = 0;
    var c = this.__indcheck.length;
    for (var i = 0; i < c; i++) {
        this._checksumValue += this.__indcheck[i];
    }

    this._checksumValue = this._checksumValue % 43;
}

/**
 * Saves data into the classes.
 *
 * This method will save data, calculate real column number
 * (if -1 was selected), the real error level (if -1 was
 * selected)... It will add Padding to the end and generate
 * the error codes.
 *
 * @param array data
 */
Code39extended.prototype.__setData = function(data) {
    this.__indcheck = data[0];
    this.__data = data[1];
    this._calculateChecksum();
};

/**
 * Returns the extended reprensentation of the character.
 *
 * @param string char
 * @return string
 */
Code39extended.prototype.__getExtendedVersion = function(c) {
    var o = ord(c);
    if (o === 0) {
        return '%U';
    } else if (o >= 1 && o <= 26) {
        return '$' . String.fromCharCode(o + 64);
    } else if ((o >= 33 && o <= 44) || o === 47 || o === 48) {
        return '/' . String.fromCharCode(o + 32);
    } else if (o >= 97 && o <= 122) {
        return '+' . String.fromCharCode(o - 32);
    } else if (o >= 27 && o <= 31) {
        return '%' . String.fromCharCode(o + 38);
    } else if (o >= 59 && o <= 63) {
        return '%' . String.fromCharCode(o + 11);
    } else if (o >= 91 && o <= 95) {
        return '%' . String.fromCharCode(o - 16);
    } else if (o >= 123 && o <= 127) {
        return '%' . String.fromCharCode(o - 43);
    } else if (o === 64) {
        return '%V';
    } else if (o === 96) {
        return '%W';
    } else if (o > 127) {
        return false;
    } else {
        return c;
    }
}

module.exports = Code39extended;