import html2pdf from "html2pdf.js";

type CompanyInfo = {
  name: string;
  poBox: string;
  tel: string;
  mobile: string;
  fax: string;
  email: string;
};

type QuotationItem = {
  productName: string;
  variantName: string;
  quantity: string;
  price: string;
  total: string;
};

export const generatePDF = async (
  companyInfo: CompanyInfo,
  items: QuotationItem[],
  subtotal: string,
  discount: string,
  vat: number,
  grandTotal: string
): Promise<void> => {
  // Create a container for the PDF content
  const element = document.createElement("div");
  element.style.padding = "30px";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.width = "800px";

  // Calculate VAT amount for display
  const numericSubtotal = parseFloat(subtotal.replace(/[^0-9.]/g, ""));
  const vatAmount = `Ksh${((numericSubtotal * vat) / 100).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

  // Format the current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create the HTML content
  element.innerHTML = `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px;">
      <h2 style="font-size: 20px; margin-bottom: 5px;">${companyInfo.name}</h2>
      <p style="font-size: 10px; margin-bottom: 3px;">P.O. Box ${
        companyInfo.poBox
      }</p>
      <p style="font-size: 10px; margin-bottom: 3px;">Tel: ${
        companyInfo.tel
      }</p>
      <p style="font-size: 10px; margin-bottom: 3px;">Mobile: ${
        companyInfo.mobile
      }</p>
      <p style="font-size: 10px; margin-bottom: 3px;">Fax: ${
        companyInfo.fax
      }</p>
      <p style="font-size: 10px; margin-bottom: 3px;">Email: ${
        companyInfo.email
      }</p>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <h1 style="font-size: 24px; margin-bottom: 5px;">QUOTATION</h1>
      <p style="font-size: 12px;">Date: ${currentDate}</p>
    </div>
    
    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #000;">Product</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #000;">Variant</th>
          <th style="padding: 8px; text-align: right; border-bottom: 1px solid #000;">Quantity</th>
          <th style="padding: 8px; text-align: right; border-bottom: 1px solid #000;">Unit Price</th>
          <th style="padding: 8px; text-align: right; border-bottom: 1px solid #000;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.variantName}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${item.price}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${item.total}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    
    <div style="margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <span style="font-weight: bold;">Subtotal:</span>
        <span>${subtotal}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <span style="font-weight: bold;">Discount:</span>
        <span>${discount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <span style="font-weight: bold;">VAT (${vat}%):</span>
        <span>${vatAmount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 16px; font-weight: bold;">
        <span>Grand Total:</span>
        <span>${grandTotal}</span>
      </div>
    </div>
    
    <div style="margin-top: 40px; font-size: 10px;">
      <p style="font-weight: bold;">Terms and Conditions:</p>
      <ol style="padding-left: 20px; margin-top: 5px;">
        <li>This quotation is valid for 30 days from the date of issue.</li>
        <li>Payment is due within 30 days of the invoice date.</li>
        <li>Late payments may incur a fee of 5% per month.</li>
        <li>Prices are subject to change without prior notice.</li>
      </ol>
    </div>
    
    <div style="margin-top: 40px;">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <p style="margin-bottom: 40px;">Prepared by: _______________________</p>
          <p>Date: _______________________</p>
        </div>
        <div>
          <p style="margin-bottom: 40px;">Approved by: _______________________</p>
          <p>Date: _______________________</p>
        </div>
      </div>
    </div>
  `;

  // Append to body temporarily
  document.body.appendChild(element);

  // Updated PDF options with enhanced configuration
  const opt = {
    margin: 15,
    filename: `quotation-${Date.now()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      removeContainer: true,
      letterRendering: true,
      // Force background colors to be opaque
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    },
  };

  try {
    await html2pdf().from(element).set(opt).save();
    // Remove the temporary element
    document.body.removeChild(element);
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Remove the temporary element
    document.body.removeChild(element);
    throw error;
  }
};
