class FrameBuffer {
  public buffer: WebGLFramebuffer;
  public outputTexture: WebGLTexture;

  public width: number;
  public height: number;

  private gl: WebGL2RenderingContext;

  constructor(
    gl: WebGL2RenderingContext,
    width: number,
    height: number
  ) {
    this.gl = gl;

    this.buffer = this.setupFrameBuffer(gl);
    this.outputTexture = this.setupOutputTexture(gl)

    this.setTextureDimensions(width, height);
    this.width = width;
    this.height = height;
    
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.outputTexture,
      0,
    );
  }

  private setupFrameBuffer(gl: WebGL2RenderingContext) {
    const buffer = gl.createFramebuffer();
     gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
     return buffer;
  }

  private setupOutputTexture(gl: WebGL2RenderingContext) {
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
  }

  public setTextureDimensions(width: number, height: number) {
    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.outputTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );

    this.width = width;
    this.height = height;
  }

  public bind() {
    const gl = this.gl;

    // bind
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
    gl.viewport(0, 0, this.width, this.height);

    // clear
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  public unbind() {
    const gl = this.gl;

    // unbind
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  public draw(fn: () => void) {
    this.bind();
    fn();
    this.unbind();
  }
}
export default FrameBuffer;