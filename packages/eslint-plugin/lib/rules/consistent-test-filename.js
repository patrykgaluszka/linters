/**
 * @fileoverview Enforce consistent naming of test test files
 * @author Patryk Galuszka
 */
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const R = require('ramda');
const { isNamed } = require('../helpers/ast-utils');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
const isJasmineElement = R.anyPass([
  isNamed('describe'),
  isNamed('xdescribe'),
  isNamed('fdescribe'),
  isNamed('it'),
  isNamed('xit'),
  isNamed('fit'),
  isNamed('expect')
]);

const getExpectedName = (filename, namePattern) => {
  const { suffix = 'spec' } = namePattern;
  const splittedName = filename.split('.');
  const name = splittedName.slice(0, -1).join('.');
  const extension = splittedName.slice(-1);

  return `${name}.${suffix}.${extension}`;
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
  meta: {
    docs: {
      description: 'Enforce consistent naming of test test files',
      category: 'Jasmine best practices',
      recommended: true
    },
    fixable: null,
    messages: {
      noConsistentNaming: 'Test file should be named "{{ expectedName }}"'
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffix: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;

        if (isJasmineElement(callee)) {
          const namePattern = R.pathOr({}, ['options', '0'], context);
          const suffix = R.propOr('spec', 'suffix', namePattern);
          const filename = context.getFilename();
          // eslint-disable-next-line no-useless-escape
          const hasExpectedName = RegExp(`.+\.${suffix}\.js$`).test(filename);

          if (!hasExpectedName) {
            const [Program] = context.getAncestors();
            const expectedName = getExpectedName(filename, namePattern);

            context.report({
              messageId: 'noConsistentNaming',
              data: {
                expectedName
              },
              node: Program
            });
          }
        }
      }
    };
  }
};
