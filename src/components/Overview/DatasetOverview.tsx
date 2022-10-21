import styled from 'styled-components';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Card from 'antd/lib/card';
import BasicInfoCard from 'components/BasicInfoCard';
import { Title, Flex, Body, Button, Icon } from '@cognite/cogs.js';
import { ContentView, Divider, DataSet } from 'utils';
import { useTranslation } from 'common/i18n';
import UsersIcon from 'assets/Users.svg';
import { useResourceAggregates } from 'hooks/useResourceAggregates';

type DatasetOverviewProps = {
  dataset: DataSet;
  loading?: Boolean | undefined;
  onActiveTabChange: (tabKey: string) => void;
};
const DatasetOverview = ({
  dataset,
  onActiveTabChange,
}: DatasetOverviewProps): JSX.Element => {
  const { t } = useTranslation();

  const { id } = dataset;
  const [
    { data: assets },
    { data: timeseries },
    { data: files },
    { data: events },
    { data: sequences },
  ] = useResourceAggregates(id);

  const resourceAggregates = {
    assets: {
      name: 'Assets',
      value: assets?.[0]?.count || 0,
      icon: <Icon type="Assets" />,
    },
    events: {
      name: 'Events',
      value: events?.[0]?.count || 0,
      icon: <Icon type="Events" />,
    },
    files: {
      name: 'Files',
      value: files?.[0]?.count || 0,
      icon: <Icon type="Document" />,
    },
    sequences: {
      name: 'Sequences',
      value: sequences?.[0]?.count || 0,
      icon: <Icon type="Sequences" />,
    },
    timeseries: {
      name: 'Timeseries',
      value: timeseries?.[0]?.count || 0,
      icon: <Icon type="Timeseries" />,
    },
  } as const;

  return (
    <Row style={{ padding: 12 }}>
      <Col span={15}>
        <Row>
          <Col span={24}>
            <StyledCard>
              <StyledCardTitle level={5}>{t('description')}</StyledCardTitle>
              <Divider />
              <ContentView>{dataset?.description}</ContentView>
            </StyledCard>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <StyledCard>
              <Flex justifyContent="space-between" alignItems="center">
                <StyledCardTitle level={5}>{t('tab-overview')}</StyledCardTitle>
                <Button type="link" onClick={() => onActiveTabChange('data')}>
                  {t('view')}
                </Button>
              </Flex>
              <Divider />
              <Row style={{ padding: 12 }}>
                <Col span={24}>
                  {Object.keys(resourceAggregates).map((resource) => {
                    const resourceAggr =
                      resourceAggregates[
                        resource as keyof typeof resourceAggregates
                      ];
                    return (
                      <Row style={{ marginLeft: 18, padding: '12px 0' }}>
                        <Col span={8}>
                          <Flex direction="row" alignItems="center" gap={10}>
                            {resourceAggr.icon}
                            <Body level={1} strong className="aggr-title">
                              {resourceAggr.name}
                            </Body>
                          </Flex>
                        </Col>
                        <Col span={14}>
                          <Body level={1}>
                            {resourceAggr.value.toLocaleString()}
                          </Body>
                        </Col>
                      </Row>
                    );
                  })}
                </Col>
              </Row>
            </StyledCard>
          </Col>
          <Col span={12}>
            <StyledCard>
              <StyledCardTitle level={5}>
                {t('tab-access-control')}
              </StyledCardTitle>
              <Divider />
              <Flex
                alignItems="center"
                direction="column"
                style={{ margin: '46px auto' }}
              >
                <img src={UsersIcon} alt="Users" />
                <Title level={4}>{t('who-has-access')}</Title>
                <Body
                  level={2}
                  strong
                  className="mute"
                  style={{ padding: '2px 0 24px 0' }}
                >
                  {t('view-and-manage-user-permission')}
                </Body>
                <Button
                  type="secondary"
                  onClick={() => onActiveTabChange('access-control')}
                >
                  {t('manage')}
                </Button>
              </Flex>
            </StyledCard>
          </Col>
        </Row>
      </Col>
      <Col span={9}>
        <StyledCard>
          <StyledCardTitle level={5}>{t('summary')}</StyledCardTitle>
          <Divider />
          <BasicInfoCard dataSet={dataset} />
        </StyledCard>
      </Col>
    </Row>
  );
};

const StyledCard = styled(Card)`
  margin: 12px;
  height: auto;

  .aggr-title {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.7);
  }

  .mute {
    color: rgba(0, 0, 0, 0.55);
  }
`;

const StyledCardTitle = styled(Title)`
  padding: 16px 24px;
`;

export default DatasetOverview;
