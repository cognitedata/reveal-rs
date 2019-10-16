import { BaseView } from "../Views/BaseView";
import { TargetNode } from "../Nodes/TargetNode";

class ChangedDecription
{
  public changed: Symbol;
  public fieldName: string | undefined;

  public constructor(changed: Symbol, fieldName?: string)
  {
    this.changed = changed;
    this.fieldName = fieldName;
  }
}

export class NodeEventArgs
{
    //==================================================
    // STATIC FIELDS
    //==================================================

    public static readonly nodeName: Symbol = Symbol("nodeName");
    public static readonly nodeVisible: Symbol = Symbol("nodeVisible");
    public static readonly nodeColor: Symbol = Symbol("nodeColor");
    //........more will core here

    //==================================================
    // FIELDS
    //==================================================

    private _changes: Array<ChangedDecription> | null = null;

    //==================================================
    // CONSTRUCTORS
    //==================================================

  public constructor(changed?: Symbol, fieldName?: string)
  {
    if (changed == undefined)
      return;
     if (this._changes == null)
       this._changes = new Array<ChangedDecription>();
    this._changes.push(new ChangedDecription(changed, fieldName))
  }

    //==================================================
    // INSTANCE METHODS: Requests
    //==================================================

  public get isEmpty() : boolean { return this._changes == null || this._changes.length == 0;}

  public isChanged(changed: Symbol): boolean
  {
    let changedDecription = this.getChangedDecription(changed);
    return changedDecription != undefined;
  }

    //==================================================
    // INSTANCE METHODS: Getters
    //==================================================

  public getChangedDecription(changed: Symbol): ChangedDecription | undefined
  {
    if (this._changes == null)
      return undefined;
    return this._changes.find((desc: ChangedDecription) => desc.changed == changed);
  }

  public getFieldName(changed: Symbol): string | undefined
  {
    let changedDecription = this.getChangedDecription(changed);
    return (changedDecription == undefined) ? undefined : changedDecription.fieldName;
  }
}
