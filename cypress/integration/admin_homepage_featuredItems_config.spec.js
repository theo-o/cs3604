const USERNAME = "devtest";
const PASSWORD = Cypress.env("password");

describe("admin_homepage_featuredItems_config: Update featured items fields and revert", function () {
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
            .click();
        cy.url().should("include", "/siteAdmin");
    });

    it("Updates first item title", () => {
        cy.get("input[value='edit']")
            .parent()
            .click();
        cy.get("#FI0_title")
            .clear()
            .type("The Piper");
        cy.contains("Update Config").click();
        cy.contains("Title: The Piper").should("be.visible");
    });

    it("Reverses update", () => {
        cy.get("input[value='edit']")
            .parent()
            .click();
        cy.get("#FI0_title")
          .clear()
          .type("Piper");
        cy.contains("Update Config").click();
        cy.contains("Title: Piper").should("be.visible");
    });
   
    it("Adds new item with image", () => {
        cy.get("input[value='edit']")
            .parent()
            .click();
        const imgPath = "sitecontent/featured_item10.png";
        cy.get("button[aria-label='Add a featured item']").click();
        cy.get(
            "#featuredItem9_form > section > div.fileUploadField > input[type=file]")
            .eq(0)
            .attachFile(imgPath)
            .trigger("change", { force: true });
        cy.get(
          "#featuredItem9_form > section > div.fileUploadField > button.uploadButton"
        ).click({ force: true });
        cy.get("#FI9_alt").type('"La Fragua" Housing, Bogotá');
        cy.get("#FI9_title").type(
          '"La Fragua" Housing, Bogotá'
        );
        cy.get("#FI9_link").type(
          "https://swva-dev.cloud.lib.vt.edu/archive/pp439d2v"
        );
        cy.contains("Update Config").click();
        cy.contains("Featured Item 10").should("be.visible");
        cy.contains(
            "Source: featuredItems/featured_item10.png"
        ).should("be.visible");
        cy.contains('Alt text: "La Fragua" Housing, Bogotá').should("be.visible");
        cy.contains(
          "URL: https://swva-dev.cloud.lib.vt.edu/archive/pp439d2v"
        ).should("be.visible");
    })

    it("Removes new item", () => {
        cy.get("input[value='edit']")
            .parent()
            .click();
        cy.get("#featuredItem9_form").contains("Remove item").click();
        cy.contains("Update Config").click();
        cy.contains("Featured Item 10").should("not.exist");
    })

    afterEach("User signout:", () => {
        cy.get("amplify-sign-out")
            .find(selectors.signOutButton, { includeShadowDom: true })
            .contains("Sign Out")
            .click({ force: true });
    })
});    

export const selectors = {
  usernameInput: '[data-test="sign-in-username-input"]',
  signInPasswordInput: '[data-test="sign-in-password-input"]',
  signInSignInButton: '[data-test="sign-in-sign-in-button"]',
  signOutButton: '[data-test="sign-out-button"]',
};
