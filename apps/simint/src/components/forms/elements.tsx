import { Field, useFormikContext } from 'formik';
import styled from 'styled-components/macro';

import { Input, Slider } from '@cognite/cogs.js';

import { getNodeFromPath } from '../../utils/formUtils';

export const FormHeader = styled.h3`
  display: flex;
  align-items: center;
  column-gap: 12px;
  &:not(:first-child) {
    margin-top: 24px;
  }
`;

export const FormContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  row-gap: 12px;
`;

export const NumberInput = styled(Input)`
  width: ${(props) => props.width ?? 100}px;
  .title:empty {
    display: none;
  }
  input[type='number'] {
    appearance: auto !important;
  }
  .title {
    text-transform: none;
  }
  & + .arrows {
    display: none !important;
  }
  .cogs-input {
    padding-right: var(--cogs-input-side-padding);
  }
  .input-wrapper {
    display: flex;
    padding: 0;
  }
  &.label-icon {
    .input-icon {
      width: auto;
      margin: 0 24px 0 0;
    }
  }
`;

export const FormRow = styled.div`
  display: flex;
  align-items: baseline;
  column-gap: 12px;
  & > label:first-child {
    flex: 1 1 33%;
    max-width: 240px;
  }
  .cogs-select {
    min-width: 120px;
  }
  .rc-slider {
    align-self: center;
    margin: 0 12px;
  }
`;

export const FormRowStacked = styled.div`
  display: flex;
  align-items: baseline;
  column-gap: 12px;
  .cogs-select {
    min-width: 220px;
  }
`;

export function TextField({
  name,
  ...props
}: React.InputHTMLAttributes<unknown>) {
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();

  if (!name) {
    return null;
  }

  const value = getNodeFromPath(values, name);

  return (
    <Field
      as={Input}
      name={name}
      setValue={(newValue: typeof value) => {
        setFieldValue(name, newValue);
      }}
      type="text"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(name, event.currentTarget.value);
      }}
      {...props}
    />
  );
}

export const StyledInput = styled(Input)`
  width: ${(props) => props.width ?? 100}px;
  .title {
    text-transform: none;
  }
`;

export function NumberField({
  name,
  label,
  title,
  setValue,
  ...props
}: React.InputHTMLAttributes<unknown> & {
  label?: (value: number) => JSX.Element | string;
  setValue?: (value: string) => void;
}) {
  const { errors, values, setFieldValue } =
    useFormikContext<Record<string, unknown>>();
  if (!name) {
    return null;
  }

  const value = getNodeFromPath(values, name);
  const errorText = getNodeFromPath(errors, name);

  const labelProps:
    | (React.HTMLAttributes<unknown> & {
        icon?: JSX.Element;
        iconPlacement?: string;
      })
    | undefined =
    label && typeof value === 'number'
      ? {
          className: `${props.className ?? ''} label-icon`,
          icon: <>{label(value)}</>,
          iconPlacement: 'right',
        }
      : undefined;

  return (
    <Field
      as={NumberInput}
      error={errorText}
      name={name}
      step={props.step ?? 'any'}
      // obsolete: XXX Cogs.js hack to ensure input is wrapped in container element => removed for DEGR-1398
      title={title}
      type="number"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.currentTarget;
        if (setValue) {
          setValue(value);
        } else {
          setFieldValue(name, value);
        }
      }}
      {...labelProps}
      {...props}
    />
  );
}

export function SliderNumberField({
  name,
  min,
  max,
  step,
  sliderMin = +(min ?? 0),
  sliderMax = +(max ?? 1),
  sliderStep = +(step ?? 1),
  setValue,
  ...inputProps
}: React.InputHTMLAttributes<unknown> & {
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  label?: (value: number) => JSX.Element | string;
  setValue?: (value: string) => void;
}) {
  const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();

  if (!name) {
    return null;
  }

  const value = getNodeFromPath(values, name);
  if (typeof value !== 'number' && typeof value !== 'string') {
    return null;
  }

  return (
    <>
      <NumberField
        max={max}
        min={min}
        name={name}
        setValue={setValue}
        step={step}
        value={value}
        {...inputProps}
      />
      <Slider
        marks={getMarks([sliderMin, sliderMax])}
        max={sliderMax}
        min={sliderMin}
        step={sliderStep}
        value={+value}
        onChange={(value: number) => {
          if (setValue) {
            setValue(value.toString());
          } else {
            setFieldValue(name, value);
          }
        }}
      />
    </>
  );
}

const getMarks = (values: number[], suffix = '') =>
  values.reduce<
    Record<
      number,
      React.ReactNode | { style?: React.CSSProperties; label?: string }
    >
  >(
    (marks, value) => ({ ...marks, [value]: { label: `${value}${suffix}` } }),
    {}
  );
