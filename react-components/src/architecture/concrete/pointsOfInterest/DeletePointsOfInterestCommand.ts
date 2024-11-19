/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type ButtonType } from '../../../components/Architecture/types';
import { PointsOfInterestCommand } from './PointsOfInterestCommand';
import { type IconName } from '../../base/utilities/IconName';

export class DeleteSelectedPointsOfInterestCommand<
  PoiIdType
> extends PointsOfInterestCommand<PoiIdType> {
  public override get icon(): IconName {
    return 'Delete';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'POINT_OF_INTEREST_DELETE_THIS', fallback: 'Delete this Point of Interest' };
  }

  public override get buttonType(): ButtonType {
    return 'ghost-destructive';
  }

  protected override get shortCutKey(): string {
    return 'DELETE';
  }

  public override get isEnabled(): boolean {
    const poi = this.getPointsOfInterestDomainObject();

    return poi?.selectedPointsOfInterest !== undefined;
  }

  protected override invokeCore(): boolean {
    const pois = this.getPointsOfInterestDomainObject();
    const selectedOverlay = pois?.selectedPointsOfInterest;
    if (pois === undefined || selectedOverlay === undefined) {
      return false;
    }

    pois.removePointsOfInterest(selectedOverlay);
    pois.setSelectedPointOfInterest(undefined);
    void pois.save();

    return true;
  }
}
