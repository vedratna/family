# DynamoDB Single-Table Access Patterns

## Key Schema

| Entity              | PK                    | SK                                  | GSI1PK                | GSI1SK                        | GSI2PK              | GSI2SK                  |
|---------------------|-----------------------|-------------------------------------|-----------------------|-------------------------------|----------------------|-------------------------|
| User                | `USER#<userId>`       | `PROFILE`                           | `PHONE#<phone>`       | `USER#<userId>`               | —                    | —                       |
| Family              | `FAMILY#<familyId>`   | `METADATA`                          | —                     | —                             | —                    | —                       |
| FamilyMembership    | `FAMILY#<familyId>`   | `MEMBER#<personId>`                 | `USER#<userId>`       | `FAMILY#<familyId>`           | —                    | —                       |
| Person              | `FAMILY#<familyId>`   | `PERSON#<personId>`                 | —                     | —                             | —                    | —                       |
| Relationship        | `FAMILY#<familyId>`   | `REL#<personAId>#<personBId>`       | `FAMILY#<familyId>`   | `RELP#<personBId>#<personAId>`| —                    | —                       |
| Post                | `FAMILY#<familyId>`   | `POST#<timestamp>#<postId>`         | `PERSON#<personId>`   | `POST#<timestamp>#<postId>`   | —                    | —                       |
| Comment             | `POST#<postId>`       | `COMMENT#<timestamp>#<commentId>`   | —                     | —                             | —                    | —                       |
| Reaction            | `POST#<postId>`       | `REACTION#<personId>`               | —                     | —                             | —                    | —                       |
| Event               | `FAMILY#<familyId>`   | `EVENT#<date>#<eventId>`            | —                     | —                             | `EVTYPE#<familyId>#<type>` | `EVENT#<date>#<eventId>` |
| EventRSVP           | `EVENT#<eventId>`     | `RSVP#<personId>`                   | —                     | —                             | —                    | —                       |
| Chore               | `FAMILY#<familyId>`   | `CHORE#<choreId>`                   | `PERSON#<personId>`   | `CHORE#<dueDate>#<choreId>`   | —                    | —                       |
| NotifPref           | `USER#<userId>`       | `NOTIFPREF#<familyId>#<category>`   | —                     | —                             | —                    | —                       |
| DeviceToken         | `USER#<userId>`       | `DEVICE#<deviceToken>`              | —                     | —                             | —                    | —                       |
| TreeCache           | `FAMILY#<familyId>`   | `TREE_CACHE`                        | —                     | —                             | —                    | —                       |
| Invitation          | `FAMILY#<familyId>`   | `INVITE#<phone>`                    | `PHONE#<phone>`       | `INVITE#<familyId>`           | —                    | —                       |
| PostMedia           | `POST#<postId>`       | `MEDIA#<orderIndex>#<mediaId>`      | —                     | —                             | —                    | —                       |

## Access Patterns

| # | Pattern                                      | Key Condition                                          | Index    |
|---|----------------------------------------------|--------------------------------------------------------|----------|
| 1 | Get user profile by userId                   | PK=`USER#id`, SK=`PROFILE`                             | Table    |
| 2 | Get user by phone number                     | GSI1PK=`PHONE#phone`                                   | GSI1     |
| 3 | Get family metadata                          | PK=`FAMILY#id`, SK=`METADATA`                          | Table    |
| 4 | Get all members of a family                  | PK=`FAMILY#id`, SK begins_with `MEMBER#`               | Table    |
| 5 | Get all families for a user                  | GSI1PK=`USER#userId`, GSI1SK begins_with `FAMILY#`     | GSI1     |
| 6 | Get all persons in a family                  | PK=`FAMILY#id`, SK begins_with `PERSON#`               | Table    |
| 7 | Get all relationships in a family            | PK=`FAMILY#id`, SK begins_with `REL#`                  | Table    |
| 8 | Get relationships for a person (reverse)     | GSI1PK=`FAMILY#id`, GSI1SK begins_with `RELP#personId` | GSI1     |
| 9 | Get feed posts (newest first)                | PK=`FAMILY#id`, SK begins_with `POST#`, ScanIndexForward=false | Table |
| 10| Get posts by a specific person               | GSI1PK=`PERSON#id`, GSI1SK begins_with `POST#`         | GSI1     |
| 11| Get comments for a post                      | PK=`POST#id`, SK begins_with `COMMENT#`                | Table    |
| 12| Get reactions for a post                     | PK=`POST#id`, SK begins_with `REACTION#`               | Table    |
| 13| Get events for family in date range          | PK=`FAMILY#id`, SK between `EVENT#startDate` and `EVENT#endDate` | Table |
| 14| Get events by type for family                | GSI2PK=`EVTYPE#familyId#type`, GSI2SK begins_with `EVENT#` | GSI2 |
| 15| Get RSVPs for an event                       | PK=`EVENT#id`, SK begins_with `RSVP#`                  | Table    |
| 16| Get chores for a family                      | PK=`FAMILY#id`, SK begins_with `CHORE#`                | Table    |
| 17| Get chores assigned to a person              | GSI1PK=`PERSON#id`, GSI1SK begins_with `CHORE#`        | GSI1     |
| 18| Get notification prefs for a user            | PK=`USER#id`, SK begins_with `NOTIFPREF#`              | Table    |
| 19| Get device tokens for a user                 | PK=`USER#id`, SK begins_with `DEVICE#`                 | Table    |
| 20| Get cached family tree                       | PK=`FAMILY#id`, SK=`TREE_CACHE`                        | Table    |
| 21| Get pending invitations for a phone          | GSI1PK=`PHONE#phone`, GSI1SK begins_with `INVITE#`     | GSI1     |
| 22| Get media for a post                         | PK=`POST#id`, SK begins_with `MEDIA#`                  | Table    |
