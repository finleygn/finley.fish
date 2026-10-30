#version 300 es

in vec3 position;
in vec2 uv;
uniform mat4 u_model_matrix;
uniform mat4 u_projection_matrix;
uniform sampler2D u_texture;

out vec2 v_uv;

void main() {
  vec3 npos = position;
  v_uv = uv;
  vec4 t = texture(u_texture, v_uv) * 0.3f;
  float circle = length(position.xy);
  // not accomodating for this in the mouse ray casting
  // because im bad at maths
  float offset = npos.z - pow(circle, 3.0f) * 1.2f;
  // float offset = npos.z;

  gl_Position = u_projection_matrix * u_model_matrix * vec4(npos.xy, offset, 1.0f);
}