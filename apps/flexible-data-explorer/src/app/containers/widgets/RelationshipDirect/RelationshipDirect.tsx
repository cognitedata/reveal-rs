import { useParams } from 'react-router-dom';

import capitalize from 'lodash/capitalize';

import { Icon } from '@cognite/cogs.js';

import { Button } from '../../../components/buttons/Button';
import { BaseWidgetProps, Widget } from '../../../components/widget/Widget';
import { DASH } from '../../../constants/common';
import { useNavigation } from '../../../hooks/useNavigation';
import { useInstanceDirectRelationshipQuery } from '../../../services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { InstancePreview } from '../../preview/InstancePreview';

interface Props extends BaseWidgetProps {
  type: {
    type: string;
    field: string;
  };
}

export const RelationshipDirectWidget: React.FC<Props> = ({
  id,
  rows,
  columns,
  type,
}) => {
  const { dataModel, space, version } = useParams();

  const { data, isLoading, isFetched } =
    useInstanceDirectRelationshipQuery(type);

  const navigate = useNavigation();

  const handleRedirectClick = () => {
    navigate.toInstancePage(type.type, data.space, data.externalId, {
      dataModel,
      space,
      version,
    });
  };

  const isDisabled = isFetched && data === null;

  const renderValueTitle = () => {
    if (isLoading) {
      return <Icon type="Loader" />;
    }

    return data?.name || data?.externalId || DASH;
  };

  if (!dataModel || !space || !version) {
    console.error('Missing dataModel, space or version in params');
    return null;
  }

  return (
    <Widget id={id} rows={rows} columns={columns}>
      <Widget.Header header={capitalize(type.field)} title={renderValueTitle()}>
        <InstancePreview.Generic
          instance={{
            instanceSpace: data?.space,
            dataType: type.type,
            externalId: data?.externalId,
          }}
          dataModel={{
            externalId: dataModel,
            space,
            version,
          }}
          disabled={isDisabled}
        >
          <Button.InternalRedirect
            onClick={() => {
              handleRedirectClick();
            }}
            disabled={isLoading || isDisabled}
          />
        </InstancePreview.Generic>
      </Widget.Header>
    </Widget>
  );
};
