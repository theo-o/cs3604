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

function buildPodcastEpisodeSchema(info) {
  const scriptContent = `{
    "@context": "https://schema.org/",
    "@type": "PodcastEpisode",
    "url": "${info["url"]}",
    "name": "${info["title"]}",
    "datePublished": "${info["datePublished"]}",
    "timeRequired": "",
    "description": "${info["description"]}",
    "associatedMedia": {
      "@type": "MediaObject",
      "contentUrl": "${info["audio"]}"
    },
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": "${info["collectionTitle"]}",
      "url": "${info["collectionURL"]}"
    }
  }`;

  return scriptContent;
}

function buildPodcastSeriesSchema(info) {
  const scriptContent = `{
      "@context": "https://schema.org/",
      "@type": "PodcastSeries",
      "image": "${info["thumbnail_path"]}",
      "url": "${info["url"]}",
      "name": "${info["title"]}",
      "description": "${info["description"]}",
      "webFeed": "",
      "author": {
        "@type": "Person",
        "name": "${info["creator"]}"
      }
  }`;

  return scriptContent;
}

export function buildRichSchema(type, info) {
  if (type === "PodcastEpisode") {
    return buildPodcastEpisodeSchema(info);
  } else if (type === "PodcastSeries") {
    return buildPodcastSeriesSchema(info);
  }
  return "";
}
