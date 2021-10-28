describe('linked_metadata: Archive metadata', () => {
  it('lands on search facet by the metadata field', () => {
    cy.visit('/archive/cv65x38f');
    cy.get('[data-cy=multi-field-span] a')
      .eq(2)
      .click();
    cy.url({ timeout: 2000 })
      .should('eq', 'http://localhost:3000/search/?category=archive&creator=Green%2C%20Terence%20M.%20&field=title&q=&view=Gallery');
  });

  it('first entry in "Is Part of" directs to the top level collection show page', () => {
    cy.visit('/archive/cv65x38f');
    cy.get('[data-cy=multi-field-span] a')
      .eq(0)
      .click();
    cy.url({ timeout: 2000 })
      .should('eq', 'http://localhost:3000/collection/4g825g7ddemo');
  });
});

describe('linked_metadata: Collection metadata', () => {
  it('lands on search facet by the metadata field', () => {
    cy.visit('/collection/vb765t25demo');
    cy.get('[data-cy=multi-field-span] a')
      .eq(1)
      .click();
    cy.url({ timeout: 2000 })
      .should('eq', 'http://localhost:3000/search/?category=collection&field=title&language=en&q=&view=Gallery');
  });
});
