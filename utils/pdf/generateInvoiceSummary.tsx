import { InvoiceWithItems } from "@/lib/supabase/server-extended/invoices";
import { format } from "date-fns";

type ClientInfo = {
  company_name: string;
  company_email: string;
  phone: string | null;
  contact_person: string | null;
  address: string | null;
};

type CompanyInfo = {
  name: string;
  poBox: string;
  tel: string;
  mobile: string;
  email: string;
};

export const generateInvoiceSummaryHTML = (
  invoices: InvoiceWithItems[],
  clientInfo: ClientInfo,
  title: string = "Payment Summary"
): string => {
  if (!invoices.length) {
    throw new Error("No invoices provided for summary");
  }

  // Format the current date
  const currentDate = format(new Date(), "dd/MM/yyyy");

  // Company information - using the same as in invoice generation
  const companyInfo: CompanyInfo = {
    name: "ANKARDS COMPANY LIMITED",
    poBox: "209 - 00516",
    tel: "+254 725 672 249",
    mobile: "+254 721 891 399",
    email: "info@ankards.co.ke",
  };

  // Calculate total amounts
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0);
  const totalRemaining = totalAmount - totalPaid;

  // Create the HTML content
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      body {
        font-family: 'Roboto', Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
        background-color: #f9f9f9;
      }
      
      .invoice-container {
        max-width: 800px;
        margin: 20px auto;
        background-color: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        padding: 40px;
        border-radius: 8px;
        position: relative;
      }
      
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 100px;
        opacity: 0.03;
        color: #000;
        pointer-events: none;
        z-index: 0;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        border-bottom: 1px solid #eee;
        padding-bottom: 20px;
      }
      
      .logo {
        font-size: 28px;
        font-weight: 700;
        color: #2563eb;
      }
      
      .company-info {
        text-align: right;
        font-size: 14px;
      }
      
      .invoice-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .client-info {
        max-width: 50%;
      }
      
      .summary-info {
        text-align: right;
      }
      
      .summary-title {
        font-size: 24px;
        font-weight: 700;
        color: #2563eb;
        margin-bottom: 10px;
      }
      
      .dates {
        margin-bottom: 10px;
        font-size: 14px;
      }
      
      .dates span {
        font-weight: 500;
      }
      
      h2 {
        font-size: 18px;
        margin-bottom: 15px;
        color: #1f2937;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      th {
        background-color: #f9fafb;
        padding: 12px 15px;
        text-align: left;
        font-weight: 500;
        font-size: 14px;
        color: #4b5563;
        border-bottom: 1px solid #e5e7eb;
      }
      
      td {
        padding: 12px 15px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 14px;
      }
      
      .text-right {
        text-align: right;
      }
      
      .summary {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 30px;
      }
      
      .summary-table {
        width: 300px;
      }
      
      .summary-table td {
        padding: 8px 0;
        border: none;
      }
      
      .summary-table .total-row {
        font-weight: 700;
        font-size: 16px;
        color: #2563eb;
      }
      
      .notes {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
      
      .notes-title {
        font-weight: 500;
        margin-bottom: 10px;
      }
      
      .notes-content {
        font-size: 14px;
        color: #6b7280;
      }
      
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }
      
      .status-paid {
        color: #16a34a;
      }
      
      .status-unpaid {
        color: #dc2626;
      }
      
      .status-partial {
        color: #f59e0b;
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div class="watermark">SUMMARY</div>
      
      <div class="header">
        <div class="logo">${companyInfo.name}</div>
        <div class="company-info">
          <div>P.O. Box ${companyInfo.poBox}</div>
          <div>Tel: ${companyInfo.tel}</div>
          <div>Mobile: ${companyInfo.mobile}</div>
          <div>Email: ${companyInfo.email}</div>
        </div>
      </div>
      
      <div class="invoice-details">
        <div class="client-info">
          <h2>Client:</h2>
          <div><strong>${clientInfo.company_name}</strong></div>
          <div>${clientInfo.contact_person || ""}</div>
          <div>${clientInfo.address || ""}</div>
          <div>${clientInfo.company_email}</div>
          <div>${clientInfo.phone || ""}</div>
        </div>
        
        <div class="summary-info">
          <div class="summary-title">${title}</div>
          <div class="dates"><span>Date:</span> ${currentDate}</div>
          <div class="dates"><span>Total Invoices:</span> ${invoices.length}</div>
        </div>
      </div>
      
      <h2>Invoice Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total Amount</th>
            <th>Amount Paid</th>
            <th>Remaining</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${invoices
            .map((invoice) => {
              const remaining = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
              let statusClass = "status-unpaid";
              let statusText = "UNPAID";
              
              if (invoice.amount_paid && invoice.amount_paid >= (invoice.total_amount || 0)) {
                statusClass = "status-paid";
                statusText = "PAID";
              } else if (invoice.amount_paid && invoice.amount_paid > 0) {
                statusClass = "status-partial";
                statusText = "PARTIAL";
              }
              
              return `
                <tr>
                  <td>${invoice.invoice_number}</td>
                  <td>${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}</td>
                  <td>${format(new Date(invoice.due_date), "dd/MM/yyyy")}</td>
                  <td class="text-right">Ksh ${(invoice.total_amount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td class="text-right">Ksh ${(invoice.amount_paid || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td class="text-right">Ksh ${remaining.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td class="${statusClass}">${statusText}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
      
      <div class="summary">
        <table class="summary-table">
          <tr>
            <td>Total Amount:</td>
            <td class="text-right">Ksh ${totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</td>
          </tr>
          <tr>
            <td>Total Paid:</td>
            <td class="text-right">Ksh ${totalPaid.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</td>
          </tr>
          <tr class="total-row">
            <td>Total Outstanding:</td>
            <td class="text-right">Ksh ${totalRemaining.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</td>
          </tr>
        </table>
      </div>
      
      <div class="notes">
        <div class="notes-title">Notes:</div>
        <div class="notes-content">
          This is a summary of all invoices for the client. Please contact us if you have any questions or concerns regarding this summary.
        </div>
      </div>
      
      <div class="footer">
        Thank you for your business!
      </div>
    </div>
  </body>
  </html>`;
};
