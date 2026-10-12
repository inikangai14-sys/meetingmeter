# meetingmeter

**Every meeting has a price tag.** A real-time meeting cost calculator that
shows exactly how much money your meeting is burning — per second.

![live demo](https://img.shields.io/badge/demo-live-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)
![static](https://img.shields.io/badge/100%25-static-orange)

## The problem

Meetings feel free. They aren't. A one-hour sync with eight people at a
fully-loaded cost of $75/hr burns **$600** — and nobody in the room sees the
meter running. "This could have been an email" is a joke because the price
tag is invisible.

## The fix

meetingmeter puts the price tag on screen:

- **Real-time cost ticker** — watch the dollars (or rupiah, euro, yen…)
  evaporate, updated 4× per second with zero timer drift
- **Burn rate** — cost per minute, always visible
- **10 currencies** with proper locale formatting via `Intl.NumberFormat`
- **Damage report** — pause and get a shareable summary, including the
  coffee-cup equivalent
- **Share it** — native Web Share API with clipboard fallback, so the
  receipt can shame the group chat
- **100% client-side** — no backend, no tracking, no data leaves the browser;
  settings persist in `localStorage`

## Live demo

https://inikangai14-sys.github.io/meetingmeter/

## Run it locally

No build step. No dependencies. Just open the file:

```bash
# clone and open
git clone https://github.com/inikangai14-sys/meetingmeter.git
cd meetingmeter
open index.html        # or: python3 -m http.server 8000
```

## Tech

Vanilla HTML, CSS, and JavaScript. No frameworks, no bundler — deliberately,
so the whole app fits in three files and runs anywhere, including straight
off GitHub Pages.

## License

MIT — see [LICENSE](LICENSE).
