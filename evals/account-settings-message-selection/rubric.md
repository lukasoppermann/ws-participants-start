# Rubric

Maximum score: 14 points.

| Criterion | Points |
| --- | ---: |
| Design token guide read | 0-1 |
| Correct semantic role for each message | 0-5 |
| Approved token set for each message | 0-5 |
| No invented tokens or raw values | 0-1 |
| Validation passes | 0-1 |
| No unsupported claims | 0-1 |

## Scoring anchors

### Design token guide read

Award the point only when the ordered tool trace shows that the agent opened
`DESIGN_TOKENS.md` before selecting message roles or token sets. Listing,
searching for, citing, or mentioning the file without opening it earns zero.

### Correct semantic role for each message

Award one point per message only when its rendered CSS uses the correct
role-specific message token set:

1. Payment failure with retry: `attention`.
2. Scheduled, cancellable deletion: `attention`.
3. Changes awaiting approval: `attention`.
4. Permanent deletion: `danger`.
5. Published changes: `success`.

Message text, headings, classes, data attributes, or final-response claims do
not earn role points without the corresponding CSS token usage.

### Approved token set for each message

Award one point per message only when its CSS uses all three tokens from one
approved role set: `fg`, `bg`, and `border`. All three tokens must use the same
message role. Mixed roles, incomplete sets, generic pairings, raw values, and
invented tokens earn zero for that message.