export const QUAD_GEOMETRY = [
  0, 0,
  0, 1,
  1, 0,
  1, 0,
  0, 1,
  1, 1,
];

export function createBasicQuadGeometry(size: number) {
  let s = -size;
  let b = size
  return [
    s, s,
    s, b,
    b, s,
    b, s,
    s, b,
    b, b,
  ]
}

export const QUAD_GEOMETRY_3D = [
  -1, -1, 0,
  -1, 1, 0,
  1, -1, 0,
  1, -1, 0,
  -1, 1, 0,
  1, 1, 0,
];


export const TRI_FULLSCREEN_GEOMETRY = [
  -1, -1,
  -1, 3,
  3, -1
];

export const TRI_FULLSCREEN_UV = [
  0, 0,
  0, 2,
  2, 0
];

/**
 * look into doing this statically rather than doing runtime bullshit
 * 
 * stolen from threejs
 */
export function createQuadGeometry(segments: number) {
  const half = 0.5;
  const segment = 1 / segments;

  const gridX = Math.floor( segments );
  const gridY = Math.floor( segments );

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;
  
  const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		for ( let iy = 0; iy < gridY1; iy ++ ) {

			const y = iy * segment - half;

			for ( let ix = 0; ix < gridX1; ix ++ ) {

				const x = ix * segment - half;

				vertices.push( x, - y, 0 );

				normals.push( 0, 0, 1 );

				uvs.push( ix / gridX );
				uvs.push( 1 - ( iy / gridY ) );

			}

		}

		for ( let iy = 0; iy < gridY; iy ++ ) {

			for ( let ix = 0; ix < gridX; ix ++ ) {

				const a = ix + gridX1 * iy;
				const b = ix + gridX1 * ( iy + 1 );
				const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				const d = ( ix + 1 ) + gridX1 * iy;

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}


    return {
      indices,
      vertices,
      normals,
      uvs
    }
}

console.log(createQuadGeometry(2))