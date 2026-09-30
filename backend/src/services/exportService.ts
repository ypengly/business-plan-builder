import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun } from "docx";
import type { PassThrough } from "stream";

export interface ExportSection {
  title: string;
  content: string;
}

export interface ExportPlanData {
  businessName: string;
  preparedFor?: string;
  date: string;
  sections: ExportSection[];
}

/** Streams a formatted PDF (cover page + table of contents + sections + page numbers/footer) to the given writable stream. */
export function generatePDF(data: ExportPlanData, stream: PassThrough | NodeJS.WritableStream) {
  const doc = new PDFDocument({ size: "A4", margin: 56, bufferPages: true });
  doc.pipe(stream);

  // Cover page
  doc.fontSize(28).font("Helvetica-Bold").text(data.businessName, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(16).font("Helvetica").text("Business Plan", { align: "center" });
  doc.moveDown(4);
  doc.fontSize(11).text(`Prepared: ${data.date}`, { align: "center" });
  if (data.preparedFor) doc.text(`Prepared for: ${data.preparedFor}`, { align: "center" });

  // Table of contents
  doc.addPage();
  doc.fontSize(18).font("Helvetica-Bold").text("Table of Contents");
  doc.moveDown(1);
  data.sections.forEach((s, i) => {
    doc.fontSize(12).font("Helvetica").text(`${i + 1}. ${s.title}`);
  });

  // Sections
  data.sections.forEach((section) => {
    doc.addPage();
    doc.fontSize(18).font("Helvetica-Bold").text(section.title);
    doc.moveDown(0.75);
    doc.fontSize(11).font("Helvetica").text(section.content, { align: "left", lineGap: 4 });
  });

  // Footer with page numbers on every page
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(9).fillColor("#666666").text(
      `${data.businessName} — Business Plan | Page ${i + 1} of ${range.count}`,
      56,
      doc.page.height - 40,
      { align: "center", width: doc.page.width - 112 }
    );
  }

  doc.end();
}

/** Builds a .docx buffer with a title page and one heading+paragraph per section. */
export async function generateDOCX(data: ExportPlanData): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: data.businessName, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: "Business Plan", heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: `Prepared: ${data.date}` }),
    new Paragraph({ text: "" }),
  ];

  for (const section of data.sections) {
    children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 }));
    for (const para of section.content.split("\n").filter(Boolean)) {
      children.push(new Paragraph({ children: [new TextRun(para)] }));
    }
    children.push(new Paragraph({ text: "" }));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

/** Simple comparison-matrix table, reused by the DOCX export for competitor comparisons. */
export function buildComparisonTable(rows: string[][]): Table {
  return new Table({
    rows: rows.map(
      (r) =>
        new TableRow({
          children: r.map((cell) => new TableCell({ children: [new Paragraph(cell)] })),
        })
    ),
  });
}
