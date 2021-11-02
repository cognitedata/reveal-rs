import styled from 'styled-components/macro';
import { useHistory, useParams } from 'react-router-dom';
import { Icon, Tooltip } from '@cognite/cogs.js';

type SideBarProps = {
  items: Array<SideBarItem>;
};

export type SideBarItem = {
  icon: JSX.Element;
  page: string;
  slug: string;
  tooltip?: string;
};

export const SideBarMenu = ({ items }: SideBarProps) => {
  const { solutionId, solutionPage } = useParams<{
    solutionId: string;
    solutionPage: string;
  }>();

  const history = useHistory();

  const onRoute = (page: string, slug: string) => {
    history.push(`/solutions/${solutionId}/${page}/${slug}`);
  };

  const renderIcon = (item: SideBarItem, key: number) => {
    return (
      <StyledItem
        key={item.slug}
        onClick={() => onRoute(item.page, item.slug)}
        active={solutionPage === item.slug || (!key && !solutionPage)}
      >
        {item.icon}
      </StyledItem>
    );
  };

  return (
    <StyledSideBarMenu>
      <div>
        {items.map((item, key) => {
          if (item.tooltip) {
            return (
              <Tooltip
                placement="right"
                content={item.tooltip}
                arrow={false}
                delay={250}
              >
                {renderIcon(item, key)}
              </Tooltip>
            );
          }
          return renderIcon(item, key);
        })}
      </div>
      <div>
        <StyledItem>
          <Icon type="Help" />
        </StyledItem>
      </div>
    </StyledSideBarMenu>
  );
};

const StyledSideBarMenu = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 5.6rem;
  padding: 0 1rem;
  border-right: solid 1px var(--cogs-greyscale-grey3);
`;

type StyledIconProps = {
  active?: boolean;
};

const StyledItem = styled.div<StyledIconProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3.5rem;
  margin: 1rem 0;
  cursor: pointer;
  border-radius: 5px;
  background-color: ${(props: StyledIconProps) =>
    props.active ? 'var(--cogs-midblue-7)' : 'transparent'};
  transition: all 350ms linear;

  * {
    width: 2.15rem;
    fill: ${(props: StyledIconProps) =>
      props.active ? 'var(--cogs-primary)' : 'var(--cogs-greyscale-grey7)'};
  }

  :hover {
    background-color: ${(props: StyledIconProps) =>
      props.active ? 'var(--cogs-midblue-7)' : 'var(--cogs-midblue-7)'};
  }
`;
