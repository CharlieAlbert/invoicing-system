import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";

export async function POST(req: NextRequest) {
  try {
    const { companyInfo, items, subtotal, discount, vat, grandTotal } =
      await req.json();

    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; }
          h2 { font-size: 20px; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
          th { background-color: #f0f0f0; }
          .totals { margin-top: 20px; font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>${companyInfo.name}</h2>
        <p>P.O. Box: ${companyInfo.poBox}</p>
        <p>Tel: ${companyInfo.tel} | Mobile: ${companyInfo.mobile}</p>
        <p>Email: ${companyInfo.email}</p>
        
        <h1 style="text-align: center;">QUOTATION</h1>
        <p>Date: ${new Date().toLocaleDateString()}</p>

        <table>
          <thead>
            <tr>
              <th>Product</th><th>Variant</th><th>Quantity</th><th>Unit Price</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.variantName}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.total}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <p>Subtotal: ${subtotal}</p>
          <p>Discount: ${discount}</p>
          <p>VAT (${vat}%): Ksh${(
      (parseFloat(subtotal.replace(/[^0-9.]/g, "")) * vat) /
      100
    ).toFixed(2)}</p>
          <p>Grand Total: ${grandTotal}</p>
        </div>
      </body>
      </html>
    `;

    // Launch Puppeteer with AWS Lambda Chrome
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${
          companyInfo.name
        }-${new Date().toISOString()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500 }
    );
  }
}
