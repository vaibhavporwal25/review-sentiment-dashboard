const fs = require("fs");
const path = require("path");
const docx = require("docx");

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} = docx;

// Styling constants according to GCET guidelines
const FONT_NAME = "Times New Roman";
const CODE_FONT = "Consolas";

const thinBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
};

const noBorder = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

function p(text, options = {}) {
  const {
    bold = false,
    italics = false,
    size = 24, // 12pt (in half-points: 12 * 2 = 24)
    align = AlignmentType.JUSTIFIED,
    spaceBefore = 0,
    spaceAfter = 120, // 6pt (6 * 20 = 120 twips)
    lineSpacing = 360, // 1.5 line spacing (240 * 1.5 = 360)
    font = FONT_NAME
  } = options;

  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: lineSpacing },
    children: [
      new TextRun({
        text,
        bold,
        italics,
        size,
        font,
        color: "000000"
      })
    ]
  });
}

function pMulti(runs, options = {}) {
  const {
    align = AlignmentType.JUSTIFIED,
    spaceBefore = 0,
    spaceAfter = 120,
    lineSpacing = 360
  } = options;

  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: lineSpacing },
    children: runs.map(r => new TextRun({
      text: r.text,
      bold: r.bold || false,
      italics: r.italics || false,
      size: r.size || 24,
      font: r.font || FONT_NAME,
      color: "000000"
    }))
  });
}

function h1(title) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 180 },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 32, // 16pt
        font: FONT_NAME,
        color: "000000"
      })
    ]
  });
}

function h2(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 28, // 14pt
        font: FONT_NAME,
        color: "000000"
      })
    ]
  });
}

function h3(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24, // 12pt
        font: FONT_NAME,
        color: "000000"
      })
    ]
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 20, // 10pt
        font: FONT_NAME,
        color: "000000"
      })
    ]
  });
}

function figureCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 20, // 10pt
        font: FONT_NAME,
        color: "000000"
      })
    ]
  });
}

function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 40, line: 240 },
    children: [
      new TextRun({
        text: line,
        font: CODE_FONT,
        size: 20, // 10pt
        color: "1e293b"
      })
    ]
  }));
}

function createStyledTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => new TableCell({
        borders: thinBorder,
        width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: h, bold: true, size: 21, font: FONT_NAME })
            ]
          })
        ]
      }))
    })
  );

  // Data rows
  rows.forEach(r => {
    tableRows.push(
      new TableRow({
        children: r.map((c, i) => new TableCell({
          borders: thinBorder,
          width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
          children: [
            new Paragraph({
              alignment: (i === 0 || isNaN(c)) ? AlignmentType.LEFT : AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
              children: [
                new TextRun({ text: String(c), size: 21, font: FONT_NAME })
              ]
            })
          ]
        }))
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: tableRows
  });
}

console.log("Helper functions defined successfully.");
