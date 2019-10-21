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

import { NodeEventArgs } from "../Architecture/NodeEventArgs";
import { VisualNode } from "../Nodes/VisualNode";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { TargetId } from "../Core/TargetId";
import { ITargetId } from "../Architecture/ITargetId";

export abstract class BaseView
{
    //==================================================
    // FIELDS
    //==================================================

    private _node: VisualNode | null = null;
    private _target: ITargetId | null = null;
    private _isVisible: boolean = false;

    //==================================================
    // PROPERTIES
    //==================================================

    public get isVisible(): boolean { return this._isVisible; }
    public set isVisible(value: boolean) { this._isVisible = value; }
    public get stayAliveIfInvisible(): boolean { return false; }

    //==================================================
    // CONSTRUCTORS
    //==================================================

    protected constructor() { }

    //==================================================
    // INSTANCE METHODS: Getters
    //==================================================

    public getNode(): VisualNode | null { return this._node; }
    public getTarget(): ITargetId | null { return this._target; }

    protected getStyle(): BaseRenderStyle | null
    {
        if (!this._node)
            return null;
        if (!this._target)
            return this._node.getRenderStyle(TargetId.empty);
        return this._node.getRenderStyle(this._target.targetId);
    }

    //==================================================
    // VIRTUAL METHODS: 
    //==================================================

    public /*virtual*/ initialize(): void
    {
        // Override this function to initialize your view
    }

    public /*virtual*/ update(args: NodeEventArgs): void
    {
        // Override this function to update your view
    }

    public /*virtual*/ clearMemory(args: NodeEventArgs): void
    {
        // Override this function to remove redundant data
    }

    public /*virtual*/ onShow(): void
    {
        // Override this function to when your view
        // need to do something when it is set visible
    }

    public /*virtual*/ onHide(): void
    {
        // Override this function to when your view
        // need to do something when it is set NOT visible
    }

    public /*virtual*/ dispose(): void
    {
        // Override this function to when your view
        // need to do something when it is set NOT visible
        // Called just before removal from view list and detach
    }

    //==================================================
    // INSTANCE METHODS: 
    //==================================================

    public isOwner(node: VisualNode): boolean
    {
        return this._node != null && this._node === node;
    }

    public detach(): void
    {
        this._node = null;
        this._target = null;
        // Override this function to when your view
        // need to do something when it is set NOT visible
    }

    public attach(node: VisualNode, target: ITargetId): void
    {
        // This is called after dispose
        this._node = node;
        this._target = target;
    }
}