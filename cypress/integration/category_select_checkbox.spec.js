describe('category_select_checkbox: Object category options are mutually exclusive facet checkboxes', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('[data-cy=filter-collapsibles] > :nth-child(1)')
      .click();
  });

  it('sets category to all if none of the checkboxes being selected', () => {
    cy.get('[data-cy=filter-collapsibles] > :nth-child(1) > div > div.facet-listing > :nth-child(1) input')
      .should('not.have.class', 'checked');
  });

  it('sets one categoy if one of the checkboxes being selected', () => {
    cy.get('[data-cy=filter-collapsibles] > :nth-child(1) > div > div.facet-listing > :nth-child(1) input')
      .check();

    cy.url()
      .should('contain', 'category=collection');
    cy.get("[data-cy=search-filter-field-value-pairs]")
      .invoke("text")
      .should("contain", "category", "collection");
  });

  it('prevents from selecting more than one categories(checkboxes)', () => {
    cy.get('[data-cy=filter-collapsibles] > :nth-child(1) > div > div.facet-listing > :nth-child(1) input')
      .check();
    cy.get('[data-cy=filter-collapsibles] > :nth-child(1) > div > div.facet-listing > :nth-child(2) input')
      .check();

    cy.url()
        .should('contain', 'category=archive')
        .should('not.contain', 'category=collection');
    cy.get("[data-cy=search-filter-field-value-pairs]")
      .invoke("text")
      .should("contain", "category", "archive")
      .should("not.contain", "collection");
  });
});
