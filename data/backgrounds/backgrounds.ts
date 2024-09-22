// List of free-to-use background image URLs
const backgroundUrls = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1501696461415-6bd6660c6742?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682260-96773eb01377?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1600&h=900&fit=crop",
]

const backgrounds = backgroundUrls.map((url, i) => ({
  id: i,
  name: `Background ${i + 1}`,
  url,
}))

export default backgrounds
