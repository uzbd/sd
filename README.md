# Smart Text Decoder — Maximum Intelligence Edition

A static GitHub Pages app that reconstructs readable English text from dotted, letter-spaced, and mixed input.

## What it understands

| Input | Output |
|---|---|
| `hello.world` | `hello world` |
| `h.e.l.l.o` | `hello` |
| `h.e.l.l.o.w.o.r.l.d` | `hello world` |
| `h o s t` | `host` |
| `h o s t  w o r l d` | `host world` |
| `t.h.i.s.i.s.a.t.e.s.t` | `this is a test` |
| `hello.w.o.r.l.d` | `hello world` |

## Intelligence features

- Detects dotted word boundaries versus dotted individual letters.
- Reconstructs continuous letter sequences using dictionary-based dynamic programming.
- Uses a common-word frequency list to rank likely English word boundaries.
- Supports mixed dotted and space-separated patterns, paragraphs, and line breaks.
- Live decoding, copy, clear, replace, and `.txt` download.
- No text is sent to a server; decoding happens in the visitor's browser.

## Deploy on GitHub Pages

1. Create a new GitHub repository.
2. Upload the complete contents of this folder to the repository root. Include the hidden `.github` folder.
3. Name the default branch `main`.
4. Open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
5. Push a commit or manually run **Build and deploy Smart Text Decoder** from the Actions tab.
6. Wait for the workflow to finish. GitHub will show the published Pages URL in the workflow deployment environment.

The workflow downloads the English dictionary and common-word frequency list during deployment, then packages them with the site. The dictionary files are generated at build time and do not need to be uploaded manually.

## Important limitations

This edition uses a large English word list and frequency-ranked word segmentation; it is not a generative AI language model. Some ambiguous letter strings can have multiple valid readings. Spaced-letter encoding uses one space between letters and two or more spaces between words. English segmentation quality depends on the downloaded word lists.

GitHub Pages serves static files. GitHub Actions builds and deploys the site; it is not an always-running backend server. No API key or paid service is required.
