'use strict';

/**
 *--------------------------------------------------------------------
 *
 * Sub-Class - Code 128, A, B, C
 *
 * !! Warning !!
 * If you display the checksum on the label, you may obtain
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
 *
 * @param char start
 */
function Code128(start) {
    Barcode1D.call(this);

    /* CODE 128 A */
    this._keysA = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_';
    for (var i = 0; i < 32; i++) {
        this._keysA += String.fromCharCode(i);
    }

    /* CODE 128 B */
    this._keysB = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' + String.fromCharCode(127);

    /* CODE 128 C */
    this._keysC = '0123456789';

    this._code = [
        '101111',   /* 00 */
        '111011',   /* 01 */
        '111110',   /* 02 */
        '010112',   /* 03 */
        '010211',   /* 04 */
        '020111',   /* 05 */
        '011102',   /* 06 */
        '011201',   /* 07 */
        '021101',   /* 08 */
        '110102',   /* 09 */
        '110201',   /* 10 */
        '120101',   /* 11 */
        '001121',   /* 12 */
        '011021',   /* 13 */
        '011120',   /* 14 */
        '002111',   /* 15 */
        '012011',   /* 16 */
        '012110',   /* 17 */
        '112100',   /* 18 */
        '110021',   /* 19 */
        '110120',   /* 20 */
        '102101',   /* 21 */
        '112001',   /* 22 */
        '201020',   /* 23 */
        '200111',   /* 24 */
        '210011',   /* 25 */
        '210110',   /* 26 */
        '201101',   /* 27 */
        '211001',   /* 28 */
        '211100',   /* 29 */
        '101012',   /* 30 */
        '101210',   /* 31 */
        '121010',   /* 32 */
        '000212',   /* 33 */
        '020012',   /* 34 */
        '020210',   /* 35 */
        '001202',   /* 36 */
        '021002',   /* 37 */
        '021200',   /* 38 */
        '100202',   /* 39 */
        '120002',   /* 40 */
        '120200',   /* 41 */
        '001022',   /* 42 */
        '001220',   /* 43 */
        '021020',   /* 44 */
        '002012',   /* 45 */
        '002210',   /* 46 */
        '022010',   /* 47 */
        '202010',   /* 48 */
        '100220',   /* 49 */
        '120020',   /* 50 */
        '102002',   /* 51 */
        '102200',   /* 52 */
        '102020',   /* 53 */
        '200012',   /* 54 */
        '200210',   /* 55 */
        '220010',   /* 56 */
        '201002',   /* 57 */
        '201200',   /* 58 */
        '221000',   /* 59 */
        '203000',   /* 60 */
        '110300',   /* 61 */
        '320000',   /* 62 */
        '000113',   /* 63 */
        '000311',   /* 64 */
        '010013',   /* 65 */
        '010310',   /* 66 */
        '030011',   /* 67 */
        '030110',   /* 68 */
        '001103',   /* 69 */
        '001301',   /* 70 */
        '011003',   /* 71 */
        '011300',   /* 72 */
        '031001',   /* 73 */
        '031100',   /* 74 */
        '130100',   /* 75 */
        '110003',   /* 76 */
        '302000',   /* 77 */
        '130001',   /* 78 */
        '023000',   /* 79 */
        '000131',   /* 80 */
        '010031',   /* 81 */
        '010130',   /* 82 */
        '003101',   /* 83 */
        '013001',   /* 84 */
        '013100',   /* 85 */
        '300101',   /* 86 */
        '310001',   /* 87 */
        '310100',   /* 88 */
        '101030',   /* 89 */
        '103010',   /* 90 */
        '301010',   /* 91 */
        '000032',   /* 92 */
        '000230',   /* 93 */
        '020030',   /* 94 */
        '003002',   /* 95 */
        '003200',   /* 96 */
        '300002',   /* 97 */
        '300200',   /* 98 */
        '002030',   /* 99 */
        '003020',   /* 100*/
        '200030',   /* 101*/
        '300020',   /* 102*/
        '100301',   /* 103*/
        '100103',   /* 104*/
        '100121',   /* 105*/
        '122000'    /*STOP*/
    ];
    this.setStart(start || null);
    this.setTilde(true);

    // Latches and Shifts
    this.__latch = [
        [null,                      Code128.KEYA_CODEB,         Code128.KEYA_CODEC],
        [Code128.KEYB_CODEA,        null,                       Code128.KEYB_CODEC],
        [Code128.KEYC_CODEA,        Code128.KEYC_CODEB,         null]
    ];
    this.__shift = [
        [null,                      Code128.KEYA_SHIFT],
        [Code128.KEYB_SHIFT,        null]
    ];
    this.__fnc = [
        [Code128.KEYA_FNC1,         Code128.KEYA_FNC2,          Code128.KEYA_FNC3,      Code128.KEYA_FNC4],
        [Code128.KEYB_FNC1,         Code128.KEYB_FNC2,          Code128.KEYB_FNC3,      Code128.KEYB_FNC4],
        [Code128.KEYC_FNC1,         null,                       null,                   null]
    ];

    // Method available
    this.__METHOD        = { 'CODE128_A': 'A', 'CODE128_B': 'B', 'CODE128_C': 'C' };
}

inherits(Code128, Barcode1D);

Code128.KEYA_FNC3 = 96;
Code128.KEYA_FNC2 = 97;
Code128.KEYA_SHIFT = 98;
Code128.KEYA_CODEC = 99;
Code128.KEYA_CODEB = 100;
Code128.KEYA_FNC4 = 101;
Code128.KEYA_FNC1 = 102;

Code128.KEYB_FNC3 = 96;
Code128.KEYB_FNC2 = 97;
Code128.KEYB_SHIFT = 98;
Code128.KEYB_CODEC = 99;
Code128.KEYB_FNC4 = 100;
Code128.KEYB_CODEA = 101;
Code128.KEYB_FNC1 = 102;

Code128.KEYC_CODEB = 100;
Code128.KEYC_CODEA = 101;
Code128.KEYC_FNC1 = 102;

Code128.KEY_STARTA = 103;
Code128.KEY_STARTB = 104;
Code128.KEY_STARTC = 105;

Code128.KEY_STOP = 106;

Code128.CODE128_A = 1;   // Table A
Code128.CODE128_B = 2;   // Table B
Code128.CODE128_C = 3;   // Table C

/**
 * Specifies the start code. Can be 'A', 'B', 'C', or NULL
 *  - Table A: Capitals + ASCII 0-31 + punct
 *  - Table B: Capitals + LowerCase + punct
 *  - Table C: Numbers
 *
 * If NULL is specified, the table selection is automatically made.
 * The default is NULL.
 *
 * @param string table
 */
Code128.prototype.setStart = function(table) {
    if (table !== 'A' && table !== 'B' && table !== 'C' && table !== null) {
        throw new ArgumentException('The starting table must be A, B, C or null.', 'table');
    }

    this.__starting_text = table;
};

/**
 * Gets the tilde.
 *
 * @return bool
 */
Code128.prototype.getTilde = function() {
    return this.__tilde;
};

/**
 * Accepts tilde to be process as a special character.
 * If true, you can do this:
 *  - ~~     : to make ONE tilde
 *  - ~Fx    : to insert FCNx. x is equal from 1 to 4.
 *
 * @param boolean accept
 */
Code128.prototype.setTilde = function(accept) {
    this.__tilde = !!accept;
};

/**
 * Parses the text before displaying it.
 *
 * @param mixed text
 */
Code128.prototype.parse = function(text) {
    this.__setStartFromText(text);

    this._text = '';
    var seq = '';
    var ret;

    var currentMode = this.__starting_text;

    // Here, we format correctly what the user gives.
    if (!Array.isArray(text)) {
        ret = this.__getSequence(text, currentMode);
        seq = ret.value;
        currentMode = ret.starting_text;
        this._text = text;
    } else {
        // This loop checks for UnknownText AND raises an exception if a character is not allowed in a table
        for (var key1 in text) {                        // We take each value
            if (text.hasOwnProperty(key1)) {
                var val1 = text[key1];
                if (!Array.isArray(val1)) {             // This is not a table
                    if (typeof val1 === 'string') {     // If it's a string, parse as unknown
                        ret = this.__getSequence(val1, currentMode);
                        seq += ret.value;
                        currentMode = ret.starting_text;
                        this._text += val1;
                    } else {
                        // it's the case of "[ENCODING, 'text']"
                        // We got ENCODING in val1, calling 'each' again will get 'text' in val2
                        var val2 = text[0]; // CONFIRM?
                        ret = this['__setParse' + this.__METHOD[val1]](val2, currentMode);
                        seq += ret.value;
                        currentMode = ret.currentMode;
                        this._text += val2;
                    }
                } else {                                // The method is specified
                    // val1[0] = ENCODING
                    // val1[1] = 'text'
                    var value = val1[1] !== undefined ? val1[1] : '';    // If data available
                    ret = this['__setParse' + this.__METHOD[val1[0]]](value, currentMode);
                    seq += ret.value;
                    currentMode = ret.currentMode;
                    this._text += value;
                }
            }
        }
    }

    if (seq !== '') {
        var bitstream = this.__createBinaryStream(this._text, seq);
        this.__setData(bitstream);
    }

    this._addDefaultLabel();
};

/**
 * Draws the barcode.
 *
 * @param resource im
 */
Code128.prototype.draw = function(im) {
    var c = this.__data.length;
    for (var i = 0; i < c; i++) {
        this._drawChar(im, this.__data[i], true);
    }

    this._drawChar(im, '1', true);
    this._drawText(im, 0, 0, this._positionX, this._thickness);
};

/**
 * Returns the maximal size of a barcode.
 *
 * @param int w
 * @param int h
 * @return int[]
 */
Code128.prototype.getDimension = function(w, h) {
    // Contains start + text + checksum + stop
    var textlength = this.__data.length * 11;
    var endlength = 2; // + final bar

    w += textlength + endlength;
    h += this._thickness;
    return Barcode1D.prototype.getDimension.call(this, w, h);
};

/**
 * Validates the input.
 */
Code128.prototype._validate = function() {
    var c = this.__data.length;
    if (c === 0) {
        throw new ParseException('Code128', 'No data has been entered.');
    }

    Barcode1D.prototype._validate.call(this);
};

/**
 * Overloaded method to calculate checksum.
 */
Code128.prototype._calculateChecksum = function() {
    // Checksum
    // First Char (START)
    // + Starting with the first data character following the start character,
    // take the value of the character (between 0 and 102, inclusive) multiply
    // it by its character position (1) and add that to the running checksum.
    // Modulated 103
    this._checksumValue = this.__indcheck[0];
    var c = this.__indcheck.length;
    for (var i = 1; i < c; i++) {
        this._checksumValue += this.__indcheck[i] * i;
    }

    this._checksumValue = this._checksumValue % 103;
};

/**
 * Overloaded method to display the checksum.
 */
Code128.prototype._processChecksum = function() {
    if (this._checksumValue === false) { // Calculate the checksum only once
        this._calculateChecksum();
    }

    if (this._checksumValue !== false) {
        if (this.__lastTable === 'C') {
            return this._checksumValue.toString();
        }

        var keys = (this.__lastTable === 'A') ? this._keysA : this._keysB;
        return keys[this._checksumValue];
    }

    return false;
};

/**
 * Specifies the starting_text table if none has been specified earlier.
 *
 * @param string text
 */
Code128.prototype.__setStartFromText = function(text) {
    if (this.__starting_text === null) {
        // If we have a forced table at the start, we get that one...
        if (Array.isArray(text)) {
            if (Array.isArray(text[0])) {
                // Code like array(array(ENCODING, ''))
                this.__starting_text = this.__METHOD[text[0][0]];
                return;
            } else {
                if (typeof text[0] === "string") {
                    // Code like array('test') (Automatic text)
                    text = text[0];
                } else {
                    // Code like array(ENCODING, '')
                    this.__starting_text = this.__METHOD[text[0]];
                    return;
                }
            }
        }

        // At this point, we had an "automatic" table selection...
        // If we can get at least 4 numbers, go in C; otherwise go in B.
        var tmp = Utility.regexpQuote(this._keysC);
        var length = text.length;
        var regexp = new RegExp('[ ' + tmp + ']');
        if (length >= 4 && text.substr(0, 4).match(regexp) !== null) {
            this.__starting_text = 'C';
        } else {
            if (length > 0 && this._keysB.indexOf(text[0]) >= 0) {
                this.__starting_text = 'B';
            } else {
                this.__starting_text = 'A';
            }
        }
    }
};

/**
 * Extracts the ~ value from the text at the pos.
 * If the tilde is not ~~, ~F1, ~F2, ~F3, ~F4; an error is raised.
 *
 * @param string text
 * @param int pos
 * @return string
 */
Code128.prototype.__extractTilde = function(text, pos) {
    if (text[pos] === '~') {
        if (text[pos + 1] !== undefined) {
            // Do we have a tilde?
            if (text[pos + 1] === '~') {
                return '~~';
            } else if (text[pos + 1] === 'F') {
                // Do we have a number after?
                if (text[pos + 2] !== undefined) {
                    var v = parseInt(text[pos + 2], 10);
                    if (v >= 1 && v <= 4) {
                        return '~F' + v;
                    } else {
                        throw new ParseException('Code128', 'Bad ~F. You must provide a number from 1 to 4.');
                    }
                } else {
                    throw new ParseException('Code128', 'Bad ~F. You must provide a number from 1 to 4.');
                }
            } else {
                throw new ParseException('Code128', 'Wrong code after the ~.');
            }
        } else {
            throw new ParseException('Code128', 'Wrong code after the ~.');
        }
    } else {
        throw new ParseException('Code128', 'There is no ~ at this location.');
    }
};

/**
 * Gets the "dotted" sequence for the text based on the currentMode.
 * There is also a check if we use the special tilde ~
 *
 * @param string text
 * @param string currentMode
 * @return string
 */
Code128.prototype.__getSequenceParsed = function(text, currentMode) {
    var length;
    if (this.__tilde) {
        var sequence = '';
        var previousPos = 0;
        while ((pos = text.indexOf('~', previousPos)) !== -1) {
            var tildeData = this.__extractTilde(text, pos);

            var simpleTilde = (tildeData === '~~');
            if (simpleTilde && currentMode !== 'B') {
                throw new ParseException('Code128', 'The Table ' + currentMode + ' doesn\'t contain the character ~.');
            }

            // At this point, we know we have ~Fx
            if (tildeData !== '~F1' && currentMode === 'C') {
                // The mode C doesn't support ~F2, ~F3, ~F4
                throw new ParseException('Code128', 'The Table C doesn\'t contain the function ' + tildeData + '.');
            }

            length = pos - previousPos;
            if (currentMode === 'C') {
                if (length % 2 === 1) {
                    throw new ParseException('Code128', 'The text "' + text + '" must have an even number of character to be encoded in Table C.');
                }
            }

            sequence += Utility.strRepeat('.', length);
            sequence += '.';
            sequence += (!simpleTilde) ? 'F' : '';
            previousPos = pos + tildeData.length;
        }

        // Flushing
        length = text.length - previousPos;
        if (currentMode === 'C') {
            if (length % 2 === 1) {
                throw new ParseException('Code128', 'The text "' + text + '" must have an even number of character to be encoded in Table C.');
            }
        }

        sequence += Utility.strRepeat('.', length);

        return sequence;
    } else {
        return Utility.strRepeat('.', text.length);
    }
};

/**
 * Parses the text and returns the appropriate sequence for the Table A.
 *
 * @param string text
 * @param string currentMode
 * @return string
 */
Code128.prototype.__setParseA = function(text, currentMode) {
    var tmp = Utility.regexpQuote(this._keysA);

    // If we accept the ~ for special character, we must allow it.
    if (this.__tilde) {
        tmp += '~';
    }

    var match;
    var regexp = new RegExp('[^' + tmp + ']');
    if ((match = text.match(regexp)) !== null) {
        // We found something not allowed
        throw new ParseException('Code128', 'The text "' + text + '" can\'t be parsed with the Table A. The character "' + match[0] + '" is not allowed.');
    } else {
        var latch = (currentMode === 'A') ? '' : '0';
        currentMode = 'A';

        return {
            value: latch + this.__getSequenceParsed(text, currentMode),
            currentMode: currentMode
        };
    }
};

/**
 * Parses the text and returns the appropriate sequence for the Table B.
 *
 * @param string text
 * @param string currentMode
 * @return string
 */
Code128.prototype.__setParseB = function(text, currentMode) {
    var tmp = Utility.regexpQuote(this._keysB);

    var match;
    var regexp = new RegExp('[^' + tmp + ']');
    if ((match = text.match(regexp)) !== null) {
        // We found something not allowed
        throw new ParseException('Code128', 'The text "' + text + '" can\'t be parsed with the Table B. The character "' + match[0] + '" is not allowed.');
    } else {
        var latch = (currentMode === 'B') ? '' : '1';
        var currentMode = 'B';

        return {
            value: latch + this.__getSequenceParsed(text, currentMode),
            currentMode: currentMode
        };
    }
};

/**
 * Parses the text and returns the appropriate sequence for the Table C.
 *
 * @param string text
 * @param string currentMode
 * @return string
 */
Code128.prototype.__setParseC = function(text, currentMode) {
    var tmp = Utility.regexpQuote(this._keysC);

    // If we accept the ~ for special character, we must allow it.
    if (this.__tilde) {
        tmp += '~F';
    }

    var match;
    var regexp = new RegExp('[^' + tmp + ']');
    if ((match = text.match(regexp)) !== null) {
        // We found something not allowed
        throw new ParseException('Code128', 'The text "' + text + '" can\'t be parsed with the Table C. The character "' + match[0] + '" is not allowed.');
    } else {
        var latch = (currentMode === 'C') ? '' : '2';
        var currentMode = 'C';

        return {
            value: latch + this.__getSequenceParsed(text, currentMode),
            currentMode: currentMode
        };
    }
};

/**
 * Depending on the text, it will return the correct
 * sequence to encode the text.
 *
 * @param string text
 * @param string starting_text
 * @return string
 */
Code128.prototype.__getSequence = function(text, starting_text) {
    var ret;
    var e = 10000;
    var latLen = [
        [0, 1, 1],
        [1, 0, 1],
        [1, 1, 0]
    ];
    var shftLen = [
        [e, 1, e],
        [1, e, e],
        [e, e, e]
    ];
    var charSiz = [2, 2, 1];

    var startA = e;
    var startB = e;
    var startC = e;
    if (starting_text === 'A') { startA = 0; }
    if (starting_text === 'B') { startB = 0; }
    if (starting_text === 'C') { startC = 0; }

    var curLen = [startA, startB, startC];
    var curSeq = [null, null, null];

    var nextNumber = false;

    var x = 0;
    var xLen = text.length;
    for (x = 0; x < xLen; x++) {
        var input = text[x];

        // 1.
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if ((curLen[i] + latLen[i][j]) < curLen[j]) {
                    curLen[j] = curLen[i] + latLen[i][j];
                    curSeq[j] = curSeq[i] + j;
                }
            }
        }

        // 2.
        var nxtLen = [e, e, e];
        var nxtSeq = [];

        // 3.
        var flag = false;
        var posArray = [];

        // Special case, we do have a tilde and we process them
        if (this.__tilde && input === '~') {
            var tildeData = this.__extractTilde(text, x);

            if (tildeData === '~~') {
                // We simply skip a tilde
                posArray.push(1);
                x++;
            } else if (tildeData.substr(0, 2) === '~F') {
                v = parseInt(tildeData[2], 10);
                posArray.push(0);
                posArray.push(1);
                if (v === 1) {
                    posArray.push(2);
                }

                x += 2;
                flag = true;
            }
        } else {
            var pos = this._keysA.indexOf(input);
            if (pos !== -1) {
                posArray.push(0);
            }

            pos = this._keysB.indexOf(input);
            if (pos !== -1) {
                posArray.push(1);
            }

            // Do we have the next char a number?? OR a ~F1
            pos = this._keysC.indexOf(input);
            if (nextNumber || (pos !== -1 && text[x + 1] !== undefined && this._keysC.indexOf(text[x + 1]) !== -1)) {
                nextNumber = !nextNumber;
                posArray.push(2);
            }
        }

        var c = posArray.length;
        for (i = 0; i < c; i++) {
            if ((curLen[posArray[i]] + charSiz[posArray[i]]) < nxtLen[posArray[i]]) {
                nxtLen[posArray[i]] = curLen[posArray[i]] + charSiz[posArray[i]];
                nxtSeq[posArray[i]] = curSeq[posArray[i]] + '.';
            }

            for (j = 0; j < 2; j++) {
                if (j === posArray[i]) { continue };
                if ((curLen[j] + shftLen[j][posArray[i]] + charSiz[posArray[i]]) < nxtLen[j]) {
                    nxtLen[j] = curLen[j] + shftLen[j][posArray[i]] + charSiz[posArray[i]];
                    nxtSeq[j] = curSeq[j] + String.fromCharCode(posArray[i] + 65) + '.';
                }
            }
        }

        if (c === 0) {
            // We found an unsuported character
            throw new ParseException('Code128', 'Character ' + input + ' not supported.');
        }

        if (flag) {
            for (i = 0; i < 5; i++) {
                if (nxtSeq[i] !== undefined) {
                    nxtSeq[i] += 'F';
                }
            }
        }

        // 4.
        for (i = 0; i < 3; i++) {
            curLen[i] = nxtLen[i];
            if (nxtSeq[i] !== undefined) {
                curSeq[i] = nxtSeq[i];
            }
        }
    }

    // Every curLen under e is possible but we take the smallest
    var m = e;
    var k = -1;
    for (i = 0; i < 3; i++) {
        if (curLen[i] < m) {
            k = i;
            m = curLen[i];
        }
    }

    if (k === -1) {
        ret = '';
    }

    this.__starting_text = String.fromCharCode(k + 65);

    ret = curSeq[k];

    return {
        value: ret,
        starting_text: starting_text
    };
};

/**
 * Depending on the sequence seq given (returned from getSequence()),
 * this method will return the code stream in an array. Each char will be a
 * string of bit based on the Code 128.
 *
 * Each letter from the sequence represents bits.
 *
 * 0 to 2 are latches
 * A to B are Shift + Letter
 * . is a char in the current encoding
 *
 * @param string text
 * @param string seq
 * @return string[][]
 */
Code128.prototype.__createBinaryStream = function(text, seq) {
    var ret;
    var c = seq.length;

    var data = []; // code stream
    var indcheck = []; // index for checksum

    var currentEncoding = 0;
    if (this.__starting_text === 'A') {
        currentEncoding = 0;
        indcheck.push(Code128.KEY_STARTA);
        this.__lastTable = 'A';
    } else if (this.__starting_text === 'B') {
        currentEncoding = 1;
        indcheck.push(Code128.KEY_STARTB);
        this.__lastTable = 'B';
    } else if (this.__starting_text === 'C') {
        currentEncoding = 2;
        indcheck.push(Code128.KEY_STARTC);
        this.__lastTable = 'C';
    }

    data.push(this._code[103 + currentEncoding]);

    var temporaryEncoding = -1;
    for (var i = 0, counter = 0; i < c; i++) {
        var input = seq[i];
        var inputI = parseInt(input, 10);
        if (input === '.') {
            ret = this.__encodeChar(data, currentEncoding, seq, text, i, counter, indcheck);
            data = ret.data;
            i = ret.i;
            counter = ret.counter;
            indcheck = ret.indcheck;
            if (temporaryEncoding !== -1) {
                currentEncoding = temporaryEncoding;
                temporaryEncoding = -1;
            }
        } else if (input >= 'A' && input <= 'B') {
            // We shift
            var encoding = input.charCodeAt(0) - 65;
            var shift = this.__shift[currentEncoding][encoding];
            indcheck.push(shift);
            data.push(this._code[shift]);
            if (temporaryEncoding === -1) {
                temporaryEncoding = currentEncoding;
            }

            currentEncoding = encoding;
        } else if (inputI >= 0 && inputI < 3) {
            temporaryEncoding = -1;

            // We latch
            var latch = this.__latch[currentEncoding][inputI];
            if (latch !== null) {
                indcheck.push(latch);
                this.__lastTable = String.fromCharCode(65 + inputI);
                data.push(this._code[latch]);
                currentEncoding = inputI;
            }
        }
    }

    return [indcheck, data];
};

/**
 * Encodes characters, base on its encoding and sequence
 *
 * @param int[] data
 * @param int encoding
 * @param string seq
 * @param string text
 * @param int i
 * @param int counter
 * @param int[] indcheck
 */
Code128.prototype.__encodeChar = function(data, encoding, seq, text, i, counter, indcheck) {
    if (seq[i + 1] !== undefined && seq[i + 1] === 'F') {
        // We have a flag !!
        if (text[counter + 1] === 'F') {
            var number = text[counter + 2];
            var fnc = this.__fnc[encoding][number - 1];
            indcheck.push(fnc);
            data.push(this._code[fnc]);

            // Skip F + number
            counter += 2;
        } else {
            // Not supposed
        }

        i++;
    } else {
        if (encoding === 2) {
            // We take 2 numbers in the same time
            var code = parseInt(text.substr(counter, 2), 10);
            indcheck.push(code);
            data.push(this._code[code]);
            counter++;
            i++;
        } else {
            var keys = (encoding === 0) ? this._keysA : this._keysB;
            var pos = keys.indexOf(text[counter]);
            indcheck.push(pos);
            data.push(this._code[pos]);
        }
    }

    counter++;

    return {
        data: data,
        i: i,
        counter: counter,
        indcheck: indcheck
    };
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
Code128.prototype.__setData = function(data) {
    this.__indcheck = data[0];
    this.__data = data[1];
    this._calculateChecksum();
    this.__data.push(this._code[this._checksumValue]);
    this.__data.push(this._code[Code128.KEY_STOP]);
};

module.exports = Code128;