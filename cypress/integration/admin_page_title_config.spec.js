const USERNAME = "devtest";
const PASSWORD = Cypress.env('password');

describe("admin_page_title_config: Update Site title and change it back", function() {
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
  })
 
  it("Update Site title", () => {
    cy.get("input[value='editSite']").parent().click();
    cy.get("input[name='siteTitle']", { timeout: 2000 }).clear().type("DEMO1");
    cy.contains("Update Site").click();
    cy.contains("Site Title: DEMO1").should('be.visible');
  })

  it("Change title back", () => {
    cy.get("input[value='editSite']").parent().click();
    cy.get("input[name='siteTitle']", { timeout: 2000 }).clear().type("DEMO");
    cy.contains("Update Site").click();
    cy.contains("Site Title: DEMO", { timeout: 2000 }).should('be.visible');
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