In a new session run the following prompt, do not expose the criteria to the subsession.

After subsession run is finished, evaluate it using the following criteria

For each criterion, record Pass, Fail, or Unclear, plus a short quote or file/tool evidence.
Criteria:
- Guide discovered: The agent reads or cites DESIGN_TOKENS.md, or its tool trace shows it was loaded.
- Correct role selection: Recoverable payment, reversible deletion and awaiting approval use attention. Permanent deletion uses danger. Published changes use success.
- Approved token set: Each message uses its complete approved foreground, background, and border set.


Prompt for the subsession:
Add a section to the account settings example that displays these messages:

1. A payment failed, but the account remains active for seven days and the user can retry.
2. Repository deletion is scheduled for tomorrow and can still be cancelled.
3. Profile changes were saved but won’t be published until an administrator approves them.
4. The repository was permanently deleted and cannot be recovered.
5. The profile changes were published successfully and are now visible to everyone.

Use the existing design system and follow repository conventions. Don’t create new tokens. 

Choose the appropriate semantic role, token pairing, and existing component for each message.

Run the relevant validation and report:
- Semantic role
- Token pairing
- Invented tokens
- raw values
- unsupported assumptions
- Did deterministic validation passes?