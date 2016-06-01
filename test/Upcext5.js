'use strict';

var assert = require('assert');
var Label = require('barcode-bakery-common').Label;

var code = 'Upcext5',
    defaultText = '12345',
    secondText = '67890';
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
    
    describe('#__fields', function () {
        it('should contain the same amount of data', function () {
            assert.equal(getProtectedField('keys').length, getProtectedField('code').length);
        });
    });

    describe('#label', function () {
        it('should behave properly with some text', function () {
            instance.parse(defaultText);
            assert.equal(instance.getLabel(), defaultText);
            
            instance.setLabel(secondText);
            assert.equal(instance.getLabel(), secondText);
        });
        
        it('should behave properly with other text', function () {
            instance.parse(secondText);
            assert.equal(instance.getLabel(), secondText);
            
            instance.setLabel(defaultText);
            assert.equal(instance.getLabel(), defaultText);
        });
    });

    describe('#maxSize', function () {
        describe('with no label', function () {
            it('should work with scale=1', function () {
                var scale = 1;
                instance.setLabel(null);
                instance.setScale(scale);
                instance.setThickness(30);
                instance.parse(defaultText);
                assert.deepEqual([(7 * defaultText.length + 4 + 8) * scale, (30) * scale], instance.getDimension(0, 0));
            });
            
            it('should work with scale=2 and extra positioning', function () {
                var scale = 2,
                    left = 5,
                    top = 10;
                instance.setLabel(null);
                instance.setScale(scale);
                instance.setThickness(30);
                instance.parse(defaultText);
                assert.deepEqual([(7 * defaultText.length + 4 + 8 + left) * scale, (30 + top) * scale], instance.getDimension(left, top));
            });
            
            it('should work with scale=2 and extra positioning and offset', function () {
                var scale = 2,
                    left = 5,
                    top = 10,
                    offsetX = 20,
                    offsetY = 30;
                instance.setLabel(null);
                instance.setScale(scale);
                instance.setThickness(30);
                instance.setOffsetX(offsetX);
                instance.setOffsetY(offsetY);
                instance.parse(defaultText);
                assert.deepEqual([(7 * defaultText.length + 4 + 8 + left + offsetX) * scale, (30 + top + offsetY) * scale], instance.getDimension(left, top));
            });
        });
        
        describe('with one label', function () {
            it('should work with scale=1', function () {
                var scale = 1;
                instance.setScale(scale);
                instance.setThickness(30);
                instance.parse(defaultText);
                var label = getProtectedField('defaultLabel');
                var dimension = label.getDimension();
                assert.equal(label.getPosition(), Label.POSITION_TOP);
                assert.deepEqual([(7 * defaultText.length + 4 + 8) * scale, (30) * scale + dimension[1]], instance.getDimension(0, 0));
            });
            
            it('should work with scale=2', function () {
                var scale = 2;
                instance.setScale(scale);
                instance.setThickness(30);
                instance.parse(defaultText);
                var label = getProtectedField('defaultLabel');
                var dimension = label.getDimension();
                assert.equal(label.getPosition(), Label.POSITION_TOP);
                assert.deepEqual([(7 * defaultText.length + 4 + 8) * scale, (30) * scale + dimension[1]], instance.getDimension(0, 0));
            });
        });
    });
});