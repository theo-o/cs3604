describe('Search by title by clicking search button', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('input')
      .clear()
    cy.get('select').select('title');
    cy.get('input')
      .clear()
      .type('Additions');
    cy.get('#content-wrapper > div > div.search-result-wrapper > div > div.searchbar-wrapper > button.btn')
      .click();
    cy.wait(1000);
  });

  it('returns resulting objects with the title searched', () => {
    cy.url()
      .should('eq', 'http://localhost:3000/search?field=title&q=Additions&view=Gallery');
    cy.get('#content > div.navbar > div.view-info > div.pagination-section > div.pagination-text')
      .invoke('text')
      .should('equal', 'Search Results: 1 - 5 of 5');
    
    cy.get('#content > div.search-results-section > div.row')
      .children()
      .should('have.length', 5);

    cy.get('#content > div.search-results-section > div.row > :nth-child(1) > div.card > a > div.card-body > h3')
      .invoke('text')
      .should('contains', "Additions");
  });
});

describe('Search by description by hitting enter key', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('select').select('description');
    cy.get('input').type('certificate{enter}').trigger('input');
    cy.wait(1000);
  });

  it('returns resulting objects with description searched', () => {
    cy.url()
      .should('eq', 'http://localhost:3000/search?field=description&q=certificate&view=Gallery');
    cy.get('#content > div.navbar > div.view-info > div.pagination-section > div.pagination-text')
      .invoke('text')
      .should('equal', 'Search Results: 1 - 4 of 4');

    cy.get('#content > div.search-results-section > div.row')
      .children()
      .should('have.length', 4);

    cy.get('#content > div.search-results-section > div.row > :nth-child(1) > div.card > a > div.card-body > p')
      .invoke('text')
      .should('contains', "certificate");
  });
});

describe('Search by all fields by hitting enter key', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('select').select('all');
    cy.get('input')
      .clear()
      .type('Diazotypes (copies){enter}')
      .trigger('input');
    cy.wait(1000);
  });

  it('returns resulting objects with full text search', () => {
    cy.url()
      .should('eq', 'http://localhost:3000/search?field=all&q=Diazotypes%20%28copies%29&view=Gallery');
    cy.get('#content > div.navbar > div.view-info > div.pagination-section > div.pagination-text')
      .invoke('text')
      .should('equal', 'Search Results: 1 - 10 of 43');

    cy.get('#content > div.search-results-section > div.row')
      .children()
      .should('have.length', 10);
  });
});