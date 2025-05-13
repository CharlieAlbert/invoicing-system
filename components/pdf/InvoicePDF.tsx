import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 14,
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  clientInfo: {
    width: "50%",
  },
  summaryInfo: {
    alignItems: "flex-end",
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 10,
  },
  dates: {
    marginBottom: 10,
    fontSize: 14,
  },
  label: {
    fontWeight: "medium",
    marginRight: 5,
  },
  h2: {
    fontSize: 18,
    marginBottom: 15,
    color: "#1f2937",
  },
  table: {
    width: "100%",
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 12,
  },
  tableCell: {
    fontSize: 14,
    flex: 1,
  },
  tableCellRight: {
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  summaryTable: {
    width: 300,
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontWeight: "bold",
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    color: "#4b5563",
    fontSize: 14,
  },
});

// Company information
const companyInfo = {
  name: "ANKARDS COMPANY LIMITED",
  poBox: "209 - 00516",
  tel: "+254 725 672 249",
  mobile: "+254 721 891 399",
  email: "info@ankards.co.ke",
};

type InvoiceSummaryProps = {
  data: any;
  clientInfo: {
    company_name: string;
    company_email: string;
    phone: string | null;
    contact_person: string | null;
    address: string | null;
  };
  title?: string;
};

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
}

const InvoiceDocument = ({
  data,
  clientInfo,
  title = "Payment Summary",
}: InvoiceSummaryProps) => {
  // Calculate totals
  const totalAmount = data.reduce(
    (sum: number, invoice: Invoice) => sum + (invoice.total_amount || 0),
    0
  );
  const totalPaid = data.reduce(
    (sum: number, invoice: Invoice) => sum + (invoice.amount_paid || 0),
    0
  );
  const totalRemaining = totalAmount - totalPaid;
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>{companyInfo.name}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>P.O. Box {companyInfo.poBox}</Text>
            <Text>Tel: {companyInfo.tel}</Text>
            <Text>Mobile: {companyInfo.mobile}</Text>
            <Text>Email: {companyInfo.email}</Text>
          </View>
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.clientInfo}>
            <Text style={styles.h2}>Client:</Text>
            <Text style={{ fontWeight: "bold" }}>
              {clientInfo.company_name}
            </Text>
            {clientInfo.contact_person && (
              <Text>{clientInfo.contact_person}</Text>
            )}
            {clientInfo.address && <Text>{clientInfo.address}</Text>}
            <Text>{clientInfo.company_email}</Text>
            {clientInfo.phone && <Text>{clientInfo.phone}</Text>}
          </View>

          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>{title}</Text>
            <Text style={styles.dates}>
              <Text style={styles.label}>Date:</Text> {currentDate}
            </Text>
            <Text style={styles.dates}>
              <Text style={styles.label}>Total Invoices:</Text> {data.length}
            </Text>
          </View>
        </View>

        <Text style={styles.h2}>Invoice Summary</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Invoice #</Text>
            <Text style={styles.tableCell}>Issue Date</Text>
            <Text style={styles.tableCell}>Due Date</Text>
            <Text style={styles.tableCellRight}>Total Amount</Text>
            <Text style={styles.tableCellRight}>Amount Paid</Text>
            <Text style={styles.tableCellRight}>Remaining</Text>
            <Text style={styles.tableCell}>Status</Text>
          </View>

          {data.map((invoice: Invoice) => {
            const remaining =
              (invoice.total_amount || 0) - (invoice.amount_paid || 0);
            let status = "UNPAID";

            if (
              invoice.amount_paid &&
              invoice.amount_paid >= (invoice.total_amount || 0)
            ) {
              status = "PAID";
            } else if (invoice.amount_paid && invoice.amount_paid > 0) {
              status = "PARTIAL";
            }

            return (
              <View key={invoice.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{invoice.invoice_number}</Text>
                <Text style={styles.tableCell}>
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </Text>
                <Text style={styles.tableCell}>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </Text>
                <Text style={styles.tableCellRight}>
                  Ksh {invoice.total_amount?.toLocaleString()}
                </Text>
                <Text style={styles.tableCellRight}>
                  Ksh {invoice.amount_paid?.toLocaleString()}
                </Text>
                <Text style={styles.tableCellRight}>
                  Ksh {remaining.toLocaleString()}
                </Text>
                <Text style={styles.tableCell}>{status}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text>Total Amount:</Text>
            <Text>Ksh {totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Total Paid:</Text>
            <Text>Ksh {totalPaid.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Total Outstanding:</Text>
            <Text>Ksh {totalRemaining.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text>
            This is a summary of all invoices for the client. Please contact us
            if you have any questions or concerns regarding this summary.
          </Text>
        </View>

        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
};

// Download button component
export const InvoicePDFDownload = ({
  data,
  clientInfo,
  title,
}: InvoiceSummaryProps) => (
  <PDFDownloadLink
    document={
      <InvoiceDocument data={data} clientInfo={clientInfo} title={title} />
    }
    fileName={`${clientInfo.company_name
      .toLowerCase()
      .replace(/\s+/g, "-")}-invoice-summary.pdf`}
  >
    {({ blob, url, loading, error }) =>
      loading ? "Generating PDF..." : "Download Summary"
    }
  </PDFDownloadLink>
);

// Preview component (optional)
export const InvoicePDFPreview = ({
  data,
  clientInfo,
  title,
}: InvoiceSummaryProps) => (
  <InvoiceDocument data={data} clientInfo={clientInfo} title={title} />
);
