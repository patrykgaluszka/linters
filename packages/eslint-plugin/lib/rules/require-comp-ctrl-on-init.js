/**
 * @fileoverview Require use of $onInit in AngularJS component controller
 * @author Patryk Galuszka
 */
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const R = require('ramda');
const { getObjectPropertyValue } = require('../helpers/ast-utils');
const { getComponentConfig, isModuleRegister } = require('../helpers/angularJs');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
const isAssignedToMethod = R.allPass([
  R.propEq('type', 'MethodDefinition'),
  R.pathEq(['key', 'name'], '$onInit')
]);
const isAssignedToThis = R.allPass([
  R.propEq('type', 'ExpressionStatement'),
  R.pathEq(['expression', 'left', 'object', 'type'], 'ThisExpression'),
  R.pathEq(['expression', 'left', 'property', 'name'], '$onInit')
]);
const onInitFound = R.anyPass([isAssignedToMethod, isAssignedToThis]);

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
  meta: {
    docs: {
      description: 'Require use of $onInit in Angular component',
      category: 'AngularJS 1.7 migration',
      recommended: true
    },
    fixable: null,
    messages: {
      onInitNotFound: 'No $onInit in component controller'
    },
    schema: []
  },

  create(context) {
    return {
      CallExpression(node) {
        if (isModuleRegister('component', node)) {
          const controllerFunc = R.pipe(
            getComponentConfig,
            getObjectPropertyValue('controller')
          )(node);
          const controllerContent = R.pathOr([], ['body', 'body'], controllerFunc);

          if (!controllerContent.find(onInitFound)) {
            context.report({ messageId: 'onInitNotFound', node: controllerFunc });
          }
        }
      }
    };
  }
};
