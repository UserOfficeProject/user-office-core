const countOutline = outline => outline.reduce((acc, curr) => {
  if (curr.children === undefined) {
    return acc + 1
  }
  return acc + countOutline(curr.children) + 1
}, 0)

module.exports = countOutline
