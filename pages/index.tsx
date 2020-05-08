import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { InstancedMesh, Object3D } from "three";
import numberToEnglish from "./numberToWords";

const MAX_NUMBER = 1000000000000000;

enum Direction {
  UP = "UP",
  LEFT = "LEFT",
}

interface PlaceValue {
  name: string;
  shortName: string;
  value: number;
  direction: Direction;
  width: number;
  height: number;
  depth: number;
}

interface PlaceValueWithAmount extends PlaceValue {
  amount: number;
  offset: number;
}

const colors = [
  "#000000",
  "#b82728",
  "#e38433",
  "#e8e253",
  "#68dc43",
  "#68c0d9",
  "#5129d0",
  "#9a59c0",
  "#db4d95",
  "#a8adab",
  "#ececea",
  "#cacdcc",
  "#878a8d",
];

const getColor = (placeValue: PlaceValueWithAmount, index: number): string => {
  if (placeValue.direction === Direction.LEFT && placeValue.amount === 1) {
    return colors[10];
  }

  if (placeValue.amount === 7) {
    return colors[index + 1];
  }

  if (placeValue.amount === 9) {
    if (index < 3) {
      return colors[11];
    }
    if (index < 6) {
      return colors[9];
    } else {
      return colors[12];
    }
  }

  return colors[placeValue.amount];
};

const placeValues: PlaceValue[] = [
  {
    name: "Units",
    shortName: "U",
    value: 1,
    direction: Direction.UP,
    width: 1,
    height: 1,
    depth: 1,
  },
  {
    name: "Tens",
    shortName: "T",
    value: 10,
    direction: Direction.LEFT,
    width: 1,
    height: 10,
    depth: 1,
  },
  {
    name: "Hundreds",
    shortName: "H",
    value: 100,
    direction: Direction.UP,
    width: 10,
    height: 10,
    depth: 1,
  },
  {
    name: "Thousands",
    shortName: "Th",
    value: 1000,
    direction: Direction.UP,
    width: 10,
    height: 10,
    depth: 10,
  },
  {
    name: "Ten Thousands",
    shortName: "T Th",
    value: 10000,
    direction: Direction.LEFT,
    width: 10,
    height: 100,
    depth: 10,
  },
  {
    name: "Hundred Thousands",
    shortName: "H Th",
    value: 100000,
    direction: Direction.UP,
    width: 100,
    height: 100,
    depth: 10,
  },
  {
    name: "Millions",
    shortName: "M",
    value: 1000000,
    direction: Direction.UP,
    width: 100,
    height: 100,
    depth: 100,
  },
  {
    name: "Ten Millions",
    shortName: "T M",
    value: 10000000,
    direction: Direction.LEFT,
    width: 100,
    height: 1000,
    depth: 100,
  },
  {
    name: "Hundred Millions",
    shortName: "H M",
    value: 100000000,
    direction: Direction.UP,
    width: 1000,
    height: 1000,
    depth: 100,
  },
  {
    name: "Billions",
    shortName: "B",
    value: 1000000000,
    direction: Direction.UP,
    width: 1000,
    height: 1000,
    depth: 1000,
  },
  {
    name: "Ten Billions",
    shortName: "T B",
    value: 10000000000,
    direction: Direction.LEFT,
    width: 1000,
    height: 10000,
    depth: 1000,
  },
  {
    name: "Hundred Billions",
    shortName: "H B",
    value: 100000000000,
    direction: Direction.LEFT,
    width: 10000,
    height: 10000,
    depth: 1000,
  },
  {
    name: "Trillions",
    shortName: "Tr",
    value: 1000000000000,
    direction: Direction.UP,
    width: 10000,
    height: 10000,
    depth: 10000,
  },
  {
    name: "Ten Trillions",
    shortName: "T Tr",
    value: 10000000000000,
    direction: Direction.UP,
    width: 10000,
    height: 100000,
    depth: 10000,
  },
  {
    name: "Hundred Trillions",
    shortName: "H Tr",
    value: 100000000000000,
    direction: Direction.LEFT,
    width: 100000,
    height: 100000,
    depth: 10000,
  },
  {
    name: "Quadrillions",
    shortName: "Q",
    value: 1000000000000000,
    direction: Direction.UP,
    width: 100000,
    height: 100000,
    depth: 100000,
  },
];

const splitIntoParts = (num: number): PlaceValueWithAmount[] => {
  let offset = -1;
  return placeValues
    .map((placeValue) => {
      const amount =
        placeValue.value <= num
          ? Math.floor((num % (placeValue.value * 10)) / placeValue.value)
          : undefined;

      if (amount !== undefined && amount !== 0) {
        if (placeValue.direction === Direction.UP) {
          offset += placeValue.width;
        } else if (placeValue.direction === Direction.LEFT) {
          offset += placeValue.width * amount;
        }
      }

      return {
        ...placeValue,
        amount,
        offset,
      };
    })
    .filter((placeValue) => placeValue.amount !== undefined)
    .reverse();
};

const Camera = ({ position }) => {
  useFrame(({ camera }) => {
    camera.position.set(position[0], position[1], position[2]);
    camera.updateProjectionMatrix();
  });

  return null;
};

const calcNumberPosition = (i: number, placeValue: PlaceValueWithAmount) => {
  const x = -placeValue.offset + placeValue.width / 2;
  const y = placeValue.height / 2;
  const z = placeValue.depth / 2;

  let dx;
  let dy;
  let dz;

  if (placeValue.direction === Direction.UP) {
    dx = 0;
    dy = i * placeValue.height;
    dz = 0;
  } else if (placeValue.direction === Direction.LEFT) {
    dx = i * placeValue.width;
    dy = 0;
    dz = 0;
  }

  return [x + dx, y + dy, z + dz];
};

const Boxes = ({ placeValue }: { placeValue: PlaceValueWithAmount }) => {
  return (
    <>
      {Array(placeValue.amount)
        .fill(0)
        .map((_, i) => {
          const numberPosition = calcNumberPosition(i, placeValue);
          return (
            <mesh
              position={numberPosition}
              scale={[placeValue.width, placeValue.height, placeValue.depth]}
            >
              <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
              <meshStandardMaterial
                attach="material"
                color={getColor(placeValue, i)}
              />
            </mesh>
          );
        })}
    </>
  );
};

const BoxesPage = () => {
  const [numberString, setNumberString] = useState<string>("1");

  let number = parseInt(numberString, 10) || 0;
  if (number > MAX_NUMBER) {
    number = MAX_NUMBER;
  }

  const parts = splitIntoParts(number);

  const position = isNaN(number)
    ? undefined
    : [
        2 + Math.floor((Math.min(number, 100) - 1) / 10) * 0.5,
        0, //Math.min(number, 10) * 0.5,
        15 + Math.floor((Math.min(number, 1000) - 1) / 10) * 0.7,
      ];

  return (
    <>
      <h1>Numberblocks Creator</h1>

      <div className="number-input-wrapper">
        <input
          className="number-input"
          value={numberString}
          onChange={(e) => setNumberString(e.target.value)}
        />
      </div>
      <div className="number-input-wrapper">
        <input
          className="number-range"
          type="range"
          value={numberString}
          onChange={(e) => setNumberString(e.target.value)}
          min={0}
          max={1000}
        />
      </div>

      <div className="number">{isNaN(number) ? "" : number}</div>

      <div className="numberInWords">
        {isNaN(number) ? "" : numberToEnglish(number)}
      </div>

      <div className="placeValues">
        {parts.map((placeValue) => (
          <div key={placeValue.value} className="placeValue">
            <div className="name">{placeValue.name}</div>
            <div className="shortName">
              <b>{placeValue.shortName}</b>
            </div>
            <div className="amount">{placeValue.amount}</div>
          </div>
        ))}
      </div>

      <Canvas
        camera={{
          position,
          rotation: [0.3, 0, 0],
        }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 40]} rotation={[0.5, 0.5, 0.5]} />
        <Camera position={position} />
        {parts.map((placeValue) => (
          <Boxes key={placeValue.name} placeValue={placeValue} />
        ))}
      </Canvas>
    </>
  );
};

export default BoxesPage;
