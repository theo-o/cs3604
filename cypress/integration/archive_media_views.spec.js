describe('Archive static img view', () => {
  it('shows correct img tag', () => {
    cy.visit('/archive/m58xyh90');
    cy.get('img.item-img')
      .eq(0)
      .should('be.visible');
  });
});

describe('Archive audio player', () => {
  it('renders audio file thumbnail', () => {
    cy.visit('/archive/m69xyh01');
    cy.get('div.audio-img-wrapper')
      .find('img')
      .should('have.class', 'audio-img')
      .should('be.visible');
  });
  it('renders html5 audio player', () => {
    cy.visit('/archive/m69xyh01');
    cy.get('audio')
      .eq(0)
      .should('have.id', 'player1_html5');
  });
});

describe('Archive video player', () => {
  it('renders html5 video player', () => {
    cy.visit('/archive/m70xyh12');
    cy.get('video')
      .eq(0)
      .should('have.id', 'player1_html5')
      .should('be.visible');
  });
  it('renders with img placeholder', () => {
    cy.visit('/archive/m70xyh12');
    cy.get('video')
      .invoke('attr', 'poster').should('eq', 'http://i3.ytimg.com/vi/iWO5N3n1DXU/hqdefault.jpg')
  })
});

describe('Archive kaltura embed', () => {
  it('renders kaltura video player inside iframe', () => {
    cy.visit('http://localhost:3000/archive/m81xyh23');
    cy.get('iframe')
      .eq(0)
      .should('have.class', 'kaltura-player')
      .should('be.visible');
  });
});

describe('Archive pdf embed', () => {
  it('renders pdf file inside iframe', () => {
    cy.visit('http://localhost:3000/archive/m92xyh34');
    cy.get('iframe')
      .eq(0)
      .should('have.class', 'pdf-viewer')
      .should('be.visible');
  });
});

describe('Archive Mirador viewer', () => {
  it('renders viewer if manifest.json', () => {
    cy.visit('/archive/cv65x38f');
    cy.get('div#mirador_viewer > div > main')
      .eq(0)
      .should('have.class', 'mirador-viewer')
      .should('be.visible');
    cy.get('div.mirador-primary-window > section.mirador-osd-container > div.openseadragon-container > div.openseadragon-canvas > canvas')
      .eq(0)
      .should('be.visible');
  });
});

describe('Archive 3d .obj viewer', () => {
  it('renders 3d viewer for 3d .obj records', () => {
    cy.visit('http://localhost:3000/archive/cz94zm9p');
    cy.get('div.obj-wrapper canvas')
      .eq(0)
      .should('be.visible');
  });
});

describe('Archive 3d .x3d viewer', () => {
  it('renders 3d viewer for 3d .x3d records', () => {
    cy.visit('http://localhost:3000/archive/h387pp1c');
    cy.get('div.obj-wrapper x3d#x3dElement canvas')
      .eq(0)
      .should('be.visible');
  });
});