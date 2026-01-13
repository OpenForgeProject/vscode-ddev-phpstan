module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (commit) => commit.includes('Co-authored-by: Copilot Autofix powered by AI'),
  ],
};

