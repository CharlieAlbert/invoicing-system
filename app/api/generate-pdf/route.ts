import chromium from "@sparticuz/chromium-min";
import * as puppeteer from "puppeteer-core";
import fs from "fs";

async function getBrowser() {
  const executablePath =
    process.env.VERCEL === "1"
      ? await chromium.executablePath()
      : "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";

  return puppeteer.launch({
    args: [
      ...chromium.args,
      "--disable-dev-shm-usage",
      "--single-process",
      '--js-flags="--expose-gc"',
    ],
    executablePath,
    headless: process.env.NODE_ENV === "production",
    ignoreHTTPSErrors: true,
    timeout: 60000,
  } as puppeteer.LaunchOptions & {
    ignoreHTTPSErrors: boolean;
    timeout: number;
  });
}

export async function POST(request: Request) {
  try {
    const { html } = await request.json();
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Configure page
    await page.setDefaultNavigationTimeout(60000);
    await page.setCacheEnabled(false);

    // Load content
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Add rendering delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
      preferCSSPageSize: true,
      timeout: 60000,
    });

    await browser.close();
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="output.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new Response(
      JSON.stringify({
        error: "PDF generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
