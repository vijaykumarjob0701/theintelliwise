---
title: "Can Tabular Foundation Models Really Beat AutoML?"
date: 2026-09-20 20:00:00 +0100
tags: [tabular, tabpfn, autogluon, catboost, automl]
excerpt: "A standup claim, a Slack table, and a same-split bake-off on Adult Income. AutoGluon edged AUC. CatBoost won the production shape. TabPFN trained in a blink — on 3,000 rows — and paid for it at inference."
card_image: /assets/images/cards/tabular-vs-automl.png
---

Monday standup. Someone says tabular foundation models are done cooking AutoML. *You just fit TabPFN. No search. No stack. It already knows tables.*

An hour later, Slack. A coworker pastes a screenshot: three rows, one circled AUC, a fire emoji. The screenshot does not mention train time, RAM, or how many rows the foundation model actually saw.

I asked the only useful question:

> Same split. Same test set. What budget did each method get?

That is this bake-off. Not a Kaggle medal chase. A coworker-table argument, run honestly.

<p class="series">
  <strong>Runnable source of truth:</strong>
  <a href="https://www.kaggle.com/code/vijaykr0701/tabpfn-vs-autogluon-catboost-bakeoff">TabPFN vs AutoGluon CatBoost Bakeoff</a>
  on Kaggle — Adult Income, frozen stratified split, documented budgets. The numbers in this post are from a local end-to-end run on 20 September 2026. I did not invent extra metrics.
</p>

---

## Who this is for

You already ship a CatBoost or LightGBM baseline. Someone on the team wants to swap it for **TabPFN** or **AutoGluon** because a notebook looked decisive.

**Use this post when you need:**

- A same-protocol comparison, not three screenshots from three different weekends.
- The cost of the win: wall-clock, peak RAM, inference ms/row.
- Language for the next Slack thread: *Kaggle LB ≠ production.*

**Do not take the table as a universal ranking.** One binary task. One holdout. Labeled budget differences. Re-run the notebook if your table is wider, messier, or has a latency SLA.

---

## The Slack table, then the protocol

The Slack table was a ranking. The bake-off is a protocol.

Three methods. One Adult Income task: predict whether income is `>50K`. One stratified 80/20 holdout (`SEED=42`). The same train and test indices for every arm. Identifier-like `fnlwgt` dropped. No extra leaderboard tricks.

| Method | Role in the argument |
|---|---|
| **CatBoost** | The CPU baseline you would actually ship on Friday |
| **AutoGluon** | AutoML stack (`medium_quality` + a wall-clock cap) |
| **TabPFN** | Foundation-model-style tabular classifier — train subsample if the set is large |

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontSize": "14px"}, "flowchart": {"nodeSpacing": 20, "rankSpacing": 30}}}%%
flowchart TD
    A["Adult Income — binary >50K"]
    B["Frozen stratified 80/20 split"]
    C["CatBoost — full train, CPU"]
    D["AutoGluon — medium_quality, time-capped"]
    E["TabPFN — train subsample to 3000 rows, CPU"]
    F["Same test set — AUC, train s, peak RAM, infer ms/row"]

    A --> B
    B --> C --> F
    B --> D --> F
    B --> E --> F

    style A fill:#E3F2FD,stroke:#1E88E5,color:#333
    style B fill:#FFF3E0,stroke:#FB8C00,color:#333
    style C fill:#E8F5E9,stroke:#43A047,color:#333
    style D fill:#F3E5F5,stroke:#8E24AA,color:#333
    style E fill:#FFEBEE,stroke:#E53935,color:#333
    style F fill:#E0F2F1,stroke:#00897B,color:#333
```

If the Notes column is different, the ranking is not a fair fight. Write the budget into the table or do not post the table.

---

## The budgets that did not make the Slack screenshot

This is the part a fire-emoji screenshot drops.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontSize": "14px"}, "flowchart": {"nodeSpacing": 18, "rankSpacing": 28}}}%%
flowchart LR
    subgraph CB ["CatBoost"]
        C1["Full train set"]
        C2["CPU defaults"]
    end
    subgraph AG ["AutoGluon"]
        A1["Full train set"]
        A2["medium_quality"]
        A3["Local verify ~90s time_limit"]
        A4["Notebook default 180s"]
    end
    subgraph TP ["TabPFN"]
        T1["Train subsampled to 3000 rows"]
        T2["Test set unchanged"]
        T3["CPU"]
    end

    style C1 fill:#E8F5E9,stroke:#43A047,color:#333
    style C2 fill:#E8F5E9,stroke:#43A047,color:#333
    style A1 fill:#F3E5F5,stroke:#8E24AA,color:#333
    style A2 fill:#F3E5F5,stroke:#8E24AA,color:#333
    style A3 fill:#FFF3E0,stroke:#FB8C00,color:#333
    style A4 fill:#FFF8E1,stroke:#F9A825,color:#333
    style T1 fill:#FFEBEE,stroke:#E53935,color:#333
    style T2 fill:#FFEBEE,stroke:#E53935,color:#333
    style T3 fill:#FFEBEE,stroke:#E53935,color:#333
```

Two labels that have to travel with any “winner”:

- **TabPFN did not train on the full train set.** If the train split is larger than 3,000 rows, only that arm is stratified-subsampled. The test set stays whole. That is a labeled budget difference, not a footnote you hide after the AUC.
- **AutoGluon was time-capped.** The published notebook defaults to `TIME_LIMIT_AG = 180` seconds. The local verification run that produced the numbers below used about **90 seconds** — and the measured train time was 89.7s, which is the cap showing up in the stopwatch. A longer cap can change the AutoGluon row. It cannot be assumed from this table.

CatBoost ran on CPU. No GPU claim in this run.

---

## The table from the 20 September 2026 local run

These are the only metrics I am publishing from that run.

| Method | AUC | Train (s) | Peak RAM (MiB) | Infer ms/row | Notes |
|---|---:|---:|---:|---:|---|
| CatBoost | 0.9295 | 8.67 | 951.1 | 0.002 | CPU |
| AutoGluon | 0.9315 | 89.7 | 1379.3 | 0.0105 | `medium_quality`; verify used ~90s `time_limit` (notebook default 180s) |
| TabPFN | 0.9105 | 0.15 | 1406.5 | 53.497 | Train subsampled to 3000 rows on CPU — labeled budget difference |

If you only circle AUC, AutoGluon wins: **0.9315** against CatBoost **0.9295**. Two thousandths. Ten times the train time. More RAM. Still cheap at inference.

If you only circle train time, TabPFN looks like magic: **0.15s**. Then you read the Notes, and the inference column: **53.497 ms/row**. Against CatBoost at **0.002 ms/row**, that is not a rounding error. It is a different product.

Peak RAM is in the same band for AutoGluon and TabPFN (~1.4 GiB). CatBoost was the lightest of the three at **951.1 MiB**.

I am not adding log-loss, accuracy, or a leaderboard score. Those were not part of the verified local table.

---

## How I would answer Slack now

**“TabPFN beat AutoML.”** Not on this run. Not on AUC, and not on the production-shaped columns. It trained instantly on a **3,000-row** CPU subsample and was the slowest to score a row by a wide margin.

**“AutoGluon won.”** On AUC, yes — by 0.0020 over CatBoost, under a ~90s cap. That is a real edge and a small one. I would not rewrite a serving stack for it without a second seed and the 180s notebook default.

**“So we keep CatBoost.”** For a CPU service that cares about ms/row, that is the row I would take to standup. Eight seconds to train. Two-thousandths of a millisecond per row. AUC within shouting distance of the AutoML stack.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontSize": "14px"}, "flowchart": {"nodeSpacing": 20, "rankSpacing": 30}}}%%
flowchart TD
    Q["What are you actually buying?"]
    Q --> A["Highest AUC on this holdout"]
    Q --> B["Ship on CPU this week"]
    Q --> C["Near-zero fit time on a small train slice"]

    A --> AG["AutoGluon — 0.9315 — pay the time cap"]
    B --> CB["CatBoost — 0.9295 — 8.67s train, 0.002 ms/row"]
    C --> TP["TabPFN — 0.15s fit — 3000-row subsample, 53.497 ms/row"]

    style Q fill:#E3F2FD,stroke:#1E88E5,color:#333
    style AG fill:#F3E5F5,stroke:#8E24AA,color:#333
    style CB fill:#E8F5E9,stroke:#43A047,color:#333
    style TP fill:#FFEBEE,stroke:#E53935,color:#333
```

---

## Honest takeaways

**Kaggle LB ≠ production.** A public notebook is the right place to *reproduce* the protocol. It is the wrong place to decide p95 latency, install friction, or who owns the model when AutoGluon’s stack picks a different winner next month.

**Budgets matter more than the library name.** Full-train CatBoost, time-capped AutoGluon, and subsampled TabPFN are three different experiments that happen to share a test set. Rank them only after you read the Notes.

**TabPFN’s 0.15s is not a free lunch.** The fit is cheap because this arm saw 3,000 training rows on CPU. Inference is where the foundation-model bill showed up.

**AutoGluon’s 89.7s is the cap, not “AutoML is slow.”** The verify run used ~90s. The notebook default is 180s. If someone quotes this table against a 10-minute AutoGluon run, they are quoting a different bake-off.

**A 0.002 AUC gap is a conversation, not a migration.** On Adult Income, with this split, I would keep the CatBoost baseline in production and keep the Kaggle notebook as the place we re-run the argument.

---

## Re-run it yourself

The notebook is the source of truth for code, seeds, and how each arm is measured:

**[https://www.kaggle.com/code/vijaykr0701/tabpfn-vs-autogluon-catboost-bakeoff](https://www.kaggle.com/code/vijaykr0701/tabpfn-vs-autogluon-catboost-bakeoff)**

Change `SEED`, `TIME_LIMIT_AG`, or `TABPFN_MAX_TRAIN_ROWS` if you want a sensitivity check. Do not paste a new screenshot without the Notes column.

If the next standup still starts with a single circled AUC, paste this table back — and ask what the method was allowed to spend.
