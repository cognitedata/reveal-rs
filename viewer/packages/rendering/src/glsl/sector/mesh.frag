precision highp float;

#pragma glslify: import('../math/derivateNormal.glsl')
#pragma glslify: import('../base/updateFragmentColor.glsl')
#pragma glslify: import('../base/nodeAppearance.glsl')
#pragma glslify: import('../base/determineNodeAppearance.glsl');
#pragma glslify: import('../base/determineColor.glsl');
#pragma glslify: import('../base/isClipped.glsl')
#pragma glslify: import('../treeIndex/treeIndexPacking.glsl')

uniform sampler2D matCapTexture;
uniform lowp int renderMode;

#if defined(IS_TEXTURED)

uniform sampler2D tDiffuse;
in vec2 v_uv;

#else // IS_TEXTURED

in vec3 v_color;

#endif // IS_TEXTURED

in vec3 v_viewPosition;
in vec4 v_nodeAppearanceTexel;

in highp vec2 v_treeIndexPacked;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);
    NodeAppearance appearance = nodeAppearanceFromTexel(v_nodeAppearanceTexel);
    if (isClipped(appearance, v_viewPosition)) {
        discard;
    }

#if defined(IS_TEXTURED)
    vec3 diffuseColor = texture(tDiffuse, v_uv).rgb;
    vec4 color = determineColor(diffuseColor, appearance);

    color = vec4(mix(diffuseColor, vec3(color), 0.6), color.a);
#else
    vec4 color = determineColor(v_color, appearance);
#endif

    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.TriangleMesh);
}
