#pragma glslify: updateFragmentDepth = require('../../base/updateFragmentDepth.glsl')
#pragma glslify: NodeAppearance = require('../../base/nodeAppearance.glsl')
#pragma glslify: determineNodeAppearance = require('../../base/determineNodeAppearance.glsl');
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../../base/determineColor.glsl');
#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: isSliced = require('../../base/isSliced.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)
#pragma glslify: import('../../math/constants.glsl')
#pragma glslify: GeometryType = require('../../base/geometryTypes.glsl');

varying float v_oneMinusThicknessSqr;
varying vec2 v_xy;
varying float v_angle;
varying float v_arcAngle;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;
uniform sampler2D matCapTexture;

uniform vec2 treeIndexTextureSize;

uniform int renderMode;

varying vec3 vViewPosition;

void main() {
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        discard;
    }

    if (isSliced(vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    float dist = dot(v_xy, v_xy);
    float theta = atan(v_xy.y, v_xy.x);
    vec3 normal = normalize( v_normal );
    if (theta < v_angle) {
        theta += 2.0 * PI;
    }
    if (dist > 0.25 || dist < 0.25 * v_oneMinusThicknessSqr || theta >= v_angle + v_arcAngle) {
        discard;
    }

    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.Primitive);
}
