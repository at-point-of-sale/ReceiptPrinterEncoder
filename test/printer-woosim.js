import ReceiptPrinterEncoder from '../src/receipt-printer-encoder.js';
import { assert } from 'chai';


describe('Woosim', function() {
    describe('woosim-wsp-r240: codepage(windows1252).text(€)', function () {
        let encoder = new ReceiptPrinterEncoder({ printerModel: 'woosim-wsp-r240' });
        let result = encoder.codepage('windows1252').text('€').encode();

        it('should select windows1252 with the Woosim number 14', function () {
            assert.deepEqual(new Uint8Array([ 27, 116, 14, 128, 10, 13 ]), result);
        });
    });

    describe('woosim-wsp-r240: codepage(auto).text(€)', function () {
        let encoder = new ReceiptPrinterEncoder({ printerModel: 'woosim-wsp-r240' });
        let result = encoder.codepage('auto').text('€').encode();

        it('should not select cp857, which has no euro sign on this printer', function () {
            assert.deepEqual(new Uint8Array([ 27, 116, 13, 164, 10, 13 ]), result);
        });
    });

    describe('woosim-porti-s3040: codepage(auto).text(€)', function () {
        let encoder = new ReceiptPrinterEncoder({ printerModel: 'woosim-porti-s3040' });
        let result = encoder.codepage('auto').text('€').encode();

        it('should not select a code page above 5, the printer only has 0 to 5', function () {
            assert.deepEqual(new Uint8Array([ 27, 116, 0, 63, 10, 13 ]), result);
        });
    });

    describe('woosim-porti-s3040: qrcode(hello)', function () {
        let encoder = new ReceiptPrinterEncoder({ printerModel: 'woosim-porti-s3040', errors: 'relaxed' });
        let result = encoder.qrcode('hello').encode();

        it('should be skipped, the printer has no QR code engine', function () {
            assert.deepEqual(new Uint8Array([]), result);
        });
    });
});
