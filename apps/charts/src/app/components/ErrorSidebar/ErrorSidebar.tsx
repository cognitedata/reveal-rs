/**
 * Error Sidebar
 */

import { memo } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { Button, Infobox, Tooltip } from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { WorkflowState } from '../../models/calculation-results/types';
import { makeDefaultTranslations } from '../../utils/translations';
import {
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
  ContentContainer,
  LoadingRow,
} from '../Common/SidebarElements';
import { StyleButton } from '../StyleButton/StyleButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  calculationResult: WorkflowState | undefined;
  workflowColor: string;
};

const defaultTranslation = makeDefaultTranslations(
  'Calculation status',
  "This is an empty calculation and it hasn't run yet.",
  'Info',
  'Error',
  'Warning',
  'Hide'
);

const ErrorSidebar = memo(
  ({ visible, onClose, calculationResult, workflowColor }: Props) => {
    const t = {
      ...defaultTranslation,
      ...useTranslations(Object.keys(defaultTranslation), 'ErrorSidebar').t,
    };

    return (
      <Sidebar visible={visible}>
        <TopContainer>
          <TopContainerTitle>
            <StyleButton
              icon="Function"
              styleColor={workflowColor}
              label="Workflow Function"
              style={{ marginRight: '0.5rem' }}
            />
            {t['Calculation status']}
          </TopContainerTitle>
          <TopContainerAside>
            <Tooltip content={t.Hide}>
              <Button
                icon="Close"
                type="ghost"
                onClick={onClose}
                aria-label="Close"
              />
            </Tooltip>
          </TopContainerAside>
        </TopContainer>
        <ContentOverflowWrapper>
          <ContentContainer>
            {calculationResult &&
              'status' in calculationResult &&
              calculationResult.loading && <LoadingRow />}
            {calculationResult && !calculationResult.loading ? (
              <>
                {!calculationResult.status && (
                  <Infobox title={t.Info} style={{ marginBottom: '1rem' }}>
                    {t["This is an empty calculation and it hasn't run yet."]}
                  </Infobox>
                )}
                {calculationResult.error && (
                  <Infobox
                    type="danger"
                    title={t.Error}
                    style={{ marginBottom: '1rem' }}
                  >
                    {calculationResult.error}
                  </Infobox>
                )}

                {calculationResult.warnings &&
                  calculationResult.warnings.map((warning) => (
                    <Infobox
                      type="warning"
                      title={t.Warning}
                      key={uuidv4()}
                      style={{ marginBottom: '1rem' }}
                    >
                      {warning}
                    </Infobox>
                  ))}
              </>
            ) : (
              ''
            )}
          </ContentContainer>
        </ContentOverflowWrapper>
      </Sidebar>
    );
  }
);

export default ErrorSidebar;
