import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Mesh, InstancedMesh, Object3D, PerspectiveCamera } from "three";

const MAX_CUBES = 10000;
const CUBE_SIZE_WITH_MARGIN = 1.05;

const Box = (props) => {
  // const mesh = useRef<Mesh>();

  const [hovered, setHover] = useState(false);
  // const [active, setActive] = useState(false);

  // useFrame(() => {
  //   mesh.current.rotation.y += 0.005;
  // });

  return (
    <mesh
      {...props}
      // ref={mesh}
      scale={[5, 5, 5]}
      // onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        color={hovered ? "#7d0205" : "#9e0409"}
      />
    </mesh>
  );
};

const Boxes = ({ number, position }) => {
  const mesh = useRef<InstancedMesh>();
  const devices = useMemo(() => new Object3D(), []);

  useFrame(({ camera }) => {
    camera.position.set(position[0], position[1], position[2]);
    camera.updateProjectionMatrix();
  });

  useFrame(() => {
    mesh.current.count = number;

    Array(number)
      .fill(0)
      .map((_, i) => {
        const numberPosition = calcNumberPosition(i, number);
        devices.position.set(
          numberPosition[0],
          numberPosition[1],
          numberPosition[2]
        );
        devices.updateMatrix();
        mesh.current.setMatrixAt(i, devices.matrix);
      });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    // @ts-ignore
    <instancedMesh ref={mesh} args={[null, null, MAX_CUBES]}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshPhongMaterial attach="material" color="#9e0409" />
      // @ts-ignore
    </instancedMesh>
  );
};

function calcNumberPosition(i: number, total: number) {
  let value = 0;
  let remainder = i;

  value = Math.floor(remainder / 1000);
  remainder = i % 1000;

  const thx = 0;
  const thy = 0;
  const thz = -value * 1.1;

  value = Math.floor(remainder / 100);
  remainder = i % 100;

  const hx = 0;
  const hy = value * 10 * 1.1;
  const hz = 0;

  value = Math.floor(remainder / 10);
  remainder = i % 10;

  const tx = value * CUBE_SIZE_WITH_MARGIN;
  const ty = 0;
  const tz = 0;

  const ux = 0;
  const uy = remainder * CUBE_SIZE_WITH_MARGIN;
  const uz = 0;

  const x = ux + tx + hx + thx;
  const y = uy + ty + hy + thy;
  const z = uz + tz + hz + thz;
  return [x, y, z];
}

function Camera(props) {
  const ref = useRef<PerspectiveCamera>();
  const { setDefaultCamera } = useThree();
  // Make the camera known to the system
  useEffect(() => void setDefaultCamera(ref.current), []);
  // Update it every frame
  useFrame(() => ref.current.updateMatrixWorld());
  return <perspectiveCamera ref={ref} {...props} />;
}

const BoxesPage = () => {
  // const mesh = useRef<Mesh>();
  const [numberString, setNumberString] = useState<string>("1");

  let number = parseInt(numberString, 10) || 0;
  if (number > MAX_CUBES) {
    number = 0;
  }

  const position = isNaN(number)
    ? undefined
    : [
        2.5 + Math.floor((number - 1) / 10) * 0.5,
        0, //Math.min(number, 10) * 0.5,
        10 + Math.floor((number - 1) / 10) * 0.7,
      ];

  return (
    <>
      <h1>Numberblocks Creator</h1>

      <div className="number-input-wrapper">
        <input
          value={numberString}
          onChange={(e) => setNumberString(e.target.value)}
        />
        <input
          type="range"
          value={numberString}
          onChange={(e) => setNumberString(e.target.value)}
          min={1}
          max={MAX_CUBES}
        />
      </div>

      <div className="number">{isNaN(number) ? "" : number}</div>

      <Canvas
        // key={number}
        camera={{
          position,
          rotation: [0.3, 0, 0],
        }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 40]} rotation={[0.5, 0.5, 0.5]} />
        <Boxes number={number} position={position} />
      </Canvas>
    </>
  );
};

export default BoxesPage;
