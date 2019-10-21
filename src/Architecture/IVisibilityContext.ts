//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { BaseNode } from "../Nodes/BaseNode";
import { BaseView } from "../Views/BaseView";
import { ITargetId } from "./ITargetId";

export interface IVisibilityContext extends ITargetId
{
  canShowView(node: BaseNode): boolean;
  isVisibleView(node: BaseNode): boolean;
  showView(node: BaseNode): boolean;
  hideView(node: BaseNode): boolean;
  removeViewShownHere(view: BaseView): void;
}
