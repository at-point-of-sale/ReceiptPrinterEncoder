# ReceiptPrinterEncoder
**Formally known as EscPosEncoder, StarPrntEncoder and ThermalPrinterEncoder**

<br>

Create a set of commands that can be send to any receipt printer that supports ESC/POS, StarLine or StarPRNT.

- [About ReceiptPrinterEncoder](../README.md)
- [Usage and installation](usage.md)
- [Configuration options](configuration.md)
  - [Printer model](#printer-model)
  - [Printer language](#printer-language)
  - [Paper width](#paper-width)
  - [Feed before cut](#feed-before-cut)
  - [Newline](#newline)
  - [Image mode](#image-mode)
  - [ReceiptLine](#receiptline)
- [Handling text](text.md)
- [Commands for creating receipts](commands.md)
- [Printing receipts](printing.md)
- [Migrating from version 3 to version 4](changes.md)
- [Migrating from version 2 to version 3](changes.md#migrating-from-version-2-to-version-3)

<br>

## Configuration options

When you create the `ReceiptPrinterEncoder` object you can specify a number of options to help with the library with generating receipts. 

<br>

### Printer model

The easiest way to configure this library is by specifying the model of the printer that you are using. It will then automatically configure the most important configuration options, such as the printer language, supported code pages, image mode and more.

```js
let encoder = new ReceiptPrinterEncoder({ 
    printerModel: 'epson-tm-t88vi'
});
```

To get a complete list of supported printers, you can look at the `printerModels` static property:

```js
console.log(ReceiptPrinterEncoder.printerModels);

[
    { id: "bixolon-srp350":     name: "Bixolon SRP-350" },
    { id: "bixolon-srp350iii":  name: "Bixolon SRP-350III" },
    { id: "citizen-ct-s310ii":  name: "Citizen CT-S310II" },
    { id: "epson-tm-p20ii":     name: "Epson TM-P20II" },
    { id: "epson-tm-t20iii":    name: "Epson TM-T20III" },
    ...
]
```

Our database of devices has some of the most used devices. However if you device is not supported, you may be able to try a similar printer model. 

For example, if if your printer is a newer or older version of a model that is supported, you can try the closest version that is in our database.

Or if you are using a cheap printer without a proper brandname, you can try `pos-5890` or `pos-8360`. Many cheap printers that you can find on AliExpress or TEMU use the same internals or firmware. 

The cheap Bluetooth Low Energy printers that are sold as cat printers, or Meow printers, have no fonts and no barcode engine and only print images. Use the `meow` model for them. It configures the encoder for 58 mm paper with the fonts and code pages of an Epson printer, and a driver such as [WebBluetoothReceiptPrinter](https://github.com/at-point-of-sale/WebBluetoothReceiptPrinter) renders the ESC/POS commands to images with [ReceiptPrinterRenderer](https://github.com/at-point-of-sale/ReceiptPrinterRenderer) before sending them to the printer.

The Woosim WSP-R240 and Porti-S30/40 are 58 mm mobile printers that have been sold with orienteering timing equipment for many years, sometimes under other names, such as the Emit EPR3 for the WSP-R240. Use the `woosim-wsp-r240` and `woosim-porti-s3040` models for them. Their command set looks like ESC/POS, but they number their code pages in their own way, do not understand the `GS ( k` QR code command and print a different set of barcodes, so the Epson models do not fit them well.

<br>

-----

<br>

If your printer is not in the list, you can manually configure the settings for your printer with the options below. You can also use this to overwrite the default settings of the printer, for example if you want to use a Star printer in ESC/POS mode, or if you put 57 mm paper in a 80 mm printer.

<br>

### Printer language

It is possible to specify the language of the printer you want to use by providing a options object with the property `language` set to either `esc-pos`, `star-prnt` or `star-line`. By default the library uses ESC/POS.

To use the ESC/POS language use:

```js
let encoder = new ReceiptPrinterEncoder({ 
    language: 'esc-pos'
});
```

Or for StarPRNT use:

```js
let encoder = new ReceiptPrinterEncoder({ 
    language: 'star-prnt'
});
```

Or for StarLine use:

```js
let encoder = new ReceiptPrinterEncoder({ 
    language: 'star-line'
});
```

<br>

### Paper width

To set the width of the paper you can use the `columns` property. Specify the number of characters that one line can hold. This will ensure that words will properly wrap to the next line at the end of the paper. 

```js
let encoder = new ReceiptPrinterEncoder({
    columns: 48
});
```

The number of characters are measured using Font A which is 12 pixels wide. If you choose a smaller font the point where words will be wrapped will be automatically adjusted to take the new font width into account.

If you use 57mm wide paper, it allows you to print up to 32 or 35 characters horizontally, depending on the resolution of the printer.

If you use 80mm wide paper, it allows you to print up to 42, 44 or 48 characters horizontally, depending on the resolution of the printer.

<br>

### Feed before cut

In most printers the cutter is located above the printing mechanism, that means that if you cut immediately after printing a line of text, the cut will be above the text. 

To prevent this, you can feed the paper a number of lines before cutting the paper.

```js
let encoder = new ReceiptPrinterEncoder({
    feedBeforeCut: 4
});
```

<br>

### Feed after block

Images, barcodes, QR codes and PDF417 codes advance the paper by themselves. By default the encoder still sends a line feed after them, which results in an empty line below the image or code.

To print the content that follows directly below the image or code, set the `feedAfterBlock` option to `false`. You can then use `newline()` to add space where you want it.

```js
let encoder = new ReceiptPrinterEncoder({
    feedAfterBlock: false
});
```

<br>

### Newline

Most printers use a combination of a newline and carriage return to move the text position to the beginning of the next line. 

However, some more exotic printers only use a newline, causing the printer to insert an extra empty line between each line of text.

```js
let encoder = new ReceiptPrinterEncoder({
    newline: '\n'
});
```

<br>

### Image mode

If you use the ESC/POS language, depending on how new your printer is you might want to use `column` mode or `raster` image encoding mode. The default is `column`. 

The main difference is how images are encoded. Some newer printers do not support `raster` mode images, while some older printer do not support `column` mode images. It may depend on the printer model what mode you should use.

To opt in to `raster` mode you need to provide the constructor of the `ReceiptPrinterEncoder` class with an options object with the property `imageMode` set to `raster`.

```js
let encoder = new ReceiptPrinterEncoder({ 
    imageMode: 'raster' 
});
```

The option sets the mode for every image. To send one image in the other mode, use the `mode` option of the [image command](commands.md#image).

<br>

### ReceiptLine

The `receiptline()` command prints documents in the receiptline markup language, but the layout of those documents is not part of this library. It lives in the [`@point-of-sale/receiptline`](https://github.com/at-point-of-sale/ReceiptLine) package, which decodes the images in a document with `pngjs` in Node and with the browser's own decoder in the browser. Give the module to the encoder with the `receiptline` option and the command becomes available:

```js
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import * as ReceiptLine from '@point-of-sale/receiptline';

let encoder = new ReceiptPrinterEncoder({
    receiptline: ReceiptLine
});
```

The option takes any object with a `transform(encoder, document, options)` function that prints the document onto the encoder and returns a promise, which is what the package exports. See [the receiptline command](markup.md#receiptline).
