---
title: "Why LLMs Forget Everything — and How We Give Them Memory"
date: 2026-03-29 10:00:00 +0100
tags: [llm, memory, rag, agents]
excerpt: "A base LLM does not remember past chats. Memory is engineering: keep useful facts, drop noise, store them, and send only what the model needs."
card_image: /assets/images/why-llms-forget-memory/01.png
---

![Why LLMs Forget Everything — and How We Give Them Memory]({{ '/assets/images/why-llms-forget-memory/01.png' | relative_url }})

A base LLM does not remember your last chat. That surprises people when they first build a GenAI app.

Memory is not a magic feature of the model. It is normal engineering. Keep the useful parts. Drop the noise. Store the right facts. Send only what the model needs, when it needs it.

### 1) The core bug: LLMs have zero memory

A base LLM is stateless. It answers from the current input and its fixed weights.

So if you say “My name is Vijay” and then ask “What is my name?”, the model will not know — unless your app sends the earlier message back.

![A base LLM is stateless unless the app resends prior context]({{ '/assets/images/why-llms-forget-memory/02.png' | relative_url }})

**Takeaway:** The model does not remember. Your app has to give it memory.

### 2) V1 memory: short-term memory (STM) using the context window

The first fix is simple. Keep the chat history in the prompt. You send the last user message, the last assistant reply, and the new question together.

This works, but only inside one thread, and only until the context window fills up.

![Short-term memory is chat history stuffed back into the prompt]({{ '/assets/images/why-llms-forget-memory/03.png' | relative_url }})

**Takeaway:** Short-term memory is useful. It is still not real persistence.

### 3) Why STM breaks in production

Thread-scoped memory is fragile. A new chat, a server restart, or a different session can wipe it.

For long tasks, users have to repeat themselves. That gets old quickly.

![A new chat or restart can wipe thread-scoped memory]({{ '/assets/images/why-llms-forget-memory/04.png' | relative_url }})

**Takeaway:** Session memory is not enough for real users.

### 4) Fixing the context window crash

You cannot keep stuffing every old message into the prompt.

A better pattern is trim plus summarise:

- keep the latest messages as-is
- compress older turns into a short summary
- stay inside the token limit

![Trim recent turns and summarise older ones]({{ '/assets/images/why-llms-forget-memory/05.png' | relative_url }})

**Takeaway:** Trim and summarise, or the context window will overflow.

### 5) V2 memory: long-term memory (LTM)

Real memory needs persistence. Long-term memory lives outside the chat thread, usually in a database.

It survives new sessions, server restarts, and days or weeks between chats.

![Long-term memory lives in a store outside the thread]({{ '/assets/images/why-llms-forget-memory/06.png' | relative_url }})

**Takeaway:** Persistent storage is the base of real long-term memory.

### 6) Not all memory is the same

Episodic, semantic, and procedural memory are not the same store.

- **Episodic** stores past events.
- **Semantic** stores stable facts.
- **Procedural** stores how the user likes work to be done.

![Semantic, episodic, and procedural memory hold different things]({{ '/assets/images/why-llms-forget-memory/07.png' | relative_url }})

**Takeaway:** Semantic, episodic, and procedural memory solve different problems.

### 7) The 4-step memory pipeline

A real memory system has four steps: create, store, retrieve, and inject.

1. Extract useful facts from noisy chat.
2. Save them safely.
3. Later fetch only what matters.
4. Inject those facts back into the prompt.

![Create, store, retrieve, then inject into the prompt]({{ '/assets/images/why-llms-forget-memory/08.png' | relative_url }})

**Takeaway:** A pipeline is better than one-off hacks.

### 8) Create and store: filter the noise

Human chat is messy. Most of it is small talk, typos, and filler.

If you store everything, the database fills with junk. Extract selectively: keep stable facts, add metadata, and write them to durable storage.

![Extract stable facts instead of storing the whole chat]({{ '/assets/images/why-llms-forget-memory/09.png' | relative_url }})

**Takeaway:** Do not store noise. Store stable facts.

If you put garbage in, you get garbage memory.

### 9) Retrieve and inject: make memory usable

An LTM database is not wired into the model by itself.

Your app retrieves the relevant facts, mixes them with the current short-term context, and sends a flat text prompt. That is how long-term memory shows up in the next reply.

![Retrieve facts, mix with short-term context, send one prompt]({{ '/assets/images/why-llms-forget-memory/10.png' | relative_url }})

**Takeaway:** Retrieval is what makes stored memory useful in the current turn.

### 10) Production: do not build everything from scratch

In production, the hard part is orchestration. You need DB connections, async jobs, vector search, context control, and safe retrieval.

For many teams, managed tools like LangMem, Memo, or SuperMemory are the faster path. Ship the product. Let the memory layer handle the messy plumbing.

![Managed memory layers can cover the production plumbing]({{ '/assets/images/why-llms-forget-memory/11.png' | relative_url }})

**Takeaway:** A managed memory layer is often the fastest way to production.

Without memory, an LLM is a smart function that starts from zero every call. If you want a real product, memory is part of the design. Start simple. Be picky about what you store. The gap between a demo and a product is often this layer.
