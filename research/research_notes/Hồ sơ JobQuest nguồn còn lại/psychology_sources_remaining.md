# Psychology, vocational-assessment, visualisation and astrology sources: remaining verification

Checked on 14 October 2026 against `research/reports/Hồ sơ JobQuest cơ chế game.md` and the first-round notes. Nothing under `_archive/` was opened. Nothing below is filled in from memory: every figure was read on the page named, and where the article itself could not be opened the entry says so. Format follows `research/research_notes/Hồ sơ JobQuest cơ chế game/source_verification.md` (same verification levels and verdict words). This file was written in two sittings; entries A1 to A4 come from the first, interrupted one and are kept as they were.

## How to read this file

**Levels.** Full text (the article itself, published layout) / author copy (manuscript or copy on the author's or the university's own site) / abstract (publisher, repository or index record) / secondary (known through another text or a search-result summary) / not obtained.

**Verdicts.** Confirmed as stated / confirmed with a correction / not supported / full text not obtainable.

**How texts were opened.**
- PDFs were fetched and their text layer extracted; in the first sitting some were read as page images. Journal page numbers for the second sitting are computed from the position of the PDF page (first journal page plus offset); the mapping was checked against printed running heads where one was visible (Su 2009, TIPI).
- The text layer drops some symbols (β, =, <, minus signs). Where a quote below shows them, they were restored from context; for Su et al. the signs agree with what round one read from the page image.
- Four abstracts (Wyman & Vyse, Ashton & Lee, Abeynayake, Vazire) reached me as a close paraphrase produced by the fetch tool from the Europe PMC record, not as verbatim text. They are marked "abstract (paraphrased record)".
- Abstracts marked "OpenAlex" were rebuilt word for word from the abstract index the OpenAlex API returns for the DOI.
- Pirate mirrors were not used. ResearchGate was not opened. "Third-party-hosted copy" means a copy of the published article on a university course site or a personal archive, not the publisher's or the authors' own.

**Walls met in this sitting.** ScienceDirect now answers both automated fetches and the in-app browser with a "confirm you are human" captcha; it was not completed, so every Elsevier article without another host stays where it was. HAL shows a bot challenge in the browser as well. The Semantic Scholar API returned "Too Many Requests". GVSU ScholarWorks PDFs return 403 (landing pages open). eScholarship closed the connection twice.

---

## A. Starred items

### A1. Savickas & Porfeli (2012), Journal of Vocational Behavior 80(3), 661–673

- **Claim in the notes** (`constructs_instruments_matching.md`, lines 25, 64, 80, 98): CAAS has 24 items (4 scales × 6); 13 countries; reliabilities "acceptable to excellent", total score excellent everywhere; metric but not scalar invariance. Licence terms "not found".
- **What the source says** (article-in-press copy, 13 pages, page numbers are those of that copy)
  - Items: "The resulting Career Adapt-Abilities Scale (CAAS) consists of four scales, each with six items" (abstract, p. 1). p. 6: "Initial analyses reduced the 11 items on each subscale to 6 items for each of the four subscales".
  - Research form: the abstract says "a research version of the proposed scale consisting of 55 items was field tested in 13 countries", but the Measurement section (p. 4) says a pool of 25 items per construct was cut by three US pilot studies to "four sets of 11 items" and "These 44 items became the research form". Appendix 1 (p. 11) prints the research form (I count 45 lines). The article contradicts itself (55 versus 44); do not quote the size of the research form.
  - Countries (p. 4): Belgium, Brazil, China, France, Iceland, Italy, Korea, the Netherlands, Portugal, South Africa, Switzerland, Taiwan, United States. Administered to "both students and adult workers". No total N is printed in the text read; the ANOVA degrees of freedom on p. 10 are (12, 7571) for concern and curiosity and (1, 5953) for the scales Brazil and Portugal shortened. 5.51% of participants were removed as multivariate outliers (p. 7).
  - Reliability, Table 1 (p. 7), Cronbach's alpha on combined data with the minimum and maximum across countries: Concern .83 (.76–.90); Control .74 (.65–.89); Curiosity .79 (.70–.89); Confidence .85 (.76–.91); total Adaptability .92 (.87–.96). p. 9: the control scale "is the most problematic with the samples from China and France exhibiting alphas below 0.70"; France had the lowest total (α = 0.87).
  - Invariance (abstract; pp. 8–9): metric invariance held; residual/strict and scalar invariance did not. So country means cannot be compared (p. 10 says so explicitly).
  - Format: stem "Please rate how strongly you have developed each of the following abilities"; five points from 5 = Strongest to 1 = Not strong (p. 4, Appendix 2 p. 12). The 24 items are printed in Appendix 2. Example items: "Thinking about what my future will be like", "Keeping upbeat", "Exploring my surroundings", "Solving problems".
  - The authors' own status statement (p. 10): the CAAS "is ready for further testing and development".
- **Terms of use.** The article states no licence. The form on Savickas's site carries only "© 2011 Mark L. Savickas & Erik J. Porfeli" on page 2 and no permission wording. The distribution site vocopher.com returned HTTP 404 at its root in the second sitting, so no terms page was read.
- **Verdict**: confirmed as stated (24 items, 13 countries, reliability wording, invariance). Add the numbers above. Licence: copyright is held by the authors; no open licence was found on the article or the form.
- **Level**: full text (article-in-press copy on the first author's site; all 13 pages read).
- **URLs read**: https://www.marksavickas.com/files/1_Savickas_bio/Interviews/Savickas%20Publications/Journal%20Articles/CAAS_International.pdf ; form https://www.marksavickas.com/files/Assessments/CAAS/1.%20CAAS%20master.pdf

### A2. Kristof-Brown, Zimmerman & Johnson (2005), Personnel Psychology 58(2), 281–342

- **Claim in the notes** (`constructs_instruments_matching.md`, lines 23, 264; flagged "read from a rotated scan, re-check before quoting"): person–job fit and job satisfaction ρ = .56 (k = 47, N = 12,960); .58 for directly perceived fit (k = 23) against .28 for objective indirect fit (k = 6, N = 531); person–organisation fit and job satisfaction ρ = .44 (k = 65).
- **What the source says** (clean text-layer copy; pp. 298–304 read)
  - p. 299: "PJ fit has strong correlations with the three primary attitudes studied in the fit literature: .56 with job satisfaction, .47 with organizational commitment, and −.46 with intent to quit."
  - Table 1 (p. 300), Person–Job fit, criterion job satisfaction. Columns are k, N, sample-weighted mean r, ρ:
    - Overall: 47; 12,960; .44; **.56**
    - Direct: Perceived: 23; 7,205; .45; **.58**
    - Indirect (all): 24; 4,908; .44; .56
    - Indirect, Subjective: 18; 4,377; .46; **.59**
    - Indirect, Objective: 6; 531; .22; **.28** (95% CI of the observed r from −.05 to .49; 80% credibility interval .13 to .43)
    - Demands–abilities fit 12; 3,735; .32; .41. Needs–supplies fit 32; 8,726; .48; .61.
  - Corrections (p. 298): ρ is corrected for sampling error and for unreliability in both predictor and criterion, using artifact distributions; no range-restriction correction.
  - Table 2 (p. 302), Person–Organisation fit and job satisfaction: overall k = 65, N = 42,922, r = .35, ρ = **.44**; direct perceived k = 30, ρ = .56; indirect k = 39, ρ = .35; indirect subjective k = 24, ρ = .46; indirect objective k = 19, ρ = .29.
- **Verdict**: confirmed, with a correction to how the contrast is worded. Both numbers are right (.58 and .28). But the low figure belongs to *objective* fit only (person and job measured from separate sources), on 6 effect sizes and 531 people, with a confidence interval that includes zero. *Subjective* indirect fit (the same person describes self and job separately, and the researcher computes the match) is .59, as high as perceived fit. So the accurate sentence is "fit computed from separate sources relates to satisfaction far less (.28, six small studies) than fit that rests on the person's own view of the job (.58–.59)", not "perceived fit beats computed fit".
- **Level**: full text (third-party-hosted copy of the published article, University of Mannheim seminar page).
- **URL read**: https://www.psychologie.uni-mannheim.de/cip/tut/seminare_wittmann/meta_fribourg/sources/Meta_person_job_fit.pdf

### A3. Barrick & Mount (1991), Personnel Psychology 44(1), 1–26

- **Claim in the notes** (`constructs_instruments_matching.md`, line 21; previous pass item 15): conscientiousness "showed consistent relations with all job performance criteria for all occupational groups"; extraversion valid for managers and sales; remaining dimensions small (ρ < .10).
- **What the source says** (scan; pp. 1–2 and 11–17 read)
  - Abstract (p. 1): five occupational groups (professionals, police, managers, sales, skilled/semi-skilled); three criteria (job proficiency, training proficiency, personnel data). The quoted sentence is there word for word.
  - Table 2 (p. 13), Conscientiousness, estimated true correlation ρ by group: professionals .20 (N = 767, 6 correlations); police .22; managers .22; sales .23; skilled/semi-skilled .21; mean .22. Observed mean r is .09–.13. p. 13: "remarkably consistent across the five occupational groups (ρ ranges from .20 to .23)".
  - Table 3 (p. 15), Conscientiousness by criterion: job proficiency .23, training proficiency .23, personnel data .20.
  - Extraversion (p. 14): managers ρ = .18, sales ρ = .15.
  - p. 11: correlations are "fully corrected", for unreliability in predictor and criterion (and range restriction).
  - p. 17: the authors themselves call the correlations "relatively small" and say they are underestimates because of the averaging method.
- **Verdict**: confirmed as stated. Add the size: ρ about .20–.23, i.e. conscientiousness is consistent across occupations but modest in size. This supports the notes' use of it ("how you work anywhere, not which job").
- **Level**: full text (scan, third-party-hosted copy). The number of studies and total N are on pages not read (pp. 3–10), so no k or N is given here.
- **URL read**: https://gwern.net/doc/psychology/personality/conscientiousness/1991-barrick.pdf

### A4. Clobert, Van Cappellen, Bourdon & Cohen (2016), Personality and Individual Differences 101, 348–355

- **Claim in the proposal** (block F, tagged "tóm tắt"): a positive or negative horoscope changes results on cognitive and creativity tasks. Notes (`games_products_zodiac.md`, line 206): N = 195, 189, 193; stronger with low internal locus of control.
- **What the abstract says** (UCLouvain repository record, where one author deposited the record): three experiments in which people read a positive or a negative horoscope. Positive horoscopes led to more favourable interpretation of ambiguous events (Experiment 1, N = 195), better cognitive performance (Experiment 2, N = 189) and more creativity (Experiment 3, N = 193). Among believers in astrology, positive horoscopes also reduced negative emotions. Effects on cognition and creativity were stronger for people with a low internal locus of control.
- **Verdict**: confirmed as stated, at abstract level. The abstract does not name the tasks, the effect sizes, or the sample (students or public; country).
- **Level**: abstract (read directly on a repository record, now from two independent records: ASU in round one, UCLouvain here).
- **Full text**: not obtainable. UCLouvain DIAL record says "No attached file found for this publication". HAL record hal-03157724: the in-app browser was also stopped at the "Making sure you're not a bot" page. OpenAlex lists the article as closed with no open copy. ScienceDirect: captcha.
- **URL read**: https://research.dial.uclouvain.be/handle/2078.5/183400

### A5. Nye, Su, Rounds & Drasgow (2017), Journal of Vocational Behavior 98, 138–151

- **Claim in the proposal** (block E, tagged "tóm tắt"): 92 studies give a "baseline" correlation of 0.32 between interest congruence and performance outcomes in general, against 0.16 for interest scores alone; "chưa kiểm được đã hiệu chỉnh hay chưa và gồm những loại hiệu suất nào".
- **What could be read**: nothing beyond the abstract already read in round one (92 studies, 1,858 correlations, "baseline correlations of 0.32 and 0.16", "performance outcomes"). Which outcomes are pooled and whether the figures are corrected is still unknown.
- **Verdict**: full text not obtainable. The proposal's current wording, including its own caveat, is accurate and should stay.
- **Level**: abstract (unchanged).
- **Tried in this sitting**: ScienceDirect through the DOI in the in-app browser (captcha page; a second attempt hung on the Elsevier redirect); OpenAlex (closed, no open location, no abstract field); Crossref (no abstract); Semantic Scholar API (HTTP 429); the University of Iowa repository record surfaced by search (record only); Rong Su's publication page (the domain now redirects to an unrelated domain, which was not followed); two web searches, one extended. A 2024 meta-analysis on academic outcomes surfaced by the search says the Nye work covered academic achievement but not persistence or satisfaction in a study programme; that is a search-result summary and was not read.
- **URL read**: none new. Round one: https://experts.illinois.edu/en/publications/interest-congruence-and-performance-revisiting-recent-meta-analyt/

### A6. Albo, Lanir, Bak & Rafaeli (2016), IEEE TVCG 22(1), 569–578; Abeynayake, Goonetilleke, Wijeweera & Reischl (2023), Applied Ergonomics 109, 103996

- **Claim in the proposal** (tension 3, tagged "tóm tắt"): Albo ranks radar least effective and least liked but only against two other circular forms; "bars read better than radar" rests on a 14-person study.
- **Albo, abstract (OpenAlex, word for word)**: "a controlled experiment that compares the Radar chart technique with two other radial visualization methods: Flower-charts as used in the well-known OECD Betterlife index, and Circle-charts"; the charts showed "the same data … applying small multiple views for different dimensions of the data"; "We compared users' performance and preference empirically under a formal task-taxonomy"; "the Radar chart was the least effective and least liked, while performance of the two other options were mixed and dependent on the task"; "strong preference of participants toward the Flower chart". The abstract also says radar charts are used "although in dispute" and that there was "no empirical evidence" on their effectiveness for these tasks before this study. No participant count, no task list.
- **Albo, design (secondary)**: a search result quotes a figure caption from the ResearchGate copy: "3 (Vis: Radars vs. Flowers vs. Circles) x 2 (Dimensions: 3 vs. 7) x 10 (tasks) mixed study design". Not read on the page; ResearchGate was not opened.
- **Abeynayake, abstract (paraphrased record, Europe PMC)**: fourteen participants answered questions on five graph types (bar, line, circular, bubble, radar) with eye movements recorded; bar and line were best on effectiveness, efficiency and perceived ease of use; radar was worst.
- **Verdict**: confirmed at abstract level; the proposal's wording and its scope caveat are accurate. Participant number and tasks for Albo remain unverified; if a design detail is wanted, "three charts × 3 or 7 dimensions × 10 tasks" may be given only as "theo chú thích hình, nguồn thứ cấp".
- **Level**: abstract (both); one design detail for Albo is secondary.
- **Full text**: not obtainable. Albo: OpenAlex closed; the lab page's PDF link still points to the dead `madadict.org`; the IEEE and ACM pages serve no text; Ben-Gurion and Haifa portals hold records only. Abeynayake: OpenAlex lists it as hybrid open access on the publisher site, Europe PMC as subscription-only; the publisher page (https://www.sciencedirect.com/science/article/pii/S0003687023000340) showed a captcha to the fetch tool and to the browser. A team member opening that URL by hand may get the full article.
- **URLs read**: https://api.openalex.org/works?filter=doi:10.1109/tvcg.2015.2467322 ; Europe PMC record for DOI 10.1016/j.apergo.2023.103996 ; http://haifahci.net/projects/composite-indicator/

### A7. McCrae & Costa (1989), Journal of Personality 57(1), 17–40; Pittenger (2005), Consulting Psychology Journal: Practice and Research 57(3), 210–221

- **Claim** (block B and notes line 247, 325): MBTI data show four continuous dimensions, not sixteen types (McCrae & Costa); the "about half change type at retest" figure is flagged as unverified and no number is cited.
- **McCrae & Costa**: nothing beyond the round-one abstract. OpenAlex: closed, no open copy; a web search returned only the Duke record (abstract) and secondary pages.
- **Pittenger 2005, abstract (OpenAlex, word for word)**: the article "evaluates several of the psychometric limitations and criticisms of the MBTI that warrant considerable caution when making inferences from its 4-letter type formula" and "concludes that the MBTI, while offering much intuitive appeal, may not yet be able to support the claims its promoters make." It is written as a reply to McCaulley (2000) on use in corporate settings. **The abstract contains no retest figure.**
- **Where the "50 percent" wording comes from (secondary)**: search results attribute the sentence "even when the test-retest interval is short (e.g., 5 weeks), as many as 50 percent of the people will be classified into a different type" to a different, earlier text by the same author: Pittenger (1993), "Measuring the MBTI… And Coming Up Short", *Journal of Career Planning and Employment 54*(1), 48–52, a practitioner magazine piece. The copy on an Indiana University page now redirects to the campus home page, so the sentence was not read. For the 2005 article the secondary sources still disagree (35% for the whole four-letter type after four weeks; 50% changing on at least one scale after five weeks; "39–76%"). One commentary says the 2005 article rests its reliability argument on four studies from 1962–1979 and itself cites later work finding strong retest reliability (Salter, Evans & Forney 1997; Capraro & Capraro 2002). None of this was read in the article.
- **An open peer-reviewed source that can carry the general point**: Stein & Swan (2019), *Social and Personality Psychology Compass*, doi:10.1111/spc3.12434 (authors' copy, full text read for these passages). p. 5: "(at least early versions of) the MBTI infamously lacked good reliability (Pittenger, 1993, 2005)". p. 7: "the dichotomy scores should tend to have bimodal distributions. Infamously, they do not (e.g., Pittenger, 2005)." p. 2: "The Myers-Briggs Company claims that reports of problems with the assessment's test–retest reliability are fixed in newer versions (Schaubhut, Herk, & Thompson, 2009)." Their reference list gives Pittenger (1993) as *Review of Educational Research 63*(4), 467–488, i.e. there are two different 1993 Pittenger texts.
- **Verdict**: McCrae & Costa unchanged (confirmed at abstract level). Pittenger: full text not obtainable; **the exact retest statement, its figures and the primary study cited remain unverified**, and "about half change type" must still not be written with Pittenger (2005) as its source. The claim that scores are not bimodal and that reliability of earlier forms was poor can be cited to Stein & Swan (2019), who cite Pittenger for both.
- **Level**: abstract (both); Stein & Swan author copy for the supporting sentences.
- **Tried**: OpenAlex (both closed); two searches (one extended); the Indiana copy of the 1993 magazine piece (redirect); ResearchGate not opened.
- **URLs read**: OpenAlex record for DOI 10.1037/1065-9293.57.3.210 ; https://swanpsych.com/publications/SteinSwanMBTITheory_2019.pdf

### A8. Whiston, Li, Goodrich Mitts & Wright (2017), Journal of Vocational Behavior 100, 175–184

- **Claim in the notes** (`profile_page_feedback_privacy.md`, lines 62, 72, 333; tagged secondary): a replication of Brown & Ryan Krane (2000) covering 57 studies, largest effects on career decision-making self-efficacy, with counsellor support, values clarification and psycho-educational interventions as the important ingredients.
- **What could be read**: no abstract and no text. Bibliographic details only (volume 100, pp. 175–184, June 2017). Search-result summaries of three secondary pages add, without my having opened them: 57 studies; 19 intervention components examined; biggest effects for self-efficacy; one blog's gloss that participants had "a 60% chance" of scoring above a control participant; one UK paper's reading that individual guidance had larger effects than other formats. These summaries do not all agree on what the "critical ingredients" are.
- **Verdict**: full text not obtainable; the claim stays secondary. No number from this meta-analysis (studies, effect size, ingredients) should go into the report until someone reads at least the abstract by hand.
- **Level**: secondary.
- **Tried**: ScienceDirect through the DOI in the in-app browser (captcha); OpenAlex (closed, no abstract); Crossref (no abstract); Semantic Scholar API (429); one web search.
- **URL to open by hand**: https://www.sciencedirect.com/science/article/pii/S0001879117300283

### A9. Soto, John, Gosling & Potter (2008), JPSP 94(4), 718–737

- **Claim in the proposal** (block B, tagged "tóm tắt"): at the younger end of ages 10–20 respondents differ a lot in acquiescent responding. The notes' table (line 60) still says "acquiescence problem below ~age 15".
- **What the source says** (20-page copy on the first author's lab site; pages given as journal pages)
  - Sample (p. 722): "Participants were 230,047 volunteers who provided personality and demographics data over the World Wide Web. All respondents were between the ages of 10 and 20 (M = 16.6 years)", 90% United States and 10% Canada; instrument: the 44-item Big Five Inventory.
  - Variability (p. 724): "variance in acquiescence scores was substantially larger in younger age groups"; "there was fully twice as much variability in acquiescence at age 10 (variance = 0.14) as at age 20 (variance = 0.07)". The *mean* level of acquiescence did not differ by age.
  - The age the article names (p. 732): "prior to age 14, acquiescence variation had especially strong effects on the coherence, differentiation, and overall factor structure of the BFI. Indeed, when individual differences in acquiescence were not controlled, the BFI's intended factor structure could not be recovered at age 10."
  - Recommendation (p. 732): when using self-reports from "children and early adolescents", control for acquiescence, especially at item level or with scales that have unbalanced keying.
- **Verdict**: confirmed with a correction. The effect is real and large; the age the article gives is "prior to age 14", not "about 15". Replace "below ~age 15" in the notes' table with "strongest before 14; variance halves between 10 and 20". The proposal's own sentence (10–20, younger end) is correct as written and can now be tagged full text.
- **Level**: author copy, full text (pp. 718, 722, 724, 732 read; the factor tables by age were not).
- **URL read**: https://www.colby.edu/wp-content/uploads/2013/08/Soto_et_al_2008.pdf

### A10. Prediger (1982), Journal of Vocational Behavior 21(3), 259–287

- **Claim in the notes** (line 277): located as a citation only; the formulas turning RIASEC scores into Data–Ideas and Things–People were not verified, "so none is given here".
- **What could be read**: not the article, and not its abstract (OpenAlex has none; the publisher page timed out behind the Elsevier redirect). Two facts from Su, Rounds & Armstrong (2009), read in full text: p. 862, "Prediger (1982) proposed two bipolar work task dimensions underlying Holland's hexagon: working with things versus people and working with data versus ideas"; p. 864, Su et al. computed the two dimensions "using the formulas in the UNIACT–Revised Edition manual (American College Testing Program, 1995, p. 126), with a larger score indicating stronger interest in working with things or data". So even Su et al. take the formulas from the ACT manual, not from the 1982 article. An open-access article that the search suggested for the coefficients (IJERPH 2023, PMC9819525) does not contain them.
- **Verdict**: full text not obtainable; the formulas remain unverified and none should be printed. If the team ever needs them, the source to obtain is the ACT UNIACT manual (1995, p. 126), with Prediger (1982) cited for the two dimensions only.
- **Level**: secondary (via Su et al. 2009, full text).
- **Leads not opened**: ERIC document ED267308 (Prediger's World-of-Work Map procedures).

---

## B. Retried items

### B1. Hoff, Song, Wee, Phan & Rounds (2020), Journal of Vocational Behavior 123, 103503

- **Verdict**: full text not obtainable; unchanged at abstract level, confirmed as stated in round one (105 studies, k = 194, N = 39,602, ρ = 0.19 [0.16, 0.21]).
- **Tried**: OpenAlex (closed, no open copy, no abstract field); one web search for an OSF, PsyArXiv or accepted-manuscript copy (none; only an Academia.edu profile listing and the press release); ScienceDirect is behind the captcha.

### B2. Hanna & Rounds (2020), Psychological Bulletin 146(9), 765–796

- **Verdict**: article full text not obtainable; unchanged (abstract for the article, full text for the 2018 thesis).
- **Tried**: OpenAlex marks the article "green open access", but the location it gives is the IDEALS file `items/109885/bitstreams/359336/data.pdf`, which is the 2018 master's thesis already read in round one, not the article. No other open copy is listed.

### B3. Su, Rounds & Armstrong (2009), Psychological Bulletin 135(6), 859–884: the age statement

- **Statement to add, with pages** (same third-party-hosted copy as round one)
  - p. 867: "As age increases, effect size of the sex differences on the Things–People dimension (β = −.24, p < .05) and Social interest (β = −.45, p < .01) decreases."
  - p. 878: "The age effect was generally small. The only noteworthy impact of age on vocational interests was that for older samples, sex differences were smaller for Social interests and engineering interests, which contributes overall to a smaller sex difference in the Things–People dimension, although the general tendency of men to prefer working with things and women to favor working with people never becomes trivial in the older samples." The authors add that these results are cross-sectional, with cohort controlled.
- **Verdict**: confirmed. "Larger in younger samples" is supported (p. 867), but the authors call the age effect small; write "somewhat larger in younger samples (β = −.24)", not "much larger".
- **Level**: full text.
- **URL read**: https://emilkirkegaard.dk/en/wp-content/uploads/Men-and-things-women-and-people-A-meta-analysis-of-sex-differences-in-interests.pdf

---

## C. Feedback, self-knowledge and personal informatics

### C1. Chen (2025), Frontiers in Psychology 16, doi:10.3389/fpsyg.2025.1625771

- **Claim in the notes** (`profile_page_feedback_privacy.md`, lines 59, 67, 253): adolescents (13–18, M = 15.6, n = 120) reacted more strongly than adults (25–40, n = 120) to positive and negative feedback in a simulated social-media setting (Age × Valence, p = .002); authenticity buffered negative feedback; and (line 253) "social comparison amplified feedback effects".
- **What the source says** (open-access article page; the first 100,000 of about 122,000 characters were read, which covers methods, results and limitations)
  - Single author, Yu-Hsing Chen, Jinan University; published 23 September 2025.
  - 240 urban Chinese participants from Beijing, Hangzhou and Chengdu. Adolescents n = 120, 13–18, M = 15.6 (SD 1.4); adults n = 120, 25–40, M = 32.1 (SD 4.2).
  - Design, in the article's words "a cross-sectional, quasi-experimental design": a simulated profile modelled on WeChat Moments and Xiaohongshu with positive, neutral or negative comments; feedback condition randomly assigned; no pre-test.
  - Outcome: Mandarin State Self-Esteem Scale. Age × Valence F(2, 234) = 6.65, p = .002, η² = .05. Means: adolescents 4.25 after positive and 3.12 after negative feedback; adults 4.05 and 3.45.
  - Authenticity: a five-item scale; Valence × Authenticity B = 0.19, p = .007; tested on the whole sample, not by age group.
  - Social comparison: **measured** with the INCOM scale, not manipulated; it statistically mediated the feedback–self-esteem link (comparison orientation to self-esteem B = −0.45).
  - Limitations stated by the author: simulated environment, self-reported feedback monitoring, no pre/post measurement, urban and highly educated sample, Chinese cultural context.
  - The fetch tool also reported that the F for the age main effect differs between two tables (28.27 and 32.36). I did not see the tables myself; treat as a reason to quote only the interaction.
- **Verdict**: confirmed with a correction. The age-by-valence finding and the sample are as stated. "Social comparison amplified feedback effects" overstates it: the study shows a cross-sectional mediation through a self-report comparison scale, with no comparison condition. It says nothing about ranks or percentiles shown to a player. One small simulated study by one author; use as an illustration, not as the basis for a rule.
- **Level**: full text (publisher's open-access page).
- **URL read**: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1625771/full

### C2. Gosling, Ko, Mannarelli & Morris (2002), JPSP 82(3), 379–398

- **Claim in the notes** (line 164, tagged secondary): strangers who saw only an office or bedroom agreed with one another and were partly accurate, best for openness and conscientiousness; sex and race stereotypes partly drove judgments.
- **What the source says** (lab-hosted copy of the published article)
  - Abstract (p. 379): "(a) personal environments elicit similar impressions from independent observers, (b) observer impressions show some accuracy, (c) observers rely on valid cues in the rooms to form impressions of occupants, and (d) sex and race stereotypes partially mediate observer consensus and accuracy."
  - Study 1 (pp. 384–385): "Ninety-four office occupants"; "Eight observers" (seven in some cases); consensus: "the mean of the 28 pairwise correlations was positive and significant (r = .34)". Accuracy: "highest for Openness, followed by Extraversion, Conscientiousness, and Emotional Stability. Judgments of Agreeableness were not accurate."
  - Study 2 (p. 389): "Eighty-three college students or recent graduates" (mean age 21.9), seven observers, bedrooms. "Accuracy was strongest for Openness, followed by Conscientiousness and Emotional Stability. Accuracy was significant but weaker for Extraversion and Agreeableness."
  - In the cue analyses of both studies the authors call Openness and Conscientiousness "the two most accurately judged traits".
- **Verdict**: confirmed as stated. Can be tagged full text; trait-level accuracy correlations were not copied, so none should be quoted.
- **Level**: full text (authors' lab copy).
- **URL read**: https://gosling.psy.utexas.edu/wp-content/uploads/2014/09/JPSP02-Roomwithacue.pdf

### C3. Vazire (2010), JPSP 98(2), 281–300

- **Claim in the notes** (lines 61, 68, 244, tagged secondary): the self is predicted to be more accurate for low-observability traits (e.g. neuroticism), others for highly evaluative traits (e.g. intellect); tested with 165 participants rated by self, friends and strangers.
- **What the source says** (author's site copy)
  - Abstract (p. 281): the model predicts "the self should be more accurate than others for traits low in observability (e.g., neuroticism), whereas others should be more accurate than the self for traits high in evaluativeness (e.g., intellect)". "165 participants provided self-ratings and were rated by 4 friends and up to 4 strangers in a round-robin design. Participants then completed a battery of behavioral tests from which criterion measures were derived." Result: "the self was the best judge of neuroticism-related traits, friends were the best judges of intellect-related traits, and people of all perspectives were equally good at judging extraversion-related traits."
  - Limitations (pp. 294–295): a restricted range of traits; and possible overlap between rating and criterion, since most criterion measures were observer-based.
- **Verdict**: confirmed as stated. Note for the inference at line 68: the better judges of intellect were *friends*, not strangers, and the criterion was behaviour in laboratory tests. The step from there to "play behaviour complements self-report for evaluative qualities" is the team's inference.
- **Level**: full text (author's copy; abstract, model statements and limitations read; the results tables were not).
- **URL read**: http://www.simine.com/docs/Vazire_JPSP_2010.pdf

### C4. Li, Dey & Forlizzi (2010), CHI '10, pp. 557–566

- **Claim in the notes** (lines 246, 261, tagged secondary): five stages (preparation, collection, integration, reflection, action); barriers cascade; stages are iterative.
- **What the abstract says** (OpenAlex, word for word): based on "surveys and interviews with people who collect and reflect on personal information", the authors "derived a stage-based model of personal informatics systems composed of five stages (preparation, collection, integration, reflection, and action) and identified barriers in each of the stages. These stages have four essential properties: barriers cascade to later stages; they are iterative; they are user-driven and/or system-driven; and they are uni-faceted or multi-faceted."
- **Verdict**: confirmed as stated. Level rises from secondary to abstract. Sample size is not in the abstract.
- **Level**: abstract. Full text not sought further (ACM page closed; low priority).
- **URL read**: https://api.openalex.org/works?filter=doi:10.1145/1753326.1753409

---

## D. Values, strengths and the best self

### D1. Schwartz (1992), Advances in Experimental Social Psychology 25, 1–65; the PVQ-RR

- **Claim in the notes** (`strengths_values_ikigai_nguhanh.md`, lines 44–66): ten basic values in a circular structure; Schwartz's repository lists Vietnamese versions of the PVQ-RR; item count of the PVQ-RR and the minimum recommended age "not found, do not quote from memory".
- **Schwartz (1992)**: not obtained. No abstract in OpenAlex; publisher page behind the captcha.
- **Schwartz's own open restatement** (Schwartz 2012, *Online Readings in Psychology and Culture 2*(1), doi:10.9707/2307-0919.1116, CC BY-NC-ND 3.0; landing-page abstract read, PDF returns 403): "The theory identifies ten basic personal values that are recognized across cultures"; "values form a circular structure that reflects the motivations each value expresses"; "Findings from 82 countries … provide evidence for the validity of the theory across cultures." The abstract does not list the ten values.
- **PVQ-RR** (Schwartz & Cieciuch 2022, *Assessment 29*(5), doi:10.1177/1073191121998760, open access, PMC9131418; full text read through the Europe PMC full-text service)
  - "The PVQ-RR includes 57 items. Three items measure each of the 19 values." So the PVQ-RR measures the 19 values of the refined theory, not ten; the ten are obtained by combining.
  - 49 cultural groups, N = 53,472, 32 language versions (abstract). "The PVQ-RR reliably measured 15 of the 19 values in the vast majority of groups and two others in most groups."
  - "Respondents received a version of the PVQ that is matched to their own gender."
  - **A Vietnamese sample is in this study**: the sample table has a row "Vietnam, 749, Vietnamese, 65.6, 20.3 (1.3)"; by the table's layout these are N, language, percent female and mean age (SD). I read the row from the extracted text, not the typeset table, so the column meaning should be re-checked before quoting. A mean age of 20.3 with SD 1.3 is a university sample, not adolescents.
  - Minimum age: **not stated** in the passages read. The article says only that the earlier abstract instrument (the SVS) "did not work as well with adolescent respondents and those with less education", which is why the portrait format was developed.
- **Verdict**: ten values and circular structure confirmed at abstract level through Schwartz (2012), not through the 1992 chapter. PVQ-RR item count now verified: 57 items, 3 per value, 19 values. Stated minimum age: not found; do not state one.
- **Level**: Schwartz 1992 not obtained; Schwartz 2012 abstract; Schwartz & Cieciuch 2022 full text (open access).
- **URLs read**: https://scholarworks.gvsu.edu/orpc/vol2/iss1/11/ ; https://www.ebi.ac.uk/europepmc/webservices/rest/PMC9131418/fullTextXML

### D2. Peterson & Seligman (2004), *Character Strengths and Virtues*; McGrath on the virtue structure

- **Claim** (notes lines 13–19; proposal's VIA row): 24 strengths under six virtues; the six-virtue grouping "never replicated" in factor analyses (McGrath & Walker 2016, already full text in round one).
- **What was read**: the book is not open. The VIA Institute's own classification page lists six virtues and 24 strengths: Wisdom (5: creativity, curiosity, judgment, love of learning, perspective), Courage (4: bravery, honesty, perseverance, zest), Humanity (3: kindness, love, social intelligence), Justice (3: fairness, leadership, teamwork), Temperance (4: forgiveness, humility, prudence, self-regulation), Transcendence (5: appreciation of beauty and excellence, gratitude, hope, humor, spirituality). The page does not cite the 2004 book.
- **Verdict**: confirmed as stated (24 under six) on the rights-holder's page. McGrath: no change from round one.
- **Level**: book not obtained; publisher's page full text; McGrath & Walker full text (round one).
- **URL read**: https://www.viacharacter.org/character-strengths

### D3. Roberts, Dutton, Spreitzer, Heaphy & Quinn (2005), Academy of Management Review 30(4), 712–736

- **Claim in the notes** (lines 79, 91): the Reflected Best Self Exercise, attributed to this article, has participants collect stories from significant others, find patterns and write a portrait; known only through Spreitzer et al. (2009).
- **What the abstract says** (OpenAlex, word for word): "We present a theory of how individuals compose their reflected best-self portrait, which we define as a changing self-knowledge structure about who one is at one's best. We posit that people compose their reflected best-self portrait through social experiences that draw on intrapsychic and interpersonal resources."
- **Verdict**: confirmed with a correction. The 2005 AMR article is a theory paper about the *portrait* (the self-knowledge structure). Its abstract does not describe the exercise steps. Cite it for the concept and definition; cite Spreitzer, Stephens & Sweetman (2009) for the procedure, as the notes already do.
- **Level**: abstract. Full text not obtainable (OpenAlex closed; the Center for Positive Organizations page returned 403 in round one).
- **URL read**: https://api.openalex.org/works?filter=doi:10.5465/amr.2005.18378874

---

## E. Short personality instruments

### E1. Goldberg et al. (2006), Journal of Research in Personality 40(1), 84–96 (IPIP)

- **Verdict**: unchanged from the notes (abstract, WUSTL record): 2,000+ items, public domain, free to translate and put online. Not re-read: OpenAlex has no abstract for it, the publisher is behind the captcha, and ipip.ori.org failed to resolve in round one.
- **Level**: abstract (earlier round). Independent support in this sitting: the Mini-IPIP abstract (E2) calls its parent a public "International Personality Item Pool" measure.

### E2. Donnellan, Oswald, Baird & Lucas (2006), Psychological Assessment 18(2), 192–203 (Mini-IPIP)

- **Claim in the notes** (line 59, 75): 20 items, four per factor; internal consistencies "at or well above .60".
- **What the abstract says** (OpenAlex, word for word): "The Mini-IPIP, a 20-item short form of the 50-item International Personality Item Pool-Five-Factor Model measure (Goldberg, 1999), was developed and validated across five studies. The Mini-IPIP scales, with four items per Big Five trait, had consistent and acceptable internal consistencies across five studies (α = at or well above .60) … and test-retest correlations that were quite similar to the parent measure across intervals of a few weeks (Study 4) and several months (Study 5)."
- **Verdict**: confirmed as stated. Scale-by-scale alphas need the full text, which is not open (OpenAlex closed).
- **Level**: abstract.

### E3. Gosling, Rentfrow & Swann (2003), Journal of Research in Personality 37, 504–528 (TIPI)

- **Claim in the notes** (lines 61, 78): ten items, two per dimension; "somewhat inferior to standard multi-item instruments"; for use where personality "is not the primary topic of interest". No reliabilities were given.
- **What the source says** (lab-hosted copy of the published article)
  - Abstract (p. 504): "Although somewhat inferior to standard multi-item instruments, the instruments reached adequate levels" on convergence, retest reliability, external correlates and self–observer convergence; recommended where "personality is not the primary topic of interest, or researchers can tolerate the somewhat diminished psychometric properties".
  - Study 2 (p. 507): "a sample of 1813 undergraduate students"; items rated on a 7-point scale.
  - Internal consistency (p. 516): "the Cronbach alphas were .68, .40, .50, .73, and .45 for the Extraversion, Agreeableness, Conscientiousness, Emotional Stability, and Openness to Experience scales respectively." The authors explain that two-item scales built for breadth give low alphas and that retest correlations are the better reliability estimate.
  - Retest (pp. 507, 518): 180 participants retested after six weeks; "the test–retest correlations for the TIPI are substantial (mean r = .72), albeit weaker than the two-week test–retest correlations of the BFI (mean r = .80)".
- **Verdict**: confirmed as stated; add the reliabilities. Alpha as low as .40 means a TIPI score on one player is too noisy to show as a bar.
- **Level**: full text.
- **URL read**: https://gosling.psy.utexas.edu/wp-content/uploads/2014/09/JRP-03-tipi.pdf

### E4. Ashton & Lee (2009), Journal of Personality Assessment 91(4), 340–345 (HEXACO-60)

- **Claim in the notes** (line 62): 60 items; reliability "not retrieved".
- **What the abstract says** (paraphrased record, Europe PMC): a 60-item short form with 10 items for each of the six dimensions; in samples of students and community adults the scales showed reasonably high internal consistency and low intercorrelations; scores aligned with Big Five measures and self–observer agreement was good; recommended when administration time is limited.
- **Verdict**: confirmed as stated (60 items). The abstract gives no reliability number.
- **Level**: abstract (paraphrased record). Full text not open (OpenAlex closed).

### E5. Soto & John (2017), JPSP 113(1), 117–143 (BFI-2)

- **Verdict**: unchanged (abstract, round one: 60 items, 15 facets in five domains). An author copy exists at the University of California repository (OpenAlex: green open access, https://escholarship.org/uc/item/16x6n05t), but the server closed the connection on both attempts, so reliabilities were not read. A team member can open that link by hand.
- **Level**: abstract.

---

## F. Astrology

### F1. Wyman & Vyse (2008), Journal of General Psychology 135(3), 287–300

- **Claim in the notes** (line 190, tagged snippet): 52 students identified their real NEO-FFI profile above chance but not their real astrological summary; a Barnum effect appeared in accuracy ratings of both.
- **What the abstract says** (paraphrased record, Europe PMC): a double-blind study of 52 college students; participants identified their true NEO-FFI profiles above chance but could not identify their true astrological summaries; a Barnum effect appeared in accuracy ratings for both measures; **no difference between favourable and unfavourable astrological signs**.
- **Verdict**: confirmed as stated. Level rises from search snippet to abstract. The last finding bears on F2.
- **Level**: abstract (paraphrased record). Full text not open (OpenAlex closed).

### F2. Hamilton (2001), "Who believes in astrology?", Personality and Individual Differences 31(6), 895–902

- **Claim in the notes** (Gaps, line 216): favourable signs and belief; not opened.
- **Verdict**: not obtained. No abstract in OpenAlex or Crossref; publisher behind the captcha. Nothing in the proposal rests on it. If it is ever cited, note that Wyman & Vyse (F1) report no favourable-sign effect.
- **Level**: not obtained (bibliographic metadata only; DOI 10.1016/S0191-8869(00)00191-4 resolves to this title).

### F3. Hartmann, Reuter & Nyborg (2006), Personality and Individual Differences 40(7), 1349–1362

- **Claim in the notes** (Gaps, line 216): large-sample null result for date of birth; not opened.
- **What was seen** (search-result summary of the abstract held in the US National Longitudinal Surveys bibliography; the record itself was not opened): two samples, more than 4,000 middle-aged men from the Vietnam Experience Study and more than 11,000 young adults from the NLSY79; no relation between date of birth, including sun sign, and personality or general intelligence.
- **Verdict**: consistent with the notes, at secondary level only. Lu et al. (2020), already full text, makes the same point with a far larger sample, so the proposal does not need this source.
- **Level**: secondary. Record to open: https://nlsinfo.org/bibliography/search/ (title search).

### F4. Dean & Kelly (2003), Journal of Consciousness Studies 10(6–7), 175–198

- **Claim in the notes** (line 189, taken from Wikipedia): a meta-analysis pooled "40 studies consisting of 700 astrologers and over 1,000 birth charts"; "2011 sets of people born within 5 minutes of each other" showed no effect; agreement between astrologers across 25 studies was about 0.1.
- **What the source says** (full-text reproduction on astrology-and-science.com; the page states the article was first published in the journal issue above and that this version adds two time-twin graphics; the page does not name who runs the site)
  - Time twins: "2101 persons born in London during 3-9 March 1958", "born on average 4.8 minutes apart"; "Measurements at ages 11, 16 and 23 had provided for each person 110 relevant variables"; "the results are uniformly negative".
  - Astrologer accuracy: "more than forty studies have been reported totalling nearly 700 astrologers and 1150 birth charts"; "a mean effect size of 0.051, standard deviation 0.118".
  - Astrologer agreement: "twenty-five studies … involving a total of nearly 500 astrologers"; "a mean agreement (as an effect size) of 0.101, standard deviation 0.064".
- **Verdict**: confirmed with a correction. The time-twin figure is **2,101 persons**, not "2011 sets"; they were born on average 4.8 minutes apart. The other two figures are right: more than 40 studies, nearly 700 astrologers, 1,150 charts, mean effect 0.051; 25 studies, agreement 0.101.
- **Level**: full text of a third-party-hosted reproduction, not the journal's typeset pages (the publisher sells the article), so no page numbers are given.
- **URL read**: https://astrology-and-science.com/D-psia2.htm

### F5. Lillqvist & Lindeman (1998), European Psychologist 3(3), 202–208

- **Claim in the notes** (line 204, tagged snippet): students taking an astrology course became more certain of their self-descriptions; interest in astrology tracked the number of personal crises.
- **What the abstract says** (OpenAlex, word for word): "Forty students in elementary courses of astrology, psychology, and German language rated their certainty about 20 self-describing attributes and three assumptions related to the self." "Participation in an astrology course, but not in psychology or German courses, verified the participant's self-concept by increasing certainty of the self-descriptive attributes and the assumptions of self-control and perceived luck. In addition, interest in astrology was positively correlated with the number of personal crises, but not with the number of past traumatic events."
- **Verdict**: confirmed as stated; add that the whole study has 40 students across three courses. Level rises from snippet to abstract.
- **Level**: abstract. Full text not open.

### F6. Andersson, Persson & Kajonius (2022), Personality and Individual Differences 187, 111389

- **Claim in the notes** (line 205): online sample N = 264; narcissism the strongest predictor of belief in astrology; intelligence related negatively.
- **What the abstract says** (OpenAlex, word for word): "Data was collected for 264 participants through an anonymous online survey shared on social media. The survey consisted of four instruments: Belief in Astrology (BAI), the Big Five personality traits (IPIP-30), narcissism (SD3) and intelligence (ICAR16-R3D). Data analysis was done with multiple linear regression. Narcissism was surprisingly the strongest predictor, and intelligence showed a negative relationship with belief in astrology."
- **Verdict**: confirmed as stated. A convenience sample recruited through social media.
- **Level**: abstract. OpenAlex lists the article as open access on the publisher's site, which is behind the captcha; not read in full.

---

## What follows for the proposal and the notes

1. **Soto et al. (block B; notes table line 60).** The proposal's sentence is right and can be tagged "toàn văn". In the notes' instrument table replace "below ~age 15" with "mạnh nhất trước 14 tuổi; phương sai ở tuổi 10 gấp đôi tuổi 20". This strengthens the decision not to score personality self-reports for the youngest players.
2. **Kristof-Brown (notes; if used in block E).** Write the contrast as objective fit (.28, six small studies, interval includes zero) against fit resting on the person's own view (.58–.59). Remove the "re-check" flag.
3. **Chen 2025 (notes line 253).** Replace "social comparison amplified feedback effects" with "xu hướng so sánh xã hội (tự khai) làm trung gian thống kê". The no-ranking rule stays the team's design judgment; this study does not test rankings.
4. **Dean & Kelly (notes line 189).** 2,101 people, not 2011; cite the article, not Wikipedia.
5. **Su et al. (block B).** The optional sentence about younger samples can be added with p. 867 and the authors' own "generally small".
6. **MBTI retest.** Still no figure. If a sentence on reliability is wanted, cite Stein & Swan (2019) for "earlier forms lacked good reliability; scores are not bimodal", and note the publisher's claim that newer forms fixed it.
7. **Nye, Whiston, Albo, Abeynayake, Prediger, Hoff, Hanna.** No change possible; keep the current tags. Whiston must not be cited with numbers.
8. **Schwartz row.** Can now say the PVQ-RR has 57 items for 19 values and that the 49-group validation includes a Vietnamese university sample (N = 749 as read from the extracted table). No minimum age is stated in what was read. This does not change the "open question only" decision; 57 items is far outside a five-minute budget.
9. **TIPI.** Add the alphas (.40 to .73) and six-week retest (.72) to the instrument table; they explain why a two-item scale cannot feed a displayed bar.
10. **Roberts et al.** Cite for the concept; Spreitzer et al. (2009) for the exercise steps.

---

## Bảng trạng thái

| Nguồn | Mức đọc được | Kết quả | Đã thử gì nếu chưa lấy được | Ảnh hưởng tới đề xuất |
|---|---|---|---|---|
| Nye, Su, Rounds & Drasgow 2017 | tóm tắt | đúng như đã viết (0,32 so với 0,16; chưa biết loại hiệu suất và có hiệu chỉnh hay không) | ScienceDirect qua trình duyệt (captcha, không vượt); OpenAlex, Crossref (không có tóm tắt, không có bản mở); Semantic Scholar (429); kho Iowa; trang của Rong Su (tên miền đã đổi chủ); hai lượt tìm | Khối E giữ nguyên câu và lời dè dặt hiện có |
| Albo, Lanir, Bak & Rafaeli 2016 | tóm tắt (thiết kế 3 × 2 × 10: thứ cấp) | đúng như đã viết; số người tham gia vẫn chưa biết | OpenAlex (đóng); liên kết PDF ở trang phòng thí nghiệm đã chết; IEEE, ACM không trả văn bản; không mở ResearchGate | Chỗ căng 3 giữ nguyên; không dẫn số người tham gia |
| Abeynayake và cộng sự 2023 | tóm tắt | đúng như đã viết (14 người; thanh và đường tốt nhất, radar kém nhất) | Trang nhà xuất bản được ghi là truy cập mở nhưng chặn bằng captcha với cả công cụ lẫn trình duyệt | Giữ nguyên; nên có người mở tay liên kết ScienceDirect để nâng lên toàn văn |
| McCrae & Costa 1989 | tóm tắt | đúng như đã viết (bốn chiều liên tục, không có bằng chứng về loại) | OpenAlex (đóng); tìm kiếm chỉ ra bản ghi của Duke | Không đổi |
| Pittenger 2005 | tóm tắt | không đỡ được nhận định "khoảng một nửa đổi loại": tóm tắt không có con số; câu "tới 50%" được nguồn thứ cấp gán cho một bài khác của Pittenger năm 1993 | OpenAlex (đóng); hai lượt tìm; bản 1993 ở Indiana đã chuyển hướng; không mở ResearchGate | Vẫn không dẫn con số; nếu cần thì dẫn Stein & Swan (2019) cho ý "bản cũ kém tin cậy, điểm không phân hai đỉnh" |
| Clobert và cộng sự 2016 | tóm tắt | đúng như đã viết (N = 195, 189, 193) | Kho UCLouvain không có tệp; HAL chặn bot cả trong trình duyệt; ScienceDirect captcha | Khối F giữ nhãn "tóm tắt" |
| Whiston và cộng sự 2017 | thứ cấp | chưa kiểm được: 57 nghiên cứu, cỡ hiệu ứng, thành tố then chốt | ScienceDirect (captcha); OpenAlex, Crossref (không có tóm tắt); Semantic Scholar (429); một lượt tìm | Không đưa con số nào của bài này vào báo cáo cho tới khi có người đọc tay ít nhất phần tóm tắt |
| Soto, John, Gosling & Potter 2008 | bản tác giả (toàn văn) | đúng nhưng phải sửa: mốc bài báo nêu là "trước 14 tuổi", không phải "khoảng 15"; phương sai ở tuổi 10 gấp đôi tuổi 20; N = 230.047 | | Câu ở khối B đúng, đổi nhãn thành toàn văn; sửa bảng công cụ trong ghi chú |
| Barrick & Mount 1991 | toàn văn (bản quét) | đúng như đã viết; thêm cỡ: ρ khoảng 0,20–0,23 | | Không đổi; có thể thêm cỡ hiệu ứng |
| Kristof-Brown, Zimmerman & Johnson 2005 | toàn văn | đúng nhưng phải sửa: 0,28 là của độ khớp khách quan (6 hệ số, 531 người, khoảng tin cậy chứa 0); độ khớp chủ quan gián tiếp là 0,59, ngang 0,58 của độ khớp tự cảm nhận | | Sửa cách viết phép so sánh; bỏ cờ "cần kiểm lại" |
| Prediger 1982 | thứ cấp (qua Su và cộng sự 2009) | chưa kiểm được công thức; Su và cộng sự lấy công thức từ sổ tay UNIACT (ACT 1995, tr. 126), không phải từ bài 1982 | OpenAlex (không tóm tắt, đóng); trang nhà xuất bản treo; một bài truy cập mở được gợi ý không chứa hệ số | Không in công thức; đề xuất đã bỏ trục Người–Vật nên không ảnh hưởng |
| Savickas & Porfeli 2012 (CAAS) | toàn văn (bản tác giả) | đúng như đã viết; 24 câu, 13 nước, alpha tổng 0,92; giấy phép: chỉ có dòng bản quyền, không có giấy phép mở | vocopher.com trả 404 | Không dùng CAAS làm chỉ số; nếu dùng phải xin phép tác giả |
| Hoff và cộng sự 2020 | tóm tắt | đúng như đã viết | OpenAlex (đóng); tìm bản OSF, PsyArXiv; ScienceDirect captcha | Không đổi |
| Hanna & Rounds 2020 | tóm tắt (bài báo); toàn văn (luận văn 2018) | đúng như đã viết ở vòng trước | Bản "mở" mà OpenAlex chỉ tới chính là luận văn 2018 | Không đổi |
| Su, Rounds & Armstrong 2009 (câu về tuổi) | toàn văn | đúng: chênh lệch giảm khi tuổi tăng (β = −0,24, tr. 867); tác giả gọi ảnh hưởng của tuổi là "nhỏ" (tr. 878) | | Có thể thêm câu này vào khối B, viết là "hơi lớn hơn ở mẫu trẻ" |
| Chen 2025 | toàn văn | đúng nhưng phải sửa: so sánh xã hội được đo bằng thang tự khai và làm trung gian, không phải được thao tác; một tác giả, 240 người, môi trường mô phỏng | | Sửa câu ở ghi chú dòng 253; quy tắc không xếp hạng là quyết định thiết kế, không dựa vào bài này |
| Gosling, Ko, Mannarelli & Morris 2002 | toàn văn | đúng như đã viết (94 văn phòng, 83 phòng ngủ; chính xác nhất ở cởi mở) | | Đổi nhãn thứ cấp thành toàn văn |
| Vazire 2010 | toàn văn (bản tác giả) | đúng như đã viết (165 người; bản thân đoán tốt nhất nét thuộc bất ổn cảm xúc, bạn bè đoán tốt nhất nét thuộc trí tuệ) | | Đổi nhãn; suy luận "hành vi khi chơi bù cho tự khai" vẫn là suy luận của nhóm |
| Li, Dey & Forlizzi 2010 | tóm tắt | đúng như đã viết (năm giai đoạn; rào cản dồn sang giai đoạn sau) | Trang ACM đóng | Đổi nhãn thứ cấp thành tóm tắt |
| Schwartz 1992 | chưa lấy được (ý chính đọc qua tóm tắt bài Schwartz 2012) | đúng như đã viết: mười giá trị, cấu trúc vòng tròn | OpenAlex (không tóm tắt); ScienceDirect captcha; PDF ở GVSU trả 403 | Dẫn Schwartz (2012) thay cho chương 1992 |
| PVQ-RR (Schwartz & Cieciuch 2022) | toàn văn | số câu nay đã kiểm: 57 câu, 3 câu cho mỗi giá trị, 19 giá trị; tuổi tối thiểu không được nêu | PDF kho thang đo của Schwartz trả 403 | Không nêu tuổi tối thiểu; quyết định "chỉ là câu hỏi mở" giữ nguyên |
| Peterson & Seligman 2004 | chưa lấy được (sách); trang của VIA Institute: toàn văn | đúng như đã viết: 24 điểm mạnh dưới sáu đức tính | Sách không có bản mở | Không đổi |
| McGrath & Walker 2016 | toàn văn (vòng trước) | đúng như đã viết | | Không đổi |
| Roberts và cộng sự 2005 | tóm tắt | đúng nhưng phải sửa: bài AMR là bài lý thuyết về "chân dung bản thân tốt nhất", tóm tắt không mô tả các bước của bài tập | OpenAlex (đóng); trang Center for Positive Organizations trả 403 ở vòng trước | Dẫn bài này cho khái niệm, dẫn Spreitzer và cộng sự (2009) cho quy trình |
| Goldberg và cộng sự 2006 (IPIP) | tóm tắt (vòng trước) | đúng như đã viết | OpenAlex không có tóm tắt; ipip.ori.org lỗi DNS ở vòng trước | Không đổi |
| Donnellan và cộng sự 2006 (Mini-IPIP) | tóm tắt | đúng như đã viết (20 câu, 4 câu mỗi nét, alpha "bằng hoặc cao hơn hẳn 0,60") | OpenAlex (đóng) | Không đổi |
| Gosling, Rentfrow & Swann 2003 (TIPI) | toàn văn | đúng như đã viết; thêm: alpha 0,40–0,73, làm lại sau sáu tuần r trung bình 0,72, N = 1.813 | | Thêm số vào bảng công cụ; củng cố lý do không vẽ thanh từ thang hai câu |
| Ashton & Lee 2009 (HEXACO-60) | tóm tắt | đúng như đã viết (60 câu, 10 câu mỗi chiều); tóm tắt không có số độ tin cậy | OpenAlex (đóng) | Không đổi |
| Soto & John 2017 (BFI-2) | tóm tắt | đúng như đã viết (60 câu, 15 mặt) | Bản tác giả ở eScholarship ngắt kết nối hai lần | Không đổi; có thể mở tay liên kết eScholarship |
| Wyman & Vyse 2008 | tóm tắt | đúng như đã viết (52 sinh viên); thêm: không khác nhau giữa cung "đẹp" và cung "xấu" | OpenAlex (đóng) | Đổi nhãn từ trích đoạn tìm kiếm thành tóm tắt |
| Hamilton 2001 | chưa lấy được | chưa kiểm được | OpenAlex, Crossref không có tóm tắt; ScienceDirect captcha | Không dùng trong đề xuất; không ảnh hưởng |
| Hartmann, Reuter & Nyborg 2006 | thứ cấp | khớp với ghi chú (hơn 4.000 và hơn 11.000 người, không có liên hệ) | OpenAlex, Crossref không có tóm tắt; ScienceDirect captcha | Không cần; Lu và cộng sự (2020) đã đủ |
| Dean & Kelly 2003 | toàn văn (bản đăng lại trên trang bên thứ ba) | đúng nhưng phải sửa: 2.101 người sinh cách nhau trung bình 4,8 phút, không phải "2011 cặp"; hơn 40 nghiên cứu, gần 700 nhà chiêm tinh, 1.150 lá số, cỡ hiệu ứng 0,051; mức đồng thuận 0,101 qua 25 nghiên cứu | Nhà xuất bản bán bài | Sửa con số trong ghi chú; dẫn bài báo thay vì Wikipedia |
| Lillqvist & Lindeman 1998 | tóm tắt | đúng như đã viết; thêm: cả nghiên cứu chỉ có 40 sinh viên | Trang Hogrefe trả 403 ở vòng trước | Đổi nhãn thành tóm tắt; ghi cỡ mẫu nhỏ |
| Andersson, Persson & Kajonius 2022 | tóm tắt | đúng như đã viết (N = 264, mẫu thuận tiện qua mạng xã hội) | Bản mở nằm trên ScienceDirect (captcha) | Không đổi |
