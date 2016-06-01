'use strict';

var assert = require('assert');
var Label = require('barcode-bakery-common').Label;

var code = 'Upca',
    defaultText = '12345678901',
    secondText = '10987654321';
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
        function getLeftLabelSize() {
            var label = getProtectedField('labelLeft');
            return label.getDimension();
        }
        
        function getRightLabelSize() {
            var label = getProtectedField('labelRight');
            return label.getDimension();
        }

        describe('with no label', function () {
            it('should work with scale=1', function () {
                var scale = 1;
                instance.setLabel(null);
                instance.setScale(scale);
                instance.setThickness(30);
                instance.parse(defaultText);
                assert.deepEqual([(7 * 12 + 3 + 5 + 3) * scale, (30) * scale], instance.getDimension(0, 0));
            });
            
            it('should work with scale=2 and extra positioning', function () {
                var scale = 2,
                    left = 5,
                    top = 10;
                instance.setLabel(null);
                instance.setScale(scale);
                instance.setThickness(30);
                instance.parse(defaultText);
                assert.deepEqual([(7 * 12 + 3 + 5 + 3 + left) * scale, (30 + top) * scale], instance.getDimension(left, top));
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
                assert.deepEqual([(7 * 12 + 3 + 5 + 3 + left + offsetX) * scale, (30 + top + offsetY) * scale], instance.getDimension(left, top));
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
                assert.equal(label.getPosition(), Label.POSITION_BOTTOM);
                // We should test Y
                assert.equal((7 * 12 + 3 + 5 + 3) * scale + getLeftLabelSize()[0] + getRightLabelSize()[0], instance.getDimension(0, 0)[0]);
            });
            
            it('should work with scale=2', function () {
                var scale = 2;
                instance.setScale(scale);
                instance.setThickness(30);
                instance.parse(defaultText);
                var label = getProtectedField('defaultLabel');
                var dimension = label.getDimension();
                assert.equal(label.getPosition(), Label.POSITION_BOTTOM);
                // We should test Y
                assert.equal((7 * 12 + 3 + 5 + 3) * scale + getLeftLabelSize()[0] + getRightLabelSize()[0], instance.getDimension(0, 0)[0]);
            });
        });
    });
});