# RevBlack AI Solutions Engineer: interview study guide

**For Aaron Heiner · September 2026**  
A practical guide for thinking aloud, explaining your projects accurately, and designing useful AI workflows. The interview has not yet been scheduled. Use the short plan first; return to the deeper sections as needed.

> **Your aim:** Show that you can clarify a business problem, build a small useful version, test it with real users, protect their data, and improve it. You do not need to know every CRM API or invent experience you do not have.

## 1. The one-page interview card

### A four-step pattern for unfamiliar questions

1. **Outcome:** What decision or task should improve? Who uses the result? Ask one clarifying question, then state a working assumption.
2. **Inputs and constraints:** What data exists? How current and reliable is it? Who can access it? What is the cost of a mistake?
3. **Small first version:** What is the simplest useful workflow? Use a rule, template, or human-reviewed summary before a complex model if appropriate.
4. **Measure and iterate:** Compare with the current process, observe failures and adoption, ask users for feedback, change one thing at a time, and document the process.

**Thinking-out-loud opening:** “I’d first clarify what decision this should improve. Assuming the goal is [X], I’d check [data and constraints], build [small version], and measure [outcome and failure]. Then I’d adjust it with the people who use it.” This is a structure to adapt, not a speech to memorize.

### Five questions to keep in your head

- Who is the user, and what do they do today?
- What would success look like in their day-to-day work?
- What data is available **at the time the decision is made**?
- What could go wrong, and who must check the result?
- How would I tell whether the first version is actually better?

### When you do not know a technical detail

Say what you know, mark the unknown, and explain how you would verify it: “I have not implemented that particular CRM permission API. I would confirm the available access checks with the CRM admin and platform documentation, test allowed and denied users, and block access when a check fails.” Do not guess at an API or claim you built something you have not built.

## 2. What this role appears to value

Based on the job description you supplied: internal tools for consultants (client health, meeting prep, reporting); client work in Salesforce or HubSpot; reusable playbooks; weekly AI research; data quality and permissions; human review; explaining work to executives; shipping tools people actually use. The description explicitly says CRM experience is not required. It does expect initiative, feedback, craftsmanship, and ownership.

**Interview implication:** A good answer can start from the business workflow and end with evidence of value. A complicated model is not automatically a better answer.

## 3. Concepts to explain plainly

| Term | Plain-language explanation | Example and tradeoff |
|---|---|---|
| Data quality | Check whether data is complete, accurate, current, consistent, and suitable for this decision. | If half the meetings are not logged, “no recent meetings” might mean missing records rather than poor engagement. Fix logging or mark the signal uncertain. |
| Baseline | The existing process or a simple rule that a new tool must improve upon. | Compare a meeting-prep assistant with the consultant's current 20-minute manual prep. Time saved is useful only if the summary remains trustworthy. |
| Precision | Of the clients flagged, how many truly needed attention? | Low precision creates too many false alarms and alert fatigue. |
| Recall | Of all truly at-risk clients, how many did we flag? | Low recall means missing clients who needed help. High recall alone can be achieved by flagging everyone. |
| Threshold | The risk-score cutoff that triggers an alert. | Lowering it usually catches more cases but adds alerts; raising it usually reduces alerts but misses more cases. |
| Permissions | The rules for which people and integrations may read or change particular data. | A connector may read many records, but an individual consultant should only see authorized records. Check before sending data to an AI service or displaying it. |
| Human review | A person checks the output and supporting evidence before a consequential action. | A consultant reviews a draft client-risk alert before contacting the client. This takes time but catches errors. |
| Grounding | Give an AI tool relevant authorized source material and require it to base its response on that material. | A prep summary can point back to CRM records. The sources still need permission checks and factual review. |
| Adoption | Whether the intended users actually rely on the tool in their workflow. | A technically accurate report that nobody opens has little value. Ask why: timing, trust, format, or lack of need? |
| Playbook | A repeatable description of inputs, steps, owners, checks, failure handling, and measurement. | Document how to adapt a meeting-prep workflow for the next client without copying private data or assumptions. |

### A concrete data-quality check

For a client-health idea, list candidate fields (last meeting, open support issues, contract stage, response time). For each: inspect how often it is missing, whether dates are recent, duplicate records, inconsistent labels, impossible values, and whether the field is filled consistently across teams. Sample records with an account owner to learn whether “missing” means “did not happen” or “was not logged.” Record what is usable, uncertain, or unavailable. **Do not fill unknown facts with plausible-looking synthetic values and then treat them as evidence.**

### Precision/recall miniature example

Suppose 10 clients actually need attention. A tool flags 20, and 8 flagged clients really do need attention. Its precision is **8/20 = 40%** and recall is **8/10 = 80%**. It missed 2 and sent 12 false alarms. Ask account owners whether reviewing 20 alerts is practical and whether missing 2 is acceptable. The right threshold depends on both costs.

## 4. A realistic approach to three likely scenarios

### A. Client health monitoring

**Clarify:** Does “health” mean renewal risk, satisfaction, stalled projects, or something else? What intervention can an account owner actually take? When would we learn the true outcome?

**Start small:** Interview two account owners. Review a few historical cases. Check data coverage. Try transparent signals such as missed meetings, unresolved issues, or lack of response; show why each alert appeared. Have a person review alerts. If labels and volume eventually support it, compare a predictive model against this baseline.

**Measure:** Number of actionable alerts, missed known issues (recall), false alarms (precision), review time, follow-up time, and eventual client outcomes. Review unflagged clients too, or you will not know what the tool misses. Avoid using information recorded *after* the risk decision as an input during evaluation.

**Caution:** Outcomes may take months; in the first few weeks use leading indicators and human feedback, then revisit whether those indicators predict meaningful client outcomes.

### B. Meeting-prep assistant

**Clarify:** What does the consultant need before a meeting: recent commitments, open issues, contact changes, and suggested questions? How much prep time does the current process take?

**Start small:** Retrieve only authorized, recent records; prepare a short brief with source links and “unknown” markers. Have a consultant edit it before use. Begin with five or ten meetings and a checklist rather than full automation.

**Measure:** Minutes saved, missing or incorrect facts, edit rate, whether consultants use it again, and whether they trust its sources. A polished summary with invented facts fails even if it saves time.

### C. Internal reporting or workflow automation

**Clarify:** Which manual step is repetitive? What decision does the report support? Who must approve external communication or data changes?

**Start small:** Map trigger → authorized inputs → transformation → review → delivery → error handling. Use a sample and a small pilot. Keep an audit trail of what ran and who approved an action.

**Measure:** Time spent, error rate, number of manual corrections, failure recovery time, and actual usage. Document setup and ownership so another consultant can repeat it.

## 5. Synthetic data: what to say and what to avoid

**Useful for:** Testing a pipeline, screen, validation rules, edge cases, and demos without exposing real customer details. For example, make fictitious accounts with realistic *formats*: missing meeting date, duplicate contact, overdue task, and an account the user cannot access. Specify the schema, allowable values, and expected behavior first.

**Limited for:** Demonstrating that a churn or health model predicts real clients. If you invented both the features and the outcomes, the model may simply learn the story you wrote. Having very little real data is a reason to favor simple rules, expert review, and careful collection of real outcomes, not an automatic reason to train a complex generator.

**Validation checklist:** Verify schema and constraints; compare synthetic distributions and relationships with genuinely permitted real data if enough exists; inspect privacy risk and duplicates; test the workflow's edge cases; evaluate predictive claims on **held-out real cases** when available. If there are too few real labeled cases, describe the tool as a prototype or rules-based aid rather than a validated predictive model.

**Interview tradeoff:** Generating fake examples is fast and safe for functional testing; it may create false confidence about predictive quality. Do not reach for GANs just to sound technical.

## 6. Permissions and information safety

**Mental model:** An integration's access and a person's access are different. A broadly privileged connector must not accidentally answer a narrowly privileged user with another client's data.

**Discovery:** Ask the CRM admin and account owners which system is authoritative for users, client assignments, and sensitive fields. Map each output to the smallest necessary source fields. Identify who can read, edit, and approve actions. Confirm how access changes are applied and how a user is authenticated.

**Design:** Request narrow connector scopes where possible; check the user's current authorization **before retrieval, model input, or display**; filter by record and field; minimize retained data; keep secrets out of code; restrict logs, emailed summaries, and exports. If the access check is unavailable or systems conflict, withhold the sensitive result and surface the issue for an owner to resolve. Do not silently guess which system wins.

**Test:** Use permitted, forbidden, revoked, and conflicting-access accounts. Test prompts that ask for a different client's data. Re-test after permission changes. Document who owns the policy, where the check runs, and how exceptions are handled.

**Tradeoff:** Live checks and least-privilege access add work and can add latency; cached permissions may become stale. The acceptable design depends on actual platform capabilities and business requirements. Do not promise “automatic syncing” without knowing the integration.

## 7. Adoption, iteration, and stakeholder communication

A tool can work technically and still fail because it appears too late, sends too many alerts, lacks evidence, or adds steps. If usage is low: observe one person's workflow, ask for a specific failed or ignored output, group causes (no need, inaccurate, poor timing, confusing output, permissions), fix the largest cause, and check usage again. Tell the stakeholder what is working, what remains uncertain, and when you will report back. Do not call a rollout successful merely because the tool was deployed.

A simple pilot agreement:

- **User and problem:** Who is affected and what happens today?
- **Pilot boundary:** A small group, duration, sources, and review step.
- **Success measure:** Example: prep time saved with no major factual errors; or actionable alerts at a manageable weekly volume.
- **Owner and escalation:** Who checks outputs and handles errors?
- **Decision date:** Continue, revise, or stop based on observed use and quality.

## 8. Tell your own project stories accurately

Prepare two 60- to 90-second stories. Fill these in with **facts you can verify**. You do not need a dramatic metric; an honest observation is better than an invented percentage.

### Sunny: vehicle and employee management software

- **User and problem:** What was the owner's actual workflow before your app? Which step caused friction?
- **Your work:** Which specific feature or integration did you implement yourself? What did AI help you do during development, if anything?
- **Hard part:** One concrete bug, requirement change, or data issue. What did you investigate and change?
- **Verification:** How did you test it? What feedback did the business give? Is it currently used, piloted, or still being built?
- **Next improvement:** What would you measure or change after observing actual use?

### Downwinders Advocates: site and intake

- **User and problem:** Who needed the site or intake flow, and what was confusing or slow before?
- **Your work:** Which pages, integration, tracking, or deployment tasks did you own?
- **Hard part and verification:** Describe one specific test or correction, such as checking an intake path or verifying a tracking integration. Distinguish a successful technical check from evidence of business impact.
- **Next improvement:** What would you measure: completed intakes, form errors, drop-off, or time to follow-up?

**Story shape:** Problem → my action → evidence → what I learned. “We built” is fine for team work; specify the part that was yours. Do not describe Sunny as an AI product if AI mainly helped you develop its software.

## 9. Interview delivery skills

- **Take a pause:** “Let me think through the user's workflow for a moment.” A few seconds are normal.
- **Ask one useful clarifying question, then proceed:** “Is the priority catching most at-risk clients or limiting account-owner alerts? I will assume the former and explain the tradeoff.” Avoid asking five questions before offering any approach.
- **Speak in layers:** Give the business answer first, then one concrete example, then a check or tradeoff. Stop and let the interviewer probe.
- **Separate knowledge from research:** “Here is the design principle; I would verify the exact platform support in its docs and with the admin.” Research is an implementation step, not the entire answer.
- **Own uncertainty:** “I have not built this exact integration, but my first test would be…” sounds clearer than apologizing repeatedly.
- **End with a decision:** Say what evidence would make you continue, revise, or stop a pilot.

### A 30-minute practice routine

1. **Five minutes:** Explain the five terms from Section 3 without reading.
2. **Ten minutes:** Pick one scenario from Section 4. Take 30 seconds, then answer using outcome → inputs → first version → measurement in 90 seconds. Record yourself once.
3. **Ten minutes:** Tell one real project story. Remove vague phrases (“I used AI,” “I optimized it”) unless you can name the action and result.
4. **Five minutes:** Review only one weakness: missing example, unclear measure, no tradeoff, or no next step. Repeat that answer once.

Do not spend hours memorizing CRM endpoints. Practice explaining the process you would use to discover and verify them.

## 10. Practice questions (answer out loud before reading a resource)

### Business and discovery

1. A consultant says “we need AI for client health.” What decision should you clarify first?
2. What current workflow would serve as a baseline?
3. What would you ask an account owner who ignores a daily report?
4. A leader asks for a quick proof of value in two weeks. What would you promise and what would remain unproven?
5. How would you explain the tool to an executive without ML jargon?

### Data and evaluation

6. CRM meeting history is incomplete. What checks would you run before using “no meetings” as a risk signal?
7. Your tool catches most unhappy clients but flags nearly everyone. What measure suffers, and what would you try?
8. How would you discover missed at-risk clients if only flagged cases get reviewed?
9. Why does a test on synthetic records not validate real-world predictive performance?
10. What is a simple baseline for a client-risk alert tool?
11. Which information might leak the answer if it was recorded after a client left?

### Workflow, permissions, and human review

12. A consultant asks a meeting-prep tool for another client's confidential notes. What happens?
13. How would you find out which fields the tool really needs?
14. What happens when access checks disagree or fail?
15. Which outputs require human review, and why?
16. How would you ensure an emailed summary follows the same access rules as the app?

### Ownership and iteration

17. The tool works but nobody uses it. What would you investigate first?
18. What would you put in a playbook to repeat the solution for another client?
19. What would you tell a stakeholder if early tests show the tool is inaccurate?
20. Which feedback would justify changing the design rather than just the alert threshold?

**Self-check after each answer:** Did I name the user, first action, evidence of success, and a relevant tradeoff? Did I claim only what I know?

## 11. Two-day study plan (adapt when the interview is scheduled)

**Day 1, about 90 minutes:** Read Sections 1–6. Do the data-quality example on paper; draw the precision/recall scenario. Spend 20 minutes with the Google classification material and 20 minutes on HubSpot or Salesforce CRM basics. Tell your Sunny story aloud twice, checking every factual claim.

**Day 2, about 90 minutes:** Read Sections 7–10. Do four scenario questions with a 30-second pause and a 90-second answer. Review the recording for clarity and concrete steps. Tell the Downwinders story. Practice one honest “I have not used that API” response and one stakeholder update. Stop when answers are clear enough; sleep and show up curious.

**If you have only 30 minutes:** Read Section 1, complete one project story, and answer questions 1, 6, 12, and 17 aloud.

## 12. Curated resources

Start with the first three; the rest are optional. These links were checked for relevance when this guide was prepared. Course pages may include short embedded videos or exercises.

### Watch

1. [StatQuest: The Confusion Matrix (YouTube)](https://www.youtube.com/watch?v=Kdsp6soqA7o) — watch to visualize false alarms and missed cases. Draw your own 2×2 table afterward.
2. [Google ML Crash Course: Thresholds and the confusion matrix](https://developers.google.com/machine-learning/crash-course/classification/thresholding) — includes a short video and interactive threshold exercise. Move the slider and explain the alert tradeoff.
3. [HubSpot Academy: Getting Started with HubSpot CRM](https://academy.hubspot.com/lessons/setting-up-your-crm) — a video lesson for contacts, records, and basic CRM workflow. Write down which record fields a meeting-prep assistant might need.

### Read or practice

4. [Google ML Crash Course: Data characteristics and overfitting](https://developers.google.com/machine-learning/crash-course/overfitting) — focus on data that is reliable enough for training and evaluation.
5. [Google ML Crash Course: Precision and recall](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall) — calculate one example by hand.
6. [Google ML Crash Course: Dividing datasets](https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets) — learn why testing on truly unseen records matters.
7. [Salesforce Trailhead: Data Security](https://trailhead.salesforce.com/content/learn/modules/data_security) — skim the overview of organization, object, field, and record access. You do not need to finish the entire module before a first interview.
8. [HubSpot Academy: HubSpot CRM Training](https://academy.hubspot.com/courses/set-up-your-hubspot-crm-for-growth) — browse the free introductory course if you have extra time.
9. [Google ML Crash Course: Monitoring pipelines](https://developers.google.com/machine-learning/crash-course/production-ml-systems/monitoring) — optional next step on how data and tool quality can change after launch.

## 13. Final reminder

You already described a sensible instinct: understand the problem, consult resources, build a test, and learn from the result. The interview skill is to **make those steps audible and concrete**. You can say “I would verify that” while still proposing a first version, a way to test it, and a clear next decision. Good judgment includes knowing when the available data does not justify a predictive model.
