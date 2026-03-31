import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceData {
  id: string;
  clientName: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

interface BusinessInfo {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
}

interface PdfLabels {
  invoice: string;
  client: string;
  date: string;
  status: string;
  service: string;
  qty: string;
  unitPrice: string;
  total: string;
  thankYou: string;
}

export async function exportInvoicePdf(
  invoice: InvoiceData,
  business: BusinessInfo,
  labels: PdfLabels,
  formatCurrency: (n: number) => string
) {
  // Fetch invoice items
  const { data: items } = await supabase
    .from("invoice_items")
    .select("description, quantity, unit_price, total")
    .eq("invoice_id", invoice.id);

  const doc = new jsPDF();

  // Header - Business info
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(business.businessName, 20, 25);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  let y = 32;
  if (business.businessAddress) { doc.text(business.businessAddress, 20, y); y += 5; }
  if (business.businessPhone) { doc.text(business.businessPhone, 20, y); y += 5; }
  if (business.businessEmail) { doc.text(business.businessEmail, 20, y); y += 5; }

  // Invoice title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(230, 149, 0); // amber/gold
  doc.text(labels.invoice.toUpperCase(), 190, 25, { align: "right" });

  // Invoice meta
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.setFont("helvetica", "normal");
  const metaY = 35;
  doc.text(`${labels.date}: ${new Date(invoice.createdAt).toLocaleDateString()}`, 190, metaY, { align: "right" });
  doc.text(`${labels.status}: ${invoice.status.toUpperCase()}`, 190, metaY + 6, { align: "right" });
  doc.text(`# ${invoice.id.slice(0, 8).toUpperCase()}`, 190, metaY + 12, { align: "right" });

  // Client box
  const boxY = y + 8;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, boxY, 170, 18, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(labels.client, 25, boxY + 6);
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.clientName, 25, boxY + 13);

  // Table
  const tableY = boxY + 26;
  const tableData = (items || []).map((item) => [
    item.description,
    String(item.quantity),
    formatCurrency(Number(item.unit_price)),
    formatCurrency(Number(item.total)),
  ]);

  (doc as any).autoTable({
    startY: tableY,
    head: [[labels.service, labels.qty, labels.unitPrice, labels.total]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [230, 149, 0], textColor: 255, fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 10, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Total
  doc.setFillColor(230, 149, 0);
  doc.roundedRect(120, finalY, 70, 12, 2, 2, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text(`${labels.total}: ${formatCurrency(invoice.totalAmount)}`, 155, finalY + 8, { align: "center" });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.setFont("helvetica", "italic");
  doc.text(labels.thankYou, 105, finalY + 28, { align: "center" });

  doc.save(`invoice-${invoice.id.slice(0, 8)}.pdf`);
}
