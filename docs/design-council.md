# Local council: making pyq outstanding and specific to NIT Patna

> **Local council**: these perspectives all come from Claude playing different
> roles, not from different AI vendors. Treat agreement as a shared starting
> point to pressure-test, not as independent confirmation.

Members: 4 (devil's advocate, creative director, student at 1 a.m., simplicity and build cost). Each was blind to the others.

---

## 🗳️ Devil's advocate

**Position.** The real problem isn't dull copy. The repo has **zero PDFs**, and the screenshots use test files. If the redesign gets louder before there's anything to show, a modest site becomes a broken promise and the batch group decides it's dead. So spend the effort on honesty, the empty state, and the path from a forwarded link to a PDF. The hero matters less.

**What will fail**
- **The copy overpromises.** "Study material for every subject" is false today.
- **The campus-lore trap.** Founding year, Ashok Rajpath and the Ganga are all true, but they're decoration. They also make an unofficial site look official, so never use the crest or colours. Hinglish and in-jokes go stale.
- **Features built on data we don't have.** Exam countdowns need exam dates, and a wrong date is a lie. "New" badges based on file modified times break on every deploy.
- **The hero slows phones down.** The full-height hero plus 4:5 cards push semester 5 about three screens down. The 0.9 s fade delays the main paint (LCP). The faint end of the headline gradient is about 2.5–2.9:1, below AA.
- **Search promises codes that don't exist.** Every code in the catalog is empty. The 404 tells phone users to "press /", and phones have no keyboard.
- **Student pages talk to admins.** "Admins can add them from the admin page."
- **Gimmicks to avoid:** PDF thumbnails (they break lazy loading), page flips, scroll-jacking, fuzzy-search libraries, 3D tilt.

**Instead: an honest shelf that each batch fills**
- Eyebrow: "Unofficial · by NIT Patna CSE students"
- Title: "Last year's paper, before this year's exam."
- Counts like "6 subjects, 2 with files". Subjects with files come first.
- Empty-state CTA: **Send a paper** (a prefilled GitHub issue or a mailto).
- Copy-link on every paper row, using the `:target` deep link.
- Use one accent colour, only to show "has files" vs "empty", and always with a text label.

**Risks.** Leading with honesty may read as "empty site". A GitHub account is a barrier for contributors. Assumes WhatsApp is how links spread.

**Confidence.** High on the failures, medium on the copy.

---

## 🗳️ Creative director

**Position.** Build the site around the exam paper itself. The site should feel like the senior's photocopy you get the night before: handed down, in blue ballpoint, on ruled paper. The voice is a kind, dry senior. Spend the boldness on one line and one ink colour.

**Key points**
- **Concept: "Handed down."** People who add a paper are "handing one down". Empty slots are "left blank".
- **Hero.**
  - Eyebrow: `NIT Patna · CSE · Sem 1–8`
  - Headline: **"Last year's paper is this year's syllabus."** Fallback: "Your seniors already sat this exam."
  - CTA: `Pick your sem`
- **Copy.**
  - Empty subject: **"Left blank."** with a `Hand one down` button.
  - 404: **"Out of syllabus."**
  - Search placeholder: "DBMS, OS, DAA…"
  - Footer (checked against nitp.ac.in): "Run by students on the south bank of the Ganga, behind Gandhi Ghat. NIT Patna, est. 1886."
- **Palette: one accent, ballpoint blue.**
  - Light: ink `#2340C4`, grid `#E6EAF5`.
  - Dark: ink `#8EA2FF`, grid `#1A2030`.
  - The horizon arc becomes an ink bleed.
- **Signature 1: OMR coverage sheet.**
  - A bubble grid on each subject: years × Mid/End, plus a Supp row only if one exists.
  - A filled bubble links to that paper. A hollow bubble opens a prefilled "send it" issue.
  - Server-rendered, no JS. A mini version sits on the semester rows.
- **Signature 2.** A ballpoint underline that draws itself once (CSS `stroke-dashoffset`).

**Risks.** The headline is a student in-joke that could read as cynical. A hollow bubble could suggest an exam that never happened. At launch nearly every bubble is hollow. hero-1 hard-codes `#fff`/`#000`.

**Confidence.** Medium.

---

## 🗳️ Student at 1 a.m.

**Position.** pyq should be the link people forward in the class WhatsApp group the night before an exam. It beats a Drive folder in three ways: the right PDF in the fewest taps, plain honesty about what is missing, and remembering you on this device. Concept line: **"Your seniors already sat this paper."**

**Key points**
- **Hero CTA.** It becomes "Back to Semester 4" on a return visit. Cap the hero's height on phones.
- **Honest counts.** "Papers for {n} of 29 subjects so far." Replace "Coming soon", which is a promise. Use short tiles on mobile.
- **Semester page.** Subjects with material come first, with a year range. Collapse the empty ones into one quiet line.
- **Subject page.**
  - Name downloads `DAA-2024-endsem.pdf`, not `2024-endsem (3).pdf`.
  - `:target` highlight for shared deep links.
  - On mobile, a big Open button with Share as a secondary action.
- **Search bug (confirmed in code).** The key has no slug and no exam id, so "dbms", "daa", "endsem" and "midsem" match nothing. Add the slug, the exam and short forms. Placeholder: `Try "daa endsem" or "os 2023"`.
- **404.** "This link has gone stale." Button: `Search for it`.
- **Dark mode.** Dim the horizon. Today it fades to `#ffffff`, a white flare at 1 a.m.
- **Signature 1: Share to group.** `navigator.share` with ready-made text, falling back to copying the link. Add honest OG text per subject.
- **Signature 2: Where you left off.** localStorage remembers your semester and the last 3 papers you opened, and tags rows you've already opened.

**Risks.** The headline only holds if every PDF is real. There is no real channel for contributions. WhatsApp's built-in browser may not keep localStorage.

**Confidence.** Medium-high.

---

## 🗳️ Simplicity and build cost

**Position.** The cheapest way to stand out is the exam-hall vernacular: answer-sheet lines, blue ballpoint and roll-number boxes. All of it is copy, CSS and server markup from data `loadContent()` already returns. No new dependencies, no client JS.

**Key points (ranked by distinctiveness per line of code)**
1. **Copy (0 bytes).**
   - Title: **"The paper before the paper."**
   - Eyebrow: "NIT Patna · CSE · behind Gandhi Ghat" (verified on nitp.ac.in).
   - Empty states ask for papers.
   - Remove the duplicate "Choose your semester" heading.
2. **Answer-sheet theme (about 15 CSS lines).**
   - Ruled lines, a ballpoint-blue primary, and the hero's hex colours moved into tokens.
   - `ui-monospace` for codes and years, not a second web font.
3. **Roll-number semester boxes in the hero's CTA slot (about 15 lines, 0 JS).** Semesters land on the first phone screen. Shorten the hero on phones.
4. **Signature 1: Paper ledger (about 40 lines, 0 JS).**
   - Last 5 years × midsem/endsem, filled vs dashed, built from the real `items`.
   - Squares link to papers or to prefilled issues.
   - Screen-reader summary, such as "2 of 10 papers since 2022".
5. **Signature 2: Digit morph via React 19.3 `<ViewTransition>` (about 8 lines).**
6. **`app/manifest.ts`** for add-to-home-screen. No service worker, because replaced PDFs keep their path.
7. **Remove `"use client"` from hero-1.**

**Reject:** Framer Motion or GSAP, canvas heroes, PDF.js thumbnails, a second font, visitor counts, exam countdowns.

**Risks.** The ledger's year window is fixed at build time. "Not here yet", never "missing". Answer-sheet styling can tip into kitsch. Keep the fade short for LCP.

**Confidence.** High on cost and speed, medium on whether it looks outstanding rather than cute.

---

## Synthesis

**Shared starting points.** These are a common prior to stress-test, not proof.
- All four want the identity to come from **exam-hall vocabulary and true counts**, not campus trivia or decoration.
- All four treat **honest emptiness as a feature**: it should show what's missing and ask for it.
- All four want the **semester picker on the first phone screen**.
- They might share a blind spot here. Two members proposed going back to ruled paper and red/blue ink. Harsh *already had* an answer-sheet design (cream paper, red margin, serif) and chose to replace it with this hero. None of them knew that.

**Genuine tensions**
- *Delight vs. honesty.* The creative director wants a witty headline. The devil's advocate warns that any bold promise collides with zero PDFs. Resolution: a headline that makes no claim about quantity ("The paper before the paper."), with honest counts right underneath.
- *Remembering the student vs. no-JS purity.* The student lens wants localStorage memory. The simplicity lens wants zero client JS. Resolution: one small client island with safe fallbacks. It's the only state in the site.
- *Look.* Answer-sheet revival vs. keeping the supplied hero. Resolution: keep the hero's skeleton and monochrome, and add **one ink-blue accent**. It tints the grid like quad-ruled paper and turns the horizon into an ink bleed. No cream paper, no red margin, no serif.

**Blind spots**
- A **real search bug**, confirmed in code by the student lens and flagged by the devil's advocate. The other two would have shipped it.
- **Contrast.** Measured: the headline's faint end is 2.83:1 in light mode, which fails. Fix: raise it to /55, giving 4.64:1.
- **Contribution channel.** Every member wants a "send a paper" path, and none can choose it; that's Harsh's call. Default: a prefilled GitHub issue. A Google Form or email would reach non-coders better.
- **Launch state.** At launch every bubble is hollow. No member designed for the site being 100% empty, which is its state today. The OMR sheet has to look intentional when it's completely blank.
- **Accuracy limits.** Download filenames collide in the Downloads folder. A year window can suggest exams that never happened, so label them "not uploaded yet".

**Suggested direction** ("Handed down")
- **Hero.**
  - Headline: **"The paper before the paper."** (simplicity lens; the devil's lens would accept it, since it promises no quantity)
  - Subtitle in the senior's voice: "Your seniors already sat it." (student lens)
  - The CTA slot becomes **eight roll-number boxes** (simplicity + student), with an honest coverage line under them (devil + student).
  - Eyebrow: "Unofficial, made by NIT Patna students" (devil).
  - Footer uses the verified Ganga / Gandhi Ghat location (creative + simplicity both checked it on nitp.ac.in).
- **Signature 1: OMR coverage sheet.** Two members proposed it independently. Filled bubbles link to papers; hollow bubbles say "hand one down". Server-rendered.
- **Signature 2: Share to your group**, plus deep links that land on the highlighted paper (student + devil).
- **Small and real.** Remember the last subject opened, fix search, name downloads per subject, shorter hero and tiles on phones, and the copy set "Left blank" / "Out of syllabus" (creative).
- **Deferred.** View-transition digit morph, manifest, and the self-drawing underline. Each is nice, and none is needed for "outstanding".
- **Remaining uncertainty.** Whether "The paper before the paper." lands with real students. Test it in one class group.
