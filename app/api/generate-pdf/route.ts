import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

// Global browser instance to prevent repeated launches
let browserInstance: any = null;

async function getBrowser() {
  if (browserInstance) {
    return browserInstance;
  }
  
  try {
    // Common browser paths for different OS
    const windowsPaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
      "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    ];

    let executablePath;
    let launchArgs = [];
    
    // Check if we're running on Vercel or locally
    if (process.env.VERCEL === "1") {
      // Use chromium-min on Vercel
      try {
        executablePath = await chromium.executablePath();
        launchArgs = chromium.args;
      } catch (chromiumError) {
        console.error("Error getting chromium path:", chromiumError);
        throw new Error(`Failed to get chromium path: ${chromiumError instanceof Error ? chromiumError.message : String(chromiumError)}`);
      }
    } else {
      // Try to find a local browser on Windows
      for (const browserPath of windowsPaths) {
        if (fs.existsSync(browserPath)) {
          executablePath = browserPath;
          break;
        }
      }
      
      // If no browser found locally, try chromium-min as fallback
      if (!executablePath) {
        try {
          executablePath = await chromium.executablePath();
          launchArgs = chromium.args;
        } catch (chromiumError) {
          console.error("Error getting chromium path:", chromiumError);
          throw new Error(`Failed to get chromium path: ${chromiumError instanceof Error ? chromiumError.message : String(chromiumError)}`);
        }
      } else {
        // Default args for local browsers
        launchArgs = [
          "--disable-dev-shm-usage",
          "--disable-setuid-sandbox",
          "--no-sandbox",
        ];
      }
    }
    
    if (!executablePath) {
      throw new Error("No browser executable path found");
    }
    
    console.log(`Launching browser with executable path: ${executablePath}`);
    
    // Launch with appropriate args
    browserInstance = await puppeteer.launch({
      args: launchArgs,
      executablePath,
      headless: true,
    });
    
    console.log("Browser launched successfully");
    return browserInstance;
  } catch (error) {
    console.error("Error launching browser:", error);
    throw new Error(`Failed to launch browser: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(request: Request) {
  let page = null;
  
  try {
    // Parse the request
    const body = await request.json();
    const { html } = body;
    
    if (!html || typeof html !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid HTML content" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("Getting browser instance...");
    const browser = await getBrowser();
    
    console.log("Creating new page...");
    page = await browser.newPage();
    
    // Basic page setup
    await page.setViewport({ width: 800, height: 1100 });
    
    console.log("Setting page content...");
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    
    console.log("PDF generated successfully");
    
    // Close the page but keep the browser instance
    if (page) {
      await page.close();
      console.log("Page closed");
    }
    
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="quotation.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    
    // Clean up resources
    if (page) {
      try {
        await page.close();
        console.log("Page closed after error");
      } catch (closeError) {
        console.error("Error closing page:", closeError);
      }
    }
    
    // If browser instance is in a bad state, reset it
    if ((error as Error).message?.includes("Target closed") || (error as Error).message?.includes("Session closed")) {
      try {
        if (browserInstance) {
          await browserInstance.close();
          console.log("Browser instance closed due to error");
        }
      } catch (e) {
        console.error("Error closing browser:", e);
      } finally {
        browserInstance = null;
      }
    }
    
    return new Response(
      JSON.stringify({
        error: "PDF generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
