#version 300 es

precision mediump float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_char_aspect;
uniform sampler2D u_character_texture;
uniform sampler2D u_mask_texture;

#define COLOUR_BACKGROUND vec3(1.0, 1.0, 1.0)
// #define COLOUR_FOREGROUND vec3(0.1, 0.1, 0.7)

// #define COLOUR_BACKGROUND vec3(0.21, 0.47, 0.26)
#define COLOUR_FOREGROUND vec3(0., 0., 0.3)

// #define COLOUR_BACKGROUND vec3(0.0, 0.0, 1.0)
// #define COLOUR_FOREGROUND vec3(1.0, 1.0, 1.0)

#define CELL_SIZE 12.0
#define CHAR_WIDTH 64.0
struct CellData {
  vec2 origin;
  vec2 center;
  vec2 local;
};

CellData cell_create(vec2 uv) {
  float screen_aspect = u_resolution.x / u_resolution.y;

  float count = u_resolution.x / CELL_SIZE;

  float cells_x = count;
  float cells_y = count * u_char_aspect / screen_aspect;

  vec2 cell_count = vec2(cells_x, cells_y);
  vec2 cell_size = 1.0f / cell_count;

  CellData data;
  data.origin = floor(uv * cell_count) / cell_count;
  data.center = data.origin + (cell_size * 0.5f);
  data.local = fract(uv * cell_count);

  return data;
}
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898f, 78.233f))) *
    43758.5453123f);
}

float fade(vec2 c) {
  float threshold = smoothstep(0.8f, 1.1f, distance(c, vec2(1.0f, 0.0f)));
  return step(random(c), threshold);
  // return smoothstep(0.8f, 1.0f, random(c) * );
}

void main() {
  CellData cell = cell_create(v_uv);
  ivec2 character_texture_size = textureSize(u_character_texture, 0);

  float mask = texture(u_mask_texture, cell.center).r;

  vec2 texture_position = vec2((cell.local.x + mix(-0.0f, 8.0f, mask)) * (CHAR_WIDTH / float(character_texture_size.x)), cell.local.y);

  vec4 s = texture(u_character_texture, texture_position);

  vec3 text_colour = mix(COLOUR_BACKGROUND, COLOUR_FOREGROUND, s.r);
  vec3 colour = mix(text_colour, COLOUR_BACKGROUND, fade(cell.center));

  outColor = vec4(colour, 1.0f);
}