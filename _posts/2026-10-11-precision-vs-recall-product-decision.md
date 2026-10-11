---
title: "Precision vs Recall Is a Product Decision"
date: 2026-10-11 14:00:00 +0000
tags: [precision, recall, product, threshold, classification, ml-metrics]
excerpt: "Precision and recall are not only model scores. They decide what the product does when it is unsure. Favour the side whose mistake costs more."
card_image: /assets/images/precision-vs-recall-product-decision/01-music-feed-precision.gif
permalink: /posts/precision-vs-recall-product-decision/
---

Precision and recall show up on every model card. They also decide what the product does when the score is in the middle.

The definitions, the matrix, and the colours are in [Precision and Recall, in Colours You Will Remember]({{ '/posts/precision-recall-color-coded/' | relative_url }}). This post is the product half: which side you favour, and who pays when you get it wrong.

**Colour legend** (same chips as that post):

<span style="background:#d4f0e4;color:#0d7a45;font-weight:600;padding:2px 8px;border-radius:4px">✓ TP</span>
correct catch &nbsp;
<span style="background:#fde6d0;color:#9a3b0a;font-weight:600;padding:2px 8px;border-radius:4px">⚠ FP</span>
false alarm &nbsp;
<span style="background:#ddd6fe;color:#4c1d95;font-weight:600;padding:2px 8px;border-radius:4px">✗ FN</span>
miss &nbsp;
<span style="background:#e5e7eb;color:#4b5563;font-weight:600;padding:2px 8px;border-radius:4px">· TN</span>
correct ignore

False alarms stay orange, not red, so you are not asked to tell red from green. Each cell also has a mark. The colour is a helper, not the only signal.

Two one-line definitions:

- **Precision:** when the system speaks up, how often is it right.
- **Recall:** out of all the real events, how many did it catch.

```mermaid
flowchart LR
  A[The system has a score] --> B{Speak up or stay quiet?}
  B -->|spoke, and it was real| TP["✓ TP correct catch"]
  B -->|spoke, and it was not| FP["⚠ FP false alarm"]
  B -->|stayed quiet, and it was real| FN["✗ FN miss"]
  B -->|stayed quiet, and it was not| TN["· TN correct ignore"]
  classDef tp fill:#d4f0e4,stroke:#1a9e55,color:#0d7a45
  classDef fp fill:#fde6d0,stroke:#d46a2e,color:#9a3b0a
  classDef fn fill:#ddd6fe,stroke:#5b4cc4,color:#4c1d95
  classDef tn fill:#e5e7eb,stroke:#6b7280,color:#4b5563
  class TP tp
  class FP fp
  class FN fn
  class TN tn
```

---

## High precision: a music recommendation feed

A music app shows you ten songs.

If eight or nine of them are good, you keep listening. That is high <span style="background:#d4f0e4;color:#0d7a45;font-weight:600;padding:1px 7px;border-radius:4px">precision</span>: when the feed speaks, it is usually right.

If you scroll through twenty songs and like none, you leave. The misses do not hurt as much here. A good track that never appeared is a quiet loss. A feed full of <span style="background:#fde6d0;color:#9a3b0a;font-weight:600;padding:1px 7px;border-radius:4px">⚠ false alarms</span> is the thing that closes the app.

For discovery, being selective beats being exhaustive.

![A picky music feed keeps the user. A junk feed does not.]({{ '/assets/images/precision-vs-recall-product-decision/01-music-feed-precision.gif' | relative_url }})

---

## High recall: a kitchen smoke detector

Burnt toast sets the alarm off. That is a <span style="background:#fde6d0;color:#9a3b0a;font-weight:600;padding:1px 7px;border-radius:4px">⚠ false alarm</span>. People wave a towel and put up with it.

The reason is the other mistake. A real fire at night that the detector misses is <span style="background:#ddd6fe;color:#4c1d95;font-weight:600;padding:1px 7px;border-radius:4px">✗ fatal</span>.

So the detector accepts false alarms so it never misses the real event. That is high <span style="background:#ddd6fe;color:#4c1d95;font-weight:600;padding:1px 7px;border-radius:4px">recall</span>: out of the real fires, it must catch all of them.

![A smoke detector accepts burnt toast so it never misses a real fire.]({{ '/assets/images/precision-vs-recall-product-decision/02-smoke-detector-recall.gif' | relative_url }})

---

## You cannot max both

The same score, two knobs that pull against each other.

Lower the threshold and you catch more real events. Recall goes up. Users drown in <span style="background:#fde6d0;color:#9a3b0a;font-weight:600;padding:1px 7px;border-radius:4px">⚠ false alarms</span>.

Raise the threshold and you only speak when you are almost sure. Precision goes up. Real problems slip by as <span style="background:#ddd6fe;color:#4c1d95;font-weight:600;padding:1px 7px;border-radius:4px">✗ misses</span>.

Picking that cut is the product decision. The model gives you a score. The product picks who gets bothered.

![Slide the threshold: catch more, or stay quieter.]({{ '/assets/images/precision-vs-recall-product-decision/03-threshold-slider.gif' | relative_url }})

---

## Ask what a false alarm costs vs what a miss costs

Write the two costs down before you argue about 0.87 vs 0.91.

1. **What does a <span style="background:#fde6d0;color:#9a3b0a;font-weight:600;padding:1px 7px;border-radius:4px">⚠ false alarm</span> cost?** Time, trust, a hidden invoice, a wasted page, a user who leaves.
2. **What does a <span style="background:#ddd6fe;color:#4c1d95;font-weight:600;padding:1px 7px;border-radius:4px">✗ miss</span> cost?** Fraud that already left, a fire, a sick person sent home, a chunk the LLM never saw.
3. **Who pays?** The user, the business, or safety. Those three are not the same budget.
4. **Does a human review the output?** If yes, you can raise recall and let a person throw away the extra flags. If no, a false alarm goes straight to the user.

Favour the side whose mistake you cannot afford.

| Product | Favour | Why |
| --- | --- | --- |
| Spam filter | Precision | A false alarm hides an invoice. One extra junk mail is cheap. |
| Fraud alerts | Recall | Missed fraud is money gone. A clean payment can wait for an analyst. |
| Cancer screening | Recall | A miss sends a sick person home. An extra test is recoverable. |
| Search ranking (page one) | Precision | Junk in the first five results, people bounce. A good page on page three is often fine. |
| Content moderation | Recall, then a human | Harm that stays live is the expensive miss. A reviewer can undo a false take-down. |
| RAG retrieval | Recall on the first fetch | If the chunk never enters the prompt, the model cannot use it. Precision comes at rerank. |
| Code review bot | Precision | Too many false nits and the team mutes the bot. A human still reads the PR. |
| On-call alerting | Recall, then a second filter | A silent pager during an outage is worse than a burnt-toast page. Do not page on every blip, or people stop trusting the pager. |
| Recommendations | Precision | Ten songs, eight or nine should be good. A long junk feed and the user leaves. |
| Job matching | Precision on the candidate feed | A bad match wastes a click. Recruiter search can lean the other way, so a good hire is not skipped. |

The table is a starting bias, not a law. Same product, different user, different cost. A recruiter search wants recall. A candidate feed wants precision. Write the two costs for *your* screen.

---

## Practical tips

- **Set the threshold from the costs**, not from 0.5 because the library defaulted there.
- **Use two stages** when you can. A high-recall first pass gathers candidates. A high-precision filter, or a human, decides what the user sees.
- **Track both numbers over time.** A precision win that quietly drops recall is a product change, not a free upgrade.
- **Agree a floor on one metric, then push the other.** Example: recall at least 95%, then maximise precision. That sentence belongs in the spec, not only in a notebook.

![Wide first pass, picky second pass.]({{ '/assets/images/precision-vs-recall-product-decision/04-two-stage-pipeline.gif' | relative_url }})

```mermaid
flowchart LR
  A[High-recall first pass] --> B[High-precision filter or human]
  B --> C[What the user sees]
```

---

## Cheat sheet

| If this is true | Favour |
| --- | --- |
| A miss is expensive, a false alarm is cheap | Recall |
| A false alarm drives people away, a miss is quiet | Precision |
| A human reviews every flag | You can raise recall |
| No human in the loop | You need more precision |
| You can run two stages | Wide first pass, picky second pass |

| Cell | Colour | Mark | Hook |
| --- | --- | --- | --- |
| True Positive | green `#1a9e55` | ✓ | correct catch |
| False Positive | orange `#d46a2e` | ⚠ | false alarm |
| False Negative | purple `#5b4cc4` | ✗ | miss |
| True Negative | grey `#6b7280` | · | correct ignore |

Precision = when it speaks, how often is it right. Recall = of the real events, how many did it catch. Formulas and a worked inbox are in the [colour-coded post]({{ '/posts/precision-recall-color-coded/' | relative_url }}).

---

## In short

Precision and recall are product knobs, not only model scores. Precision asks, when the system speaks up, how often is it right. Recall asks, of the real events, how many did it catch. A music feed wants precision, because junk songs close the app. A smoke detector wants recall, because a missed fire at night is fatal. You cannot max both. The threshold is the product decision. Write down what a <span style="background:#fde6d0;color:#9a3b0a;font-weight:600;padding:1px 7px;border-radius:4px">⚠ false alarm</span> costs, what a <span style="background:#ddd6fe;color:#4c1d95;font-weight:600;padding:1px 7px;border-radius:4px">✗ miss</span> costs, who pays, and whether a human reviews the output. Set the cut from those costs, not from 0.5. Two stages help: catch widely first, then be picky. Track both numbers. Put a floor on one and push the other.
