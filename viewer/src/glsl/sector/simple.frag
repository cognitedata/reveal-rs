#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')
#pragma glslify: determineVisibility = require('../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../base/determineColor.glsl')

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

uniform int renderMode;

void main() {
    if (!determineVisibility(overrideVisibilityPerTreeIndex, v_treeIndex)) {
        discard;
    }

    vec3 color = determineColor(v_color, colorDataTexture, v_treeIndex);
    updateFragmentColor(renderMode, color, v_treeIndex, v_normal, gl_FragCoord.z);
}
