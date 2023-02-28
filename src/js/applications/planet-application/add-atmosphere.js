import * as THREE from 'three'

export function addAtmosphere(position, scale, color = '#000fff') {
  const geometry = new THREE.SphereGeometry(1, 50, 50)

  const vertexShader = `
  varying vec3 vVertexWorldPosition;
  varying vec3 vVertexNormal;
  void main() {
    vVertexNormal	= normalize(normalMatrix * normal);
    vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `
  const fragmentShader = `
  uniform vec3 color;
  uniform float coefficient;
  uniform float power;
  varying vec3 vVertexNormal;
  varying vec3 vVertexWorldPosition;
  void main() {
    vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
    vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
    viewCameraToVertex = normalize(viewCameraToVertex);
    float intensity	= pow(
      coefficient + dot(vVertexNormal, viewCameraToVertex),
      power
    );
    gl_FragColor = vec4(color, intensity);
  }
  `
  const material = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: {
      coefficient: {
        value: 0.2,
      },
      color: {
        value: new THREE.Color(color),
      },
      power: {
        value: 8,
      },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  })

  const fog = new THREE.Mesh(geometry, material)
  fog.scale.set(scale.x, scale.y, scale.z)
  fog.position.set(position.x, position.y, position.z)
  fog.material.needsUpdate = true
  return fog
}
