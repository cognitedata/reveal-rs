import { PidGroup } from '../../pid';
import { PidDocument } from '../../pid/PidDocument';
import { detectSymbols } from '../findAllInstancesOfSymbol';

describe('findAllInstancesOfSymbol', () => {
  test('two boxes and a line (one path each)', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

      <path d="M 200,200 h 100 v 100 h -100 v -100" id="path002" />

      <path d="M 100,100 l 100,100" id="path003" />
    </svg>
    `);

    const pidGroup = new PidGroup([pidDocument.getPidPathById('path001')!]);
    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(2);
  });

  test('two overlapping boxes (one path each)', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />
      <path d="M 100,100 h 100 v 100 h -100 v -100" id="path002" />
    </svg>
    `);

    const pidGroup = new PidGroup([pidDocument.getPidPathById('path001')!]);
    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(2);
  });

  test('one boxes (one path per line)', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0,0 L 100,0" id="path001" />
      <path d="M 100,0 L 100,100" id="path002" />
      <path d="M 100,100 L 0,100" id="path003" />
      <path d="M 0,100 L 0,0" id="path004" />
    </svg>
    `);

    const pidGroup = PidGroup.fromSvgPaths([
      { svgCommands: 'M 0,0 h 100 v 100 h -100 v -100' },
    ]);
    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(1);
  });

  test('two overlapping boxes (one path per line)', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0,0 L 100,0" id="path001" />
      <path d="M 100,0 L 100,100" id="path002" />
      <path d="M 100,100 L 0,100" id="path003" />
      <path d="M 0,100 L 0,0" id="path004" />

      <path d="M 100,100 L 200,100" id="path005" />
      <path d="M 200,100 L 200,200" id="path008" />
      <path d="M 200,200 L 100,200" id="path006" />
      <path d="M 100,200 L 100,100" id="path007" />
    </svg>
    `);

    const pidGroup = PidGroup.fromSvgPaths([
      { svgCommands: 'M 0,0 h 100 v 100 h -100 v -100' },
    ]);
    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(2);
  });

  test('One iso valve', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 973.067 474.133 l 0.320 0.480 l 3.040 -2.400 l -3.360 1.920 M 973.387 474.613 l 3.040 -2.400 l -0.480 0.960 l -2.560 1.440 M 976.427 472.213 l -0.480 0.960 l 0.480 17.920 v -18.880 M 975.947 473.173 l 0.480 17.920 h -0.480 v -17.920" id="path0001" />
      <path d="M 991.947 463.893 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 992.587 462.933 l -3.040 2.400 l -0.640 -0.320 l 3.680 -2.080 M 989.547 465.333 l -0.640 -0.320 l 0.640 18.080 v -17.760 M 988.907 465.013 l 0.640 18.080 l -0.640 1.120 v -19.200 M 989.547 483.093 l -0.640 1.120 l 3.040 -2.560 l -2.400 1.440 M 988.907 484.213 l 3.040 -2.560 l 0.640 0.480 l -3.680 2.080 M 991.947 481.653 l 0.640 0.480 l -0.640 -18.240 v 17.760 M 992.587 482.133 l -0.640 -18.240 l 0.640 -0.960 v 19.200" id="path0002" />
      <path d="M 970.507 494.133 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 969.867 495.093 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 972.907 492.693 l 0.640 0.320 l -0.640 -18.080 v 17.760 M 973.547 493.013 l -0.640 -18.080 l 0.640 -1.120 v 19.200 M 972.907 474.933 l 0.640 -1.120 l -3.040 2.400 l 2.400 -1.280 M 973.547 473.813 l -3.040 2.400 l -0.640 -0.320 l 3.680 -2.080 M 970.507 476.213 l -0.640 -0.320 l 0.640 18.240 v -17.920 M 969.867 475.893 l 0.640 18.240 l -0.640 0.960 v -19.200" id="path0003" />
      <path d="M 975.947 491.093 h 0.480 l -0.480 -17.920 v 17.920 M 976.427 491.093 l -0.480 -17.920 l 0.480 -0.960 v 18.880 M 975.947 473.173 l 0.480 -0.960 l -2.880 2.400 l 2.400 -1.440 M 976.427 472.213 l -2.880 2.400 l -0.640 -0.480 l 3.520 -1.920 M 973.547 474.613 l -0.640 -0.480 l 0.640 18.240 v -17.760 M 972.907 474.133 l 0.640 18.240 l -0.640 0.960 v -19.200 M 973.547 492.373 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 972.907 493.333 l 3.040 -2.400 l 0.480 0.480 l -3.520 1.920 M 975.947 490.933 l 0.480 0.480 l 9.600 -24.800 l -10.080 24.320 M 976.427 491.413 l 9.600 -24.800 l 0.480 0.480 l -10.080 24.320 M 986.027 466.613 l 0.480 0.480 l 2.560 -2.240 l -3.040 1.760 M 986.507 467.093 l 2.560 -2.240 l 0.320 0.480 l -2.880 1.760" id="path0004" />
      <path d="M 985.867 485.333 h 0.640 l -0.640 -18.720 v 18.720 M 986.507 485.333 l -0.640 -18.720 l 0.640 0.480 v 18.240 M 985.867 466.613 l 0.640 0.480 l 3.040 -2.400 l -3.680 1.920 M 986.507 467.093 l 3.040 -2.400 l -0.640 0.960 l -2.400 1.440 M 989.547 464.693 l -0.640 0.960 l 0.640 18.080 v -19.040 M 988.907 465.653 l 0.640 18.080 l -0.640 -0.320 v -17.760 M 989.547 483.733 l -0.640 -0.320 l -2.720 2.400 l 3.360 -2.080 M 988.907 483.413 l -2.720 2.400 l 0.160 -0.800 l 2.560 -1.600 M 986.187 485.813 l 0.160 -0.800 l -10.240 -12.000 l 10.080 12.800 M 986.347 485.013 l -10.240 -12.000 l 0.160 -0.800 l 10.080 12.800 M 976.107 473.013 l 0.160 -0.800 l -2.880 2.400 l 2.720 -1.600 M 976.267 472.213 l -2.880 2.400 l -0.320 -0.480 l 3.200 -1.920" id="path0005" />
    </svg>
    `);

    const pidGroup = new PidGroup(
      ['path0001', 'path0002', 'path0003', 'path0004', 'path0005'].map(
        (pathId) => pidDocument.getPidPathById(pathId)!
      )
    );

    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(1);
  });

  test('T-shape matched to flange', async () => {
    // Flange part
    // <path d="M 494.240 684.960 v -6.080" id="path0001" />

    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 497.280 684.960 v -6.080" id="path0002" />
      <path d="M 503.360 681.920 h -6.080" id="path0003" />
    </svg>
    `);

    const pidGroup = PidGroup.fromSvgPaths([
      { svgCommands: 'M 494.240 684.960 v -6.080' },
      { svgCommands: 'M 497.280 684.960 v -6.080' },
    ]);

    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(0);

    // const expected = ['path0001', 'path0002'];
    // const detectionPathIds = detections[0].pathIds;
    // expect(detectionPathIds.length).toEqual(2);
    // expect(detectionPathIds).toEqual(expect.arrayContaining(expected));
  });

  test('Two PID valves', async () => {
    // First vertical, second horizontal
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 1077.920 720.960 h -6.080 l 6.080 -12.160 h -6.080 l 6.080 12.160" id="path001" />
      <path d="M 1117.280 733.280 v -5.920 l 12.000 5.920 v -5.920 l -12.000 5.920" id="path002" />
    </svg>
    `);

    const pidGroup = PidGroup.fromSvgPaths([
      {
        svgCommands:
          'M 1117.280 733.280 v -5.920 l 12.000 5.920 v -5.920 l -12.000 5.920',
      },
    ]);

    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    const expectedPathIds = ['path001', 'path002'];
    expect(detections.flatMap((detection) => detection.pathIds)).toEqual(
      expect.arrayContaining(expectedPathIds)
    );

    expect(detections.length).toEqual(2);
  });

  test('PID valve overlapping', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 966.080 250.080 l 3.040 6.080 l 3.040 -6.080 h -6.080 M 969.120 256.160 l 3.040 -6.080 h 0.000 l -3.040 6.080" id="path0001" />
      <path d="M 972.160 250.080 l -3.040 6.080 l -3.040 -6.080 h 6.080" id="path0002" />
      <path d="M 966.080 262.240 l 3.040 -6.080 l 3.040 6.080 h -6.080" id="path0003" />
      <path d="M 966.080 262.240 l 3.040 -6.080 l 3.040 6.080 h -6.080 M 969.120 256.160 l 3.040 6.080 h 0.000 l -3.040 -6.080" id="path0004" />
    </svg>
    `);

    const pidGroup = new PidGroup(pidDocument.pidPaths);
    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(1);
  });

  test('Three ISO valves', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 563.147 137.173 h -0.480 l 0.480 18.720 v -18.720 M 562.667 137.173 l 0.480 18.720 l -0.480 -0.320 v -18.400 M 563.147 155.893 l -0.480 -0.320 l -3.040 2.400 l 3.520 -2.080 M 562.667 155.573 l -3.040 2.400 l 0.640 -0.960 l 2.400 -1.440 M 559.627 157.973 l 0.640 -0.960 l -0.640 -18.240 v 19.200 M 560.267 157.013 l -0.640 -18.240 l 0.640 0.320 v 17.920 M 559.627 138.773 l 0.640 0.320 l 2.720 -2.240 l -3.360 1.920 M 560.267 139.093 l 2.720 -2.240 l -0.160 0.640 l -2.560 1.600 M 562.987 136.853 l -0.160 0.640 l 10.240 12.000 l -10.080 -12.640 M 562.827 137.493 l 10.240 12.000 l -0.160 0.800 l -10.080 -12.800 M 573.067 149.493 l -0.160 0.800 l 2.880 -2.400 l -2.720 1.600 M 572.907 150.293 l 2.880 -2.400 l 0.320 0.480 l -3.200 1.920" id="path0001" />
      <path d="M 573.227 131.413 h -0.640 l 0.640 18.080 v -18.080 M 572.587 131.413 l 0.640 18.080 l -0.640 0.960 v -19.040 M 573.227 149.493 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 572.587 150.453 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 575.627 148.053 l 0.640 0.320 l -0.640 -18.240 v 17.920 M 576.267 148.373 l -0.640 -18.240 l 0.640 -0.960 v 19.200 M 575.627 130.133 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 576.267 129.173 l -3.040 2.400 l -0.480 -0.320 l 3.520 -2.080 M 573.227 131.573 l -0.480 -0.320 l -9.600 24.640 l 10.080 -24.320 M 572.747 131.253 l -9.600 24.640 l -0.480 -0.320 l 10.080 -24.320 M 563.147 155.893 l -0.480 -0.320 l -2.560 2.080 l 3.040 -1.760 M 562.667 155.573 l -2.560 2.080 l -0.320 -0.480 l 2.880 -1.600" id="path0002" />
      <path d="M 578.667 128.373 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 579.307 127.413 l -3.040 2.400 l -0.640 -0.320 l 3.680 -2.080 M 576.267 129.813 l -0.640 -0.320 l 0.640 18.240 v -17.920 M 575.627 129.493 l 0.640 18.240 l -0.640 0.960 v -19.200 M 576.267 147.733 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 575.627 148.693 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 578.667 146.293 l 0.640 0.320 l -0.640 -18.240 v 17.920 M 579.307 146.613 l -0.640 -18.240 l 0.640 -0.960 v 19.200" id="path0003" />
      <path d="M 556.747 156.373 l 0.320 -0.480 l -5.600 -3.040 l 5.280 3.520 M 557.067 155.893 l -5.600 -3.040 l 0.800 -0.160 l 4.800 3.200 M 551.467 152.853 l 0.800 -0.160 l 4.320 -9.120 l -5.120 9.280 M 552.267 152.693 l 4.320 -9.120 l 0.480 0.320 l -4.800 8.800" id="path0004" />
      <path d="M 557.227 158.613 l -0.640 1.120 l 3.040 -2.400 l -2.400 1.280 M 556.587 159.733 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 559.627 157.333 l 0.640 0.320 l -0.640 -18.240 v 17.920 M 560.267 157.653 l -0.640 -18.240 l 0.640 -0.960 v 19.200 M 559.627 139.413 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 560.267 138.453 l -3.040 2.400 l -0.640 -0.320 l 3.680 -2.080 M 557.227 140.853 l -0.640 -0.320 l 0.640 18.080 v -17.760 M 556.587 140.533 l 0.640 18.080 l -0.640 1.120 v -19.200" id="path0005" />
      <path d="M 578.667 143.253 l 0.480 0.320 l 4.480 -9.120 l -4.960 8.800 M 579.147 143.573 l 4.480 -9.120 l 0.800 -0.320 l -5.280 9.440 M 583.627 134.453 l 0.800 -0.320 l -5.600 -2.880 l 4.800 3.200 M 584.427 134.133 l -5.600 -2.880 l 0.320 -0.480 l 5.280 3.360" id="path0006" />
      <path d="M 576.107 148.373 l -0.320 -0.480 l -3.200 2.560 l 3.520 -2.080 M 575.787 147.893 l -3.200 2.560 l 0.640 -0.960 l 2.560 -1.600 M 572.587 150.453 l 0.640 -0.960 l -0.640 -18.080 v 19.040 M 573.227 149.493 l -0.640 -18.080 h 0.640 v 18.080" id="path0007" />

      <path d="M 568.907 391.573 h -0.480 l 0.480 18.560 v -18.560 M 568.427 391.573 l 0.480 18.560 l -0.480 -0.320 v -18.240 M 568.907 410.133 l -0.480 -0.320 l -3.040 2.400 l 3.520 -2.080 M 568.427 409.813 l -3.040 2.400 l 0.640 -0.960 l 2.400 -1.440 M 565.387 412.213 l 0.640 -0.960 l -0.640 -18.240 v 19.200 M 566.027 411.253 l -0.640 -18.240 l 0.640 0.320 v 17.920 M 565.387 393.013 l 0.640 0.320 l 2.720 -2.240 l -3.360 1.920 M 566.027 393.333 l 2.720 -2.240 l -0.160 0.800 l -2.560 1.440 M 568.747 391.093 l -0.160 0.800 l 10.240 12.000 l -10.080 -12.800 M 568.587 391.893 l 10.240 12.000 l -0.160 0.640 l -10.080 -12.640 M 578.827 403.893 l -0.160 0.640 l 2.880 -2.240 l -2.720 1.600 M 578.667 404.533 l 2.880 -2.240 l 0.320 0.480 l -3.200 1.760" id="path0008" />
      <path d="M 578.987 385.653 h -0.640 l 0.640 18.080 v -18.080 M 578.347 385.653 l 0.640 18.080 l -0.640 0.960 v -19.040 M 578.987 403.733 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 578.347 404.693 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 581.387 402.293 l 0.640 0.320 l -0.640 -18.080 v 17.760 M 582.027 402.613 l -0.640 -18.080 l 0.640 -1.120 v 19.200 M 581.387 384.533 l 0.640 -1.120 l -3.040 2.560 l 2.400 -1.440 M 582.027 383.413 l -3.040 2.560 l -0.480 -0.480 l 3.520 -2.080 M 578.987 385.973 l -0.480 -0.480 l -9.600 24.800 l 10.080 -24.320 M 578.507 385.493 l -9.600 24.800 l -0.480 -0.480 l 10.080 -24.320 M 568.907 410.293 l -0.480 -0.480 l -2.560 2.240 l 3.040 -1.760 M 568.427 409.813 l -2.560 2.240 l -0.320 -0.480 l 2.880 -1.760" id="path0009" />
      <path d="M 584.427 382.773 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 585.067 381.813 l -3.040 2.400 l -0.640 -0.480 l 3.680 -1.920 M 582.027 384.213 l -0.640 -0.480 l 0.640 18.240 v -17.760 M 581.387 383.733 l 0.640 18.240 l -0.640 0.960 v -19.200 M 582.027 401.973 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 581.387 402.933 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 584.427 400.533 l 0.640 0.320 l -0.640 -18.080 v 17.760 M 585.067 400.853 l -0.640 -18.080 l 0.640 -0.960 v 19.040" id="path0010" />
      <path d="M 562.507 410.613 l 0.320 -0.480 l -5.600 -2.880 l 5.280 3.360 M 562.827 410.133 l -5.600 -2.880 l 0.800 -0.160 l 4.800 3.040 M 557.227 407.253 l 0.800 -0.160 l 4.320 -9.120 l -5.120 9.280 M 558.027 407.093 l 4.320 -9.120 l 0.640 0.160 l -4.960 8.960" id="path0011" />
      <path d="M 562.987 413.013 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 562.347 413.973 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 565.387 411.573 l 0.640 0.320 l -0.640 -18.080 v 17.760 M 566.027 411.893 l -0.640 -18.080 l 0.640 -1.120 v 19.200 M 565.387 393.813 l 0.640 -1.120 l -3.040 2.400 l 2.400 -1.280 M 566.027 392.693 l -3.040 2.400 l -0.640 -0.320 l 3.680 -2.080 M 562.987 395.093 l -0.640 -0.320 l 0.640 18.240 v -17.920 M 562.347 394.773 l 0.640 18.240 l -0.640 0.960 v -19.200" id="path0012" />
      <path d="M 584.427 397.493 l 0.480 0.320 l 4.480 -9.120 l -4.960 8.800 M 584.907 397.813 l 4.480 -9.120 l 0.800 -0.160 l -5.280 9.280 M 589.387 388.693 l 0.800 -0.160 l -5.600 -3.040 l 4.800 3.200 M 590.187 388.533 l -5.600 -3.040 l 0.320 -0.480 l 5.280 3.520" id="path0013" />
      <path d="M 581.867 402.773 l -0.320 -0.480 l -3.200 2.400 l 3.520 -1.920 M 581.547 402.293 l -3.200 2.400 l 0.640 -0.960 l 2.560 -1.440 M 578.347 404.693 l 0.640 -0.960 l -0.640 -18.080 v 19.040 M 578.987 403.733 l -0.640 -18.080 h 0.640 v 18.080" i="path0014" />

      <path d="M 1004.907 419.893 h -0.480 l 0.480 18.720 v -18.720 M 1004.427 419.893 l 0.480 18.720 l -0.480 -0.480 v -18.240 M 1004.907 438.613 l -0.480 -0.480 l -3.040 2.560 l 3.520 -2.080 M 1004.427 438.133 l -3.040 2.560 l 0.640 -1.120 l 2.400 -1.440 M 1001.387 440.693 l 0.640 -1.120 l -0.640 -18.080 v 19.200 M 1002.027 439.573 l -0.640 -18.080 l 0.640 0.320 v 17.760 M 1001.387 421.493 l 0.640 0.320 l 2.720 -2.400 l -3.360 2.080 M 1002.027 421.813 l 2.720 -2.400 l -0.160 0.800 l -2.560 1.600 M 1004.747 419.413 l -0.160 0.800 l 10.240 12.000 l -10.080 -12.800 M 1004.587 420.213 l 10.240 12.000 l -0.160 0.800 l -10.080 -12.800 M 1014.827 432.213 l -0.160 0.800 l 2.880 -2.400 l -2.720 1.600 M 1014.667 433.013 l 2.880 -2.400 l 0.320 0.480 l -3.200 1.920" id="path0015" />
      <path d="M 1014.987 414.133 h -0.640 l 0.640 17.920 v -17.920 M 1014.347 414.133 l 0.640 17.920 l -0.640 1.120 v -19.040 M 1014.987 432.053 l -0.640 1.120 l 3.040 -2.560 l -2.400 1.440 M 1014.347 433.173 l 3.040 -2.560 l 0.640 0.480 l -3.680 2.080 M 1017.387 430.613 l 0.640 0.480 l -0.640 -18.240 v 17.760 M 1018.027 431.093 l -0.640 -18.240 l 0.640 -0.960 v 19.200 M 1017.387 412.853 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 1018.027 411.893 l -3.040 2.400 l -0.480 -0.480 l 3.520 -1.920 M 1014.987 414.293 l -0.480 -0.480 l -9.600 24.800 l 10.080 -24.320 M 1014.507 413.813 l -9.600 24.800 l -0.480 -0.480 l 10.080 -24.320 M 1004.907 438.613 l -0.480 -0.480 l -2.560 2.240 l 3.040 -1.760 M 1004.427 438.133 l -2.560 2.240 l -0.320 -0.480 l 2.880 -1.760" id="path0016" />
      <path d="M 1020.427 411.093 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 1021.067 410.133 l -3.040 2.400 l -0.640 -0.320 l 3.680 -2.080 M 1018.027 412.533 l -0.640 -0.320 l 0.640 18.080 v -17.760 M 1017.387 412.213 l 0.640 18.080 l -0.640 1.120 v -19.200 M 1018.027 430.293 l -0.640 1.120 l 3.040 -2.400 l -2.400 1.280 M 1017.387 431.413 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 1020.427 429.013 l 0.640 0.320 l -0.640 -18.240 v 17.920 M 1021.067 429.333 l -0.640 -18.240 l 0.640 -0.960 v 19.200" id="path0017" />
      <path d="M 998.507 439.093 l 0.320 -0.640 l -5.600 -2.880 l 5.280 3.520 M 998.827 438.453 l -5.600 -2.880 l 0.800 -0.160 l 4.800 3.040 M 993.227 435.573 l 0.800 -0.160 l 4.320 -9.120 l -5.120 9.280 M 994.027 435.413 l 4.320 -9.120 l 0.480 0.320 l -4.800 8.800" id="path0018" />
      <path d="M 998.987 441.333 l -0.640 0.960 l 3.040 -2.400 l -2.400 1.440 M 998.347 442.293 l 3.040 -2.400 l 0.640 0.320 l -3.680 2.080 M 1001.387 439.893 l 0.640 0.320 l -0.640 -18.080 v 17.760 M 1002.027 440.213 l -0.640 -18.080 l 0.640 -0.960 v 19.040 M 1001.387 422.133 l 0.640 -0.960 l -3.040 2.400 l 2.400 -1.440 M 1002.027 421.173 l -3.040 2.400 l -0.640 -0.480 l 3.680 -1.920 M 998.987 423.573 l -0.640 -0.480 l 0.640 18.240 v -17.760 M 998.347 423.093 l 0.640 18.240 l -0.640 0.960 v -19.200" id="path0019" />
      <path d="M 1020.427 425.973 l 0.480 0.160 l 4.480 -9.120 l -4.960 8.960 M 1020.907 426.133 l 4.480 -9.120 l 0.800 -0.160 l -5.280 9.280 M 1025.387 417.013 l 0.800 -0.160 l -5.600 -2.880 l 4.800 3.040 M 1026.187 416.853 l -5.600 -2.880 l 0.320 -0.480 l 5.280 3.360" id="path0020" />
      <path d="M 1017.867 431.093 l -0.320 -0.480 l -3.200 2.560 l 3.520 -2.080 M 1017.547 430.613 l -3.200 2.560 l 0.640 -1.120 l 2.560 -1.440 M 1014.347 433.173 l 0.640 -1.120 l -0.640 -17.920 v 19.040 M 1014.987 432.053 l -0.640 -17.920 h 0.640 v 17.920" id="path0021" />
    </svg>
    `);

    const pidGroup = new PidGroup(
      [
        'path0001',
        'path0002',
        'path0003',
        'path0004',
        'path0005',
        'path0006',
        'path0007',
      ].map((pathId) => pidDocument.getPidPathById(pathId)!)
    );

    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(3);
  });

  test('ISO Equipment matched to Equipment and Valve', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 524.107 523.573 l 0.320 -0.480 l -5.440 -2.080 l 5.120 2.560 M 524.427 523.093 l -5.440 -2.080 l -0.160 -0.800 l 5.600 2.880 M 518.987 521.013 l -0.160 -0.800 l -4.960 9.440 l 5.120 -8.640 M 518.827 520.213 l -4.960 9.440 l -0.480 -0.320 l 5.440 -9.120" id="path0001" />
      <path d="M 527.307 521.333 l -0.640 0.960 l 0.640 3.680 v -4.640 M 526.667 522.293 l 0.640 3.680 l -0.640 -0.320 v -3.360 M 527.307 525.973 l -0.640 -0.320 l -16.000 9.920 l 16.640 -9.600 M 526.667 525.653 l -16.000 9.920 l 0.480 -0.960 l 15.520 -8.960 M 510.667 535.573 l 0.480 -0.960 l -0.480 -3.680 v 4.640 M 511.147 534.613 l -0.480 -3.680 l 0.480 0.320 v 3.360 M 510.667 530.933 l 0.480 0.320 l 16.160 -9.920 l -16.640 9.600 M 511.147 531.253 l 16.160 -9.920 l -0.640 0.960 l -15.520 8.960" id="path0002" />
      <path d="M 541.707 514.453 l 5.440 1.440" id="path0003" />
      <path d="M 534.987 521.173 l 0.160 0.480 l 0.480 0.160 l 0.480 0.320 l 0.480 0.160 h 0.640 l 0.640 -0.160 l 0.640 -0.160 l 0.640 -0.160 l 0.480 -0.480 l 0.480 -0.320 l 0.480 -0.480 l 0.320 -0.640 l 0.160 -0.480 l 0.160 -0.480 v -0.480 l -0.160 -0.480 l -0.320 -0.480 l -0.320 -0.320 l -0.320 -0.320 l -0.640 -0.160 h -0.480 h -0.640 l -0.640 0.160 l -0.640 0.160 l -0.480 0.320 l -0.640 0.320 l -0.480 0.480 l -0.320 0.480 l -0.320 0.640 l -0.160 0.480 v 0.480 v 0.480 l 0.320 0.480 l -8.000 4.640" id="path0004" />
      <path d="M 541.547 514.773 l 5.440 1.440" id="path0005" />
      <path d="M 526.667 529.653 l 0.480 0.320 l -0.480 -3.680 v 3.360 M 527.147 529.973 l -0.480 -3.680 l 0.480 -0.960 v 4.640 M 526.667 526.293 l 0.480 -0.960 l -16.000 9.920 l 15.520 -8.960 M 527.147 525.333 l -16.000 9.920 l -0.480 -0.320 l 16.480 -9.600 M 511.147 535.253 l -0.480 -0.320 l 0.480 3.680 v -3.360 M 510.667 534.933 l 0.480 3.680 l -0.480 0.800 v -4.480 M 511.147 538.613 l -0.480 0.800 l 16.000 -9.760 l -15.520 8.960 M 510.667 539.413 l 16.000 -9.760 l 0.480 0.320 l -16.480 9.440" id="path0006" />
      <path d="M 542.347 513.973 l 4.960 1.440" id="path0007" />
      <path d="M 542.027 514.293 l 5.120 1.280" id="path0008" />
      <path d="M 541.387 514.933 l 5.600 1.600" id="path0009" />
      <path d="M 542.667 513.813 l 4.640 1.280" id="path0010" />
      <path d="M 541.227 515.253 l 5.600 1.440" id="path0011" />
      <path d="M 541.067 515.413 l 5.600 1.600" id="path0012" />
      <path d="M 542.987 513.653 l 4.160 1.120" id="path0013" />
      <path d="M 540.907 515.733 l 5.440 1.440" id="path0014" />
      <path d="M 540.747 516.053 l 5.440 1.440" id="path0015" />
      <path d="M 543.467 513.493 l 3.680 0.960" id="path0016" />
      <path d="M 540.747 516.373 l 5.120 1.280" id="path0017" />
      <path d="M 543.947 513.333 l 2.880 0.800" id="path0018" />
      <path d="M 540.747 516.533 l 4.960 1.440" id="path0019" />
      <path d="M 540.747 516.853 l 4.640 1.280" id="path0020" />
      <path d="M 544.587 513.173 l 1.920 0.480" id="path0021" />
      <path d="M 540.747 517.173 l 4.160 1.120" id="path0022" />
      <path d="M 540.907 517.493 l 3.680 0.960" id="path0023" />
      <path d="M 540.907 517.653 l 0.320 0.480 l 0.480 0.320 l 0.480 0.160 l 0.480 0.160 h 0.640 l 0.640 -0.160 l 0.640 -0.160 l 0.480 -0.160 l 0.640 -0.320 l 0.480 -0.480 l 0.480 -0.480 l 0.320 -0.480 l 0.160 -0.640 l 0.160 -0.480 v -0.480 l -0.160 -0.480 l -0.320 -0.480 l -0.320 -0.320 l -0.480 -0.320 l -0.480 -0.160 h -0.480 h -0.640 l -0.640 0.160 l -0.640 0.160 l -0.640 0.320 l -0.480 0.480 l -0.480 0.320 l -0.320 0.480 l -0.320 0.640 l -0.160 0.480 v 0.480 v 0.480 l 0.160 0.480" id="path0024" />
      <path d="M 541.067 517.813 l 2.880 0.800" id="path0025" />
      <path d="M 541.547 518.293 l 1.760 0.480" id="path0026" />
      <path d="M 522.347 539.413 v -7.040" id="path0027" />
      <path d="M 508.427 558.773 l 0.160 0.320 l 6.560 -4.320 l -6.720 4.000 M 508.587 559.093 l 6.560 -4.320 l 0.640 0.320 l -7.200 4.000 M 515.147 554.773 l 0.640 0.320 l -0.640 -18.880 v 18.560 M 515.787 555.093 l -0.640 -18.880 l 0.640 0.320 v 18.560 M 515.147 536.213 l 0.640 0.320 l 6.880 -4.480 l -7.520 4.160 M 515.787 536.533 l 6.880 -4.480 l -0.480 0.800 l -6.400 3.680 M 522.667 532.053 l -0.480 0.800 l 0.480 17.600 v -18.400 M 522.187 532.853 l 0.480 17.600 l -0.480 0.960 v -18.560 M 522.667 550.453 l -0.480 0.960 l 7.040 -4.640 l -6.560 3.680 M 522.187 551.413 l 7.040 -4.640 l 0.160 0.320 l -7.200 4.320" id="path0028" style="fill:#000000" />
      <path d="M 516.587 554.293 l -8.000 4.640" id="path0029" />
      <path d="M 522.347 550.933 v -6.880" id="path0030" />
      <path d="M 528.587 547.413 l -8.000 4.640" id="path0031" />
    </svg>
    `);

    const equipmentPathIds = ['path0028'];
    const pidGroup = new PidGroup(
      equipmentPathIds.map((pathId) => pidDocument.getPidPathById(pathId)!)
    );

    expect(pidGroup.pidPaths[0].isFilled()).toEqual(true);
    expect(pidDocument.getPidPathById('path0029')!.isFilled()).toEqual(false);

    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(1);
    expect(detections[0].pathIds).toEqual(equipmentPathIds);
  });

  test('ISO three reducers', async () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg viewBox="0 0 1632 1056" xmlns="http://www.w3.org/2000/svg">
      <path d="M 350.667 344.853 l -0.320 -0.800 l -2.240 8.000 l 2.560 -7.200 M 350.347 344.053 l -2.240 8.000 l -0.640 0.320 l 2.880 -8.320 M 348.107 352.053 l -0.640 0.320 l 12.000 6.080 l -11.360 -6.400 M 347.467 352.373 l 12.000 6.080 l 0.800 1.280 l -12.800 -7.360 M 359.467 358.453 l 0.800 1.280 l -3.360 -11.360 l 2.560 10.080 M 360.267 359.733 l -3.360 -11.360 l 0.480 -0.320 l 2.880 11.680 M 356.907 348.373 l 0.480 -0.320 l -6.720 -3.200 l 6.240 3.520 M 357.387 348.053 l -6.720 -3.200 l -0.320 -0.800 l 7.040 4.000" style="fill:#000000;stroke:#000000;stroke-width:1" id="path0001" />
      <path d="M 414.827 391.733 l -0.320 -0.800 l -2.240 7.840 l 2.560 -7.040 M 414.507 390.933 l -2.240 7.840 l -0.640 0.320 l 2.880 -8.160 M 412.267 398.773 l -0.640 0.320 l 12.000 6.240 l -11.360 -6.560 M 411.627 399.093 l 12.000 6.240 l 0.800 1.120 l -12.800 -7.360 M 423.627 405.333 l 0.800 1.120 l -3.360 -11.200 l 2.560 10.080 M 424.427 406.453 l -3.360 -11.200 l 0.480 -0.320 l 2.880 11.520 M 421.067 395.253 l 0.480 -0.320 l -6.720 -3.200 l 6.240 3.520 M 421.547 394.933 l -6.720 -3.200 l -0.320 -0.800 l 7.040 4.000" style="fill:#000000;stroke:#000000;stroke-width:1" id="path0002" />
      <path d="M 478.987 429.013 l -0.320 -0.960 l -2.240 8.000 l 2.560 -7.040 M 478.667 428.053 l -2.240 8.000 l -0.640 0.320 l 2.880 -8.320 M 476.427 436.053 l -0.640 0.320 l 12.000 6.240 l -11.360 -6.560 M 475.787 436.373 l 12.000 6.240 l 0.800 1.120 l -12.800 -7.360 M 487.787 442.613 l 0.800 1.120 l -3.360 -11.200 l 2.560 10.080 M 488.587 443.733 l -3.360 -11.200 l 0.480 -0.480 l 2.880 11.680 M 485.227 432.533 l 0.480 -0.480 l -6.720 -3.040 l 6.240 3.520 M 485.707 432.053 l -6.720 -3.040 l -0.320 -0.960 l 7.040 4.000" style="fill:#000000;stroke:#000000;stroke-width:1" id="path0003" />
    </svg>
    `);

    const equipmentPathIds = ['path0001'];
    const pidGroup = new PidGroup(
      equipmentPathIds.map((pathId) => pidDocument.getPidPathById(pathId)!)
    );

    const detections = detectSymbols(
      pidDocument.pidPaths,
      pidDocument.kdTree,
      pidGroup
    );

    expect(detections.length).toEqual(3);
  });
});
