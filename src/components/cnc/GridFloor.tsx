import { Grid } from '@react-three/drei';

interface GridFloorProps {
  size?: number;
}

const GridFloor = ({ size = 4 }: GridFloorProps) => {
  return (
    <Grid
      position={[0.5, -0.01, 0.5]}
      args={[size, size]}
      cellSize={0.1}
      cellThickness={0.6}
      cellColor="#2a2f38"
      sectionSize={0.5}
      sectionThickness={1.2}
      sectionColor="#3a4050"
      fadeDistance={8}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
    />
  );
};

export default GridFloor;
