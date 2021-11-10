const USERNAME = "devtest";
const PASSWORD = Cypress.env('password');

describe("admin_archive_edit: Update item metadata and change it back", function() {
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
      .find(":nth-child(9) > a")
      .contains("Update Item")
      .click()
    cy.url().should("include", "/siteAdmin")

    cy.get("input")
      .clear()
      .type("Ms1990_025_Per_Ph_B001_F001_003_demo");
    cy.contains("Confirm").click();
    cy.get("input[value='view']")
    .parent()
    .find("input")
    .should("be.checked")
    cy.contains("Rights holder: Special Collections, University Libraries, Virginia Tech").should("be.visible");
  })
 
  it("Unable to empty required metadata", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("div[class='required field']")
      .first()
      .find("textarea").clear().type("  ");
    cy.contains("Update Item Metadata").click();
    cy.contains("Please fill in the required field!").should('be.visible');
  })

  it("Update single-valued metadata", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='title']")
      .clear().type("New Title");
    cy.contains("Update Item Metadata").click();
    cy.contains("Title: New Title").should('be.visible');
    cy.contains("View Item")
      .should('have.attr', 'href').and("include", "/archive/3h85z50c")
  })

  it("Change single-valued metadata back", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='title']")
      .clear().type("Unidentified building site, c. 1979. Photographs (Ms1990-025)");
    cy.contains("Update Item Metadata").click();
    cy.contains("Title: Unidentified building site, c. 1979. Photographs (Ms1990-025)").should('be.visible');
  })

  it("Can delete single-valued metadata", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='description']")
      .clear();
    cy.contains("Update Item Metadata").click();
    cy.contains("Description: ").should('not.exist');
  })

  it("Can add single-valued metadata", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='description']")
      .clear().type("Two photographs of an unidentified industrial building site.");
      cy.contains("Update Item Metadata").click();
      cy.contains("Description: Two photographs of an unidentified industrial building site.").should('be.visible');
  })

  it("Can delete multi-valued metadata", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='belongs_to_1']")
      .siblings(".deleteValue")
      .click();
    cy.contains("Update Item Metadata").click();
    cy.contains("Ms1990-025, Box 1, Folder 1").should('not.exist');
  })

  it("Can add multi-valued metadata", () => {
    cy.get("input[value='edit']").parent().click();
    cy.get("textarea[name='belongs_to_0']")
      .parent().parent()
      .siblings(".small")
      .click();
    cy.get("textarea[name='belongs_to_1']").should("have.value", "new belongs_to")
      .clear()
      .type("Ms1990-025, Box 1, Folder 1");
    cy.contains("Update Item Metadata").click();
    cy.contains("Ms1990-025, Box 1, Folder 1").should('be.visible');
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