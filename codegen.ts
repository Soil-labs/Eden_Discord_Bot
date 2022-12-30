import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: 'https://soil-api-backend-botdevelopai2.up.railway.app/graphql',
	documents: ['./src/graph/query/*.ts', './src/graph/mutation/*.ts'],
	generates: {
		'./src/graph/gql/result.ts': {
			plugins: ['typescript', 'typescript-operations'],
			config: {
				typesPrefix: 'GraphQL_'
			}
		}
	}
};

export default config;
