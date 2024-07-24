# Calls
![Call](/assets/images/call.png)

**What are calls?**

Calls allow users’ proposals to be submitted within User Office. A call is a period of time during which users can submit proposals to a facility. Calls have a start and an end date and are linked to a [**proposal template**](templates/proposal_template.md) and [**workflow**](templates/workflow_template.md). 

* The proposal template acts as the questionnaire that users need to fill in when writing their proposal. User Officers can customise calls with specific requirements, such as the type of research users may conduct and during which period. 

* The workflow specifies which stages the proposals assigned to the call will go through and the events that must occur in order to move to progess to the next status. 

# **Step 1. Setting up the templates**
In order to set up a call, you must decide which [**templates**](templates_info) it will utilise.
There are several different types of templates utilised within Calls:

??? info "Proposal templates" 

    [**Proposal templates**](templates/2proposal_template.md) are designed to capture all necessary information that users need to provide when submitting their proposals. For example, these templates generally include questions regarding experiment details, objectives, safety considerations and required resources. Users fill in their answers to these questions in the predefined fields and submit their proposals for review.

    User Officers can also utilise [**question templates**](templates/question_template.md) and [**sub-templates**](templates/sub_template.md) to customise proposal templates to include specific questions based on the nature and requirements of the research.

??? info "Proposal ESI templates" 

    [**Proposal Experimental Safety Input (ESI)**](templates/proposalESI_template.md) are designed to collect and document safety-related information for research proposals, ensuring that all necessary safety considerations are addressed before the experiment begins. User Officers can use ESI templates to gather details about potential hazards, risk assessments, safety measures, and compliance with regulatory standards. This structured approach helps in maintaining a safe research environment and ensures that all safety protocols are thoroughly evaluated and documented. User Officers can also utilise [**question templates**](templates/question_template.md) and [**sub-templates**](templates/sub_template.md) to customise Proposal ESI templates.

??? info "PDF templates" 

    [**PDF templates**](templates/pdf_template.md) enable users and User Officers to download proposals in a well-formatted and standardised PDF document formats for summary and sharing. User Officers can customise PDF templates by adjusting code to modify elements such as font size, colour and other formatting options.

??? info "Proposal Workflow templates" 

    [**Proposal workflow templates**](templates/workflow_template.md) outline the sequential steps a proposal follows from draft to final decision represented by statuses, such as '**Draft**', '**Feasibility Review**', '**Allocated**', '**Not Allocated**', '**Reserved**', and '**Rejected**'. Each status marks a key stage in the proposal's progression. For example, moving from 'Draft' to 'Feasibility Review' indicates the proposal's readiness for preliminary assessment. 

    Proposal workflow templates control how and when the User Office system will display information to different roles based on statuses. The workflow template manages how proposals are processed, with User Officers defining the statuses and events that guide proposals through their lifecycle. Events triggering status transitions include user submissions, call deadlines, feasibility reviews, and User Officers' decisions. User Officers can customise workflow templates by adding, removing or modifying statuses to fit specific needs, such as including 'Technical Review' or 'FAP Review' stages. Proposal workflow templates ensure systematic processing of proposals, allowing User Officers to track statuses and set up automatic notifications for users' proposals at different stages of review.


??? info "FAPs" 

    [**Facility Access Panels (FAPs)**](templates/fap_template.md) are groups of external reviewers responsible for evaluating research proposals. These panels consist of experts who assess the feasibility, significance, and resource requirements of the proposals. Each FAP typically includes a **chair** and a **secretary** to oversee the review process and ensure thorough and unbiased evaluations. FAPs play a crucial role in maintaining the integrity and quality of the proposal review process by providing independent and specialised assessments.

    User Officers can manage the FAPs assigned to proposals and provide general information such as labeling FAPs with a code, a description, and specifying the required number of proposal ratings. FAP templates can be utilised across multiple proposals, helping streamline the organisation and operation of the review process. This ensures that proposals are evaluated efficiently and according to standardised criteria such as the **grade guide**. 

??? info "Shipment declaration templates" 

    [**Shipment declaration templates**](templates/shipment_template.md) allow users to fill out a questionnaire to make a shipment declaration.

??? info "Visit registration templates" 

    [**Visit registration templates**](templates/visit_template.md) allow users to fill out a questionnaire to provide information about their visit registration.

??? info "Feedback templates" 

    [**Feedback templates**](templates/feedback_template.md) allow users to provide feedback about their experiment and experience at the facility through a questionnaire.


## **How do I use templates within a call?**
When it comes to utilising templates within a call there are various options:

**1. Use a pre-existing template**

To use a pre-existing template, simply select it from the drop-down menu within the call.

!!! tip ""

    **TIP:** It is good practice to check the templates you wish to use before finalising the creation of the call. You can view the template details in the designated template edit page, found by navigating to the templates menu

    Shipment declaration templates, visit registration templates and feedback templates do not appear within calls. To select which you would like to utilise, find their page on the main menu and use the 'Mark as active' function {mark as active} to specify which you wish to utilise.

**2. Edit a pre-existing template**

To edit pre-existing [**Proposal templates**](templates/2proposal_template.md) and [**Proposal ESI templates**](templates/proposalESI_template.md) directily from the call, click on edit selected template. For all other templates, navigate to the templates menu, click on the desired template type and search for the name of the template you wish to make changes to. 

From here, you can edit the template. Alternatively, you can also clone the template and edit the new cloned version if you wish to keep the original template as it is. 

*Note: the clone will be renamed 'Copy of _ Template' and will be edded to the end of the list of templates*

For further information on editing templates for calls, see the specific template creation guides below for an overview of each template's features.

**3. Create a template**

Lastly, you may also create templates to fully customise them to fit the research needs: 

* [**How do I create Proposal templates?**](templates/2proposal_template.md)

* [**How do I create Proposal ESI templates?**](templates/proposalESI_template.md)

* [**How do I create PDF templates?**](templates/pdf_template.md)

* [**How do I create Proposal Workflow templates?**](templates/workflow_template.md)

* [**How do I create FAPs?**](templates/fap_template.md)

* [**How do I create Shipment declaration templates?**](templates/shipment_template.md)

* [**How do I create Visit registration templates?**](templates/visit_template.md)

* [**How do I create Feedback templates?**](templates/feedback_template.md)


# **Step 2. Filling out the call contents** 

Once you have the templates available, you can begin to fill out the call information:
Start by creating a Call with the 'Create call' {create call} button.
When creating a call, the 'Create a call' page will pop-up and display three sections: **General**, **Reviews** and **Notification and cycle**.
You can navigate between the sections by clicking on the headings or next and back buttons.


### **1. General**
!!! note ""

    This is the section where you specify the general information about the call, including:

    ![General](/assets/images/general_1.png){ align=left width="350"}

    * **Short code (public):** The call short code which will be publicly displayed 

    * **Start date:** The date the Call opens and is ready for proposal submission

    * **End date:** The date the Call ends; i.e., the users' proposal submission deadline
     
    * **Reference number format:** The reference number format that determines how reference numbers are generated.

    * **Call template:** The proposal template that the call will utilise.

    * **ESI template:** The Experimental Safety Input (ESI) template the call will utilise.

    * **Proposal workflow:** The workflow that the Proposal will follow.

    * **Allocation time unit:** The unit of time the allocation will be in (Hours, Days or Weeks) 

    * **Title (public):** The name of the Call which will be publicly displayed 

    * **Description (public):** The description of the Call which will be publicly displayed

### **2. Reviews**
!!! note ""

    In this section you can specify the review process:

    ![Reviews](/assets/images/reviews_1.png){ align=left width="350"}

    * **Sart of review:** Start date of the feasibility review

    * **End of review:** End date of the feasibility review

    * **Start of FAP review:** Start date of FAP review

    * **End of FAP review:** End date of FAP review

    * **Call FAPs:** The FAPs that will be involved in the review of the proposals submitted to the call

    * **Survey comment:** 

### **3. Notification and cycle**
!!! note ""

    Finally, this section allows you to specify information regarding notifications and cycle:

    ![Notification and cycle](/assets/images/notification_1.png){ align=left width="350"}

    * **Start of notification period:** The start of the period in which emails are sent to users regarding the result of their proposal

    * **End of notification period:** The end of the period in which emails are sent to users regarding the result of their proposal

    * **Start of cycle:** Start date of cycle

    * **End of cycle:** End date of cycle

    * **Cycle comment (public):** 

    * **Submission message:** This is the message that is displayed to users upon proposal submission


# **Step 3. Creating the call**
Finally, before creating the call please ensure you have done the following: 


!!! tip ""

    **TIP:** Call checklist:

    - Have I checked all the templates?

    - Have I checked all the dates?

    - Have I checked which shipment, registration and feedback templates are marked as active?  

    - Have I checked that the user help page and FAQ pages contain all the necessary information for users?

    Lastly, once you have filled out all of the call information, checked that it is correct and reviewed the call checklist you may now Create the call by clicking the 'Create' button on the Notification and Cycle page.

**Congratulations, your call has been created!** 