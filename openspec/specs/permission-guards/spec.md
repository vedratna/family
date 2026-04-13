## ADDED Requirements

### Requirement: Edit and Delete buttons hidden by role

The web app SHALL hide Edit and Delete actions from users who don't have permission to perform them, instead of showing them and letting the server reject the action.

#### Scenario: Non-author cannot delete post

- **WHEN** a user views a post they did not author
- **AND** they are not an admin or owner
- **THEN** the Delete button is not rendered

#### Scenario: Author can delete own post

- **WHEN** a user views their own post
- **THEN** the Delete button is rendered

#### Scenario: Admin can delete any post

- **WHEN** an admin or owner views any post
- **THEN** the Delete button is rendered

#### Scenario: Non-admin cannot remove member

- **WHEN** a user with role "editor" or "viewer" views the members page
- **THEN** Remove buttons are not rendered

#### Scenario: Owner can remove members

- **WHEN** an owner or admin views the members page
- **THEN** Remove buttons are rendered (except for self)

### Requirement: Permission helpers exported from lib/permissions.ts

A pure-function module `lib/permissions.ts` SHALL export role-based predicates used across pages.

#### Scenario: Helpers can be unit tested

- **WHEN** unit tests import `canDeletePost`, `canEditEvent`, `canManageMembers`, etc.
- **THEN** the predicates return the correct boolean for each role + ownership combination
