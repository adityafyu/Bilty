const LOGO_PATH = 'logo.png'; // <

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


function generatePDF(logoDataUrl) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const GREEN_BG = [11,93,42];     
  const WHITE = [255, 255, 255];
  const BLACK = [0, 0, 0];  

 
  doc.setFillColor(11, 93, 42); 
  doc.rect(0, 0, 210, 297, 'F'); 

  doc.setFillColor(255,255,255);
  doc.rect(5, 5, 200, 287, 'F');
  

  const M = 10;
  const W = 190;
  let y = M;

  doc.setFillColor(240,248,242);
  doc.rect(M, M, W, 277, 'F');


  const box = (x, y, w, h) => {
    doc.setDrawColor(0, 0, 0);
    doc.rect(x, y, w, h);
  };
  const text = (t, x, y, size = 9, style = 'bold', align = 'left') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.text(String(t || ''), x, y, { align });
  };
  const heading = (t, x, y, align = 'left') => {
    doc.setTextColor(0, 128, 0); 
    text(t, x, y, 9, 'bold', align);
    doc.setTextColor(0, 0, 0);
  };

  const val = id => document.getElementById(id)?.value || '';
  const num = id => parseFloat(document.getElementById(id)?.value || 0) || 0;
  const radioVal = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

  const money = n => n ? 'Rs. ' + n.toLocaleString('en-IN') : '';

  
  const data = {

    date: val('dated'),
    vehicle: val('vehicleNo'),
    lrNo: val('lrNo'),
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
  doc.setFillColor(200, 230, 210);
  doc.rect(M, y, W, 10, 'F');
  
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.3);
  doc.line(M, y + 10, M + W, y + 10);

  
  doc.setFillColor(6,64,28); 
  doc.rect(M, y, W, 25, 'F');

  let textStartX = M + 2;

 
  if (logoDataUrl) {
    let format = 'JPEG';
    if (logoDataUrl.startsWith('data:image/png')) format = 'PNG';

    try {
      
      doc.addImage(logoDataUrl, format, M + 2, y + 3, 18, 18);

     
      textStartX = M + 22;
      
      doc.setTextColor(100, 149, 237); 
      text('YASHVARDHAN LOGISTICS', textStartX, y + 8, 16, 'bold');
      doc.setTextColor(0, 0, 0);

    } catch (e) {
      console.error("Failed to add logo", e);

      doc.setTextColor(100, 149, 237); 
      text('YASHVARDHAN LOGISTICS', M + W / 2, y + 8, 16, 'bold', 'center');
      doc.setTextColor(0, 0, 0);
    }

  } else {
    
    text('YASHVARDHAN LOGISTICS', textStartX, y + 8, 16, 'bold');
  }
  doc.setTextColor(255,255,255);

  text('Email: yashvardhanlogistics@gmail.com', textStartX, y + 14);
  text('H.O: 39, ATS Navlakha near maruti tiles, Lohamandi, Indore(M.P), 452001', textStartX, y + 19);
  text('Phone: 9826497400 | 9826978930 | 7067251280 | 7748017884 | Landline: 07314880555', textStartX, y + 24);

  text(
    'GSTIN: 23ALVPT7013J1ZM | PAN: ALVPT7013J',
    M + W - 2,
    y + 8,
    9,
    'bold',
    'right'
  );
  doc.setTextColor(0,0,0);
  
  doc.line(M, y + 26, M + W, y + 26);

  y += 28;

  doc.setFillColor(...GREEN_BG); 
  doc.rect(M, y, W, 10, 'F');
  
  doc.setTextColor(...WHITE);
  text(`Date: ${data.date}`, M + 2, y + 6);
  text(`Vehicle No: ${data.vehicle}`, M + 75, y + 6);
  text(`LR No: ${data.lrNo}`, M + 150, y + 6);

  y += 10;
  doc.setTextColor(...BLACK);
  

  box(M, y, W / 2, 15);
  heading('FROM:', M + 2, y + 5);
  doc.setTextColor(220,20,60);
  text(data.from, M + 2, y + 10);

  box(M + W / 2, y, W / 2, 15);
  heading('TO:', M + W / 2 + 2, y + 5);
  doc.setTextColor(220,20,60);
  text(data.to, M + W / 2 + 2, y + 10);

  y += 15;

  
  box(M, y, W / 2, 20);
  heading('CONSIGNOR:', M + 2, y + 5);
  doc.setTextColor(220,20,60);
  text(data.consignor, M + 2, y + 10);

  heading('GSTIN:', M + 2, y + 16);
  doc.setTextColor(220,20,60);
  text(data.gstin, M + 13, y + 16);

  box(M + W / 2, y, W / 2, 20);
  heading('CONSIGNEE:', M + W / 2 + 2, y + 5);
  doc.setTextColor(220,20,60);
  text(data.consignee, M + W / 2 + 2, y + 10);

  heading('GSTIN:', M + W / 2 + 2, y + 16);
  doc.setTextColor(220,20,60);
  text(data.consigneegst, M + W / 2 + 13, y + 16);

  doc.setTextColor(...BLACK);

  y += 20;

 

  doc.setFillColor(...GREEN_BG);
  doc.rect(M, y, W, 10, 'F');
  doc.setTextColor(...WHITE);
  text('Description', M + 2, y + 6);
  text('Weight(M.T)', M + 110, y + 6);
  text('Invoice No', M + 160, y + 6);
  doc.setTextColor(...BLACK);

  y += 10;

  box(M, y, W, 20);
  text(data.description, M + 2, y + 8);
  text(data.weight, M + 110, y + 8);
  text(data.invoiceNo, M + 160, y + 8);
  

  y += 20;

  
  doc.setFillColor(...GREEN_BG);
  doc.rect(M, y, W, 10, 'F');
  doc.setTextColor(...WHITE); 
  text('Value of Goods:', M + 2, y + 6);
  text(data.valueGoods, M + 40, y + 6);

  text('Payment Mode:', M + 110, y + 6);
  text(data.payMode, M + 150, y + 6);
  doc.setTextColor(0,0,0);  

  y += 10;
  


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

  let boxHeight = charges.length * rowHeight + 0.5;


  
  box(M, y, W, boxHeight);

  
  let cy = y + 6;

 charges.forEach(([label, value, isTotal], i) => {

    let rowY = y + (i * rowHeight) + 5;

    if (isTotal) {
      doc.setDrawColor(0, 128, 0);
      doc.setLineWidth(0.5);
      doc.line(M, rowY - 3, M + W, rowY - 3);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
    }

    if (isTotal) {

      doc.setFillColor(...GREEN_BG);
      doc.rect(M, rowY - 5, W, rowHeight, 'F');

      doc.setTextColor(255,255,255);
      doc.setFontSize(11);

      text(label, M + 2, rowY);
      text(value, M + W - 2, rowY, 11, 'bold', 'right');

      doc.setTextColor(0,0,0);
      doc.setFontSize(9);

    } else {
      text(label, M + 2, rowY);
      text(value, M + W - 2, rowY, 9, 'bold', 'right');
    }
  });
  

  y += boxHeight;

 
  box(M, y, W, 20);

  text('Receiver Signature', M + 5, y + 15);
  text('Booking Clerk', M + 80, y + 15);
  text('Authorised Signatory', M + 140, y + 15);


  doc.save(`Bilty_${data.gcNo || 'file'}.pdf`);


}


document.getElementById('invoiceForm').addEventListener('submit', function (e) {
  e.preventDefault();

  
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

window.addEventListener('load', () => {
  calcTotal();
 
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dated').value = today;
});
