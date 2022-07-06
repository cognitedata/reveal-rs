import { CogniteClient } from '@cognite/sdk';
import OrnateTimeSeriesTag from 'components/TimeseriesTag/OrnateTimeSeriesTag';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BlueprintDefinition, RuleOutput, TimeSeriesTag } from 'typings';
// import { NodeConfig, Node } from 'konva/lib/Node';
import { Drawer } from '@cognite/cogs.js';
import { RuleSetsDrawer } from 'components/RuleSetDrawer/RuleSetsDrawer';
import { CogniteOrnate, defaultColor, ToolNodeStyle, ToolType } from 'ornate';
import { Ornate } from 'ornate/react';
import { NodeStyle, StyleSelector, Toolbar } from 'ornate/react/components';
import BaseAttributesControl from 'components/ContextMenu/ContextMenuItems/AttributesControl';
import { ControlProps } from 'ornate/react/components/context-menu/controls';

import { useRuleSetEvaluation } from './useRuleSetEvaluation';
import { BlueprintWrapper } from './elements';
import { BaseRuleControl } from './RuleControl/RuleControl';

export type BlueprintProps = {
  client: CogniteClient;
  blueprint?: BlueprintDefinition;
  onUpdate?: (nextBlueprint: BlueprintDefinition) => void;
  onSelectTag?: (nextTagId: string) => void;
  onDeleteTag?: (tag: TimeSeriesTag) => void;
  // onSelectNodes?: (nodes: Node<NodeConfig>[]) => void;
  onReady?: (viewer: MutableRefObject<CogniteOrnate | undefined>) => void;
  isAllMinimized?: boolean;
  disabledRulesets?: Record<string, boolean>;
};

const DEFAULT_STYLE: NodeStyle = {
  fill: defaultColor.rgb().string(),
  stroke: defaultColor.alpha(1).rgb().string(),
  strokeWidth: 12,
  fontSize: '18',
};

const Blueprint = ({
  client,
  blueprint,
  onUpdate,
  onSelectTag,
  onDeleteTag,
  onReady,
  isAllMinimized,
  disabledRulesets,
}: BlueprintProps) => {
  const ornateViewer = useRef<CogniteOrnate>();
  const [activeStyle, setActiveStyle] = useState(DEFAULT_STYLE);
  const [isReady, setIsReady] = useState(false);
  const [loadedBlueprint, setLoadedBlueprint] = useState<BlueprintDefinition>();
  const [activeTool, setActiveTool] = useState<ToolType>('HAND');
  const [isCreatingNewRuleSet, setIsCreatingNewRuleSet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [ruleSetResults, setRuleSetResults] = useState<
    Record<string, RuleOutput[]>
  >({});

  useEffect(() => {
    Object.keys(ruleSetResults).forEach((shapeKey) => {
      if (!ornateViewer.current) return;
      ornateViewer.current.stage.find(`#${shapeKey}`).forEach((shape) => {
        const activeRules = ruleSetResults[shapeKey].map(({ id, ...rest }) =>
          id && disabledRulesets?.[id] ? {} : rest
        );

        shape.setAttrs(Object.assign({ fill: 'grey' }, ...activeRules));
      });
    });
  }, [ruleSetResults, disabledRulesets]);

  const queriesResults = useRuleSetEvaluation(
    blueprint,
    (shapeKey, result) => {
      setErrors((prev) => ({
        ...prev,
        [shapeKey]: undefined,
      }));
      setRuleSetResults((prev) => ({
        ...prev,
        [shapeKey]: result,
      }));
    },
    (shapeKey, error) => {
      console.log('setting errors', shapeKey, error);
      setErrors((prev) => ({
        ...prev,
        [shapeKey]: error,
      }));
    }
  );

  useEffect(() => {
    if (blueprint && loadedBlueprint?.id !== blueprint.id) {
      setLoadedBlueprint(blueprint);
    }
  }, [blueprint, loadedBlueprint]);
  const handleStyleChange = (nextStyle: ToolNodeStyle) => {
    if (ornateViewer.current) {
      ornateViewer.current.style = nextStyle;
    }
    setActiveStyle({ ...activeStyle, ...nextStyle });
  };

  const getSecondaryToolbar = () => {
    if (['CIRCLE', 'LINE', 'RECT', 'TEXT'].includes(activeTool)) {
      const style = { ...activeStyle };
      if (['CIRCLE', 'RECT'].includes(activeTool)) {
        delete style.fontSize;
      }
      if (activeTool === 'LINE') {
        delete style.fill;
        delete style.fontSize;
      }
      if (activeTool === 'TEXT') {
        delete style.stroke;
        delete style.strokeWidth;
      }
      return <StyleSelector style={style} onChange={handleStyleChange} />;
    }
    return null;
  };

  const RuleControl: React.FC<ControlProps> = useCallback(
    ({ nodes }) => {
      return (
        <BaseRuleControl
          ruleSets={blueprint?.ruleSets}
          shapeRuleSetsIds={blueprint?.shapeRuleSets?.[nodes[0].id()] || []}
          onNewRuleSet={() => {
            setIsCreatingNewRuleSet(true);
          }}
          onClickRuleSet={(nextRuleSetId: string) => {
            if (onUpdate && blueprint) {
              const currentSelectedRuleSetsForShape =
                blueprint?.shapeRuleSets?.[nodes[0].id()] || [];
              let nextRulesForShape = [...currentSelectedRuleSetsForShape];
              if (currentSelectedRuleSetsForShape.includes(nextRuleSetId)) {
                nextRulesForShape = nextRulesForShape.filter(
                  (x) => x !== nextRuleSetId
                );
              } else {
                nextRulesForShape = nextRulesForShape.concat(nextRuleSetId);
              }
              const nextBlueprint: BlueprintDefinition = {
                ...blueprint,
                shapeRuleSets: nodes.reduce(
                  (acc, node) => ({
                    ...acc,
                    [node.id()]: nextRulesForShape,
                  }),
                  blueprint.shapeRuleSets
                ),
              };

              onUpdate(nextBlueprint);
            }
          }}
        />
      );
    },
    [blueprint]
  );

  const AttributeControl: React.FC<ControlProps> = useCallback(
    ({ nodes }) => {
      return (
        <BaseAttributesControl
          attributes={blueprint?.shapeAttributes?.[nodes[0].id()] || []}
          onChange={(nextAttributes) => {
            if (onUpdate && blueprint) {
              const nextBlueprint: BlueprintDefinition = {
                ...blueprint,
                shapeAttributes: nodes.reduce(
                  (acc, node) => ({
                    ...acc,
                    [node.id()]: nextAttributes,
                  }),
                  blueprint?.shapeAttributes || {}
                ),
              };

              onUpdate(nextBlueprint);
            }
          }}
        />
      );
    },
    [blueprint]
  );

  return (
    <BlueprintWrapper>
      <Ornate
        shapes={[]}
        activeTool={activeTool}
        onReady={(instance) => {
          ornateViewer.current = instance;
          setIsReady(true);
          if (onReady) {
            onReady(ornateViewer);
          }
        }}
        contextMenuProps={{
          additionalControls: (shapeTypes) =>
            shapeTypes.some((type) => ['CIRCLE', 'RECT', 'LINE'].includes(type))
              ? [RuleControl, AttributeControl]
              : [],
        }}
      />
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        tools={[
          'HAND',
          'SELECT',
          'DIVIDER',
          'RECT',
          'CIRCLE',
          'PATH',
          'LINE',
          'TEXT',
        ]}
        secondaryToolbar={getSecondaryToolbar()}
      />
      {isReady &&
        blueprint?.timeSeriesTags.map((tag) => (
          <OrnateTimeSeriesTag
            key={tag.id}
            timeSeriesTag={tag}
            ornateViewer={ornateViewer}
            client={client}
            onChangeSettings={() => onSelectTag && onSelectTag(tag.id)}
            onDelete={() => onDeleteTag && onDeleteTag(tag)}
            isMinimized={isAllMinimized}
            onUpdate={(nextTag) => {
              if (onUpdate) {
                const nextBlueprint: BlueprintDefinition = {
                  ...blueprint,
                  timeSeriesTags: blueprint.timeSeriesTags.map((t) => {
                    if (t.id === tag.id) {
                      return nextTag;
                    }
                    return t;
                  }),
                };

                onUpdate(nextBlueprint);
              }
            }}
          />
        ))}
      <Drawer
        visible={isCreatingNewRuleSet}
        width={360}
        onClose={() => {
          setIsCreatingNewRuleSet(false);
        }}
      >
        <RuleSetsDrawer
          ruleSets={blueprint?.ruleSets || []}
          issues={errors}
          onIssueClick={(shapeKey) => {
            ornateViewer.current?.zoomToNode(
              ornateViewer.current.stage.find(`#${shapeKey}`)[0]
            );
          }}
          onDeleteRuleSet={(ruleSet) => {
            if (!blueprint || !onUpdate) return;
            const nextRuleSets = blueprint.ruleSets?.filter(
              (r) => r.id !== ruleSet.id
            );
            const nextShapeRuleSets = { ...blueprint.shapeRuleSets };
            Object.keys(nextShapeRuleSets).forEach((shapeKey) => {
              nextShapeRuleSets[shapeKey] = nextShapeRuleSets[shapeKey].filter(
                (r) => r !== ruleSet.id
              );
              if (nextShapeRuleSets[shapeKey].length === 0) {
                delete nextShapeRuleSets[shapeKey];
              }
            });
            const nextBlueprint: BlueprintDefinition = {
              ...blueprint,
              ruleSets: nextRuleSets,
              shapeRuleSets: nextShapeRuleSets,
            };
            onUpdate(nextBlueprint);
          }}
          onUpdateRuleSets={(next) => {
            if (!blueprint || !onUpdate) return;

            const nextBlueprint: BlueprintDefinition = {
              ...blueprint,
              ruleSets: next,
            };
            onUpdate(nextBlueprint);
            queriesResults.refetch();
          }}
        />
      </Drawer>
    </BlueprintWrapper>
  );
};

export default Blueprint;
