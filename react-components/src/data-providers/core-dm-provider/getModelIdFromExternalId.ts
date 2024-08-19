export function getModelIdFromExternalId(externalId: string) {
  // The externalId should be on the form `cog_3d_model_${modelId}`
  return Number(externalId.slice('cog_3d_model_'.length));
}
