// Permite `import x from './foo.png'` no TypeScript — o Metro (bundler do
// Expo) já sabe resolver esses arquivos em tempo de build, isso aqui é só
// pro type-check não reclamar.
declare module '*.png' {
  const value: number;
  export default value;
}
declare module '*.jpg' {
  const value: number;
  export default value;
}
declare module '*.svg' {
  const value: number;
  export default value;
}
