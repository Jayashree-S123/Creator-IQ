export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\r\n');

  downloadFile(csvContent, filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToJSON(filename: string, data: unknown) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename.endsWith('.json') ? filename : `${filename}.json`, 'application/json');
}

export function generatePDFReport(title: string, summary: Record<string, string | number>, tableHeaders: string[], tableRows: (string | number)[][]) {
  // Create an iframe to cleanly render and print/save as PDF via browser print API
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and download the PDF report.');
    return;
  }

  const summaryHtml = Object.entries(summary)
    .map(([k, v]) => `<div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;"><div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">${k}</div><div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px;">${v}</div></div>`)
    .join('');

  const headersHtml = tableHeaders
    .map(h => `<th style="text-align: left; padding: 10px 12px; background: #f1f5f9; color: #334155; font-size: 12px; border-bottom: 2px solid #cbd5e1;">${h}</th>`)
    .join('');

  const rowsHtml = tableRows
    .map(row => `<tr>${row.map(cell => `<td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;">${cell}</td>`).join('')}</tr>`)
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - CreatorIQ Executive Report</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; }
          .logo span { color: #0f172a; }
          .date { font-size: 12px; color: #64748b; }
          .title { font-size: 20px; font-weight: 700; margin: 0 0 16px 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Creator<span>IQ</span> <span style="font-size: 12px; font-weight: 500; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; margin-left: 6px;">OFFICIAL REPORT</span></div>
          <div class="date">Generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
        </div>
        <h1 class="title">${title}</h1>
        <div class="summary-grid">
          ${summaryHtml}
        </div>
        <h3 style="font-size: 15px; margin: 20px 0 8px 0; color: #334155;">Detailed Breakdown</h3>
        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="footer">
          Generated via CreatorIQ Platform • Confidential & Proprietary Creator Analytics
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}