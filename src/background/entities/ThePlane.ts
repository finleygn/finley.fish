import ProgramContainer, { UniformType } from "../framework/ProgramContainer";
import shaderDefaultVertex from '../shaders/object.vert.glsl?raw';
import shaderTextureFragment from '../shaders/texture.frag.glsl?raw';
import Mat4 from "@fishley/wwwgraphics/math/mat4";
import { createQuadGeometry } from "../geometry";
import { createElementBuffer, createGeometryBuffer } from "../framework/webgl";
import type GlobalContext from "../framework/GlobalContext";

class ThePlaneProgram extends ProgramContainer {
  uniforms = {
    projectionMatrix: this.uniform("u_projection_matrix", UniformType.UniformMatrix4fv),
    modelMatrix: this.uniform("u_model_matrix", UniformType.UniformMatrix4fv),
    texture: this.uniform("u_texture", UniformType.Uniform1i),
  }
  attributes = {
    position: this.attribute("position"),
    uv: this.attribute("uv"),
  }
  constructor(gl: WebGL2RenderingContext) {
    super(gl, shaderDefaultVertex, shaderTextureFragment);
  }
}


class ThePlane {
  private context: GlobalContext;
  private program: ThePlaneProgram;

  private quad = createQuadGeometry(50);
  public modelMatrix: Mat4 = new Mat4();

  private vao: WebGLVertexArrayObject;

  constructor(context: GlobalContext) {
    const gl = context.gl;
    this.context = context;
    this.program = new ThePlaneProgram(gl);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // create uv buffer
    createGeometryBuffer(gl, this.quad.uvs);
    gl.enableVertexAttribArray(this.program.attributes.uv);
    gl.vertexAttribPointer(this.program.attributes.uv, 2, gl.FLOAT, false, 0, 0)

    // create position buffer
    createGeometryBuffer(gl, this.quad.vertices);
    gl.enableVertexAttribArray(this.program.attributes.position);
    gl.vertexAttribPointer(this.program.attributes.position, 3, gl.FLOAT, false, 0, 0)

    // create index buffer
    createElementBuffer(gl, this.quad.indices);

    // cleanup
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  public draw() {
    const gl = this.context.gl;
    const program = this.program;

    program.use();

    program.uniforms.modelMatrix.set(this.modelMatrix);
    program.uniforms.projectionMatrix.set(this.context.perspectiveProjection);
    program.uniforms.texture.set(0);

    gl.bindVertexArray(this.vao);

    gl.drawElements(gl.TRIANGLES, this.quad.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
  }
}

export default ThePlane;
