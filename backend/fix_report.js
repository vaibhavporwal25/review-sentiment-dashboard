const fs = require('fs');
const f = 'c:\\Users\\Asus\\Downloads\\review-sentiment-dashboard\\review-sentiment-dashboard\\backend\\build_full_report.js';
let c = fs.readFileSync(f, 'utf8');

// ============================================================
// FIX 1: CERTIFICATE - replace old cert text with 4-col table
// ============================================================
const OLD_CERT = `  p(\\"This is to certify that the mini project report titled \u201cE-Commerce Product Review Sentiment Dashboard\u201d is a bona fide record of the work carried out by Vaibhav (Roll No: 2500970140206), Vaishnavi (Roll No: 2500970140208), and Vivek Kumar (Roll No: 2500970140211) under my supervision, in partial fulfilment of the requirements of Mini Project (BMC353) for the 3rd Semester of Master of Computer Applications (MCA) at Galgotias College of Engineering & Technology, Greater Noida, during the academic session 2026\u201327.\\"),
  p(\\"To the best of my knowledge, the work reported here is the students' own and has not been submitted elsewhere for the award of any degree or diploma. The project has been successfully completed and is submitted for evaluation.\\"),
  p(\\"\\", { spaceAfter: 360 }),`;

const NEW_CERT = `  p(\\"This is to certify that the mini project report titled \\u201cE-Commerce Product Review Sentiment Dashboard\\u201d is a bona fide record of the work carried out by the following students of 3rd Semester, Master of Computer Applications (MCA) at Galgotias College of Engineering & Technology, Greater Noida, under my supervision in partial fulfilment of the requirements of Mini Project (BMC353), during the academic session 2026\\u201327:\\"),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [\\"S.No.\\", \\"Name of Student\\", \\"University Roll No.\\", \\"Section\\"].map((h, i) =>
          new TableCell({
            borders: thinBorder,
            width: { size: [900, 3600, 3600, 1500][i], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: h, bold: true, size: 22, font: FONT_NAME })] })]
          })
        )
      }),
      ...[
        [\\"1.\\", \\"Vaibhav\\", \\"2500970140206\\", \\"C\\"],
        [\\"2.\\", \\"Vaishnavi\\", \\"2500970140208\\", \\"C\\"],
        [\\"3.\\", \\"Vivek Kumar\\", \\"2500970140211\\", \\"C\\"]
      ].map(r => new TableRow({
        children: r.map((cel, i) => new TableCell({
          borders: thinBorder,
          width: { size: [900, 3600, 3600, 1500][i], type: WidthType.DXA },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: cel, size: 22, font: FONT_NAME })] })]
        }))
      }))
    ]
  }),
  p(\\"\\", { spaceAfter: 100 }),
  p(\\"To the best of my knowledge, the work reported in this report is their own work and has not been submitted to any other university or institution for the award of any degree or diploma. The project has been successfully completed and is submitted for evaluation.\\"),
  p(\\"\\", { spaceAfter: 300 }),`;

// Use indexOf to find and replace
const certSearch = 'work carried out by Vaibhav (Roll No: 2500970140206)';
const certIdx = c.indexOf(certSearch);
if (certIdx < 0) { console.error('CERT: search anchor not found!'); process.exit(1); }

// Find the full old span: start of the p(" before this text
const certPStart = c.lastIndexOf('  p("', certIdx);
// Find the end: after the first p("", { spaceAfter: 360 }), line
const certPEnd = c.indexOf('  createStyledTable(\n    ["Supervisor"', certIdx);
if (certPStart < 0 || certPEnd < 0) { console.error('CERT: boundary not found', certPStart, certPEnd); process.exit(1); }

const certOldChunk = c.substring(certPStart, certPEnd);
console.log('CERT old chunk:\n' + certOldChunk);

const certNewChunk = `  p("This is to certify that the mini project report titled \u201cE-Commerce Product Review Sentiment Dashboard\u201d is a bona fide record of the work carried out by the following students of 3rd Semester, Master of Computer Applications (MCA) at Galgotias College of Engineering & Technology, Greater Noida, under my supervision in partial fulfilment of the requirements of Mini Project (BMC353), during the academic session 2026\u201327:"),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["S.No.", "Name of Student", "University Roll No.", "Section"].map((h, i) =>
          new TableCell({
            borders: thinBorder,
            width: { size: [900, 3600, 3600, 1500][i], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: h, bold: true, size: 22, font: FONT_NAME })] })]
          })
        )
      }),
      ...[
        ["1.", "Vaibhav", "2500970140206", "C"],
        ["2.", "Vaishnavi", "2500970140208", "C"],
        ["3.", "Vivek Kumar", "2500970140211", "C"]
      ].map(r => new TableRow({
        children: r.map((cel, i) => new TableCell({
          borders: thinBorder,
          width: { size: [900, 3600, 3600, 1500][i], type: WidthType.DXA },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: cel, size: 22, font: FONT_NAME })] })]
        }))
      }))
    ]
  }),
  p("", { spaceAfter: 100 }),
  p("To the best of my knowledge, the work reported in this report is their own work and has not been submitted to any other university or institution for the award of any degree or diploma. The project has been successfully completed and is submitted for evaluation."),
  p("", { spaceAfter: 300 }),
  `;

c = c.substring(0, certPStart) + certNewChunk + c.substring(certPEnd);
console.log('CERT: replaced OK, new length:', c.length);

// ============================================================
// FIX 2: DECLARATION - 
//   a) table must be 4 cols with S.No. column
//   b) Date/Place must come AFTER the table, not before
// ============================================================
const declSearch = '// DECLARATION';
const declIdx = c.indexOf(declSearch);
if (declIdx < 0) { console.error('DECL: anchor not found!'); process.exit(1); }

// Find the entire declaration block end (before ACKNOWLEDGEMENT)
const declEnd = c.indexOf('// ACKNOWLEDGEMENT', declIdx);
if (declEnd < 0) { console.error('DECL: end not found!'); process.exit(1); }

const declOldChunk = c.substring(declIdx, declEnd);
console.log('DECL old chunk length:', declOldChunk.length);

const declNewChunk = `// DECLARATION
prelimElements.push(
  h1("DECLARATION"),
  p("We hereby declare that the mini project report titled \u201cE-Commerce Product Review Sentiment Dashboard\u201d, submitted to the Department of Computer Applications, Galgotias College of Engineering & Technology, Greater Noida, is a record of original work carried out by us under the supervision of Mr. Avijit Sasmal, Assistant Professor, Department of Computer Applications."),
  p("We further declare that this work has not been submitted, in part or in full, to any other university or institute for the award of any degree or diploma. All sources of information, text, figures, and code taken from the work of others have been duly acknowledged and cited in the References."),
  p("We also declare that generative AI tools have not been used to generate content submitted here as our original work. Use of technical tools was limited to reading official software documentation, syntax verification, and debugging during implementation. We understand that this report will undergo Turnitin verification for similarity and AI-writing."),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["S.No.", "Name of Student", "University Roll No.", "Signature"].map((h, i) =>
          new TableCell({
            borders: thinBorder,
            width: { size: [900, 3300, 3300, 2100][i], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: h, bold: true, size: 22, font: FONT_NAME })] })]
          })
        )
      }),
      ...[
        ["1.", "Vaibhav", "2500970140206", ""],
        ["2.", "Vaishnavi", "2500970140208", ""],
        ["3.", "Vivek Kumar", "2500970140211", ""]
      ].map(r => new TableRow({
        children: r.map((cel, i) => new TableCell({
          borders: thinBorder,
          width: { size: [900, 3300, 3300, 2100][i], type: WidthType.DXA },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: cel, size: 22, font: FONT_NAME })] })]
        }))
      }))
    ]
  }),
  p("", { spaceAfter: 160 }),
  p("Date: 23 November 2026", { spaceBefore: 100, spaceAfter: 60 }),
  p("Place: Greater Noida", { spaceAfter: 120 }),
  new Paragraph({ children: [new PageBreak()] })
);

`;

c = c.substring(0, declIdx) + declNewChunk + c.substring(declEnd);
console.log('DECL: replaced OK, new length:', c.length);

// ============================================================
// FIX 3: ACKNOWLEDGEMENT - 
//   a) names left-aligned, first names only (no roll numbers)
//   b) add Date: at bottom
// ============================================================
const ackSearch = '// ACKNOWLEDGEMENT';
const ackIdx = c.indexOf(ackSearch);
if (ackIdx < 0) { console.error('ACK: anchor not found!'); process.exit(1); }

const ackEnd = c.indexOf('// ABSTRACT', ackIdx);
if (ackEnd < 0) { console.error('ACK: end not found!'); process.exit(1); }

const ackOldChunk = c.substring(ackIdx, ackEnd);
console.log('ACK old chunk length:', ackOldChunk.length);

const ackNewChunk = `// ACKNOWLEDGEMENT
prelimElements.push(
  h1("ACKNOWLEDGEMENT"),
  p("We express our sincere gratitude to Galgotias College of Engineering & Technology, Greater Noida, for providing us with the necessary academic environment and facilities to carry out this mini project titled \u201cE-Commerce Product Review Sentiment Dashboard\u201d as an integral part of the Master of Computer Applications (MCA) 3rd Semester curriculum."),
  p("We extend our heartfelt thanks to our project supervisor, Mr. Avijit Sasmal, Assistant Professor, Department of Computer Applications, for his continuous guidance, critical observations, and technical encouragement throughout the project lifecycle. His practical advice helped us structure our data cleaning procedures, validate our machine learning metrics, and refine the decoupled full-stack architecture."),
  p("We also take this opportunity to thank Prof. (Dr.) Vinit Kumar, Head of the Department of Computer Applications, for his institutional encouragement and for providing the lab resources required to design and test our software implementation."),
  p("We also express our appreciation to our faculty members, laboratory staff, and peers who shared suggestions during the initial design reviews. Finally, we thank our family members and friends for their patience, understanding, and moral support throughout the course of our studies."),
  p("Vaibhav", { bold: true, align: AlignmentType.LEFT, spaceBefore: 240, spaceAfter: 40 }),
  p("Vaishnavi", { bold: true, align: AlignmentType.LEFT, spaceAfter: 40 }),
  p("Vivek Kumar", { bold: true, align: AlignmentType.LEFT, spaceAfter: 120 }),
  p("Date: ____________", { align: AlignmentType.LEFT, spaceAfter: 60 }),
  new Paragraph({ children: [new PageBreak()] })
);

`;

c = c.substring(0, ackIdx) + ackNewChunk + c.substring(ackEnd);
console.log('ACK: replaced OK, new length:', c.length);

fs.writeFileSync(f, c, 'utf8');
console.log('All fixes applied and written successfully!');
