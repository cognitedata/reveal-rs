//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import { Range1 } from '../../../Core/Geometry/Range1';
import { Ma } from '../../../Core/Primitives/Ma';
import { Random } from '../../../Core/Primitives/Random';

import { BaseLogSample } from '../../../SubSurface/Wells/Samples/BaseLogSample';
import { FloatLogSample } from '../../../SubSurface/Wells/Samples/FloatLogSample';
import { BaseLog } from '../../../SubSurface/Wells/Logs/BaseLog';
import { Statistics } from '../../../Core/Geometry/Statistics';

export class FloatLog extends BaseLog {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private _statistics: Statistics | undefined;

  //= =================================================
  // OVERRIDES of BaseLog
  //= =================================================

  public /* override */ getSampleByMd(md: number): BaseLogSample | null {
    return this.getConcreteSampleByMd(md);
  }

  //= =================================================
  // INSTANCE METHODS: Getters
  //= =================================================

  public getAt(index: number): FloatLogSample {
    return this.samples[index] as FloatLogSample;
  }

  public getConcreteSampleByMd(md: number): FloatLogSample | null {
    const floatIndex = this.getFloatIndexAtMd(md);
    if (floatIndex < 0) return null;

    const index = Math.floor(floatIndex);
    const remainder = floatIndex % 1;

    const minSample = this.samples[index] as FloatLogSample;
    if (Ma.isZero(remainder)) return minSample;

    const maxSample = this.samples[index + 1] as FloatLogSample;
    if (Ma.isZero(remainder - 1)) return maxSample;

    if (maxSample.isEmpty) return null;

    if (maxSample.isEmpty) return null;

    const value =
      minSample.value * (1 - remainder) + maxSample.value * remainder;
    return new FloatLogSample(value, md);
  }

  //= =================================================
  // INSTANCE METHODS: Range
  //= =================================================

  public get valueRange(): Range1 {
    const { statistics } = this;
    if (!statistics) return new Range1();
    return statistics.range;
  }

  public get statistics(): Statistics {
    if (!this._statistics) this._statistics = this.createStatistics();
    return this._statistics;
  }

  public touch(): void {
    super.touch();
    this._statistics = undefined;
  }

  private createStatistics(): Statistics {
    const statistics = new Statistics();
    for (let i = this.length - 1; i >= 0; i--) {
      const sample = this.getAt(i);
      if (sample.isMdEmpty || sample.isEmpty) continue;

      statistics.add(sample.value);
    }
    return statistics;
  }

  //= =================================================
  // INSTANCE METHODS: Operations
  //= =================================================

  public static createByRandom(mdRange: Range1, valueRange: Range1): FloatLog {
    const log = new FloatLog();
    const numSamples = 500;
    const mdInc = mdRange.delta / (numSamples - 1);

    for (let k = 0, md = mdRange.min; k < numSamples; k++, md += mdInc) {
      const value =
        k % 60 === 0
          ? Number.NaN
          : Random.getGaussian(valueRange.center, valueRange.delta);
      log.samples.push(new FloatLogSample(value, md));
    }
    return log;
  }
}
