# Family Tree

> See how everyone is connected. The tree builds itself automatically.

## How It Works

You don't draw the tree — **it generates itself** from the relationships you define. Add relationships between family members, and the tree visualization updates automatically.

```
                Grandma
                   │
          ┌────────┴────────┐
          │                 │
       Rajesh            Sunita
          │                 │
       Priya             Vinod
       (spouse)          (spouse)
          │                 │
        Amit              Neha
```

## Adding Relationships

To define a relationship between two people:

1. Select **Person A** (e.g., Grandma)
2. Enter what **A is to B** (e.g., "Mother")
3. Select **Person B** (e.g., Rajesh)
4. Enter what **B is to A** (e.g., "Son")
5. Choose the **relationship type** (parent-child, spouse, sibling, etc.)

The labels are **perspective-aware**: when Rajesh views his relationships, he sees "Mother" next to Grandma. When Grandma views hers, she sees "Son" next to Rajesh.

## Suggested Relationships

When you add a new relationship, the system may **suggest** related ones:

```
You added: Rajesh is spouse of Priya
Existing:  Grandma is mother of Rajesh

System suggests:
  ➜ Grandma is mother-in-law of Priya
     [Confirm]  [Dismiss]
```

**Inference rules:**

- Parent + child's spouse → Parent-in-law
- Parent's parent → Grandparent
- Parent's sibling → Uncle/Aunt
- Parent's sibling's child → Cousin
- Sibling's spouse → Sibling-in-law

Suggestions appear as **pending** — an Admin must confirm or dismiss them. The system never auto-accepts.

## Non-App Members

You can add people to the tree who don't have the app installed. This is useful for:

- Deceased ancestors (preserving family history)
- Elderly relatives not comfortable with technology
- Children too young for their own account

These members appear in the tree with a slightly different style, showing they're "not on the app."

## Navigating the Tree

- **Tap** any person to see their profile card (name, relationship to you, recent posts)
- **Pinch to zoom** for large families
- **Pan** to move around the tree
- Persons are arranged by **generation** (grandparents at top, grandchildren at bottom)
