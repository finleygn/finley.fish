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

vec3 quantize_colour(vec3 colour, float n) {
    return floor(colour * (n - 1.0) + 0.5) / (n - 1.0);
}


const mat4 DITHER_BAYER_MAT_4x4 = mat4(
    0.0,  8.0,  2.0, 10.0,
    12.0, 4.0,  14.0, 6.0,
    3.0,  11.0, 1.0, 9.0,
    15.0, 7.0,  13.0, 5.0
) / 16.0;

vec3 dither_4x4_colour(
    in vec2 position,
    in vec2 resolution,
    in vec3 colour,
    in float colour_count
) {
    float step_size = 1.0 / (colour_count - 1.0);

    // Get threshold required for this pixel to be active
    int x_thresh = int(position.x * resolution.x) % 4;
    int y_thresh = int(position.y * resolution.y) % 4;
    float thresh = (DITHER_BAYER_MAT_4x4[x_thresh][y_thresh] - 0.5) * step_size;
    
    // Apply dither and quantize
    colour.rgb += thresh;
    colour = quantize_colour(colour, colour_count);

    return colour;
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

      o = 0.3f * sin(u_time*0.0001 + 2.0f * PI * o + uv);
      float mag = length(g - f + o);
      float h = clamp(0.5f + 0.5f * (m - mag) / smoothness, 0.0f, 1.0f);
      m = mix(m, mag, h) - h * (1.0f - h) * smoothness;
    }
  }

  return m;
}

vec2 downsample_uv(vec2 uv, vec2 resolution) {
    return floor(uv * resolution) / resolution;
}

void main() {
  float downsample_amount = 1.0;
  vec2 R = u_resolution.xy / downsample_amount;

  vec2 uv = v_position.xy;
    
  uv = (2.0 * (v_position.xy*R) - R) / min(R.x, R.y);
  uv *= 0.5;
 
  float vNoise = voronoi(uv * 30. + u_time * 0.001, 0.01);
  float sNoise = voronoi(uv * 30., 0.4 + sin(u_time * 0.001) * 0.4);
  float fVoronoi = smoothstep(0.0, 0.02, vNoise-sNoise-0.08);

  vec3 f = rgb(244., 244., 255.);
  vec3 b = rgb(239., 239., 255.);
  vec3 c = mix(f, b, fVoronoi);
  outColor.rgb = dither_4x4_colour((v_position.xy + 1.0) / 2.0, R.xy, c, 24.0);
  outColor.a = 1.0;
}
