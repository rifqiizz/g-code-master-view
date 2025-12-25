import { Text } from '@react-three/drei';

const AxisHelper = () => {
  const axisLength = 0.5;
  const arrowSize = 0.03;

  return (
    <group position={[-0.8, 0, -0.8]}>
      {/* X Axis - Red */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, axisLength, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#e15555" linewidth={2} />
      </line>
      <mesh position={[axisLength + arrowSize, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[arrowSize, arrowSize * 2, 8]} />
        <meshBasicMaterial color="#e15555" />
      </mesh>
      <Text
        position={[axisLength + 0.1, 0, 0]}
        fontSize={0.06}
        color="#e15555"
        anchorX="left"
      >
        X
      </Text>

      {/* Y Axis - Green (Z in CNC becomes Y in Three.js view) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, axisLength])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#55c055" linewidth={2} />
      </line>
      <mesh position={[0, 0, axisLength + arrowSize]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[arrowSize, arrowSize * 2, 8]} />
        <meshBasicMaterial color="#55c055" />
      </mesh>
      <Text
        position={[0, 0, axisLength + 0.1]}
        fontSize={0.06}
        color="#55c055"
        anchorX="center"
      >
        Y
      </Text>

      {/* Z Axis - Blue (Y in CNC becomes Z up in Three.js) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, axisLength, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#5588dd" linewidth={2} />
      </line>
      <mesh position={[0, axisLength + arrowSize, 0]}>
        <coneGeometry args={[arrowSize, arrowSize * 2, 8]} />
        <meshBasicMaterial color="#5588dd" />
      </mesh>
      <Text
        position={[0, axisLength + 0.1, 0]}
        fontSize={0.06}
        color="#5588dd"
        anchorX="center"
        anchorY="bottom"
      >
        Z
      </Text>
    </group>
  );
};

export default AxisHelper;
