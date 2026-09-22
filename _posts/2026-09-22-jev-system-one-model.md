---
title: "Jev: Fast Decisions for Software"
date: 2026-09-22 18:00:00 +0000
tags: [jev, typesafe, system-one, llm, structured-outputs, laya, convai]
excerpt: "Chat models write letters. Jev fills labeled boxes. One ticket can feed three independent stamps. Same toys, two kitchens. Keep the essay writer for essays."
---

Chat models write letters.

**Jev** fills labeled boxes.

It is **not** a chat LLM. You do not ask it for a poem. You do not ask it for a function. You send it a pile of facts and a list of questions. It sends back **typed guesses** your code can read — yes/no numbers, one winning label, a spot on a ladder.

Think of a lunch line.

A chat model writes a note: “Hmm, maybe this kid wants juice, or maybe a sandwich, let me explain…”

Jev stamps three boxes: **urgent?** **which desk?** **how bad?** Then your code moves the tray.

**TypeSafe AI** made it. San Francisco. Founded in 2024. The company calls Jev its first public **System One** model. Early access was announced on **15 September 2026**. Wikipedia and the press put a seed of about **$40 million**, led by **DCVC**. Treat that as reporting, not a bank statement we audited.

The founder, **Diogo Almeida**, has said he worked on the **RLHF** / InstructGPT-era work at OpenAI — the methods that helped models follow instructions and talk. That is **his claim**, and it is how the launch post and later reporting tell the story. Phrase it that way. Do not turn it into “he invented ChatGPT.”

```mermaid
flowchart LR
  A[Your app] -->|state + questions| B[POST /v1/systemone]
  B --> C[Jev]
  C -->|typed answers + probs| D[Your code]
  D --> E[if / route / score]
  D --> F[LLM only if you need prose]
```

Keep the letter-writer for letters. Keep Jev for **smart if-statements**.

The stamps are not only TypeSafe’s. Another kitchen uses the same three. That house is later.

![A chat LLM writes a letter one character at a time. Jev fills three answer boxes in one pass.]({{ '/assets/images/jev-system-one-model/01-llm-letter-vs-jev-boxes.gif' | relative_url }})

---

## Two names, both playground-simple

**System One** is a class name. TypeSafe borrowed it from Daniel Kahneman’s **System 1** vs **System 2**.

- **System 1** is fast. Catch the ball. Pick the red cup.
- **System 2** is slow. Do the long division. Write the essay.

TypeSafe wants **fast decisions inside software**, not slow chat essays. Their docs say the emphasis is on snap judgments a person could make in a second if they had the facts.

**Jev** is named after **William Stanley Jevons** and the **Jevons paradox**.

Kid version: when coal got cheaper, people did not use *less* coal. They built more engines.

TypeSafe’s bet: when a guess gets cheap and fast, you do not ask *fewer* questions. You put guesses in more places — routing, scoring, guardrails, map-reduce over a pile of tickets.

![Cheaper coal lights more factories. Cheaper decisions light more jobs in code. That is why it is named Jev.]({{ '/assets/images/jev-system-one-model/05-jevons-coal-more-uses.gif' | relative_url }})

Say it out loud:

> “System One is the *kind* of model. Jev is *this* model. Cheap guesses should mean more uses, not fewer.”

---

## How you talk to it

One door.

```http
POST https://api.typesafe.ai/v1/systemone
```

Every request has three pockets:

1. **`state`** — the facts. Text, JSON, or a list of text. The ticket. The log. The program snapshot. Official docs: text only. No pictures, no audio, no video (yet).
2. **`model`** — who looks. `jev-latest` is the alias. Official models page (as of this draft): that alias points at **`jev-1.13.0`**. Pin the versioned id in production.
3. **`questions`** — a map of judgments. You name the keys. The answers come back under the same keys. The key is a label for *your* code. Write the real question in `instructions`.

Jev looks at the state **once**. It answers every question in **one parallel pass**. It does not write token, then token, then token.

You list the legal boxes first. Jev **cannot** emit a value outside that list. That is TypeSafe’s type-safety claim, and it is easy to falsify if it ever happens.

Wrong answers are still allowed. A box can be the *wrong* box. That is not a type error. That is a bad guess.

![You list the legal boxes first. A chat string like “maybe-sort-of-billing?” is not allowed. Jev still might pick the wrong legal box.]({{ '/assets/images/jev-system-one-model/06-schema-no-type-errors.gif' | relative_url }})

---

## Three toys. That is the whole API.

There is no fourth type. No free-text extraction. No “just write a number.” Official TypeSafe docs: **Noul**, **Choice**, **Score**.

| Type | Kid idea | Returns | Limits (official API) |
| --- | --- | --- | --- |
| **Noul** | Yes/no coin feel | Probability **0–1**. No separate confidence field. The number *is* the belief. | Yes/no only. `0.5` means “I cannot tell,” not “medium.” |
| **Choice** | Pick one labeled box | Winning option + **all** probabilities + **confidence** | Up to **255** options |
| **Score** | Place on an ordered ladder | Score (can sit **between** rungs) + probs + confidence | **2–10** levels |

TypeSafe has not said what **Noul** stands for. Treat it as a made-up name.

![Noul is a yes/no coin. Choice is labeled boxes. Score is a ladder you wrote.]({{ '/assets/images/jev-system-one-model/02-three-primitives.gif' | relative_url }})

**Noul** asks “Is this true?” Near 1 = strong yes. Near 0 = strong no. Near 0.5 = the model has nothing to go on. There is **no** extra `confidence` field. If you wanted a *spectrum* (“how good is this?”), you wanted a **Score**. A Noul of 0.5 is not “sort of good.” It is “I do not know.”

**Choice** asks “Which of these labels?” You get the winner (the argmax), the full pile of probabilities, and a confidence number. The probabilities must add up to 1. If your list might miss a case, add **`other`** or **`none`**. If you do not, leftover belief lands on whichever label is *least wrong* — and it can look sure.

TypeSafe’s own Wikiracing note: above 255 options they do a two-step (score, then pick). That is why a huge list can sometimes feel slower.

A Choice is **relative**. It picks a winner among the labels you wrote. It is not the same as asking a Noul for each label.

**Score** asks “Where on *this* ladder?” You write 2 to 10 rungs, low end first. The returned `score` is a probability-weighted spot. Three rungs live on 0, 1, 2. A score of **1.6** sits between rung 1 and rung 2.

TypeSafe is blunt: you may **threshold** (`score > 1.5`). You may **not** treat 1.6 as “80% angry” and do arithmetic as if the rungs were a ruler.

### They do not swap

TypeSafe published this trap on the jev-1.13 jaggedness page, and Learn Jev repeats it.

Ask “is the customer asking for a refund?” as a **Noul** and as a yes/no **Choice**. On one of their tickets the Noul said **0.22**. The Choice said **no** at **0.99**. Same question. Two toys. Opposite vibes.

Two Nouls that look like opposites (`refund` / `not_refund`) do not have to add to 1.

Never copy a threshold from a Noul onto a Choice. Never pretend N Nouls = one Choice.

Say it out loud:

> “Choice is ‘who wins the race.’ Noul is ‘how true is this, by itself.’”

---

## One ticket. Three stamps.

Here is one made-up ticket. No real people. The numbers below are a **teaching story**, not a live Jev call. The **shape** follows TypeSafe’s published examples: a Choice winner, a Score that can sit between rungs, a Noul near 1.

Shared state:

> “I was charged twice. Please refund the extra charge today.”

Three named questions. Same ticket. Each one needs a name, a toy type, and the real ask in `instructions`. Choice and Score also need a list you wrote: the desks, or the ladder rungs.

| Name | Toy | What you asked | Teaching answer | What it is **not** |
| --- | --- | --- | --- | --- |
| **team** | **Choice** | Which desk should handle this? | `billing` (plus a probability for each desk) | Not a written reply to the customer |
| **urgency** | **Score** | How soon? Levels: **0** routine, **1** today, **2** now | **1.05** — between “today” and “now” | **Not hours.** 1.05 is not “one hour and a bit.” |
| **refund_requested** | **Noul** | Did the customer *ask* for a refund? | **0.95** | **Not approved.** It is an estimated 95% chance of *yes, they asked.* |

Choice and Score also come back with **confidence**. Score comes back with a **legend** that maps 0 / 1 / 2 to the words you wrote. Noul has **no** extra confidence field. The number *is* the belief.

```json
{
  "state": {
    "ticket": "I was charged twice. Please refund the extra charge today."
  },
  "model": "jev-1.13.0",
  "questions": {
    "team": {
      "type": "choice",
      "instructions": "Which desk should handle this?",
      "criteria": {
        "billing": "Money, refunds, charges",
        "technical": "Bugs, broken buttons, outages",
        "sales": "Pricing, upgrades, new accounts",
        "other": "None of those"
      }
    },
    "urgency": {
      "type": "score",
      "instructions": "How soon does this need a person?",
      "criteria": [
        "Routine. It can wait.",
        "Today.",
        "Now."
      ]
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "Did the customer ask for a refund?"
    }
  }
}
```

Story answers, so you can see the shape:

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "team": {
      "type": "choice",
      "choice": "billing",
      "probabilities": {
        "billing": 0.88,
        "technical": 0.04,
        "sales": 0.03,
        "other": 0.05
      },
      "confidence": 0.79
    },
    "urgency": {
      "type": "score",
      "score": 1.05,
      "legend": {
        "0": "Routine. It can wait.",
        "1": "Today.",
        "2": "Now."
      },
      "probabilities": { "0": 0.10, "1": 0.75, "2": 0.15 },
      "confidence": 0.61
    },
    "refund_requested": { "type": "noul", "noul": 0.95 }
  }
}
```

What your code does with that:

- `team` = `billing` → open that queue.
- `urgency` = 1.05 → above a “do this today” cut you chose, or not. **You** pick the cut. Do not read 1.05 as hours.
- `refund_requested` near 0.95 → they almost surely *asked*. A person still owns “approve the money.”

```mermaid
flowchart LR
  T[One shared ticket] --> Q1[team: Choice]
  T --> Q2[urgency: Score]
  T --> Q3[refund asked: Noul]
  Q1 --> A1[billing]
  Q2 --> A2[1.05 between levels]
  Q3 --> A3[0.95 they asked]
```

![One shared ticket. Three named questions stamp it. None peeks. Score can sit between levels. A high Noul means they asked — not that a refund is approved.]({{ '/assets/images/jev-system-one-model/09-one-ticket-three-independent.gif' | relative_url }})

### They do not peek

All three questions read the **same** ticket. None of them sees another’s answer.

- **team** does not know that urgency landed at 1.05.
- **urgency** does not know that team picked billing.
- **refund_requested** does not know either stamp.

That is why you can send them together. They are independent.

Official docs: ask every question that shares the same state in **one** request. Extra questions are cheap (output is free; they run in parallel). The instinct to ask one thing at a time is the expensive habit.

If a later decision needs an earlier result — “now that we know it is billing, is this a chargeback?” — make **another request**. A chain is a second call, not a secret look.

Say it out loud:

> “One ticket. Three named boxes. None peeks. Need a chain? Send again.”

---

## The boxes travel with the request

A usual fine-tuned **BERT** classifier learns its boxes at training time. It gets one hook per label, glued on during practice. Those hooks stay frozen. Even if someone puts it behind an API, you cannot send a new category. Want “subscriptions”? You collect more labeled tickets and train again.

Jev reads the boxes **from the request**. You send the question, the allowed boxes, and a kid-plain note for each box, every time. Want a “subscriptions” desk? Add that box to the next call.

TypeSafe does **not** offer customer fine-tuning. The request is the thing you change. Official models page: same weights for every account. No customer LoRA.

One fair caveat: some **zero-shot** tools built on **NLI** models (“does this sentence follow from that one?”) can also take new boxes at call time. We are comparing Jev with the **usual frozen, fine-tuned classifier** — not with every encoder trick in the world.

You still need a pile of tickets with known stamps to see if the new boxes work. You just do not need to train anything to *try* the new question.

A chat / generative LLM is a **writer kid**. It writes one piece of text, then the next. Grown-ups call those pieces **tokens**. An **encoder** is a **reader kid**. It reads the whole sentence and builds number-pictures of the meaning. **BERT** is a famous reader kid. That is the history of the comparison. It is **not** Jev’s family tree.

This is a picture of **behavior**, not a diagram of Jev’s insides. TypeSafe has not published those insides. Do **not** say Jev is BERT. From the outside we can say what it **does**: it fills labeled boxes.

---

## Beliefs, cuts, and company numbers

TypeSafe’s training name is **RLCD** — **Reinforcement Learning for Calibrated Decisions**.

**RLHF** (the chat-era method) rewards “text people like.”

**RLCD** (their name) rewards “probabilities that match how often you are actually right.”

**Calibrated** means: when it says about **90%** on many guesses, it should be right about **90%** of the time. One guess can still be wrong. A 90% weather forecast can still rain on a picnic.

A kid check: gather many tickets where the model said about **0.7**. About **70%** of those should turn out true. That is a story about a **pile**, not a promise about this one ticket.

RLCD is a **vendor target**. It is not proof that *your* tickets, *your* labels, or *your* cutoff already meet it.

The **confidence** field (Choice and Score) says how bunched the answer probabilities are. It does **not** mean a second test already proved the guess. Do not use it to skip a person until you have checked it on real examples.

A cutoff is where *your* software acts. Check calibration on tickets where you already know the stamp. Then pick the cut. A wrong **refund** and a wrong **queue** need different cuts. The mistakes cost different amounts.

TypeSafe’s published claims (theirs, not ours):

| Claim | What they published | How to hold it |
| --- | --- | --- |
| Speed | ~**70–500 ms** end-to-end | Company number. They note many evals were run from West Coast laptops near the service. |
| Price | **$0.042** per million **input** tokens; **output free** | Official models page: $42 per billion input tokens. Output “too cheap to meter.” |
| Faster / cheaper vs frontier LLMs | Launch post: **40x–200x** faster on System One shaped queries. Homepage: **193.6x** faster, **444.6x** cheaper | Those two big multipliers are from **their workflow evals**. They say they expect that to sit at the **high end** of real-world gains. |
| Type errors | **Cannot** emit a value outside the schema you sent | By construction, they say. Easy to falsify if it ever happens. |
| Context | **64k** tokens per request; **32k** for `state` plus the longest question | Official models page. |
| Rate limits | **250,000** tokens/sec, **1,200** requests/min | Official, and they say these can move without notice while demand is huge. |

![TypeSafe’s speed picture: a chat model can take seconds to minutes. Jev’s published window is about 70 to 500 milliseconds.]({{ '/assets/images/jev-system-one-model/04-turtle-essay-vs-flash.gif' | relative_url }})

Skipping the letter-writing step can save work. That fact alone does **not** prove how much faster any one call will be. TypeSafe’s speed numbers stay **their** claims.

**Output-is-free is a Jev billing story**, not “Jev output tokens = LLM output tokens.” TypeSafe’s CEO said on Hacker News they are not really comparable. Your bill is mostly **how fat `state` is** and **how often you send it**.

What *is* sourced about training:

- The company says it built “a new model architecture” and a **parallel sampler**. That is a claim, not a diagram.
- Almeida told TechCrunch Jev is **transformer-based** and trained on **synthetic data** with RLCD. Tight-lipped on the rest. Observers guess an open-weight backbone. That is **not** confirmed.
- Official: they say they do **not** train on customer requests.
- They have **not** published architecture, weights, or a paper. Do not invent layers, parameter counts, or “it is just BERT.”

---

## Two kitchens. Same stamps.

**Laya** is another **System One** / **System 1** decision model. **Convai Innovations** made it. India. Project materials often name **Nandakishor M** as CEO. Treat that as their materials, not a company we audited.

Same idea as Jev. You send **state** plus typed questions. You get typed answers with probabilities. **No letter.** No poem. No function.

Same three toys: **Noul**, **Choice**, **Score**. Convai’s helpers use a Jev-shaped request. The stamps look familiar on purpose.

The house is different.

- **Jev** is a restaurant. You sit down. You `POST` to TypeSafe. They stamp the tray.
- **Laya** is a stamp kit. **Apache 2.0** weights on Hugging Face. `pip install laya`. You run it on **your** GPU or CPU. This story is not a hosted TypeSafe-style API.

![Two lunchrooms. Same three stamp boxes. Jev is the restaurant that stamps for you. Laya is the kit you keep in your kitchen.]({{ '/assets/images/jev-system-one-model/07-restaurant-vs-kitchen-kit.gif' | relative_url }})

**Laya** *does* publish an encoder + head and more of the RLCD recipe — a ModernBERT-style reader plus a typed decision head. That is Convai’s model, not Jev’s. Do not copy those layers onto TypeSafe.

### What Convai publishes (theirs)

| Claim | What they published | How to hold it |
| --- | --- | --- |
| Internals | **ModernBERT-large** encoder + a typed decision head ≈ **421M** (English). Multilingual **mmBERT-base** ≈ **322M**. | They published this. Jev has not published a matching diagram. |
| License / run | Apache 2.0. `pip install laya`. Your machine. | Weights are free. You pay GPU, CPU, and ops. |
| Context | Often **512** tokens (English) or **1024** (other checkpoints) per question | Much smaller than Jev’s documented **64k** request / **32k** state+longest-question budget. |
| Many Choice labels | Publishers commonly advise fewer options (~**20** at defaults). Options share a prompt budget. | Jev’s official cap is **255**. Convai’s own note says Jev leads when the list is long. |
| Training | They also call it **RLCD**. They publish more of the recipe (encoder, head, reward). | TypeSafe uses the same name and does **not** publish Jev’s recipe. |
| Languages | **100+** languages + a router that picks a checkpoint | Convai’s claim. Test the languages you care about. |
| Speed | About **33 ms** on their GPU figures. They say faster than Jev. | **Convai’s numbers.** Not a shared bake-off. Some write-ups warn the head-to-head mixes sources. |
| Fine-tune | You can train a checkpoint on your data | Jev is a versioned hosted model. You shape it with prompts and pin a version. |

Wrong answers are still allowed. A kitchen kit can still stamp the wrong box.

### Fair lunch-line table

| | Jev (TypeSafe) | Laya (Convai) |
| --- | --- | --- |
| Deployment | Hosted API | Open weights; you run it |
| Internals | Parallel sampling + RLCD described; network unpublished | ModernBERT/mmBERT + typed head documented |
| Same toys? | Noul / Choice / Score | Same three |
| Big inputs | Larger documented token budget | Smaller default budgets |
| Many labels | Up to 255 Choice options | Prefer fewer options at defaults |
| Adapt | Change prompts/state; pin version | Fine-tune checkpoint + calibration |
| Money | Input token price (output free) | Weights free; you pay GPU/ops |
| Best first try | Want a managed decision API | Need local / air-gap / own weights |

![Jev’s documented tray is big. Laya’s default tray is smaller. Same stamps. Different room to write.]({{ '/assets/images/jev-system-one-model/08-big-tray-vs-small-tray.gif' | relative_url }})

Convai publishes a “Laya vs Jev” scoreboard. They also say some Jev numbers were **not** measured on their machines (no TypeSafe API access; they cite third-party write-ups). Independent notes warn those tables mix sources — a fine-tuned Laya checkpoint next to hosted Jev, their T4 milliseconds next to someone else’s p50.

**That is Convai’s published comparison. It is not an independent shared bake-off.**

We will not paste their full “beats Jev on X” table as proven fact. We will not invent accuracy numbers of our own.

Pick the house for the job. Then test **your** tickets.

Say it out loud:

> “Same three stamps. Jev is the restaurant. Laya is the kit you keep at home.”

---

## When to use it

Start with the answer your product needs.

| Start with **code** when… | Try **Jev or Laya** when… | Use a **generative LLM** when… |
| --- | --- | --- |
| You can calculate it exactly (math, counts, dates your code already knows) | You can **list** the answers: a category, a yes/no, a rung on a ladder | You need a **reply**, an explanation, or a plan |
| The rule is an `if` you can write by hand | You want to pick, rate, or check something in text | You need deeper reasoning or an ambiguous comparison |
| You already found the candidate values | You pick from values your code already found | There is **no** fixed candidate list |
| The path is a known recipe | You route **known** cases and check conditions | You must plan, or handle an unfamiliar case |

Jev cannot pick an email address your code missed. It is not a search box. It also does not document an embedding endpoint. (An **embedding** is a list of numbers that helps a search tool find writing that *means* the same thing. That hunt is a different system.)

**Use a System One model when** the job is a snap your code can act on:

- Smart **if-statements** (“does this ask for a refund?”)
- **Routing** (which desk, which skill, which model next)
- **Scoring** (severity, frustration, evidence strength)
- **Map-reduce** over a pile of tickets or logs
- **Real-time UX** where TypeSafe’s ~100 ms story matters
- **Judge / guardrail** on another model’s output (jailbreak, “did it follow the rule?”)

**Do not use it when** you need a free-form string:

- Writing essays or emails
- Code generation as prose
- Open chat
- Anything whose answer is not already in a coin, a labeled box, or a short ladder
- Pictures / audio / video as input (not supported)

| | Chat LLM | System One (Jev or Laya) |
| --- | --- | --- |
| Output | A **string**. Chat, code, a story, a refusal, a hallucination | A **typed** value you listed in advance |
| Sampling | **Sequential.** One token, then the next | **Parallel.** All questions in one pass |
| Best job | Essays, chat, code-as-prose, open answers | Classify, route, score, guardrail, map-reduce, ~100 ms UX |
| Kid picture | Turtle writing a letter | Flash filling three boxes |

**Cascade** — the grown-up pattern. Both houses can sit in the same chair:

1. **Jev or Laya** does the cheap snap: classify / route / score / “is this a jailbreak?”
2. **Your code** reads the numbers. Ifs. Thresholds. Queues.
3. A **frontier LLM** writes the hard text — the reply, the patch, the essay — only when you actually need a string.

```mermaid
flowchart TB
  T[Ticket / log / agent trace] --> S[Jev or Laya: Noul + Choice + Score]
  S --> C{Code thresholds}
  C -->|high confidence + easy shape| A[Act: route, block, file]
  C -->|medium / messy| H[Human review]
  C -->|need a paragraph or patch| L[Frontier LLM]
```

![Ticket to Jev to code. Easy work stays in code. Only hard prose goes to a chat model.]({{ '/assets/images/jev-system-one-model/03-cascade-jev-code-llm.gif' | relative_url }})

TypeSafe’s own use-case list matches this: smart if-statements, map-reduce over lots of text, real-time UX around **100 ms**, and **judge / guardrail** work on LLM traces. They also showed a Doom bot and Wikiracing as toys — structured *state*, not pixels.

| First try **Jev** when… | First try **Laya** when… |
| --- | --- |
| You want a managed API and a published token price | You need the weights on *your* machine (local / air-gap) |
| Inputs can be fat (TypeSafe’s 64k story) | You can live with a smaller default context |
| You may need a long Choice list | You can keep Choice lists shorter, or raise Laya’s budget yourself |

Say it out loud:

> “Jev or Laya picks the box. Code moves the tray. The LLM writes the note — if a note is even needed.”

---

## Honest caveats

- **Early access.** Waitlists. Pin **`jev-1.13.0`** (or whatever version you tuned) once thresholds matter. `jev-latest` can move.
- **Company evals are theirs.** The 193.6× / 444.6× headlines are workflow evals TypeSafe built. They say the workflows were *not* in the training set, *were* written by their capabilities team (possible bias), and the multipliers are likely **upper end**.
- **Wrong ≠ type error.** Schema safety does not make a high-stakes refund automatic. Set thresholds. Escalate. A person still owns the sharp edges.
- **Choice and Noul are not twins.** Relative vs absolute. Do not swap them and keep the same cut.
- **Documented example outputs are not tests.** Learn Jev notes a launch-week report that an official Python sample did not match the docs. Run it. Believe *your* distribution.
- **English first.** Official models page: other languages work less evenly. Test.
- **Convai’s Jev scoreboard is theirs.** Not a shared bake-off. Their card even says some Jev figures were never measured in their lab. Treat Laya speed and “faster than Jev” as **Convai’s numbers**.
- **RLCD is a target, not a certificate.** Check examples. Then pick a cutoff.
- **Confidence is not a second test.** It says how bunched the Choice/Score probabilities are.
- **New labels still need a quiz.** Labels travel in the request. You still need known stamps to see if the guesses are good enough.
- **Questions do not peek.** Same ticket, separate answers. A chain is a second request.
- **Architecture is unpublished.** Describe what Jev does. Do not claim it is BERT. Laya’s encoder is Convai’s, not TypeSafe’s.

---

Official references:

- [Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) (TypeSafe launch, 15 Sep 2026)
- [System One](https://docs.typesafe.ai/concepts/system-one)
- [Primitives](https://docs.typesafe.ai/primitives)
- [HTTP API](https://docs.typesafe.ai/api)
- [Models, price, limits](https://docs.typesafe.ai/models)
- [Noul / Choice / Score tutorials](https://learnjev.com/tutorials/three-primitives)
- [First call](https://learnjev.com/tutorials/first-call)

Secondary (company facts, not architecture):

- [Wikipedia: Jev (AI model)](https://en.wikipedia.org/wiki/Jev_(AI_model))
- [TechCrunch, 18 Sep 2026](https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/) (transformer-based + synthetic data, as Almeida told them)

Laya / Convai (vendor pages; claims are theirs):

- [Hugging Face: convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya)
- [PyPI: laya](https://pypi.org/project/laya/)
- [GitHub: NandhaKishorM/laya](https://github.com/NandhaKishorM/laya)
- [laya.convaiinnovations.com](https://laya.convaiinnovations.com/)

---

## Grown-up names (tiny box)

You do not need this to get the story. It is here so the robot talks make sense later.

| Kid word | Grown-up name |
| --- | --- |
| Fast snap vs slow essay | **System 1 / System 2** (Kahneman); TypeSafe’s class is **System One** |
| The model that fills boxes | **Jev** (`jev-1.13.0`, alias `jev-latest`) |
| Cheaper fuel → more engines | **Jevons paradox** |
| The facts you send | **`state`** |
| The map of judgments | **`questions`** |
| Yes/no probability | **Noul** |
| One label from a list | **Choice** |
| Spot on an ordered rubric | **Score** |
| All questions at once | **parallel sampler** / one-pass |
| “90% means ~90% over many guesses” | **calibration** |
| Train for honest probabilities | **RLCD** (Reinforcement Learning for Calibrated Decisions) |
| Train for chat people like | **RLHF** |
| System One first, code next, LLM last | **cascade** |
| Cannot leave the listed boxes | **schema / type-safe outputs** |
| Still a bad pick | **decision error** (not a type error) |
| The other house with the same stamps | **Laya** (Convai Innovations) |
| Restaurant door vs kitchen kit | **hosted API** vs **open weights** (Apache 2.0) |
| Encoder Laya published | **ModernBERT-large** / **mmBERT-base** |
| Reader kid vs writer kid | **encoder** vs **generative / decoder** LLM (behavior picture, not Jev’s internals) |
| Labels in the call, not baked in | **request-time criteria** vs a **frozen fine-tuned classifier** |
| Labels-at-call-time also exists here | **NLI zero-shot** (fair caveat; not Jev) |
| None sees another’s answer | **independent questions**; a chain is a **second request** |
| Score can sit between rungs | **probability-weighted score** (not hours) |
| Noul 0.95 on “did they ask?” | **P(yes they asked)**, not “refund approved” |
| How bunched the Choice/Score pile is | **confidence** (not a second proven accuracy) |

---

## Say this back

**Send state plus named questions. Get numbers your `if` can read. One ticket can feed many independent boxes — none peeks. Start with code when you can calculate. Use Jev or Laya to pick, rate, or check. Keep the chat model for the letter. Jev is the restaurant. Laya is the kitchen kit.**
