const USERNAME = "devtest";
const PASSWORD = Cypress.env('password');

describe("authenticator_spec: Authenticator:", function() {
    beforeEach(function() {
      cy.visit("/siteAdmin");
    });
 
    describe("authenticator_spec: Sign in and Sign out:", () => {
      it("allows a user to signin and signout", () => {
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
        
        cy.get("amplify-sign-out", { timeout: 2000 })
          .find(selectors.signOutButton, { includeShadowDom: true })
          .contains("Sign Out").click({ force: true });
      });
    });
});

export const selectors = {
  // Auth component classes
  usernameInput: '[data-test="sign-in-username-input"]',
  signInPasswordInput: '[data-test="sign-in-password-input"]',
  signInSignInButton: '[data-test="sign-in-sign-in-button"]',
  signOutButton: '[data-test="sign-out-button"]'
}