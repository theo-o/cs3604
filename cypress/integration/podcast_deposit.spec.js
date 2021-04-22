const USERNAME = "devtest";
const PASSWORD = Cypress.env("password");

describe("Creates Podcast Archive record", () => {
  beforeEach(() => {
    cy.visit("/podcastDeposit");
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
  });
    
  describe("Creates New Podcast", () => {
    const title = "Test title";
    const description = "Test description";
    const source_link = "https://sites.google.com/vt.edu/test/home";
    const source_text = "Test podcast";
    it("Adds Podcast metadata and files. Displays results.", () => {
        cy.get("input[name='title']")
          .clear()
          .type(title);
        cy.get("textarea[name='description']")
          .clear()
          .type(description);
        cy.get("input[name='source_link']")
          .clear()
          .type(source_link);
        cy.get("input[name='source_text']")
          .clear()
          .type(source_text);
        cy.get("input[name='visibility']")
          .uncheck()


        const imgPath = "sitecontent/audioFile.wav"
        cy.get("input#manifest_url_upload").attachFile(imgPath).trigger('change', { force: true });
        cy.get("button#manifest_url_upload_button")
          .click({ force: true });
        cy.get('#manifest_url_upload_upload_message', { timeout: (5 * 1000) })
          .should('have.attr', 'style', 'color: green;')
          .invoke("text")
          .should("include", "uploaded successfully");
  
        cy.get("button.submit").contains("Submit Podcast Episode").click();
        cy.get("#title_value", { timeout: 2 * 1000 })
          .invoke("text")
          .should("include", title);

        cy.get("#manifest_file_characterization_key")
          .invoke("text")
          .should("include", "manifest_file_characterization:");
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