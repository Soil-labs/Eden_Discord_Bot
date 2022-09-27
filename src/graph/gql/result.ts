export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type GraphQL_DistanceType = {
  __typename?: 'DistanceType';
  hop0?: Maybe<Array<Maybe<Scalars['ID']>>>;
  hop1?: Maybe<Array<Maybe<Scalars['ID']>>>;
  hop2?: Maybe<Array<Maybe<Scalars['ID']>>>;
  hop3?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type GraphQL_Epic = {
  __typename?: 'Epic';
  _id?: Maybe<Scalars['ID']>;
  author?: Maybe<GraphQL_Members>;
  champion?: Maybe<GraphQL_Members>;
  channelDiscordlID?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  members?: Maybe<Array<Maybe<GraphQL_Members>>>;
  name?: Maybe<Scalars['String']>;
  notifyUsers?: Maybe<Array<Maybe<GraphQL_Members>>>;
  phase?: Maybe<GraphQL_PhaseEpicType>;
  project?: Maybe<GraphQL_Project>;
  serverID?: Maybe<Array<Maybe<Scalars['String']>>>;
  task?: Maybe<Array<Maybe<GraphQL_ProjectUpdate>>>;
  teams?: Maybe<Array<Maybe<GraphQL_Team>>>;
};

export type GraphQL_ErrorLog = {
  __typename?: 'ErrorLog';
  _id: Scalars['ID'];
  code?: Maybe<Scalars['String']>;
  component?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  stacktrace?: Maybe<Array<Maybe<Scalars['String']>>>;
  user?: Maybe<GraphQL_User>;
};

export type GraphQL_MatchType = {
  __typename?: 'MatchType';
  distanceMembers?: Maybe<GraphQL_DistanceType>;
  distanceProjectRoles?: Maybe<GraphQL_DistanceType>;
  recalculateMembers?: Maybe<Scalars['Boolean']>;
  recalculateProjectRoles?: Maybe<Scalars['Boolean']>;
};

export type GraphQL_Members = {
  __typename?: 'Members';
  _id?: Maybe<Scalars['ID']>;
  archiveProjects?: Maybe<Array<Maybe<Scalars['String']>>>;
  attributes?: Maybe<GraphQL_AttributesType>;
  bio?: Maybe<Scalars['String']>;
  content?: Maybe<GraphQL_ContentType>;
  discordAvatar?: Maybe<Scalars['String']>;
  discordName?: Maybe<Scalars['String']>;
  discriminator?: Maybe<Scalars['String']>;
  gardenUpdate?: Maybe<GraphQL_GardenUpdateType>;
  hoursPerWeek?: Maybe<Scalars['Float']>;
  interest?: Maybe<Scalars['String']>;
  invitedBy?: Maybe<GraphQL_MembersSmallType>;
  links?: Maybe<Array<Maybe<GraphQL_LinkType>>>;
  memberRole?: Maybe<GraphQL_RoleTemplate>;
  network?: Maybe<Array<Maybe<GraphQL_Members>>>;
  onbording?: Maybe<GraphQL_OnboardingType>;
  previusProjects?: Maybe<Array<Maybe<GraphQL_PreviusProjectsType>>>;
  projects?: Maybe<Array<Maybe<GraphQL_ProjectMemberType>>>;
  registeredAt?: Maybe<Scalars['String']>;
  serverID?: Maybe<Array<Maybe<Scalars['String']>>>;
  skills?: Maybe<Array<Maybe<GraphQL_SkillType_Member>>>;
  timeZone?: Maybe<Scalars['String']>;
  tweets?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type GraphQL_MembersSmallType = {
  __typename?: 'MembersSmallType';
  _id?: Maybe<Scalars['ID']>;
  discordAvatar?: Maybe<Scalars['String']>;
  discordName?: Maybe<Scalars['String']>;
  discriminator?: Maybe<Scalars['String']>;
};

export type GraphQL_Mutation = {
  __typename?: 'Mutation';
  addFavoriteProject?: Maybe<GraphQL_Members>;
  addNewMember?: Maybe<GraphQL_Members>;
  addSkillToMember?: Maybe<GraphQL_Members>;
  approveOrRejectSkill?: Maybe<GraphQL_Skills>;
  approveTweet?: Maybe<GraphQL_Project>;
  changeTeamMember_Phase_Project?: Maybe<GraphQL_Project>;
  createApprovedSkill?: Maybe<GraphQL_Skills>;
  createNewEpic?: Maybe<GraphQL_Epic>;
  createNewRole?: Maybe<GraphQL_Role>;
  createNewTeam?: Maybe<GraphQL_Team>;
  createProjectUpdate?: Maybe<GraphQL_ProjectUpdate>;
  createRoom?: Maybe<GraphQL_Rooms>;
  createSkill?: Maybe<GraphQL_Skills>;
  createSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  endorseAttribute?: Maybe<GraphQL_Members>;
  enterRoom?: Maybe<GraphQL_Rooms>;
  exitRoom?: Maybe<GraphQL_Rooms>;
  login: GraphQL_User;
  newTweetProject?: Maybe<GraphQL_TweetsProject>;
  relatedSkills?: Maybe<GraphQL_Skills>;
  updateMember?: Maybe<GraphQL_Members>;
  updateMemberInRoom?: Maybe<GraphQL_Members>;
  updateProject?: Maybe<GraphQL_Project>;
  updateRoleTemplate?: Maybe<GraphQL_RoleTemplate>;
  updateServer?: Maybe<GraphQL_ServerTemplate>;
  updateSkillCategory?: Maybe<GraphQL_SkillCategory>;
  updateSkillSubCategory?: Maybe<GraphQL_SkillSubCategory>;
};


export type GraphQL_MutationAddFavoriteProjectArgs = {
  fields: GraphQL_AddFavoriteProjectInput;
};


export type GraphQL_MutationAddNewMemberArgs = {
  fields: GraphQL_AddNewMemberInput;
};


export type GraphQL_MutationAddSkillToMemberArgs = {
  fields: GraphQL_AddSkillToMember_Input;
};


export type GraphQL_MutationApproveOrRejectSkillArgs = {
  fields?: InputMaybe<GraphQL_ApproveOrRejectSkillInput>;
};


export type GraphQL_MutationApproveTweetArgs = {
  fields: GraphQL_ApproveTweetInput;
};


export type GraphQL_MutationChangeTeamMember_Phase_ProjectArgs = {
  fields: GraphQL_ChangeTeamMember_Phase_ProjectInput;
};


export type GraphQL_MutationCreateApprovedSkillArgs = {
  fields?: InputMaybe<GraphQL_CreateApprovedSkillInput>;
};


export type GraphQL_MutationCreateNewEpicArgs = {
  fields: GraphQL_CreateNewEpicInput;
};


export type GraphQL_MutationCreateNewRoleArgs = {
  fields: GraphQL_CreateNewRoleInput;
};


export type GraphQL_MutationCreateNewTeamArgs = {
  fields: GraphQL_CreateNewTeamInput;
};


export type GraphQL_MutationCreateProjectUpdateArgs = {
  fields: GraphQL_CreateProjectUpdateInput;
};


export type GraphQL_MutationCreateRoomArgs = {
  fields: GraphQL_CreateRoomInput;
};


export type GraphQL_MutationCreateSkillArgs = {
  fields?: InputMaybe<GraphQL_CreateSkillInput>;
};


export type GraphQL_MutationCreateSkillsArgs = {
  fields?: InputMaybe<GraphQL_CreateSkillsInput>;
};


export type GraphQL_MutationEndorseAttributeArgs = {
  fields: GraphQL_EndorseAttributeInput;
};


export type GraphQL_MutationEnterRoomArgs = {
  fields: GraphQL_EnterRoomInput;
};


export type GraphQL_MutationExitRoomArgs = {
  fields: GraphQL_EnterRoomInput;
};


export type GraphQL_MutationLoginArgs = {
  fields: GraphQL_LoginInput;
};


export type GraphQL_MutationNewTweetProjectArgs = {
  fields: GraphQL_NewTweetProjectInput;
};


export type GraphQL_MutationRelatedSkillsArgs = {
  fields?: InputMaybe<GraphQL_RelatedSkillsInput>;
};


export type GraphQL_MutationUpdateMemberArgs = {
  fields: GraphQL_UpdateMemberInput;
};


export type GraphQL_MutationUpdateMemberInRoomArgs = {
  fields?: InputMaybe<GraphQL_UpdateMemberInRoomInput>;
};


export type GraphQL_MutationUpdateProjectArgs = {
  fields: GraphQL_UpdateProjectInput;
};


export type GraphQL_MutationUpdateRoleTemplateArgs = {
  fields?: InputMaybe<GraphQL_CreateRoleInput>;
};


export type GraphQL_MutationUpdateServerArgs = {
  fields?: InputMaybe<GraphQL_UpdateServerInput>;
};


export type GraphQL_MutationUpdateSkillCategoryArgs = {
  fields?: InputMaybe<GraphQL_UpdateSkillCategoryInput>;
};


export type GraphQL_MutationUpdateSkillSubCategoryArgs = {
  fields?: InputMaybe<GraphQL_UpdateSkillSubCategoryInput>;
};

export type GraphQL_PageInfo = {
  __typename?: 'PageInfo';
  end?: Maybe<Scalars['String']>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPrevPage?: Maybe<Scalars['Boolean']>;
  start?: Maybe<Scalars['String']>;
};

export type GraphQL_PaginatedSkills = {
  __typename?: 'PaginatedSkills';
  data?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  pageInfo?: Maybe<GraphQL_PageInfo>;
};

export type GraphQL_Project = {
  __typename?: 'Project';
  _id?: Maybe<Scalars['ID']>;
  budget?: Maybe<GraphQL_BudgetType>;
  champion?: Maybe<GraphQL_Members>;
  collaborationLinks?: Maybe<Array<Maybe<GraphQL_CollaborationLinksType>>>;
  dates?: Maybe<GraphQL_DatesType>;
  description?: Maybe<Scalars['String']>;
  gardenServerID?: Maybe<Scalars['String']>;
  garden_teams?: Maybe<Array<Maybe<GraphQL_Team>>>;
  role?: Maybe<Array<Maybe<GraphQL_RoleType>>>;
  serverID?: Maybe<Array<Maybe<Scalars['String']>>>;
  stepsJoinProject?: Maybe<Array<Maybe<Scalars['String']>>>;
  team?: Maybe<Array<Maybe<GraphQL_TeamType>>>;
  title?: Maybe<Scalars['String']>;
  tweets?: Maybe<Array<Maybe<GraphQL_TweetsType>>>;
};

export type GraphQL_ProjectUpdate = {
  __typename?: 'ProjectUpdate';
  _id?: Maybe<Scalars['ID']>;
  author?: Maybe<GraphQL_Members>;
  champion?: Maybe<GraphQL_Members>;
  content?: Maybe<Scalars['String']>;
  deWorkLink?: Maybe<Scalars['String']>;
  deadline?: Maybe<Scalars['String']>;
  epic?: Maybe<GraphQL_Epic>;
  members?: Maybe<Array<Maybe<GraphQL_Members>>>;
  notifyUsers?: Maybe<Array<Maybe<GraphQL_Members>>>;
  phase?: Maybe<GraphQL_PhaseEpicType>;
  priority?: Maybe<Scalars['Int']>;
  projects?: Maybe<GraphQL_Project>;
  registeredAt?: Maybe<Scalars['String']>;
  role?: Maybe<Array<Maybe<GraphQL_Role>>>;
  serverID?: Maybe<Array<Maybe<Scalars['String']>>>;
  task?: Maybe<GraphQL_ProjectUpdate>;
  team?: Maybe<Array<Maybe<GraphQL_Team>>>;
  threadDiscordID?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type GraphQL_Query = {
  __typename?: 'Query';
  adminFindAllSkillsEveryState?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  errors?: Maybe<Array<Maybe<GraphQL_ErrorLog>>>;
  findAllProjectsTeamsAnouncments?: Maybe<Array<Maybe<GraphQL_FindAllProjectsTeamsAnouncmentsOutput>>>;
  findEpic?: Maybe<Array<Maybe<GraphQL_Epic>>>;
  findGarden?: Maybe<Array<Maybe<GraphQL_FindGardenOutput>>>;
  findMember?: Maybe<GraphQL_Members>;
  findMembers?: Maybe<Array<Maybe<GraphQL_Members>>>;
  findProject?: Maybe<GraphQL_Project>;
  findProjectUpdates?: Maybe<Array<Maybe<GraphQL_ProjectUpdate>>>;
  findProjects?: Maybe<Array<Maybe<GraphQL_Project>>>;
  findProjects_RecommendedToUser?: Maybe<Array<Maybe<GraphQL_ProjectMatchType>>>;
  findProjects_RequireSkill?: Maybe<Array<Maybe<GraphQL_Project>>>;
  findRoleTemplate?: Maybe<GraphQL_RoleTemplate>;
  findRoleTemplates?: Maybe<Array<Maybe<GraphQL_RoleTemplate>>>;
  findRoles?: Maybe<Array<Maybe<GraphQL_Role>>>;
  findRoom?: Maybe<GraphQL_Rooms>;
  findServers?: Maybe<Array<Maybe<GraphQL_ServerTemplate>>>;
  findSkill?: Maybe<GraphQL_Skills>;
  findSkillCategories?: Maybe<Array<Maybe<GraphQL_SkillCategory>>>;
  findSkillCategory?: Maybe<GraphQL_SkillCategory>;
  findSkillSubCategories?: Maybe<Array<Maybe<GraphQL_SkillSubCategory>>>;
  findSkillSubCategory?: Maybe<GraphQL_SkillSubCategory>;
  findSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  findTeams?: Maybe<Array<Maybe<GraphQL_Team>>>;
  matchMembersToProject?: Maybe<Array<Maybe<GraphQL_MatchMembersToProjectOutput>>>;
  matchMembersToProjectRole?: Maybe<Array<Maybe<GraphQL_MatchMembersToProjectRoleOutput>>>;
  matchMembersToSkills?: Maybe<Array<Maybe<GraphQL_MatchMembersToSkillOutput>>>;
  matchMembersToUser?: Maybe<Array<Maybe<GraphQL_MatchMembersToUserOutput>>>;
  matchPrepareSkillToMembers?: Maybe<GraphQL_Skills>;
  matchPrepareSkillToProjectRoles?: Maybe<GraphQL_Skills>;
  matchProjectsToMember?: Maybe<Array<Maybe<GraphQL_Project>>>;
  matchSkillsToMembers?: Maybe<Array<Maybe<GraphQL_MatchMembersToSkillOutput>>>;
  matchSkillsToProjects?: Maybe<Array<Maybe<GraphQL_MatchSkillsToProjectsOutput>>>;
  match_projectToUser?: Maybe<GraphQL_ProjectUserMatchType>;
  members_autocomplete?: Maybe<Array<Maybe<GraphQL_Members>>>;
  skills?: Maybe<GraphQL_PaginatedSkills>;
  skills_autocomplete?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  waitingToAproveSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
};


export type GraphQL_QueryAdminFindAllSkillsEveryStateArgs = {
  fields?: InputMaybe<GraphQL_FindSkillsInput>;
};


export type GraphQL_QueryFindAllProjectsTeamsAnouncmentsArgs = {
  fields?: InputMaybe<GraphQL_FindAllProjectsTeamsAnouncmentsInput>;
};


export type GraphQL_QueryFindEpicArgs = {
  fields?: InputMaybe<GraphQL_FindEpicInput>;
};


export type GraphQL_QueryFindGardenArgs = {
  fields?: InputMaybe<GraphQL_FindGardenInput>;
};


export type GraphQL_QueryFindMemberArgs = {
  fields?: InputMaybe<GraphQL_FindMemberInput>;
};


export type GraphQL_QueryFindMembersArgs = {
  fields?: InputMaybe<GraphQL_FindMembersInput>;
};


export type GraphQL_QueryFindProjectArgs = {
  fields?: InputMaybe<GraphQL_FindProjectInput>;
};


export type GraphQL_QueryFindProjectUpdatesArgs = {
  fields?: InputMaybe<GraphQL_FindProjectUpdatesInput>;
};


export type GraphQL_QueryFindProjectsArgs = {
  fields?: InputMaybe<GraphQL_FindProjectsInput>;
};


export type GraphQL_QueryFindProjects_RecommendedToUserArgs = {
  fields?: InputMaybe<GraphQL_FindProjects_RecommendedToUserInput>;
};


export type GraphQL_QueryFindProjects_RequireSkillArgs = {
  fields?: InputMaybe<GraphQL_FindProjects_RequireSkillInput>;
};


export type GraphQL_QueryFindRoleTemplateArgs = {
  fields?: InputMaybe<GraphQL_FindRoleTemplateInput>;
};


export type GraphQL_QueryFindRoleTemplatesArgs = {
  fields?: InputMaybe<GraphQL_FindRoleTemplatesInput>;
};


export type GraphQL_QueryFindRolesArgs = {
  fields?: InputMaybe<GraphQL_FindRolesInput>;
};


export type GraphQL_QueryFindRoomArgs = {
  fields?: InputMaybe<GraphQL_FindRoomsInput>;
};


export type GraphQL_QueryFindServersArgs = {
  fields?: InputMaybe<GraphQL_FindServersInput>;
};


export type GraphQL_QueryFindSkillArgs = {
  fields?: InputMaybe<GraphQL_FindSkillInput>;
};


export type GraphQL_QueryFindSkillCategoriesArgs = {
  fields?: InputMaybe<GraphQL_FindSkillCategoriesInput>;
};


export type GraphQL_QueryFindSkillCategoryArgs = {
  fields?: InputMaybe<GraphQL_FindSkillCategoryInput>;
};


export type GraphQL_QueryFindSkillSubCategoriesArgs = {
  fields?: InputMaybe<GraphQL_FindSkillSubCategoriesInput>;
};


export type GraphQL_QueryFindSkillSubCategoryArgs = {
  fields?: InputMaybe<GraphQL_FindSkillSubCategoryInput>;
};


export type GraphQL_QueryFindSkillsArgs = {
  fields?: InputMaybe<GraphQL_FindSkillsInput>;
};


export type GraphQL_QueryFindTeamsArgs = {
  fields?: InputMaybe<GraphQL_FindTeamsInput>;
};


export type GraphQL_QueryMatchMembersToProjectArgs = {
  fields?: InputMaybe<GraphQL_MatchMembersToProjectInput>;
};


export type GraphQL_QueryMatchMembersToProjectRoleArgs = {
  fields?: InputMaybe<GraphQL_MatchMembersToProjectRoleInput>;
};


export type GraphQL_QueryMatchMembersToSkillsArgs = {
  fields?: InputMaybe<GraphQL_MatchMembersToSkillInput>;
};


export type GraphQL_QueryMatchMembersToUserArgs = {
  fields?: InputMaybe<GraphQL_MatchMembersToUserInput>;
};


export type GraphQL_QueryMatchPrepareSkillToMembersArgs = {
  fields?: InputMaybe<GraphQL_MatchPrepareSkillToMembersInput>;
};


export type GraphQL_QueryMatchPrepareSkillToProjectRolesArgs = {
  fields?: InputMaybe<GraphQL_MatchPrepareSkillToProjectRolesInput>;
};


export type GraphQL_QueryMatchProjectsToMemberArgs = {
  fields?: InputMaybe<GraphQL_MatchProjectsToMemberInput>;
};


export type GraphQL_QueryMatchSkillsToMembersArgs = {
  fields?: InputMaybe<GraphQL_MatchSkillsToMembersInput>;
};


export type GraphQL_QueryMatchSkillsToProjectsArgs = {
  fields?: InputMaybe<GraphQL_MatchSkillsToProjectsInput>;
};


export type GraphQL_QueryMatch_ProjectToUserArgs = {
  fields?: InputMaybe<GraphQL_Match_ProjectToUserInput>;
};


export type GraphQL_QueryMembers_AutocompleteArgs = {
  fields?: InputMaybe<GraphQL_Members_AutocompleteInput>;
};


export type GraphQL_QuerySkillsArgs = {
  fields?: InputMaybe<GraphQL_FindSkillsInputPaginated>;
};


export type GraphQL_QuerySkills_AutocompleteArgs = {
  fields?: InputMaybe<GraphQL_Skills_AutocompleteInput>;
};


export type GraphQL_QueryWaitingToAproveSkillsArgs = {
  fields?: InputMaybe<GraphQL_FindSkillsInput>;
};

export type GraphQL_Role = {
  __typename?: 'Role';
  _id?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  members?: Maybe<Array<Maybe<GraphQL_Members>>>;
  name?: Maybe<Scalars['String']>;
  project?: Maybe<GraphQL_Project>;
  serverID?: Maybe<Array<Maybe<Scalars['String']>>>;
  teams?: Maybe<Array<Maybe<GraphQL_Team>>>;
};

export type GraphQL_RoleTemplate = {
  __typename?: 'RoleTemplate';
  _id?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  skills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  title?: Maybe<Scalars['String']>;
};

export type GraphQL_RoleType_Garden = {
  __typename?: 'RoleType_garden';
  announcement?: Maybe<Array<Maybe<GraphQL_ProjectUpdate>>>;
  roleData?: Maybe<GraphQL_Role>;
};

export type GraphQL_Rooms = {
  __typename?: 'Rooms';
  _id?: Maybe<Scalars['ID']>;
  members?: Maybe<Array<Maybe<GraphQL_Members>>>;
  name?: Maybe<Scalars['String']>;
  registeredAt?: Maybe<Scalars['String']>;
};

export type GraphQL_ServerTemplate = {
  __typename?: 'ServerTemplate';
  _id?: Maybe<Scalars['ID']>;
  adminCommands?: Maybe<Array<Maybe<Scalars['String']>>>;
  adminID?: Maybe<Array<Maybe<Scalars['String']>>>;
  adminRoles?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
};

export type GraphQL_SkillCategory = {
  __typename?: 'SkillCategory';
  _id?: Maybe<Scalars['ID']>;
  description?: Maybe<Scalars['String']>;
  emoji?: Maybe<Scalars['String']>;
  id_lightcast?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  skills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  subCategorySkill?: Maybe<Array<Maybe<GraphQL_SkillSubCategory>>>;
};

export type GraphQL_SkillSubCategory = {
  __typename?: 'SkillSubCategory';
  _id?: Maybe<Scalars['ID']>;
  categorySkills?: Maybe<Array<Maybe<GraphQL_SkillCategory>>>;
  description?: Maybe<Scalars['String']>;
  emoji?: Maybe<Scalars['String']>;
  id_lightcast?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  skills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
};

export type GraphQL_Skills = {
  __typename?: 'Skills';
  _id?: Maybe<Scalars['ID']>;
  authors?: Maybe<Array<Maybe<GraphQL_Members>>>;
  categorySkills?: Maybe<Array<Maybe<GraphQL_SkillCategory>>>;
  id_lightcast?: Maybe<Scalars['String']>;
  match?: Maybe<GraphQL_MatchType>;
  members?: Maybe<Array<Maybe<GraphQL_Members>>>;
  name?: Maybe<Scalars['String']>;
  registeredAt?: Maybe<Scalars['String']>;
  relatedSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  state?: Maybe<GraphQL_ApprovedSkillEnum>;
  subCategorySkill?: Maybe<Array<Maybe<GraphQL_SkillSubCategory>>>;
  tweets?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type GraphQL_SortBySkill = {
  direction?: InputMaybe<GraphQL_SortDirection>;
  field?: InputMaybe<GraphQL_SortableSkillFields>;
};

export enum GraphQL_SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum GraphQL_SortableSkillFields {
  Id = '_id',
  Name = 'name',
  RegisteredAt = 'registeredAt'
}

export type GraphQL_Subscription = {
  __typename?: 'Subscription';
  memberUpdated?: Maybe<GraphQL_Members>;
  memberUpdatedInRoom?: Maybe<GraphQL_Members>;
  roomUpdated?: Maybe<GraphQL_Rooms>;
};


export type GraphQL_SubscriptionMemberUpdatedArgs = {
  fields?: InputMaybe<GraphQL_FindMembersInput>;
};


export type GraphQL_SubscriptionMemberUpdatedInRoomArgs = {
  fields?: InputMaybe<GraphQL_FindRoomsInput>;
};


export type GraphQL_SubscriptionRoomUpdatedArgs = {
  fields?: InputMaybe<GraphQL_FindRoomsInput>;
};

export type GraphQL_Team = {
  __typename?: 'Team';
  _id?: Maybe<Scalars['ID']>;
  categoryDiscordlD?: Maybe<Scalars['String']>;
  champion?: Maybe<Array<Maybe<GraphQL_Members>>>;
  channelGeneralDiscordID?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  epics?: Maybe<Array<Maybe<GraphQL_Epic>>>;
  members?: Maybe<Array<Maybe<GraphQL_Members>>>;
  name?: Maybe<Scalars['String']>;
  projects?: Maybe<GraphQL_Project>;
  roles?: Maybe<Array<Maybe<GraphQL_Role>>>;
  serverID?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type GraphQL_User = {
  __typename?: 'User';
  _id: Scalars['ID'];
  email?: Maybe<Scalars['String']>;
  isPasswordRandom?: Maybe<Scalars['Boolean']>;
  lastname?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  registeredAt?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type GraphQL_AddFavoriteProjectInput = {
  favorite?: InputMaybe<Scalars['Boolean']>;
  memberID?: InputMaybe<Scalars['ID']>;
  projectID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_AddNewMemberInput = {
  _id?: InputMaybe<Scalars['ID']>;
  bio?: InputMaybe<Scalars['String']>;
  discordAvatar?: InputMaybe<Scalars['String']>;
  discordName?: InputMaybe<Scalars['String']>;
  discriminator?: InputMaybe<Scalars['String']>;
  hoursPerWeek?: InputMaybe<Scalars['Float']>;
  invitedBy?: InputMaybe<Scalars['String']>;
  previusProjects?: InputMaybe<Array<InputMaybe<GraphQL_PreviusProjectsInput>>>;
  serverID?: InputMaybe<Scalars['String']>;
};

export type GraphQL_AddSkillToMember_Input = {
  authorID?: InputMaybe<Scalars['ID']>;
  memberID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  skillID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_ApproveOrRejectSkillInput = {
  _id?: InputMaybe<Scalars['ID']>;
  categorySkills?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  state?: InputMaybe<GraphQL_ApprovedSkillEnum>;
  subCategorySkill?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_ApproveTweetInput = {
  approved?: InputMaybe<Scalars['Boolean']>;
  projectID?: InputMaybe<Scalars['ID']>;
  tweetID?: InputMaybe<Scalars['ID']>;
};

export enum GraphQL_ApprovedSkillEnum {
  Approved = 'approved',
  Rejected = 'rejected',
  Waiting = 'waiting'
}

export enum GraphQL_AttributesEnum {
  Coordinator = 'Coordinator',
  Director = 'Director',
  Helper = 'Helper',
  Inspirer = 'Inspirer',
  Motivator = 'Motivator',
  Observer = 'Observer',
  Reformer = 'Reformer',
  Supporter = 'Supporter'
}

export type GraphQL_AttributesType = {
  __typename?: 'attributesType';
  Coordinator?: Maybe<Scalars['Int']>;
  Director?: Maybe<Scalars['Int']>;
  Helper?: Maybe<Scalars['Int']>;
  Inspirer?: Maybe<Scalars['Int']>;
  Motivator?: Maybe<Scalars['Int']>;
  Observer?: Maybe<Scalars['Int']>;
  Reformer?: Maybe<Scalars['Int']>;
  Supporter?: Maybe<Scalars['Int']>;
};

export type GraphQL_BudgetInput = {
  perHour?: InputMaybe<Scalars['String']>;
  token?: InputMaybe<Scalars['String']>;
  totalBudget?: InputMaybe<Scalars['String']>;
};

export type GraphQL_BudgetType = {
  __typename?: 'budgetType';
  perHour?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  totalBudget?: Maybe<Scalars['String']>;
};

export type GraphQL_ChangeTeamMember_Phase_ProjectInput = {
  memberID?: InputMaybe<Scalars['ID']>;
  phase?: InputMaybe<GraphQL_PhaseType>;
  projectID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_CollaborationLinksInput = {
  link?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type GraphQL_CollaborationLinksType = {
  __typename?: 'collaborationLinksType';
  link?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type GraphQL_ContentInput = {
  interest?: InputMaybe<Scalars['String']>;
  mostProud?: InputMaybe<Scalars['String']>;
  showCaseAbility?: InputMaybe<Scalars['String']>;
};

export type GraphQL_ContentType = {
  __typename?: 'contentType';
  interest?: Maybe<Scalars['String']>;
  mostProud?: Maybe<Scalars['String']>;
  showCaseAbility?: Maybe<Scalars['String']>;
};

export type GraphQL_CreateApprovedSkillInput = {
  name?: InputMaybe<Scalars['String']>;
};

export type GraphQL_CreateNewEpicInput = {
  _id?: InputMaybe<Scalars['ID']>;
  authorID?: InputMaybe<Scalars['String']>;
  championID?: InputMaybe<Scalars['String']>;
  channelDiscordlID?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  memberID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name?: InputMaybe<Scalars['String']>;
  notifyUserID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  phase?: InputMaybe<GraphQL_PhaseEpicType>;
  projectID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  teamID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_CreateNewRoleInput = {
  _id?: InputMaybe<Scalars['ID']>;
  description?: InputMaybe<Scalars['String']>;
  memberID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name?: InputMaybe<Scalars['String']>;
  projectID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  teamID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_CreateNewTeamInput = {
  _id?: InputMaybe<Scalars['ID']>;
  categoryDiscordlD?: InputMaybe<Scalars['String']>;
  championID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  channelGeneralDiscordID?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  memberID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name?: InputMaybe<Scalars['String']>;
  projectID?: InputMaybe<Scalars['String']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_CreateProjectUpdateInput = {
  _id?: InputMaybe<Scalars['ID']>;
  authorID?: InputMaybe<Scalars['String']>;
  championID?: InputMaybe<Scalars['String']>;
  content?: InputMaybe<Scalars['String']>;
  deWorkLink?: InputMaybe<Scalars['String']>;
  deadline?: InputMaybe<Scalars['String']>;
  epicID?: InputMaybe<Scalars['String']>;
  memberID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  notifyUserID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  phase?: InputMaybe<GraphQL_PhaseEpicType>;
  priority?: InputMaybe<Scalars['Int']>;
  projectID?: InputMaybe<Scalars['String']>;
  roleID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  taskID?: InputMaybe<Scalars['String']>;
  teamID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  threadDiscordID?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  token?: InputMaybe<Scalars['String']>;
};

export type GraphQL_CreateRoleInput = {
  _id?: InputMaybe<Scalars['ID']>;
  description?: InputMaybe<Scalars['String']>;
  skills?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title?: InputMaybe<Scalars['String']>;
};

export type GraphQL_CreateRoomInput = {
  _id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type GraphQL_CreateSkillInput = {
  categorySkills?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  id_lightcast?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<GraphQL_ApprovedSkillEnum>;
  subCategorySkill?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_CreateSkillsInput = {
  names?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  state?: InputMaybe<GraphQL_ApprovedSkillEnum>;
};

export type GraphQL_DatesInput = {
  complition?: InputMaybe<Scalars['String']>;
  kickOff?: InputMaybe<Scalars['String']>;
};

export type GraphQL_DatesType = {
  __typename?: 'datesType';
  complition?: Maybe<Scalars['String']>;
  kickOff?: Maybe<Scalars['String']>;
};

export type GraphQL_EndorcmentInput = {
  registeredAt?: InputMaybe<Scalars['String']>;
  skillID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_EndorseAttributeInput = {
  _id?: InputMaybe<Scalars['ID']>;
  attribute?: InputMaybe<GraphQL_AttributesEnum>;
};

export type GraphQL_EnterRoomInput = {
  memberID?: InputMaybe<Scalars['ID']>;
  roomID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_FindAllProjectsTeamsAnouncmentsInput = {
  _id?: InputMaybe<Scalars['ID']>;
  dateEnd?: InputMaybe<Scalars['String']>;
  dateStart?: InputMaybe<Scalars['String']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindAllProjectsTeamsAnouncmentsOutput = {
  __typename?: 'findAllProjectsTeamsAnouncmentsOutput';
  _id?: Maybe<Scalars['ID']>;
  project?: Maybe<GraphQL_Project>;
  team?: Maybe<Array<Maybe<GraphQL_TeamsType>>>;
};

export type GraphQL_FindEpicInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  projectID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  teamID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_FindGardenInput = {
  _id?: InputMaybe<Scalars['ID']>;
  dateEnd?: InputMaybe<Scalars['String']>;
  dateStart?: InputMaybe<Scalars['String']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindGardenOutput = {
  __typename?: 'findGardenOutput';
  _id?: Maybe<Scalars['ID']>;
  project?: Maybe<GraphQL_Project>;
  team?: Maybe<Array<Maybe<GraphQL_TeamsType_Garden>>>;
};

export type GraphQL_FindMemberInput = {
  _id?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindMembersInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindProjectInput = {
  _id?: InputMaybe<Scalars['ID']>;
  gardenServerID?: InputMaybe<Scalars['String']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindProjectUpdatesInput = {
  _id?: InputMaybe<Scalars['ID']>;
  dateEnd?: InputMaybe<Scalars['String']>;
  dateStart?: InputMaybe<Scalars['String']>;
  memberID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  projectID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  roleID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  teamID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindProjectsInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  gardenServerID?: InputMaybe<Scalars['String']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindProjects_RecommendedToUserInput = {
  memberID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_FindProjects_RequireSkillInput = {
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  skillID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_FindRoleTemplateInput = {
  _id?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_FindRoleTemplatesInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_FindRolesInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  projectID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  teamID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_FindRoomsInput = {
  _id?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_FindServersInput = {
  _id?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_FindSkillCategoriesInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  id_lightcast?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_FindSkillCategoryInput = {
  _id?: InputMaybe<Scalars['ID']>;
  id_lightcast?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_FindSkillInput = {
  _id?: InputMaybe<Scalars['ID']>;
  id_lightcast?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_FindSkillSubCategoriesInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_FindSkillSubCategoryInput = {
  _id?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_FindSkillsInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  recalculateMembers?: InputMaybe<Scalars['Boolean']>;
  recalculateProjectRoles?: InputMaybe<Scalars['Boolean']>;
};

export type GraphQL_FindSkillsInputPaginated = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  request?: InputMaybe<GraphQL_FindSkillsInput>;
  sortBy?: InputMaybe<GraphQL_SortBySkill>;
};

export type GraphQL_FindTeamsInput = {
  _id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  projectID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_GardenUpdateType = {
  __typename?: 'gardenUpdateType';
  epic?: Maybe<Array<Maybe<GraphQL_Epic>>>;
  task?: Maybe<Array<Maybe<GraphQL_ProjectUpdate>>>;
};

export enum GraphQL_LevelEnum {
  Junior = 'junior',
  Learning = 'learning',
  Mid = 'mid',
  Senior = 'senior'
}

export type GraphQL_LinkInput = {
  name?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type GraphQL_LinkType = {
  __typename?: 'linkType';
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type GraphQL_LoginInput = {
  email?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
};

export type GraphQL_MatchMembersToProjectInput = {
  projectID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_MatchMembersToProjectOutput = {
  __typename?: 'matchMembersToProjectOutput';
  commonSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  matchPercentage?: Maybe<Scalars['Float']>;
  member?: Maybe<GraphQL_Members>;
};

export type GraphQL_MatchMembersToProjectRoleInput = {
  projectRoleID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_MatchMembersToProjectRoleOutput = {
  __typename?: 'matchMembersToProjectRoleOutput';
  commonSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  matchPercentage?: Maybe<Scalars['Float']>;
  member?: Maybe<GraphQL_Members>;
};

export type GraphQL_MatchMembersToSkillInput = {
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  skillsID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_MatchMembersToSkillOutput = {
  __typename?: 'matchMembersToSkillOutput';
  commonSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  matchPercentage?: Maybe<Scalars['Float']>;
  member?: Maybe<GraphQL_Members>;
};

export type GraphQL_MatchMembersToUserInput = {
  memberID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_MatchMembersToUserOutput = {
  __typename?: 'matchMembersToUserOutput';
  commonSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  matchPercentage?: Maybe<Scalars['Float']>;
  member?: Maybe<GraphQL_Members>;
};

export type GraphQL_MatchPrepareSkillToMembersInput = {
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  skillID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_MatchPrepareSkillToMembersOutput = {
  __typename?: 'matchPrepareSkillToMembersOutput';
  commonSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  matchPercentage?: Maybe<Scalars['Float']>;
  member?: Maybe<GraphQL_Members>;
};

export type GraphQL_MatchPrepareSkillToProjectRolesInput = {
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  skillID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_MatchProjectRoles = {
  __typename?: 'matchProjectRoles';
  commonSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  matchPercentage?: Maybe<Scalars['Float']>;
  projectRole?: Maybe<GraphQL_RoleType>;
};

export type GraphQL_MatchProjectsToMemberInput = {
  memberID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_MatchSkillsToMembersInput = {
  limit?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  skillsID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_MatchSkillsToProjectsInput = {
  limit?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  skillsID?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_MatchSkillsToProjectsOutput = {
  __typename?: 'matchSkillsToProjectsOutput';
  commonSkills?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  matchPercentage?: Maybe<Scalars['Float']>;
  project?: Maybe<GraphQL_Project>;
  projectRoles?: Maybe<Array<Maybe<GraphQL_MatchProjectRoles>>>;
};

export type GraphQL_Match_ProjectToUserInput = {
  memberID?: InputMaybe<Scalars['ID']>;
  projectID?: InputMaybe<Scalars['ID']>;
  roleID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_Members_AutocompleteInput = {
  search?: InputMaybe<Scalars['String']>;
};

export type GraphQL_NetworkInput = {
  endorcment?: InputMaybe<Array<InputMaybe<GraphQL_EndorcmentInput>>>;
  memberID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_NewTweetProjectInput = {
  approved?: InputMaybe<Scalars['Boolean']>;
  author?: InputMaybe<Scalars['String']>;
  content?: InputMaybe<Scalars['String']>;
  projectID?: InputMaybe<Scalars['ID']>;
  title?: InputMaybe<Scalars['String']>;
};

export type GraphQL_OnboardingInput = {
  percentage?: InputMaybe<Scalars['Int']>;
  signup?: InputMaybe<Scalars['Boolean']>;
};

export type GraphQL_OnboardingType = {
  __typename?: 'onboardingType';
  percentage?: Maybe<Scalars['Int']>;
  signup?: Maybe<Scalars['Boolean']>;
};

export enum GraphQL_PhaseEpicType {
  Archive = 'archive',
  Open = 'open'
}

export enum GraphQL_PhaseType {
  Committed = 'committed',
  Engaged = 'engaged',
  Invited = 'invited',
  Rejected = 'rejected',
  Shortlisted = 'shortlisted'
}

export type GraphQL_PreviusProjectsInput = {
  description?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['String']>;
  link?: InputMaybe<Scalars['String']>;
  picture?: InputMaybe<Scalars['String']>;
  positionName?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type GraphQL_PreviusProjectsType = {
  __typename?: 'previusProjectsType';
  description?: Maybe<Scalars['String']>;
  endDate?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  picture?: Maybe<Scalars['String']>;
  positionName?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type GraphQL_ProjectMatchType = {
  __typename?: 'projectMatchType';
  matchPercentage?: Maybe<Scalars['Float']>;
  projectData?: Maybe<GraphQL_Project>;
  role?: Maybe<GraphQL_RoleType>;
};

export type GraphQL_ProjectMemberType = {
  __typename?: 'projectMemberType';
  champion?: Maybe<Scalars['Boolean']>;
  favorite?: Maybe<Scalars['Boolean']>;
  info?: Maybe<GraphQL_Project>;
  phase?: Maybe<GraphQL_PhaseType>;
  role?: Maybe<GraphQL_RoleType>;
};

export type GraphQL_ProjectUserMatchType = {
  __typename?: 'projectUserMatchType';
  matchPercentage?: Maybe<Scalars['Float']>;
  projectData?: Maybe<GraphQL_Project>;
  skillsDontMatch?: Maybe<Array<Maybe<GraphQL_Skills>>>;
  skillsMatch?: Maybe<Array<Maybe<GraphQL_Skills>>>;
};

export type GraphQL_RelatedSkillsInput = {
  _id?: InputMaybe<Scalars['ID']>;
  relatedSkills_id?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_RoleInput = {
  _id?: InputMaybe<Scalars['ID']>;
  archive?: InputMaybe<Scalars['Boolean']>;
  budget?: InputMaybe<GraphQL_BudgetInput>;
  dateRangeEnd?: InputMaybe<Scalars['String']>;
  dateRangeStart?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  hoursPerWeek?: InputMaybe<Scalars['Int']>;
  skills?: InputMaybe<Array<InputMaybe<GraphQL_SkillRoleInput>>>;
  title?: InputMaybe<Scalars['String']>;
};

export type GraphQL_RoleType = {
  __typename?: 'roleType';
  _id?: Maybe<Scalars['ID']>;
  archive?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  skills?: Maybe<Array<Maybe<GraphQL_SkillRoleType>>>;
  title?: Maybe<Scalars['String']>;
};

export type GraphQL_SkillInput_Member = {
  id?: InputMaybe<Scalars['ID']>;
  level?: InputMaybe<GraphQL_LevelEnum>;
};

export type GraphQL_SkillRoleInput = {
  _id?: InputMaybe<Scalars['String']>;
  comment?: InputMaybe<Scalars['String']>;
  level?: InputMaybe<Scalars['String']>;
  numEndorsement?: InputMaybe<Scalars['String']>;
};

export type GraphQL_SkillRoleType = {
  __typename?: 'skillRoleType';
  comment?: Maybe<Scalars['String']>;
  level?: Maybe<Scalars['String']>;
  numEndorsement?: Maybe<Scalars['String']>;
  skillData?: Maybe<GraphQL_Skills>;
};

export type GraphQL_SkillType_Member = {
  __typename?: 'skillType_member';
  author?: Maybe<GraphQL_Members>;
  level?: Maybe<GraphQL_LevelEnum>;
  skillInfo?: Maybe<GraphQL_Skills>;
};

export type GraphQL_SkillsType = {
  __typename?: 'skillsType';
  authors?: Maybe<Array<Maybe<GraphQL_Members>>>;
  id?: Maybe<Scalars['String']>;
  points?: Maybe<Scalars['Float']>;
};

export type GraphQL_SkillsTypeRole = {
  __typename?: 'skillsTypeRole';
  skill?: Maybe<Scalars['String']>;
};

export type GraphQL_SkillsUpdateMemberInput = {
  authors?: InputMaybe<Scalars['String']>;
  communityLevel?: InputMaybe<Scalars['Float']>;
  selfEndorsedLevel?: InputMaybe<Scalars['Float']>;
  skillID?: InputMaybe<Scalars['ID']>;
};

export type GraphQL_Skills_AutocompleteInput = {
  search?: InputMaybe<Scalars['String']>;
};

export type GraphQL_TeamInput = {
  memberID?: InputMaybe<Scalars['String']>;
  phase?: InputMaybe<GraphQL_PhaseType>;
  roleID?: InputMaybe<Scalars['String']>;
};

export type GraphQL_TeamType = {
  __typename?: 'teamType';
  memberInfo?: Maybe<GraphQL_Members>;
  phase?: Maybe<GraphQL_PhaseType>;
  roleID?: Maybe<Scalars['String']>;
};

export type GraphQL_TeamsType = {
  __typename?: 'teamsType';
  announcement?: Maybe<Array<Maybe<GraphQL_ProjectUpdate>>>;
  teamData?: Maybe<GraphQL_Team>;
};

export type GraphQL_TeamsType_Garden = {
  __typename?: 'teamsType_garden';
  role?: Maybe<Array<Maybe<GraphQL_RoleType_Garden>>>;
  teamData?: Maybe<GraphQL_Team>;
};

export type GraphQL_TweetsInput = {
  author?: InputMaybe<Scalars['String']>;
  content?: InputMaybe<Scalars['String']>;
};

export type GraphQL_TweetsProject = {
  __typename?: 'tweetsProject';
  newTweetID?: Maybe<Scalars['ID']>;
  numTweets?: Maybe<Scalars['Int']>;
  tweets?: Maybe<Array<Maybe<GraphQL_TweetsType>>>;
};

export type GraphQL_TweetsType = {
  __typename?: 'tweetsType';
  _id?: Maybe<Scalars['ID']>;
  approved?: Maybe<Scalars['Boolean']>;
  author?: Maybe<GraphQL_Members>;
  content?: Maybe<Scalars['String']>;
  registeredAt?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type GraphQL_UpdateMemberInRoomInput = {
  bio?: InputMaybe<Scalars['String']>;
  content?: InputMaybe<GraphQL_ContentInput>;
  discordAvatar?: InputMaybe<Scalars['String']>;
  discordName?: InputMaybe<Scalars['String']>;
  discriminator?: InputMaybe<Scalars['String']>;
  hoursPerWeek?: InputMaybe<Scalars['Float']>;
  interest?: InputMaybe<Scalars['String']>;
  links?: InputMaybe<Array<InputMaybe<GraphQL_LinkInput>>>;
  memberID?: InputMaybe<Scalars['ID']>;
  memberRole?: InputMaybe<GraphQL_FindRoleTemplateInput>;
  onbording?: InputMaybe<GraphQL_OnboardingInput>;
  previusProjects?: InputMaybe<Array<InputMaybe<GraphQL_PreviusProjectsInput>>>;
  roomID?: InputMaybe<Scalars['ID']>;
  serverID?: InputMaybe<Scalars['String']>;
  skills?: InputMaybe<Array<InputMaybe<GraphQL_SkillInput_Member>>>;
  timeZone?: InputMaybe<Scalars['String']>;
};

export type GraphQL_UpdateMemberInput = {
  _id?: InputMaybe<Scalars['ID']>;
  bio?: InputMaybe<Scalars['String']>;
  content?: InputMaybe<GraphQL_ContentInput>;
  discordAvatar?: InputMaybe<Scalars['String']>;
  discordName?: InputMaybe<Scalars['String']>;
  discriminator?: InputMaybe<Scalars['String']>;
  hoursPerWeek?: InputMaybe<Scalars['Float']>;
  interest?: InputMaybe<Scalars['String']>;
  links?: InputMaybe<Array<InputMaybe<GraphQL_LinkInput>>>;
  memberRole?: InputMaybe<Scalars['ID']>;
  onbording?: InputMaybe<GraphQL_OnboardingInput>;
  previusProjects?: InputMaybe<Array<InputMaybe<GraphQL_PreviusProjectsInput>>>;
  serverID?: InputMaybe<Scalars['String']>;
  skills?: InputMaybe<Array<InputMaybe<GraphQL_SkillInput_Member>>>;
  timeZone?: InputMaybe<Scalars['String']>;
};

export type GraphQL_UpdateProjectInput = {
  _id?: InputMaybe<Scalars['ID']>;
  budget?: InputMaybe<GraphQL_BudgetInput>;
  champion?: InputMaybe<Scalars['String']>;
  collaborationLinks?: InputMaybe<Array<InputMaybe<GraphQL_CollaborationLinksInput>>>;
  dates?: InputMaybe<GraphQL_DatesInput>;
  description?: InputMaybe<Scalars['String']>;
  gardenServerID?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<Array<InputMaybe<GraphQL_RoleInput>>>;
  serverID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  stepsJoinProject?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  team?: InputMaybe<Array<InputMaybe<GraphQL_TeamInput>>>;
  title?: InputMaybe<Scalars['String']>;
};

export type GraphQL_UpdateServerInput = {
  _id?: InputMaybe<Scalars['ID']>;
  adminCommands?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  adminID?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  adminRoles?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name?: InputMaybe<Scalars['String']>;
};

export type GraphQL_UpdateSkillCategoryInput = {
  _id?: InputMaybe<Scalars['ID']>;
  description?: InputMaybe<Scalars['String']>;
  emoji?: InputMaybe<Scalars['String']>;
  id_lightcast?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  skills?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  subCategorySkill?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type GraphQL_UpdateSkillSubCategoryInput = {
  _id?: InputMaybe<Scalars['ID']>;
  categorySkills?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  description?: InputMaybe<Scalars['String']>;
  emoji?: InputMaybe<Scalars['String']>;
  id_lightcast?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  skills?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type GraphQL_AddNewMemberMutationVariables = Exact<{
  fields: GraphQL_AddNewMemberInput;
}>;


export type GraphQL_AddNewMemberMutation = { __typename?: 'Mutation', addNewMember?: { __typename?: 'Members', _id?: string | null } | null };

export type GraphQL_CreateProjectUpdateMutationVariables = Exact<{
  fields: GraphQL_CreateProjectUpdateInput;
}>;


export type GraphQL_CreateProjectUpdateMutation = { __typename?: 'Mutation', createProjectUpdate?: { __typename?: 'ProjectUpdate', _id?: string | null } | null };

export type GraphQL_CreateRoomMutationVariables = Exact<{
  fields: GraphQL_CreateRoomInput;
}>;


export type GraphQL_CreateRoomMutation = { __typename?: 'Mutation', createRoom?: { __typename?: 'Rooms', _id?: string | null } | null };

export type GraphQL_UpdateMemberMutationVariables = Exact<{
  fields: GraphQL_UpdateMemberInput;
}>;


export type GraphQL_UpdateMemberMutation = { __typename?: 'Mutation', updateMember?: { __typename?: 'Members', _id?: string | null } | null };

export type GraphQL_UpdateServerMutationVariables = Exact<{
  fields?: InputMaybe<GraphQL_UpdateServerInput>;
}>;


export type GraphQL_UpdateServerMutation = { __typename?: 'Mutation', updateServer?: { __typename?: 'ServerTemplate', _id?: string | null } | null };

export type GraphQL_FindEpicQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindEpicInput>;
}>;


export type GraphQL_FindEpicQuery = { __typename?: 'Query', findEpic?: Array<{ __typename?: 'Epic', _id?: string | null, name?: string | null, phase?: GraphQL_PhaseEpicType | null, serverID?: Array<string | null> | null, channelDiscordlID?: string | null, task?: Array<{ __typename?: 'ProjectUpdate', _id?: string | null, title?: string | null, serverID?: Array<string | null> | null } | null> | null, author?: { __typename?: 'Members', discordName?: string | null, _id?: string | null } | null } | null> | null };

export type GraphQL_FindProjectUpdatesQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindProjectUpdatesInput>;
}>;


export type GraphQL_FindProjectUpdatesQuery = { __typename?: 'Query', findProjectUpdates?: Array<{ __typename?: 'ProjectUpdate', threadDiscordID?: string | null, serverID?: Array<string | null> | null, author?: { __typename?: 'Members', _id?: string | null } | null } | null> | null };

export type GraphQL_FindMemberQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindMemberInput>;
}>;


export type GraphQL_FindMemberQuery = { __typename?: 'Query', findMember?: { __typename?: 'Members', hoursPerWeek?: number | null, skills?: Array<{ __typename?: 'skillType_member', skillInfo?: { __typename?: 'Skills', name?: string | null, authors?: Array<{ __typename?: 'Members', discordName?: string | null } | null> | null } | null } | null> | null, projects?: Array<{ __typename?: 'projectMemberType', info?: { __typename?: 'Project', title?: string | null } | null } | null> | null } | null };

export type GraphQL_FindMembersQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindMembersInput>;
}>;


export type GraphQL_FindMembersQuery = { __typename?: 'Query', findMembers?: Array<{ __typename?: 'Members', discordName?: string | null, _id?: string | null, serverID?: Array<string | null> | null } | null> | null };

export type GraphQL_FindProjectQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindProjectInput>;
}>;


export type GraphQL_FindProjectQuery = { __typename?: 'Query', findProject?: { __typename?: 'Project', _id?: string | null, title?: string | null, role?: Array<{ __typename?: 'roleType', title?: string | null } | null> | null, champion?: { __typename?: 'Members', _id?: string | null, discordName?: string | null } | null } | null };

export type GraphQL_FindProjectsQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindProjectsInput>;
}>;


export type GraphQL_FindProjectsQuery = { __typename?: 'Query', findProjects?: Array<{ __typename?: 'Project', _id?: string | null, title?: string | null, serverID?: Array<string | null> | null, gardenServerID?: string | null, garden_teams?: Array<{ __typename?: 'Team', _id?: string | null, name?: string | null, categoryDiscordlD?: string | null, channelGeneralDiscordID?: string | null, roles?: Array<{ __typename?: 'Role', _id?: string | null, name?: string | null } | null> | null } | null> | null } | null> | null };

export type GraphQL_FindProjects_RecommendedToUserQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindProjects_RecommendedToUserInput>;
}>;


export type GraphQL_FindProjects_RecommendedToUserQuery = { __typename?: 'Query', findProjects_RecommendedToUser?: Array<{ __typename?: 'projectMatchType', matchPercentage?: number | null, projectData?: { __typename?: 'Project', _id?: string | null, title?: string | null } | null, role?: { __typename?: 'roleType', title?: string | null, skills?: Array<{ __typename?: 'skillRoleType', skillData?: { __typename?: 'Skills', name?: string | null } | null } | null> | null } | null } | null> | null };

export type GraphQL_FindRoomQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindRoomsInput>;
}>;


export type GraphQL_FindRoomQuery = { __typename?: 'Query', findRoom?: { __typename?: 'Rooms', members?: Array<{ __typename?: 'Members', _id?: string | null } | null> | null } | null };

export type GraphQL_FindServersQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindServersInput>;
}>;


export type GraphQL_FindServersQuery = { __typename?: 'Query', findServers?: Array<{ __typename?: 'ServerTemplate', _id?: string | null, adminID?: Array<string | null> | null, adminRoles?: Array<string | null> | null, adminCommands?: Array<string | null> | null } | null> | null };

export type GraphQL_FindSkillQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindSkillInput>;
}>;


export type GraphQL_FindSkillQuery = { __typename?: 'Query', findSkill?: { __typename?: 'Skills', name?: string | null, members?: Array<{ __typename?: 'Members', _id?: string | null } | null> | null } | null };

export type GraphQL_FindSkillsQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_FindSkillsInput>;
}>;


export type GraphQL_FindSkillsQuery = { __typename?: 'Query', findSkills?: Array<{ __typename?: 'Skills', _id?: string | null, name?: string | null, state?: GraphQL_ApprovedSkillEnum | null } | null> | null };

export type GraphQL_MatchMembersToSkillsQueryVariables = Exact<{
  fields?: InputMaybe<GraphQL_MatchMembersToSkillInput>;
}>;


export type GraphQL_MatchMembersToSkillsQuery = { __typename?: 'Query', matchMembersToSkills?: Array<{ __typename?: 'matchMembersToSkillOutput', matchPercentage?: number | null, member?: { __typename?: 'Members', _id?: string | null, discordName?: string | null } | null, commonSkills?: Array<{ __typename?: 'Skills', name?: string | null } | null> | null } | null> | null };
