# Visits :material-airplane-takeoff:

---

## What is a visit?

A visit is the record of **who is physically coming to the facility** for a scheduled experiment. It is created once per experiment and holds two things:

- **The team** — the list of visitors who will take part in the experiment.
- **The team lead** — the visitor who is responsible for the team on site. The team lead must always be one of the visitors.

Once a visit exists, each visitor completes their own [visit registration :material-airplane-takeoff:](templates/visit_template.md) form.

A visit becomes available only after the proposal has been ^^`accepted`^^, the management decision has been submitted, and the experiment has been allocated a time in the [scheduler](../scheduler.md).

---

## Who can create a visit? :material-account-group:

**Only the Principal Investigator (PI) of the proposal can create the visit.**

This is deliberately narrow, and there are two consequences worth knowing:

- **Co-proposers cannot create the visit.** The `Define who is coming` :material-account-group: action is hidden for them entirely, even though they can see the experiment.
- **User Officers cannot create the visit either.** A User Officer can read and edit a visit once it exists, but cannot create it. If a PI is unable to create their visit, the visit has to be created by the User Officer by impersonating the PI.

> **_NOTE:_** The PI is not necessarily the person who created the visit record. Whoever creates the visit keeps read access to it, but the PI's rights come from being the PI of the proposal, not from having created the visit.

---

## Who can see a visit?

A visit is visible to:

- The **PI** of the proposal
- The **person who created** the visit
- Anyone on the **visitor list** (the team)
- The Team Lead who by definition has to be on the **visitor list**

Everyone else, co-proposers who are not on the visitor list, cannot see the visit at all. It is not shown as empty or greyed out; it is hidden.

---

## Who can edit a visit?

A visit can be edited (visitors added or removed, team lead changed) by:

- The **PI** of the proposal
- The **team lead** of the visit

Being on the visitor list is _not_ enough to edit the visit. A visitor who is not the team lead can open the visit and see who is coming, but the form is read-only for them.

> **_NOTE:_** The team lead must always remain one of the visitors. An update that would remove the team lead from the team, or that would name a team lead who is not on the team, is rejected with the message _'Can not update visit because team lead is not part of the team'_. Add the person to the visitor list first, then set them as team lead.

---

## Registering for a visit

Each visitor fills in their own registration. A registration is private to the visitor it belongs to and to the User Officer — visitors cannot see or edit each other's registrations, and neither can the PI or the team lead.

A visitor can edit their own registration only while it is in one of these states:

- **Drafted** — not yet submitted.
- **Change requested** — returned to the visitor for amendments.

Once a registration has been **submitted** it is pending approval and can no longer be edited. **Approved** and **cancelled** registrations are also locked.

---

## Why can I not see the visit buttons?

Both visit actions appear on the user's upcoming experiments list. They change appearance depending on who you are and the state of the experiment.

**`Define who is coming` :material-account-group:**

| What you see                                                                          | What it means                                                                                                                       |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| The button is not there                                                               | You are neither the PI nor someone who can see the visit — for example, you are a co-proposer who is not on the visitor list.       |
| The button is greyed out, _'proposal is not accepted or missing management decision'_ | The proposal has not been accepted yet, or the management decision has not been submitted.                                          |
| The button is active                                                                  | You can create the visit, or view the existing one.                                                                                 |
| The button is marked as complete                                                      | The visit has already been created and team has been formed. You can still open it, and edit it if you are the PI or the team lead. |

**`Register visit` :material-airplane-takeoff:**

| What you see                                                           | What it means                                                                                                                                      |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| The button is not there                                                | You are not on the visitor list for this experiment, so there is nothing for you to register. Ask the PI or the team lead to add you to the visit. |
| The button is greyed out, _'visit is not defined'_                     | You are the PI and the visit has not been created yet. Create it first.                                                                            |
| The button is active                                                   | Your registration is drafted, or changes have been requested for it.                                                                               |
| The button shows as pending                                            | Your registration has been submitted and is awaiting approval.                                                                                     |
| The button is marked as complete                                       | Your registration has been approved.                                                                                                               |
| The button is greyed out, _'your registration for visit is cancelled'_ | Your registration was cancelled, either by you or by the facility.                                                                                 |

---
