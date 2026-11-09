/* global PDFLib */
const IPSPdf = (() => {
 const pageWidth = 612;
 const pageHeight = 792;
 const margin = 44;
 const contentWidth = pageWidth - 2 * margin;
 const bottom = 52;
 const lineHeight = 13.5;

 // The standard PDF fonts use WinAnsi. Keep common accented characters and
 // typography, and make unsupported characters visible in the exported draft.
 function displayText(value, font) {
  return Array.from(String(value ?? '').normalize('NFC').replace(/\r\n?/g, '\n'), char => {
   if (char === '\n') return char;
   if (char === '\t') return '    ';
   try {
    font.encodeText(char);
    return char;
   } catch {
    return '?';
   }
  }).join('');
 }

 function wrap(value, font, size, width) {
  const fits = text => font.widthOfTextAtSize(text, size) <= width;
  const lines = [];
  for (const paragraph of displayText(value, font).split('\n')) {
   let line = '';
   for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
    const next = line ? line + ' ' + word : word;
    if (fits(next)) {
     line = next;
     continue;
    }
    if (line) lines.push(line);
    line = '';
    if (fits(word)) {
     line = word;
     continue;
    }
    for (const char of word) {
     if (line && !fits(line + char)) {
      lines.push(line);
      line = '';
     }
     line += char;
    }
   }
   lines.push(line);
  }
  return lines;
 }

 async function build(model) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdf = await PDFDocument.create();
  pdf.setTitle('Investment Policy Statement');
  pdf.setCreator('Investment Policy Studio');
  pdf.setProducer('Investment Policy Studio');
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const ink = rgb(.10, .17, .16);
  const muted = rgb(.26, .34, .32);
  const green = rgb(.12, .29, .25);
  const pale = rgb(.93, .96, .94);
  const border = rgb(.79, .85, .81);
  let page;
  let y;

  function newPage() {
   page = pdf.addPage([pageWidth, pageHeight]);
   y = pageHeight - margin;
  }

  function ensure(height) {
   if (y - height < bottom) newPage();
  }

  function draw(line, x, top, font, size, color = ink) {
   if (line) page.drawText(line, { x, y: top - size, font, size, color });
  }

  function textLines(lines, { x = margin, font = regular, size = 10.5, leading = lineHeight, color = ink } = {}) {
   for (const line of lines) {
    ensure(leading);
    draw(line, x, y, font, size, color);
    y -= leading;
   }
  }

  function paragraph(value, options = {}) {
   const { font = regular, size = 10.5, width = contentWidth } = options;
   textLines(wrap(value, font, size, width), options);
  }

  function heading(title, keepWith = 35) {
   const lines = wrap(title, serif, 18, contentWidth);
   ensure(10 + lines.length * 23 + keepWith);
   y -= 10;
   textLines(lines, { font: serif, size: 18, leading: 23, color: green });
   y -= 5;
  }

  function field({ label, value }) {
   const labels = wrap(label, bold, 10.5, contentWidth);
   const values = wrap(value, regular, 10.5, contentWidth);
   ensure((labels.length + 1) * lineHeight + 2);
   textLines(labels, { font: bold, color: green });
   y -= 2;
   textLines(values);
   y -= 6;
  }

  function liquidityFields(fields, title) {
   const gutter = 18;
   const columnWidth = (contentWidth - gutter) / 2;
   const rows = [];
   for (let index = 0; index < fields.length; index += 2) {
    const items = fields.slice(index, index + 2).map(({ label, value }) => ({
     labels: wrap(label, bold, 10.5, columnWidth),
     values: wrap(value, regular, 10.5, columnWidth)
    }));
    const height = Math.max(...items.map(({ labels, values }) => (labels.length + values.length) * lineHeight + 8));
    rows.push({ items, height });
   }
   heading(title, rows.reduce((sum, row) => sum + row.height, 0));
   for (const { items, height } of rows) {
    ensure(height);
    const top = y;
    items.forEach(({ labels, values }, index) => {
     const x = margin + index * (columnWidth + gutter);
     y = top;
     textLines(labels, { x, font: bold, color: green });
     y -= 2;
     textLines(values, { x });
    });
    y = top - height;
   }
  }

  function summary() {
   const inset = 13;
   const width = contentWidth - 2 * inset;
   const rows = model.summary.map(({ label, value }) => ({
    labels: wrap(label, bold, 10.5, width),
    values: wrap(value, regular, 10.5, width)
   }));
   const intro = 'Current portfolio and liquidity snapshot for committee review.';
   const boxHeight = 51 + rows.reduce((height, row) => height + (row.labels.length + row.values.length) * 14 + 5, 0);
   ensure(boxHeight);
   page.drawRectangle({ x: margin, y: y - boxHeight, width: contentWidth, height: boxHeight, color: pale, borderColor: border, borderWidth: .75 });
   const x = margin + inset;
   y -= 11;
   paragraph('Committee review summary', { x, font: bold, size: 13, leading: 18, width, color: green });
   paragraph(intro, { x, size: 9.5, leading: 16, width, color: muted });
   for (const row of rows) {
    textLines(row.labels, { x, font: bold, leading: 14 });
    textLines(row.values, { x, leading: 14 });
    y -= 5;
   }
   y -= 15;
  }

  function allocationTable({ headers, rows }) {
   // The table follows the Studio's six-column allocation editor.
   const widths = [158, 60, 66, 60, 72, 108];
   const cellPadding = 7;
   function measure(cells, font) {
    return cells.map((cell, index) => wrap(cell, font, 9.5, widths[index] - 2 * cellPadding));
   }
   const header = measure(headers, bold);
   const height = cells => Math.max(...cells.map(lines => lines.length)) * 13 + 10;
   function row(cells, isHeader) {
    const rowHeight = height(cells);
    if (isHeader) page.drawRectangle({ x: margin, y: y - rowHeight, width: contentWidth, height: rowHeight, color: pale });
    let x = margin;
    cells.forEach((lines, index) => {
     lines.forEach((line, lineIndex) => draw(line, x + cellPadding, y - 5 - lineIndex * 13, isHeader ? bold : regular, 9.5));
     x += widths[index];
    });
    y -= rowHeight;
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: .5, color: border });
   }
   ensure(height(header) + (rows.length ? height(measure(rows[0], regular)) : 0));
   row(header, true);
   for (const cells of rows) {
    const measured = measure(cells, regular);
    if (y - height(measured) < bottom) {
     newPage();
     row(header, true);
    }
    row(measured, false);
   }
   y -= 10;
  }

  newPage();
  paragraph('Investment Policy Statement', { font: serif, size: 28, leading: 36, color: green });
  paragraph(model.family + ' · Draft for committee review', { color: muted });
  y -= 12;
  summary();
  for (const section of model.sections) {
   if (section.columns === 2) {
    liquidityFields(section.fields, section.title);
    continue;
   }
   heading(section.title);
   for (const item of section.fields) field(item);
  }
  heading('Strategic allocation and rebalancing', 70);
  allocationTable(model.allocation);
  paragraph(model.allocationNote);
  heading('Allocation breaches');
  for (const item of model.breaches.length ? model.breaches : ['No allocation breaches detected.']) paragraph(item);
  heading('Committee review');
  for (const item of model.review.length ? model.review : ['No additional exceptions flagged by the draft checks.']) paragraph(item);
  y -= 12;
  paragraph('Approved by: ____________________     Date: ____________________');

  const pages = pdf.getPages();
  pages.forEach((documentPage, index) => {
   const number = `Page ${index + 1} of ${pages.length}`;
   const size = 9;
   documentPage.drawText(number, {
    x: pageWidth - margin - regular.widthOfTextAtSize(number, size),
    y: 29, font: regular, size, color: muted
   });
  });
  return pdf.save();
 }

 async function download(model) {
  const bytes = await build(model);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');
  const family = model.family.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80);
  link.href = url;
  link.download = (family ? family + '-' : '') + 'Investment-Policy-Statement-Draft.pdf';
  document.body.append(link);
  try {
   link.click();
  } finally {
   link.remove();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
 }

 return { build, download };
})();
