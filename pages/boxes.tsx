import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Mesh, InstancedMesh, Object3D, PerspectiveCamera } from "three";

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

  if (isNaN(number)) {
    return null;
  }

  useFrame(({ camera }) => {
    camera.position.set(position[0], position[1], position[2]);
    camera.updateProjectionMatrix();
  });

  useFrame(() => {
    mesh.current.count = number;

    Array(number)
      .fill(0)
      .map((_, i) => {
        devices.position.set(Math.floor(i / 10) * 1.05, (i % 10) * 1.05, 0);
        devices.updateMatrix();
        mesh.current.setMatrixAt(i, devices.matrix);
      });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    // @ts-ignore
    <instancedMesh ref={mesh} args={[null, null, 10000]}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshPhongMaterial attach="material" color="#9e0409" />
      // @ts-ignore
    </instancedMesh>
  );
};

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

  let number = parseInt(numberString, 10);
  // if (number > 10000) {
  //   number = NaN;
  // }

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
          max={10000}
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
