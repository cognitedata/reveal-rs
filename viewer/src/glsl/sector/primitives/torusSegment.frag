#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../../base/determineColor.glsl');

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;
uniform vec2 dataTextureSize;

uniform int renderMode;

void main() {
    if (!determineVisibility(overrideVisibilityPerTreeIndex, dataTextureSize, v_treeIndex)) {
        discard;
    }

    vec3 color = determineColor(v_color, colorDataTexture, dataTextureSize, v_treeIndex);
    vec3 normal = normalize(v_normal);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z);
}
