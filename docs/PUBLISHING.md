# Publishing an approved post

This public repository is the published site. Drafts live in the private
[`vj-blogs`](https://github.com/vijaykumarjob0701/vj-blogs) repo and must
**never** be synced here as a tree.

Copy only the approved markdown file and the images that belong to it.

## Content model

Published posts live in `_posts/` and use Jekyll filename + front matter
conventions.

**Filename**

```text
_posts/YYYY-MM-DD-short-slug.md
```

Example: `_posts/2026-09-19-lora-eval-checklist.md`

**Front matter**

```yaml
---
title: "A concrete title an engineer can scan"
date: 2026-09-19
tags: [peft, evaluation]
excerpt: "One or two sentences for the home listing. No teaser fluff."
card_image: /assets/images/your-slug/01-figure.gif
---
```

`layout` defaults to `post` from `_config.yml`. You do not need to set it.

**Body**

Write standard GitHub-flavored markdown. Fenced code blocks are styled for
reading. Keep secrets, private URLs, and unfinished asides out of the file
you copy.

**Images**

1. Put figures in `assets/images/<slug>/`.
2. Reference them with the site base path:

```markdown
![Loss curve after rank-8 LoRA]({{ '/assets/images/lora-eval-checklist/loss.png' | relative_url }})
```

Do not copy unused screenshots from the private draft folder.

## Workflow

1. Draft and revise in private `vj-blogs`. Iterate there until the piece is
   actually ready. LinkedIn Pulse migrations can start from that repo's
   `tools/linkedin-to-blog` converter, then follow the same copy-and-fix-paths
   steps below.
2. Run the approval checklist below. If anything fails, keep it private.
3. Copy **only** that markdown file into `_posts/`, renaming to
   `YYYY-MM-DD-slug.md` if needed.
4. Copy **only** the images used by that post into `assets/images/<slug>/`.
5. Fix image paths so they use `relative_url` as above.
6. Preview locally (`bundle exec jekyll serve`) or open a PR and check the
   rendered markdown.
7. Merge to `main`. GitHub Pages rebuilds from the default branch.

Never:

- `git subtree`, rsync, or otherwise mirror the private repo
- Publish `_drafts/`, notes, outlines, or "TODO later" posts
- Commit API keys, cookies, internal hostnames, or customer data
- Paraphrase a private draft into this repo before it is approved

## Approval checklist

A post is approved when you can tick every box:

- [ ] I would put my name on this text as-is, in public
- [ ] The argument is finished; no leftover "fill this in" sections
- [ ] Front matter has a real title, date, tags, and excerpt
- [ ] Commands and code samples were run, or are clearly marked illustrative
- [ ] No secrets, tokens, private URLs, or unpublished credentials
- [ ] No names, metrics, or incidents that should stay internal
- [ ] Images that ship with the post are the only images copied
- [ ] Tone is engineer-to-engineer: specific, useful, not a dump of notes
- [ ] This is a single post (plus its assets), not a folder of related drafts

## Template

A starter file lives at [`docs/post-template.md`](post-template.md). Copy it
into `_posts/` when you are publishing, not while you are still drafting.
