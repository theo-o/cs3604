describe('archive_metadata_display: A single Archive Show page metadata section', () => {
  beforeEach(() => {
    cy.visit('/archive/cv65x38f');
    cy.get('#content-wrapper > div.item-page-wrapper > div.item-details-section > div.details-section-metadata > table')
      .as('metadataSection');
  })

  it('displays the identifier field and its corresponding value', () => {
    cy.get('@metadataSection')
      .find(':nth-child(1) > th.collection-detail-key')
      .invoke('text')
      .should('equal', 'Identifier');
    cy.get('@metadataSection')
      .find(':nth-child(1) > td.collection-detail-value').click();
    cy.url({ timeout: 2000 }).should('include', '/archive/cv65x38f');
  })

  it('displays the custom key field and its corresponding value', () => {
    cy.get('@metadataSection')
      .find(':nth-child(5) > th.collection-detail-key')
      .invoke('text')
      .should('equal', 'Permanent Link');
    cy.get('@metadataSection')
      .find(':nth-child(5) > td.collection-detail-value')
      .contains('idn.lib.vt.edu/ark:/53696/cv65x38f');
  })

  it('displays the belongs_to field and its corresponding value', () => {
    cy.get('@metadataSection')
      .find(':nth-child(2) > th.collection-detail-key')
      .invoke('text')
      .should('equal', 'Belongs to');
    cy.get('@metadataSection')
      .find(':nth-child(2) > td.collection-detail-value > div > :nth-child(1)').click();
    cy.url({ timeout: 2000 }).should('include', '/collection/4g825g7ddemo');
  })
})