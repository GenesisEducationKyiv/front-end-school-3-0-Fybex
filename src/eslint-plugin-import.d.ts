declare module 'eslint-plugin-import' {
  import { type TSESLint } from '@typescript-eslint/utils';

  const eslintPluginImport: {
    flatConfigs: {
      recommended: TSESLint.FlatConfig.ConfigArray;
    };
  };

  export default eslintPluginImport;
}
