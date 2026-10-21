# Free-text interaction design in games and consumer products: how they get users to write, keep them writing, and answer back

> Researched 13 Oct 2026 for the JobQuest "Get to know me" flow (steps K1, K2, K3, AI follow-up, result screen). Builds on `research/research_notes/Hồ sơ người chơi JobQuest/games_products_zodiac.md`; Spotify Wrapped, Hinge, Duolingo and the Rosebud marketing page are not repeated here.
>
> **Verification key** (after every source):
> **[F]** = full text or full page opened and read in this session. Three papers were read page by page as PDFs (Mateas & Stern 2004; Mehta et al. 2007; Revilla & Couper 2026, pp. 19–27). Web pages were read through a fetch tool that returns an extraction of the page, so wording from web pages is paraphrased here, not quoted.
> **[A]** = abstract only.
> **[S]** = secondary source. **[S-snippet]** = only a search-result summary was seen because the page refused access or was not opened; re-check before it goes into the report. Encyclopedia, marketing, app-store and fan pages are labelled as such.
> Numbers appear only where I read them in the source named on that line. Almost everything is paraphrase; direct quotation is kept to one short line.
> Pages that refused access: help.aidungeon.io (403), Latitude's Notion help mirror (empty), pmc.ncbi.nlm.nih.gov (bot check; arXiv copy used instead), the SAGE mirror of the 2026 sentence-completion review (bot check), metatoc.com (timeout), help.steampowered.com (connection reset).

---

## 1. Free-text games and AI story products

### Takeaway
Every product that started with a bare text box moved away from it: Façade maps anything the player types onto a small set of intentions and never answers "I don't understand"; AI Dungeon wraps the input in a mode (Do / Say / Story) and lets the player undo or retry; Hidden Door found that players freeze and added three suggested actions per turn. The best-documented lesson on responding is from Façade's player study: a wrong reading is tolerated when the reply still fits the scene, but a reply that restates a shallow or reversed reading of what the player said breaks the experience.

### Cited Findings

**Comparison table** (details and sources below)

| Product | What the player types | Input scaffold | How it answers | Known problems |
|---|---|---|---|---|
| Façade (2005) | Unrestricted typed speech to two characters, in real time | None on screen; the dramatic situation steers wording; ~800 hand-written rules reduce any input to a small set of discourse acts | Characters react in voice; deflect and move on when nothing better fits | Shallow or reversed readings; fast pacing; players testing the parser |
| AI Dungeon (2019–) | Actions, speech or narration in a co-written story | Four input modes; setting picker at start; undo / redo; a "remember" memory field | The model continues the story | Repetitive output if one mode is overused; 2021 moderation crisis |
| Hidden Door (early access 2025) | What the character does next, inside a licensed story world | Three suggested actions, more on request; free typing still allowed; scene objective | A narrator character; a game engine, not the model, decides outcomes | Writer's block with a bare box; licensed-world content limits |
| Event[0] (2016) | Typed chat to a ship computer | None described in the source read | Lines assembled procedurally; the player's attitude affects the ending | Not covered in the source read |
| Character.AI (2022–) | Open-ended chat with characters | (not verified this session) | Open-ended replies with follow-up questions | Minors' safety: open-ended chat withdrawn for under-18s |

**Façade (Mateas & Stern)**
- The player types unrestricted natural language to the married couple Grace and Trip in a real-time first-person drama. The language system deliberately works on what an utterance does (its pragmatic effect), not its syntax or literal meaning, using broad, shallow, author-intensive techniques for one narrow dramatic situation. — [Mateas & Stern, "Natural Language Understanding in Façade: Surface-text Processing", TIDSE 2004, LNCS 3105 (PDF mirror)](https://www.cp.eng.chula.ac.th/~vishnu/gameResearch/story_november_2005/MateasSternTIDSE04.pdf) [F]
- Processing has two phases: phase 1 maps the typed text to one or more discourse acts; phase 2 chooses the characters' reaction given the current story beat. The paper's Table 1 lists the acts (agree, disagree, positive and negative exclamation, express emotion, unsure, thank, greet, ally, oppose, don't understand, apologise, praise, criticise at two levels, flirt, pacify, explain, advise, refer to an object, ask a character to open up, goodbye, inappropriate, miscellaneous, and a catch-all for input the system cannot understand); I count 24 rows. The authors call this a strong many-to-few mapping that ignores tone and most literal meaning. — [same paper](https://www.cp.eng.chula.ac.th/~vishnu/gameResearch/story_november_2005/MateasSternTIDSE04.pdf) [F]
- Scale: about 800 template rules compiling to about 6,800 Jess rules, firing in 300 ms or less on a 2 GHz machine; about 9,000 idiomatic phrases were examined and about 1,000 kept and categorised by discourse act. — [same paper, sections 5 and 8](https://www.cp.eng.chula.ac.th/~vishnu/gameResearch/story_november_2005/MateasSternTIDSE04.pdf) [F]
- Stated design choice: the rules lean toward being too permissive, because it is more interesting for the characters to get some meaning out of a broad range of inputs than to respond well to a narrow range and answer the rest with a form of "huh?". The rules are not built to withstand players who deliberately type absurd sentences. The authors report that the dramatic context does guide players toward language that fits the situation. — [same paper, sections 6 and 8](https://www.cp.eng.chula.ac.th/~vishnu/gameResearch/story_november_2005/MateasSternTIDSE04.pdf) [F]
- Player study: 12 participants (aged 18–33, mean 25.8), each playing three interface versions, with 13 hours of retrospective interviews matched against the system logs. Phase 1 produced the right discourse act 73% of the time, a wrong act 9%, nothing 7%, conflicting acts 3%, and failed on typing issues (misspellings, splitting one thought over several turns) 5%. — [Mehta, Dow, Mateas & MacIntyre, "Evaluating a Conversation-Centered Interactive Drama", AAMAS 2007](https://www.ifaamas.org/Proceedings/aamas07/html/pdf/AAMAS07_0464_d2a87474872bb6c315649be862b44b8c.pdf) [F]
- What rescued failures: players invented back-stories to explain odd character reactions, so a technical failure often was not experienced as a breakdown. The "deflect" replies (a character acknowledges the player said something and carries on) and the "push too far" replies (a character reacts badly when the player harps on one topic) were read as part of the story. Believable character performance kept players engaged even when they knew they had been misunderstood. — [same paper, sections 5.2.1, 5.2.6 and 6](https://www.ifaamas.org/Proceedings/aamas07/html/pdf/AAMAS07_0464_d2a87474872bb6c315649be862b44b8c.pdf) [F]
- What hurt: (a) replies that spoke the system's shallow reading back to the player (e.g. the player's specific remark answered as a nearby but different concept) exposed the limits of understanding; the authors call this a counter-intuitive result, because task-oriented dialogue systems normally confirm what they understood. (b) Reversed meanings, where the system reacted to the opposite of what was meant, drew the strongest negative reactions; failing to understand at all produced much smaller perceived breaks, so the authors suggest ignoring a conflicting input instead of guessing. (c) Pacing: some players felt the conversation ran away before they could finish typing. (d) Addressee confusion occurred in only 1% of turns but caused large breaks. — [same paper, sections 5.2.2–5.2.5](https://www.ifaamas.org/Proceedings/aamas07/html/pdf/AAMAS07_0464_d2a87474872bb6c315649be862b44b8c.pdf) [F]

**AI Dungeon (Latitude)**
- Four input methods: Do (an action, must be followed by a verb), Say (dialogue), Story (narration that advances the plot or tells the AI something to remember) and See (generates an image, no gameplay effect). Players first choose a setting (fantasy, mystery, cyberpunk and others); they can undo or redo recent events and tell the AI what to remember. — [Wikipedia, "AI Dungeon"](https://en.wikipedia.org/wiki/AI_Dungeon) [F, encyclopedia]
- How the modes rewrite input: Do puts "You" in front of the text and converts first-person words outside quotation marks to second person; Say adds a speech tag and wraps the text in quotation marks. The help pages advise mixing Do, Say and Story because using only Do and Say makes the model produce repetitive sentences beginning with "You". — [AI Dungeon help, "Do mode" / "Say mode" / "How to play"](https://help.aidungeon.io/faq/do-mode) [S-snippet; official help page returned 403]
- History and scale: first version March 2019 at a hackathon by Nick Walton, on an early GPT-2 model; about 2,000 players in the first month; over 100,000 players within a week of the December 2019 relaunch; 1.5 million players by June 2020. — [Wikipedia, "AI Dungeon"](https://en.wikipedia.org/wiki/AI_Dungeon) [F, encyclopedia]
- Moderation: in April 2021 a filter was added against sexual content involving minors; it produced false positives (a laptop's age read as a child's age), human moderators read private stories, and the result was controversy and review bombing, with users citing the false positives and poor communication. — [Wikipedia, "AI Dungeon"](https://en.wikipedia.org/wiki/AI_Dungeon) [F, encyclopedia]

**Hidden Door**
- Interview with the founders (20 Oct 2025): the first version was a plain box asking the player to type what the character does; players got writer's block, worried about spelling and did not know how to respond. The current design shows three suggested ideas per turn, with more on request; roughly a third advance the plot, a third add mischief and a third draw on the character's history. A bare text box is compared to being pushed on stage at an improv show. Each scene (about five to eight minutes) has a challenge and an objective, with a fixed start and a set range of endings; players choose how to get through it but cannot reroute the whole story. The system checks that what the player attempts makes sense in context. On control, Hilary Mason says: "The LLM does not get to decide what happens." Content limits are set per world by the licensing partner. — [AI Gamechangers, interview with Hilary Mason and Matt Brandwein, 20 Oct 2025](https://aigamechangers.substack.com/p/the-machine-is-not-itself-creative) [F]
- Playtest lessons from the same interview: Pride and Prejudice players asked for stricter period rules, so decorum and dances were added; in The Crow the language model refused to let player characters be killed, so the team built content controls at platform and world level. — [same interview](https://aigamechangers.substack.com/p/the-machine-is-not-itself-creative) [F]
- Early-access announcement (13 Aug 2025): players choose a world, create characters and play stories; worlds are made of collectible cards that change with the player's choices. The page does not describe turn mechanics. — [Hidden Door blog, "Introducing Early Access"](https://www.hiddendoor.co/blog/early-access) [F, company page]

**Event[0] (Ocelot Society, released 14 Sep 2016)**
- The player communicates with the ship's AI, Kaizen-85, by typing at terminals instead of choosing from options; the AI can procedurally produce over two million lines of dialogue; its personality is influenced by the player's input and the player's attitude toward it affects which ending occurs. Began as a 2013 graduate project at Enjmin; Metacritic 75/100; the usual criticism was the roughly three-hour length. — [Wikipedia, "Event\[0\]"](https://en.wikipedia.org/wiki/Event_0) [F, encyclopedia]

**Character.AI**
- On 29 Oct 2025 the company said it would remove open-ended chat for users under 18, phased from a two-hour daily cap down to zero by 25 Nov 2025, and steer teens toward creating stories, videos and scenes ("from conversation to creation" is the article's summary). The article describes open-ended chat as the back-and-forth in which the bot answers with follow-up questions, which experts say is designed to keep users engaged. Context given: lawsuits after at least two teenagers died by suicide following prolonged chatbot conversations, an FTC inquiry and proposed legislation. Age assurance combines behavioural signals, a third-party tool and, as a fallback, facial recognition and ID checks. — [TechCrunch, Rebecca Bellan, article on Character.AI ending open-ended chat for minors, 29 Oct 2025 (exact headline not recorded)](https://techcrunch.com/2025/10/29/character-ai-is-killing-the-chatbot-experience-for-minors/) [F, press]

### Inferences
- **A frame around the text box does most of the work.** Façade's frame is a dramatic situation, AI Dungeon's is a mode that turns a fragment into a well-formed story sentence, Hidden Door's is a scene objective plus three ideas. None relies on an empty box and a generic invitation. For Get to know me this supports "choose, then tell" (K2) and question-specific cues over a bare "tell us about yourself".
- **Suggested actions solve freezing but must not become the answer.** Hidden Door's three ideas are story moves in a fiction. In a self-description, an idea that contains content is a leading example (see section 5), so the transferable part is the mechanic (few, optional, more on request), not content suggestions.
- **Never answer "I don't understand"; do not paraphrase the user back either.** Façade's two results point the same way for the AI follow-up: accept almost anything, and when the reading is uncertain say less. A follow-up such as "so you prefer working alone?" is exactly the shallow restatement that players punished; a neutral request for one more detail is the equivalent of Façade's deflect.
- **An opposite reading is worse than no reading.** If the model is unsure what a K1 answer shows, the result screen should leave that line out. This matches the earlier report's rule that "not enough data" is a valid output.
- **Open-ended follow-up loops are the specific thing the industry is retreating from for minors.** A bounded exchange (at most one follow-up per question, a visible end) is structurally different from companion chat and should be described that way in the capstone report.
- **Retry / undo lowers the cost of a bad first attempt.** AI Dungeon's undo and edit let players write something imperfect and fix it; the equivalent here is letting the player edit an answer from the result screen.

### Gaps
- AI Dungeon's own help pages could not be opened (403); mode behaviour is from search summaries of those pages plus Wikipedia. Retry / Continue / Edit / Erase were not verified from a primary page. No Latitude design blog or talk on input scaffolding was read; the company's later moderation approach was not verified.
- Event[0]: no developer interview or post-mortem was opened; how the game handles misunderstood input, and any criticism of its typing interface, is not in the source read.
- Character.AI: reply features (regenerate / swipe, edit) and the company's own blog post were not opened; the outcome of the November 2025 rollout was not checked.
- No GDC Vault talk was opened. No other 2023–2026 LLM-driven game (e.g. Suck Up!, Inworld-based titles, Infinite Craft) was verified this session.
- No source measured blank-page drop-off in a game; Hidden Door's writer's-block observation is the founders' account, without numbers.

---

## 2. AI journaling and reflection apps

### Takeaway
Journaling apps prompt with a small fixed set of daily questions (Rosebud: three per evening), then an optional AI follow-up based on what was just written; several offer suggested starter questions and templates. Published evidence that AI follow-up questions improve reflection is thin: small exploratory studies (19 and 20 participants) without control groups, and no company outcome data was found.

### Cited Findings
- Rosebud: each evening the app asks three questions based on the rose / bud / thorn framework (highlight, growth area, challenge), then the AI asks follow-up questions specific to what the user wrote. A separate "Ask Rosebud" feature answers questions from past entries and offers suggested questions for users unsure what to ask. — [Rosebud old home page](https://www.rosebud.app/old-home); [Rosebud help, "Ask Rosebud"](https://help.rosebud.app/tools-for-growth/ask-rosebud) [both S-snippet, vendor pages]
- Day One: templates for repeated entry formats, plus Daily Prompts from a curated database that rotates every 24 hours, with optional prompt reminders. — [Day One blog](https://dayoneapp.com/blog/day-one-journaling-tips/); [App Store listing](https://apps.apple.com/us/app/day-one/id1055511498) [S-snippet, vendor and store pages]
- Stoic: morning preparation and evening reflection routines, guided journals and prompts, templates (therapy preparation, thought records), voice notes as an alternative to typing. — [App Store listing, "stoic. journal & mental health"](https://apple.co/stoic) [S-snippet, store page]
- Reflectly: asks personalised questions based on diary entries; a magazine review notes that some answer fields are limited in length. — [App Store listing](https://apps.apple.com/app/id1241229134); [Food & Nutrition Magazine review](https://foodandnutrition.org/from-the-magazine/reflectly/) [S-snippet]
- ExploreSelf (CHI 2025): an LLM app for writing about personal challenges that generates questions adaptively while letting the user steer which themes to explore. Exploratory study, 19 participants; participants valued being able to navigate the guidance freely, and the authors argue for user-directed exploration over fixed system-led question sequences. The abstract notes that people often drop writing interventions because organising thoughts and feelings is hard. — [Song et al., "ExploreSelf", arXiv 2409.09662](https://arxiv.org/abs/2409.09662) [A]
- MindScape (2024): journaling prompts generated by an LLM from phone-sensed context; 8 weeks, 20 college students, exploratory. The abstract reports +7% positive affect, −11% negative affect, −6% loneliness, +7% mindfulness and +6% self-reflection. No control group is described. — [Nepal et al., "MindScape Study", DOI 10.1145/3699761 (arXiv 2409.09570)](https://arxiv.org/abs/2409.09570v1) [S-snippet of abstract]
- MindfulDiary (CHI 2024): an LLM asks prompt questions in conversation to help psychiatric patients journal daily and produces summaries for clinicians. — [Kim et al., DOI 10.1145/3613904.3642937 (arXiv 2310.05231)](https://arxiv.org/html/2310.05231v2) [S-snippet]

### Inferences
- The common shape is **few fixed prompts, then one personalised follow-up, then stop**, which is the shape already proposed for K1–K3. The apps do not open with an AI-generated question; the first prompt is always authored.
- ExploreSelf's finding (user control over which question to answer) suggests the follow-up should be something the player opens or skips, not something that blocks progress.
- Typical entry length is not published by any of these apps; the limited answer fields noted for Reflectly suggest short entries are the design norm, consistent with "1–3 sentences is enough".
- None of this is evidence about adolescents or about a one-off onboarding; journaling apps rely on a daily habit that Get to know me does not have.

### Gaps
- None of the vendor help centres was opened in full; all app facts are from search summaries of vendor or store pages and should be checked in the apps before being cited.
- No peer-reviewed controlled comparison of "AI follow-up question" against "no follow-up" in journaling was found. No company-published engagement or outcome data was found for Rosebud, Reflectly, Stoic, Day One or Journey. Journey was not researched.
- Expected entry length and tappable sentence starters inside entries: not verified for any app.

---

## 3. Astrology and personality apps as copywriting references (Co-Star, The Pattern)

### Takeaway
Co-Star's text is assembled by an algorithm from short human-written snippets mapped to planetary positions, in a deliberately blunt, friend-like voice; The Pattern is written largely by its founder in self-help language with astrological terms removed. Press criticism of Co-Star is about harshness more than vagueness; I found no rigorous analysis of either app's text and no direct evidence of harm.

### Cited Findings
- Co-Star uses public NASA JPL data; its algorithm maps human-written snippets of text to planetary movements to produce personalised content. Daily push notifications are noted for an unconventional tone; reviewers' descriptions range from slightly robotic to brutally honest, and the app has been compared to a free therapy session. Founded 17 Oct 2017 by Banu Guler, Anna Kopp and Ben Weitzman; more than 20 million downloads reported as of April 2021. A feature added in July 2023 answers open-ended user questions from the app's database. — [Wikipedia, "Co–Star"](https://en.wikipedia.org/wiki/Co%E2%80%93Star) [F, encyclopedia]
- The notifications come from an algorithm fed by freelance writers and astrologers, who condense planetary data into short phrases meant to sound like friends talking to each other. Examples reported are single short imperative or second-person sentences. Users interviewed describe the lines as painful but also empowering; the author questions whether the app's claimed scientific basis is real; the privacy policy mentions tracking of device type and frequency of use. — [Inverse, Maddy Foley, "Co-Star Astrology App: How It Works, Why Its Horoscopes Wreck Us", 18 Apr 2019](https://inverse.com/article/54991-costar-astrology-app-how-it-works) [F, press]
- Co-Star's daily "day at a glance" alerts are described as unlike ordinary horoscopes, which give vague positive advice; they are seemingly random and sometimes slightly offensive. — [Daily Dot, Co-Star push-notification memes](https://dailydot.com/co-star-astrology-app-push-notifications-memes) [S-snippet, press]
- A commercial analysis of App Store reviews reports user concern about the negative tone, especially for people prone to anxiety. — [Kimola, Co–Star review analysis](https://kimola.com/reports/co-star-app-review-analysis-unveiling-user-insights-app-store-us-155484) [S-snippet, commercial aggregator]
- The Pattern: founder Lisa Donovan says the readings are written mostly in her voice and that astrological jargon was removed to make them easier to digest; the app does not name signs and uses self-help language; daily notifications invite the user to go deeper into fears and anxieties. Coverage is mostly praise for seeming accuracy. — [Bustle, The Pattern review](https://www.bustle.com/life/pattern-app-review-features-price); [Air Mail, "Starry Might", 17 Jul 2021](https://airmail.news/issues/2021-7-17/starry-might) [both S-snippet, press]

### Inferences
- **Reusable mechanics**: one idea per line; second person; everyday words with no model jargon (for JobQuest: no "RIASEC", no "Investigative"); a short line that names something to do today. The Pattern's jargon removal maps onto the report's choice of plain Vietnamese axis names.
- **Not reusable**: bluntness as a hook. Co-Star's lines are memorable because they presume to know the reader, which is the Barnum mechanism the earlier report built rules against, and JobQuest's readers include 13-year-olds. The result screen can borrow the brevity and the "try this" line while keeping every sentence tied to something the player wrote.
- The "snippets assembled by an algorithm" architecture is also a safety pattern: text comes from a reviewed bank, not free generation. It is an alternative for the "one thing to try" line on the result screen if free generation proves hard to control.

### Gaps
- Co-Star's daily "Do / Don't" lists: only a search summary of an unidentified student-press piece mentioned them; not verified from a primary page.
- No statement from Co-Star's or The Pattern's writers about style rules (line length, banned words) was found beyond the two points above. Current job adverts suggest Co-Star still employs writers who work with its AI, but those pages were not opened.
- No peer-reviewed study of Barnum-style vagueness or anxiety effects specific to these apps was found; the anxiety concern is from press and a commercial review aggregator. No vagueness criticism of The Pattern was found.

---

## 4. Profile pages on LinkedIn and Steam

### Takeaway
LinkedIn's completion nudge is a private three-level meter over seven recommended sections that disappears once the profile is complete. No published experiment was found showing that the meter itself changes behaviour. Steam facts could only be confirmed at snippet level.

### Cited Findings
- LinkedIn profile level meter: every member starts as Beginner; completing four sections gives Intermediate; adding the rest of the seven recommended sections (profile photo, location, industry, education, position, skills, summary) gives All-Star. The level is visible only to the member. When All-Star is reached the meter is no longer shown. LinkedIn says completing sections improves discoverability in search. — [LinkedIn Help, "Use the profile level meter to update your profile"](https://www.linkedin.com/help/learning/answer/391) [F, official help]
- A LinkedIn patent describes a profile completion score in which fields carry different point weights tied to outcomes such as profile views and messages received. This shows design intent, not a measured effect. — [US patent 10,050,911, "Profile completion score"](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10050911) [S-snippet]
- Steam: profile privacy has three states (Public, Friends Only, Private) with sub-settings; marking a single game private hides ownership, playtime and activity for that game and removes it from profile showcases. — [Steam Support, profile privacy](https://help.steampowered.com/faqs/view/588C-C67D-0251-C276) [S-snippet; official page reset the connection]

### Inferences
- The transferable parts of LinkedIn's meter are that it is **private** and that it **goes away**. Both fit a product for minors better than a permanent public percentage. The earlier report already recommends no "profile completion" bar; a step indicator inside the five-minute flow ("câu 2 trên 3") is a different thing and does not push the player to disclose more fields.
- The summary is the one free-text section among LinkedIn's seven and is weighted equally with a photo; there is no prompt design to borrow from it.

### Gaps
- **No published evidence that profile-strength meters change behaviour** was found: no LinkedIn experiment, no peer-reviewed field study. Widely repeated multipliers ("N times more views") had no traceable source and are omitted.
- Steam: sections (summary, showcases, level, badges), what is optional and any completion nudges were not verified from a primary page. Whether Steam nudges profile completion at all is unknown; the free-text summary field was not confirmed.
- Whether LinkedIn's current interface still shows the meter was not checked beyond the help page.

---

## 5. Mobile text-entry scaffolds: suggestions, starters, voice, counters

### Takeaway
The evidence found is about what suggestions do to content and speed, not about whether they get more people to write: suggested text makes writing shorter and more predictable, shifts sentiment toward the suggestions, and can shift the opinions people express. Voice input gives longer answers from those who use it, but pushing it lowers the share who answer at all. No study was found showing that tappable starters or reply chips raise free-text response rate or length.

### Cited Findings
- Predictive text: within-subjects study, N = 109 participants writing 1,308 image captions on a phone-style keyboard under three conditions (no suggestions, always three next-word suggestions, suggestions only when confident). Captions written with suggestions were shorter and contained fewer words the system had not predicted; suggestions increased typing speed, with less benefit for faster typists. The authors conclude that text-entry systems should be judged on their effect on content, not only speed and accuracy. — [Arnold, Chauncey & Gajos, "Predictive Text Encourages Predictable Writing", IUI 2020, DOI 10.1145/3377325.3377523](https://kgajos.seas.harvard.edu/papers/arnold20predictive.pdf) [F: abstract, introduction and background read; results section not read]
- Smart replies: two randomised experiments (abstract: n = 1,036; Study 1 had 219 pairs). Smart replies made up 14.3% of sent messages on average; more use by a participant meant more messages sent per minute; conversation sentiment became more positive as smart-reply use rose. In Study 2, positive-sentiment and Google smart replies produced more positive conversations than negative-sentiment or no smart replies, which the authors read as showing the positive bias of commercial smart replies. The discussion states that merely providing suggestions changes the language used. People suspected of using smart replies were rated less favourably. — [Hohenstein et al., "Artificial intelligence in communication impacts language and social relationships", Scientific Reports 2023 (arXiv 2102.05756 read)](https://ar5iv.labs.arxiv.org/html/2102.05756) [F, arXiv version]
- Opinionated writing assistant: online experiment, N = 1,506; participants wrote about whether social media is good for society with an assistant configured to favour one side. The assistant shifted the opinions expressed in the writing and participants' attitudes in a later survey. — [Jakesch et al., "Co-Writing with Opinionated Language Models Affects Users' Views", CHI 2023, arXiv 2302.00560](https://ar5iv.labs.arxiv.org/html/2302.00560) [S-snippet of abstract]
- Voice input, experiment in Spain (Netquest opt-in panel, Feb–Mar 2023; 1,001 completes; 74% on a smartphone, 24% PC, 3% tablet; two narrative open questions). Four groups: text only (Control); dictation, recording or text offered together (Choice); dictation first with text offered only after a skip (PushDictation); recording first with text after a skip (PushRecording). Response to the first open question: 95.7% Control, 84.2% Choice, 75.8% PushDictation, 66% PushRecording; break-off at that question 0.8%, 4.5%, 13.4%, 15.2%. In the Choice group about 20% of those answering used voice. The text-only group had the lowest share of valid answers, and average themes and characters were generally higher in the push groups. — [Revilla & Couper, "Expanding Survey Response Options…", Survey Research Methods 20(1), 19–32, 2026](https://doi.org/10.18148/srm/2026.v20i1.8456) [F: pp. 19–27 read, including Fig. 1; later results pages not read]
- Earlier voice studies as summarised in that paper's literature review: in a German smartphone experiment the voice condition had break-off of 45% against 13% for text and item nonresponse of 25–28% against 2–4%; in a Dutch panel, 94% of those offered a choice opted for text; among those who do answer by voice, answers are longer and use more varied vocabulary. The review also states that several studies have documented shorter answers to open questions on mobile devices than on PCs. — [Revilla & Couper 2026, section 2](https://doi.org/10.18148/srm/2026.v20i1.8456) [S: literature review inside a paper read in full; original studies not opened]
- Product-side observation: Hidden Door's team added suggested ideas because players froze at an empty box (section 1). — [AI Gamechangers interview](https://aigamechangers.substack.com/p/the-machine-is-not-itself-creative) [F]

### Inferences
- **Scaffolds trade originality for ease.** Anything tappable that contains content will pull answers toward itself (shorter, more predictable, more positive). For a profile whose value is the player's own words, starters should supply a grammatical opening or point at an aspect, never a ready answer, and their use should be logged so that the summary writer can discount echoed wording.
- **Positivity bias matters for self-description.** If chips or follow-ups are upbeat, answers will be too; this compounds the model's tendency to flatter that the earlier report already flags.
- **Voice: offer, never push.** The keyboard's own dictation key already provides it at no cost; a custom record button adds break-off, privacy load (audio from minors) and unknown Vietnamese recognition quality.
- **Typing on phones is costly** (shorter answers on mobile), so each typed answer needs a clear payoff on the result screen.

### Gaps
- **No HCI study was found that tests whether tappable sentence starters or suggested-reply chips increase the rate or length of free-text responses.** The studies found measure content bias and efficiency.
- **Character counters**: no evidence found on whether a visible counter or a maximum length changes answer length or quality. The 300-character cap in the proposal remains a design choice.
- Arnold et al.: the size of the length difference was not read (results pages not opened). Hohenstein et al.: per-study sample sizes as relayed by the fetch tool did not add up exactly to the abstract's total; use the abstract's 1,036 only.
- Nothing found on Vietnamese text entry (Telex / VNI diacritics) or on adolescents.

---

## 6. Sentence-completion techniques in psychology

### Takeaway
The Rotter Incomplete Sentences Blank and Loevinger's Washington University Sentence Completion Test are clinician-scored instruments in which a person finishes a set of sentence openings; a 2026 systematic review says both have supporting reliability and validity evidence that varies by sample and purpose. A sentence stem can be borrowed as a writing prompt, but nothing supports scoring a few stems in a game, and the tests themselves are restricted professional tools.

### Cited Findings
- RISB, second edition (1992): 40 sentence stems; three forms (high school, college, adult); age range given as high school to adult; 20–40 minutes; paper and pencil, scored by hand against cutoff scores; described as a screening instrument for overall adjustment in adolescents and adults; sold at qualification level C, which the page describes as the level that gives access to all of the publisher's assessments (so the highest tier; that reading is mine). — [Pearson Assessments, "Rotter Incomplete Sentences Blank, Second Edition"](https://www.pearsonassessments.com/store/usassessments/en/p/100000307.html) [F, publisher product page]
- A 2026 systematic review following PRISMA, covering 51 US studies of the RISB and the WUSCT, argues that the two are performance-based measures wrongly dismissed as "projective", finds evidence supporting their reliability and validity, and reports that the strength of that evidence varies widely with sample characteristics (age, race / ethnicity), study context and the purpose of the score interpretation. — ["Sentence Completion Tests With an Empirical Foundation: A Systematic Review", Assessment, online 31 Mar 2026, DOI 10.1177/10731911261430262](https://sage.cnpereading.com/doi/10.1177/10731911261430262) [S-snippet of abstract; publisher mirror blocked; authors not confirmed]
- Older RISB reliability figures quoted in a university review: inter-rater agreement .44–.91 and test–retest over six months to three years .38–.54. — [University of Virginia document](https://med.virginia.edu/faculty-affairs/wp-content/uploads/sites/458/2016/04/2013-6-12a-1.pdf) [S-snippet]
- WUSCT: measures Loevinger's ego development; the technical reference volume presents reliability and validity data and a newer form for adolescents and children over eight. — [Loevinger (ed.), "Technical Foundations for Measuring Ego Development" (Taylor & Francis listing)](https://www.taylorfrancis.com/books/e/9781135691974) [S-snippet, publisher listing]
- A Chilean adaptation with 290 adolescents reported inter-rater kappa of 0.37 across the eight ungrouped levels and 0.56 when levels were grouped into three bands. — [Psykhe (Dec 2001), record](https://doaj.org/article/191aa9d995d743a8939332ef18d7c1d1) [S-snippet]

### Inferences
- **Suitable for adolescents as a format, with caveats.** Both tests have forms for school-age respondents, which suggests finishing a sentence is a task adolescents can do. But scoring needs trained raters, 36–40 stems, and even then agreement in an adolescent sample was modest. Two or three stems in an onboarding cannot be a measurement.
- For JobQuest, a stem is a **blank-page aid**: it supplies the first words and a grammatical frame, like AI Dungeon's Do mode. The proposal's backup question 1 (a sentence to finish) fits this use if it is treated as text to quote, not as a scored item.
- Stems steer content by their wording, so they should be neutral or offered in opposite pairs, and should stay away from the clinical territory of the real tests (family, fears, guilt). Write original stems; do not copy test items, which are copyrighted and restricted.

### Gaps
- The 2026 review was seen only as a search summary of its abstract; authors, effect sizes and any adolescent-specific conclusions were not read. The RISB manual and Loevinger's volumes were not opened.
- No evidence was found on sentence stems as an engagement device in apps (response rate, length) or on Vietnamese-language sentence-completion instruments.

---

## Đề xuất cho JobQuest

Sáu mẫu cho phần gõ chữ của Get to know me. Mẫu nào cũng là suy luận thiết kế từ sản phẩm khác, chưa đo trên người chơi Việt hay tuổi 13–17.

| # | Mẫu | Lấy từ | Áp vào bước | Một rủi ro cần canh |
|---|---|---|---|---|
| 1 | **Ba gợi ý hướng kể, bấm mới hiện, xin thêm được.** Mỗi gợi ý chỉ chỉ ra một khía cạnh (đang làm gì, với ai, vì sao chưa muốn dừng), không chứa nội dung trả lời. | Hidden Door (bỏ ô trống vì người chơi bí, thêm ba gợi ý mỗi lượt) | K1, nút "Cần gợi ý?" | Gợi ý có nội dung sẽ kéo câu trả lời ngắn lại và giống gợi ý (Arnold 2020; Hohenstein 2023). Ghi log lượt bấm, và không trích câu nào trùng chữ với gợi ý. |
| 2 | **Lượt chạm tạo sẵn khung câu.** Chọn một phần việc xong, ô nhập mở sẵn "Mình nhận phần … vì", người chơi chỉ viết nốt. Cho sửa lại câu trả lời từ màn kết quả. | AI Dungeon (chế độ Do / Say / Story bọc chữ người chơi thành câu hoàn chỉnh; có hoàn tác) | K2 | Khung câu ép mọi người vào cùng một kiểu lý do. Cho xoá khung để viết tự do, và thử với vài học sinh xem khung có bị hiểu là bắt buộc không. |
| 3 | **Câu bỏ lửng làm mồi mở đầu, micro là tuỳ chọn.** Hai ba câu mở trung tính do nhóm tự viết ("Buổi sáng mình…"), chạm để chèn. Giọng nói chỉ dùng phím đọc chính tả của bàn phím, không ép. | Truyền thống câu bỏ lửng (Rotter, Loevinger) chỉ mượn hình thức; Revilla & Couper 2026 về giọng nói | K3 | Câu bỏ lửng không phải phép đo: không chấm điểm, không chép câu của bài test. Ép dùng giọng nói làm tỉ lệ trả lời giảm từ 95,7% xuống 66–76% trong thí nghiệm ở Tây Ban Nha. |
| 4 | **Hỏi tiếp mà không diễn giải lại.** Câu hỏi tiếp chỉ xin thêm một chi tiết; không nhắc lại "vậy là bạn thích…". Khi không hiểu hoặc lạc đề thì nhận và đi tiếp, không báo "mình chưa hiểu". | Façade (Mateas & Stern 2004; Mehta và cộng sự 2007) | AI hỏi tiếp | Hiểu ngược ý gây phản ứng xấu nhất, nặng hơn cả không hiểu. Khi model không chắc thì bỏ câu hỏi tiếp, và bỏ luôn dòng tương ứng ở màn kết quả. |
| 5 | **Câu hỏi soạn sẵn trước, AI sau, có điểm dừng.** Ba câu cố định, tối đa một lượt hỏi tiếp do người chơi tự mở hoặc bỏ qua, rồi kết thúc rõ ràng. | Rosebud (ba câu mỗi tối rồi mới hỏi tiếp), ExploreSelf (người dùng tự chọn hướng); bài học ngược từ Character.AI | AI hỏi tiếp | Bằng chứng rằng AI hỏi tiếp giúp tự soi còn mỏng (19 và 20 người, không nhóm chứng). Trò chuyện mở không điểm dừng chính là thứ Character.AI đã gỡ cho người dưới 18. |
| 6 | **Mỗi dòng một ý, lời thường ngày, kèm một việc để thử.** Hai ba câu ngắn ngôi "bạn", không thuật ngữ mô hình, mỗi câu gắn với lời người chơi; dòng cuối là "Thử ngay: …". Chỉ báo tiến độ là riêng tư và biến mất khi xong. | Co-Star và The Pattern (câu ngắn, bỏ thuật ngữ); LinkedIn (thước đo chỉ chủ hồ sơ thấy, đủ thì ẩn) | Màn kết quả | Giọng "phán" kiểu Co-Star dễ thành Barnum và gây lo với người nhỏ tuổi; chưa có bằng chứng thước đo hồ sơ làm đổi hành vi. Giữ phép thử tráo hồ sơ của báo cáo trước. |

Ba điều chưa có bằng chứng, cần log của chính nhóm: gợi ý chạm có làm nhiều người viết hơn không; ô đếm ký tự có tác dụng gì; và gõ tiếng Việt có dấu trên điện thoại chậm tới đâu.
