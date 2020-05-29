module.exports = (outline, tocPageCount) => {
  const getTabs = tabLevel => {
    let output = '';
    for (let i = 0; i < tabLevel; ++i) {
      output += '  ';
    }

    return output;
  };
  const lineLength = 60;
  const makeTOC = (outln, tabLevel, prefix = '') =>
    outln.reduce((acc, curr, idx) => {
      const entry = `${getTabs(tabLevel)}${prefix}${idx + 1} ${curr.title}`;
      const paddingLength =
        lineLength - String(curr.page + tocPageCount).length;
      const line = curr.page
        ? `${entry.padEnd(paddingLength, '.')}${curr.page + tocPageCount}`
        : entry;
      if (curr.children) {
        acc.push({ line, page: curr.page });
        const merged = acc.concat(
          makeTOC(curr.children, ++tabLevel, `${prefix}${idx + 1}.`)
        );
        tabLevel--;

        return merged;
      }
      acc.push({ line, page: curr.page });

      return acc;
    }, []);

  return makeTOC(outline, 0);
};
