const defaultPrecision = Math.PI / 45;
const tableSize = Math.floor((2 * Math.PI) / defaultPrecision);
const sinTable = new Float32Array(tableSize);
const cosTable = new Float32Array(tableSize);

// Precompute values
for (let i = 0; i < tableSize; i++) {
  const angle = i * defaultPrecision;
  sinTable[i] = Math.sin(angle);
  cosTable[i] = Math.cos(angle);
}

const fastSin = (angle: number) => {
  let index = Math.floor((angle % (2 * Math.PI)) / defaultPrecision);
  while (index < 0) index += tableSize; // Handle negative angles
  return sinTable[index];
};

const fastCos = (angle: number) => {
  let index = Math.floor((angle % (2 * Math.PI)) / defaultPrecision);
  while (index < 0) index += tableSize; // Handle negative angles
  return cosTable[index];
};

export { fastSin as sin, fastCos as cos };
