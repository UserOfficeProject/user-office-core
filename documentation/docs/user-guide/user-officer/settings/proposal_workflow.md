# Proposal workflows

_________________________________________________________________________________________________________

## What are proposal workflows?

Proposal workflows outline the sequential steps a proposal follows from draft to final decision represented by statuses, such as '**Draft**', '**Feasibility Review**', '**Allocated**', '**Not Allocated**', '**Reserved**', and '**Rejected**'. Each status marks a key stage in the proposal's progression. For example, moving from 'Draft' to 'Feasibility Review' indicates the proposal's readiness for preliminary assessment. 

Proposal workflows control how and when the User Office system will display information to different roles based on statuses. The workflow manages how proposals are processed, with User Officers defining the statuses and events that guide proposals through their lifecycle. Events triggering status transitions include user submissions, call deadlines, feasibility reviews, and User Officers' decisions. 

User Officers can customize workflow templates by adding, removing or modifying statuses to fit specific needs, such as including 'Technical Review' or 'FAP Review' stages. Proposal workflows ensure systematic processing of proposals, allowing User Officers to track statuses and set up automatic notifications for users' proposals at different stages of review.
    
<figure markdown="span">  
        ![Workflow](../../../assets/images/workflow_editor.png){ width="450"}
        <figcaption>Proposal workflow</figcaption>
    </figure>
_________________________________________________________________________________________________________

## What are proposal statuses?

Proposal statuses represent the various stages a proposal goes through during its lifecycle, such as '**Draft**', '**Feasibility Review**', '**Allocated**', '**Not Allocated**', '**Reserved**', and '**Rejected**'. Each status signifies a specific point in the proposal's progression and helps track its current state.

Proposal statuses are used to manage and monitor the flow of proposals within the User Office system. They provide an indication of where a proposal is in the review and decision-making process. User Officers can customize these statuses to ensure that each proposal is processed correctly. 

Statuses can trigger events, notifications, and actions, helping to automate the proposal management process. For example, moving a proposal to 'Feasibility Review' might trigger a notification to the relevant reviewers, while a status of 'Allocated' could initiate resource allocation for the approved proposal.

_________________________________________________________________________________________________________

## What are status events?

Status events are specific triggers that cause a proposal to transition from one status to another within the proposal workflow. Examples of status events include '**Proposal Submitted**' and '**Review Completed**'. Each event is associated with a particular action or milestone in the proposal's lifecycle.

Status events are used to automate the movement of proposals through the workflow based on predefined criteria. User Officers can customize these events to fit the needs of their workflow, ensuring that proposals progress efficiently. Events can trigger status changes, notifications, and other actions. For example, the event '**Proposal Submitted**' might trigger a transition from 'Draft' to 'Feasibility Review'.

_________________________________________________________________________________________________________

## What are status actions?

Status actions are predefined operations that are automatically executed when a proposal transitions to a specific status. Examples of status actions include sending email notifications, updating records, or triggering external systems via RabbitMQ messages.

Status actions are used to automate tasks and ensure consistency in the proposal management process. User Officers can customize these actions to trigger necessary tasks when a proposal reaches a certain status. For example, a status action might send an email notification to reviewers when a proposal transitions to 'Feasibility Review'.

_____________________________________________________________________________________________________

## How do I create a proposal workflow?

**1. Navigate to the Proposal Workflows page**

* Go to the main menu and select Settings
* From the dropdown menu, choose Proposal Workflows

**2. Create a new Proposal Workflow**

* On the Proposal Workflows page, click the `CREATE` button
* Enter a name and description for your new Proposal Workflow
* Click `CREATE` to proceed

**3. Edit the Proposal Workflow**

* The Proposal Workflow Editor will open. From this page, you can set up the Proposal Workflow.
* You can drag and drop Proposal Statuses into the Proposal Workflow, reordering them as desired. The order of the statuses represent the workflow that the proposal will progress through. 
* You can delete {delete} statuses to remove them from the workflow.
* You can view the 


* Note: The 'Draft' Status is a mandatory starting status for all proposals. Therefore it cannot be deleted or have other statuses precede it. 

**4. Update your changes**

* Once you are satisfied with your edits, click the Update button to save and apply the changes to the PDF template

_________________________________________________________________________________________________________

## Statuses

??? info "Draft" 

    **Draft** When a proposal is created it gets draft status before it is submitted.

??? info "Feasibility review" 

    **Feasibility review** indicates that proposal feasibility review should be done.

??? info "Not feasible" 

    **Not feasible** indicates that the proposal is not feasible (as assessed by the technical review)

??? info "FAP selection" 

    **FAP selection** indicates that the proposal is ready to be assigned to a FAP

??? info "FAP review" 

    **FAP review** indicates that the proposal FAP review should be done

??? info "Allocated" 

    **Allocated** indicates that proposal time allocation should be done

??? info "Not allocated" 

    **Not allocated** indicates that the proposal is not allocated

??? info "Scheduling" 

    **Scheduling** indicates that the proposal should be scheduled

??? info "Expired" 

    **Expired** indicates that the proposal has expired

??? info "FAP meeting" 

    **FAP meeting** indicates that the proposal is in FAP meeting for evaluation

??? info "Rejected" 

    **Rejected** indicates that the proposal is rejected

??? info "Feasibility and sample review" 

    **Feasibility and sample review** indicates that the proposal feasibility and sample review can be done simultaneously

??? info "Sample review" 

    **Sample review** status that indicates that proposal sample review can be done

??? info "Management decision" 

    **Management decision** status that indicates that proposal sample review can be done

_________________________________________________________________________________________________________

### General Workflow

<figure markdown="span">  
        ![General Workflow](../../../assets/images/general_workflow.png){ width="300"}
        <figcaption>General workflow structure</figcaption>
    </figure>

_________________________________________________________________________________________________________

### **Rapid Access Workflow**

<figure markdown="span">  
        ![Shipment Declaration](../../../assets/images/rapid_workflow.png){ width="250"}
        <figcaption>Rapid Access Workflow structure</figcaption>
    </figure>

_________________________________________________________________________________________________________
