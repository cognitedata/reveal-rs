import { EXPAND_SEARCH_RESULTS_TEXT } from '../../../src/pages/authorized/search/map/constants';
import {
  STATIC_LOCATION_DOCUMENT,
  STATIC_LOCATION_WELL,
} from '../../support/constants';

const testPoints = [
  { x: 600, y: 200 },
  { x: 700, y: 200 },
  { x: 650, y: 300 },
];

describe('Map', () => {
  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.wait(2000); // give the map time to render
  });

  describe('Polygon search', () => {
    it('edit mode can be started and stopped in different ways', () => {
      cy.checkPolygonIsClosed();

      cy.enterPolygonEditMode();
      cy.findByTestId('finish-info-message').should('be.visible');
      cy.findByTestId('cancel-info-message').should('be.visible');
      cy.findByTestId('shortcut-helper').should('be.visible');

      // Close polygon tool by pressing ESC
      cy.closePolygonESC();
      cy.checkPolygonIsClosed();

      // Close by cancel button
      cy.enterPolygonEditMode();
      cy.closePolygonWithCancelButton();
      cy.checkPolygonIsClosed();

      // Close by pressing ENTER
      cy.enterPolygonEditMode();
      cy.closePolygonENTER();
      cy.checkPolygonIsClosed();

      // Close by pressing outside of map
      cy.enterPolygonEditMode();
      cy.closeByClickOutside();
      cy.checkPolygonIsClosed();
    });

    it('allows us to draw a polygon on the map and trigger search', () => {
      cy.enterPolygonEditMode();
      cy.drawPolygon(
        [
          { x: 100, y: 100 },
          { x: 300, y: 100 },
          { x: 200, y: 200 },
        ],
        'doubleClick'
      );
      cy.checkPolygonFloatingActionsAreVisible(true);
      cy.deletePolygon();
      cy.checkPolygonFloatingActionsAreVisible();

      cy.drawPolygon(testPoints, 'enter');
      cy.checkPolygonFloatingActionsAreVisible(true);
      cy.triggerPolygonSearch();

      cy.findByTestId('side-bar')
        .findAllByRole('button', {
          name: 'Custom Polygon',
        })
        .should('have.length', 2);

      cy.log('Check the document search is correct');
      cy.findByTestId('doc-result-table')
        .findByTitle(STATIC_LOCATION_DOCUMENT)
        .should('be.visible');

      cy.log('Check the well search is correct');
      cy.goToTab('Wells');
      cy.findByTestId('well-result-table')
        .findByTitle(STATIC_LOCATION_WELL)
        .should('be.visible');

      cy.log('Click clear all button in wells table and check the result');
      cy.clickClearAllFilterButtonInWellsTable();
      cy.findByTestId('wellbore-result-table')
        .findAllByTestId('table-row')
        .should('have.length.above', 1);

      cy.expandMap();
      cy.checkPolygonButtonIsVisible();
    });
  });

  describe('Controls', () => {
    before(() => {
      cy.findByTestId('cognite-logo').click();
    });

    it('should show and hide controls based on table width', () => {
      cy.checkPolygonButtonIsVisible();
      cy.checkMapInputIsVisible();
      cy.checkAssetsMenuButtonIsVisible();
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();

      cy.log('expand search results');
      cy.findByText(EXPAND_SEARCH_RESULTS_TEXT).click();

      cy.checkPolygonButtonIsNotVisible();
      cy.checkMapInputIsNotVisible();
      cy.checkAssetsMenuButtonIsNotVisible();
      cy.checkLayersMenuButtonIsNotVisible();
      cy.checkZoomControlsAreNotVisible();

      cy.dragResultsTable(-20);
      cy.checkPolygonButtonIsNotVisible();
      cy.checkMapInputIsNotVisible();
      cy.checkAssetsMenuButtonIsNotVisible();
      cy.checkLayersMenuButtonIsNotVisible();
      cy.checkZoomControlsAreVisible();

      cy.dragResultsTable(-100);
      cy.checkPolygonButtonIsNotVisible();
      cy.checkMapInputIsNotVisible();
      cy.checkAssetsMenuButtonIsNotVisible();
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();

      cy.dragResultsTable(-100);
      cy.checkPolygonButtonIsNotVisible();
      cy.checkMapInputIsNotVisible();
      cy.checkAssetsMenuButtonIsVisible();
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();

      cy.dragResultsTable(-400);
      cy.checkPolygonButtonIsVisible();
      cy.checkMapInputIsVisible();
      cy.checkAssetsMenuButtonIsVisible();
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();
    });
  });

  describe('Polygon Edit', () => {
    before(() => {
      cy.findByTestId('cognite-logo').click();
    });

    it('should enable editing when click on not completed polygon', () => {
      cy.enterPolygonEditMode();
      cy.drawPolygon(testPoints, 'esc');

      cy.checkPolygonButtonIsVisible();

      cy.drawPolygon([{ x: 650, y: 300 }]);
      cy.checkPolygonFloatingActionsAreVisible(true);
      cy.deletePolygon();
      cy.closePolygonWithCancelButton();
    });

    // This is an edge case that was fixed. do not remove this test.
    it('should floating action buttons visible with one edge in bottom right', () => {
      cy.enterPolygonEditMode();

      cy.drawPolygon(
        [{ x: 300, y: 300 }, 'bottomRight', { x: 300, y: 500 }],
        'enter'
      );

      cy.checkPolygonFloatingActionsAreVisible(true);
      cy.closePolygonWithCancelButton();
    });

    it('should view, edit polygon info icon', () => {
      cy.enterPolygonEditMode();
      cy.drawPolygon(testPoints, 'enter');
      cy.drawPolygon(['bottom']);
      cy.checkClickOnPolygonToEditIsVisible();
    });
  });
});
