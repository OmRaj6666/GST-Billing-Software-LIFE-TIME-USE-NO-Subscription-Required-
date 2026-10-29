// v1.10.66 (#63) — CSV export safety.
//
// Run: `node scripts/csv-test.mjs`
//
// A cell that starts with = + - @ (or a tab / carriage return) is executed as
// a formula when the CSV is opened in Excel, LibreOffice or Google Sheets. The
// exports in Expenses, Purchases and GST Returns wrote such text raw, so a
// client or item name could plant a live formula in someone's ledger.
//
// The other half matters just as much: amounts must come out untouched, or
// the fix breaks every sum a user runs over an exported column.

import { toCsvCell, toCsvLine } from '../src/utils.js';
import { dateOrderNote, parseCsv, toIsoDate, toNum, salesCsvToBills, billsToSalesCsv, purchaseCsvToRecords, purchasesToCsv, SALES_TEMPLATE, PURCHASE_TEMPLATE } from '../src/utils/bulkCsv.js';

let passed = 0, failed = 0;
function eq(actual, expected, label) {
  if (actual === expected) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}\n     expected: ${JSON.stringify(expected)}\n     actual:   ${JSON.stringify(actual)}`); }
}

console.log('\n[#63] Formula-like text is written as plain text');
eq(toCsvCell('=HYPERLINK("http://evil.example","Invoice")'),
  `"'=HYPERLINK(""http://evil.example"",""Invoice"")"`,
  'leading = gets an apostrophe, and its quotes are still escaped');
eq(toCsvCell("=cmd|' /C calc'!A0"), "'=cmd|' /C calc'!A0", 'DDE command payload');
eq(toCsvCell('+91 98765 43210'), "'+91 98765 43210", 'leading + (a phone number) stays text');
eq(toCsvCell('@SUM(A1:A9)'), "'@SUM(A1:A9)", 'leading @');
eq(toCsvCell('-2+3'), "'-2+3", 'leading - followed by an expression');
eq(toCsvCell('\t=1+1'), "'\t=1+1", 'leading tab');
eq(toCsvCell('\r=1+1'), `"'\r=1+1"`, 'leading carriage return');

console.log('\n[#63] Real data is left intact');
eq(toCsvCell(-500), '-500', 'negative number');
eq(toCsvCell('-500.00'), '-500.00', 'negative amount string, as toFixed(2) produces');
eq(toCsvCell(1234.5), '1234.5', 'positive number');
eq(toCsvCell(0), '0', 'zero');
eq(toCsvCell('-'), '-', 'a lone dash placeholder');
eq(toCsvCell('Acme Traders'), 'Acme Traders', 'plain text');
eq(toCsvCell('03AAAAA1111A1Z1'), '03AAAAA1111A1Z1', 'GSTIN');
eq(toCsvCell(null), '', 'null');
eq(toCsvCell(undefined), '', 'undefined');

console.log('\n[#63] Quoting still works');
eq(toCsvCell('Mehta, Sons'), '"Mehta, Sons"', 'comma');
eq(toCsvCell('6" pipe'), '"6"" pipe"', 'double quote');
eq(toCsvCell('line one\nline two'), '"line one\nline two"', 'a line break cannot split the row');
eq(toCsvLine(['=1', 'Acme', -20, '']), "'=1,Acme,-20,", 'toCsvLine escapes every cell');

console.log('\n[#101] Bulk CSV import / export of sales and purchase bills');
{
  const rows = parseCsv('﻿a,b\r\n"x, ""y""",2\n"multi\nline",3\n\n');
  eq(JSON.stringify(rows), JSON.stringify([['a', 'b'], ['x, "y"', '2'], ['multi\nline', '3']]), 'parser: BOM, quotes, commas and line breaks in cells, CRLF, blank lines');
  eq([toIsoDate('2026-10-01'), toIsoDate('01-10-2026'), toIsoDate('1/10/26'), toIsoDate('05-Oct-2026'), toIsoDate('31-02-2026')].join(' '),
    '2026-10-01 2026-10-01 2026-10-01 2026-10-05 ', 'dates: ISO, DD-MM-YYYY, D/M/YY, DD-Mon-YYYY; 31 Feb refused');
  eq([toNum('1,234.50'), toNum('₹ 99'), toNum('', 1), Number.isNaN(toNum('abc'))].join(' '), '1234.5 99 1 true', 'numbers: commas, ₹, blank default, text refused');

  const profile = { country: 'India', state: 'Maharashtra', gstin: '27AAAAA0000A1Z5', businessName: 'Acme' };
  const products = [{ id: 'p1', name: 'Steel rod 8mm', hsn: '7214', unit: 'Kg' }];
  const res = salesCsvToBills(SALES_TEMPLATE, { profile, products, adjustStock: true });
  const b = res.bills[0];
  eq(res.bills.length, 1, 'template: two rows with one number make one invoice');
  eq(res.errors.length, 0, 'template imports with no errors');
  eq(b.totalAmount, 1026.6, 'totals worked out like the invoice screen: (720 + 150) + 18% = 1026.60');
  eq([b.data.totals.cgst, b.data.totals.sgst, b.data.totals.igst].join(','), '78.3,78.3,0', 'same state: CGST + SGST');
  eq(JSON.stringify(b.data.stockApplied), '{"p1":-10}', 'stock follows the bill only for the product it names');
  eq(salesCsvToBills(SALES_TEMPLATE, { profile, products }).bills[0].data.stockApplied.p1, undefined, 'without "adjust stock" no product is linked and stock does not move');
  eq(res.newClients.length, 1, 'a client not in the list is offered as a new client');

  const inter = salesCsvToBills(SALES_TEMPLATE.replace(/Maharashtra/g, 'Gujarat'), { profile });
  eq(inter.bills[0].data.totals.igst, 156.6, 'client in another state: IGST');
  eq(salesCsvToBills(SALES_TEMPLATE, { profile, existingIds: new Set(['INV/2026-27/0101']) }).skipped.join(), 'INV/2026-27/0101', 'an invoice number already used is skipped, never overwritten');
  const bos = salesCsvToBills(SALES_TEMPLATE.replace(/Tax Invoice/g, 'Bill of Supply'), { profile });
  eq(bos.bills[0].totalAmount, 870, 'a bill of supply charges no GST');
  const bad = salesCsvToBills('Invoice Number,Date,Client,Item,Qty,Rate\nX1,32-13-2026,A,B,1,5\nX2,2026-10-01,A,B,1,abc\nX3,2026-10-01,,B,1,5', { profile });
  eq(bad.bills.length + ':' + bad.errors.length, '0:3', 'bad date, bad rate and missing client are each reported, nothing half-imported');

  const again = salesCsvToBills(billsToSalesCsv(res.bills), { profile, products, adjustStock: true });
  eq(again.bills[0].totalAmount, b.totalAmount, 'export -> import gives the same invoice total');

  const pur = purchaseCsvToRecords(PURCHASE_TEMPLATE, { profile });
  const p = pur.purchases[0];
  eq([pur.purchases.length, p.taxableAmount, p.totalTax, p.totalAmount, p.ownerGstin].join(','), '1,6000,1080,7080,27AAAAA0000A1Z5', 'purchase: totals as the purchase form, filed under the business');
  eq(purchaseCsvToRecords(PURCHASE_TEMPLATE, { profile, existing: [{ supplierGstin: '27AAACG1234K1Z2', invoiceNumber: 'sup/552' }] }).skipped.length, 1, 'a supplier bill already booked is skipped');
  eq(purchaseCsvToRecords(PURCHASE_TEMPLATE.replace(',No,', ',,'), { profile, inferInterstate: () => true }).purchases[0].interstate, true, 'blank Inter-state is worked out from the GSTIN');
  eq(purchaseCsvToRecords(purchasesToCsv([p]), { profile }).purchases[0].totalAmount, 7080, 'purchase export -> import round trip');
}

console.log('\n[Review] Import never merges different invoices or double-books a bill');
{
  const head = 'Invoice Number,Invoice Date,Client Name,Client State,Item Name,Quantity,Rate,GST %\n';
  const r = salesCsvToBills(head + '1,2025-04-02,Alpha Traders,Punjab,Pens,1,1000,18\n1,2026-04-03,Beta Stores,Gujarat,Ink,1,1000,18\n',
    { profile: { country: 'India', state: 'Punjab' } });
  eq(r.bills.length, 0, 'Two different invoices sharing a number are not merged into one');
  eq(/different date or client/.test(r.errors.join(' ')), true, 'and the row is named in the error');
  const ok = salesCsvToBills(head + '7,2026-04-03,Alpha Traders,Punjab,Pens,1,100,18\n7,,alpha traders,,Ink,2,50,18\n',
    { profile: { country: 'India', state: 'Punjab' } });
  eq(ok.bills.length === 1 && ok.bills[0].data.items.length === 2, true, 'Item rows of one invoice (blank or same-name repeats) still make one invoice');

  // Export -> import keeps the bill discount and the round-off (977 came back as 1026.6).
  const prof = { country: 'India', state: 'Punjab' };
  const src = salesCsvToBills(head.replace('GST %\n', 'GST %,Bill Discount,Round Off\n') + '9,2026-10-01,Alpha Traders,Punjab,Pens,3,290.3,18,50,Yes\n', { profile: prof });
  const back = salesCsvToBills(billsToSalesCsv(src.bills), { profile: prof });
  eq(`${src.bills[0].totalAmount}`, `${Math.round(3 * 290.3 * 1.18 - 50)}`, 'Bill discount and round-off are applied on import');
  eq(back.bills[0].totalAmount, src.bills[0].totalAmount, 'An exported invoice re-imports to the same total');

  const existing = [{ supplierName: 'Ravi Paper Mart', supplierGstin: '03AAAAA1111A1Z1', invoiceNumber: 'RP-9' }];
  const p = purchaseCsvToRecords('Invoice Number,Invoice Date,Supplier Name,Item Name,Quantity,Rate\nRP-9,2026-10-01,ravi paper mart,A4 Paper,10,250\n', { existing });
  eq(`${p.purchases.length}/${p.skipped.length}`, "0/1", 'A bill saved with a GSTIN is found again from a CSV row with only the supplier name');
}

console.log('\n[Review] Day-first and month-first dates');
{
  eq(dateOrderNote(['13/01/2026', '10/01/2026']).warning, undefined, 'A file with a day over 12 is clearly day first: no warning');
  eq(/10 January 2026/.test(dateOrderNote(['10/01/2026', '2026-01-05']).warning), true, 'Only ambiguous dates: a warning names how one was read');
  eq(/month first/.test(dateOrderNote(['10/25/2026', '10/01/2026']).error), true, 'A month-first file (10/25/2026) is refused as a whole');
  const head = 'Invoice Number,Invoice Date,Client Name,Item Name,Rate\n';
  const us = salesCsvToBills(head + '1,10/25/2026,A,Pen,10\n2,10/01/2026,B,Ink,10\n', { profile: { country: 'India', state: 'Punjab' } });
  eq(`${us.bills.length}/${us.errors.length}`, '0/1', '...so not even its ambiguous rows are imported with swapped dates');
  const p = purchaseCsvToRecords('Invoice Number,Invoice Date,Supplier Name,Item Name,Rate\nX1,03/04/2026,S,Paper,5\n', {});
  eq(`${p.purchases.length}/${p.warnings.length}`, '1/1', 'Purchases get the same warning');
}

console.log('\n────────────────────────────────────────');
console.log(`Passed: ${passed}   Failed: ${failed}`);
if (failed) process.exit(1);
