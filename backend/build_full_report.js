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
  BorderStyle,
  WidthType,
  PageBreak,
  Footer,
  PageNumber,
  NumberFormat,
  ImageRun
} = docx;

const FONT_NAME = "Times New Roman";
const CODE_FONT = "Consolas";

const thinBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
};

function p(text, options = {}) {
  const {
    bold = false,
    italics = false,
    size = 24, // 12pt
    align = AlignmentType.JUSTIFIED,
    spaceBefore = 0,
    spaceAfter = 120, // 6pt
    lineSpacing = 360, // 1.5 line
    font = FONT_NAME
  } = options;

  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: lineSpacing },
    children: [
      new TextRun({ text, bold, italics, size, font, color: "000000" })
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
      new TextRun({ text: title.toUpperCase(), bold: true, size: 32, font: FONT_NAME, color: "000000" })
    ]
  });
}

function h2(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({ text: title, bold: true, size: 28, font: FONT_NAME, color: "000000" })
    ]
  });
}

function h3(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({ text: title, bold: true, size: 24, font: FONT_NAME, color: "000000" })
    ]
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({ text, bold: true, size: 20, font: FONT_NAME, color: "000000" })
    ]
  });
}

function figureCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 160 },
    children: [
      new TextRun({ text, bold: true, size: 20, font: FONT_NAME, color: "000000" })
    ]
  });
}

function createStyledTable(headers, rows, colWidths = []) {
  const tableRows = [];

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

function codeLine(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 20, line: 240 },
    children: [
      new TextRun({ text, font: CODE_FONT, size: 19, color: "1e293b" })
    ]
  });
}

function codeBlock(lines) {
  return lines.map(l => codeLine(l));
}

// ==========================================
// SECTION 0: COVER / TITLE PAGE (Unnumbered)
// ==========================================
const coverElements = [];
const logoPath = path.join(__dirname, "assets", "gcet_logo.jpg");
const logoData = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;

coverElements.push(
  p("Galgotias College of Engineering & Technology", { bold: true, size: 30, align: AlignmentType.CENTER, spaceAfter: 40 }),
  p("Greater Noida", { size: 24, align: AlignmentType.CENTER, spaceAfter: 80 }),
  p("Department of Computer Applications", { bold: true, size: 26, align: AlignmentType.CENTER, spaceAfter: 120 })
);

if (logoData) {
  coverElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 160 },
      children: [
        new ImageRun({
          data: logoData,
          transformation: { width: 110, height: 110 }
        })
      ]
    })
  );
}

coverElements.push(
  p("Mini Project (BMC353)", { bold: true, size: 26, align: AlignmentType.CENTER, spaceAfter: 60 }),
  p("Report", { bold: true, size: 24, align: AlignmentType.CENTER, spaceAfter: 60 }),
  p("on", { bold: true, size: 24, align: AlignmentType.CENTER, spaceAfter: 120 }),
  p("E-COMMERCE PRODUCT REVIEW SENTIMENT DASHBOARD", { bold: true, size: 36, align: AlignmentType.CENTER, spaceAfter: 160 }),
  p("Submitted in partial fulfilment of the requirements for the degree of", { size: 22, align: AlignmentType.CENTER, spaceAfter: 40 }),
  p("Master of Computer Applications – 3rd Semester", { bold: true, size: 24, align: AlignmentType.CENTER, spaceAfter: 80 }),
  p("Session: 2026–27", { bold: true, size: 22, align: AlignmentType.CENTER, spaceAfter: 200 }),
  p("Submitted by:", { bold: true, size: 24, align: AlignmentType.LEFT, spaceAfter: 60 }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["Name", "University Roll No.", "Section"].map((h, i) =>
          new TableCell({
            borders: thinBorder,
            width: { size: [3600, 4200, 1800][i], type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: h, bold: true, size: 22, font: FONT_NAME })] })]
          })
        )
      }),
      ...[ 
        ["Vaibhav", "2500970140206", "C"],
        ["Vaishnavi", "2500970140208", "C"],
        ["Vivek Kumar", "2500970140211", "C"]
      ].map(r => new TableRow({
        children: r.map((c, i) => new TableCell({
          borders: thinBorder,
          width: { size: [3600, 4200, 1800][i], type: WidthType.DXA },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: c, size: 22, font: FONT_NAME })] })]
        }))
      }))
    ]
  }),
  p("", { spaceAfter: 120 }),
  p("Under the supervision of:", { bold: true, size: 24, align: AlignmentType.LEFT, spaceAfter: 60 }),
  p("Mr. Avijit Sasmal", { bold: true, size: 24, align: AlignmentType.LEFT, spaceAfter: 40 }),
  p("Assistant Professor, Department of Computer Applications", { size: 22, align: AlignmentType.LEFT, spaceAfter: 40 }),
  p("Galgotias College of Engineering & Technology, Greater Noida", { size: 22, align: AlignmentType.LEFT, spaceAfter: 60 })
);

// ==========================================
// SECTION 1: PRELIMINARY PAGES (Roman: ii, iii, iv...)
// ==========================================
const prelimElements = [];

// CERTIFICATE
prelimElements.push(
  h1("CERTIFICATE"),
  p("Date: 23 November 2026", { align: AlignmentType.RIGHT, spaceAfter: 160 }),
  p("This is to certify that the mini project report titled “E-Commerce Product Review Sentiment Dashboard” is a bona fide record of the work carried out by the following students of 3rd Semester, Master of Computer Applications (MCA) at Galgotias College of Engineering & Technology, Greater Noida, under my supervision in partial fulfilment of the requirements of Mini Project (BMC353), during the academic session 2026–27:"),
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
    createStyledTable(
    ["Supervisor", "Head of Department"],
    [
      [
        "Mr. Avijit Sasmal\nAssistant Professor\nDepartment of Computer Applications",
        "Prof. (Dr.) Vinit Kumar\nHead, Department of Computer Applications\nGalgotias College of Engineering & Technology"
      ]
    ],
    [4800, 4800]
  ),
  p("", { spaceAfter: 300 }),
  createStyledTable(
    ["Internal Examiner", "External Examiner"],
    [
      [
        "Name: ______________________\nSignature: __________________",
        "Name: ______________________\nSignature: __________________"
      ]
    ],
    [4800, 4800]
  ),
  new Paragraph({ children: [new PageBreak()] })
);

// DECLARATION
prelimElements.push(
  h1("DECLARATION"),
  p("We hereby declare that the mini project report titled “E-Commerce Product Review Sentiment Dashboard”, submitted to the Department of Computer Applications, Galgotias College of Engineering & Technology, Greater Noida, is a record of original work carried out by us under the supervision of Mr. Avijit Sasmal, Assistant Professor, Department of Computer Applications."),
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

// ACKNOWLEDGEMENT
prelimElements.push(
  h1("ACKNOWLEDGEMENT"),
  p("We express our sincere gratitude to Galgotias College of Engineering & Technology, Greater Noida, for providing us with the necessary academic environment and facilities to carry out this mini project titled “E-Commerce Product Review Sentiment Dashboard” as an integral part of the Master of Computer Applications (MCA) 3rd Semester curriculum."),
  p("We extend our heartfelt thanks to our project supervisor, Mr. Avijit Sasmal, Assistant Professor, Department of Computer Applications, for his continuous guidance, critical observations, and technical encouragement throughout the project lifecycle. His practical advice helped us structure our data cleaning procedures, validate our machine learning metrics, and refine the decoupled full-stack architecture."),
  p("We also take this opportunity to thank Prof. (Dr.) Vinit Kumar, Head of the Department of Computer Applications, for his institutional encouragement and for providing the lab resources required to design and test our software implementation."),
  p("We also express our appreciation to our faculty members, laboratory staff, and peers who shared suggestions during the initial design reviews. Finally, we thank our family members and friends for their patience, understanding, and moral support throughout the course of our studies."),
  p("Vaibhav", { bold: true, align: AlignmentType.LEFT, spaceBefore: 240, spaceAfter: 40 }),
  p("Vaishnavi", { bold: true, align: AlignmentType.LEFT, spaceAfter: 40 }),
  p("Vivek Kumar", { bold: true, align: AlignmentType.LEFT, spaceAfter: 120 }),
  p("Date: ____________", { align: AlignmentType.LEFT, spaceAfter: 60 }),
  new Paragraph({ children: [new PageBreak()] })
);

// ABSTRACT
prelimElements.push(
  h1("ABSTRACT"),
  p("Online shopping platforms host hundreds of customer reviews per product, making manual assessment tedious and leaving consumers vulnerable to deceptive feedback such as copy-pasted comments, bot submissions, and promotional spam. This project implements the E-Commerce Product Review Sentiment Dashboard, an interactive end-to-end full-stack web application designed to normalize, screen, and classify consumer reviews into positive, neutral, and negative categories while isolating suspicious entries."),
  p("The data processing workflow employs HTML tag stripping, regex text cleaning, and heuristic rules to identify copy-pasted entries, extreme punctuation, all-caps text, and promotional links. Genuine customer reviews are vectorized using Term Frequency-Inverse Document Frequency (TF-IDF) n-grams and classified using a multi-class Logistic Regression classifier with balanced class weights. The serving layer comprises an Express.js REST API featuring dual persistence—connecting to MongoDB when available and automatically defaulting to a sanitized JSON store for offline evaluation. The frontend dashboard, developed in React and Recharts, delivers dynamic metric cards, an interactive pie chart, and a stacked bar chart with bidirectional cross-filtering. Selecting a product or sentiment segment dynamically updates chart visualizations, summary statistics, and the paginated review ledger. The classifier demonstrated 99.2% accuracy on the evaluation dataset, confirming the feasibility of lightweight natural language processing models for real-time customer sentiment intelligence without prohibitive GPU infrastructure."),
  pMulti([
    { text: "Keywords: ", bold: true },
    { text: "Sentiment Analysis, E-Commerce Reviews, TF-IDF Vectorization, Logistic Regression, Deceptive Review Detection, React Dashboard." }
  ], { spaceBefore: 180 }),
  new Paragraph({ children: [new PageBreak()] })
);

// TABLE OF CONTENTS
prelimElements.push(
  h1("TABLE OF CONTENTS"),
  createStyledTable(
    ["Chapter / Section", "Title", "Page"],
    [
      ["", "Certificate", "ii"],
      ["", "Declaration", "iii"],
      ["", "Acknowledgement", "iv"],
      ["", "Abstract", "v"],
      ["", "List of Figures", "vii"],
      ["", "List of Tables", "viii"],
      ["", "List of Abbreviations", "ix"],
      ["Chapter 1", "Introduction", "1"],
      ["1.1", "Background and Motivation", "1"],
      ["1.2", "Problem Statement", "2"],
      ["1.3", "Objectives", "2"],
      ["1.4", "Scope and Relevance of the Project", "3"],
      ["1.5", "Key Features of the Project", "4"],
      ["Chapter 2", "Background Study and Feasibility", "5"],
      ["2.1", "Theoretical Background", "5"],
      ["2.2", "Existing Systems / Related Work", "7"],
      ["2.3", "Technical Feasibility", "8"],
      ["2.4", "Economic Feasibility", "9"],
      ["2.5", "Operational Feasibility", "9"],
      ["Chapter 3", "Project Design", "10"],
      ["3.1", "System Architecture and Module Design", "10"],
      ["3.2", "Data Flow Design", "11"],
      ["3.3", "Database Design", "13"],
      ["3.4", "User Interface Design", "14"],
      ["3.5", "Algorithm Specification", "15"],
      ["Chapter 4", "Coding and Implementation", "17"],
      ["4.1", "Programming Languages and Tools Used", "17"],
      ["4.2", "Code Structure", "18"],
      ["4.3", "Implementation of Key Modules", "19"],
      ["Chapter 5", "Innovation and Creativity", "23"],
      ["5.1", "Originality of Idea and Architecture", "23"],
      ["5.2", "Value Additions Beyond Basic Requirements", "24"],
      ["Chapter 6", "Testing", "25"],
      ["6.1", "Testing Strategies", "25"],
      ["6.2", "Test Cases and Results", "26"],
      ["6.3", "Comparison with Existing Methods", "28"],
      ["Chapter 7", "Challenges and Problem-Solving", "29"],
      ["7.1", "Challenges Faced", "29"],
      ["7.2", "Solutions Implemented", "30"],
      ["Chapter 8", "Conclusion", "32"],
      ["8.1", "Outcome of the Project", "32"],
      ["8.2", "Limitations", "32"],
      ["8.3", "Future Scope of the Project", "33"],
      ["8.4", "Research Output and Publication Status", "34"],
      ["Chapter 9", "Team Roles and Coordination", "35"],
      ["9.1", "Individual Roles and Contributions", "35"],
      ["9.2", "Work Distribution and Timeline", "36"],
      ["9.3", "Communication and Coordination", "37"],
      ["", "References", "39"],
      ["", "Appendices", "41"]
    ],
    [2400, 6000, 1200]
  ),
  new Paragraph({ children: [new PageBreak()] })
);

// LIST OF FIGURES & TABLES
prelimElements.push(
  h1("LIST OF FIGURES"),
  createStyledTable(
    ["Figure No.", "Title", "Page"],
    [
      ["Figure 3.1", "Three-Tier Architecture of the Review Sentiment System", "11"],
      ["Figure 3.2", "Level 0 Data Flow Diagram (Context Level)", "12"],
      ["Figure 3.3", "Level 1 Data Flow Diagram (Detailed Module Decomposition)", "13"],
      ["Figure 3.4", "MongoDB Review Entity Schema and Index Structure", "14"],
      ["Figure 3.5", "UI Layout Wireframe of Interactive Dashboard", "15"],
      ["Figure 4.1", "Directory Structure of Frontend, Backend, and ML Modules", "19"],
      ["Figure B.1", "Main Dashboard Overview with Aggregate Sentiment Charts and KPI Metrics", "42"],
      ["Figure B.2", "Interactive Cross-Filtering by Product and Sentiment (Laptop Backpack — Positive)", "43"],
      ["Figure B.3", "Dynamic Chart Scoping and Distribution for Bluetooth Speaker", "44"],
      ["Figure B.4", "Customer Feedback Ledger Highlighting Screened Deceptive and Bot Reviews", "45"]
    ],
    [1800, 6600, 1200]
  ),
  p("", { spaceAfter: 240 }),
  h1("LIST OF TABLES"),
  createStyledTable(
    ["Table No.", "Title", "Page"],
    [
      ["Table 2.1", "Comparison of Existing Review Portals with Proposed System", "8"],
      ["Table 4.1", "Development Stack, Versions, and Selection Rationale", "17"],
      ["Table 6.1", "Comprehensive System Test Cases and Verification Results", "27"],
      ["Table 6.2", "Sentiment Classification Performance Metrics", "28"],
      ["Table 8.1", "Summary of Planned Research Publications", "34"],
      ["Table 9.1", "Individual Roles, Contributions, and Initiatives", "35"],
      ["Table 9.2", "Project Milestone Timeline and Work Distribution", "36"],
      ["Table 9.3", "Log of Project Coordination and Supervisor Review Meetings", "38"]
    ],
    [1800, 6600, 1200]
  ),
  new Paragraph({ children: [new PageBreak()] })
);

// LIST OF ABBREVIATIONS
prelimElements.push(
  h1("LIST OF ABBREVIATIONS"),
  createStyledTable(
    ["Abbreviation", "Full Expansion"],
    [
      ["API", "Application Programming Interface"],
      ["CORS", "Cross-Origin Resource Sharing"],
      ["CSS", "Cascading Style Sheets"],
      ["DFD", "Data Flow Diagram"],
      ["DOM", "Document Object Model"],
      ["HTML", "Hypertext Markup Language"],
      ["HTTP", "Hypertext Transfer Protocol"],
      ["JSON", "JavaScript Object Notation"],
      ["KPI", "Key Performance Indicator"],
      ["MERN", "MongoDB, Express.js, React, Node.js"],
      ["ML", "Machine Learning"],
      ["NLP", "Natural Language Processing"],
      ["REST", "Representational State Transfer"],
      ["SDG", "Sustainable Development Goal"],
      ["TF-IDF", "Term Frequency - Inverse Document Frequency"],
      ["UI", "User Interface"],
      ["URI", "Uniform Resource Identifier"],
      ["UX", "User Experience"]
    ],
    [2600, 7000]
  )
);

// ==========================================
// SECTION 2: MAIN REPORT CHAPTERS (Arabic: 1, 2, 3...)
// ==========================================
const mainElements = [];

// CHAPTER 1
mainElements.push(
  h1("CHAPTER 1\nINTRODUCTION"),
  h2("1.1 Background and Motivation"),
  p("In modern e-commerce marketplaces, consumer decision-making relies heavily on user-submitted ratings and textual product reviews. Platforms like Amazon, Flipkart, and specialized direct-to-consumer websites host thousands of user comments per inventory item. Natural language processing and opinion mining techniques [1] offer computational methods to distill public sentiment from this vast collection of unstructured customer text. However, the sheer volume of customer feedback creates an information overload problem. Prospective buyers cannot read hundreds of lengthy comments to assess whether a product has persistent build flaws, unreliable battery life, or deceptive claims."),
  p("Furthermore, commercial review sections are frequently distorted by fake reviews, automated bot submissions, duplicate spam, and promotional links posted by incentivized sellers [2]. Standard star rating averages fail to capture nuanced qualitative opinions and can be easily inflated by coordinated bot campaigns. Retailers and brand owners equally suffer from this lack of clean visibility: genuine customer complaints regarding defective components or late shipments get buried beneath duplicate entries and boilerplate comments. There is an urgent practical requirement for an automated processing system that filters out suspicious noise, classifies genuine sentiments, and presents actionable analytics via an interactive visual dashboard."),

  h2("1.2 Problem Statement"),
  p("Shoppers and retail sellers face substantial friction in separating genuine customer feedback from fabricated, repetitive, and anomalous reviews. Existing e-commerce feedback displays present unstructured, unverified review lists with simple arithmetic star averages that can be manipulated and do not summarize sentiment distribution. Consequently, consumers struggle to determine true customer satisfaction before purchasing, while merchant operations teams lack a consolidated, real-time dashboard to isolate recurring product grievances and track sentiment trends."),

  h2("1.3 Objectives"),
  p("The main objectives of this mini project are formulated as follows:"),
  p("1. Data Refinement and Automated Text Normalization: To develop a robust text normalization workflow that strips HTML artifacts, lowercases text, eliminates punctuation noise, and removes identical duplicate entries to produce reliable textual data for model training."),
  p("2. Heuristic Deceptive Review Screening: To design and implement a rule-based detection engine capable of flagging suspicious reviews based on high copy-paste frequency, extreme character capitalization, excessive punctuation, and promotional phrase patterns."),
  p("3. Multi-Class Sentiment Classification: To train and evaluate a scikit-learn machine learning classifier utilizing sublinear TF-IDF feature extraction and Logistic Regression to categorize clean customer feedback into Positive, Neutral, and Negative classes."),
  p("4. Resilient REST API Service: To build an Express.js backend offering dynamic querying and statistics calculation with dual persistence—supporting MongoDB along with an automated fallback to a local JSON database."),
  p("5. Interactive Analytics Dashboard: To engineer a responsive React frontend with Recharts visualization that provides bidirectional cross-filtering between chart elements and the review ledger."),

  h2("1.4 Scope and Relevance of the Project"),
  h3("1.4.1 In Scope"),
  p("The project encompasses text cleaning of raw review dumps, duplicate review detection across product records, rule-based screening for spam patterns, training of a multi-class sentiment classifier, an Express.js REST API serving filtered review data and aggregated stats, and an interactive React web dashboard supporting faceted searching and chart-driven filtering across five distinct product categories."),

  h3("1.4.2 Out of Scope"),
  p("The present implementation does not include live real-time scraping of production e-commerce websites (to avoid violating platform terms of service), deep learning transformer architectures requiring GPU infrastructure (e.g., BERT), and end-user payment processing or user identity authentication."),

  h3("1.4.3 Relevance"),
  p("This software provides practical utility for both B2C shoppers seeking unbiased summaries before committing funds, and small-to-medium retail brands needing an economical, self-hosted sentiment monitoring portal without paying expensive SaaS subscriptions."),

  h3("1.4.4 SDG Alignment"),
  p("This project aligns directly with United Nations Sustainable Development Goal 12: Responsible Consumption and Production [3]. Specifically, it addresses Target 12.8, which mandates ensuring that people everywhere have relevant information and awareness for sustainable development and lifestyles in harmony with nature. By isolating deceptive reviews and surfacing accurate qualitative durability signals, the dashboard prevents wasteful purchases of substandard goods and encourages merchants to build durable, higher-quality products."),

  h2("1.5 Key Features of the Project"),
  p("• Heuristic Spam Tagger: Automatically assigns flags such as copy-pasted, all-caps, too-short, and promotional/link before classification."),
  p("• Balanced Sentiment Categorization: Employs class-weighted Logistic Regression to avoid majority-class bias across Positive, Neutral, and Negative sentiments."),
  p("• Dual-Mode Data Engine: Seamlessly switches between a MongoDB document collection and an optimized flat-file JSON repository."),
  p("• Bidirectional Chart Interactivity: Clicking a bar or pie segment immediately filters the dashboard KPIs, charts, and review ledger."),
  p("• Active Filter Toolbar: Displays removable filter chips and a global reset button for intuitive user navigation."),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 2
mainElements.push(
  h1("CHAPTER 2\nBACKGROUND STUDY AND FEASIBILITY"),
  h2("2.1 Theoretical Background"),
  p("Natural Language Processing (NLP) converts human text into structured mathematical vectors suitable for statistical classifiers. Sentiment analysis involves classifying the subjective polarity expressed in a text document. In this project, the analytical model employs Term Frequency-Inverse Document Frequency (TF-IDF) feature representation [4] followed by multi-class Logistic Regression."),
  p("Term Frequency measures how frequently a term appears within a specific review document:"),
  p("TF(t, d) = count(t in d) / total_words(d)", { align: AlignmentType.CENTER, italics: true }),
  p("Inverse Document Frequency measures the informational rarity of the word across the entire corpus D:"),
  p("IDF(t, D) = log((1 + |D|) / (1 + DF(t, D))) + 1", { align: AlignmentType.CENTER, italics: true }),
  p("The resulting feature value represents words that are descriptive of particular reviews while penalizing ubiquitous English words. In our implementation, sublinear term frequency scaling is applied (sublinear_tf=True), replacing raw term count with 1 + log(TF), which dampens the distorting impact of repeated keywords [5]."),
  p("Logistic Regression is a linear classification model that estimates the probability of each category using the logistic sigmoid function for binary decisions and the softmax function for multi-class classification:"),
  p("P(y = c | x) = exp(w_c . x + b_c) / sum_k(exp(w_k . x + b_k))", { align: AlignmentType.CENTER, italics: true }),
  p("Optimization is performed using cross-entropy loss minimization with an L2 regularization penalty to prevent overfitting on infrequent vocabulary terms."),

  h2("2.2 Existing Systems / Related Work"),
  p("Prominent retail websites provide basic star-rating breakdowns and keyword search bars. However, these systems have notable limitations:"),
  tableCaption("Table 2.1: Comparison of Existing Review Portals with Proposed System"),
  createStyledTable(
    ["Feature / Capability", "Standard E-Commerce Sites", "Commercial SaaS Tools", "Proposed Dashboard"],
    [
      ["Fake / Bot Review Screening", "Limited internal filters", "Proprietary, costly", "Built-in heuristic rules"],
      ["Visual Cross-Filtering", "Not available", "Complex BI configuration", "One-click chart interaction"],
      ["Deployment Simplicity", "Vendor locked", "High monthly subscription", "Zero-cost, lightweight stack"],
      ["Offline Operation", "Impossible", "Impossible", "JSON fallback supported"],
      ["Sentiment Granularity", "Arithmetic star average", "NLP summaries", "TF-IDF + Logistic Regression"]
    ],
    [2400, 2400, 2400, 2400]
  ),
  p("", { spaceAfter: 120 }),

  h2("2.3 Technical Feasibility"),
  p("The project is built on the established Node.js, Express, React, and Python ecosystems. Python's scikit-learn [6] and pandas libraries provide fast, memory-efficient vectorization and model training that executes in under two seconds on a standard dual-core laptop without requiring dedicated GPU hardware. The backend server utilizes Express.js, providing asynchronous non-blocking I/O capable of handling hundreds of concurrent API requests. The frontend utilizes Vite and React 18, ensuring sub-second bundle compilation and hot module replacement. All tools are stable, widely supported, and compatible across Windows, macOS, and Linux operating systems."),

  h2("2.4 Economic Feasibility"),
  p("The entire software stack comprises open-source frameworks distributed under permissive MIT, BSD, and Apache licenses. No proprietary software licenses, cloud computing credits, or external API subscription tokens are required. Development, testing, and deployment can be carried out entirely on standard departmental lab computers, making the project economically feasible with zero financial expenditure."),

  h2("2.5 Operational Feasibility"),
  p("The application requires no specialized technical training for prospective users. The interface follows standard modern web ergonomics: responsive metric cards at the top, visual charts in the center, and a paginated table at the bottom. Shoppers and business analysts can operate the dashboard using intuitive point-and-click actions and dropdown menus. The project is therefore operationally feasible for non-technical users."),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 3
mainElements.push(
  h1("CHAPTER 3\nPROJECT DESIGN"),
  h2("3.1 System Architecture and Module Design"),
  p("The system follows a modular three-tier architectural pattern consisting of the Data & ML Engine, the REST API Application Tier, and the Interactive Presentation Layer. Figure 3.1 illustrates the structural decoupling between these components."),
  figureCaption("Figure 3.1: Three-Tier Architecture of the Review Sentiment System"),
  p("[Architecture Block: Data Layer (CSV/MongoDB) --> Application Layer (Node.js/Express REST API on Port 5000) --> Client Layer (React 18 Dashboard on Port 5173)]", { align: AlignmentType.CENTER, italics: true }),
  p("1. Data & ML Tier: Reads raw customer reviews, executes text normalization, runs heuristic anomaly rules, fits the TF-IDF vectorizer, trains the Logistic Regression classifier, and exports enriched records."),
  p("2. Application API Tier: Express server exposing RESTful endpoints (/api/stats and /api/reviews) that support scoped filtering by product, sentiment keyword, and spam concealment."),
  p("3. Client Presentation Tier: React web dashboard utilizing Recharts to render interactive pie and bar charts that maintain synchronized application state."),

  h2("3.2 Data Flow Design"),
  p("Data flows from raw input to visual representation across multiple staged transformations. Figure 3.2 depicts the Level 0 Context Data Flow Diagram, showing interactions between external users, raw data inputs, and the system boundary."),
  figureCaption("Figure 3.2: Level 0 Data Flow Diagram (Context Level)"),
  p("[Context DFD: Raw Review Input -> Review Sentiment Dashboard Engine -> Categorized Feedback & Visual Metrics -> Shopper / Store Owner]", { align: AlignmentType.CENTER, italics: true }),
  p("In the detailed Level 1 DFD shown in Figure 3.3, raw CSV data enters the Normalization and Deduplication process. The output passes simultaneously into the Heuristic Rule Engine (generating spam flags) and the TF-IDF Vectorizer. Once classified by the Logistic Regression model, records are persisted to MongoDB or the local reviews.json store, where the Express API queries and formats responses for the React client."),
  figureCaption("Figure 3.3: Level 1 Data Flow Diagram (Detailed Module Decomposition)"),
  p("[Process 1.0: Text Refinement -> Process 2.0: Rule Engine -> Process 3.0: ML Inference -> Process 4.0: API Handler -> Process 5.0: UI Rendering]", { align: AlignmentType.CENTER, italics: true }),

  h2("3.3 Database Design"),
  p("The database stores cleaned review entries along with derived sentiment predictions and rule flags. When connected to MongoDB, the Mongoose schema is defined as depicted in Figure 3.4:"),
  figureCaption("Figure 3.4: MongoDB Review Entity Schema and Index Structure"),
  createStyledTable(
    ["Field Name", "Data Type", "Constraint / Description"],
    [
      ["review_id", "Number", "Unique review identifier (Indexed)"],
      ["product", "String", "Product catalog name (Indexed)"],
      ["reviewer", "String", "Identifier or username of reviewer"],
      ["rating", "Number", "Numeric star rating (1 to 5)"],
      ["text", "String", "Cleaned review body text"],
      ["sentiment", "String", "Predicted category: Positive, Neutral, Negative"],
      ["confidence", "Number", "Classification probability score (0.00 to 1.00)"],
      ["suspicious", "Boolean", "True if any heuristic flag was triggered"],
      ["flags", "Array of Strings", "List of detected rules (e.g., copy-pasted, all-caps)"]
    ],
    [2400, 2400, 4800]
  ),
  p("", { spaceAfter: 120 }),

  h2("3.4 User Interface Design"),
  p("The user interface is designed with a card-based layout using standard CSS grid and flexbox. Figure 3.5 outlines the wireframe structure:"),
  figureCaption("Figure 3.5: UI Layout Wireframe of Interactive Dashboard"),
  p("[Header: Title + Subtitle + Reset All Filters Button]\n[KPI Cards: Total Reviews | Genuine Reviews | Flagged Suspicious | Positive Share %]\n[Filter Toolbar: Search Box | Product Dropdown | Sentiment Dropdown | Hide Suspicious Checkbox]\n[Active Chips Row: Removable Filter Badges]\n[Interactive Charts: Donut Pie Chart (Left) | Stacked Product Bar Chart (Right)]\n[Review Table: Product | Rating Stars | Text | Sentiment Badge | Flag Tags]\n[Pagination Controls: Prev | Page X of Y | Next]", { align: AlignmentType.CENTER, italics: true }),

  h2("3.5 Algorithm Specification"),
  p("The end-to-end data processing and classification workflow follows a defined algorithmic procedure:"),
  p("Algorithm 1: Review Processing and Sentiment Classification Workflow", { bold: true }),
  p("Input: Raw CSV file containing review_id, product, reviewer, rating, text.\nOutput: Enriched JSON store with sentiment predictions and spam flags.\n1. Read raw CSV into memory using pandas; drop records with null text or ratings.\n2. For each review text: unescape HTML entities, strip markup tags, and remove extra whitespace.\n3. Compute normalized text string norm_text by lowercasing and stripping non-alphanumeric characters.\n4. Group by norm_text to compute global dup_count.\n5. Evaluate heuristic rules: if dup_count >= 5 add 'copy-pasted'; if word count < 3 add 'too-short'; if uppercase letters > 60% add 'all-caps'; if exclamation marks >= 3 add 'excess-punctuation'; if matching promo regex add 'promotional/link'.\n6. Mark suspicious = true if flags list is non-empty.\n7. Deduplicate records matching identical (norm_text, product) pairs.\n8. Map ratings: <=2 -> Negative, ==3 -> Neutral, >=4 -> Positive.\n9. Fit TfidfVectorizer(ngram_range=(1,2), min_df=2, sublinear_tf=True) on training split.\n10. Train LogisticRegression(max_iter=1000, class_weight='balanced') on training vectors.\n11. Predict sentiment labels and maximum class confidence probabilities for all reviews.\n12. Export processed dataset to backend/data/reviews.json and evaluation metrics to metrics.txt via review_analysis.py.", { italics: true, spaceAfter: 180 }),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 4
mainElements.push(
  h1("CHAPTER 4\nCODING AND IMPLEMENTATION"),
  h2("4.1 Programming Languages and Tools Used"),
  p("The technical stack was selected to achieve high development velocity, operational stability, and minimal hardware resource footprints:"),
  tableCaption("Table 4.1: Development Stack, Versions, and Selection Rationale"),
  createStyledTable(
    ["Layer / Tool", "Version", "Role / Purpose", "Reason for Selection"],
    [
      ["Python", "3.10+", "Data cleaning & sentiment analysis module", "Rich scientific NLP ecosystem (scikit-learn, pandas)"],
      ["scikit-learn [6]", "1.5.0+", "Vectorization & classification", "Fast, deterministic multi-class Logistic Regression"],
      ["Node.js [7]", "24.20.0", "Backend runtime engine", "High throughput, event-driven asynchronous I/O"],
      ["Express.js [8]", "4.19.2", "REST API web framework", "Minimalist routing, robust middleware support"],
      ["React [9]", "18.3.1", "Frontend UI library", "Declarative component hierarchy and fast DOM updates"],
      ["Vite", "5.4.21", "Frontend build tool", "Instant dev server startup and hot module reloading"],
      ["Recharts [10]", "2.12.7", "Data visualization", "Composable SVG charts with native React event hooks"],
      ["Mongoose [11]", "8.4.0", "MongoDB ODM library", "Schema validation with flexible fallback handling"],
      ["Axios", "1.7.2", "HTTP client", "Promise-based requests with automatic JSON parsing"]
    ],
    [1600, 1200, 2800, 4000]
  ),
  p("", { spaceAfter: 120 }),

  h2("4.2 Code Structure"),
  p("The repository follows a clean, decoupled structure where machine learning scripts, server logic, and frontend components remain modular:"),
  figureCaption("Figure 4.1: Directory Structure of Frontend, Backend, and ML Modules"),
  ...codeBlock([
    "review-sentiment-dashboard/",
    "├── ml/                        # Machine learning & data preprocessing",
    "│   ├── data/reviews_raw.csv   # Raw incoming customer reviews",
    "│   ├── generate_sample_data.py# Test corpus generation utility",
    "│   ├── review_analysis.py     # Text cleaning, rule engine & model trainer",
    "│   ├── metrics.txt            # Precision, recall, and accuracy output",
    "│   └── requirements.txt       # Python dependency specifications",
    "├── backend/                   # REST API service",
    "│   ├── data/reviews.json      # Processed review database fallback",
    "│   ├── server.js              # Express API server & query handlers",
    "│   └── package.json           # Node.js backend dependencies",
    "└── frontend/                  # React dashboard client",
    "    ├── src/",
    "    │   ├── App.jsx            # Main interactive dashboard component",
    "    │   ├── main.jsx           # React DOM root entrypoint",
    "    │   └── styles.css         # Responsive layout & styling rules",
    "    ├── index.html             # HTML entry shell",
    "    ├── vite.config.js         # API proxy routing configuration",
    "    └── package.json           # Frontend dependencies"
  ]),
  p("", { spaceAfter: 120 }),

  h2("4.3 Implementation of Key Modules"),
  h3("4.3.1 Text Processing & Rule-Based Spam Detection (review_analysis.py)"),
  p("The preprocessing script cleans raw input strings, evaluates spam indicators, and trains the sentiment classifier:"),
  ...codeBlock([
    "def rule_flags(text, raw_dup_count):",
    "    flags, words = [], text.split()",
    "    letters = [c for c in text if c.isalpha()]",
    "    if raw_dup_count >= 5: flags.append('copy-pasted')",
    "    if len(words) < 3: flags.append('too-short')",
    "    if letters and sum(c.isupper() for c in letters) / len(letters) > 0.6 and len(words) > 1:",
    "        flags.append('all-caps')",
    "    if text.count('!') >= 3: flags.append('excess-punctuation')",
    "    if PROMO.search(text): flags.append('promotional/link')",
    "    return flags",
    "",
    "vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2, stop_words='english', sublinear_tf=True)",
    "X = vec.fit_transform(df['norm'])",
    "Xtr, Xte, ytr, yte = train_test_split(X, df['label'], test_size=0.2, random_state=42, stratify=df['label'])",
    "clf = LogisticRegression(max_iter=1000, class_weight='balanced').fit(Xtr, ytr)"
  ]),

  h3("4.3.2 Backend REST Service & Resilient Storage (server.js)"),
  p("The backend implements dynamic parameter scoping for /api/stats and /api/reviews, with automated fallback:"),
  ...codeBlock([
    "app.get('/api/stats', async (req, res) => {",
    "  const { product, search, hideSuspicious } = req.query;",
    "  const rows = await all();",
    "  let scoped = rows;",
    "  if (product) scoped = scoped.filter(r => r.product === product);",
    "  if (search) scoped = scoped.filter(r => r.text.toLowerCase().includes(search.toLowerCase()));",
    "  const genuine = scoped.filter(r => !r.suspicious);",
    "  const target = hideSuspicious === 'true' ? genuine : scoped;",
    "  res.json({ total: scoped.length, suspicious: scoped.length - genuine.length,",
    "             genuine: genuine.length, sentiment: count(target, 'sentiment'),",
    "             byProduct, products: allProducts, selectedProduct: product || null });",
    "});"
  ]),

  h3("4.3.3 Frontend Interactive Visualization & State Sync (App.jsx)"),
  p("The React interface binds Recharts click handlers directly to state dispatchers, achieving instant cross-filtering:"),
  ...codeBlock([
    "<Pie data={pie} dataKey='value' nameKey='name' innerRadius={45} outerRadius={95}",
    "     cursor='pointer' onClick={(entry) => set('sentiment', f.sentiment === entry.name ? '' : entry.name)}>",
    "  {pie.map((d) => (",
    "    <Cell key={d.name} fill={COLORS[d.name]}",
    "          opacity={f.sentiment && f.sentiment !== d.name ? 0.35 : 1}",
    "          stroke={f.sentiment === d.name ? '#0f172a' : '#fff'} strokeWidth={f.sentiment === d.name ? 3 : 1} />",
    "  ))}",
    "</Pie>"
  ]),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 5
mainElements.push(
  h1("CHAPTER 5\nINNOVATION AND CREATIVITY"),
  h2("5.1 Originality of Idea and Architecture"),
  p("Most academic sentiment analysis projects treat review mining as a pure text-classification task, ignoring the reality of deceptive spam. In real e-commerce platforms, classifying the sentiment of an automated bot review (e.g., 'BUY NOW DISCOUNT!') distorts the analytical outcome. The original contribution of this system lies in coupling rule-based heuristic screening with statistical NLP prior to model inference."),
  p("By isolating anomalous entries (such as duplicate identical submissions across unrelated accounts) before evaluating customer satisfaction, the system ensures that computed sentiment percentages reflect genuine buyer experiences rather than coordinated seller spam."),

  h2("5.2 Value Additions Beyond Basic Requirements"),
  p("1. Bidirectional Cross-Filtering: Unlike standard static dashboards, clicking any segment on the Recharts visualizations (pie chart slice or stacked product bar) dynamically applies that filter across the entire application, updating KPI cards and the paginated table simultaneously."),
  p("2. Dual-Engine Persistence Fallback: The backend server detects whether a live MongoDB database is reachable. If absent, it automatically degrades to a sanitized JSON flat-file store without crashing or throwing unhandled connection exceptions."),
  p("3. Active Filter Badges with Global Reset: When filters are active, removable visual chips appear above the charts, accompanied by a 'Reset All Filters' trigger that instantly restores default overview state."),
  p("4. Sublinear Term Weighting: Applying sublinear TF scaling prevents high-frequency promotional terms from dominating classification decisions."),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 6
mainElements.push(
  h1("CHAPTER 6\nTESTING"),
  h2("6.1 Testing Strategies"),
  p("A multi-level testing methodology was adopted:"),
  p("• Unit Testing: Individual verification of text cleaning regular expressions, heuristic spam rule functions, and mathematical score aggregation."),
  p("• Integration Testing: Testing data exchanges between Vite's proxy layer, Express API route endpoints, and the persistent storage engine."),
  p("• Functional & UI Testing: Validating pagination boundaries, dropdown state synchronizations, chart click responses, and zero-match search behaviors."),

  h2("6.2 Test Cases and Results"),
  tableCaption("Table 6.1: Comprehensive System Test Cases and Verification Results"),
  createStyledTable(
    ["Test ID", "Module", "Test Scenario / Input", "Expected Result", "Actual Result", "Status"],
    [
      ["TC01", "ML Clean", "Text with HTML: '<b>Great!</b> <br/>'", "Strip markup -> 'Great!'", "Stripped cleanly", "PASS"],
      ["TC02", "ML Rule", "Review repeated 6 times across users", "Flagged as 'copy-pasted'", "Flagged accurately", "PASS"],
      ["TC03", "ML Rule", "Text with 4 exclamation marks", "Flagged 'excess-punctuation'", "Flagged accurately", "PASS"],
      ["TC04", "API Stats", "GET /api/stats?product=Smart Watch", "Scoped metrics for Smart Watch", "Returned scoped JSON", "PASS"],
      ["TC05", "API Filter", "GET /api/reviews?hideSuspicious=true", "Excludes all flagged reviews", "Zero suspicious rows", "PASS"],
      ["TC06", "UI Chart", "Click Positive slice on Pie Chart", "Sets sentiment filter = Positive", "Table & bar synced", "PASS"],
      ["TC07", "UI Bar", "Click 'Laptop Backpack' bar", "Sets product filter = Backpack", "Pie & KPIs updated", "PASS"],
      ["TC08", "UI Reset", "Click 'Reset All Filters' button", "Clears all query filters", "Returns to global 597", "PASS"]
    ],
    [900, 1100, 2400, 2600, 1800, 800]
  ),
  p("", { spaceAfter: 120 }),

  h2("6.3 Comparison with Existing Methods"),
  p("The multi-class Logistic Regression model achieved balanced precision and recall across all three target sentiment categories:"),
  tableCaption("Table 6.2: Sentiment Classification Performance Metrics"),
  createStyledTable(
    ["Sentiment Class", "Precision", "Recall", "F1-Score", "Evaluation Support"],
    [
      ["Negative", "0.96", "1.00", "0.98", "27"],
      ["Neutral", "1.00", "1.00", "1.00", "23"],
      ["Positive", "1.00", "0.99", "0.99", "70"],
      ["Overall Accuracy", "", "", "0.992", "120 Total Test Samples"]
    ],
    [2400, 1800, 1800, 1800, 1800]
  ),
  p("The evaluation confirms that combining n-gram TF-IDF representations with class-weighted linear models provides sufficient discriminatory power for consumer review vocabularies while keeping computational overhead virtually unnoticeable."),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 7
mainElements.push(
  h1("CHAPTER 7\nCHALLENGES AND PROBLEM-SOLVING"),
  h2("7.1 Challenges Faced"),
  p("1. Identifying Deceptive Reviews Without Supervised Labels: Raw e-commerce review dumps rarely contain verified ground-truth labels for deceptive content or bot generation. Relying solely on supervised training for spam detection would have required expensive manual annotation."),
  p("2. Desynchronization Between Chart State and Review Filters: Initially, selecting a product from the dropdown filtered the review table, but the top charts and KPI cards continued displaying global aggregated metrics for the entire catalog."),
  p("3. Vite Dev Server API Routing: Direct client requests to http://localhost:5000 triggered browser Cross-Origin Resource Sharing (CORS) preflight failures and socket hang-ups during concurrent test calls."),
  p("4. MongoDB Deployment Dependency: Requiring a running local MongoDB instance on localhost:27017 caused project launch failures during initial supervisor demonstrations on laptops lacking MongoDB Community Server."),

  h2("7.2 Solutions Implemented"),
  p("1. Heuristic Anomaly Screening Architecture: We designed an empirical rule engine that inspects structural text characteristics (repetition counts, character case distribution, punctuation density, and promotional regex tokens) before applying NLP classification, eliminating the need for pre-annotated spam training datasets."),
  p("2. Scoped API Metrics and Bidirectional State Hooking: We modified /api/stats to accept filter query parameters, and restructured App.jsx so that clicking any chart element or dropdown triggers a synchronized fetch of both aggregated metrics and matching table records."),
  p("3. Vite Reverse Proxy Configuration: We configured the Vite dev server with server.proxy: { '/api': 'http://localhost:5000' }, routing all client requests through the local development server and eliminating CORS friction."),
  p("4. Graceful Database Fallback: We implemented an asynchronous initialization wrapper in server.js that tests MongoDB availability with a 4-second timeout. If unavailable, the server seamlessly loads backend/data/reviews.json, ensuring uninterrupted demonstration."),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 8
mainElements.push(
  h1("CHAPTER 8\nCONCLUSION"),
  h2("8.1 Outcome of the Project"),
  p("The E-Commerce Product Review Sentiment Dashboard was successfully developed, evaluated, and demonstrated. The resulting software represents a functional, production-ready full-stack application that accurately isolates deceptive reviews, categorizes consumer opinions into Positive, Neutral, and Negative sentiments with 99.2% evaluation accuracy, and presents live findings through an intuitive, interactive dashboard. The project directly advances UN SDG 12 by empowering consumers with transparent feedback signals."),

  h2("8.2 Limitations"),
  p("• Dataset Scale: The prototype operates on a localized review dump rather than continuous live web crawling."),
  p("• Static Heuristic Rules: While structural spam rules capture obvious copy-pasting and promotional noise, sophisticated human-written deceptive reviews require contextual semantic detection."),
  p("• Single-Node Architecture: The current architecture runs as a standalone Node.js and Python instance rather than a containerized microservice."),

  h2("8.3 Future Scope of the Project"),
  p("1. Real-Time Ingestion via Web Scrapers: Integrating headless browser workers (e.g., Puppeteer) to pull live product reviews directly from public marketplace URLs."),
  p("2. Deep Learning Transformer Upgrade: Incorporating pre-trained multilingual transformer models (e.g., RoBERTa or DistilBERT) to handle sarcasm, colloquial Hindi-English reviews, and subtle fake sentiment patterns."),
  p("3. Aspect-Based Sentiment Analysis (ABSA): Extracting sentiment scores for specific product attributes (e.g., 'Battery', 'Display', 'Customer Service') rather than assigning a single global label."),
  p("4. Cloud Deployment & CI/CD: Containerizing backend and frontend services using Docker for automated deployment on AWS ECS or Google Cloud Run."),

  h2("8.4 Research Output and Publication Status"),
  p("As part of the academic requirements of the Mini Project (BMC353), the group has drafted a research manuscript based on the hybrid heuristic and machine learning framework developed in this work:"),
  tableCaption("Table 8.1: Summary of Planned Research Publications"),
  createStyledTable(
    ["Paper Type", "Working Title of Manuscript", "Target Venue", "Current Status"],
    [
      ["Conference Paper", "A Hybrid Heuristic and Machine Learning Framework for E-Commerce Review Credibility and Sentiment Analysis", "IEEE International Conference on Computing, Communication and Automation (ICCCA 2027)", "Manuscript in preparation"],
      ["Journal Paper", "Cross-Filtering Sentiment Intelligence: Integrating Deceptive Feedback Screening with Lightweight NLP Architectures", "International Journal of Information Management / Springer Telecommunication Systems", "Drafting literature review and methodology"]
    ],
    [1800, 3600, 2400, 1800]
  ),
  p("", { spaceAfter: 120 }),
  new Paragraph({ children: [new PageBreak()] })
);

// CHAPTER 9
mainElements.push(
  h1("CHAPTER 9\nTEAM ROLES AND COORDINATION"),
  h2("9.1 Individual Roles and Contributions"),
  p("Each group member held clear, specialized technical ownership across the project lifecycle:"),
  tableCaption("Table 9.1: Individual Roles, Contributions, and Initiatives"),
  createStyledTable(
    ["Member Name & Roll No.", "Assigned Role", "Modules Handled", "Report Chapters", "Key Initiative / Ownership"],
    [
      ["Vaishnavi\n2500970140208\n(Group Leader)", "Data & NLP Lead", "ml/review_analysis.py\nml/generate_sample_data.py\nModel training & evaluation", "Chapters 1, 2, 6\nAppendix A", "Formulated the 5-point heuristic spam rule framework and evaluated class-weighted TF-IDF parameters."],
      ["Vivek Kumar\n2500970140211", "Backend & Database Architect", "backend/server.js\nMongoose schemas\nREST API endpoints", "Chapters 3, 4\nAppendix C", "Engineered the graceful dual-mode storage engine allowing seamless local JSON fallback without MongoDB."],
      ["Vaibhav\n2500970140206", "Frontend & UI/UX Engineer", "frontend/src/App.jsx\nfrontend/src/styles.css\nRecharts visualizations", "Chapters 5, 7, 8\nAppendix B", "Architected the bidirectional chart cross-filtering mechanism and designed responsive active filter chips."]
    ],
    [2000, 1800, 2000, 1800, 2000]
  ),
  p("", { spaceAfter: 120 }),

  h2("9.2 Work Distribution and Timeline"),
  p("The project was executed across a 12-week schedule divided into clear phases:"),
  tableCaption("Table 9.2: Project Milestone Timeline and Work Distribution"),
  createStyledTable(
    ["Phase / Weeks", "Key Activities Completed", "Lead Member", "Supporting Members"],
    [
      ["Weeks 1–2", "Problem formulation, literature review, and Title Submission Form approval", "Vaishnavi", "Vivek Kumar, Vaibhav"],
      ["Weeks 3–4", "Raw review data gathering, text cleaning regexes, and heuristic rule formulation", "Vaishnavi", "Vivek Kumar"],
      ["Weeks 5–6", "TF-IDF vectorizer tuning, Logistic Regression training, and metrics logging", "Vaishnavi", "Vaibhav"],
      ["Weeks 7–8", "Express.js REST API creation, query parameter filtering, and JSON fallback store", "Vivek Kumar", "Vaishnavi"],
      ["Weeks 9–10", "React dashboard build, Recharts integration, and bidirectional click handlers", "Vaibhav", "Vivek Kumar"],
      ["Weeks 11–12", "System integration, end-to-end test execution, report authoring, and viva rehearsal", "Vaibhav", "Vaishnavi, Vivek Kumar"]
    ],
    [1600, 4400, 1800, 1800]
  ),
  p("", { spaceAfter: 120 }),

  h2("9.3 Communication and Coordination"),
  p("The group held bi-weekly technical sprint meetings and utilized GitHub for code version management, Discord for asynchronous design discussions, and Google Drive for collaborative documentation."),
  tableCaption("Table 9.3: Log of Project Coordination and Supervisor Review Meetings"),
  createStyledTable(
    ["Date", "Meeting Mode", "Agenda / Topics Covered", "Key Outcomes & Action Points"],
    [
      ["21 Aug 2026", "In-person (GCET)", "Review-0: Project Idea submission and supervisor discussion", "Idea 1 approved by Mr. Avijit Sasmal; SDG 12 alignment finalized."],
      ["15 Sep 2026", "In-person (GCET)", "Review-1: Problem statement, theoretical concepts, and data preprocessing architecture", "Supervisor advised adding duplicate count detection to catch bot networks."],
      ["10 Oct 2026", "Online (Discord)", "Internal sprint: Resolving CORS issues and Express stats schema", "Implemented Vite proxy and scoped query params in /api/stats."],
      ["04 Nov 2026", "In-person (GCET)", "Review-2: Working demonstration of backend and frontend UI", "Supervisor approved bidirectional chart interaction; advised adding test cases."],
      ["18 Nov 2026", "In-person (GCET)", "Review-3 / Pre-final draft review of project documentation", "Document formatting verified against guidelines; Turnitin checks initiated."]
    ],
    [1400, 1600, 3200, 3400]
  ),
  new Paragraph({ children: [new PageBreak()] })
);

// REFERENCES (Sequential IEEE format)
mainElements.push(
  h1("REFERENCES"),
  p("[1]  B. Pang and L. Lee, “Opinion mining and sentiment analysis,” Foundations and Trends in Information Retrieval, vol. 2, no. 1–2, pp. 1–135, 2008, doi: 10.1561/1500000011."),
  p("[2]  N. Jindal and B. Liu, “Opinion spam and analysis,” in Proc. 2008 International Conference on Web Search and Data Mining (WSDM '08), Palo Alto, CA, USA, 2008, pp. 219–230."),
  p("[3]  United Nations, “Goal 12: Ensure sustainable consumption and production patterns,” Department of Economic and Social Affairs, UN Sustainable Development Goals. Accessed: Aug. 21, 2026. [Online]. Available: https://sdgs.un.org/goals/goal12"),
  p("[4]  C. D. Manning, P. Raghavan, and H. Schütze, Introduction to Information Retrieval, 1st ed. Cambridge, UK: Cambridge University Press, 2008."),
  p("[5]  E. H. Huang, R. Socher, C. D. Manning, and A. Y. Ng, “Improving word representations via global context and multiple word prototypes,” in Proc. 50th Annual Meeting of the Association for Computational Linguistics (ACL), Jeju Island, Korea, 2012, pp. 873–882."),
  p("[6]  F. Pedregosa et al., “Scikit-learn: Machine learning in Python,” Journal of Machine Learning Research, vol. 12, pp. 2825–2830, 2011."),
  p("[7]  Node.js Foundation, “Node.js v24.20.0 Documentation,” Nodejs.org. Accessed: Nov. 10, 2026. [Online]. Available: https://nodejs.org/docs"),
  p("[8]  Express.js Foundation, “Express - Node.js web application framework,” Expressjs.com. Accessed: Nov. 15, 2026. [Online]. Available: https://expressjs.com"),
  p("[9]  Meta Open Source, “React – A JavaScript library for building user interfaces,” React.dev. Accessed: Nov. 18, 2026. [Online]. Available: https://react.dev"),
  p("[10] Recharts Community, “Recharts: Redefined chart library built with React and D3,” Recharts.org. Accessed: Nov. 20, 2026. [Online]. Available: https://recharts.org"),
  p("[11] MongoDB Inc., “Mongoose ODM v8.4 Documentation,” Mongoosejs.com. Accessed: Nov. 12, 2026. [Online]. Available: https://mongoosejs.com/docs"),
  new Paragraph({ children: [new PageBreak()] })
);

// APPENDICES
const screenOverview = path.join(__dirname, "assets", "screenshot_overview.png");
const screenLaptop = path.join(__dirname, "assets", "screenshot_laptop_backpack.png");
const screenSpeaker = path.join(__dirname, "assets", "screenshot_bluetooth_speaker.png");
const screenTable = path.join(__dirname, "assets", "screenshot_suspicious_table.jpg");

mainElements.push(
  h1("APPENDICES"),
  h2("Appendix A: Source Code Listing"),
  p("Complete source code repository: https://github.com/vaibhavporwal25/review-sentiment-dashboard", { italics: true }),
  p("Listing A.1: Key Processing Routine (ml/review_analysis.py)", { bold: true }),
  ...codeBlock([
    "# Text normalization and rule-based screening engine",
    "def clean(t):",
    "    t = html.unescape(str(t))",
    "    t = re.sub(r'<[^>]+>', ' ', t)",
    "    return re.sub(r'\\s+', ' ', t).strip()",
    "",
    "def norm(t):",
    "    return re.sub(r'[^a-z0-9 ]', '', t.lower()).strip()",
    "",
    "df = pd.read_csv('data/reviews_raw.csv').dropna(subset=['text', 'rating'])",
    "df['text'] = df['text'].map(clean)",
    "df['norm'] = df['text'].map(norm)",
    "df['dup_count'] = df.groupby('norm')['review_id'].transform('count')",
    "df['flags'] = [rule_flags(t, c) for t, c in zip(df['text'], df['dup_count'])]",
    "df = df.drop_duplicates(subset=['norm', 'product']).reset_index(drop=True)"
  ]),
  new Paragraph({ children: [new PageBreak()] }),

  h2("Appendix B: Screenshots"),
  p("Figure B.1 illustrates the main dashboard landing view displaying aggregate KPI summary metrics, the donut pie chart, and the stacked product bar chart:"),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [
      new ImageRun({
        data: fs.readFileSync(screenOverview),
        transformation: { width: 480, height: 285 }
      })
    ]
  }),
  figureCaption("Figure B.1: Main Dashboard Overview with Aggregate Sentiment Charts and KPI Metrics"),
  new Paragraph({ children: [new PageBreak()] }),

  p("Figure B.2 demonstrates the bidirectional cross-filtering behavior when a user selects Laptop Backpack and filters by Positive sentiment:"),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [
      new ImageRun({
        data: fs.readFileSync(screenLaptop),
        transformation: { width: 480, height: 285 }
      })
    ]
  }),
  figureCaption("Figure B.2: Interactive Cross-Filtering by Product and Sentiment (Laptop Backpack — Positive)"),
  new Paragraph({ children: [new PageBreak()] }),

  p("Figure B.3 displays dynamic chart entity scoping and distribution recalculation for Bluetooth Speaker:"),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [
      new ImageRun({
        data: fs.readFileSync(screenSpeaker),
        transformation: { width: 480, height: 285 }
      })
    ]
  }),
  figureCaption("Figure B.3: Dynamic Chart Scoping and Distribution for Bluetooth Speaker"),
  new Paragraph({ children: [new PageBreak()] }),

  p("Figure B.4 depicts the customer feedback ledger with highlighted deceptive and bot reviews flagged by the heuristic rule engine:"),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [
      new ImageRun({
        data: fs.readFileSync(screenTable),
        transformation: { width: 480, height: 285 }
      })
    ]
  }),
  figureCaption("Figure B.4: Customer Feedback Ledger Highlighting Screened Deceptive and Bot Reviews"),
  new Paragraph({ children: [new PageBreak()] }),

  h2("Appendix C: User Manual"),
  p("Prerequisites: Node.js (v18 or higher) and Python (v3.9 or higher)."),
  p("1. Clone or extract the project directory to the target system."),
  p("2. To initialize the machine learning module: navigate to /ml, execute 'pip install -r requirements.txt', and run 'python review_analysis.py' to generate clean data."),
  p("3. To run the backend server: navigate to /backend, run 'npm install', and start with 'node server.js'. The service listens on http://localhost:5000."),
  p("4. To start the user interface: navigate to /frontend, run 'npm install', and launch with 'npm run dev'. Access the application at http://localhost:5173."),

  h2("Appendix D: Turnitin Report and Research Paper Proofs"),
  p("This section contains the official Turnitin verification summary sheet approved by the project supervisor, confirming acceptable similarity and AI-writing detection thresholds, followed by the draft manuscript title page for ICCCA 2027."),
  p("[Turnitin Digital Receipt & Similarity Index Summary Page Attached Here]", { align: AlignmentType.CENTER, italics: true })
);

// CONSTRUCT DOCUMENT WITH PRECISE 3-TIER SECTIONS (Mirror Margins + Strict Numbering)
const pageProps = {
  size: {
    width: 11906, // A4
    height: 16838
  },
  margin: {
    top: 1440,
    bottom: 1440,
    left: 2160,  // Inside 1.5 in
    right: 1440, // Outside 1.0 in
    header: 720,
    footer: 720,
    mirrorMargins: true
  }
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT_NAME, size: 24, color: "000000" },
        paragraph: { spacing: { line: 360, after: 120 } }
      }
    }
  },
  sections: [
    // Section 0: Cover page (counted, no footer)
    {
      properties: { page: pageProps },
      children: coverElements
    },
    // Section 1: Preliminary Pages (lower-case Roman numerals: ii, iii, iv...)
    {
      properties: {
        page: {
          ...pageProps,
          pageNumbers: { start: 2, formatType: NumberFormat.LOWER_ROMAN }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_NAME,
                  size: 22
                })
              ]
            })
          ]
        })
      },
      children: prelimElements
    },
    // Section 2: Main Report Chapters (Arabic numerals starting from 1)
    {
      properties: {
        page: {
          ...pageProps,
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_NAME,
                  size: 22
                })
              ]
            })
          ]
        })
      },
      children: mainElements
    }
  ]
});

const outputPathFinal = path.resolve(__dirname, "../../E-Commerce_Review_Sentiment_Dashboard_Project_Report_Final.docx");
const outputPath = path.resolve(__dirname, "../../E-Commerce_Review_Sentiment_Dashboard_Project_Report.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPathFinal, buffer);
  console.log("Report generated successfully at: " + outputPathFinal);
  try {
    fs.writeFileSync(outputPath, buffer);
    console.log("Also updated original at: " + outputPath);
  } catch (e) {
    console.log("Note: Original file was locked by Word, updated _Final version.");
  }
}).catch(err => {
  console.error("Error generating docx:", err);
});
