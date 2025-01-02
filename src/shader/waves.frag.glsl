#version 300 es

precision highp float;

in vec4 v_position;
out vec4 outColor;
uniform float u_time;
uniform vec2 u_resolution;


float PI = 3.141f;

vec3 rgb(float r, float g, float b) {
  float fr = 1.0 / 255.0;
  return vec3(fr * r, fr * g, fr * b);
}

// Inspo ~ (stolen) https://www.shadertoy.com/view/M3XSDn
vec2 hash2(vec2 p) {
  p = vec2(
    dot(p, vec2(127.1f, 311.7f)), 
    dot(p, vec2(269.5f, 183.3f))
  );
  return fract(sin(p) * 43758.5453f);
}

float voronoi(in vec2 uv, float smoothness) {
  vec2 n = floor(uv);
  vec2 f = fract(uv);

  float m = 8.0f;

  for(float j = -2.0f; j <= 2.0f; j++) {
    for(float i = -2.0f; i <= 2.0f; i++) {
      vec2 g = vec2(i, j);
      vec2 o = hash2(n + g);

      o = 0.3f * sin(u_time*0.0005 + 2.0f * PI * o + uv);
      float mag = length(g - f + o);
      float h = clamp(0.5f + 0.5f * (m - mag) / smoothness, 0.0f, 1.0f);
      m = mix(m, mag, h) - h * (1.0f - h) * smoothness;
    }
  }

  return m;
}

void main() {
  vec2 R = u_resolution.xy;
  vec2 uv = (2.0 * (v_position.xy*R) - R) / min(R.x, R.y);
  uv *= 0.4;
  uv.y += u_time * 0.0001;
  uv.x += u_time * 0.00004;
  
  float vNoise = voronoi(uv, 0.001);
  float sNoise = voronoi(uv, 0.5);
  float fVoronoi = smoothstep(0.0, 0.02, vNoise-sNoise-0.08);

  vec3 f = rgb(240., 234., 223.);
  vec3 b = rgb(234., 229., 215.);
  outColor = vec4(mix(f, b, fVoronoi), 1.0);
}
