describe('additional_pages: Site nav menu', () => {
  it('shows generated About link', () => {
    cy.visit('/');
    cy.get('#vt_main_nav > li:nth-child(4)')
      .eq(0)
      .should('have.class', 'nav-item')
      .should('not.be.visible');
      cy.get('#vt_main_nav > li:nth-child(4) .link-wrapper a')
        .invoke('text')
        .should('contain', "ABOUT");
  });
});

describe('additional_pages: About link', () => {
  it('links to correct About page', () => {
    cy.visit('/');
    cy.get('nav.top-navbar > ul > li:nth-child(4) > a')
      .click();
    cy.get('#content-wrapper > div > div.col-12.about-heading > h1', { timeout: 2000 })
      .invoke('text')
      .should('contain', 'About');
  });
});

