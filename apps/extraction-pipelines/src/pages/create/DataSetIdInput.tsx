import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { AutoComplete, Colors, Loader } from '@cognite/cogs.js';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { MutationStatus } from '@tanstack/react-query';
import { DataSet } from '@cognite/sdk';
import { DataSetSelectOption } from '@extraction-pipelines/components/inputs/dataset/DataSetSelectOption';
import { InputController } from '@extraction-pipelines/components/inputs/InputController';
import { Hint } from '@extraction-pipelines/components/styled';
import ValidationError from '@extraction-pipelines/components/form/ValidationError';
import { TableHeadings } from '@extraction-pipelines/components/table/ExtpipeTableCol';
import { useTranslation } from '@extraction-pipelines/common';
interface DataSetIdPageProps {
  data?: DataSet[];
  renderLabel?: (labelText: string, inputId: string) => React.ReactNode;
  status: 'error' | 'success' | 'loading' | 'idle';
  autoFocus?: boolean;
}

export const DATASET_LIST_LIMIT: Readonly<number> = 500;
export type SelectOption = { value: number; label?: string };
const DataSetIdInput: FunctionComponent<DataSetIdPageProps> = ({
  data,
  status,
  renderLabel,
  autoFocus = false,
}: PropsWithoutRef<DataSetIdPageProps>) => {
  const { t } = useTranslation();
  const {
    setValue,
    formState: { errors },
    watch,
    control,
  } = useFormContext<any>();
  const storedValue = parseInt(watch('dataSetId'), 10);

  const getOptions = (): SelectOption[] => {
    return data
      ? data.map(({ id, name, externalId }) => {
          return { value: id, label: name, externalId };
        })
      : [];
  };
  const options = getOptions();
  const selectedValue = options.filter(({ value }) => {
    return value === storedValue;
  })[0];

  if (status === 'loading') {
    return <Loader />;
  }

  const handleSelectChange = (option: SelectOption | null) => {
    setValue('dataSetId', option != null ? option.value : undefined);
  };

  const renderInput = (
    innerStatus: MutationStatus,
    innerOptions: SelectOption[],
    innerValue: null | SelectOption
  ) => {
    if (innerStatus === 'error') {
      return (
        <InputController
          name="dataSetId"
          inputId="data-set-id-input"
          control={control}
          defaultValue=""
          aria-invalid={!!errors.dataSetId}
          aria-describedby="data-set-id-hint data-set-id-error"
        />
      );
    }

    return (
      <StyledAutoComplete
        name="dataSetId"
        defaultValue={innerValue}
        aria-labelledby="data-set-id-label"
        components={{ Option: DataSetSelectOption }}
        options={innerOptions}
        isClearable
        noOptionsMessage={({ inputValue }: { inputValue: string }) =>
          t('data-set-not-exist', { dataset: inputValue })
        }
        onChange={handleSelectChange}
        data-testid="dataset-select"
        autoFocus={autoFocus}
      />
    );
  };

  return (
    <>
      {renderLabel && renderLabel(TableHeadings.DATA_SET, 'data-set-id-input')}
      <Hint
        id="data-set-id-hint"
        className="input-hint"
        data-testid="data-set-id-hint"
      >
        {t('data-set-id-hint')}
      </Hint>
      <ValidationError errors={errors} name="dataSetId" />
      {renderInput(status, options, selectedValue)}
    </>
  );
};

const StyledAutoComplete = styled(AutoComplete)`
  width: 50%;
  align-self: flex-start;
  margin-bottom: 1rem;
  .cogs-select__control--is-focused {
    outline: ${Colors['text-icon--interactive--default']} auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
  .cogs-select__single-value {
    color: ${Colors['decorative--grayscale--black']};
  }
  .cogs-select__clear-indicator::after {
    display: none;
  }
`;

export default DataSetIdInput;
