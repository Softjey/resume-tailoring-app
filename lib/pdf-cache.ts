// Store generated PDFs temporarily in memory
// Note: In a production serverless environment (like Vercel), this in-memory cache
// will not work reliably across different requests/lambdas.
// You should use Redis or S3 for production.
export const pdfCache = new Map<string, Buffer>();
