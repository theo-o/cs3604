import { buildHeaderSchema } from '../../src/lib/richSchemaTools';
import { buildRichSchema } from "../../src/lib/richSchemaTools";

describe("buildHeaderSchema: Create rich schema for about page", () => {
  it('About page schema', () => {
    const result = buildHeaderSchema("Article", "AboutPage", "localhost", "title"); 
  
    const content = JSON.parse(result)

    expect(content['@type']).to.eq('Article');
    expect(content.headline).to.eq('title');
    expect(content.mainEntityOfPage['@type']).to.eq('AboutPage');
    expect(content.mainEntityOfPage['@id']).to.eq('localhost');
    
  });
});

describe("buildRichSchema: Create rich schema for PodcastEpisode", () => {
  it('PodcastEpisode schema', () => {
    let info = {}
    info["audio"] = "http://local.example.com/test.mp3"
    info["collectionTitle"] = "PodcastChannel"
    info["collectionURL"] = "http://local.example.com/show"
    info["datePublished"] = "2020/01/23 22:30:20";
    info["description"] = "a description";
    info["title"] = "title";
    info["url"] = "http://local.example.com";
    

    const result = buildRichSchema("PodcastEpisode", info); 

    const content = JSON.parse(result)
    expect(content.name).to.eq('title');
    expect(content['@type']).to.eq('PodcastEpisode');
    expect(content.datePublished).to.eq('2020/01/23 22:30:20');
    expect(content.description).to.eq('a description');
    expect(content.url).to.eq('http://local.example.com');
    expect(content.associatedMedia.contentUrl).to.eq('http://local.example.com/test.mp3');
    expect(content.partOfSeries.name).to.eq('PodcastChannel');
    expect(content.partOfSeries.url).to.eq('http://local.example.com/show');
   
  });
});


describe("buildRichSchema: Create rich schema for PodcastSeries", () => {
  it('PodcastSeries schema', () => {
    let info = {}
    info["description"] = "a description";
    info["title"] = "title";
    info["thumbnail_path"] = "http://example.com";
    info["url"] = "http://local.example.com";

    const result = buildRichSchema("PodcastSeries", info); 

    const content = JSON.parse(result)

    expect(content['@type']).to.eq("PodcastSeries");
    expect(content.image).to.eq("http://example.com");
    expect(content.name).to.eq("title");
    expect(content.description).to.eq("a description");
    expect(content.url).to.eq("http://local.example.com");
  });
});


