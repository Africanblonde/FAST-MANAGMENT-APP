

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, Client, Vehicle, LayoutSettings } from '../types';
import { formatCurrency } from '../utils/helpers';

interface CellHookData {
    row: {
        index: number;
    };
    cell: {
        styles: {
            fontStyle?: string;
            fontSize?: number;
            lineWidth?: number | { top: number };
            lineColor?: [number, number, number];
        };
    };
}
const fetchAndEncodeImage = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error fetching or encoding image:", error);
        return null;
    }
};

export const generateInvoicePdf = async (
  invoice: Invoice,
  client?: Client,
  vehicle?: Vehicle,
  layoutSettings?: LayoutSettings,
  logoUrl?: string | null,
  isCollectionInvoice: boolean = false
): Promise<void> => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPos = 20;
    const margin = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Default Settings
    const defaultSettings: LayoutSettings = {
      companyName: 'Fast Management',
      footerAddress: 'Maputo, Moçambique',
      footerContact: 'info@fastmanagement.com',
      footerNuit: '123456789',
      footerMessage: 'Obrigado pela sua preferência!',
      invoiceTitle: 'FATURA',
      quotationTitle: 'ORÇAMENTO',
      collectionInvoiceTitle: 'FATURA DE COBRANÇA',
      taxEnabled: false, taxName: 'IVA', taxRate: 17,
      invoicePrefix: 'F-', invoiceNextNumber: 1,
    };
    const settings = layoutSettings || defaultSettings;
    const title = isCollectionInvoice ? settings.collectionInvoiceTitle : settings.invoiceTitle;

    // --- HEADER ---
    if (logoUrl) {
      const encodedLogo = await fetchAndEncodeImage(logoUrl);
      if (encodedLogo) {
        // getImageProperties may not be present in the typings; use any
        const imgProps = (doc as any).getImageProperties(encodedLogo);
        const imgWidth = 40;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(encodedLogo, 'PNG', margin, yPos, imgWidth, imgHeight);
      }
    } else {
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(settings.companyName, margin, yPos + 8);
    }
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text(title, pageWidth - margin, yPos, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${invoice.display_id || invoice.id}`, pageWidth - margin, yPos + 7, { align: 'right' });
    doc.text(`Data: ${new Date(invoice.issueDate).toLocaleDateString('pt-PT')}`, pageWidth - margin, yPos + 12, { align: 'right' });
    
    yPos += 40;

    // --- CLIENT & COMPANY INFO ---
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPos - 10, pageWidth - margin, yPos - 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Nossa Empresa', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.companyName, margin, yPos + 5);
    doc.text(`NUIT: ${settings.footerNuit}`, margin, yPos + 10);
    doc.text(`Tel: ${settings.footerContact}`, margin, yPos + 15);
    doc.text(`Endereço: ${settings.footerAddress}`, margin, yPos + 20);

    doc.setFont('helvetica', 'bold');
    doc.text('Facturado a', pageWidth / 2, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(client ? `${client.firstName} ${client.lastName}`.trim() : 'N/A', pageWidth / 2, yPos + 5);
    doc.text(`Contacto: ${client?.contact || 'N/A'}`, pageWidth / 2, yPos + 10);
    if(vehicle) {
        doc.text(`Viatura: ${vehicle.model} (${vehicle.licensePlate})`, pageWidth / 2, yPos + 15);
    }

    yPos += 30;

    // --- SEPARATE ITEMS INTO SECTIONS ---
    const servicosItems = invoice.items.filter(item => item.type === 'service');
    const fornecimentosItems = invoice.items.filter(item => item.type === 'part' || item.type === 'custom');

    const tableHead = [['Descrição', 'Qtd.', 'Preço Unit.', 'Total']];
// FIX: Added 'as const' to string literals for theme, fontStyle, and halign to satisfy the types expected by jspdf-autotable.
    const tableStyles = {
        theme: 'grid' as const,
        // FIX: Added 'as const' to `fillColor` to ensure it is treated as a tuple.
        headStyles: { fillColor: [41, 128, 185] as const, textColor: 255, fontStyle: 'bold' as const },
        // FIX: Added 'as const' to `lineColor` to ensure it is treated as a tuple.
        styles: { fontSize: 9, cellPadding: 2.5, lineColor: [222, 226, 230] as const, lineWidth: 0.1 },
        columnStyles: {
            1: { halign: 'center' as const },
            2: { halign: 'right' as const },
            3: { halign: 'right' as const }
        },
        margin: { left: margin, right: margin }
    };
    
    // --- FORNECIMENTOS TABLE ---
    if (fornecimentosItems.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Peças e Fornecimentos', margin, yPos);
        yPos += 7;

        // FIX: Cast body array to any to allow pushing styled cells, which is a feature of jspdf-autotable but can cause type errors.
        const fornecimentosBody: any[] = fornecimentosItems.map(item => [
            item.description,
            item.quantity,
            formatCurrency(item.unitPrice),
            formatCurrency(item.quantity * item.unitPrice)
        ]);
        const subtotalFornecimentos = fornecimentosItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        fornecimentosBody.push([
            { content: 'Subtotal Peças:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(subtotalFornecimentos), styles: { halign: 'right', fontStyle: 'bold' } }
        ]);
        
        autoTable(doc as any, {
            ...tableStyles,
            startY: yPos,
            head: tableHead,
            body: fornecimentosBody,
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- SERVIÇOS TABLE ---
    if (servicosItems.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Serviços Prestados', margin, yPos);
        yPos += 7;

        // FIX: Cast body array to any to allow pushing styled cells, which is a feature of jspdf-autotable but can cause type errors.
        const servicosBody: any[] = servicosItems.map(item => [
            item.description,
            item.quantity,
            formatCurrency(item.unitPrice),
            formatCurrency(item.quantity * item.unitPrice)
        ]);
        const subtotalServicos = servicosItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        servicosBody.push([
            { content: 'Subtotal Serviços:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: formatCurrency(subtotalServicos), styles: { halign: 'right', fontStyle: 'bold' } }
        ]);

        autoTable(doc as any, {
            ...tableStyles,
            startY: yPos,
            head: tableHead,
            body: servicosBody,
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
    }


    // --- TOTALS ---
    const discountAmount = invoice.discountType === 'percentage'
      ? (invoice.subtotal * ((invoice.discount || 0) / 100))
      : (invoice.discount || 0);
      
    const totalsData: (string | number)[][] = [['Subtotal:', formatCurrency(invoice.subtotal)]];
    if (discountAmount > 0) {
        totalsData.push(['Desconto:', `-${formatCurrency(discountAmount)}`]);
    }
    if (invoice.taxApplied) {
        totalsData.push([`${settings.taxName} (${settings.taxRate}%):`, formatCurrency(invoice.taxAmount)]);
    }
    totalsData.push(['TOTAL:', formatCurrency(invoice.total)]);

// FIX: Added 'as const' to string literals for theme, tableWidth, halign, and fontStyle to satisfy the types expected by jspdf-autotable.
autoTable(doc as any, {
    startY: yPos,
    body: totalsData,
    theme: 'grid' as const,
    tableWidth: 'wrap' as const,
    margin: { left: pageWidth - margin - 80 },
    styles: {
        fontSize: 10,
        cellPadding: 2,
        overflow: 'visible',
        lineWidth: 0.1,
        lineColor: [150, 150, 150] as const
    },
    columnStyles: {
        0: { halign: 'right' as const, cellWidth: 40 },
        1: { halign: 'right' as const, cellWidth: 40, fontStyle: 'bold' as const }
    },
    didParseCell: function (data: CellHookData) {
        if (data.row.index === totalsData.length - 1) { // Target the TOTAL row (last row)
            data.cell.styles.fontStyle = 'bold' as const;
            data.cell.styles.fontSize = 12;
            data.cell.styles.lineWidth = { top: 0.4 };
            data.cell.styles.lineColor = [50, 50, 50] as const;
        }
    }
});

    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // --- NOTES ---
    if (invoice.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Observações:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        const notes = doc.splitTextToSize(invoice.description, pageWidth - (margin * 2));
        doc.text(notes, margin, yPos + 5);
    }
    
    // --- FOOTER ---
    doc.setFontSize(9);
    doc.setTextColor(150);
    const footerText = `${settings.footerMessage}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

    // --- SAVE DOCUMENT ---
    doc.save(`fatura-${invoice.display_id || invoice.id}.pdf`);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Ocorreu um erro ao gerar o PDF. Verifique a consola para mais detalhes.');
  }
};

export default generateInvoicePdf;