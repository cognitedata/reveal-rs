#define texture2D texture

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec2 uv;

out vec2 vUv;

// selection outline
uniform vec2 texelSize;
out vec2 vUv0;
out vec2 vUv1;
out vec2 vUv2;
out vec2 vUv3;

void main() {
  vUv = uv;

  // selection outline
  vUv0 = vec2(uv.x + texelSize.x, uv.y);
  vUv1 = vec2(uv.x - texelSize.x, uv.y);
  vUv2 = vec2(uv.x, uv.y + texelSize.y);
  vUv3 = vec2(uv.x, uv.y - texelSize.y);

  mat4 modelViewMatrix = modelMatrix * viewMatrix;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}