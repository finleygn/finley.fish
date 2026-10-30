import ProgramContainer, { UniformType } from "../framework/ProgramContainer";
import shaderDefaultVertex from '../shaders/default.vert.glsl?raw';
import shaderTextureFragment from '../shaders/texture.frag.glsl?raw';
import Mat2, * as mat2 from "@fishley/wwwgraphics/math/mat2";
import Vec2 from "@fishley/wwwgraphics/math/vec2";
import { QUAD_GEOMETRY } from "../geometry";
import { createGeometryBuffer } from "../framework/webgl";
import type GlobalContext from "../framework/GlobalContext";

class LilypadProgram extends ProgramContainer {
  uniforms = {
    matrix: this.uniform("u_matrix", UniformType.UniformMatrix3x2fv),
    texture: this.uniform("u_texture", UniformType.Uniform1i),
  }
  attributes = {
    position: this.attribute("position")
  }
  constructor(gl: WebGL2RenderingContext) {
    super(gl, shaderDefaultVertex, shaderTextureFragment);
  }
}

const CENTER_OFFSET = new Vec2(-0.5, -0.5);

class Lilypad {
  private context: GlobalContext;
  private program: LilypadProgram;
  public position: Vec2 = new Vec2(0, 0);
  public scale: Vec2 = new Vec2(1, 1);
  public rotation: number = 0;

  private vao: WebGLVertexArrayObject;

  private matrix: Mat2 = new Mat2();

  constructor(context: GlobalContext) {
    const gl = context.gl;
    this.context = context;
    this.program = new LilypadProgram(gl);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    createGeometryBuffer(gl, QUAD_GEOMETRY);
    gl.vertexAttribPointer(this.program.attributes.position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.program.attributes.position);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  public draw() {
    const gl = this.context.gl;
    const program = this.program;

    program.use();
    gl.bindVertexArray(this.vao);

    mat2.copy(this.matrix, this.context.asciiProjection);
    mat2.translate(this.matrix, this.position);
    mat2.scale(this.matrix, this.scale);
    mat2.rotate(this.matrix, this.rotation);
    mat2.translate(this.matrix, CENTER_OFFSET);

    program.uniforms.matrix.set(this.matrix);
    program.uniforms.texture.set(0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindVertexArray(null);
  }
}

export default Lilypad;
