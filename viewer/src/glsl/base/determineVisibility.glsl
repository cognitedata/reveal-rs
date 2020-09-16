#pragma glslify: floatBitsSubset = require('../math/floatBitsSubset.glsl')

const int RenderTypeColor = 1;
const int RenderTypeNormal = 2;
const int RenderTypeTreeIndex = 3;
const int RenderTypePackColorAndNormal = 4;
const int RenderTypeDepth = 5;
const int RenderTypeEffects = 6;
const int RenderTypeGhost = 7;

bool determineVisibility(sampler2D visibilityTexture, vec2 textureSize, float treeIndex, int renderMode) {

    treeIndex = floor(treeIndex + 0.5);
    float dataTextureWidth = textureSize.x;
    float dataTextureHeight = textureSize.y;

    float u = mod(treeIndex, dataTextureWidth);
    float v = floor(treeIndex / dataTextureWidth);
    float uCoord = (u + 0.5) / dataTextureWidth;
    float vCoord = (v + 0.5) / dataTextureHeight; // invert Y axis
    vec2 treeIndexUv = vec2(uCoord, vCoord);
    vec4 visible = texture2D(visibilityTexture, treeIndexUv);

    // Byte layout: 
    // [isVisible, renderInFront, renderGhosted, outlineColor0, outlineColor1, outlineColor2, unused, unused]
    float byteUnwrapped = floor((visible.a * 255.0) + 0.5);
    
    bool isVisible = floatBitsSubset(byteUnwrapped, 0, 1) == 1.0;
    bool renderInFront = floatBitsSubset(byteUnwrapped, 1, 2) == 1.0;
    bool renderGhosted = floatBitsSubset(byteUnwrapped, 2, 3) == 1.0;

    return 
         // In ghost mode
         ((renderMode == RenderTypeGhost) && isVisible && renderGhosted) ||
         // Not ghost mode
         (renderMode != RenderTypeGhost) && 
         !renderGhosted && isVisible && (renderInFront || renderMode != RenderTypeEffects));
}

#pragma glslify: export(determineVisibility)
