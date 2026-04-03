'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportOptions {
  elementId: string;
  filename?: string;
  zone?: string;
}

export async function exportToPDF({ elementId, filename, zone }: PDFExportOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  // Temporarily force light mode for PDF capture
  const htmlEl = document.documentElement;
  const wasDark = htmlEl.classList.contains('dark');
  if (wasDark) htmlEl.classList.remove('dark');

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = { width: canvas.width, height: canvas.height };
    const ratio = imgProps.height / imgProps.width;
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = imgWidth * ratio;

    // Header
    pdf.setFillColor(50, 215, 75);
    pdf.rect(0, 0, pdfWidth, 18, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('SaisonPlus AI — Rapport d\'Analyse Satellite', 10, 12);
    pdf.setFontSize(8);
    pdf.text(`Zone : ${zone || 'N/A'} | Généré le : ${new Date().toLocaleString('fr')}`, pdfWidth - 10, 12, { align: 'right' });

    // Content
    let yOffset = 22;
    const pageContentHeight = pdfHeight - 22 - 15; // header + footer

    if (imgHeight <= pageContentHeight) {
      pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
    } else {
      // Multi-page support
      let remainingHeight = imgHeight;
      let sourceY = 0;
      const canvasWidthPx = canvas.width;
      const scaleFactor = imgWidth / canvasWidthPx;
      
      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageContentHeight / scaleFactor, canvas.height - sourceY);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvasWidthPx;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, sourceY, canvasWidthPx, sliceHeight, 0, 0, canvasWidthPx, sliceHeight);
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 10, yOffset, imgWidth, sliceHeight * scaleFactor);
        
        sourceY += sliceHeight;
        remainingHeight -= sliceHeight * scaleFactor;
        
        if (remainingHeight > 0) {
          pdf.addPage();
          yOffset = 10;
        }
      }
    }

    // Footer
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pdfHeight - 12, pdfWidth, 12, 'F');
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Données certifiées Sentinel-2B • Google Earth Engine • SaisonPlus AI', 10, pdfHeight - 4);
      pdf.text(`Page ${i}/${pageCount}`, pdfWidth - 10, pdfHeight - 4, { align: 'right' });
    }

    const safeName = filename || `SaisonPlus_Rapport_${zone || 'Export'}_${Date.now()}`;
    pdf.save(`${safeName}.pdf`);
  } finally {
    if (wasDark) htmlEl.classList.add('dark');
  }
}
