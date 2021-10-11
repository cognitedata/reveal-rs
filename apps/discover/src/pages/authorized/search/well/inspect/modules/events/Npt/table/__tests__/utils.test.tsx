import { getMockNPTEvent } from '__test-utils/fixtures/npt';

import { processAccessor, renderNPTCodeWithColor } from '../utils';

describe('processAccessor', () => {
  const nptEvent = getMockNPTEvent();

  it('should return the value when it exists in the npt event', () => {
    const accessor = 'nptCode';
    expect(processAccessor(nptEvent, accessor)).toEqual(nptEvent[accessor]);
  });

  it('should return `null` when it does not exist in the npt event', () => {
    const accessor = 'wellName';
    expect(processAccessor(nptEvent, accessor)).toEqual(null);
  });

  it('should return `null` when the value of property in the npt event is empty', () => {
    const accessor = 'nptCode';
    expect(processAccessor({ ...nptEvent, nptCode: '' }, accessor)).toEqual(
      null
    );
  });

  it('should return `number` values when it exists in the npt event', () => {
    const accessor = 'wellboreId';
    expect(processAccessor(nptEvent, accessor)).toEqual(nptEvent[accessor]);
  });
});

describe('renderNPTCodeWithColor', () => {
  const nptEvent = getMockNPTEvent();

  it('should return element as expected', () => {
    expect(renderNPTCodeWithColor(nptEvent)).toBeTruthy();
  });

  it('should return element even when `nptCode` is empty`', () => {
    expect(renderNPTCodeWithColor({ ...nptEvent, nptCode: '' })).toBeTruthy();
  });
});
