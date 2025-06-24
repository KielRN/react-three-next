export async function GET() {
  // Create vCard content
  const vCardContent = `BEGIN:VCARD
VERSION:3.0
N:Lamboy;Eliud "Elliott";;;
FN:Eliud "Elliott" Lamboy
TEL;TYPE=CELL:210-284-9337
EMAIL;TYPE=WORK:elliott@texasaiconsulting.com
END:VCARD`;

  // Return the vCard with appropriate headers
  return new Response(vCardContent, {
    headers: {
      'Content-Type': 'text/vcard',
      'Content-Disposition': 'attachment; filename="elliott-lamboy.vcf"',
    },
  });
}