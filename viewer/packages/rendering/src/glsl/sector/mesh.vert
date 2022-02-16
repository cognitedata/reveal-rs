#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')

uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;

in vec3 color;
in float treeIndex; 

out vec3 v_color;
out float v_treeIndex;
out vec3 v_viewPosition;
#if NUM_CLIPPING_PLANES > 0
  uniform vec4 clippingPlanes[NUM_CLIPPING_PLANES];
  flat out vec4 v_clippingPlanes[NUM_CLIPPING_PLANES];
#endif

void main() {
    v_color = color;
    v_treeIndex = treeIndex;

    #if NUM_CLIPPING_PLANES > 0
      v_clippingPlanes = clippingPlanes;
    #endif

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    vec4 modelViewPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4(position, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition;
}
