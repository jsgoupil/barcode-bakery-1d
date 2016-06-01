'use strict';

var assert = require('assert');
var Font = require('barcode-bakery-common').Font;
var Barcode1D = require('barcode-bakery-common').Barcode1D;

[
    ['Codabar', 'A12345B'],
    ['Code11', '12345'],
    ['Code128', 'Hello'],
    ['Code39', 'HELLO'],
    ['Code39extended', 'HELLO'],
    ['Code93', 'HELLO'],
    ['Ean13', '123456789012'],
    ['Ean8', '1234567'],
    ['I25', '123456'],
    ['Isbn', '123456789123'],
    ['Msi', '12345'],
    ['OtherCode', '0123456789'],
    ['S25', '123456'],
    ['Upca', '12345678901'],
    ['Upce', '123456'],
    ['Upcext2', '12'],
    ['Upcext5', '12345']
].forEach(function (check) {
    var code = check[0];
    var text = check[1];
    
    describe(code, function () {
        var instance;
        
        function getProtectedField(fieldName) {
            return instance['_' + fieldName];
        }
        
        function getPrivateField(fieldName) {
            return instance['__' + fieldName];
        }
        
        beforeEach(function () {
            var clazz = require('../lib/' + code);
            instance = new clazz();
        });
        
        afterEach(function () {
            instance = null;
        });
        
        describe('#getThickness()', function () {
            it('should return 30 by default', function () {
                var thickness = instance.getThickness();
                assert.equal(30, thickness);
            });
        });
        
        describe('#label', function () {
            it('should behave properly', function () {
                instance.setDisplayChecksum(false);
                assert.equal(Barcode1D.AUTO_LABEL, getProtectedField('label'));

                instance.setLabel(null);
                assert.equal(instance.getLabel(), null);
            });
        });
        
        describe('#font', function () {
            it('should behave properly', function () {
                assert.ok(instance.getFont() instanceof Font);
            });
        });
    });
});
