## ADDED Requirements

### Requirement: One Lambda handler per domain

Each of the 9 domains SHALL have a single Lambda handler function that routes operations based on `event.info.fieldName`.

#### Scenario: Family handler routes all family operations

- **WHEN** AppSync invokes the family Lambda with fieldName "createFamily"
- **THEN** the handler calls CreateFamily use case with the event arguments
- **AND** returns the CreateFamilyResult

#### Scenario: Feed handler routes post operations

- **WHEN** AppSync invokes the feed Lambda with fieldName "createPost"
- **THEN** the handler calls CreatePost use case
- **AND** when fieldName is "familyFeed", it calls GetFamilyFeed use case

#### Scenario: Unknown fieldName throws error

- **WHEN** a handler receives an unrecognized fieldName
- **THEN** it throws an error with message indicating the unknown operation

### Requirement: Handlers extract caller identity from AppSync context

Every handler SHALL extract the authenticated user's Cognito sub from `event.identity` and use it to resolve the caller's identity for use case calls.

#### Scenario: Caller identity passed to use case

- **WHEN** a mutation requires the caller's userId
- **THEN** the handler extracts `event.identity.sub` as the cognitoSub
- **AND** resolves the userId via the user repository before calling the use case

### Requirement: Handler unit tests cover all operations

Every handler SHALL have unit tests covering all routed operations with mocked use cases. Coverage target: 95% minimum.

#### Scenario: All handler operations tested

- **WHEN** unit tests run on handler files
- **THEN** every switch case (every fieldName) has at least one test
- **AND** error handling paths are tested
- **AND** line coverage is at least 95%

### Requirement: CDK wiring connects AppSync to Lambda handlers

The API stack SHALL create Lambda functions for each domain handler, add them as AppSync data sources, and map every Query/Mutation field to the correct Lambda resolver.

#### Scenario: CDK synth produces correct resolver mappings

- **WHEN** `cdk synth` runs
- **THEN** the template includes Lambda functions for all 9 domains
- **AND** every Query and Mutation field has a resolver mapping to its domain Lambda
- **AND** Lambda functions have DynamoDB table access and appropriate environment variables
