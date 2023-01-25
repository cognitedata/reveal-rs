const getDocsUrl = (ruleName) =>
  `https://github.com/cognitedata/applications/tree/master/packages/eslint-plugin/docs/rules/${ruleName}.md`;

const isDirectiveComment = (node) => {
  const comment = node.value.trim();

  return (
    (node.type === 'Line' && comment.indexOf('eslint-') === 0) ||
    (node.type === 'Block' &&
      (comment.indexOf('global ') === 0 ||
        comment.indexOf('eslint ') === 0 ||
        comment.indexOf('eslint-') === 0))
  );
};

module.exports = {
  getDocsUrl,
  isDirectiveComment,
};
