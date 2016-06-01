'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Code 93
 *
 * !! Warning !!
 * If you display the checksum on the barcode, you may obtain
 * some garbage since some characters are not displayable.
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
function Code93() {
    Barcode1D.call(this);

    this.__starting = this.__ending = 47; /* * */
    this._keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-', '.', ' ', '$', '/', '+', '%', '($)', '(%)', '(/)', '(+)', '(*)'];
    this._code = [
        '020001',   /* 0 */
        '000102',   /* 1 */
        '000201',   /* 2 */
        '000300',   /* 3 */
        '010002',   /* 4 */
        '010101',   /* 5 */
        '010200',   /* 6 */
        '000003',   /* 7 */
        '020100',   /* 8 */
        '030000',   /* 9 */
        '100002',   /* A */
        '100101',   /* B */
        '100200',   /* C */
        '110001',   /* D */
        '110100',   /* E */
        '120000',   /* F */
        '001002',   /* G */
        '001101',   /* H */
        '001200',   /* I */
        '011001',   /* J */
        '021000',   /* K */
        '000012',   /* L */
        '000111',   /* M */
        '000210',   /* N */
        '010011',   /* O */
        '020010',   /* P */
        '101001',   /* Q */
        '101100',   /* R */
        '100011',   /* S */
        '100110',   /* T */
        '110010',   /* U */
        '111000',   /* V */
        '001011',   /* W */
        '001110',   /* X */
        '011010',   /* Y */
        '012000',   /* Z */
        '010020',   /* - */
        '200001',   /* . */
        '200100',   /*   */
        '210000',   /*  */
        '001020',   /* / */
        '002010',   /* + */
        '100020',   /* % */
        '010110',   /*()*/
        '201000',   /*(%)*/
        '200010',   /*(/)*/
        '011100',   /*(+)*/
        '000030'    /*(*)*/
    ];
}

inherits(Code93, Barcode1D);

Code93.EXTENDED_1 = 43;
Code93.EXTENDED_2 = 44;
Code93.EXTENDED_3 = 45;
Code93.EXTENDED_4 = 46;

/**
 * Parses the text before displaying it.
 *
 * @param mixed text
 */
Code93.prototype.parse = function(text) {
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
                throw new ParseException('Code93', 'The character \'' + this._text[i] + '\' is not allowed.');
            } else {
                var extc = extended.length;
                for (var j = 0; j < extc; j++) {
                    var v = extended[j];
                    if (v === '') {
                        indcheck.push(Code93.EXTENDED_1);
                        data.push(this._code[Code93.EXTENDED_1]);
                    } else if (v === '%') {
                        indcheck.push(Code93.EXTENDED_2);
                        data.push(this._code[Code93.EXTENDED_2]);
                    } else if (v === '/') {
                        indcheck.push(Code93.EXTENDED_3);
                        data.push(this._code[Code93.EXTENDED_3]);
                    } else if (v === '+') {
                        indcheck.push(Code93.EXTENDED_4);
                        data,push(this._code[Code93.EXTENDED_4]);
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
Code93.prototype.draw = function(im) {
    // Starting *
    this._drawChar(im, this._code[this.__starting], true);
    var c = this.__data.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this.__data[i], true);
    }

    // Checksum
    var c = this._checksumValue.length;
    for (i = 0; i < c; i++) {
        this._drawChar(im, this._code[this._checksumValue[i]], true);
    }

    // Ending *
    this._drawChar(im, this._code[this.__ending], true);

    // Draw a Final Bar
    this._drawChar(im, '0', true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Code93.prototype.getDimension = function(w, h) {
    var startlength = 9;
    var textlength = 9 * this.__data.length;
    var checksumlength = 2 * 9;
    var endlength = 9 + 1; // + final bar

    w += startlength + textlength + checksumlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
Code93.prototype._validate = function() {
    var c = this.__data.length;
    if (c === 0) {
        throw new ParseException('Code93', 'No data has been entered.');
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Code93.prototype._calculateChecksum = function() {
    // Checksum
    // First CheckSUM "C"
    // The "C" checksum character is the modulo 47 remainder of the sum of the weighted
    // value of the data characters. The weighting value starts at "1" for the right-most
    // data character, 2 for the second to last, 3 for the third-to-last, and so on up to 20.
    // After 20, the sequence wraps around back to 1.

    // Second CheckSUM "K"
    // Same as CheckSUM "C" but we count the CheckSum "C" at the end
    // After 15, the sequence wraps around back to 1.
    var sequence_multiplier = [20, 15];
    this._checksumValue = [];
    var indcheck = this.__indcheck;
    for (var z = 0; z < 2; z++) {
        var checksum = 0;
        for (var i = indcheck.length, j = 0; i > 0; i--, j++) {
            var multiplier = i % sequence_multiplier[z];
            if (multiplier === 0) {
                multiplier = sequence_multiplier[z];
            }

            checksum += indcheck[j] * multiplier;
        }

        this._checksumValue[z] = checksum % 47;
        indcheck.push(this._checksumValue[z]);
    }
};

/**
 * Overloaded method to display the checksum.
 */
Code93.prototype._processChecksum = function() {
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
Code93.prototype.__setData = function(data) {
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
Code93.prototype.__getExtendedVersion = function(c) {
    var o = ord(c);
    if (o === 0) {
        return '%U';
    } else if (o >= 1 && o <= 26) {
        return '$' + String.fromCharCode(o + 64);
    } else if ((o >= 33 && o <= 44) || o === 47 || o === 48) {
        return '/' + String.fromCharCode(o + 32);
    } else if (o >= 97 && o <= 122) {
        return '+' + String.fromCharCode(o - 32);
    } else if (o >= 27 && o <= 31) {
        return '%' + String.fromCharCode(o + 38);
    } else if (o >= 59 && o <= 63) {
        return '%' + String.fromCharCode(o + 11);
    } else if (o >= 91 && o <= 95) {
        return '%' + String.fromCharCode(o - 16);
    } else if (o >= 123 && o <= 127) {
        return '%' + String.fromCharCode(o - 43);
    } else if (o === 64) {
        return '%V';
    } else if (o === 96) {
        return '%W';
    } else if (o > 127) {
        return false;
    } else {
        return c;
    }
};

module.exports = Code93;