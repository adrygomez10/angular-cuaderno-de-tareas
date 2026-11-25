import js from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const lazyManagementImport = {
  regex: String.raw`(?:^|/)management/`,
  message: 'Carga la sección de gestión mediante loadChildren desde el router.',
};

export default defineConfig([
  {
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      complexity: ['error', 8],
      'max-depth': ['error', 3],
    },
  },
  {
    files: ['src/app/{add-task,task-list}/**/*.ts'],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            lazyManagementImport,
            {
              regex: String.raw`^(?:\.\./)+(?:(?:app|app-module|app-routing-module)(?:$|\.)|(?:add-task|task-list)(?:$|/))`,
              message:
                'Comunica los componentes a través de sus entradas, salidas y el componente raíz.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts'],
    ignores: ['src/app/{add-task,task-list}/**/*.ts', 'src/app/tasks/management/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [lazyManagementImport] }],
    },
  },
  {
    files: ['src/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
]);
