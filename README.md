# Barcode Bakery 1D

Generate 1D barcode used for tracking.

## Supported 1D types

* [Codabar](http://www.barcodebakery.com/en/resources/api/nodejs/codabar)
* [Code 11](http://www.barcodebakery.com/en/resources/api/nodejs/code11)
* [Code 128](http://www.barcodebakery.com/en/resources/api/nodejs/code128)
* [Code 39](http://www.barcodebakery.com/en/resources/api/nodejs/code39)
* [Code 39 Extended](http://www.barcodebakery.com/en/resources/api/nodejs/code39extended)
* [Code 93](http://www.barcodebakery.com/en/resources/api/nodejs/code93)
* [EAN-13](http://www.barcodebakery.com/en/resources/api/nodejs/ean13)
* [EAN-8](http://www.barcodebakery.com/en/resources/api/nodejs/ean8)
* [Interleaved 2 of 5](http://www.barcodebakery.com/en/resources/api/nodejs/i25)
* [ISBN](http://www.barcodebakery.com/en/resources/api/nodejs/isbn)
* [MSI](http://www.barcodebakery.com/en/resources/api/nodejs/msi)
* [Standard 2 of 5](http://www.barcodebakery.com/en/resources/api/nodejs/s25)
* [UPC-A](http://www.barcodebakery.com/en/resources/api/nodejs/upca)
* [UPC-E](http://www.barcodebakery.com/en/resources/api/nodejs/upce)
* [UPC Extension 2](http://www.barcodebakery.com/en/resources/api/nodejs/upcext2)
* [UPC Extension 5](http://www.barcodebakery.com/en/resources/api/nodejs/upcext5)
* [Custom barcode](http://www.barcodebakery.com/en/resources/api/nodejs/othercode)

## Requirements

- [node-canvas](https://github.com/Automattic/node-canvas).
- node >= 4.2.6

## Installation

	npm install barcode-bakery-1d

## Example

Each barcodes can be reached from the `barcode-bakery-1d` package.
Each barcode has different methods that can be used to change its size, color, etc. Check the manual to get more information.

```javascript
var barcodeBakeryCommon = require('barcode-bakery-common');
var barcodeBakery1D = require('barcode-bakery-1d');
var Color = barcodeBakeryCommon.Color;
var Drawing = barcodeBakeryCommon.Drawing;
var Font = barcodeBakeryCommon.Font;

// The arguments are R, G, B for color.
var colorFront = new Color(0, 0, 0);
var colorBack = new Color(255, 255, 255);

var code = new barcodeBakery1D.Code39();
code.setScale(2); // Resolution
code.setThickness(30); // Thickness
code.setBackgroundColor(colorBack); // Color of spaces
code.setForegroundColor(colorFront); // Color of bars
code.setFont(font); // Font (or 0)
code.parse("HELLO"); // Text
```

### Save to disk
```javascript
var drawing = new Drawing(code, colorBack);
drawing.save("image.png", Drawing.IMG_FORMAT_PNG, function() {
    console.log("Done.");
});
```

### Get buffer
var drawing = new Drawing(code, colorBack);
drawing.toBuffer(Drawing.IMG_FORMAT_PNG, function (err, buffer) {
    response.writeHead(200, { "Content-Type": "image/png" });
    response.end(buffer);
});

### Sync methods
Both `save` and `toBuffer` have counterparts acting synchronously: `saveSync` and `toBufferSync`.

## Complete manual
See a complete manual for each barcode on our website http://www.barcodebakery.com.

## Tests
Simply type `mocha` to run the tests.

## License

This script is free for personal use. The program is provide "AS IS" without warranty of any kind.
If you want to use it as commercial use, you have to purchase it on
http://www.barcodebakery.com
You must let the copyright intact.