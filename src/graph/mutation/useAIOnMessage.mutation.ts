import { gql } from 'graphql-request';

import {
	GraphQL_UseAi_OnMessageMutation,
	GraphQL_UseAi_OnMessageMutationVariables
} from '../gql/result';
import { myMutation } from '../graph';

const request = gql`
	mutation UseAI_OnMessage($fields: useAI_OnMessageInput) {
		useAI_OnMessage(fields: $fields) {
			expertiseIdentified
			keywordsMessage
			mainExpertise
		}
	}
`;

export async function useAIOnMessage(variable: GraphQL_UseAi_OnMessageMutationVariables) {
	return myMutation<GraphQL_UseAi_OnMessageMutationVariables, GraphQL_UseAi_OnMessageMutation>({
		request,
		variable
	});
}
