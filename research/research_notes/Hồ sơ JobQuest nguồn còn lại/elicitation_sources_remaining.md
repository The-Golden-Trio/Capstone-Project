# Remaining elicitation sources: verification in the original text

Checked on 13–14 October 2026 against `research/reports/Hồ sơ JobQuest cơ chế game.md` and the three underlying note files (`elicitation_freetext_honesty.md`, `question_bank_counselling_recruiting.md`, `freetext_games_products.md`). Nothing under `_archive/` was opened. Nothing below is filled in from memory: every figure was read on the page named, and where the article itself could not be opened the entry says so.

## How to read this file

**Verification levels** (same scale as `source_verification.md`)

- **Full text**: the article itself was opened and the cited page was read. "Scan" means page images of the printed journal. "Third-party-hosted copy" means the published article's PDF sits on a site that is neither the publisher nor an author or university repository (not a pirate mirror, but provenance is not guaranteed).
- **Author copy**: an accepted manuscript, preprint or author-posted copy in a university, lab or funder repository (including PubMed Central author manuscripts).
- **Abstract**: only the publisher, repository, Crossref, OpenAlex, Semantic Scholar or Europe PMC record was read.
- **Secondary**: known only through another text that restates it.
- **Not obtained**: nothing beyond bibliographic metadata.

**Verdicts**: confirmed / confirmed with correction / not supported / full text not obtainable.

**How the texts were opened**

- PDFs were fetched and read as page images, a few pages at a time, or their text layer was extracted and searched; the pages actually read are listed in each entry.
- Open-access status and abstracts of thirty DOIs were looked up in one OpenAlex query (https://api.openalex.org/works?filter=doi:…); a second batch went through the Semantic Scholar graph API, Crossref and the Europe PMC REST search. "OpenAlex: closed" below means that query listed no open copy.
- The PubMed Central author manuscript of Wright et al. was read as XML through NCBI E-utilities, because the PMC web page shows a browser check.
- The University of Nebraska repository copy of Smyth et al. answers automated requests with HTTP 403, so its text layer was read inside the browser from the repository's own page. Table cells came out with broken spacing; table figures are reported only where they also agree with the prose.
- Refused or failed in this pass: pmc.ncbi.nlm.nih.gov (browser check), swov.nl (bot check), api.core.ac.uk (HTTP 403), cambridge.org to the fetch tool (HTTP 429; the page was then read in the browser), www.stat-d.si (TLS certificate mismatch), ink.library.smu.edu.sg (empty page), the old Northwestern "thestudyoflivesresearchgroup" address (HTTP 410). Pirate mirrors were not used.

**Quoting**: journal articles are paraphrased with page or table given; only short key phrases are quoted.

---

## A. Priority sources (design decisions rest on these)

### A1. Arnold, Chauncey & Gajos (2020), "Predictive Text Encourages Predictable Writing", IUI '20

- **Claim in the proposal** (K1 paragraph, tagged "toàn văn, chưa đọc phần kết quả"): in an experiment with 109 people writing image captions, writing done with word suggestions was shorter and more predictable. The notes add: 1,308 captions, three conditions, faster typing with less benefit for fast typists.
- **What the source says** (PDF pp. 5–7 of the conference paper: sections 4.5.3, 5.1, 5.2, 7)
  - Participants (sec. 4.5.3): 111 recruited on Amazon Mechanical Turk (61 male, ages 19–61), US and Canada, paid $5, on their own touchscreen phones; two were excluded, leaving 109. Results open with "a total of 1308 captions (109 participants after exclusion; each wrote captions for 12 images)".
  - Design: three keyboard blocks, within subjects: suggestions never shown, always shown (three next-word predictions), shown only when the model was confident; four captions per block. The instructions asked for "the most specific and accurate" caption and, after a pilot, encouraged conciseness.
  - Length (sec. 5.1, Fig. 2): Never 14.6 words, Always 13.9, OnlyConfident 13.4. Never minus OnlyConfident = 1.26 words (95% CI 0.66 to 1.86); Never minus Always = 0.76 (CI 0.18 to 1.36).
  - Predictability: about one more *unpredictable* word per caption without suggestions (Never vs Always CI 0.68 to 1.60; Never vs OnlyConfident CI 0.46 to 1.27). Share of predictable words about 6% higher with Always than with Never.
  - Speed (sec. 5.2): suggestions raised typing speed overall, and the benefit shrank as baseline speed rose; some of the fastest typists were slower with suggestions.
  - Subjective (sec. 5.3): participants strongly preferred having suggestions (picked "most helpful": Always 206 times, OnlyConfident 101, Never 20) and reported lower task load with them.
  - Authors' limits (sec. 7.1): they do not claim commercial keyboards have the same degree of effect; the task was image captioning in English by adult crowd workers.
- **Verdict**: confirmed. The size is now known: the gap is about one word in a 14-word caption (roughly 5–9%), so "shorter" is a small effect. The paper also shows people *like* suggestions, which the proposal does not mention and which cuts the other way for a "Cần gợi ý?" button.
- **Level**: full text, author copy on a co-author's university page (results now read).
- **URL read**: https://kgajos.seas.harvard.edu/papers/arnold20predictive.pdf

### A2. Jakesch, Bhat, Buschek, Zalmanson & Naaman (2023), "Co-Writing with Opinionated Language Models Affects Users' Views", CHI '23

- **Claim in the notes** (`freetext_games_products.md` §5, tagged "S-snippet of abstract"): online experiment, N = 1,506; an assistant configured to favour one side shifted the opinions expressed in the writing and attitudes in a later survey.
- **What the source says** (arXiv abstract page): N = 1,506 participants wrote a post on whether social media is good for society; treatment participants used a language-model writing assistant configured to argue one side; 500 independent judges rated the opinions in the writing. The abstract states that using the opinionated model "affected the opinions expressed in participants' writing" and "shifted their opinions in the subsequent attitude survey."
- **Verdict**: confirmed as stated. Effect sizes were not read (results section not opened).
- **Level**: abstract, read directly on arXiv (upgraded from a search snippet).
- **URL read**: https://arxiv.org/abs/2302.00560

### A3. Barari, Angbazo, Wang, Christian, Dean, Slowinski & Sepulvado (2026), Survey Research Methods 20(2), 161–180

- **Claim in the proposal** ("Câu soạn sẵn trước, AI sau"): 1,803 people, 65% on phones, at most one follow-up per question; probing made answers more specific but added "about 2–3 percentage points" of drop-out at the first probed question and doubled chat length.
- **What the source says**
  - Sample (p. 167, sec. 4.3): fielded 15–17 July 2024 on the Inca platform from a Prodege non-probability panel, quota-sampled to US adult margins; "1803 complete interviews, 195 partial interviews … and a total of n = 1998". The abstract and one sentence round this to 1,800.
  - Device (p. 167): "65% of complete interviews were conducted on a smartphone device, 32% were completed on a Desktop device", 3% on other devices.
  - One probe per question (pp. 166–167): guardrails so the chatbot "could administer at most one probe per each seed question".
  - Drop-off (p. 174, Fig. 4, "Dropout (Right After)"): at the first probed question (most important issue) the elaboration/relevance condition shows **+3.9 points without controls and +2.6 points with controls**, both significant; the confirmation-probe condition shows +1.5 / +1.0, not significant. At the three later probed questions the right-after estimates are about zero. p. 175: "The very first probe in the elaboration/relevance condition led to slightly higher dropout".
  - Chat length and drop-out counts (p. 172, sec. 5.4; added in the second sitting): in the elaboration/relevance condition "the average chat lasted twice as long (6 min.) as in the Control Condition (3 min.)"; drop-outs were "approximately twice as high" in the confirmation-probing condition as in control ("n = 88 vs. n = 43"). Both refer to Appendix Tables A2–A4, which were not opened.
  - Experience (p. 173; Fig. 5 p. 175): elaboration probing lowered ease, satisfaction and raised frustration by 0.02–0.03 on a 0–1 scale ("less than 0.05"); mobile respondents reported lower ease.
  - Recommendation (p. 176): use open-ended probes "sparingly, particularly for mobile users".
  - Model (p. 167): SmartProbe, fine-tuned from the InstructGPT/GPT-3 family, so not a current frontier model.
- **Verdict**: confirmed with correction. 1,803, 65%, one probe per question, "twice as long (6 min. vs 3 min.)" and 88 vs 43 are exact. The drop-off figure read from Fig. 4 is 2.6 points (with controls) to 3.9 points (without), so "khoảng 2–3 điểm phần trăm" should read "khoảng 2,6–3,9 điểm phần trăm". Note that the 88-vs-43 count belongs to the *confirmation* probe, while the significant right-after drop-off at the first probe belongs to the *elaboration* probe; the two should not be merged into one sentence.
- **Level**: full text (publisher PDF, CC BY-NC; pp. 165–167 and 172–176 read).
- **URL read**: https://ojs.ub.uni-konstanz.de/srm/article/view/8624 (PDF galley `/article/download/8624/7921`)

### A4. King (2001), Personality and Social Psychology Bulletin 27(7), 798–807

- **Claim in the proposal** (K3): K3 "phỏng theo ý tưởng" of the Best Possible Self exercise, not the wording, because King (2001) was read only as an abstract.
- **What the source says** (pp. 800–802)
  - Sample (p. 801): 81 psychology students aged 18–42 (M = 21.04) at Southern Methodist University; 69 women, 14 men, 2 not reporting; 87% European American; extra course credit.
  - Design (pp. 800–801): 2 (trauma or not) × 2 (BPS or not); participants "wrote for 20 minutes each day over 4 consecutive days", alone in a room. Controls wrote about their plans for the day.
  - **Instruction for the BPS condition (p. 801), in full**: "Think about your life in the future. Imagine that everything has gone as well as it possibly could. You have worked hard and succeeded at accomplishing all of your life goals. Think of this as the realization of all of your life dreams. Now, write about what you imagined."
  - Measures (p. 802): mood before and after each session; well-being (life satisfaction and optimism) three weeks later; health-centre visits for illness for five months after, available for 72 participants.
  - Content of the essays (p. 802): common themes were "job success, self-improvement, marriage and family, travel, home ownership".
  - Results beyond the abstract (pp. 803–807) were not read.
- **Verdict**: confirmed, and the caution in the proposal can now be lifted on the wording: the original instruction is five sentences and has been read. K3's "mọi thứ diễn ra thuận lợi nhất có thể" is a fair paraphrase of the second sentence. Two differences to state: King's task was 20 minutes × 4 days of free writing by university students, and it measured mood, well-being and illness, not self-knowledge or career outcomes. K3 narrows the prompt to "một ngày làm việc bình thường", which is JobQuest's own change.
- **Level**: full text (third-party-hosted copy of the published article; pp. 799–802 read).
- **URL read**: https://pdf.stafforini.com/king-2001-health-benefits-writing.pdf (index page https://stafforini.com/works/king-2001-health-benefits-writing/)

### A5. Smyth, Dillman, Christian & McBride (2009), Public Opinion Quarterly 73(2), 325–337

- **Claim in the proposal** (block C of the earlier report; `elicitation_freetext_honesty.md` §2–3, tagged abstract): a short introduction that says why the answer matters and how much to write improves open-ended answers for all respondents; a larger box helps mainly the less motivated.
- **What the source says** (repository copy, which is repaginated 1–12; page numbers below are that copy's, not the journal's)
  - Surveys (p. 3, Table 1): three web surveys of random samples of Washington State University undergraduates. Survey 1, autumn 2003, four versions, 1,528 of 3,045 (50%); Survey 2, autumn 2004, three versions, 1,054 of 1,800 (59%); Survey 3, spring 2006, four versions, 1,369 of 2,400 (57%). Invitation by postal letter with a two-dollar incentive; up to six reminders. One question per screen.
  - Quality measures (p. 3): number of words, number of themes, whether the respondent elaborated on a theme, response time, item non-response. Coder agreement 79% on themes and 83% on elaboration. Early responders are those answering on or before the median response date; late responders after it (p. 5).
  - **Box size** (pp. 5–6, Table 2): a small box against one "twice the size". Early responders: no significant difference in length, themes or elaboration. Late responders: answers three to seven words shorter with the small box in all four comparisons (for example 26.1 against 32.6 words; 15.9 against 18.6), fewer themes in two comparisons, less elaboration in two; no difference in response time or item non-response.
  - **Box explanation** (pp. 6–7, Table 3). Exact wording added to the question stem: "you are not limited in the length of your response by the size of the box". Answers were 6 to 19 words longer for both early and late responders in two comparisons; response time rose; no significant difference in item non-response.
  - **Introduction, Survey 2** (pp. 7–8, Table 4). Exact wording: "This question is very important to understanding the WSU student experience. Please take your time answering it". Answers three to six words longer for early and late responders; elaboration up 15 points (early) and 20 points (late) in one of the two questions; response time up 14 to 20 seconds. **Cost**: the introduction "seemed to have a negative effect on item nonresponse, increasing it from four to six percentage points" for both groups on both questions.
  - **Introduction split in two, Survey 3** (pp. 8–10, Table 5): "important" alone, "take your time" alone, or both. Any introduction lengthened answers for early and late responders (no introduction 28.1 / 23.0 words for early / late; "important" 37.3 / 37.4; "take time" 37.8 / 31.2; both 42.5 / 37.5). Here the "important" line and both lines together *lowered* item non-response among early responders (5.0 and 6.2 points) and did not change it among late responders. The authors' reading (p. 10): both together are "slightly more effective", but a short introduction gives "comparable gains".
  - **Not always replicated** (p. 10, Table 6): on another question the "important" line added 8 and 12 words with a small box, and nothing significant with a large box.
- **Verdict**: confirmed with correction.
  - No instruction told respondents *how much* to write. The three texts tested were: the question is very important to understanding the student experience; please take your time; you are not limited by the size of the box. All three push towards longer answers.
  - "Says what the answer is for" is supported only loosely: the tested line says the question is important for understanding the student experience, which is a reason, not a description of use.
  - "For all respondents" means early and late responders among US undergraduates on desktop web in 2003–2006.
  - The gains are a few words to about 15 words on answers of 20–40 words, with one clear cost (item non-response up four to six points in Survey 2) that reversed in Survey 3. The abstract does not mention the cost.
  - JobQuest's hint "1–3 câu là đủ" is not what Smyth et al. tested; it sets an upper expectation, and nothing here says whether that lengthens or shortens answers.
- **Level**: full text (university repository copy of the published article, "used by permission"; pp. 2–10 of 12 read as extracted text; the closing discussion was read only in its first lines).
- **URL read**: https://digitalcommons.unl.edu/sociologyfacpub/668 (file `viewcontent.cgi?article=1678&context=sociologyfacpub`)

### A6. Tourangeau, Conrad, Couper & Ye (2014), Public Opinion Quarterly 78(1), 100–125

- **Claim in the notes** (§3, tagged abstract): examples change the answer; frequent-item examples raise reported consumption; atypical examples have more impact; in open versions people omit items except those given as examples.
- **What the source says** (abstract, OpenAlex record): one preliminary and two follow-up studies on food-consumption questions. Frequently consumed examples gave higher reports than infrequently consumed ones; "atypical examples had greater impact on the answers than did typical examples"; in open-ended questions the tendency to leave items out "was reduced for the items they received as examples". Conclusion: examples "affect which and how many category members they consider". The abstract also states a benefit: examples can improve accuracy by reminding respondents of items they would otherwise omit.
- **Verdict**: confirmed as stated at abstract level. Sample sizes and effect sizes remain unread. The topic is factual recall of food, so carrying it to self-description is an inference, as the notes already say.
- **Level**: abstract.
- **Full text**: not obtainable. Tried OpenAlex (closed), Semantic Scholar (closed), a web search (only the University of Michigan ISR record and the publisher page).
- **URL read**: https://api.openalex.org/works?filter=doi:10.1093/poq/nft083 ; earlier pass: https://academic.oup.com/poq/article/78/1/100/1838155

### A7. Galesic & Bosnjak (2009), Public Opinion Quarterly 73(2), 349–360

- **Claim in the notes** (§2, §8, tagged abstract): answers to later questions are faster, shorter and more uniform; the longer the announced length (10, 20, 30 minutes), the fewer people start and finish.
- **What the source says** (abstract, OpenAlex record): stated length manipulated at 10, 20 and 30 minutes in a questionnaire of randomly ordered thematic blocks; "the longer the stated length, the fewer respondents started and completed the questionnaire"; answers to later questions "were faster, shorter, and more uniform". The hypotheses also name higher item non-response for later questions.
- **Verdict**: confirmed as stated at abstract level. Start rates by condition were seen only in a search-engine summary of a third-party review (not read at source, so not reported here).
- **Level**: abstract.
- **Full text**: not obtainable. OpenAlex lists an SSRN copy (abstract_id=1455564), which dropped the connection in the earlier pass; the CORE API returned HTTP 403; a web search found no other copy.
- **URL read**: https://api.openalex.org/works?filter=doi:10.1093/poq/nfp031

### A8. Chopra & Haaland, "Conducting Qualitative Interviews with AI", CESifo Working Paper No. 10666

- **Claim in the notes** (§4, tagged abstract; sample details "not read"): AI-led interviews give thematically richer answers than other at-scale methods; a decomposition attributes most of the gain to dynamic follow-up questions; responses predicted behaviour six months later.
- **What the source says** (working-paper PDF, 73 pages; cover and pp. 1–5 read as page images, pp. 8, 11, 17, 20 as extracted passages). Cover: "Original Version: September 2023 / This Version: June 2026"; title page: "This version: March 9, 2026". Not peer reviewed.
  - Scale (p. 2): "766 AI-led online interviews with US adults that lasted for close to 400 hours in total and generated 1,026,000 words". Two studies: non-investors on why they hold no stocks (August 2023, n = 381) and US adults on import tariffs (May 2025, n = 385) (pp. 2–3; figure note p. 20).
  - Interviewer (p. 8): OpenAI's GPT-4 base model in 2023, GPT-4o in 2025, prompted with interviewing guidelines and a researcher-written topic guide. Participants type or record a voice message (p. 2).
  - Length (p. 17): stock-market interviews "about 33 minutes on average", 654 words per participant, 29 words per minute; tariff interviews a median of about 25 minutes.
  - Process quality (p. 3): over 18,000 questions and answers hand-coded; "over 95% of questions are rated as open-ended rather than narrowly framed", neutral and relevant; "essentially zero instances of hallucination".
  - Respondent experience (p. 3): "a majority of participants would prefer an AI interviewer over a human interviewer and over 96% would like to participate in another AI-led interview"; effort stayed high "without any decrease in the amount of text produced or the time taken to answer questions over the course of the interview".
  - Benchmarks (p. 5): against a single open question, several open questions, and an AI "interview" without dynamic probes. AI-led interviews "uncover about five times as many unique (and empirically common) themes" as a single open question; asking more questions or changing the response mode "closes at most half of the gap".
  - Predictive validity (p. 5): a follow-up of the stock-market sample "after eight months" with incentivised outcomes; the abstract says "six months later". The paper disagrees with itself on the interval.
- **Verdict**: confirmed with correction. The design and numbers are now known: 766 paid US adults, interviews of about 25–33 minutes, GPT-4 then GPT-4o. The interval is six or eight months depending on the page. The finding that text and time did not decline within an interview conflicts in direction with Wuttke et al. (decline after about the tenth turn), so fatigue in AI chat is not settled by these two sources.
- **Level**: full text of a working paper (introduction and four later passages; methods and results sections not read through).
- **URL read**: https://www.ifo.de/DocDL/cesifo1_wp10666.pdf

### A9. Wright, Ringwald, Vize, Eichstaedt, Angstadt, Taxali & Sripada (2026), Nature Human Behaviour 10(3), 541–555

- **Claim in the notes** (§6, tagged abstract via a repository record; "text length per person and coefficients not read"): seven commercial LLMs scoring Big Five from streams of thought and daily video diaries converged with self-report at levels comparable to or above established benchmarks; averaging across models agreed best.
- **What the source says** (PubMed Central author manuscript PMC12974486, read as XML; paragraph positions, not page numbers)
  - It exists as described: title "Assessing personality using zero-shot generative AI scoring of brief open-ended text"; the seven authors are as listed; DOI 10.1038/s41562-025-02389-x.
  - Sample 1 (introduction): 60 people spoke their stream of thought aloud in the lab for 30 minutes; "average word count = 3,097", range 361–5,593; NEO-FFI (60 items).
  - Sample 2: 108 people recorded a nightly one-minute video diary about the day's most significant event for 15–21 days (1,513 diary days); "average word count = 1,651", range 66–3,938; IPIP-NEO (120 items). That is about 14 diaries and roughly 120 words per diary (own arithmetic).
  - Method: speech transcribed with Whisper; seven models (ChatGPT 4.1, ChatGPT 4.1 Mini, Claude 3.7 Sonnet, Gemini 2.5 Flash, Grok 3 Beta, Llama 4 Maverick, Qwen 235B) answered each inventory item as if they were the participant.
  - Results, Sample 1: single-model correlations with self-report ranged "0.16–0.55"; the average of the models ranged "0.30–0.53" across traits.
  - Results, Sample 2: mean single-model r = 0.26 for conscientiousness, 0.28 for agreeableness, 0.57 for extraversion, 0.49 for neuroticism.
  - How much text is enough: effects approached full-sample size at "15 min of spontaneous thoughts and 5–7 diaries".
  - Benchmarks named: meta-analytic family and friend ratings, LIWC, and the MyPersonality word model; the weakest LLM usually beat LIWC.
  - The limitations section was not read.
- **Verdict**: confirmed with correction. "Brief" in this paper means about 1,650 to 3,100 *spoken* words per person, or at the least five to seven one-minute diaries. Three typed answers of one to three sentences are well below the smallest amount the paper shows to be stable. Samples are 60 and 108 adults; the trait model is the Big Five, not work-style preferences.
- **Level**: author copy (PMC author manuscript; abstract, introduction, results and the opening of the discussion read).
- **URL read**: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=12974486 (the same manuscript as https://pmc.ncbi.nlm.nih.gov/articles/PMC12974486/)

### A10. Paulhus (1984); Birkeland et al. (2006); Gnambs & Kaspar (2017)

- **Paulhus (1984)**, JPSP 46(3), 598–609
  - **Claim** (§1, tagged secondary): socially desirable responding has two components, self-deception and impression management; the paper compared desirability scales under anonymous and public conditions.
  - **What was found**: no abstract in OpenAlex, Semantic Scholar (withheld by the publisher) or Europe PMC (no record). The author's own publication page lists the article with no file. A library record (SWOV) carries the abstract, but the page sits behind a bot check; it was seen only through a search-engine summary: two studies with 511 undergraduates; the two factors are self-deception and impression management; scales loading on impression management rose most from anonymous to public conditions; the recommendation is to control impression management, not self-deception.
  - **Verdict**: full text not obtainable; the claim is consistent with the secondary summary. Size of the anonymous-to-public difference: not read.
  - **Level**: secondary.
  - **URLs tried**: https://www2.psych.ubc.ca/~dpaulhus/research ; https://swov.nl/en/publicatie/two-component-models-socially-desirable-responding
- **Birkeland, Manson, Kisamore, Brannick & Smith (2006)**, International Journal of Selection and Assessment 14(4), 317–335
  - **Claim** (§1, tagged abstract): across 33 studies applicants scored higher than non-applicants on conscientiousness (d = .45), emotional stability (.44), openness (.13), extraversion (.11); distortion concentrates on job-relevant traits.
  - **What the source says** (abstract): exactly these four values; for some jobs such as sales the rank order of differences changed; differences are smaller than those from instructed faking; "direct Big Five measures produced substantially larger differences than did indirect Big Five measures".
  - **Verdict**: confirmed as stated. Agreeableness is not given in the abstract.
  - **Level**: abstract. OpenAlex: closed.
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1111/j.1468-2389.2006.00354.x
- **Gnambs & Kaspar (2017)**, Assessment 24(6), 746–762
  - **Claim** (§1, §5, tagged abstract): computerised versus paper administration gives a near-zero difference in socially desirable responding (Δ = 0.01), with no difference between proctored and unproctored settings.
  - **What the source says** (abstract): three random-effects meta-analyses: social desirability scales k = 30 (N = 3,746), Big Five k = 66 (N = 2,951), psychopathology k = 96 (N = 16,034); "a near-zero effect, Δ = 0.01"; moderator analyses found no differential effect of proctoring.
  - **Verdict**: confirmed as stated.
  - **Level**: abstract. OpenAlex: closed.
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1177/1073191115624547

### A11. Lucas, Gratch, King & Morency (2014); Moon (2000)

- **Lucas et al. (2014)**, Computers in Human Behavior 37, 94–100
  - **Claim** (§5, tagged secondary): people interviewed by a virtual human disclosed more when told it was fully automated than when told a human operated it; 239 adults in a clinical-intake setting.
  - **What the source says** (abstract and highlights, Semantic Scholar record): a health-screening interview with a virtual human framed as controlled by humans or by automation. Those who believed they were talking to a computer "reported lower fear of self-disclosure, lower impression management, displayed their sadness more intensely, and were rated by observers as more willing to disclose".
  - **Verdict**: confirmed at abstract level, upgraded from secondary. The sample size (239, recruited through Craigslist, per press coverage) is not in the abstract and stays secondary. The setting is a spoken health interview with an animated character, not a typed game onboarding.
  - **Level**: abstract. Full text not obtainable (OpenAlex closed; ScienceDirect 403 in the earlier pass; no copy found on the USC ICT site by search).
  - **URL read**: https://api.semanticscholar.org/graph/v1/paper/DOI:10.1016/j.chb.2014.04.043
- **Moon (2000)**, Journal of Consumer Research 26(4), 323–339
  - **Claim** (§5, tagged abstract): reciprocity and sequence affect how likely people are to reveal intimate information to a computer; such exchanges change later behaviour.
  - **What the source says** (abstract): Experiment 1 "identifies two factors—reciprocity and sequence"; Experiment 2 gives evidence that the exchange affects behaviour in later interactions.
  - **Verdict**: confirmed as stated at abstract level. What the computer disclosed, the order used, and the samples are not in the abstract and were not read.
  - **Level**: abstract. Full text not obtainable (OpenAlex and Semantic Scholar closed; not in Europe PMC).
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1086/209566

### A12. Aron, Melinat, Aron, Vallone & Bator (1997), Personality and Social Psychology Bulletin 23(4), 363–377

- **Claim in the notes** (`question_bank_counselling_recruiting.md` §5; the paper tagged abstract, the structure taken from a university practice page): 45 minutes; three sets of twelve questions, about fifteen minutes each, each set more personal; partners take turns; more closeness than small talk.
- **What the source says** (pp. 364–366 and 375–377 read)
  - Procedure (pp. 365–366): pairs of strangers in a class session of a large psychology course carried out tasks "over a 45-min period". Each envelope held an instruction sheet and "three sets of slips". For each slip one partner, "in alternating order", reads it aloud and both carry it out. After 15 minutes the experimenter moves pairs to Set II, after another 15 to Set III. Intensity "gradually increased, both within sets and over the three sets"; three sets were used so that slow pairs would still reach some Set III tasks.
  - Stated goal given to participants (pp. 365–366): the instructions say the task "is simply to get close to your partner".
  - Study 1 sample (p. 365): 33 cross-sex pairs and 17 all-women pairs. The small-talk condition "involved minimal disclosure".
  - Study 1 result (p. 366): closeness composite 4.06 for the closeness tasks against 3.25 for small talk, "an effect size (d) of .88", F(1, 37) = 5.68, p < .05.
  - Appendix (p. 375): the closeness list ends at item 36 (item 35 asks whose death in the family the person would find most disturbing); the small-talk list is printed as Set I items 1–12, Set II items 13–24, Set III items 25–36. The page with the set headings of the closeness list (p. 374) was not read.
  - Authors' own caution (note 9, p. 376): they advise care about creating relationships that might not arise naturally and say they debriefed participants and screened out some respondents.
- **Verdict**: confirmed. Thirty-six tasks in three fifteen-minute sets, with alternating turns, are in the original. Two facts the notes lack: the procedure is two-sided and was run with university students in pairs; and its last set contains heavy family and death questions, which supports the notes' decision to borrow only the "light first, deeper later" order.
- **Level**: full text (scan, third-party-hosted copy of the published article; pp. 364–366, 375–377 read).
- **URL read**: https://pdf.stafforini.com/aron-1997-experimental-generation-interpersonal.pdf

### A13. Campion, Palmer & Campion (1997); Sackett, Zhang, Berry & Lievens (2022); Taylor & Small (2002); Culbertson, Weyhrauch & Huffcutt (2017)

- **Campion et al. (1997)**, Personnel Psychology 50(3), 655–702
  - **Claim** (§4, tagged abstract via search summary): fifteen components of interview structure, seven about content and eight about evaluation; interviews are easily improved by adding structure.
  - **What the source says** (abstract): "Fifteen components of structure are identified" that enhance either the content of the interview or the evaluation process; interviews "can be easily enhanced".
  - **Verdict**: confirmed at abstract level, now read directly. The 7 + 8 split and the list of components are not in the abstract.
  - **Level**: abstract. OpenAlex: closed.
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1111/j.1744-6570.1997.tb00709.x
- **Sackett et al. (2022)**, Journal of Applied Psychology 107(11), 2040–2068
  - **Claim** (§4, §6, tagged secondary through a practitioner summary): structured interviews have the highest mean operational validity, .42, ahead of job knowledge (.40), biodata (.38), work samples (.33), cognitive ability (.31); interests .24; wide variation between settings.
  - **What the source says** (abstract): mean validities are "reduced by .10-.20 points" from earlier summaries; "Structured interviews emerged as the top-ranked selection procedure."
  - **What the same authors say in an open-access follow-up** (Sackett, Zhang, Berry & Lievens, 2023, Industrial and Organizational Psychology 16(3), 283–300, CC BY; opening sections read): structured interviews "emerged as the predictor with the highest mean validity"; reductions of .21 for work samples, .20 for cognitive ability and .19 for unstructured interviews; they report between-study standard deviations to stress that validity varies across settings. The numbers sit in the article's Table 1, which the page text did not include.
  - **Verdict**: confirmed with a caveat. Rank order and the size of the reductions are confirmed from the authors. The value .42 itself, and the other four values, were not read in a table and remain at the level of the practitioner summary.
  - **Level**: abstract for the 2022 article; full text (introduction only) for the 2023 follow-up. An open postprint is listed at Singapore Management University (page came back empty); a third-party copy was located and not opened.
  - **URLs read**: https://api.openalex.org/works?filter=doi:10.1037/apl0000994 ; https://doi.org/10.1017/iop.2023.24
- **Taylor & Small (2002)**, Journal of Occupational and Organizational Psychology 75(3), 277–294
  - **Claim** (§4, §6): "located but not readable"; no numbers reported.
  - **What the source says** (abstract): both formats gave high validity; with descriptively anchored rating scales, past-behaviour questions gave a mean validity of .63 against .47 for situational questions; question type moderated validity; "No support was found for the hypothesis that situational questions are less valid for predicting job performance in high-complexity jobs"; inter-rater reliability .79 (situational) and .77 (past behaviour) with anchored scales.
  - **Verdict**: confirmed with correction, upgraded from not readable to abstract. It supports the notes' ordering (past behaviour above hypothetical). It does **not** support the sentence taken from the US Office of Personnel Management that behavioural questions are better specifically for highly complex jobs. These are pre-2022 corrected estimates, which Sackett et al. argue were over-corrected.
  - **Level**: abstract. OpenAlex: closed.
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1348/096317902320369712
- **Culbertson, Weyhrauch & Huffcutt (2017)**, Human Resource Management Review 27(1), 167–177
  - **Verdict**: full text not obtainable, and no abstract either. OpenAlex and Crossref carry no abstract, Semantic Scholar says the publisher withheld it, Europe PMC has no record. Only the bibliographic record is confirmed. Do not cite it for any finding.
  - **Level**: not obtained.

### A14. O'Reilly, Chatman & Caldwell (1991); Rivera (2012)

- **O'Reilly et al. (1991)**, Academy of Management Journal 34(3), 487–516
  - **Claim** (§1, §4, tagged secondary): the Organizational Culture Profile uses 54 value statements in a card-sort format to compare a person's profile with an organisation's; alpha .88 in a NIOSH entry.
  - **What the source says** (abstract): the article applies "Q-sort", or template-matching, to person–situation fit; data are longitudinal from accountants and MBA students and cross-sectional from government agencies and accounting firms; person–organisation fit "predicts job satisfaction and organizational commitment a year after fit was measured and actual turnover after two years".
  - **What the NIOSH entry says** (read directly): 54 items; instrument type "Card sort"; coefficient alpha 0.88 overall; listed as public domain with no user fee.
  - **Verdict**: confirmed. The sorting method and the outcomes are in the abstract; the item count and alpha come from the NIOSH catalogue, not from the article. The samples are working adults and MBA students.
  - **Level**: abstract, plus a secondary catalogue entry for the item count. Full text not obtainable (OpenAlex closed; no author-hosted copy found by search).
  - **URLs read**: https://api.openalex.org/works?filter=doi:10.2307/256404 ; https://archive.cdc.gov/www_cdc_gov/niosh/topics/workorg/detail059.html
- **Rivera (2012)**, American Sociological Review 77(6), 999–1022
  - **Claim** (§4, tagged abstract via the Kellogg page): from 120 interviews and observation of a hiring committee, hiring is cultural matching; evaluators favoured candidates similar to themselves, and these concerns "often weighed as heavily as productivity".
  - **What the source says** (abstract): 120 interviews with employers at elite professional service firms plus participant observation of a hiring committee; employers sought candidates culturally similar to themselves in "leisure pursuits, experiences, and self-presentation styles"; such concerns "often outweighed concerns about absolute productivity".
  - **Verdict**: confirmed with correction: "outweighed", not "weighed as heavily as". It is a qualitative case study of elite firms, which the notes already imply.
  - **Level**: abstract. OpenAlex: closed.
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1177/0003122412463213

---

## B. Other sources

### B1. Reynolds & Gutman (1988), laddering

- **Claim** (§1, tagged secondary via an encyclopaedia entry): the most detailed account of the laddering interview; it climbs from concrete attributes to higher-order personal values.
- **What was found**: Crossref confirms Journal of Advertising Research 28(1), 11–31, February 1988, DOI 10.1080/00218499.1988.12467766. OpenAlex has no abstract and no open copy.
- **Verdict**: full text not obtainable in this pass. The description of the method stays secondary.
- **Level**: secondary (bibliographic record confirmed).
- **URL read**: https://api.crossref.org/works?query.bibliographic=Reynolds+Gutman+1988+Laddering

### B2. Kuhn & McPartland (1954), Twenty Statements Test; Hards, Ellis, Fisk & Reynolds (2019), the adolescent study

- **Kuhn & McPartland (1954)**, "An Empirical Investigation of Self-Attitudes", American Sociological Review 19(1), from p. 68. The bibliographic record is confirmed. The only abstract on record belongs to a later reprint and does not describe the instruction, so "up to twenty answers to 'Who am I?'" stays **secondary**. No open copy was listed.
- **Hards et al. (2019)**, "Memories of the self in adolescence: examining 6558 self-image norms", Memory 27(7), 1011–1017, DOI 10.1080/09658211.2019.1608256
  - **Claim** (§1, §3, §5, §6, tagged secondary via a research digest): 822 pupils aged 13–18 in three English schools completed "I am…" up to 20 times in five minutes, told not to think too much; 6,558 self-descriptions, about eight each; mostly positive traits and roles.
  - **What the source says** (abstract): "Young people (n = 822) aged 13–18 years completed the Twenty Statements Test"; positive traits were used most often; "boys generated fewer self-images than girls"; adolescents used traits more and adults used social roles more. The title gives 6,558 self-images; 6,558 / 822 is 7.98 (own arithmetic).
  - **Verdict**: confirmed with correction. Sample, age range, total and the predominance of positive traits are confirmed at abstract level. The five-minute limit, the "do not think too much" instruction and the three English schools are not in the abstract and stay secondary. One nuance against the notes: the abstract says adults, not adolescents, lean on social roles.
  - **Level**: abstract. OpenAlex: closed.
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1080/09658211.2019.1608256

### B3. Luft & Ingham (1955), Johari window; Miller & Rollnick, OARS

- **Luft & Ingham**: nothing new was attempted in this pass. The notes cite an encyclopaedia page and say the original proceedings were not located. **Secondary; unverified at source.**
- **Miller & Rollnick**: the book was not opened. The notes rest on the page of the Motivational Interviewing Network of Trainers, which summarises the third edition. **Secondary to the book; adequate for naming the four skills, not for any claim of effect.**

### B4. Krosnick (1991); Pennebaker & King (1999); Park et al. (2015); Yee & Bailenson (2007)

All four were re-read as abstracts in the OpenAlex records; each matches the notes. Level for all: **abstract**; OpenAlex lists all four as closed.

- **Krosnick (1991)**, Applied Cognitive Psychology 5(3), 213–236: when answering well takes substantial effort some respondents give a merely satisfactory answer; the listed strategies include picking the first reasonable option, agreeing, not differentiating in ratings, saying "don't know" and choosing at random. A theoretical review, not an experiment. **Confirmed.**
- **Pennebaker & King (1999)**, JPSP 77(6), 1296–1312: word-count analysis of diaries, essays and abstracts; four factors from essays by 838 students, replicated in 381; "Despite modest effect sizes", linguistic style is called a meaningful way to explore personality. **Confirmed.**
- **Park et al. (2015)**, JPSP 108(6), 934–952: model built on "66,732 Facebook users" and tested on 4,824; language-based scores agreed with self- and informant reports and were stable over six months. **Confirmed.** Its average convergent correlation is given as .37 in Peters & Matz (per the notes) and as .38 in Wright et al.; neither was checked in Park's own tables.
- **Yee & Bailenson (2007)**, Human Communication Research 33(3), 271–290: two experiments; more attractive avatars led to more intimate self-disclosure and closer distance; taller avatars led to more confident negotiation. **Confirmed.**

### B5. Items the notes held only at secondary level

| Source | What was read now | Verdict |
|---|---|---|
| **Luebker (2021)**, Methods, Data, Analyses 15(1), from p. 36 | Abstract (OpenAlex): N = 22,306 on a German salary site; three conditions; "0.1 break-offs and roughly 3.7 item missings" per meaningful comment with an embedded probe; "0.2 additional break-offs" with a probe on the next page; smartphone users more likely to give meaningful, shorter answers; smartphone use amplified the adverse effects | **Confirmed**, upgraded to abstract. Open copy exists at SSOAR (not opened) |
| **Reja, Manfreda, Hlebec & Vehovar (2003)**, Developments in Applied Statistics 19, 159–177 | Nothing. The journal's PDF address failed on a certificate error; the CORE API refused | **Unusable as it stands**: still a search-summary claim. Cite only if someone opens the paper |
| **Derner, Kučera, Oliver & Zahálka (2024)**, CHB: Artificial Humans 2(2), 100088 | Abstract (OpenAlex): Czech texts by "a representative population sample of 155 participants"; BFI as ground truth; ChatGPT "competitive" with human raters; a "positivity bias" on all dimensions | **Confirmed**, upgraded to abstract. Coefficients not read; open copy arXiv:2312.16070 |
| **Love, Butz, Usher & Waiters (2018)**, Journal of Adolescence 67, 31–34 | Abstract (OpenAlex): N = 261 US fifth graders (157 paper, 104 computer); computer answers significantly longer and lexically richer | **Confirmed**, upgraded to abstract |
| **Borgers, de Leeuw & Hox (2000)**, Bulletin de Méthodologie Sociologique 66, 60–75 | Abstract (OpenAlex, in French): a literature review plus preliminary results of a secondary analysis of how cognitive development affects response quality | **Not supported at the level read**: "quality improves with years of education" and "poor reading lowers it" are not in the abstract. Use only for "methodological studies of children as respondents are scarce". Open copy listed at Utrecht (not opened) |
| **Palin, Feit, Kim, Kristensson & Oulasvirta (2019)**, MobileHCI '19 | Abstract (OpenAlex): 37,370 volunteers; 36.2 words per minute; 2.3% uncorrected errors; autocorrect correlates positively with speed, word prediction negatively | **Confirmed** for these figures. "Ages 10–19 fastest" and "over 74% two thumbs" are not in the abstract; they stay at project-page level. Transcription, not composition |
| **Smith, Ward & Schumacher (1993)**, Memory & Cognition 21(6), 837–845 | Abstract (Europe PMC): three experiments in which people sketched new members of a category after seeing three examples or none; designs made after examples "were more likely to contain features of the examples"; a 23-minute delay did not reduce this; telling people to make ideas very different from the examples "did not decrease conformity" | **Confirmed**, upgraded from "do not cite" to abstract. It concerns creative design, not self-description. The useful point: an instruction not to copy the example does not remove the pull |
| **Callegaro & Petronin (2023)**, Google Research | Publication page re-read: 1,200 participants in a Qualtrics survey, two groups; GPT-3 generated the probes; higher-quality, more detailed answers; respondents preferred follow-ups; they disliked repetitive probes and not knowing how many exchanges were required. No venue stated | **Confirmed** as an abstract of grey literature. No numbers behind "higher quality" |

URLs read for this table: https://api.openalex.org/works?filter=doi:… for the DOIs 10.12758/mda.2020.09, 10.1016/j.chbah.2024.100088, 10.1016/j.adolescence.2018.05.007, 10.1177/075910630006600106, 10.1145/3338286.3340120 ; https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3758/BF03202751%22 ; https://research.google/pubs/combining-closed-based-and-chatbot-based-questions-in-surveys/

### B6. The 2026 systematic review of sentence-completion tests

- **Claim** (`freetext_games_products.md` §6, tagged snippet; "authors not confirmed"): a PRISMA review of 51 US studies of the Rotter Incomplete Sentences Blank and the Washington University Sentence Completion Test finds supporting reliability and validity evidence that varies by sample and purpose.
- **What the source says** (Crossref and Semantic Scholar records)
  - Authors: Ryan Coleman, Cassie Jennings, Madeline Pettit, Kenzie Billeiter, Nicholas Benson, Stefan Dombrowski, Trevor Austin.
  - "Sentence Completion Tests With an Empirical Foundation: A Systematic Review", *Assessment*, published online 30 March 2026, DOI 10.1177/10731911261430262; no volume or pages yet.
  - Abstract: follows PRISMA; reviews reliability and validity evidence for the two tests; argues they are better described as performance-based than projective; "51 studies conducted in the United States"; there is supporting evidence, but "results vary widely depending on sample characteristics (e.g., age, race/ethnicity), study context, and the purpose of score interpretations".
- **Verdict**: confirmed, with the authors now known and the online date corrected to 30 March (the notes say 31 March). The conclusion concerns two clinician-scored instruments. It says nothing about a few self-written stems in a game, which is how the proposal already uses it.
- **Level**: abstract. Semantic Scholar lists the article as hybrid open access; the full text was not opened.
- **URL read**: https://api.crossref.org/works/10.1177/10731911261430262

### B7. Santilli, Nota & Hartung (2019); Hartung & Santilli (2018), My Career Story

- **Santilli, Nota & Hartung (2019)**, Journal of Vocational Behavior 111, 49–58
  - **Claim** (§1, §6, tagged abstract): a group intervention built on the workbook, compared with a traditional career intervention in 108 early adolescents assigned by convenience; gains in career adaptability (concern and control) and future orientation for the workbook group only; no change in hope, optimism or resilience.
  - **What the source says** (abstract): "Participants (N = 108) were assigned based on convenience" to an experimental group (27 girls, 27 boys) or a control group (27 girls, 27 boys); pre- and post-measures of career adaptability, hope and optimism, resilience and future orientation; gains in adaptability and future orientation for the experimental group only; the concern and control dimensions rose for that group only; no significant change in hope, optimism or resilience in either group; participants rated the intervention useful and satisfying.
  - **Verdict**: confirmed as stated. Not randomised, one sample, no follow-up mentioned. Ages and country are not in the abstract.
  - **Level**: abstract. OpenAlex: closed.
  - **URL read**: https://api.semanticscholar.org/graph/v1/paper/DOI:10.1016/j.jvb.2018.06.007
- **Hartung & Santilli (2018)**, "My Career Story: Description and Initial Validity Evidence", Journal of Career Assessment 26(2), 308–321
  - **Claim** (§1, tagged full): agreement of .81 by latent semantic analysis between life portraits written by 10 participants and by expert counsellors; evidence is preliminary.
  - **What the source says** (abstract): "a mean agreement level of .81" between portraits by participants "(N = 10)" and those by experts; "Future research is needed to support the validity".
  - **Verdict**: confirmed. The notes' "advance online 2017" now has a volume: 26(2), 308–321.
  - **Level**: abstract here; the notes had already read the authors' copy in full.
  - **URL read**: https://api.openalex.org/works?filter=doi:10.1177/1069072717692980

### B8. McAdams, The Life Story Interview

- **Problem in the notes** (§1): the Foley Center page returned HTTP 410; only a magazine condensation and a third-party adaptation were read.
- **Current official location**: the Instruments page of the Study of Lives Research Group at Northwestern, the successor to the Foley Center: https://sites.northwestern.edu/studyoflivesresearchgroup/instruments/ . The similar address with "thestudyoflivesresearchgroup" still returns HTTP 410.
- **What the page offers** (as relayed by the fetch tool): "The Life Story Interview (1995)" and "The Life Story Interview II (2007)", plus coding systems and scales. The page calls the second version the best overall generic protocol and states that researchers are "free to use any and all of these instruments – no explicit permission is needed".
- **The Life Story Interview II** (official PDF, 5 pages, text read): headed "Dan P. McAdams, The Foley Center for the Study of Lives, Northwestern University, Revised, 2007". The introduction says the interview takes "about two hours or less", that there are "no right or wrong answers", and that it is not a clinical analysis or "therapy session". Sections:
  - A. Life Chapters
  - B. Key Scenes in the Life Story: 1 High point; 2 Low point; 3 Turning point; 4 Positive childhood memory; 5 Negative childhood memory; 6 Vivid adult memory; 7 Religious, spiritual, or mystical experience; 8 Wisdom event
  - C. Future Script: 1 The next chapter; 2 Dreams, hopes, and plans for the future; 3 Life project
  - D. Challenges: 1 Life challenge; 2 Health; 3 Loss; 4 Failure, regret
  - E. Personal Ideology: 1 Religious/ethical values; 2 Political/social values; 3 Change, development of religious and political views; 4 Single value; 5 Other
  - F. Life Theme
  - G. Other
- **Verdict**: confirmed with correction. The official protocol is dated 2007 (texts that cite "McAdams 2008" mean this web document). Its eight scenes differ from the list in the 2005 magazine condensation that the notes used, which matches an older version. Sections B2, B5, D and E contain exactly the kinds of prompt the notes decided to leave out for minors.
- **Level**: full text (official copy).
- **URL read**: https://cpb-us-e1.wpmucdn.com/sites.northwestern.edu/dist/4/3901/files/2020/11/The-Life-Story-Interview-II-2007.pdf

---

## C. What this changes in the proposal and the notes

**Content corrections**

1. **Barari et al.**: write "khoảng 2,6–3,9 điểm phần trăm" for the extra drop-out right after the first elaboration probe (p. 174). "Dài gấp đôi" is exact (6 against 3 minutes, p. 172). The 88-against-43 drop-out count belongs to the confirmation probe.
2. **Smyth et al.**: the tested texts were "this question is very important to understanding the … experience", "please take your time answering it" and "you are not limited in the length of your response by the size of the box". None says how much to write. Gains were a few words to about 15 words. One of the two introduction experiments raised item non-response by four to six points. The line "1–3 câu là đủ" is JobQuest's own and untested; the proposal already says so for the 300-character limit and should say the same for this hint.
3. **Arnold et al.**: add the size (about one word in fourteen) and that participants preferred having suggestions.
4. **King (2001)**: K3 can cite the original instruction; drop "mới đọc ở mức tóm tắt".
5. **Wright et al.**: where the notes call it the strongest positive result, add the amount of text: 1,650–3,100 spoken words per person, stable from five to seven one-minute diaries. This strengthens the notes' own point that three short answers are far too little for trait scoring.
6. **Chopra & Haaland**: 766 interviews of about 25–33 minutes with paid US adults; six or eight months for the follow-up depending on the page. Its "no decline within the interview" finding should be set beside Wuttke et al., not ignored.
7. **Rivera**: "often outweighed concerns about absolute productivity".
8. **Taylor & Small**: the notes can now give .63 against .47 (with anchored rating scales). Remove or qualify the statement that behavioural questions are better for complex jobs; this meta-analysis found no support for the mirror hypothesis.
9. **McAdams**: cite the 2007 protocol from the Study of Lives page; the list of eight scenes in the notes is from an older, condensed version.
10. **Hards et al.**: cite the article itself (Memory 27(7), 1011–1017) for 822 pupils and 6,558 self-images; keep the five-minute detail tagged secondary.
11. **Sentence-completion review**: add the authors (Coleman et al., 2026) and the date 30 March 2026.

**Tags that can be raised**: Lucas et al., Luebker, Love et al., Derner et al., Smith, Ward & Schumacher, Taylor & Small and Hards et al. move to abstract level; Aron et al., King and McAdams to full text; Wright et al. to author copy; Smyth et al. to full text of a repository copy.

**Still not usable for numbers**: Reja et al. (2003); Culbertson et al. (2017); the value .42 from Sackett et al. (read only in a practitioner summary); Paulhus (1984); Borgers et al. (2000) for the specific claim attached to it.

---

## Bảng trạng thái

| Nguồn | Mức đọc được | Kết quả | Đã thử gì nếu chưa lấy được | Ảnh hưởng tới đề xuất |
|---|---|---|---|---|
| Arnold, Chauncey & Gajos 2020 | bản tác giả (toàn văn, đã đọc phần kết quả) | đúng như đã viết; nên thêm cỡ hiệu ứng: ngắn hơn khoảng 1 từ trên 14 từ, và người tham gia thích có gợi ý | | K1: giữ luật "gợi ý chỉ nêu hướng kể"; bỏ nhãn "chưa đọc phần kết quả" |
| Jakesch và cộng sự 2023 | tóm tắt (đọc trực tiếp trên arXiv) | đúng như đã viết | chưa mở phần kết quả | Không đổi |
| Barari và cộng sự 2026 | toàn văn | đúng nhưng phải sửa: "khoảng 2–3 điểm phần trăm" thành "khoảng 2,6–3,9 điểm phần trăm"; "dài gấp đôi" đúng (6 so với 3 phút, tr. 172); 88 so với 43 là của kiểu hỏi xác nhận | | Mục "Câu soạn sẵn trước, AI sau": sửa con số, giữ kết luận |
| King 2001 | toàn văn (bản đăng lại của bên thứ ba) | đúng như đã viết; nay có nguyên văn lời hướng dẫn 5 câu | | K3: bỏ câu "mới đọc ở mức tóm tắt"; ghi rõ K3 thu hẹp về "một ngày làm việc" là thay đổi của nhóm |
| Smyth và cộng sự 2009 | toàn văn (bản ở kho của trường, tr. 2–10) | đúng nhưng phải sửa: lời dẫn được thử là "câu này rất quan trọng…", "cứ thong thả trả lời", "không bị giới hạn bởi kích thước ô"; không lời dẫn nào nói nên viết bao nhiêu; mức tăng vài từ đến khoảng 15 từ; một thí nghiệm làm tỉ lệ bỏ trống tăng 4–6 điểm | Bản PDF từ chối truy cập tự động (403), đã đọc lớp chữ trong trình duyệt | Dòng "1–3 câu là đủ" phải ghi là lựa chọn thiết kế chưa có bằng chứng; lời dẫn nên nói vì sao câu trả lời quan trọng |
| Tourangeau và cộng sự 2014 | tóm tắt | đúng như đã viết | OpenAlex, Semantic Scholar (đóng), tìm kiếm web | Không đổi; vẫn là suy rộng từ câu hỏi về thức ăn |
| Galesic & Bosnjak 2009 | tóm tắt | đúng như đã viết | SSRN (rớt kết nối ở lượt trước), CORE API (403), tìm kiếm web | Không đổi; không dẫn tỉ lệ bắt đầu theo từng mức thời lượng |
| Chopra & Haaland (bản 2026) | toàn văn bài nghiên cứu chưa bình duyệt (phần mở đầu và bốn đoạn sau) | đúng nhưng phải sửa: thêm 766 phỏng vấn, người lớn ở Mỹ, 25–33 phút, GPT-4 rồi GPT-4o; mốc theo dõi là 6 hoặc 8 tháng tuỳ trang | | Chỉ là bối cảnh; không dùng để nói về onboarding 5 phút |
| Wright và cộng sự 2026 | bản tác giả (PMC) | đúng nhưng phải sửa: "văn bản ngắn" là 1.650–3.100 từ nói mỗi người; mẫu 60 và 108 người lớn; r trung bình các model 0,30–0,53 ở mẫu 1 | Trang PMC chặn, đọc qua NCBI E-utilities | Củng cố nhãn "AI đọc, có thể chưa đúng": ba câu trả lời ngắn ít hơn nhiều so với mức bài báo cho là ổn định |
| Paulhus 1984 | thứ cấp | đúng ở mức thứ cấp; không có con số | OpenAlex, Semantic Scholar, Europe PMC (không có tóm tắt), trang tác giả (không có tệp), SWOV (chặn bot) | Không dẫn trong đề xuất; chỉ nên nhắc như khái niệm |
| Birkeland và cộng sự 2006 | tóm tắt | đúng như đã viết | OpenAlex: đóng | Không đổi |
| Gnambs & Kaspar 2017 | tóm tắt | đúng như đã viết | OpenAlex: đóng | Không đổi |
| Lucas và cộng sự 2014 | tóm tắt | đúng như đã viết; cỡ mẫu 239 vẫn là thứ cấp | OpenAlex đóng; ScienceDirect 403; tìm trên trang USC ICT | Dòng "chỉ AI đọc": có đỡ về hướng, nhưng là phỏng vấn sức khoẻ bằng giọng nói |
| Moon 2000 | tóm tắt | đúng như đã viết; chi tiết thao tác chưa đọc được | OpenAlex, Semantic Scholar (đóng), Europe PMC (không có) | Không đổi |
| Aron và cộng sự 1997 | toàn văn (bản quét, bên thứ ba lưu) | đúng như đã viết: 36 việc, ba bộ, mỗi bộ 15 phút, luân phiên; d = 0,88 so với chuyện phiếm | | Chỉ mượn thứ tự "nhẹ trước, sâu sau"; bộ III có câu hỏi nặng về gia đình và cái chết |
| Campion, Palmer & Campion 1997 | tóm tắt | đúng như đã viết; cách chia 7 + 8 chưa kiểm được | OpenAlex: đóng | Không đổi |
| Sackett và cộng sự 2022 | tóm tắt; bài tiếp theo 2023 của cùng tác giả (truy cập mở, phần mở đầu) | đúng về thứ hạng và mức giảm 0,10–0,20; con số 0,42 chưa đọc được trong bảng | Kho SMU (trang trống), Cambridge (429, rồi đọc trong trình duyệt nhưng bảng không hiện trong chữ) | Nếu dẫn 0,42 thì ghi "qua bản tóm lược của SIOP" |
| Taylor & Small 2002 | tóm tắt | đúng nhưng phải sửa: thêm 0,63 so với 0,47; không đỡ được câu "câu hỏi hành vi tốt hơn ở việc phức tạp" | OpenAlex: đóng | Bảng so kiểu câu hỏi ở ghi chú: giữ thứ tự, bỏ ý về độ phức tạp |
| Culbertson và cộng sự 2017 | chưa lấy được | không đỡ được nhận định nào | OpenAlex, Crossref, Semantic Scholar, Europe PMC: không có tóm tắt | Không dẫn |
| O'Reilly, Chatman & Caldwell 1991 | tóm tắt; 54 câu và alpha 0,88 là thứ cấp (NIOSH) | đúng như đã viết | OpenAlex đóng; tìm bản trên trang tác giả | Không đổi |
| Rivera 2012 | tóm tắt | đúng nhưng phải sửa: "thường lấn át" chứ không phải "nặng ngang" mối quan tâm về năng suất | OpenAlex: đóng | Vẫn đỡ cho nguyên tắc không phán "hợp nghề" |
| Reynolds & Gutman 1988 | thứ cấp | chưa kiểm được ở bản gốc | Crossref (chỉ có thư mục), OpenAlex (đóng, không tóm tắt) | Chỉ dùng tên kỹ thuật "hỏi vì sao một nấc" |
| Kuhn & McPartland 1954 | thứ cấp | chưa kiểm được lời hướng dẫn gốc | OpenAlex (tóm tắt của bản in lại, không tả phép đo) | Chỉ mượn hình thức "Mình là người…" |
| Hards và cộng sự 2019 | tóm tắt | đúng nhưng phải sửa: dẫn thẳng bài báo; 822 em, 13–18 tuổi, 6.558 câu; giới hạn 5 phút vẫn là thứ cấp | OpenAlex: đóng | Câu A6 trong ngân hàng câu hỏi: giữ |
| Luft & Ingham (Johari) | thứ cấp | chưa kiểm | Lượt này không thử thêm | Không dùng làm bằng chứng |
| Miller & Rollnick (OARS) | thứ cấp | chưa kiểm ở sách | Lượt này không thử thêm | Chỉ dùng để gọi tên bốn kỹ năng |
| Krosnick 1991 | tóm tắt | đúng như đã viết | OpenAlex: đóng | Không đổi |
| Pennebaker & King 1999 | tóm tắt | đúng như đã viết | OpenAlex: đóng | Không đổi |
| Park và cộng sự 2015 | tóm tắt | đúng như đã viết; r trung bình ghi 0,37 hay 0,38 tuỳ bài trích lại | OpenAlex: đóng | Không dẫn con số r của Park |
| Yee & Bailenson 2007 | tóm tắt | đúng như đã viết | OpenAlex: đóng | Không đổi |
| Luebker 2021 | tóm tắt | đúng như đã viết | Bản mở ở SSOAR, chưa mở | Không đổi |
| Reja và cộng sự 2003 | chưa lấy được | không đỡ được nhận định (chưa đọc) | Trang tạp chí (lỗi chứng chỉ), CORE API (403) | Bỏ khỏi báo cáo cho tới khi có người mở bài |
| Derner và cộng sự 2024 | tóm tắt | đúng như đã viết | Có bản arXiv, chưa mở | Không đổi |
| Love và cộng sự 2018 | tóm tắt | đúng như đã viết | OpenAlex: đóng | Không đổi |
| Borgers, de Leeuw & Hox 2000 | tóm tắt | không đỡ được nhận định cụ thể về số năm đi học và kỹ năng đọc | Bản mở ở Utrecht, chưa mở | Không dẫn cho ý đó |
| Palin và cộng sự 2019 | tóm tắt | đúng với 37.370 người, 36,2 từ/phút, 2,3% lỗi; "10–19 tuổi nhanh nhất" và "74% hai ngón cái" chưa kiểm | Bản mở ở Cambridge và Aalto, chưa mở | Không dẫn hai chi tiết chưa kiểm |
| Smith, Ward & Schumacher 1993 | tóm tắt | đúng như đã viết; dặn "đừng làm giống ví dụ" không làm giảm việc bắt chước | Trang Springer chuyển hướng đăng nhập; đọc tóm tắt ở Europe PMC | Củng cố luật "không đưa câu trả lời mẫu" ở K1 |
| Callegaro & Petronin 2023 | tóm tắt (trang công bố của Google) | đúng như đã viết | Không có nơi đăng | Chỉ dùng cho ý "nói trước số lượt hỏi" |
| Coleman và cộng sự 2026 (tổng quan bài hoàn thành câu) | tóm tắt | đúng như đã viết; nay có tên tác giả, tạp chí Assessment, đăng 30/3/2026 | Toàn văn truy cập mở một phần, chưa mở | K3: giữ câu "chỉ mượn hình thức" |
| Santilli, Nota & Hartung 2019 | tóm tắt | đúng như đã viết | OpenAlex: đóng | Không đổi |
| Hartung & Santilli 2018 | tóm tắt (ghi chú trước đã đọc toàn văn) | đúng như đã viết; nay có số tập 26(2), 308–321 | | Sửa trích dẫn |
| McAdams, Life Story Interview II (2007) | toàn văn (bản chính thức) | đúng nhưng phải sửa: bản chính thức đề năm 2007; tám cảnh khác danh sách trong ghi chú; trang nói không cần xin phép | Địa chỉ cũ trả 410; địa chỉ mới đọc được | Nếu dẫn thì dẫn bản 2007; các mục B2, B5, D, E là loại câu đã quyết định không hỏi |
