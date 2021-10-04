import React from 'react';
import { Body } from '@cognite/cogs.js';
import { WorkflowStep } from 'modules/workflows';
import { ModelSelected } from 'modules/types';
import { useActiveWorkflow, useSavedSettings } from 'hooks';
import { Flex, PageTitle, CollapsibleRadio } from 'components/Common';
import NavigationStickyBottomRow from 'components/NavigationStickyBottomRow';
import {
  OptionPartialMatch,
  OptionMinTokens,
  OptionFieldsToMatch,
} from './AdvancedOptions';
import StandardModelTooltip from './StandardModelTooltip';
import SkipSettingsPanel from './SkipSettingsPanel';

type Props = {
  step: WorkflowStep;
};
export default function PageOptions(props: Props) {
  const { step } = props;
  const { workflowId } = useActiveWorkflow(step);

  const { modelSelected, setModelSelected } = useSavedSettings();

  const onModelSet = (model: string) =>
    setModelSelected(model as ModelSelected);

  return (
    <Flex column style={{ width: '100%' }}>
      <PageTitle
        title="Select model"
        subtitle="Select the model you want to be applied to create interactive diagrams"
      />
      <Flex row style={{ paddingBottom: '50px' }}>
        <Flex column style={{ width: '100%' }}>
          <CollapsibleRadio
            name="standard"
            value="standard"
            title="Standard model"
            info={<StandardModelTooltip />}
            groupRadioValue={modelSelected}
            setGroupRadioValue={onModelSet}
            maxWidth={1024}
            style={{ marginBottom: '14px' }}
          >
            <Body level={2}>
              This is recommended for most engineering diagrams.
            </Body>
          </CollapsibleRadio>
          <CollapsibleRadio
            name="advanced"
            value="advanced"
            title="Advanced model"
            groupRadioValue={modelSelected}
            setGroupRadioValue={onModelSet}
            maxWidth={1024}
            collapse={
              <>
                <OptionPartialMatch workflowId={workflowId} />
                <OptionMinTokens workflowId={workflowId} />
                <OptionFieldsToMatch workflowId={workflowId} />
              </>
            }
          >
            <Body level={2}>
              Allows you to configure advanced options such as number of tokens
              on the tag to match, partial matches, and other options.
            </Body>
          </CollapsibleRadio>
        </Flex>
        <SkipSettingsPanel />
      </Flex>
      <NavigationStickyBottomRow step={step} />
    </Flex>
  );
}
