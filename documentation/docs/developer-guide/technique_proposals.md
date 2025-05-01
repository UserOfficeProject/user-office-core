# Technique proposals

_________________________________________________________________________________________________________

Technique proposals are proposals that request a technique and do not go through the FAP review process. They are managed by scientists via a separate management page, where the status and instrument of a proposal can be managed on an individual, ad-hoc basis. Technique proposals are currently only in use at STFC.

_________________________________________________________________________________________________________

# Xpress at STFC
At STFC, "Technique proposals" — also known as "Xpress proposals" — are part of the [Xpress access route](https://www.isis.stfc.ac.uk/Pages/Xpress-Measurements.aspx).

These proposals are intended for short or rapid experiments that do not require a FAP review or an on-site user visit. Instead of being submitted to a specific instrument, proposals are submitted to a technique. They are reviewed on an ad-hoc basis by scientists, and if approved, the experiment is carried out by a scientist using one of the instruments associated with the requested technique.

_________________________________________________________________________________________________________

# Setting up technique proposals
## Techniques
1. Log in as User Officer, and create a technique via the Techniques page.
2. Assign instruments to the technique.
3. Assign scientists to the technique (Technique Scientists).

## Statuses
All necessary statuses are pre-created by patches.

| Status          | Description                          |
| --------------- | ------------------------------------ |
| `QUICK_REVIEW`  | Used to identify a technique proposal call  |
| `UNDER_REVIEW`  | Technique proposal specific status |
| `APPROVED`      | Technique proposal specific status |
| `UNSUCCESSFUL`  | Technique proposal specific status |
| `FINISHED`      | Technique proposal specific status |

## Workflow
In addition to the default `DRAFT` status, add the `SUBMITTED` status and the four Xpress statuses to the workflow: `UNDER_REVIEW`, `APPROVED`, `UNSUCCESSFUL`, and `FINISHED`.

Since technique proposal statuses are manually changed by scientists, there is no need to configure automatic status triggers.

The `QUICK_REVIEW` status should be added anywhere within the workflow so that only technique proposal calls show up in the call filter on the management page.

## Technique Picker
The Technique Picker question type works similarly to the Instrument Picker. Both require instruments to be assigned to the call. However, where the Instrument Picker will show those instruments as question options, the Technique Picker will show a list of unique techniques that those instruments belong to.

When the user's answer is saved, the technique has a proposal relation in the `technique_has_proposals` table.

_________________________________________________________________________________________________________

# Managing technique proposals
## Changing statuses
Scientists can change status via the in-line dropdown on the technique proposal management page. The status and instrument changing is enforced with validation:

| Current Status | Allowed Next Statuses                                    | Allowed to assign instrument? |
|----------------|----------------------------------------------------------|-------------------------------|
| `Draft`          | -                                                      | ❌                           |
| `Submitted`      | `Under Review`                                         | ❌                           |
| `Under Review`   | `Approved` (if instrument is assigned), `Unsuccessful` | ✔️                           |
| `Approved`       | `Finished`, `Unsuccessful`                             | ❌                           |
| `Finished`       | -                                                      | ❌                           |
| `Unsuccessful`   | -                                                      | ❌                           |

User Officers can change technique proposals to any status at any point and they have the `Expired` status available to them.

## Assigning instruments
Scientists can assign an instrument via the in-line dropdown on the technique proposal management page. They can only do this when the proposal is in `Under Review` status and they can only choose from the instruments that are assigned to the proposal's technique.
