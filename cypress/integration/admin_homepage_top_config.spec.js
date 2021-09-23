const USERNAME = "devtest";
const PASSWORD = Cypress.env('password');

describe("Update Homepage fields and revert", function() {
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

    cy.get("#content-wrapper > div > div > ul")
      .find(":nth-child(4) > a")
      .contains("Homepage Config")
      .click()
    cy.url().should("include", "/siteAdmin");
  })
 
  it("Update Homepage statement heading", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("input[name='homeStatementHeading']").clear().type("Heading test");
    cy.contains("Update Config").click();
    cy.contains("Heading: Heading test").should('be.visible');
  })

  it("Change Homepage statement heading back", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("input[name='homeStatementHeading']").clear().type("Welcome");
    cy.contains("Update Config").click();
    cy.contains("Heading: Welcome").should('be.visible');
  })

  it("displays successful upload", () => {
    cy.get("input[value='edit']").parent().click();
    const imgPath = "sitecontent/cover_image1.jpg";
    cy.get("input[type=file]").eq(0).attachFile(imgPath).trigger('change', { force: true });
    cy.get(".static-image > div.fileUploadField > button.uploadButton")
      .click({ force: true });
    cy.get('[data-test="upload-message"]')
      .should('have.attr', 'style', 'color: green;')
      .invoke("text")
      .should("include", "uploaded successfully");
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