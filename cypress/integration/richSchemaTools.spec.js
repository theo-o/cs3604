import { buildHeaderSchema } from '../../src/lib/richSchemaTools';

describe("buildHeaderSchema: Create rich schema", () => {
  it('rich schema', () => {
    const contnt = buildHeaderSchema("Article", "AboutPage", "localhost", "title"); 
    expect(contnt).to.include('"@type": "Article"');
    expect(contnt).to.include('mainEntityOfPage": {\n        "@type": "AboutPage"');
    expect(contnt).to.include('"@id": "localhost"');
    expect(contnt).to.include('"headline": "title"');
  });
});
