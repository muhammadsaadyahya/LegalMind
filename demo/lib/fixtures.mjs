import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { FIXTURES_DIR, log } from "./util.mjs";

// Fictional documents used in the demo. Names, addresses and companies are invented.
export const LEASE_PDF = path.join(FIXTURES_DIR, "Harbor_Lane_Lease_Agreement.pdf");
export const BRIEF_PDF = path.join(FIXTURES_DIR, "Thompson_v_Northgate_Case_Brief.pdf");

const css = `
  body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.5; margin: 0; color: #111; }
  h1 { font-size: 18pt; text-align: center; margin-bottom: 4pt; }
  .sub { text-align: center; color: #555; margin-bottom: 18pt; }
  h2 { font-size: 13pt; margin: 14pt 0 4pt; }
  p { margin: 0 0 8pt; text-align: justify; }
`;

const lease = `
<h1>Residential Lease Agreement</h1>
<div class="sub">14 Harbor Lane, Unit 3B, Port Avalon</div>
<p>This Residential Lease Agreement is made on March 1, 2025 between Northgate Property Holdings LLC
("Landlord") and Maya Thompson ("Tenant") for the premises at 14 Harbor Lane, Unit 3B, Port Avalon
("Premises").</p>
<h2>1. Term</h2>
<p>The lease begins on March 1, 2025 and ends on February 28, 2026. Either party may terminate the lease
at the end of the term by giving at least sixty (60) days' written notice to the other party.</p>
<h2>2. Rent</h2>
<p>Monthly rent is $1,850, due on the first day of each month. Rent received after the fifth day of the
month incurs a late fee of $75.</p>
<h2>3. Security Deposit</h2>
<p>Tenant has paid a security deposit of $2,400. Landlord shall return the deposit, less any itemized
deductions for damage beyond normal wear and tear, within twenty-one (21) days after Tenant vacates the
Premises. Failure to provide an itemized statement within this period forfeits Landlord's right to
withhold any portion of the deposit.</p>
<h2>4. Repairs and Maintenance</h2>
<p>Landlord is responsible for keeping the roof, plumbing, heating and electrical systems in good repair.
Landlord must begin repairs within fourteen (14) days of receiving written notice of a defect that affects
habitability. Tenant is responsible for minor repairs costing less than $100.</p>
<h2>5. Entry by Landlord</h2>
<p>Landlord may enter the Premises for inspections or repairs after giving at least twenty-four (24) hours'
written notice, except in an emergency.</p>
<h2>6. Remedies</h2>
<p>If Landlord fails to complete habitability repairs within the period in Section 4, Tenant may arrange the
repair and deduct the reasonable cost from the next month's rent, up to one month's rent.</p>
<h2>7. Governing Law</h2>
<p>This Agreement is governed by the residential tenancy laws of the State of Avalon.</p>
`;

const brief = `
<h1>Case Brief: Thompson v. Northgate Property Holdings LLC</h1>
<div class="sub">Avalon County Small Claims Court &middot; Prepared for case assessment</div>
<h2>Facts</h2>
<p>Tenant Maya Thompson leased Unit 3B at 14 Harbor Lane from Northgate Property Holdings LLC under a
twelve-month written lease. Tenant paid a $2,400 security deposit. Between June and September 2025 Tenant
sent three written notices reporting a roof leak that damaged the bedroom ceiling. Landlord acknowledged
the first notice but did not begin repairs. Tenant vacated at the end of the term after giving sixty days'
notice. Thirty-five days later Landlord had not returned the deposit or provided an itemized statement.</p>
<h2>Issues</h2>
<p>1. Whether Landlord forfeited the right to withhold the deposit by failing to send an itemized statement
within twenty-one days. 2. Whether Landlord breached the repair obligation in Section 4 of the lease.</p>
<h2>Evidence</h2>
<p>Signed lease; bank record of the deposit payment; three dated repair notices sent by email and certified
mail; photographs of water damage; move-out inspection photos showing the unit in clean condition.</p>
<h2>Arguments</h2>
<p>Tenant argues that Section 3 of the lease and state law require return of the full deposit when no
itemized statement is sent on time, and that Landlord's failure to repair breached Section 4. Landlord
claims the deposit covers cleaning costs but has produced no receipts or inspection report.</p>
<h2>Relief Sought</h2>
<p>Return of the $2,400 deposit, a statutory penalty equal to the deposit, and $600 in repair-related
damages.</p>
`;

async function renderPdf(browser, html, file) {
  const page = await browser.newPage();
  await page.setContent(`<html><head><style>${css}</style></head><body>${html}</body></html>`);
  await page.pdf({ path: file, format: "A4", margin: { top: "22mm", bottom: "22mm", left: "22mm", right: "22mm" } });
  await page.close();
}

export async function buildFixtures() {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  const browser = await chromium.launch();
  try {
    await renderPdf(browser, lease, LEASE_PDF);
    await renderPdf(browser, brief, BRIEF_PDF);
  } finally {
    await browser.close();
  }
  log("fixtures", `wrote ${path.basename(LEASE_PDF)}, ${path.basename(BRIEF_PDF)}`);
}
