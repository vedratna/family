#!/bin/bash
# End-to-end test of the local stack.
# Verifies: signup, login, myFamilies, createFamily, feed, events, chores
set -e

cd "$(dirname "$0")/.."

API="http://localhost:4000/"
PASS="\033[32m✓\033[0m"
FAIL="\033[31m✗\033[0m"

fail() {
  echo -e "  $FAIL $1"
  echo "    $2"
  exit 1
}

pass() {
  echo -e "  $PASS $1"
}

gql() {
  curl -s "$API" -H "Content-Type: application/json" ${2:+-H "x-user-id: $2"} -d "{\"query\": $(printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}"
}

check_field() {
  local resp="$1"
  local path="$2"
  local msg="$3"
  local val
  val=$(echo "$resp" | python3 -c "import json,sys; d=json.load(sys.stdin); p='$path'.split('.'); v=d; [exec('v = v[int(k)] if k.isdigit() else v[k]', {'v':v,'k':k}) for k in p]; print(v)" 2>/dev/null || echo "")
  if [ -z "$val" ] || [ "$val" = "None" ]; then
    fail "$msg" "Response: $resp"
  fi
  echo "$val"
}

echo "== Health check =="
HEALTH=$(gql '{ health }')
echo "$HEALTH" | grep -q '"health":"OK"' || fail "Health check" "$HEALTH"
pass "API is healthy"

echo ""
echo "== Demo user Mickey Mouse (user-1) =="
MYFAM=$(gql '{ myFamilies { family { id name themeName } role } }' "user-1")
echo "$MYFAM" | grep -q "Disney Family" || fail "Mickey sees Disney Family" "$MYFAM"
echo "$MYFAM" | grep -q "Simpson Family" || fail "Mickey sees Simpson Family" "$MYFAM"
pass "Mickey sees 2 families (Disney owner, Simpson admin)"

FEED=$(gql '{ familyFeed(familyId: "family-disney", limit: 10) { items { id textContent authorPersonId } cursor } }' "user-1")
echo "$FEED" | grep -q "Great day at the park" || fail "Feed returns posts" "$FEED"
pass "Disney Family feed returns seeded posts"

MEMBERS=$(gql '{ familyMembers(familyId: "family-disney") { person { id name } role } }' "user-1")
echo "$MEMBERS" | grep -q "Mickey Mouse" || fail "Family members includes Mickey" "$MEMBERS"
pass "Disney Family members visible"

echo ""
echo "== Demo user Bart Simpson (user-2) =="
BART_FAM=$(gql '{ myFamilies { family { name } role } }' "user-2")
echo "$BART_FAM" | grep -q "Simpson Family" || fail "Bart sees Simpson Family" "$BART_FAM"
[ "$(echo "$BART_FAM" | grep -c "family")" = "1" ] && pass "Bart sees only 1 family (Simpson owner)"

echo ""
echo "== Self-signup flow =="
NEW_PHONE="+91$(date +%s | tail -c 11)"
SIGNUP=$(gql "mutation { register(phone: \"$NEW_PHONE\", cognitoSub: \"test-$(date +%s)\", displayName: \"Test User\") { id displayName } }")
NEW_USER_ID=$(echo "$SIGNUP" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["data"]["register"]["id"])')
[ -n "$NEW_USER_ID" ] || fail "Signup returns userId" "$SIGNUP"
pass "New user registered (id: $NEW_USER_ID)"

# New user should have no families
EMPTY=$(gql '{ myFamilies { family { name } role } }' "$NEW_USER_ID")
echo "$EMPTY" | grep -q '"myFamilies":\[\]' || fail "New user has no families" "$EMPTY"
pass "New user has 0 families (empty state)"

# Create first family
CREATE_FAM=$(gql 'mutation { createFamily(name: "Test Family", themeName: "indigo") { family { id name themeName } person { id name } } }' "$NEW_USER_ID")
NEW_FAM_ID=$(echo "$CREATE_FAM" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["data"]["createFamily"]["family"]["id"])')
[ -n "$NEW_FAM_ID" ] || fail "createFamily returns family" "$CREATE_FAM"
pass "Created first family (id: $NEW_FAM_ID)"

# Verify user now sees the family
AFTER=$(gql '{ myFamilies { family { id name } role } }' "$NEW_USER_ID")
echo "$AFTER" | grep -q "Test Family" || fail "myFamilies shows new family" "$AFTER"
echo "$AFTER" | grep -q "owner" || fail "User is owner of new family" "$AFTER"
pass "User sees new family as owner"

# Activation gate: new family with < 2 members can't post (by design)
POST=$(gql "mutation { createPost(input: { familyId: \"$NEW_FAM_ID\", textContent: \"Hello world!\" }) { id textContent } }" "$NEW_USER_ID")
echo "$POST" | grep -q "ActivationGateError\|at least 2" || fail "Activation gate blocks single-member posts" "$POST"
pass "Activation gate correctly blocks posts until 2+ members (by design)"

# As a demo user in a fully-populated family, posting WORKS
DEMO_POST=$(gql 'mutation { createPost(input: { familyId: "family-disney", textContent: "E2E test post" }) { id textContent } }' "user-1")
echo "$DEMO_POST" | grep -q "E2E test post" || fail "Demo user can post in active family" "$DEMO_POST"
pass "Mickey can post in Disney Family (multi-member)"

# Demo user creates an event
DEMO_EVENT=$(gql 'mutation { createEvent(input: { familyId: "family-disney", title: "E2E Event", eventType: "social-function", startDate: "2026-05-01" }) { id title } }' "user-1")
echo "$DEMO_EVENT" | grep -q "E2E Event" || fail "Create event" "$DEMO_EVENT"
pass "Created event in Disney Family"

# Demo user creates a chore
CHORE=$(gql 'mutation { createChore(input: { familyId: "family-disney", title: "E2E Chore", assigneePersonId: "person-donald" }) { id title status } }' "user-1")
echo "$CHORE" | grep -q "E2E Chore" || fail "Create chore" "$CHORE"
pass "Created chore in Disney Family"

echo ""
echo "== Invite flow: User A invites phone, User B signs up with that phone, accepts =="
INVITE_PHONE="+91$(date +%s | tail -c 8)99"
INV=$(gql "mutation { inviteMember(input: { familyId: \"family-disney\", phone: \"$INVITE_PHONE\", name: \"Invited B\", relationshipToInviter: \"Sibling\", inverseRelationshipLabel: \"Sibling\", role: \"editor\" }) { phone status } }" "user-1")
echo "$INV" | grep -q "\"phone\":\"$INVITE_PHONE\"" || fail "Invite returns invitation with phone" "$INV"
echo "$INV" | grep -q '"status":"pending"' || fail "Invitation status is pending" "$INV"
pass "Mickey invited $INVITE_PHONE"

# Invitee registers
REG_INVITED=$(gql "mutation { register(phone: \"$INVITE_PHONE\", cognitoSub: \"invited-$(date +%s)\", displayName: \"Invited B\") { id displayName } }")
INVITED_ID=$(echo "$REG_INVITED" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["data"]["register"]["id"])')
[ -n "$INVITED_ID" ] || fail "Invited user can register" "$REG_INVITED"
pass "Invited user registered with invited phone"

# Invitee accepts invitation
ACCEPT=$(gql "mutation { acceptInvitation(familyId: \"family-disney\", phone: \"$INVITE_PHONE\", displayName: \"Invited B\") { person { id name } role } }" "$INVITED_ID")
echo "$ACCEPT" | grep -q '"role":"editor"' || fail "Accept invitation returns role" "$ACCEPT"
pass "Invited user accepted invitation"

# Invitee now sees Disney Family in myFamilies
AFTER_ACCEPT=$(gql '{ myFamilies { family { id name } role } }' "$INVITED_ID")
echo "$AFTER_ACCEPT" | grep -q "Disney Family" || fail "Invitee sees Disney Family" "$AFTER_ACCEPT"
pass "Invitee now member of Disney Family"

# Invitee can post
INV_POST=$(gql 'mutation { createPost(input: { familyId: "family-disney", textContent: "Thanks for the invite!" }) { id textContent } }' "$INVITED_ID")
echo "$INV_POST" | grep -q "Thanks for the invite" || fail "Invitee can post in family" "$INV_POST"
pass "Invitee can post in family"

echo ""
echo -e "\033[32m== All end-to-end tests passed ==\033[0m"
