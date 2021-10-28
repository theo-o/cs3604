describe('searchfacet_checkbox: Search facet checkboxes correspond to the facet values of a facet field', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6)')
      .click();
    cy.wait(20000);
  })

  it('allows to select one of the checkboxes', () => {
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing > :nth-child(2) input')
      .check();
    cy.url()
      .should('contain', 'medium=Colored+pencil');
    cy.get('[data-cy=search-filter-field-value-pairs]')
      .invoke('text')
      .should('contain', 'medium', 'Colored pencil');
  })

  it('allows to select more than one checkboxes', () => {
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing > :nth-child(2) input')
      .check();
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.all-less')
      .click();
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing > :nth-child(6) input').scrollIntoView()
      .should('be.visible');
    cy.get('[data-cy=filter-collapsibles] > :nth-child(6) > div > div.facet-listing > :nth-child(6) input')
      .check();

    cy.url()
      .should('contain', 'medium=Colored+pencil')
      .and('contain', 'medium=Photographic+Print+-+Black+and+White');
    cy.get('[data-cy=search-filter-field-value-pairs]')
      .invoke('text')
      .should('contain', 'medium', 'Colored pencil')
      .and('contain', 'medium', 'Photographic Print - Black and White');
  })
})
