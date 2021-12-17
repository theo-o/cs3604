const USERNAME = "devtest";
const PASSWORD = Cypress.env('password');

describe("admin_collection_edit: Update collection metadata and change it back", function() {
  beforeEach(() => {
    cy.visit("/siteAdmin");
    cy.get("amplify-authenticator")
      .find(selectors.usernameInput, {
        includeShadowDom: true,
      })
      .type(USERNAME);

    cy.get("amplify-authenticator")
      .find(selectors.signInPasswordInput, {
        includeShadowDom: true,
      })
      .type(PASSWORD, { force: true });

    cy.get("amplify-authenticator")
      .find(selectors.signInSignInButton, {
        includeShadowDom: true,
      })
      .first()
      .find("button[type='submit']", { includeShadowDom: true })
      .click({ force: true });

      cy.get("#content-wrapper > div > div > ul", { timeout: 2000 })
      .find(".collectionFormLink > a")
      .contains("New / Update Collection")
      .click()
    cy.url().should("include", "/siteAdmin")

    cy.get('input')
      .clear()
      .type('Ms1988_017_Pfeiffer_demo');
    cy.contains("Confirm").click();
    cy.get("input[value='view']")
    .parent()
    .find('input')
    .should('be.checked')
    cy.contains("Description: Alberta Pfeiffer’s architectural career spanned 55 years, where she worked primarily in Hadlyme, Connecticut.").should("be.visible");
  })

  it("Update single-valued metadata", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='title']").invoke('val', '');
    cy.get("textarea[name='title']").type("New Title");
    cy.contains("Update Collection Metadata").click();
    cy.contains("New Title").should('be.visible');
  })

  it("Change single-valued metadata back", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='title']")
      .clear().type("Alberta Pfeiffer Architectural Collection, 1929-1976 (Ms1988-017)");
    cy.contains("Update Collection Metadata").click();
    cy.contains("Title: Alberta Pfeiffer Architectural Collection, 1929-1976 (Ms1988-017)").should('be.visible');
  })

  afterEach("User signout:", () => {
    cy.get("amplify-sign-out")
      .find(selectors.signOutButton, { includeShadowDom: true })
      .contains("Sign Out").click({ force: true });
  })
});

export const selectors = {
  usernameInput: '[data-test="sign-in-username-input"]',
  signInPasswordInput: '[data-test="sign-in-password-input"]',
  signInSignInButton: '[data-test="sign-in-sign-in-button"]',
  signOutButton: '[data-test="sign-out-button"]'
}