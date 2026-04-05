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

export function exportDataToPDF(data: any) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  
  // Header
  pdf.setFillColor(12, 24, 18);
  pdf.rect(0, 0, pdfWidth, 40, 'F');
  
  pdf.setTextColor(0, 215, 117);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text('SAISONPLUS AI', 20, 20);
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text('RAPPORT D\'ANALYSE AGRONOMIQUE COMPLET', 20, 30);
  
  let y = 50;
  
  // Info Bloc
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text(`Zone : ${data.zone || data.zoneName || 'N/A'}`, 20, y);
  y += 8;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Culture Recommandée : ${data.recommendedCrop}`, 20, y);
  y += 6;
  pdf.text(`Score de Santé Global : ${data.successScore}%`, 20, y);
  y += 6;
  pdf.text(`Date de Détection : ${data.detectionTimestamp ? new Date(data.detectionTimestamp).toLocaleString('fr') : new Date().toLocaleString('fr')}`, 20, y);
  
  y += 15;
  
  // Télémétrie
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(12, 24, 18);
  pdf.text('I. TÉLÉMÉTRIE SPATIALE & INDICES', 20, y);
  y += 8;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const ndvi = data.telemetryUsed?.ndvi ?? data.ndviIndexValue ?? 'N/A';
  const ndwi = data.telemetryUsed?.ndwi ?? 'N/A';
  const evi = data.telemetryUsed?.evi ?? 'N/A';
  
  pdf.text(`• Vigueur Végétative (NDVI) : ${typeof ndvi === 'number' ? ndvi.toFixed(3) : ndvi}`, 25, y); y += 6;
  pdf.text(`• Indice d'Eau (NDWI) : ${typeof ndwi === 'number' ? ndwi.toFixed(3) : ndwi}`, 25, y); y += 6;
  pdf.text(`• Biomasse (EVI) : ${typeof evi === 'number' ? evi.toFixed(3) : evi}`, 25, y); y += 6;
  pdf.text(`• Humidité Structurelle : ${data.telemetryUsed?.humidity ?? data.humidityLevel ?? 'N/A'} %`, 25, y); y += 6;
  pdf.text(`• Température : ${data.telemetryUsed?.temperature ?? 'N/A'} °C`, 25, y);
  
  y += 15;
  
  // Projection Rendement
  if (data.yieldProjection) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('II. PROJECTION DE RENDEMENT', 20, y);
      y += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`• Rendement Estimé : ${data.yieldProjection.estimatedYield} T/ha`, 25, y); y += 6;
      pdf.text(`• Potentiel Maximum : ${data.yieldProjection.maxPotential} T/ha`, 25, y); y += 6;
      pdf.text(`• Absorption N-P-K : N(${data.yieldProjection.npkStatus?.n}%) P(${data.yieldProjection.npkStatus?.p}%) K(${data.yieldProjection.npkStatus?.k}%)`, 25, y); y += 6;
      pdf.text(`• Déficit Hydrique : ${data.yieldProjection.waterDeficit} %`, 25, y);
      y += 15;
  }
  
  // Diagnostic
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('III. DIAGNOSTIC EXPERT (GÉNIE RURAL)', 20, y);
  y += 8;
  
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  const diagLines = pdf.splitTextToSize(`"${data.explanation}"`, pdfWidth - 40);
  pdf.text(diagLines, 20, y);
  y += diagLines.length * 5 + 10;
  
  // Actions
  if (data.actionItems && data.actionItems.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(12, 24, 18);
      pdf.text('IV. ACTIONS PRIORITAIRES', 20, y);
      y += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      data.actionItems.forEach((action: any, idx: number) => {
         pdf.setFont('helvetica', 'bold');
         pdf.text(`Action ${idx + 1} [${action.priority.toUpperCase()}] : ${action.action}`, 25, y);
         y += 5;
         pdf.setFont('helvetica', 'normal');
         pdf.setTextColor(100, 100, 100);
         const impactLines = pdf.splitTextToSize(`Délai: ${action.deadline} | Impact: ${action.impact}`, pdfWidth - 50);
         pdf.text(impactLines, 30, y);
         y += impactLines.length * 5 + 5;
         pdf.setTextColor(12, 24, 18);
      });
  }

  // Footer pages
  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, pdf.internal.pageSize.getHeight() - 15, pdfWidth, 15, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('SaisonPlus AI • Données certifiées Google Earth Engine & Sentinel', 20, pdf.internal.pageSize.getHeight() - 6);
  }

  pdf.save(`SaisonPlus_Rapport_Detaille_${data.zone || data.zoneName || 'Export'}_${Date.now()}.pdf`);
}
