/* â”€â”€ Utility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */



// ── LOGO PATH ──────────────────────────────────────────────
// Paste your logo filename here (must be in the same folder as this HTML file)
const LOGO_PATH = 'logo.png'; // <- change this to your actual image filename
// ────────────────────────────────────────────────────────────


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

/* â”€â”€ PDF Generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function generatePDF(logoDataUrl) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const M = 10;
  const W = 190;
  let y = M;

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ HEADER BOX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ── HEADER BOX ─────────────────
box(M, y, W, 25);

let textStartX = M + 2; // default (no logo)

// ✅ LOGO + COMPANY NAME
if (logoDataUrl) {
  let format = 'JPEG';
  if (logoDataUrl.startsWith('data:image/png')) format = 'PNG';

  try {
    // Logo
    doc.addImage(logoDataUrl, format, M + 2, y + 3, 18, 18);

    // Shift text because logo exists
    textStartX = M + 22;

    // Company Name
    doc.setTextColor(100, 149, 237); // light blue (Cornflower Blue)
    text('YASHVARDHAN LOGISTICS', textStartX, y + 8, 16, 'bold');
    doc.setTextColor(0, 0, 0);

  } catch (e) {
    console.error("Failed to add logo", e);

    // fallback center
    doc.setTextColor(100, 149, 237); // light blue (Cornflower Blue)
    text('YASHVARDHAN LOGISTICS', M + W / 2, y + 8, 16, 'bold', 'center');
    doc.setTextColor(0, 0, 0);
  }

} else {
  // No logo → align nicely left (NOT center for better layout)
  text('YASHVARDHAN LOGISTICS', textStartX, y + 8, 16, 'bold');
}

// ✅ LEFT SIDE DETAILS (proper flow)
text('Email: yashvardhanlogistics@gmail.com', textStartX, y + 14);
text('H.O: 39, ATS Navlakha near maruti tiles, Lohamandi, Indore', textStartX, y + 19);
text('Phone: 9876497400 | 9826978930 | Landline: 07314880555', textStartX, y + 24);

// ✅ RIGHT SIDE GST (clean alignment)
text(
  'GSTIN: 23ALVPT7013J1ZM | PAN: ALVPT7013J',
  M + W - 2,
  y + 14,
  9,
  'normal',
  'right'
);

// ❌ REMOVED: Subject to Jurisdiction

// Optional divider (makes it look premium)
doc.line(M, y + 26, M + W, y + 26);

y += 28;

  // â”€â”€ TOP ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  box(M, y, W, 10);
  text(`Date: ${data.date}`, M + 35, y + 6);
  text(`Vehicle No: ${data.vehicle}`, M + 130, y + 6);

  y += 10;

  // â”€â”€ FROM / TO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  box(M, y, W / 2, 15);
  text('FROM:', M + 2, y + 5, 9, 'bold');
  text(data.from, M + 2, y + 10);

  box(M + W / 2, y, W / 2, 15);
  text('TO:', M + W / 2 + 2, y + 5, 9, 'bold');
  text(data.to, M + W / 2 + 2, y + 10);

  y += 15;

  // â”€â”€ CONSIGNOR / CONSIGNEE â”€â”€â”€â”€â”€
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

  // â”€â”€ GOODS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ EXTRA DETAILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  box(M, y, W, 10);
  text(`Value of Goods: ${data.valueGoods}`, M + 2, y + 6);
  text(`Payment Mode: ${data.payMode}`, M + 110, y + 6);

  y += 10;

  // â”€â”€ CHARGES TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // â”€â”€ CHARGES TABLE (DYNAMIC HEIGHT) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // ðŸ‘‰ calculate total height
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

  // â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  box(M, y, W, 20);

  text('Receiver Signature', M + 5, y + 15);
  text('Booking Clerk', M + 80, y + 15);
  text('Authorised Signatory', M + 140, y + 15);

  // â”€â”€ SAVE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  doc.save(`Bilty_${data.gcNo || 'file'}.pdf`);


}

/* â”€â”€ Form Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.getElementById('invoiceForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Load logo from the fixed path, convert to base64, then generate PDF
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    generatePDF(dataUrl);
  };
  img.onerror = function () {
    console.warn('Logo not found at: ' + LOGO_PATH + '. Generating PDF without logo.');
    generatePDF(null);
  };
  img.src = LOGO_PATH;
});

/* â”€â”€ Init total on load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
window.addEventListener('load', () => {
  calcTotal();
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dated').value = today;
});
