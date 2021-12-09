export function buildHeaderSchema(parenttype, type, id, title) {
  const scriptContent = `{ 
      "@context": "https://schema.org",
      "@type": "${parenttype}",
      "mainEntityOfPage": {
        "@type": "${type}",
        "@id": "${id}"
      },
      "headline": "${title}"
    }`;
  return scriptContent;
}
