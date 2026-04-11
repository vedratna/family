# Quick Start Guide

Welcome to FamilyApp — your family's private space to share moments, plan events, and stay connected.

## Getting Started (3 Steps)

```
  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │  Sign Up  │────▶│  Create   │────▶│  Invite   │
  │           │     │  Family   │     │  Members  │
  └───────────┘     └───────────┘     └───────────┘
```

### Step 1: Create Your Account

Open FamilyApp and choose how to sign up:
- **Phone number** (recommended) — Enter your phone, receive a 6-digit code, done
- **Google** — Tap "Continue with Google"
- **Apple** — Tap "Continue with Apple"

Then set your profile:
- Your **display name** (what family members will see)
- **Profile photo** (optional — we'll use a friendly avatar until you add one)
- **Date of birth** (optional — helps us remind your family about your birthday!)

### Step 2: Create Your Family

- Give your family a name (e.g., "The Sharma Family")
- **Pick a theme color** — choose from 8 colors. This sets the accent color for your family's space. You can change it anytime.

```
  Theme Colors:
  ● Teal (default)  ○ Indigo  ○ Coral  ○ Sage
  ○ Amber  ○ Ocean  ○ Plum  ○ Slate
```

### Step 3: Invite Your Family

Add family members by entering:
- Their **name**
- Their **phone number**
- Their **relationship to you** (e.g., Husband, Mother, Son)

They'll receive an SMS with a link to join. You can start with just one person and invite more later.

**That's it!** Your family space is ready.

---

## What Happens Next?

Once your first family member joins, the app unlocks and you can:
- **Share moments** — Post photos, videos, and updates to your family feed
- **Plan events** — Add birthdays, anniversaries, and gatherings to the shared calendar
- **See your tree** — Your family tree builds itself from the relationships you define
- **Coordinate chores** — Assign and track household tasks

### While You Wait for Members to Join

You can still:
- Add **events** to the calendar (e.g., upcoming birthdays)
- Add **family members to the tree** (even those without the app)
- Explore the app

> **Note:** Posting is unlocked once at least one family member joins. This keeps the feed from feeling empty!

---

## Detailed Onboarding: Definer Flow

Screen-by-screen walkthrough for the person creating the family:

```
Screen 1: Welcome
┌────────────────────┐
│  [Family           │
│   illustration]    │
│                    │
│  Your family's     │
│  private space.    │
│                    │
│  [Continue Phone]  │
│  [Continue Google] │
│  [Continue Apple]  │
└────────────────────┘
        │
        ▼
Screen 2: Phone Verification
┌────────────────────┐
│  What's your phone │
│  number?           │
│  [+91 98765 43210] │
│  [Send Code]       │
└────────────────────┘
        │
        ▼
Screen 3: OTP Entry
┌────────────────────┐
│  Enter the code    │
│  [4][8][2][ ][ ][ ]│
│  Auto-advances     │
│  when complete     │
└────────────────────┘
        │
        ▼
Screen 4: Profile Setup
┌────────────────────┐
│  [Avatar]          │
│  Name: [Priya]     │
│  DOB:  [optional]  │
│  [Continue]        │
└────────────────────┘
        │
        ▼
Screen 5: Create Family
┌────────────────────┐
│  Family name:      │
│  [The Sharma       │
│   Family]          │
│  Pick a color:     │
│  ● ○ ○ ○ ○ ○ ○ ○  │
│  [Live preview]    │
│  [Create Family]   │
└────────────────────┘
        │
        ▼
Screen 6: Invite Members
┌────────────────────┐
│  Family is ready!  │
│  [Name] [Phone]    │
│  [Relationship]    │
│  + Add another     │
│  [Send Invites]    │
│  skip for later    │
└────────────────────┘
        │
        ▼
Screen 7: Feed (locked)
┌────────────────────┐
│  Welcome post      │
│  "Waiting for      │
│   family to join"  │
│  [Invite More]     │
│  While you wait:   │
│  • Add an event    │
│  • Build the tree  │
└────────────────────┘
```

## Detailed Onboarding: Invitee Flow

Screen-by-screen walkthrough for someone accepting an invite:

```
SMS: "Priya invited you to Sharma Family!"
     [Tap to join]
        │
        ▼
Screen 1: Invitation Landing
┌────────────────────┐
│  [Wave illustration│
│  Priya invited you │
│  to Sharma Family! │
│  You're joining as:│
│  Priya's Husband   │
│  Name: [Rajesh]    │
│  [Join Family]     │
└────────────────────┘
        │
        ▼
Screen 2: Phone Verification
┌────────────────────┐
│  (Same OTP flow)   │
└────────────────────┘
        │
        ▼
Screen 3: Mini Tour (3 steps)
┌────────────────────┐
│  Step 1/3: Feed    │
│  "Posts and photos │
│  from your family" │
│  [Next →]          │
│  Skip tour         │
├────────────────────┤
│  Step 2/3:         │
│  Calendar & Tree   │
│  [Next →]          │
├────────────────────┤
│  Step 3/3:         │
│  Notifications     │
│  [Got it!]         │
└────────────────────┘
        │
        ▼
Feed (unlocked!) — Start sharing!
```

## Roles & Permissions

When members join, they're assigned a role. Here's what each role can do:

| Action | Owner | Admin | Editor | Viewer |
|--------|:-----:|:-----:|:------:|:------:|
| View feed, calendar, tree | Yes | Yes | Yes | Yes |
| React to posts | Yes | Yes | Yes | Yes |
| Comment on posts | Yes | Yes | Yes | Yes |
| Create posts | Yes | Yes | Yes | No |
| Create events | Yes | Yes | Yes | No |
| Create/complete chores | Yes | Yes | Yes | No |
| Invite members | Yes | Yes | No | No |
| Manage member roles | Yes | Yes | No | No |
| Add non-app persons | Yes | Yes | No | No |
| Change family theme | Yes | Yes | No | No |
| Delete others' posts | Yes | Yes | No | No |
| Transfer ownership | Yes | No | No | No |
| Delete family | Yes | No | No | No |

> **Tip:** The person who creates the family is automatically the Owner. They can promote others to Admin to help manage the family.
