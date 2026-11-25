# The Pursuit of Lifelong Learning

The pursuit of lifelong learning is one of the most valuable mindsets anyone can have, and it matters even more as
new technology keeps changing the field. This course teaches the foundations of computer science, software
engineering, and AI, so you have the base you need to keep learning on your own.

It's a free, self-paced course that runs in your browser. Every lesson has interactive diagrams, practice problems
with instant feedback, and links to the original course material it draws from.

## Start learning

> [!NOTE]
> This project is still a work in progress.

No install or account needed:

1. Download or clone this repo.
2. Open `index.html` in your browser.

Your progress (XP, streaks, achievements, solved problems) is saved in your browser's local storage, so it stays
on your machine.

## What's in it

The course is split into 17 stages, built from what top university programs have in common (Harvard CS50, MIT,
Stanford, CMU, Berkeley). Each lesson builds on the ones before it.

| Stage | Topic | Status |
|---|---|---|
| 1 | How computers work | 5 lessons |
| 2 | Programming with abstraction | 5 lessons |
| 3 | Data structures and algorithms | 8 lessons |
| 4 | Computer systems | 6 lessons |
| 5 | Operating systems and concurrency | 6 lessons |
| 6 | Networks and the web | Coming soon |
| 7 | Databases | Coming soon |
| 8 | The engineer's toolkit | Coming soon |
| 9 | Software design and architecture | Coming soon |
| 10 | Distributed systems and the cloud | Coming soon |
| 11 | Security | Coming soon |
| 12 | Math for machine learning | Coming soon |
| 13 | Machine learning | Coming soon |
| 14 | Deep learning | Coming soon |
| 15 | Language models | Coming soon |
| 16 | Building with AI | Coming soon |
| 17 | Where AI is heading | Coming soon |

## How it's built

A plain static site with no build step and no dependencies: HTML, CSS, and JavaScript.

- `index.html`: the dashboard and course map.
- `assets/curriculum.js`: the list of stages and lessons.
- `assets/progress.js`: XP, streaks, and achievements.
- `lessons/`: one HTML file per lesson.
- `tests/`: run with `node --test`.

## Found a mistake?

Accuracy matters here. If you find a wrong fact, a broken link, or a bug, please open an issue.

## License

Licensed under [Creative Commons Attribution 4.0](LICENSE) (CC BY 4.0). You may share and adapt anything in this
repo, including for commercial use, as long as you give credit, link to this repo, and note any changes you made.
