/**
 * Created by phil on 5/12/20
 */

/**
 * Overview
 * This is the interface for the Trajectory object
 */

export type TrajectoryId = string;

export interface ITrajectoryMeta {
  type: string;
  object_state: string;
  effective_data?: string;
  version: string;
  create_date: string;
  b_range: string;
  bh_md: string;
  b_ratio: string;
  interpolate: string;
  b_interp: string;
  bh_tvd: string;
  create_user_id: string;
  interpolation_interval: string;
  name: string;
  definitive_path: string;
  create_app_id: string;
  definitive_version: string;
  update_date: string;
  planned_azimuth: string;
  final_east: string;
  final_error: string;
  update_user_id: string;
  ko_east: string;
  ko_north: string;
  is_readonly: string;
  final_north: string;
  tortuosity_period: string;
  update_app_id: string;
  remarks: string;
  tortuosity_type: string;
  is_definitive: string;
  ko_md: string;
  ko_tvd: string;
  vs_east: string;
  vs_north: string;
  use_planned_program: string;
  acscan_md_min: string;
  acscan_md_max: string;
  acscan_radius_max: string;
  acscan_ratio_max: string;
  use_actual_data: string;
  directional_difficulty_index: string;
  maximum_dls_value: string;
  maximum_dls_depth: string;
  tortuosity: string;
  average_dogleg: string;
  is_survey_program_read_only: string;
}

export interface ITrajectoryColumn {
  name: string;
  externalId: string;
  description?: string;
  valueType: string; // DOUBLE | STRING | LONG
}

// Note: the first TrajectoryColumns we will have will be
// { "name":"inclination" ,       "valueType":"DOUBLE"}
// { "name":"measuredDepth" ,     "valueType":"DOUBLE" }
// { "name":"trueVerticalDepth" , "valueType":"DOUBLE" }
// { "name":"eastOffset" ,        "valueType":"DOUBLE" }
// { "name":"northOffset" ,       "valueType":"DOUBLE" }

export interface ITrajectory {
  id: TrajectoryId;
  assetId: TrajectoryId;
  externalId: string;
  name: string; // Name is "" in some cases
  description: string;
  dataSetId: number;
  // not used anywhere, and just causing trouble
  // disabling these but leaving for reference:
  // createdTime: string;
  // lastUpdatedTime: string;
  // metadata: ITrajectoryMeta;
  // columns: ITrajectoryColumn[];
}
