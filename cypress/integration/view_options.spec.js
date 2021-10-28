describe('view_options: Interaction', () => {
  beforeEach(() => {
    cy.visit('/collections');
  });

  it('should display list viewing style if "list" viewing option is selected', () => {
    cy.get('#content-wrapper')
      .find('div.collection-view-options > :nth-child(1) > :nth-child(2)')
      .click();
    cy.get('#content-wrapper', { timeout: 2000 })
      .find('div.row')
      .children('.collection-entry')
      .should('have.length', 4);
  });

  it('should display gallery viewing style if "gallery" viewing option is selected', () => {
    cy.get('#content-wrapper')
      .find('div.collection-view-options > :nth-child(1) > :nth-child(1)')
      .click();
    cy.get('#content-wrapper', { timeout: 2000 })
      .find('div.row')
      .children('.gallery-item')
      .should('have.length', 4);
  });
})