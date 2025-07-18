module.exports = {
  // Use a standard config, and then add Tailwind-specific overrides
  extends: [
    'stylelint-config-standard',
    // 'stylelint-config-tailwindcss/scss' is sometimes problematic with standard CSS files
    // We will handle Tailwind-specific rules manually below
  ],
  rules: {
    // Disable rules that conflict with Tailwind's utility-first approach
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer', // Added for newer Tailwind versions
        ],
      },
    ],
    // Disable rules that conflict with Tailwind's generated CSS or common practices
    'block-no-empty': null, // Allow empty CSS blocks
    'declaration-block-trailing-semicolon': null, // Don't enforce semicolons at end of blocks
    'no-empty-source': null, // Allow empty CSS files
    'rule-empty-line-before': [ // Relax empty line rules
      'always',
      {
        ignore: ['after-comment', 'first-nested'],
      },
    ],
    'selector-pseudo-class-no-unknown': [ // Allow custom pseudo-classes like :global
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'selector-type-no-unknown': [ // Allow unknown types, sometimes used in frameworks
      true,
      {
        ignoreTypes: ['_'],
      },
    ],
    'no-descending-specificity': null, // Disable specificity warnings, common with Tailwind
    'max-nesting-depth': null, // Disable nesting depth warnings

    // Specific fix for @import rule position
    'no-invalid-position-at-import-rule': null, // Allow @import anywhere (though it should be at top)

    // Relax rules for function-no-unknown, as some Tailwind functions might be custom
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'screen'], // Common Tailwind functions
      },
    ],

    // Relax rules for import-notation
    'import-notation': null, // Don't enforce specific import notation
  },
};