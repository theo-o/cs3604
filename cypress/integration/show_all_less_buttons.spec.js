describe('show_all_less_buttons: Search Facet field with more than 5 selectable values', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6)')
      .click();
    cy.wait(20000);
  });
  
  it('displays the first 5 facet values', () => {
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing')
      .should("be.visible");
    
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing')
      .children()
      .should('have.length', 5);
  });
  
  it('displays all facet values if all button is clicked', () => {
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing')
      .should('be.visible');
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.all-less')
      .click();
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing')
      .children()
      .should('have.length', 9);
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing')
      .should('have.class', 'scroll');
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing > :nth-child(9) input')
      .should('not.be.visible');
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing > :nth-child(9) input').scrollIntoView()
      .should('be.visible');
  });
})
