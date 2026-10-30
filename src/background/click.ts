import Mat4, * as mat4 from "@fishley/wwwgraphics/math/mat4";
import Vec3, * as vec3 from "@fishley/wwwgraphics/math/vec3";
import type GlobalContext from "./framework/GlobalContext";
import type ThePlane from "./entities/ThePlane";
import Vec2 from "@fishley/wwwgraphics/math/vec2";
import type Ripples from "./entities/Ripple";

function transformPoint(m: Mat4, x: number, y: number, z: number): Vec3 {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  return new Vec3(
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  );
}

export function setupMouseClicks(
  globalContext: GlobalContext,
  thePlane: ThePlane,
  ripples: Ripples,
) {
  window.addEventListener("mousedown", (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = 1 - (e.clientY / window.innerHeight) * 2;

    const inv = new Mat4();
    mat4.multiply(inv, globalContext.perspectiveProjection);
    mat4.multiply(inv, thePlane.modelMatrix);
    if (!mat4.invert(inv)) return;

    // get point in the planes local space
    const near = transformPoint(inv, x, y, -1);
    const far = transformPoint(inv, x, y, 1);

    // How how from the near plane to the_plane. works because plane is always at z=0
    const d = vec3.direction(near, far);
    const t = -near.z / d.z;
    const distance = vec3.multiplyScalar(vec3.from(d), t);

    const intersect = vec3.add(vec3.from(near), distance);

    // to -1 - 1 space
    vec3.multiplyScalar(intersect, 2);

    const p = new Vec2(
      intersect.x * (window.innerWidth / window.innerHeight),
      intersect.y,
    );

    ripples.createRipple(p, 0, new Vec2(1, 1));
    ripples.createRipple(p, 0.1, new Vec2(0.6, 0.6));
    ripples.createRipple(p, 0.4, new Vec2(0.2, 0.2));
  });
}
