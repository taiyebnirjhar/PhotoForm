const elements: string[] = [
  "/assets/suits/suit-sample-1.png",
  "/assets/suits/suit-sample-2.png",
  "/assets/suits/suit-sample-3.png",
  "/assets/suits/suit-sample-4.png",
]

const mappedElements = elements.map((element, index) => ({
  id: index,
  name: `Element ${index + 1}`,
  element,
}))

export default mappedElements
