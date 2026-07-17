import { enqueueJob } from "../services/queue.js";

const jobs: Array<[string, unknown]> = [
  [
    "email",
    {
      export: "file.pdf",
      subject: "Download pdf",
    },
  ],
  [
    "email",
    {
      export: "invoice.pdf",
      subject: "Your Invoice is Ready",
    },
  ],
  [
    "email",
    {
      export: "report.xlsx",
      subject: "Monthly Report Attached",
    },
  ],
  [
    "email",
    {
      export: "contract.docx",
      subject: "Contract for Review",
    },
  ],
  [
    "email",
    {
      export: "receipt.pdf",
      subject: "Your Receipt",
    },
  ],
  [
    "email",
    {
      export: "statement.csv",
      subject: "Account Statement",
    },
  ],
  [
    "email",
    {
      export: "summary.pdf",
      subject: "Weekly Summary",
    },
  ],
  [
    "email",
    {
      export: "presentation.pptx",
      subject: "Presentation Deck",
    },
  ],
  [
    "email",
    {
      export: "backup.zip",
      subject: "Your Backup File",
    },
  ],
  [
    "email",
    {
      export: "certificate.pdf",
      subject: "Your Certificate is Ready",
    },
  ],
  [
    "email",
    {
      export: "report.xlsx",
      subject: "Monthly Report Attached",
    },
  ],
  [
    "email",
    {
      export: "contract.docx",
      subject: "Contract for Review",
    },
  ],
  [
    "email",
    {
      export: "receipt.pdf",
      subject: "Your Receipt",
    },
  ],
  [
    "email",
    {
      export: "statement.csv",
      subject: "Account Statement",
    },
  ],
  [
    "email",
    {
      export: "summary.pdf",
      subject: "Weekly Summary",
    },
  ],
  [
    "email",
    {
      export: "presentation.pptx",
      subject: "Presentation Deck",
    },
  ],
  [
    "email",
    {
      export: "backup.zip",
      subject: "Your Backup File",
    },
  ],
  [
    "email",
    {
      export: "certificate.pdf",
      subject: "Your Certificate is Ready",
    },
  ],
];
async function main() {
  for (const [jobType, payload] of jobs) {
    await enqueueJob(jobType, payload);
  }
}

main().catch(console.error);
