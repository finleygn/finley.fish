#version 300 es

precision mediump float;

in vec2 v_uv;
uniform float u_progress;
uniform float u_thickness;
out vec4 outColor;

float ring(
  vec2 uv,
  float localProgress,
  float baseThickness
) {
  if(localProgress <= 0.0f || localProgress >= 1.0f)
    return 0.0f;

  float radius = localProgress * 0.5f;
  float dist = length(uv);

  float currentThickness = baseThickness;
  float diff = abs(dist - radius);

  float edgeSoftness = 0.03f;
  float ringShape = smoothstep(currentThickness + edgeSoftness, currentThickness, diff);
  float fade = smoothstep(1.0f, 0.7f, localProgress);

  return ringShape * fade;
}

void main() {
  vec2 st = (v_uv - 0.5f);
  float mask = 0.0f;

  mask += ring(st, u_progress, u_thickness);

  // float p2 = (u_progress - 0.4f) / 0.6f;
  // mask += ring(st, p2, 0.02f);

  // float p3 = (u_progress - 0.6f) / 0.4f;
  // mask += ring(st, p3, 0.015f);

  mask = clamp(mask, 0.0f, 1.0f);

  outColor = vec4(vec3(1.0f), mask * 0.3f);
}