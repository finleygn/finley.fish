import WrappedProgram from "../framework/WrappedProgram";
import shaderDefaultVertex from '../shaders/object.vert.glsl?raw';
import shaderTextureFragment from '../shaders/texture.frag.glsl?raw';
import Mat2 from "../math/Mat2";
import { Vec2 } from "@fishley/wwwgraphics/math";
import { createQuadGeometry, QUAD_GEOMETRY, QUAD_GEOMETRY_3D } from "../geometry";
import { createElementBuffer, createGeometryBuffer } from "../framework/webgl";
import type GlobalContext from "../framework/GlobalContext";
import Mat4 from "../math/Mat4";

class ThePlaneProgram extends WrappedProgram {
  public u_matrix_projection_location: WebGLUniformLocation;
  public u_matrix_model_location: WebGLUniformLocation;
  public u_texture_location: WebGLUniformLocation;

  public a_position_location: number;
  public a_uv_location: number;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, shaderDefaultVertex, shaderTextureFragment);

    this.u_matrix_projection_location = this.setupUniformLocation(this.program, "u_projection_matrix");
    this.u_matrix_model_location = this.setupUniformLocation(this.program, "u_model_matrix");
    this.u_texture_location = this.setupUniformLocation(this.program, "u_texture");
    this.a_position_location = this.setupAttributeLocation(this.program, "position");
    this.a_uv_location = this.setupAttributeLocation(this.program, "uv");
  }

  public setUniformModelMatrix(matrix: Mat4) {
    this.gl.uniformMatrix4fv(
      this.u_matrix_model_location,
      false,
      matrix
    );
  }

  public setUniformProjectionMatrix(matrix: Mat4) {
    this.gl.uniformMatrix4fv(
      this.u_matrix_projection_location,
      false,
      matrix
    );
  }

  public setUniformTexture(texture: number) {
    this.gl.uniform1i(
      this.u_texture_location,
      texture
    );
  }
}


class ThePlane {
  private context: GlobalContext;
  private program: ThePlaneProgram;

  private quad = createQuadGeometry(3);
  public modelMatrix: Mat4;

  private indexBuffer: WebGLBuffer;
  private uvBuffer: WebGLBuffer;
  private vao: WebGLVertexArrayObject;

  private positionBuffer: WebGLBuffer;

  constructor(context: GlobalContext) {
    const gl = context.gl;
    this.context = context;
    this.program = new ThePlaneProgram(gl);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    

    // create uv buffer
    this.uvBuffer = createGeometryBuffer(gl, this.quad.uvs);
    gl.enableVertexAttribArray(this.program.a_uv_location);
    gl.vertexAttribPointer(this.program.a_uv_location, 2, gl.FLOAT, false, 0, 0)


    // create position buffer
    this.positionBuffer = createGeometryBuffer(gl, this.quad.vertices);
    gl.enableVertexAttribArray(this.program.a_position_location);
    gl.vertexAttribPointer(this.program.a_position_location, 3, gl.FLOAT, false, 0, 0)
  
    // create index buffer
    this.indexBuffer = createElementBuffer(gl, this.quad.indices);

    // cleanup
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    this.modelMatrix = new Mat4();
  }

  public draw() {
    const gl = this.context.gl;

    this.program.use();

    this.program.setUniformModelMatrix(this.modelMatrix);
    this.program.setUniformProjectionMatrix(this.context.perspectiveProjection);
    this.program.setUniformTexture(0);

    gl.bindVertexArray(this.vao);

    gl.drawElements(gl.TRIANGLES, this.quad.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);

  }
}

export default ThePlane;