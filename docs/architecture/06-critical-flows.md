# Critical Flows

> Last reviewed: 2026-04-07

Sequence diagrams for the most important end-to-end flows in the system.

## 1. User Registration + First Family Creation

```
User                    Mobile App              AppSync/Lambda           Cognito             DynamoDB
 │                         │                         │                    │                    │
 │  Enter phone number     │                         │                    │                    │
 │────────────────────────▶│                         │                    │                    │
 │                         │  initiateAuth(phone)    │                    │                    │
 │                         │────────────────────────▶│  signUp(phone)     │                    │
 │                         │                         │───────────────────▶│                    │
 │                         │                         │                    │  Send OTP SMS      │
 │                         │                         │◀───────────────────│                    │
 │  Enter OTP              │                         │                    │                    │
 │────────────────────────▶│                         │                    │                    │
 │                         │  verifyOtp(code)        │                    │                    │
 │                         │────────────────────────▶│  confirmSignUp     │                    │
 │                         │                         │───────────────────▶│                    │
 │                         │                         │  Get tokens        │                    │
 │                         │                         │◀───────────────────│                    │
 │                         │                         │                    │                    │
 │                         │  register(phone, sub)   │                    │                    │
 │                         │────────────────────────▶│                    │                    │
 │                         │                         │  Check phone unique│                    │
 │                         │                         │───────────────────────────────────────▶│
 │                         │                         │  Create User item  │                    │
 │                         │                         │───────────────────────────────────────▶│
 │                         │                         │◀──────────────────────────────────────│
 │                         │◀────────────────────────│                    │                    │
 │                         │                         │                    │                    │
 │  Set profile + DOB      │                         │                    │                    │
 │────────────────────────▶│  updateProfile          │                    │                    │
 │                         │────────────────────────▶│  Update User item  │                    │
 │                         │                         │───────────────────────────────────────▶│
 │                         │                         │                    │                    │
 │  Create family          │                         │                    │                    │
 │  (name + theme)         │                         │                    │                    │
 │────────────────────────▶│  createFamily           │                    │                    │
 │                         │────────────────────────▶│  Create:           │                    │
 │                         │                         │  • Family item     │                    │
 │                         │                         │  • Person item     │                    │
 │                         │                         │  • Membership item │                    │
 │                         │                         │───────────────────────────────────────▶│
 │                         │◀────────────────────────│                    │                    │
 │  Family created!        │                         │                    │                    │
```

## 2. Invite → Accept → Activation Gate Unlock

```
Definer                 Lambda                  DynamoDB                Invitee
 │                        │                       │                       │
 │  inviteMember          │                       │                       │
 │  (phone, relationship) │                       │                       │
 │───────────────────────▶│  requireRole(admin+)  │                       │
 │                        │  Create Invitation    │                       │
 │                        │──────────────────────▶│                       │
 │                        │  Send SMS invite      │                       │
 │                        │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▶│
 │◀───────────────────────│                       │                       │
 │                        │                       │                       │
 │                        │                       │    Tap invite link    │
 │                        │                       │◀──────────────────────│
 │                        │  acceptInvitation     │                       │
 │                        │◀──────────────────────│───────────────────────│
 │                        │  Create:              │                       │
 │                        │  • Person item        │                       │
 │                        │  • Membership item    │                       │
 │                        │  • Update invitation  │                       │
 │                        │──────────────────────▶│                       │
 │                        │                       │                       │
 │                        │  countActiveMembers   │                       │
 │                        │──────────────────────▶│                       │
 │                        │  count = 2 ─────────▶│  ACTIVATION GATE      │
 │                        │                       │  UNLOCKED             │
 │                        │                       │                       │
 │                        │  Cancel re-engagement │                       │
 │                        │  EventBridge rules    │                       │
 │                        │                       │  Show mini-tour       │
 │                        │                       │──────────────────────▶│
 │                        │                       │  Feed unlocked!       │
```

## 3. Post Creation with Media Upload

```
User                    Mobile App              Lambda                  S3                  DynamoDB
 │                        │                       │                      │                    │
 │  Select photo          │                       │                      │                    │
 │────────────────────────▶│                       │                      │                    │
 │                        │  generateUploadUrl    │                      │                    │
 │                        │  (contentType, size)  │                      │                    │
 │                        │──────────────────────▶│  Validate type       │                    │
 │                        │                       │  Generate presigned  │                    │
 │                        │                       │─────────────────────▶│                    │
 │                        │                       │◀─────────────────────│                    │
 │                        │◀──────────────────────│  {uploadUrl, s3Key}  │                    │
 │                        │                       │                      │                    │
 │                        │  PUT to S3 directly   │                      │                    │
 │                        │──────────────────────────────────────────────▶│                    │
 │                        │◀──────────────────────────────────────────────│                    │
 │                        │                       │                      │                    │
 │                        │  confirmUpload(s3Key) │                      │                    │
 │                        │──────────────────────▶│  Store media metadata│                    │
 │                        │                       │───────────────────────────────────────────▶│
 │                        │                       │                      │                    │
 │  Write post text       │                       │                      │                    │
 │────────────────────────▶│                       │                      │                    │
 │                        │  createPost           │                      │                    │
 │                        │──────────────────────▶│  requireRole(editor) │                    │
 │                        │                       │  checkActivationGate │                    │
 │                        │                       │  Store Post item     │                    │
 │                        │                       │───────────────────────────────────────────▶│
 │                        │◀──────────────────────│                      │                    │
 │  Post published!       │                       │                      │                    │
```

## 4. Relationship Creation → Inference Engine

```
Admin                   Lambda                  DynamoDB
 │                        │                       │
 │  createRelationship    │                       │
 │  (A="Rajesh",          │                       │
 │   B="Priya",           │                       │
 │   type="spouse")       │                       │
 │───────────────────────▶│  requireRole(admin)   │
 │                        │  Store REL item       │
 │                        │──────────────────────▶│
 │                        │                       │
 │                        │  INFERENCE ENGINE:    │
 │                        │  Fetch ALL rels       │
 │                        │  for this family      │
 │                        │──────────────────────▶│
 │                        │◀──────────────────────│
 │                        │                       │
 │                        │  Build adjacency graph│
 │                        │  (in-memory)          │
 │                        │                       │
 │                        │  Apply rules:         │
 │                        │  • Rajesh's parent    │
 │                        │    Grandma → Priya    │
 │                        │    = parent-in-law    │
 │                        │  • Rajesh's sibling   │
 │                        │    Sunita → Priya     │
 │                        │    = sibling-in-law   │
 │                        │                       │
 │                        │  Deduplicate against  │
 │                        │  existing rels        │
 │                        │                       │
 │                        │  Store as PENDING:    │
 │                        │  • Grandma→Priya      │
 │                        │  • Sunita→Priya       │
 │                        │──────────────────────▶│
 │                        │                       │
 │                        │  Invalidate tree cache│
 │                        │──────────────────────▶│
 │                        │                       │
 │◀───────────────────────│  {suggestions: 2}     │
 │                        │                       │
 │  confirmInference      │                       │
 │  (Grandma→Priya)       │                       │
 │───────────────────────▶│  Update status:       │
 │                        │  pending → confirmed  │
 │                        │──────────────────────▶│
```

## 5. Family Tree Build + Cache

```
User                    Lambda                  DynamoDB
 │                        │                       │
 │  View tree tab         │                       │
 │───────────────────────▶│                       │
 │                        │  Check TREE_CACHE     │
 │                        │──────────────────────▶│
 │                        │  Cache HIT?           │
 │                        │◀──────────────────────│
 │                        │                       │
 │            ┌───────────┤  If HIT:              │
 │            │           │  Return cached tree   │
 │◀───────────┘           │                       │
 │                        │                       │
 │            ┌───────────┤  If MISS:             │
 │            │           │                       │
 │            │           │  Fetch ALL persons    │
 │            │           │──────────────────────▶│
 │            │           │  Fetch ALL rels       │
 │            │           │──────────────────────▶│
 │            │           │◀──────────────────────│
 │            │           │                       │
 │            │           │  BUILD TREE:          │
 │            │           │  1. Init nodes        │
 │            │           │  2. Connect parent/   │
 │            │           │     child/spouse      │
 │            │           │  3. Find true roots   │
 │            │           │     (no parents, not  │
 │            │           │      spouse-of-child) │
 │            │           │  4. BFS from roots    │
 │            │           │     assign generations│
 │            │           │  5. Normalize gen 0   │
 │            │           │  6. Serialize         │
 │            │           │                       │
 │            │           │  Store in TREE_CACHE  │
 │            │           │──────────────────────▶│
 │◀───────────┘           │                       │
 │  Render tree           │                       │
 │                        │                       │
 │  ─ ─ ─ INVALIDATION ─ ─ ─                     │
 │  Any relationship change                       │
 │  deletes TREE_CACHE    │──────────────────────▶│
 │  Next view triggers    │                       │
 │  full rebuild          │                       │
```

## 6. Event → Reminder → Push Notification

```
Editor                  Lambda                  DynamoDB            EventBridge          Lambda(reminder)     SNS
 │                        │                       │                    │                       │              │
 │  createEvent           │                       │                    │                       │              │
 │  ("Grandma's Bday",   │                       │                    │                       │              │
 │   2026-04-12)          │                       │                    │                       │              │
 │───────────────────────▶│  Store Event item     │                    │                       │              │
 │                        │──────────────────────▶│                    │                       │              │
 │                        │                       │                    │                       │              │
 │                        │  Schedule reminders:  │                    │                       │              │
 │                        │  • 2026-04-05 (7d)    │                    │                       │              │
 │                        │  • 2026-04-11 (1d)    │                    │                       │              │
 │                        │  • 2026-04-12 (day-of)│                    │                       │              │
 │                        │──────────────────────────────────────────▶│                       │              │
 │◀───────────────────────│                       │                    │                       │              │
 │                        │                       │                    │                       │              │
 │  ═══════ April 5 ═══════════════════════════════════════════════════                       │              │
 │                        │                       │                    │                       │              │
 │                        │                       │                    │  Trigger 7-day rule   │              │
 │                        │                       │                    │──────────────────────▶│              │
 │                        │                       │                    │                       │              │
 │                        │                       │                    │  Fetch family members │              │
 │                        │                       │◀─────────────────────────────────────────│              │
 │                        │                       │                    │                       │              │
 │                        │                       │  For each member:  │                       │              │
 │                        │                       │  Check prefs       │                       │              │
 │                        │                       │  (events ON?)      │                       │              │
 │                        │                       │──────────────────────────────────────────▶│              │
 │                        │                       │                    │                       │              │
 │                        │                       │                    │  Get device tokens    │              │
 │                        │                       │◀─────────────────────────────────────────│              │
 │                        │                       │                    │                       │  Send push   │
 │                        │                       │                    │                       │─────────────▶│
 │                        │                       │                    │                       │  "Grandma's  │
 │                        │                       │                    │                       │  birthday in │
 │  📱 Push notification  │                       │                    │                       │  1 week!"    │
 │◀────────────────────────────────────────────────────────────────────────────────────────────────────────│
```

## 7. Re-engagement Notification Cadence

```
Definer creates family
 │
 ▼
EventBridge schedules 3 rules:
 │
 ├── +24 hours ─────────────────────────────────────┐
 │                                                   ▼
 │                                        Check: any member joined?
 │                                          │            │
 │                                         NO           YES
 │                                          │            │
 │                                    Send push:     Cancel all
 │                                    "Family is     remaining
 │                                     waiting!"     rules. STOP.
 │
 ├── +1 week ───────────────────────────────────────┐
 │                                                   ▼
 │                                        Check: any member joined?
 │                                          │            │
 │                                         NO           YES → STOP
 │                                          │
 │                                    Send push:
 │                                    "Family misses
 │                                     you!"
 │
 └── +1 month ──────────────────────────────────────┐
                                                     ▼
                                           Check: any member joined?
                                             │            │
                                            NO           YES → STOP
                                             │
                                       Send push:
                                       "Still want to
                                        connect?"

                                       STOP. No more
                                       notifications
                                       after 1 month.
```
