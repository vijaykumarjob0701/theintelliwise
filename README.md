# vj-blog

Public GitHub Pages site for **approved** technical posts on
**Path Future**, written by
[Vijay Kumar](https://github.com/vijaykumarjob0701) (Dublin).

Live URL after Pages is enabled:

**https://vijaykumarjob0701.github.io/vj-blog/**

This repository is the public shelf. It starts with **zero** posts on
purpose. Drafts, outlines, and rough notes stay in the private
[`vj-blogs`](https://github.com/vijaykumarjob0701/vj-blogs) repo and must
not be cloned, pulled, or synced into this tree.

## Stack

[Jekyll](https://jekyllrb.com/) using the
[GitHub Pages](https://pages.github.com/versions/) dependency set
(`github-pages` gem 232 / Jekyll 3.10). No custom plugins, no extra build
pipeline.

Project-pages `baseurl` is `/vj-blog`. Layouts use `relative_url` /
`absolute_url` so assets resolve on
`https://vijaykumarjob0701.github.io/vj-blog/`.

## Enable GitHub Pages

An admin has to flip this in the GitHub UI. An agent cannot do it.

1. Open [github.com/vijaykumarjob0701/vj-blog](https://github.com/vijaykumarjob0701/vj-blog).
2. **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Branch: **`main`**. Folder: **`/` (root)**.
5. Click **Save**.
6. Wait for the Pages build (Actions tab, or the Pages settings status).
7. Confirm **https://vijaykumarjob0701.github.io/vj-blog/** loads the empty
   home page, and `/vj-blog/about/` loads About.

If the site 404s after a green build, the usual cause is a missing
`baseurl` on a hard-coded `/` asset path. All theme links already go
through Liquid URL filters.

Optional later: switch Source to **GitHub Actions** only if you outgrow
the default Jekyll builder. You do not need that for this scaffold.

## Local preview

Ruby 3.x and Bundler:

```bash
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000/vj-blog/ — keep the `/vj-blog` prefix so paths
match production.

```bash
bundle exec jekyll build
```

writes the site to `_site/` (gitignored).

## Comments (Giscus)

Post pages load [Giscus](https://giscus.app/) so readers can leave comments
and reactions through GitHub Discussions (`Announcements` category,
mapped by pathname).

Discussions are already enabled on this repo. If the comment widget is
blank or shows a configuration error, an admin still needs to install
the [giscus GitHub App](https://github.com/apps/giscus) on
`vijaykumarjob0701/vj-blog` and grant it access to Discussions.

## Publish workflow (private → public)

Full checklist: [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

Short version:

1. Draft and improve in private `vj-blogs`.
2. When a post is **approved**, copy **only** that markdown file into
   `_posts/YYYY-MM-DD-slug.md`.
3. Copy **only** the images used by that post into
   `assets/images/<slug>/`.
4. Never sync the whole private tree. No drafts, no notes, no "maybe later"
   files.

## Repository layout

```text
_config.yml          Site title (Path Future), author, baseurl
_layouts/            Home, post, page, default
_includes/           Head, header, footer, giscus, author links
_posts/              Approved posts only
assets/css/          Site styles
assets/images/       Per-post figures
about.md             Author page
docs/PUBLISHING.md   Private → public approval workflow
docs/post-template.md  Front-matter template for a new public post
```

## License

[MIT](LICENSE).
