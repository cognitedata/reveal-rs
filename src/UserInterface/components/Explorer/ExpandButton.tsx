import React, { useState } from "react";
import styled from "styled-components";
import {
  ExpandOpen,
  ExpandClosed,
  ExpandOpenFocus,
  ExpandClosedFocus
} from "@/UserInterface/utils/Icon";
interface ExpandProps {
  readonly expanded?: boolean;
}

const Expand = styled.div<ExpandProps>`
  height: 0.7em;
  width: 0.8em;
  background-image: ${(props) =>
    props.expanded ? `url(${ExpandOpen})` : `url(${ExpandClosed})`};
  background-repeat: no-repeat, no-repeat;
  .expand-btn:hover & {
    background-image: ${(props) =>
      props.expanded ? `url(${ExpandOpenFocus})` : `url(${ExpandClosedFocus})`};
    background-repeat: no-repeat, no-repeat;
  }
`;
export function ExpandButton(props: {
  expandable: boolean;
  expanded: boolean;
  onExpand: (e: any) => void;
  onCollapse: (e: any) => void;
}) {
  const [expanded, setExpanded] = useState(props.expanded);

  const handleClick = function(e: any) {
    if (expanded) {
      props.onCollapse(e);
    } else {
      props.onExpand(e);
    }
    setExpanded(!expanded);
  };
  if (props.expandable) {
    return (
      <div className="expand-btn clickable center" onClick={handleClick}>
        <Expand expanded={props.expanded} />
      </div>
    );
  } else {
    return <div className="expand-btn" />;
  }
}
