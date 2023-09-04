const getButton = (value: string, attribute?: string) => {
  if (attribute) {
    return cy.get(`[${attribute}="${value}"]`);
  }
  return cy.contains(value);
};

const getIconButton = (ariaLabel: string) => {
  return getButton(ariaLabel, 'aria-label');
};

const clickButton = (value: string, attribute?: string) => {
  cy.getButton(value, attribute).should('be.visible').click({ force: true });
};

const clickIconButton = (ariaLabel: string) => {
  cy.clickButton(ariaLabel, 'aria-label');
};

Cypress.Commands.add('getButton', getButton);
Cypress.Commands.add('getIconButton', getIconButton);
Cypress.Commands.add('clickButton', clickButton);
Cypress.Commands.add('clickIconButton', clickIconButton);

export interface ButtonCommands {
  getButton(
    value: string,
    attribute?: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  getIconButton: (ariaLabel: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickButton(value: string, attribute?: string): void;
  clickIconButton: (ariaLabel: string) => void;
}
