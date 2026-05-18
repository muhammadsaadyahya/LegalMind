const text = `People v. Hall Sample Case Brief

Style:        People (Colorado) v. Nathan Hall

Colorado Supreme Court 2004

Procedural History:   At a preliminary hearing, the trial court dismissed case for
              lack of probable cause (defendant won)
District court affirmed lack of probable cause (defendant won
again)
Appellate court reversed ( People won)

Issue:     A)  How should Colorado law describe the mental state of recklessness?

B)  Whether the People have probable cause to believe that the defendant
committed reckless manslaughter when the defendant, a former ski racer trained
in ski safety, skied straight down a dangerous section of a mountain, lost control,
and struck the victim, killing him.

Holding:   A)  Mental state of recklessness is a legal definition that forms the rule for
this issue; see rule below for court’s holding on the  description of the recklessness
mental state.

B)  Defendant’s conduct reveals sufficient probable cause of reckless
manslaughter because the defendant acted “despite his subjective awareness of a
substantial and unjustifiable risk of death from his conduct.”  Specifically, the
defendant appreciated the risk of harm because he was a former ski racer trained
in ski safety.  He consciously disregarded that risk when he hurtled himself
straight down a steep and bumpy slope with his weight back on his skis and arms
out for balance, allowing himself to be thrown from mogul to mogul.  The risk
was substantial and unjustified because, as a ski racer, defendant knew what harm
might occur from losing control on skis at a high rate of speed, yet he chose to ski
the dangerous route down the mountain.

Rules :     A)  Recklessness involves a higher level of culpability than criminal
negligence, but requires less culpability than intentional actions.  The State
establishes a cause of action for reckless manslaughter when it proves the
defendant caused the victim’s death  and the defendant:
    Consciously disregarded
    A substantial and
    Unjustified risk that he would
    Cause the death of another

    The court may infer that the defendant was subjectively aware of the risk.
Court must weigh the nature and purpose of defendant’s conduct against the risk
created by that conduct in evaluating whether a risk is unjustifiable.  A substantial
and unjustified risk is a gross deviation from the standard of care.  Risk of death
to another in a general sense is sufficient; defendant need not risk death of a
specific individual.

    B)  In evaluating probable cause, the court considers the facts in a light
most favorable to the prosecution and draws all inferences against the defendant.
The state need only show that a reasonably prudent and cautious person could
believe that the defendant committed the crime.

Reasoning:   A)  Court relies on statutory definitions for recklessness from Colorado
law, the model penal code, and New York law.

    As it defines recklessness, the court contrasts recklessness with criminal
negligence, noting that both recklessness and negligence require a gross deviation
from the standard of care, but recklessness requires subjective awareness of that
risk while criminal negligence only requires a failure to perceive the risk

    B)  Court applies its definition of reckless manslaughter to the case facts
using the probable cause standard and finds that probable cause exists.  No prior
decisions cited.

Facts:
•   Defendant was a ski lift operator, former ski racer, trained in ski safety
•   After lifts closed for the day, defendant skied down a dangerous slope,
very fast
•   Defendant lost control on moguls, flew off a knoll, and struck the victim,
killing him.

Words to Define

Mens Rea:
Probable cause:
Manslaughter:
Mogul
`;
import { ingestDocument } from "./src/service/ai/ingestionService.js";

(async () => {
  const result = await ingestDocument("doc1", text);
  console.log(result);
})();
