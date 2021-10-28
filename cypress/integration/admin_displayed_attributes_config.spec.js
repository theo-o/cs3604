const USERNAME = "devtest";
const PASSWORD = Cypress.env('password');

describe("admin_displayed_attributes_config: Update attribute and change it back", function() {
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
      .find(":nth-child(7) > a")
      .contains("Displayed Attributes")
      .click()
    cy.url({ timeout: 2000 }).should("include", "/siteAdmin")
  })
  it("first attribute required", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("#archive_0_wrapper", { timeout: 2000 })
     .find("span.required")
     .invoke("text").should("eq", "Required");
  })
 
  it("Update first attribute", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("input[id='archive_0']", { timeout: 2000 }).clear().type("Not Identifier");
    cy.contains("Update Attributes").click();
    cy.contains("label: Not Identifier", { timeout: 2000 }).should('be.visible');
  })

  it("Change first attribute back", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("input[id='archive_0']", { timeout: 2000 }).clear().type("Identifier");
    cy.contains("Update Attributes").click();
    cy.contains("label: Identifier", { timeout: 2000 }).should('be.visible');
  })

  it("Can delete attribute", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("section#archive", { timeout: 2000 })
      .find('a.delete.active').last().click();
    cy.contains("Update Attributes", { timeout: 2000 }).click();
    cy.contains("field: tags", { timeout: 2000 }).should('not.exist');
    cy.contains("label: Tags").should('not.exist');
  })  

  it("Can add attribute", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("section#archive", { timeout: 2000 })
      .find('select.add_archive_attribute').select("archive#tags");
    cy.get("section#archive")
      .find('a.add.active').click();
    cy.get("section#archive", { timeout: 2000 })
      .find('div.field.attributeLabel').last()
      .find('input').clear().type('Tags');
    cy.contains("Update Attributes").click();
    cy.contains("field: tags", { timeout: 2000 }).should('be.visible');
    cy.contains("label: Tags").should('be.visible');
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