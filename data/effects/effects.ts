const effects = [...Array(100)].map((_, i) => ({
  id: i,
  name: `Effect ${i + 1}`,
  filter: `blur(${i % 10}px)`,
}))

export default effects
