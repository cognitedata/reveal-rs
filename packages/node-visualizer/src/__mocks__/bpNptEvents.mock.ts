import { IRiskEvent, INptMetaData } from 'SubSurface/Wells/Interfaces/IRisk';

export const bpNptEvents: IRiskEvent<INptMetaData>[] = [
  {
    externalId: 'rfunh',
    dataSetId: 7788182229523559,
    subtype: 'WAIT',
    description: 'WAIT ON WEATHER ( HURRICANE MICHAEL )',
    metadata: {
      description: 'WAIT ON WEATHER ( HURRICANE MICHAEL )',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'WAIT',
      npt_detail_code: 'WTHR',
      total_npt_duration_hrs: '71.5',
      npt_md: '5253.010506',
      created_date: '2018-10-09T02:21:54',
      updated_date: '2018-10-16T05:49:59',
      failure_location: '',
      root_cause: '',
      npt_description: 'WAIT ON WEATHER ( HURRICANE MICHAEL )',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 5442443419552197,
  },
  {
    externalId: 'bdYdm',
    dataSetId: 7788182229523559,
    subtype: 'RREP',
    description: 'POWER MANAGEMENT',
    metadata: {
      description: 'POWER MANAGEMENT',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'RREP',
      npt_detail_code: 'EPSS',
      total_npt_duration_hrs: '1.0',
      npt_md: '7618.015236',
      created_date: '2018-10-19T05:15:11',
      updated_date: '2018-10-19T05:19:20',
      failure_location: '',
      root_cause: '',
      npt_description:
        'WHILE RIH YELLOW ALERT ON POWER MANGEMENT INDICATED. SPACE OUT TOOL JOINT IN BOP. TROUBLESHOOT FAULT.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 3244293651111076,
  },
  {
    externalId: 'a4FnK',
    dataSetId: 7788182229523559,
    subtype: 'WAIT',
    description: 'SCHLUMBERGER DRILLING JARS',
    metadata: {
      description: 'SCHLUMBERGER DRILLING JARS',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'WAIT',
      npt_detail_code: 'EQPT',
      total_npt_duration_hrs: '3.75',
      npt_md: '7618.015236',
      created_date: '2018-10-20T05:36:25',
      updated_date: '2018-10-20T05:38:10',
      failure_location: '',
      root_cause: '',
      npt_description:
        'WAITING ON SCHLUMBERGER / SMITH - DRILLING JARS TO ARRIVE ON LOCATION, PICK UP / MAKE UP DRILLING JARS TO BHA.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 4183904562239945,
  },
  {
    externalId: 'wdJml',
    dataSetId: 7788182229523559,
    subtype: 'DFAL',
    description: 'UNSCHEDULED DIRECTIONAL SURVEY',
    metadata: {
      description: 'UNSCHEDULED DIRECTIONAL SURVEY',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'DFAL',
      npt_detail_code: 'BHA',
      total_npt_duration_hrs: '0.5',
      npt_md: '7968.015936',
      created_date: '2018-10-21T06:51:14',
      updated_date: '2018-10-21T06:55:19',
      failure_location: '',
      root_cause: '',
      npt_description: 'TAKE SURVEY CHECK SHOT DUE TO POWER DRIVE PERFORMANCE',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 8937411894824497,
  },
  {
    externalId: 'jVJkC',
    dataSetId: 7788182229523559,
    subtype: 'DFAL',
    description: 'UNSCHEDULED DIRECTIONAL SURVEY',
    metadata: {
      description: 'UNSCHEDULED DIRECTIONAL SURVEY',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'DFAL',
      npt_detail_code: 'BHA',
      total_npt_duration_hrs: '0.5',
      npt_md: '8063.016126',
      created_date: '2018-10-21T06:53:56',
      updated_date: '2018-10-21T06:55:54',
      failure_location: '',
      root_cause: '',
      npt_description: 'TAKE SURVEY CHECK SHOT DUE TO POWER DRIVE PERFORMANCE',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 5081621146922796,
  },
  {
    externalId: 'K03L8',
    dataSetId: 7788182229523559,
    subtype: 'DFAL',
    description: 'UNABLE TO BUILD ANGLE WITH POWER DRIVE.',
    metadata: {
      description: 'UNABLE TO BUILD ANGLE WITH POWER DRIVE.',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'DFAL',
      npt_detail_code: 'BHA',
      total_npt_duration_hrs: '19.5',
      npt_md: '8137.016274',
      created_date: '2018-10-21T03:29:05',
      updated_date: '2018-10-22T01:40:23',
      failure_location: '',
      root_cause: '',
      npt_description: 'UNABLE TO BUILD ANGLE WITH POWER DRIVE.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 7007144864095380,
  },
  {
    externalId: 'St7Pd',
    dataSetId: 7788182229523559,
    subtype: 'SFAL',
    description: 'OVER TORQUED CONNECTIONS.',
    metadata: {
      description: 'OVER TORQUED CONNECTIONS.',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'SFAL',
      npt_detail_code: 'DSTH',
      total_npt_duration_hrs: '4.5',
      npt_md: '10845.02169',
      created_date: '2018-10-25T01:11:05',
      updated_date: '2018-10-25T01:17:48',
      failure_location: '',
      root_cause: '',
      npt_description:
        'UNABLE TO BREAK CONNECTIONS ON WORKSTRINGS RENTAL 6 5/8" 27# V150 XT-57 DRILL PIPE DUE TO OVER TORQUING. CONNECTIONS HAD TO BE HEATED USING ROSEBUD TORCH.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 8581525009611500,
  },
  {
    externalId: 'gcPnI',
    dataSetId: 7788182229523559,
    subtype: 'SFAL',
    description: 'OVER TORQUED CONNECTIONS.',
    metadata: {
      description: 'OVER TORQUED CONNECTIONS.',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'SFAL',
      npt_detail_code: 'DSTH',
      total_npt_duration_hrs: '4.0',
      npt_md: '7522.015044',
      created_date: '2018-10-25T01:17:59',
      updated_date: '2018-10-25T01:19:13',
      failure_location: '',
      root_cause: '',
      npt_description:
        'UNABLE TO BREAK CONNECTIONS ON WORKSTRINGS RENTAL 6 5/8" 27# V150 XT-57 DRILL PIPE DUE TO OVER TORQUING. CONNECTIONS HAD TO BE HEATED USING ROSEBUD TORCH.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 7795589500866642,
  },
  {
    externalId: '4vZAw',
    dataSetId: 7788182229523559,
    subtype: 'SFAL',
    description: 'OVER TORQUED CONNECTIONS.',
    metadata: {
      description: 'OVER TORQUED CONNECTIONS.',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'SFAL',
      npt_detail_code: 'DSTH',
      total_npt_duration_hrs: '3.25',
      npt_md: '7522.015044',
      created_date: '2018-10-25T01:19:30',
      updated_date: '2018-10-25T01:20:39',
      failure_location: '',
      root_cause: '',
      npt_description:
        'UNABLE TO BREAK CONNECTIONS ON WORKSTRINGS RENTAL 6 5/8" 27# V150 XT-57 DRILL PIPE DUE TO OVER TORQUING. CONNECTIONS HAD TO BE HEATED USING ROSEBUD TORCH.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 7420036149482954,
  },
  {
    externalId: 'SXDa1',
    dataSetId: 7788182229523559,
    subtype: 'RREP',
    description: 'TROUBLE SHOOT AUX HYDRA RACKER',
    metadata: {
      description: 'TROUBLE SHOOT AUX HYDRA RACKER',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'RREP',
      npt_detail_code: 'HSYS',
      total_npt_duration_hrs: '0.75',
      npt_md: '3241.006482',
      created_date: '2018-10-26T02:48:02',
      updated_date: '2018-10-26T02:49:52',
      failure_location: '',
      root_cause: '',
      npt_description: 'AUX SIDE HYDRA RACKER MAIN HEAD.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 7975710780806219,
  },
  {
    externalId: 'hQ9cx',
    dataSetId: 7788182229523559,
    subtype: 'RREP',
    description: 'DAMAGED HYDRA TONG DIES.',
    metadata: {
      description: 'DAMAGED HYDRA TONG DIES.',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'RREP',
      npt_detail_code: 'HSYS',
      total_npt_duration_hrs: '0.25',
      npt_md: '3401.006802',
      created_date: '2018-10-27T01:38:42',
      updated_date: '2018-10-27T01:42:03',
      failure_location: '',
      root_cause: '',
      npt_description:
        'CHANGE OUT HYDRA TONG DIES DUE TO DAMAGE FROM HIGH TORQUE ON LANDING STRING.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 5817257741393647,
  },
  {
    externalId: 'kfIP9',
    dataSetId: 7788182229523559,
    subtype: 'SFAL',
    description: 'MAKE UP CASING CROSSOVER',
    metadata: {
      description: 'MAKE UP CASING CROSSOVER',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'SFAL',
      npt_detail_code: 'HSYS',
      total_npt_duration_hrs: '3.0',
      npt_md: '8766.017532',
      created_date: '2018-11-06T19:05:23',
      updated_date: '2018-11-06T19:12:01',
      failure_location: '',
      root_cause: '',
      npt_description:
        "ATTEMPT TO MAKE UP 2' PUP CROSSOVER PRIOR TO PICKING UP HANGER. UNABLE TO MAKE UP PUP CROSSOVER DUE TO DAMAGED BOX ON LAST SINGLE PICKED UP.",
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 6039670879551851,
  },
  {
    externalId: 'MDZXl',
    dataSetId: 7788182229523559,
    subtype: 'CEMT',
    description: 'LOST CIRCULATION',
    metadata: {
      description: 'LOST CIRCULATION',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'CEMT',
      npt_detail_code: 'CMTO',
      total_npt_duration_hrs: '34.75',
      npt_md: '25802.051604',
      created_date: '2018-11-08T03:49:04',
      updated_date: '2018-11-09T04:09:12',
      failure_location: '',
      root_cause: '',
      npt_description:
        'ATTEMPT TO BREAK OUT BLACKHAWK CEMENT HEAD AND OBSERVED MUD U-TUBING FROM STRING. CLOSED UPPER FOSV MONITORING LOSSES ON TRIP TANK. PREPARE AND PERFORM SQUEEZE JOB',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 747934753591666,
  },
  {
    externalId: 'rIen7',
    dataSetId: 7788182229523559,
    subtype: 'SFAL',
    description: 'TROUBLE SHOOT HEAD TENSION ON WIRELINE UNIT.',
    metadata: {
      description: 'TROUBLE SHOOT HEAD TENSION ON WIRELINE UNIT.',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'SFAL',
      npt_detail_code: 'LINE',
      total_npt_duration_hrs: '0.25',
      npt_md: '-82.000164',
      created_date: '2018-11-11T17:43:20',
      updated_date: '2018-11-11T17:52:17',
      failure_location: '',
      root_cause: '',
      npt_description: 'CHANGE OUT TENSION HEAD.',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 2947925432933143,
  },
  {
    externalId: 'LY68D',
    dataSetId: 7788182229523559,
    subtype: 'DFAL',
    description: 'ARCHER PACKER PRESSURE TEST FAILURE',
    metadata: {
      description: 'ARCHER PACKER PRESSURE TEST FAILURE',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'DFAL',
      npt_detail_code: 'DEQP',
      total_npt_duration_hrs: '10.9833333333333',
      npt_md: '5910.01182',
      created_date: '2018-11-16T03:37:28',
      updated_date: '2018-11-16T05:56:33',
      failure_location: '',
      root_cause: '',
      npt_description:
        'ARCHER PACKER SET AND PRESSURE TESTED. ( FAILED ) POOH W/ PACKER AND REPLACE',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 388748882933049,
  },
  {
    externalId: 'dGLC0',
    dataSetId: 7788182229523559,
    subtype: 'RREP',
    description: 'DRAWWORKS MOTOR REPLACEMENT',
    metadata: {
      description: 'DRAWWORKS MOTOR REPLACEMENT',
      npt_level: '1.0',
      type: 'NPT',
      npt_code: 'RREP',
      npt_detail_code: 'HSYS',
      total_npt_duration_hrs: '55.0',
      npt_md: '25861.051722',
      created_date: '2018-11-16T05:57:08',
      updated_date: '2018-11-19T05:40:24',
      failure_location: '',
      root_cause: '',
      npt_description: 'REPLACE MOTOR D ON TDX 1250',
    },
    assetIds: ['3449261002359307'],
    source: 'EDM-NPT',
    id: 3094416933695293,
  },
];
