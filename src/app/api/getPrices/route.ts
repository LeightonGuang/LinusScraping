import puppeteer from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium-min";

// Use the Stealth plugin to bypass bot detection
puppeteer.use(Stealth());

// Set headless and graphics mode
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

const url: string = "https://tradingeconomics.com/commodities";
const element: string[] = ["Steel", "Nickel", "Aluminum", "Zinc"];

export async function POST() {
  try {
    // Optional: Font embedding to support emoji rendering
    await chromium.font(
      "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
    );

    const isLocal = process.env.CHROME_EXECUTABLE_PATH;

    // Launch the browser with Puppeteer Extra
    const browser = await puppeteer.launch({
      args: isLocal
        ? puppeteer.defaultArgs()
        : [
            ...chromium.args,
            "--no-sandbox",
            "--hide-scrollbars",
            "--incognito",
          ],
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath()),
      headless: false, // Set to false for debugging (set to true for production)
    });

    const newPage = await browser.newPage();

    await newPage.goto(url);
    await newPage.screenshot({ path: "screenshot.png" });

    const prices: { name: string; price: string } = await newPage.evaluate(
      () => {
        const tables = document.querySelectorAll("table");

        let selectedTable = null;

        tables.forEach((table) => {
          const headers = table.querySelectorAll("th");
          headers.forEach((header) => {
            if (header.innerText.trim().toLowerCase() === "metals") {
              selectedTable = table;
            }
          });
        });

        if (selectedTable) {
          const rows = (selectedTable as HTMLElement).querySelectorAll(
            "tbody tr"
          );

          const prices: { name: string; price: string }[] = [];

          rows.forEach((row) => {
            const nameElement = row.querySelector("td.datatable-item-first b");
            const priceElement = row.querySelector("td#p");

            if (priceElement && nameElement) {
              const name = nameElement.textContent?.trim();
              const price = priceElement.textContent?.trim();

              if (name && price) {
                prices.push({ name, price });
              }
            }
          });

          return prices;
        } else {
          return "Table not found";
        }
      }
    );

    await browser.close();

    return new Response(JSON.stringify(prices), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return new Response("Failed to scrape the page", { status: 500 });
  }
}
