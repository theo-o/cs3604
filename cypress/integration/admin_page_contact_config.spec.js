const USERNAME = "devtest";
const PASSWORD = Cypress.env("password");

describe("admin_page_contact_config: Displays and updates contact configurations", () => {
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

  describe("admin_page_contact_config: Displays contact fields", () => {
    it("Displays contact fields", () => {
      cy.get("input[value='viewSite']")
        .parent()
        .click();
      cy.contains("Contact 1").should("be.visible");
      cy.contains("Title: IAWA Archivist").should("be.visible");
      cy.contains("Contact 2").should("be.visible");
      cy.contains("Title: Board Chair").should("be.visible");
    });
  });
    
  describe("admin_page_contact_config: Updates first contact's title and changes it back", () => {
    it("Updates contact fields", () => {
      cy.get("input[value='editSite']").parent().click();
      cy.get("#c0_title").clear().type("Director");
      cy.contains("Update Site").click();
      cy.contains("Title: Director").should("be.visible");
    })
  
    it("Reverses update", () => {
      cy.get("input[value='editSite']")
        .parent()
        .click();
      cy.get("#c0_title")
        .clear()
        .type("IAWA Archivist");
      cy.contains("Update Site").click();
      cy.contains("Title: IAWA Archivist").should("be.visible");
    });
  });

  afterEach("User signout:", () => {
    cy.get("amplify-sign-out")
      .find(selectors.signOutButton, { includeShadowDom: true })
      .contains("Sign Out").click({ force: true });
  })
});

export const selectors = {
  // Auth component classes
  usernameInput: '[data-test="sign-in-username-input"]',
  signInPasswordInput: '[data-test="sign-in-password-input"]',
  signInSignInButton: '[data-test="sign-in-sign-in-button"]',
  signOutButton: '[data-test="sign-out-button"]',
};