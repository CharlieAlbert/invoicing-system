import { Handler } from "@netlify/functions";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import fs from "fs";

let browserInstance: any = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;

  let executablePath;
  let launchArgs = [];

  if (process.env.NETLIFY) {
    try {
      executablePath = await chromium.executablePath();
      launchArgs = chromium.args;
    } catch (err) {
      console.error("Chromium error on Netlify:", err);
      throw err;
    }
  } else {
    const localPaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];

    for (const path of localPaths) {
      if (fs.existsSync(path)) {
        executablePath = path;
        break;
      }
    }

    if (!executablePath) {
      executablePath = await chromium.executablePath();
      launchArgs = chromium.args;
    } else {
      launchArgs = [
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ];
    }
  }

  browserInstance = await puppeteer.launch({
    args: launchArgs,
    executablePath,
    headless: chromium.headless,
  });

  return browserInstance;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let page = null;

  try {
    const body = JSON.parse(event.body || "{}");
    const { html } = body;

    if (!html || typeof html !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid HTML content" }),
      };
    }

    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setViewport({ width: 800, height: 1100 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
    });

    await page.close();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="quotation.pdf"',
      },
      body: pdfBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    if (page) await page.close().catch(() => {});
    if ((error as Error).message.includes("Target closed")) {
      if (browserInstance) await browserInstance.close().catch(() => {});
      browserInstance = null;
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "PDF generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
};

export { handler };
