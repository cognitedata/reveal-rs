import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testRenderer } from '__test-utils/renderer';

import { NumericRangeFilter } from '../NumericRangeFilter';

const values = [0, 100];
const selectedValues = [2, 10];
const onValueChange = jest.fn();

const toId = 'To-';
const fromId = 'From-';

describe('Numeric Range Filter', () => {
  const page = (viewProps?: any) =>
    testRenderer(NumericRangeFilter, undefined, viewProps);

  const defaultTestInit = async (viewProps: any) => {
    return { ...page(viewProps) };
  };

  const defaultProps = {
    min: values[0],
    max: values[1],
    selectedValues: undefined,
    onValueChange,
    config: {
      editableTextFields: true,
    },
  };

  it(`should render the range slider`, async () => {
    await defaultTestInit(defaultProps);

    const row = screen.queryByTestId('empty-range-slider');

    expect(row).not.toBeInTheDocument();
  });

  it(`should not trigger change event on prop changes`, async () => {
    const { rerender } = render(
      <NumericRangeFilter
        min={0}
        max={0}
        selectedValues={[0, 0]}
        onValueChange={onValueChange}
      />
    );

    rerender(
      <NumericRangeFilter
        min={1}
        max={3}
        selectedValues={[1, 2]}
        onValueChange={onValueChange}
      />
    );

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it(`should show min max values if no value is selected`, async () => {
    await defaultTestInit(defaultProps);
    expect(screen.getByDisplayValue(values[0])).toBeInTheDocument();
    expect(screen.getByDisplayValue(values[1])).toBeInTheDocument();
  });

  it(`should show selected values`, async () => {
    const props = {
      ...defaultProps,
      selectedValues,
    };

    await defaultTestInit(props);
    expect(screen.getByDisplayValue(selectedValues[0])).toBeInTheDocument();
    expect(screen.getByDisplayValue(selectedValues[1])).toBeInTheDocument();
  });

  it(`Input boxes should be editable`, async () => {
    await defaultTestInit(defaultProps);
    expect(screen.getByTestId(toId)).toBeEnabled();
    expect(screen.getByTestId(fromId)).toBeEnabled();
  });

  it(`Input boxes should be readonly`, async () => {
    const props = {
      ...defaultProps,
      config: {
        editableTextFields: false,
      },
    };

    await defaultTestInit(props);
    expect(screen.getByTestId(toId)).toHaveAttribute('readonly');
    expect(screen.getByTestId(fromId)).toHaveAttribute('readonly');
  });

  // fix here
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip(`Should show error when value is less than min`, async () => {
    await defaultTestInit(defaultProps);

    await userEvent.type(screen.getByTestId(fromId), '{backspace}-1');
    fireEvent.blur(screen.getByTestId(fromId));

    expect(screen.getByText(`Min value is ${values[0]}`)).toBeInTheDocument();
  });

  it(`Should show error when value is higher than max`, async () => {
    await defaultTestInit(defaultProps);

    await userEvent.type(screen.getByTestId(toId), '1');
    fireEvent.blur(screen.getByTestId(toId));
    expect(screen.getByText(`Max value is ${values[1]}`)).toBeInTheDocument();
  });

  it(`Should fire correct callback values on input changes`, async () => {
    await defaultTestInit(defaultProps);
    const fromInput = screen.getByTestId(fromId);
    await userEvent.type(fromInput, '5');
    fireEvent.blur(fromInput);
    expect(onValueChange).toBeCalledWith([5, 100]);

    const toInput = screen.getByTestId(toId);
    await userEvent.type(toInput, '{backspace}{backspace}5');
    fireEvent.blur(toInput);
    expect(onValueChange).toBeCalledWith([5, 15]);
  });

  // fix here
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should fire correct callback values on slider', async () => {
    await defaultTestInit(defaultProps);
    const sliders = await screen.findAllByRole('slider');

    // await userEvent.click(sliders[0]);
    // fireEvent.keyPress(sliders[0], { key: 'ArrowRight' });
    fireEvent.focus(sliders[0]);
    fireEvent.keyUp(sliders[0], { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(sliders[0], { key: 'ArrowRight', code: 'ArrowRight' });
    // fireEvent.keyPress(sliders[0], { key: 'ArrowRight', code: 'ArrowRight' });
    // fireEvent.keyUp(sliders[0], { key: 'ArrowRight', keyCode: });

    // await userEvent.type(sliders[0], '{arrowright}{arrowright}');

    await waitFor(() => expect(onValueChange).toBeCalledWith([2, 100]));
  });
  it('should render with correct selectedValues on initial render', async () => {
    const props = {
      ...defaultProps,
      selectedValues,
    };

    await defaultTestInit(props);

    expect(screen.getByTestId(fromId)).toHaveValue(selectedValues[0]);
    expect(screen.getByTestId(toId)).toHaveValue(selectedValues[1]);
  });
});
