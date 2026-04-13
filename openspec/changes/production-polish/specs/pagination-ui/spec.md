## ADDED Requirements

### Requirement: Feed and comments support load-more pagination

The FeedPage and PostDetailPage SHALL support paginated loading of posts and comments respectively, using the cursor returned by the GraphQL query.

#### Scenario: Load more posts on feed

- **WHEN** the feed has more posts than the initial page size
- **AND** user clicks "Load More"
- **THEN** the next page of posts is fetched using the previous cursor
- **AND** the new posts are appended to the existing list
- **AND** the Load More button is hidden when there are no more posts

#### Scenario: Load more comments on post detail

- **WHEN** a post has more comments than the initial page size
- **AND** user clicks "Load More" in the comments section
- **THEN** the next page of comments is appended

### Requirement: LoadMoreButton component

A reusable `LoadMoreButton` component SHALL be provided that handles loading states.

#### Scenario: Button shows loading during fetch

- **WHEN** user clicks Load More
- **THEN** the button is disabled and shows "Loading..."
- **AND** returns to "Load More" when fetch completes
