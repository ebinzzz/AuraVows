const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat, ExternalHyperlink,
  TableOfContents, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');

const GOLD = "B8860B";
const DARK = "1A1A2E";
const LIGHT_GOLD = "FFF8E7";
const MID = "5C4A1E";
const GRAY = "666666";
const LIGHT_GRAY = "F5F5F0";
const WHITE = "FFFFFF";
const BORDER_GOLD = { style: BorderStyle.SINGLE, size: 2, color: GOLD };
const BORDER_LIGHT = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

const borders_gold = { top: BORDER_GOLD, bottom: BORDER_GOLD, left: BORDER_GOLD, right: BORDER_GOLD };
const borders_light = { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT };
const borders_none = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, font: "Georgia", size: 32, bold: true, color: DARK })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 4 } },
    children: [new TextRun({ text, font: "Georgia", size: 26, bold: true, color: MID })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "Georgia", size: 22, bold: true, color: DARK })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, font: "Calibri", size: 22, color: opts.color || DARK, bold: opts.bold || false, italics: opts.italic || false })]
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 8 } },
    children: [new TextRun({ text, font: "Calibri", size: 20, color: GRAY, italics: true })]
  });
}

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: pts, after: 0 }, children: [new TextRun("")] });
}

function labelValue(label, value, example) {
  return new TableRow({
    children: [
      new TableCell({
        borders: borders_none,
        width: { size: 2800, type: WidthType.DXA },
        shading: { fill: LIGHT_GOLD, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: label, font: "Calibri", size: 20, bold: true, color: MID })] })]
      }),
      new TableCell({
        borders: borders_none,
        width: { size: 4200, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 100 },
        children: [
          new Paragraph({ children: [new TextRun({ text: value, font: "Calibri", size: 20, color: DARK })] }),
          ...(example ? [new Paragraph({ children: [new TextRun({ text: example, font: "Calibri", size: 18, color: GRAY, italics: true })] })] : [])
        ]
      }),
      new TableCell({
        borders: borders_none,
        width: { size: 2360, type: WidthType.DXA },
        shading: { fill: "FFFEF5", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: "[ Input Field ]", font: "Calibri", size: 18, color: "AAAAAA", italics: true })] })]
      })
    ]
  });
}

function sectionTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 4200, 2360],
    borders: borders_none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: borders_none,
            width: { size: 2800, type: WidthType.DXA },
            shading: { fill: LIGHT_GOLD, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 140, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: "FIELD", font: "Calibri", size: 18, bold: true, color: GOLD, allCaps: true })] })]
          }),
          new TableCell({
            borders: borders_none,
            width: { size: 4200, type: WidthType.DXA },
            shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 140, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: "DESCRIPTION / EXAMPLE", font: "Calibri", size: 18, bold: true, color: GOLD, allCaps: true })] })]
          }),
          new TableCell({
            borders: borders_none,
            width: { size: 2360, type: WidthType.DXA },
            shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: "DATA ENTRY", font: "Calibri", size: 18, bold: true, color: GOLD, allCaps: true })] })]
          })
        ]
      }),
      ...rows
    ]
  });
}

function dbFieldRow(col, type, nullable, description) {
  const nullColor = nullable === "YES" ? "27AE60" : "E74C3C";
  return new TableRow({
    children: [
      new TableCell({
        borders: borders_light,
        width: { size: 2200, type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 120, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: col, font: "Courier New", size: 18, bold: true, color: DARK })] })]
      }),
      new TableCell({
        borders: borders_light,
        width: { size: 1800, type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 120, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: type, font: "Courier New", size: 18, color: "1A5276" })] })]
      }),
      new TableCell({
        borders: borders_light,
        width: { size: 900, type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 80, right: 80 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: nullable, font: "Calibri", size: 18, bold: true, color: nullColor })] })]
      }),
      new TableCell({
        borders: borders_light,
        width: { size: 4460, type: WidthType.DXA },
        margins: { top: 70, bottom: 70, left: 120, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: description, font: "Calibri", size: 18, color: GRAY })] })]
      })
    ]
  });
}

function dbTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 1800, 900, 4460],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({ borders: borders_light, width: { size: 2200, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Column", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
          new TableCell({ borders: borders_light, width: { size: 1800, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Data Type", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
          new TableCell({ borders: borders_light, width: { size: 900, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Nullable", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
          new TableCell({ borders: borders_light, width: { size: 4460, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Description", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
        ]
      }),
      ...rows
    ]
  });
}

function apiRow(method, endpoint, desc, body) {
  const methodColor = method === "POST" ? "27AE60" : method === "GET" ? "2980B9" : method === "DELETE" ? "E74C3C" : "8E44AD";
  return new TableRow({
    children: [
      new TableCell({
        borders: borders_light,
        width: { size: 1100, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 100, right: 80 },
        shading: { fill: "F8F8F8", type: ShadingType.CLEAR },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: method, font: "Calibri", size: 18, bold: true, color: methodColor })] })]
      }),
      new TableCell({
        borders: borders_light,
        width: { size: 3200, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 100, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: endpoint, font: "Courier New", size: 17, color: DARK })] })]
      }),
      new TableCell({
        borders: borders_light,
        width: { size: 2800, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 100, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: desc, font: "Calibri", size: 18, color: GRAY })] })]
      }),
      new TableCell({
        borders: borders_light,
        width: { size: 2260, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 100, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: body || "—", font: "Courier New", size: 16, color: "555555" })] })]
      })
    ]
  });
}

function apiTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1100, 3200, 2800, 2260],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({ borders: borders_light, width: { size: 1100, type: WidthType.DXA }, shading: { fill: MID, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Method", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
          new TableCell({ borders: borders_light, width: { size: 3200, type: WidthType.DXA }, shading: { fill: MID, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Endpoint", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
          new TableCell({ borders: borders_light, width: { size: 2800, type: WidthType.DXA }, shading: { fill: MID, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Description", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
          new TableCell({ borders: borders_light, width: { size: 2260, type: WidthType.DXA }, shading: { fill: MID, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Request Body", font: "Calibri", size: 18, bold: true, color: WHITE })] })] }),
        ]
      }),
      ...rows
    ]
  });
}

// ─── DOCUMENT ────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      },
      {
        reference: "sub-bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Georgia", color: DARK }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Georgia", color: MID }, paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Georgia", color: DARK }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [
    // ══════════════════════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "✦  ✦  ✦", font: "Georgia", size: 28, color: GOLD })] }),
        spacer(200),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "Online Wedding Invitation System", font: "Georgia", size: 52, bold: true, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Complete Technical & Data Specification", font: "Georgia", size: 28, italics: true, color: GOLD })] }),
        spacer(80),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 1 } }, spacing: { before: 0, after: 0 }, children: [new TextRun("")] }),
        spacer(120),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "React TypeScript  ·  FastAPI  ·  PostgreSQL", font: "Calibri", size: 22, color: GRAY })] }),
        spacer(400),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "DOCUMENT CONTENTS", font: "Calibri", size: 20, bold: true, color: GOLD, allCaps: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "1. Project Overview & Architecture", font: "Calibri", size: 20, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "2. Complete Data Field Specifications", font: "Calibri", size: 20, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "3. PostgreSQL Database Schema (SQL)", font: "Calibri", size: 20, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "4. Full API Endpoint Reference", font: "Calibri", size: 20, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "5. Family Notes & Compliments Module", font: "Calibri", size: 20, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "6. Reception & Event Management", font: "Calibri", size: 20, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "7. Frontend Component Structure", font: "Calibri", size: 20, color: DARK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "8. Deployment Guide", font: "Calibri", size: 20, color: DARK })] }),
        spacer(300),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: `Version 2.0  ·  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, font: "Calibri", size: 18, color: GRAY, italics: true })] }),
      ]
    },

    // ══════════════════════════════════════════════════════
    // MAIN CONTENT
    // ══════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 6 } },
              children: [
                new TextRun({ text: "Online Wedding Invitation System  ·  Technical Specification", font: "Calibri", size: 18, color: GRAY, italics: true })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 6 } },
              children: [
                new TextRun({ text: "Page ", font: "Calibri", size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: GOLD, bold: true }),
                new TextRun({ text: "  of  ", font: "Calibri", size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 18, color: GRAY }),
              ]
            })
          ]
        })
      },
      children: [

        // ── SECTION 1: OVERVIEW ─────────────────────────────
        heading1("1. Project Overview"),
        para("The Online Wedding Invitation System is a full-stack web application enabling couples to create elegant, shareable digital wedding invitations with full RSVP management, family notes, reception event tracking, and a real-time admin dashboard."),
        spacer(80),

        heading2("1.1 Technology Stack"),
        sectionTable([
          labelValue("Backend Framework", "FastAPI (Python 3.10+)", "Modern async REST API"),
          labelValue("Frontend", "React 18 + TypeScript + Vite", "Component-based SPA"),
          labelValue("Database", "PostgreSQL 15+", "Relational, ACID-compliant"),
          labelValue("ORM / Driver", "SQLAlchemy 2.0 async + asyncpg", "Async database layer"),
          labelValue("Migrations", "Alembic", "Schema version control"),
          labelValue("Styling", "Tailwind CSS", "Utility-first CSS"),
          labelValue("QR Codes", "python-qrcode + qrcode.react", "Auto-generated per invitation"),
          labelValue("ID Generation", "nanoid", "Short unique invitation codes"),
          labelValue("ASGI Server", "Uvicorn", "Production-ready"),
        ]),
        spacer(100),

        heading2("1.2 Core Features"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Create beautiful digital wedding invitations with couple and family details", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Family notes module: compliments and messages from siblings, parents, relatives", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Separate ceremony and reception event management with venue map URLs", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Generate unique shareable links and QR codes per invitation", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "RSVP system with guest count, dietary preferences, and notes", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Admin dashboard with real-time statistics and guest management", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "RSVP deadline enforcement and dress code communication", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Mobile-responsive design for all devices", font: "Calibri", size: 22, color: DARK })] }),
        spacer(160),

        // ── SECTION 2: DATA FIELDS ───────────────────────────
        heading1("2. Complete Data Field Specifications"),
        para("All data fields collected by the system are documented below, organized by module. Each field includes type, whether it is required, and example values."),
        spacer(80),

        heading2("2.1 Couple Information"),
        sectionTable([
          labelValue("bride_name", "Bride's full name (required, max 100 chars)", "e.g. Priya Menon"),
          labelValue("groom_name", "Groom's full name (required, max 100 chars)", "e.g. Arjun Sharma"),
          labelValue("bride_parents", "Bride's parents full names", "e.g. Mr. & Mrs. Suresh Menon"),
          labelValue("groom_parents", "Groom's parents full names", "e.g. Mr. & Mrs. Rajesh Sharma"),
          labelValue("bride_siblings", "Bride's siblings names (comma-separated)", "e.g. Rahul Menon, Deepa Menon"),
          labelValue("groom_siblings", "Groom's siblings names (comma-separated)", "e.g. Ananya Sharma"),
          labelValue("bride_family_note", "A warm note/compliment from bride's family", "e.g. 'We welcome Arjun with open hearts...'"),
          labelValue("groom_family_note", "A warm note/compliment from groom's family", "e.g. 'Priya brings joy to our family...'"),
        ]),
        spacer(120),
        note("Family notes appear on the digital invitation below the couple's names. They add a personal, heartfelt touch from both families and can be written in any language."),
        spacer(120),

        heading2("2.2 Ceremony Details"),
        sectionTable([
          labelValue("wedding_date", "Date of the wedding ceremony (DATE)", "e.g. 2025-02-14"),
          labelValue("wedding_time", "Time of ceremony start (VARCHAR 20)", "e.g. 10:30 AM"),
          labelValue("wedding_time_end", "Estimated end time of ceremony", "e.g. 01:00 PM"),
          labelValue("venue_name", "Name of ceremony venue (required)", "e.g. Sri Padmanabhaswamy Temple Hall"),
          labelValue("venue_address", "Full postal address of ceremony venue", "e.g. East Fort, Thiruvananthapuram, Kerala 695023"),
          labelValue("venue_map_url", "Google Maps or navigation URL for ceremony", "e.g. https://maps.google.com/?q=..."),
          labelValue("venue_phone", "Venue contact phone number", "e.g. +91 471 245 0233"),
          labelValue("dress_code", "Attire guidance for guests", "e.g. Traditional Indian attire preferred"),
          labelValue("special_message", "Main invitation message / personalized note", "e.g. 'With the blessings of our elders...'"),
        ]),
        spacer(120),

        heading2("2.3 Reception Details"),
        sectionTable([
          labelValue("reception_date", "Date of the reception event", "e.g. 2025-02-14 or 2025-02-15"),
          labelValue("reception_time", "Reception start time", "e.g. 07:00 PM"),
          labelValue("reception_time_end", "Reception end time (optional)", "e.g. 11:00 PM"),
          labelValue("reception_venue_name", "Name of the reception hall/hotel", "e.g. Leela Kovalam Grand Banquet"),
          labelValue("reception_venue_address", "Full address of reception venue", "e.g. Beach Road, Kovalam, Kerala 695527"),
          labelValue("reception_map_url", "Google Maps link for reception venue", "e.g. https://maps.google.com/?q=..."),
          labelValue("reception_phone", "Reception venue contact number", "e.g. +91 471 248 0101"),
          labelValue("reception_note", "Special note for reception guests", "e.g. 'Dinner and cultural program to follow'"),
        ]),
        spacer(120),
        note("If the ceremony and reception are at the same venue on the same day, reception fields can be marked as NULL. The frontend will hide the reception section automatically if no reception data is provided."),
        spacer(120),

        heading2("2.4 Family Notes & Compliments Module"),
        para("This module allows multiple named family members to add personal messages that appear on the invitation. Unlike the single bride/groom family notes, this table allows any number of entries — siblings, uncles, aunts, grandparents, close friends of family."),
        spacer(80),
        sectionTable([
          labelValue("relation_type", "Relationship to the couple", "e.g. Bride's Sister, Groom's Uncle"),
          labelValue("member_name", "Full name of the family member", "e.g. Deepa Menon"),
          labelValue("message", "Personal compliment or blessing message", "e.g. 'Wishing my sister a lifetime of happiness'"),
          labelValue("display_order", "Order to show on the invitation (integer)", "e.g. 1, 2, 3..."),
          labelValue("is_visible", "Whether to show this note on the invitation", "true / false"),
          labelValue("language", "Language of the message (optional)", "e.g. English, Malayalam, Hindi"),
        ]),
        spacer(120),
        note("Relation types supported: Bride's Mother, Bride's Father, Bride's Sister, Bride's Brother, Groom's Mother, Groom's Father, Groom's Sister, Groom's Brother, Maternal Uncle, Paternal Aunt, Family Friend, and Custom."),
        spacer(120),

        heading2("2.5 RSVP Fields"),
        sectionTable([
          labelValue("guest_name", "Full name of guest responding", "e.g. Kavitha Nair"),
          labelValue("attending", "Whether the guest will attend (boolean)", "true / false"),
          labelValue("guest_count", "Total number of people attending with guest", "e.g. 2"),
          labelValue("dietary_preference", "Dietary needs", "e.g. Vegetarian, Vegan, No restrictions"),
          labelValue("will_attend_reception", "Will they attend the reception too?", "true / false"),
          labelValue("message_to_couple", "Optional personal message to couple", "e.g. 'So happy for you both!'"),
          labelValue("phone_number", "Guest's contact number (optional)", "e.g. +91 9876543210"),
          labelValue("response_date", "Timestamp of RSVP submission (auto)", "e.g. 2025-01-20 14:32:00"),
        ]),
        spacer(120),

        heading2("2.6 Invitation Metadata"),
        sectionTable([
          labelValue("invitation_id", "Short unique code (nanoid, 10 chars)", "e.g. aB3xYz9mNq"),
          labelValue("invitation_link", "Full shareable URL", "e.g. https://yourdomain.com/invite/aB3xYz9mNq"),
          labelValue("qr_code_data", "Base64-encoded QR code image (PNG)", "Stored in DB, rendered as <img>"),
          labelValue("rsvp_deadline", "Last date for RSVPs", "e.g. 2025-02-07"),
          labelValue("max_guests", "Maximum guest cap (optional)", "e.g. 200"),
          labelValue("is_active", "Whether invitation link is live", "true / false"),
          labelValue("created_at", "Auto timestamp of creation", "e.g. 2025-01-01 09:00:00"),
          labelValue("updated_at", "Auto timestamp of last update", "e.g. 2025-01-15 11:30:00"),
        ]),
        spacer(160),

        // ── SECTION 3: DATABASE SCHEMA ───────────────────────
        heading1("3. PostgreSQL Database Schema"),
        spacer(60),

        heading2("3.1 Table: invitations"),
        dbTable([
          dbFieldRow("id", "UUID", "NO", "Primary key — auto-generated UUID"),
          dbFieldRow("invitation_id", "VARCHAR(20)", "NO", "Unique short code used in shareable URL"),
          dbFieldRow("bride_name", "VARCHAR(100)", "NO", "Bride's full name"),
          dbFieldRow("groom_name", "VARCHAR(100)", "NO", "Groom's full name"),
          dbFieldRow("bride_parents", "VARCHAR(300)", "YES", "Bride's parents names"),
          dbFieldRow("groom_parents", "VARCHAR(300)", "YES", "Groom's parents names"),
          dbFieldRow("bride_siblings", "TEXT", "YES", "Comma-separated sibling names"),
          dbFieldRow("groom_siblings", "TEXT", "YES", "Comma-separated sibling names"),
          dbFieldRow("bride_family_note", "TEXT", "YES", "Short note from bride's family"),
          dbFieldRow("groom_family_note", "TEXT", "YES", "Short note from groom's family"),
          dbFieldRow("wedding_date", "DATE", "NO", "Ceremony date"),
          dbFieldRow("wedding_time", "VARCHAR(20)", "NO", "Ceremony start time"),
          dbFieldRow("wedding_time_end", "VARCHAR(20)", "YES", "Ceremony end time"),
          dbFieldRow("venue_name", "VARCHAR(200)", "NO", "Ceremony venue name"),
          dbFieldRow("venue_address", "TEXT", "NO", "Ceremony venue address"),
          dbFieldRow("venue_map_url", "VARCHAR(500)", "YES", "Google Maps URL for ceremony"),
          dbFieldRow("venue_phone", "VARCHAR(30)", "YES", "Venue contact phone"),
          dbFieldRow("reception_date", "DATE", "YES", "Reception date"),
          dbFieldRow("reception_time", "VARCHAR(20)", "YES", "Reception start time"),
          dbFieldRow("reception_time_end", "VARCHAR(20)", "YES", "Reception end time"),
          dbFieldRow("reception_venue_name", "VARCHAR(200)", "YES", "Reception venue name"),
          dbFieldRow("reception_venue_address", "TEXT", "YES", "Reception venue address"),
          dbFieldRow("reception_map_url", "VARCHAR(500)", "YES", "Google Maps URL for reception"),
          dbFieldRow("reception_phone", "VARCHAR(30)", "YES", "Reception venue phone"),
          dbFieldRow("reception_note", "TEXT", "YES", "Extra note for reception guests"),
          dbFieldRow("special_message", "TEXT", "YES", "Main invite message from couple"),
          dbFieldRow("dress_code", "VARCHAR(100)", "YES", "Dress code guidance for guests"),
          dbFieldRow("rsvp_deadline", "DATE", "YES", "Last date to submit RSVP"),
          dbFieldRow("max_guests", "INTEGER", "YES", "Guest cap (NULL = unlimited)"),
          dbFieldRow("is_active", "BOOLEAN", "NO", "Whether invite link is active (default TRUE)"),
          dbFieldRow("invitation_link", "VARCHAR(500)", "NO", "Full shareable URL"),
          dbFieldRow("qr_code_data", "TEXT", "NO", "Base64 QR code PNG data"),
          dbFieldRow("created_at", "TIMESTAMP", "NO", "Creation timestamp (auto)"),
          dbFieldRow("updated_at", "TIMESTAMP", "NO", "Last update timestamp (auto)"),
        ]),
        spacer(120),

        heading2("3.2 Table: family_notes"),
        para("Stores multiple personal messages from individual family members, linked to an invitation."),
        spacer(60),
        dbTable([
          dbFieldRow("id", "UUID", "NO", "Primary key"),
          dbFieldRow("invitation_id", "VARCHAR(20)", "NO", "FK → invitations.invitation_id"),
          dbFieldRow("member_name", "VARCHAR(100)", "NO", "Full name of the family member"),
          dbFieldRow("relation_type", "VARCHAR(100)", "NO", "e.g. Bride's Sister, Groom's Uncle"),
          dbFieldRow("message", "TEXT", "NO", "Personal compliment or blessing text"),
          dbFieldRow("display_order", "INTEGER", "NO", "Display sort order (default 0)"),
          dbFieldRow("is_visible", "BOOLEAN", "NO", "Show on invitation (default TRUE)"),
          dbFieldRow("language", "VARCHAR(50)", "YES", "Language of the message"),
          dbFieldRow("created_at", "TIMESTAMP", "NO", "Auto timestamp"),
        ]),
        spacer(120),

        heading2("3.3 Table: rsvps"),
        dbTable([
          dbFieldRow("id", "UUID", "NO", "Primary key"),
          dbFieldRow("invitation_id", "VARCHAR(20)", "NO", "FK → invitations.invitation_id"),
          dbFieldRow("guest_name", "VARCHAR(100)", "YES", "Guest's full name"),
          dbFieldRow("attending", "BOOLEAN", "NO", "Attending the ceremony?"),
          dbFieldRow("guest_count", "INTEGER", "NO", "Total guests attending (default 0)"),
          dbFieldRow("dietary_preference", "VARCHAR(100)", "YES", "e.g. Vegetarian, Vegan, None"),
          dbFieldRow("will_attend_reception", "BOOLEAN", "YES", "Will also attend reception?"),
          dbFieldRow("message_to_couple", "TEXT", "YES", "Personal congratulatory message"),
          dbFieldRow("phone_number", "VARCHAR(20)", "YES", "Guest contact number"),
          dbFieldRow("response_date", "TIMESTAMP", "NO", "Submission timestamp (auto)"),
        ]),
        spacer(160),

        heading2("3.4 CREATE TABLE SQL Statements"),
        note("Run these SQL statements in your PostgreSQL database to create all required tables. Alembic can also auto-generate these from the SQLAlchemy models."),
        spacer(80),

        new Paragraph({
          spacing: { before: 80, after: 80 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          indent: { left: 0 },
          children: [
            new TextRun({ text: "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";", font: "Courier New", size: 18, color: "A8FF78", break: 0 }),
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          children: [new TextRun({ text: "", font: "Courier New", size: 18, color: "A8FF78" })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          children: [new TextRun({ text: "CREATE TABLE invitations (", font: "Courier New", size: 18, color: "78BFFF" })]
        }),
        ...[
          "  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,",
          "  invitation_id   VARCHAR(20) UNIQUE NOT NULL,",
          "  bride_name      VARCHAR(100) NOT NULL,",
          "  groom_name      VARCHAR(100) NOT NULL,",
          "  bride_parents   VARCHAR(300),",
          "  groom_parents   VARCHAR(300),",
          "  bride_siblings  TEXT,",
          "  groom_siblings  TEXT,",
          "  bride_family_note TEXT,",
          "  groom_family_note TEXT,",
          "  wedding_date    DATE NOT NULL,",
          "  wedding_time    VARCHAR(20) NOT NULL,",
          "  wedding_time_end VARCHAR(20),",
          "  venue_name      VARCHAR(200) NOT NULL,",
          "  venue_address   TEXT NOT NULL,",
          "  venue_map_url   VARCHAR(500),",
          "  venue_phone     VARCHAR(30),",
          "  reception_date  DATE,",
          "  reception_time  VARCHAR(20),",
          "  reception_time_end VARCHAR(20),",
          "  reception_venue_name VARCHAR(200),",
          "  reception_venue_address TEXT,",
          "  reception_map_url VARCHAR(500),",
          "  reception_phone VARCHAR(30),",
          "  reception_note  TEXT,",
          "  special_message TEXT,",
          "  dress_code      VARCHAR(100),",
          "  rsvp_deadline   DATE,",
          "  max_guests      INTEGER,",
          "  is_active       BOOLEAN DEFAULT TRUE NOT NULL,",
          "  invitation_link VARCHAR(500) NOT NULL,",
          "  qr_code_data    TEXT NOT NULL,",
          "  created_at      TIMESTAMP DEFAULT NOW() NOT NULL,",
          "  updated_at      TIMESTAMP DEFAULT NOW() NOT NULL",
          ");",
        ].map(line => new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "E0E0E0" })]
        })),
        spacer(60),
        ...[
          "CREATE TABLE family_notes (",
          "  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,",
          "  invitation_id   VARCHAR(20) REFERENCES invitations(invitation_id) ON DELETE CASCADE,",
          "  member_name     VARCHAR(100) NOT NULL,",
          "  relation_type   VARCHAR(100) NOT NULL,",
          "  message         TEXT NOT NULL,",
          "  display_order   INTEGER DEFAULT 0 NOT NULL,",
          "  is_visible      BOOLEAN DEFAULT TRUE NOT NULL,",
          "  language        VARCHAR(50),",
          "  created_at      TIMESTAMP DEFAULT NOW() NOT NULL",
          ");",
        ].map(line => new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "E0E0E0" })]
        })),
        spacer(60),
        ...[
          "CREATE TABLE rsvps (",
          "  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,",
          "  invitation_id         VARCHAR(20) REFERENCES invitations(invitation_id) ON DELETE CASCADE,",
          "  guest_name            VARCHAR(100),",
          "  attending             BOOLEAN NOT NULL,",
          "  guest_count           INTEGER DEFAULT 0 NOT NULL,",
          "  dietary_preference    VARCHAR(100),",
          "  will_attend_reception BOOLEAN,",
          "  message_to_couple     TEXT,",
          "  phone_number          VARCHAR(20),",
          "  response_date         TIMESTAMP DEFAULT NOW() NOT NULL",
          ");",
        ].map(line => new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "E0E0E0" })]
        })),
        spacer(160),

        // ── SECTION 4: API ENDPOINTS ─────────────────────────
        heading1("4. API Endpoint Reference"),
        para("All endpoints are prefixed with /api. The backend runs on port 8000 by default. Frontend proxies API calls through Vite dev server in development."),
        spacer(80),

        heading2("4.1 Invitation Endpoints"),
        apiTable([
          apiRow("POST", "/api/invitations/", "Create a new invitation", "InvitationCreate body"),
          apiRow("GET", "/api/invitations/", "List all invitations (admin)", "—"),
          apiRow("GET", "/api/invitations/{id}", "Get single invitation by invitation_id", "—"),
          apiRow("PUT", "/api/invitations/{id}", "Update invitation details", "InvitationUpdate body"),
          apiRow("DELETE", "/api/invitations/{id}", "Delete invitation and all related data", "—"),
          apiRow("PATCH", "/api/invitations/{id}/toggle", "Activate or deactivate invite link", "—"),
        ]),
        spacer(120),

        heading2("4.2 Family Notes Endpoints"),
        apiTable([
          apiRow("POST", "/api/invitations/{id}/notes/", "Add a family note to an invitation", "FamilyNoteCreate body"),
          apiRow("GET", "/api/invitations/{id}/notes/", "Get all visible family notes for invite", "—"),
          apiRow("PUT", "/api/notes/{note_id}", "Edit an existing family note", "FamilyNoteUpdate body"),
          apiRow("DELETE", "/api/notes/{note_id}", "Delete a family note", "—"),
          apiRow("PATCH", "/api/notes/{note_id}/visibility", "Toggle note visibility", "—"),
        ]),
        spacer(120),

        heading2("4.3 RSVP Endpoints"),
        apiTable([
          apiRow("POST", "/api/rsvp/{id}", "Submit RSVP for an invitation", "RSVPSubmit body"),
          apiRow("GET", "/api/rsvp/{id}/list", "List all RSVPs for an invitation (admin)", "—"),
          apiRow("GET", "/api/rsvp/{id}/stats", "Get RSVP statistics and counts", "—"),
          apiRow("DELETE", "/api/rsvp/{rsvp_id}", "Delete a specific RSVP entry", "—"),
        ]),
        spacer(120),

        heading2("4.4 Request / Response Schemas"),
        heading3("InvitationCreate (POST /api/invitations/)"),
        note("All fields marked * are required. All others are optional but recommended."),
        spacer(60),
        sectionTable([
          labelValue("bride_name *", "string, max 100", ""),
          labelValue("groom_name *", "string, max 100", ""),
          labelValue("bride_parents", "string, max 300", ""),
          labelValue("groom_parents", "string, max 300", ""),
          labelValue("bride_siblings", "string", "Comma-separated"),
          labelValue("groom_siblings", "string", "Comma-separated"),
          labelValue("bride_family_note", "string (text)", ""),
          labelValue("groom_family_note", "string (text)", ""),
          labelValue("wedding_date *", "date (YYYY-MM-DD)", ""),
          labelValue("wedding_time *", "string", "e.g. '10:30 AM'"),
          labelValue("wedding_time_end", "string", ""),
          labelValue("venue_name *", "string, max 200", ""),
          labelValue("venue_address *", "string", ""),
          labelValue("venue_map_url", "string URL", ""),
          labelValue("venue_phone", "string", ""),
          labelValue("reception_date", "date", ""),
          labelValue("reception_time", "string", ""),
          labelValue("reception_time_end", "string", ""),
          labelValue("reception_venue_name", "string", ""),
          labelValue("reception_venue_address", "string", ""),
          labelValue("reception_map_url", "string URL", ""),
          labelValue("reception_phone", "string", ""),
          labelValue("reception_note", "string", ""),
          labelValue("special_message", "string", ""),
          labelValue("dress_code", "string, max 100", ""),
          labelValue("rsvp_deadline", "date", ""),
          labelValue("max_guests", "integer", ""),
        ]),
        spacer(100),

        heading3("FamilyNoteCreate (POST /api/invitations/{id}/notes/)"),
        sectionTable([
          labelValue("member_name *", "string, max 100", "e.g. Deepa Menon"),
          labelValue("relation_type *", "string, max 100", "e.g. Bride's Sister"),
          labelValue("message *", "string (text)", "The blessing or compliment"),
          labelValue("display_order", "integer", "Default 0"),
          labelValue("is_visible", "boolean", "Default true"),
          labelValue("language", "string", "e.g. English, Malayalam"),
        ]),
        spacer(100),

        heading3("RSVPSubmit (POST /api/rsvp/{id})"),
        sectionTable([
          labelValue("guest_name", "string, max 100", ""),
          labelValue("attending *", "boolean", "true or false"),
          labelValue("guest_count", "integer", "Default 0"),
          labelValue("dietary_preference", "string", "Vegetarian / Vegan / None"),
          labelValue("will_attend_reception", "boolean", ""),
          labelValue("message_to_couple", "string", ""),
          labelValue("phone_number", "string", ""),
        ]),
        spacer(160),

        // ── SECTION 5: FAMILY NOTES ──────────────────────────
        heading1("5. Family Notes & Compliments Module"),
        para("The Family Notes module is a key differentiator of this system. It allows the invitation to display warm, personal messages from individual family members — making the digital invitation feel like a traditional printed one that lists family names."),
        spacer(80),

        heading2("5.1 How It Works"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Admin adds notes via the dashboard for each family member (bride side / groom side)", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Each note has a relation_type (Bride's Sister, Groom's Uncle, etc.) and member_name", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Notes are fetched and displayed on the guest-facing invitation in display_order", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Individual notes can be toggled visible/hidden without deleting them", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Supports multilingual messages (Malayalam, Hindi, Tamil, English, etc.)", font: "Calibri", size: 22, color: DARK })] }),
        spacer(80),

        heading2("5.2 Supported Relation Types"),
        sectionTable([
          labelValue("Bride's Mother", "Displayed as: From the Bride's Mother", ""),
          labelValue("Bride's Father", "Displayed as: From the Bride's Father", ""),
          labelValue("Bride's Sister", "Displayed as: From the Bride's Sister", ""),
          labelValue("Bride's Brother", "Displayed as: From the Bride's Brother", ""),
          labelValue("Groom's Mother", "Displayed as: From the Groom's Mother", ""),
          labelValue("Groom's Father", "Displayed as: From the Groom's Father", ""),
          labelValue("Groom's Sister", "Displayed as: From the Groom's Sister", ""),
          labelValue("Groom's Brother", "Displayed as: From the Groom's Brother", ""),
          labelValue("Maternal Uncle", "Displayed with member name and relation", ""),
          labelValue("Paternal Aunt", "Displayed with member name and relation", ""),
          labelValue("Grandparent", "Displayed with member name and relation", ""),
          labelValue("Family Friend", "Displayed with member name and relation", ""),
          labelValue("Custom", "Admin defines custom label", "e.g. 'From the Sharma Household'"),
        ]),
        spacer(160),

        // ── SECTION 6: FRONTEND COMPONENTS ──────────────────
        heading1("6. Frontend Component Structure"),
        para("The React TypeScript frontend is organized into pages, components, and service layers. All components use Tailwind CSS for styling."),
        spacer(80),

        heading2("6.1 Pages"),
        sectionTable([
          labelValue("/admin", "AdminPage.tsx", "Dashboard for managing all invitations"),
          labelValue("/admin/create", "CreateInvitationPage.tsx", "Multi-step form to create an invitation"),
          labelValue("/admin/edit/:id", "EditInvitationPage.tsx", "Edit existing invitation and family notes"),
          labelValue("/invite/:id", "GuestViewPage.tsx", "Public guest-facing invitation page"),
          labelValue("/invite/:id/rsvp", "RSVPPage.tsx", "Guest RSVP submission form"),
        ]),
        spacer(80),

        heading2("6.2 Key Components"),
        sectionTable([
          labelValue("InvitationCard.tsx", "Renders the beautiful digital invitation", "Shows couple, family, ceremony, reception"),
          labelValue("FamilyNotesSection.tsx", "Displays scrollable family notes/compliments", "Groups by bride / groom side"),
          labelValue("CeremonySection.tsx", "Ceremony date, time, venue, map button", "Shows Google Maps link"),
          labelValue("ReceptionSection.tsx", "Reception details (hidden if null)", "Conditionally rendered"),
          labelValue("RSVPForm.tsx", "Guest RSVP form with all fields", "Submits to POST /api/rsvp/{id}"),
          labelValue("QRCodeDisplay.tsx", "Shows QR code with download button", "qrcode.react library"),
          labelValue("AdminDashboard.tsx", "Stats, invitation list, quick actions", "Real-time count display"),
          labelValue("FamilyNoteManager.tsx", "Add/edit/reorder/delete family notes", "Drag-and-drop order support"),
        ]),
        spacer(160),

        // ── SECTION 7: DEPLOYMENT ────────────────────────────
        heading1("7. Deployment Guide"),
        spacer(60),

        heading2("7.1 Environment Variables"),
        sectionTable([
          labelValue("DATABASE_URL", "PostgreSQL async connection string", "postgresql+asyncpg://user:pass@host:5432/db"),
          labelValue("BASE_URL", "Frontend base URL for invitation links", "https://yourdomain.com"),
          labelValue("CORS_ORIGINS", "JSON array of allowed frontend origins", '["https://yourdomain.com"]'),
          labelValue("SECRET_KEY", "Admin auth secret (if auth is added)", "Long random string"),
        ]),
        spacer(80),

        heading2("7.2 Startup Commands"),
        ...[
          "# Backend",
          "cd backend",
          "pip install -r requirements.txt",
          "alembic upgrade head          # Run database migrations",
          "uvicorn app.main:app --host 0.0.0.0 --port 8000",
          "",
          "# Frontend",
          "cd frontend",
          "npm install",
          "npm run build                 # Build for production",
          "npm run preview               # Preview production build",
        ].map(line => new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          children: [new TextRun({ text: line || " ", font: "Courier New", size: 18, color: line.startsWith("#") ? "7EC8A4" : "E0E0E0" })]
        })),
        spacer(120),

        heading2("7.3 Alembic Migration Commands"),
        ...[
          "alembic init alembic                    # Initialize Alembic",
          "alembic revision --autogenerate -m 'init'  # Generate migration",
          "alembic upgrade head                    # Apply all migrations",
          "alembic downgrade -1                    # Roll back one migration",
          "alembic history                         # View migration history",
        ].map(line => new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 8 } },
          children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "E0E0E0" })]
        })),
        spacer(120),

        heading2("7.4 Production Checklist"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "PostgreSQL: use a managed DB (Supabase, Railway, Render, AWS RDS)", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Enable HTTPS on both frontend and backend", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Set CORS_ORIGINS to exact production frontend domain only", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Run alembic upgrade head before every deployment", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Store qr_code_data as base64 TEXT or migrate to object storage (S3) for large scale", font: "Calibri", size: 22, color: DARK })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "Add rate limiting to POST /api/rsvp/ to prevent spam submissions", font: "Calibri", size: 22, color: DARK })] }),
        spacer(200),

        // ── CLOSING ──────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 8 } },
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: "✦  End of Document  ✦", font: "Georgia", size: 24, color: GOLD, italics: true })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: "Online Wedding Invitation System — Technical Specification v2.0", font: "Calibri", size: 18, color: GRAY })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(__dirname, "Wedding_Invitation_System_Specification.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Done. Saved to ${outputPath}`);
});
