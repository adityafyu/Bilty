/* ── Utility ─────────────────────────────────────── */
const $ = id => document.getElementById(id);
const val = id => ($(id)?.value?.trim() || '');
const num = id => parseFloat($(id)?.value || 0) || 0;
const radioVal = name => (document.querySelector(`input[name="${name}"]:checked`)?.value || '');

function calcTotal() {
  const total =
    num('basicFreight') + num('cartage') + num('hamali') +
    num('gcCharge') + num('otherCharge') - num('advance');
  $('totalDisplay').textContent = 'Rs. ' + total.toLocaleString('en-IN', { minimumFractionDigits: 0 });

  return total;
}

function resetForm() {
  document.getElementById('invoiceForm').reset();
  $('totalDisplay').textContent = '0';
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── PDF Generation ──────────────────────────────── */
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const M = 10;
  const W = 190;
  let y = M;

  // ── Helpers ─────────────────────
  const box = (x, y, w, h) => {
    doc.setDrawColor(0, 0, 0);
    doc.rect(x, y, w, h);
  };
  const text = (t, x, y, size = 9, style = 'normal', align = 'left') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.text(String(t || ''), x, y, { align });
  };

  const val = id => document.getElementById(id)?.value || '';
  const num = id => parseFloat(document.getElementById(id)?.value || 0) || 0;
  const radioVal = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

  const money = n => n ? 'Rs. ' + n.toLocaleString('en-IN') : '';

  // ── Data ───────────────────────
  const data = {

    date: val('dated'),
    vehicle: val('vehicleNo'),
    from: val('from'),
    to: val('to'),
    consignor: val('consignorName'),
    consignee: val('consigneeName'),
    gstin: val('gstincsg'),
    consigneegst: val('gstin'),
    description: val('description'),
    invoiceNo: val('invoiceNo'),
    valueGoods: val('valueGoods'),
    weight: val('weightCharged'),
    payMode: radioVal('payMode'),
    basic: num('basicFreight'),
    cartage: num('cartage'),
    hamali: num('hamali'),
    gc: num('gcCharge'),
    other: num('otherCharge'),
    advance: num('advance'),
    total:
      num('basicFreight') +
      num('cartage') +
      num('hamali') +
      num('gcCharge') +
      num('otherCharge') -
      num('advance')
  };

  // ── HEADER BOX ─────────────────
  box(M, y, W, 25);
  doc.setTextColor(0, 0, 255);
  text('YASHVARDHAN LOGISTICS', 105, y + 6, 18, 'bold', 'center');
  doc.setTextColor(0, 0, 0);
  text('Email : yashvardhanlogistics@gmail.com', M + 2, y + 12, 10, 'bold');
  text('H.O : 39,ATS NavlaKha near maruti tiles, Lohamandi, Indore', M + 2, y + 17);
  text('Phone: 9876497400 | 9826978930, Landline: 07314880555', M + 2, y + 22);

  // right alignment
  text('GSTIN: 23ALVPT7013J1ZM | PAN : ALVPT7013J', M + W, y+17, 9, 'normal', 'right');
  text('Subject to Indore Jurisdiction', M + W, y + 22, 9, 'normal', 'right');


  y += 25;

  // ── TOP ROW ────────────────────
  box(M, y, W, 10);
  text(`Date: ${data.date}`, M + 35, y + 6);
  text(`Vehicle No: ${data.vehicle}`, M + 130, y + 6);

  y += 10;

  // ── FROM / TO ──────────────────
  box(M, y, W / 2, 15);
  text('FROM:', M + 2, y + 5, 9, 'bold');
  text(data.from, M + 2, y + 10);

  box(M + W / 2, y, W / 2, 15);
  text('TO:', M + W / 2 + 2, y + 5, 9, 'bold');
  text(data.to, M + W / 2 + 2, y + 10);

  y += 15;

  // ── CONSIGNOR / CONSIGNEE ─────
  box(M, y, W / 2, 20);
  text('CONSIGNOR:', M + 2, y + 5, 9, 'bold');
  text(data.consignor, M + 2, y + 10);
  text('CONSIGNOR GSTIN:', M + 2, y + 15, 9, 'bold');
  text(data.gstin, M + 2, y + 20)

  box(M + W / 2, y, W / 2, 20);
  text('CONSIGNEE:', M + W / 2 + 2, y + 5, 9, 'bold');
  text(data.consignee, M + W / 2 + 2, y + 10);
  text('CONSIGNEE GSTIN:', M + W / 2 + 2, y + 15, 9, 'bold');
  text(data.consigneegst, M + W / 2 + 2, y + 20)

  y += 20;

  // ── GOODS TABLE ────────────────
  box(M, y, W, 10);
  text('Description', M + 2, y + 6, 9, 'bold');
  text('Weight', M + 130, y + 6, 9, 'bold');
  text('Invoice No', M + 160, y + 6, 9, 'bold');

  y += 10;

  box(M, y, W, 20);
  text(data.description, M + 2, y + 8);
  text(data.weight, M + 130, y + 8);
  text(data.invoiceNo, M + 160, y + 8);

  y += 20;

  // ── EXTRA DETAILS ──────────────
  box(M, y, W, 10);
  text(`Value of Goods: ${data.valueGoods}`, M + 2, y + 6);
  text(`Payment Mode: ${data.payMode}`, M + 110, y + 6);

  y += 10;

  // ── CHARGES TABLE ─────────────
  // ── CHARGES TABLE (DYNAMIC HEIGHT) ─────────────

  const charges = [
    ['Basic Freight', money(data.basic)],
    ['Cartage', money(data.cartage)],
    ['Hamali', money(data.hamali)],
    ['GC Charge', money(data.gc)],
    ['Other Charges', money(data.other)],
    ['Advance', money(data.advance)],
    ['TOTAL', money(data.total), true]
  ];

  let rowHeight = 7;
  let padding = 7;

  // 👉 calculate total height
  let boxHeight = charges.length * rowHeight + padding;

  // draw box with correct height
  box(M, y, W, boxHeight);

  // start writing inside
  let cy = y + 6;

  charges.forEach(([label, value, isTotal]) => {

    // line before TOTAL
    if (isTotal) {
      doc.line(M, cy - 2, M + W, cy - 2);
    }

    text(label, M + 2, cy, 9, isTotal ? 'bold' : 'normal');
    text(value, M + W - 2, cy, 9, isTotal ? 'bold' : 'normal', 'right');

    cy += rowHeight;
  });

  y += boxHeight;

  // ── FOOTER ────────────────────
  box(M, y, W, 20);

  text('Receiver Signature', M + 5, y + 15);
  text('Booking Clerk', M + 80, y + 15);
  text('Authorised Signatory', M + 140, y + 15);

  // ── SAVE ──────────────────────
  doc.save(`Bilty_${data.gcNo || 'file'}.pdf`);


}

/* ── Form Submit ─────────────────────────────────── */
document.getElementById('invoiceForm').addEventListener('submit', function (e) {
  e.preventDefault();
  generatePDF();
});

/* ── Init total on load ──────────────────────────── */
window.addEventListener('load', () => {
  calcTotal();
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dated').value = today;
});