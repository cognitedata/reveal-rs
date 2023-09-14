import { getUrl } from '../utils/getUrl';

describe('Home page', () => {
  beforeEach(() => {
    console.log(getUrl());
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('Renders all elements', () => {
    cy.get("[data-testid='homeHeader']", {
      timeout: 30000,
    }).should('exist');
  });
});
