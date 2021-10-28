describe('browse_collections: Browse collections page', () => {
  beforeEach(() => {
    cy.visit('/collections');
  })

  it('displays the correct page title', () => {
    cy.get('h1')
      .invoke('text')
      .should('equal', 'About Our Collections');
  })

  it('finds the first collection sorted by title as default', () => {
    cy.get('#content-wrapper')
      .find('.row')
      .children('.gallery-item')
      .first() 
      .as('firstCollection')
      .contains('Alberta Pfeiffer Architectural Collection, 1929-1976 (Ms1988-017)');
    cy.get('@firstCollection').click();
    cy.url({ timeout: 2000 })
      .should('include', '/collection/vb765t25demo');
    cy.contains('Ms1988_017_Pfeiffer');
  })

  it('renders the first 10 collections by default number of results to be showed', () => {
    cy.get('#content-wrapper')
      .find('.row')
      .children('.gallery-item')
      .should('have.length', 4);
  })
  
  it('renders the all the collections if increasing the number of results to be showed', () => {
    cy.get('#content-wrapper')
      .find('div.collection-view-options > :nth-child(2)')
      .click()
      .contains('50')
      .click();
    cy.get('#content-wrapper', { timeout: 2000 })
      .find('.row')
      .children('.gallery-item')
      .should('have.length', 4);
  })
})
