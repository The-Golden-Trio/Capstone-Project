# Source verification for "Hồ sơ người chơi JobQuest"

Checked on 13 October 2026 against `research/reports/Hồ sơ người chơi JobQuest.md`. Nothing under `_archive/` was opened. Nothing below is filled in from memory: every figure was read on the page named, and where the article itself could not be opened the entry says so.

## How to read this file

**Verification levels**

- **Full text**: the article itself was opened and the cited page was read. "Scan" means page images of the printed journal.
- **Author copy**: an accepted manuscript or author-posted copy in a university or lab repository was opened and read.
- **Earlier version**: a thesis or draft of the same study was read in full, but the published article was read only as an abstract.
- **Abstract**: only the publisher, repository, Crossref or Europe PMC record was read.
- **Secondary**: known only through another text that restates it.
- **Not obtained**: nothing beyond bibliographic metadata.

**Verdicts**: confirmed as stated / confirmed with a correction / not supported / full text not obtainable.

**Quoting**: journal articles are paraphrased with the page or table given, and only a few key phrases are quoted. The two public legal texts (the decree and the O\*NET licence) are quoted at length because their exact wording is the point.

**How the texts were opened**: PDFs were fetched and read page by page (scans were read as images). For two repositories that refuse automated fetches (IDEALS, UNCG) the text layer was read inside the browser from the repository's own page. Copies behind a bot challenge (core.ac.uk, raggeduniversity.co.uk, HAL) or on ResearchGate (HTTP 403) were not opened. Pirate mirrors (Sci-Hub and similar) were not used.

## Status at a glance

| # | Source | Level reached | Verdict |
|---|---|---|---|
| 1 | Su, Rounds & Armstrong 2009 | Full text | Confirmed, with one softening |
| 2 | Zell & Krizan 2014 | Author copy | Confirmed with a correction |
| 3 | Nye, Su, Rounds & Drasgow 2017 | Abstract | Confirmed at abstract level; outcome and correction not stated there |
| 4 | Hoff, Song, Wee, Phan & Rounds 2020 | Abstract | Confirmed |
| 5 | Hanna & Rounds 2020 | Abstract of the article; full text of the 2018 thesis version | Confirmed with a correction |
| 6 | Low, Yoon, Roberts & Rounds 2005 | Full text | Confirmed; wording should be tightened |
| 7 | Albo et al. 2016; Abeynayake et al. 2023 | Abstract (both) | Confirmed at abstract level, with a scope caveat |
| 8 | Forer 1949; Dickson & Kelly 1985 | Full text (both, scans) | Discrepancy resolved |
| 9 | Kluger & DeNisi 1996 | Full text (scan) | Confirmed |
| 10 | Bessière, Seay & Kiesler 2007 | Draft manuscript in full; journal abstract | Confirmed with a correction |
| 11 | Smyth et al. 2009 | Abstract | Confirmed with a softening |
| 12 | Tourangeau et al. 2014 | Abstract | Confirmed |
| 13 | Galesic & Bosnjak 2009 | Abstract | Confirmed |
| 14 | Soto et al. 2008 | Abstract | The "about 15" threshold is not in the abstract |
| 15 | Barrick & Mount 1991 | Abstract | Confirmed |
| 16 | McCrae & Costa 1989; Pittenger 2005 | Abstract; secondary | Confirmed at abstract level; retest figure still unverified |
| 17 | Haslam et al. 2020 | Author copy (abstract page read) | Confirmed |
| 18 | Lu, Liu, Liao & Wang 2020 | Full text (pp. 1–2 read) | Confirmed |
| 19 | Clobert et al. 2016 | Not re-opened | Stays at the earlier abstract level |
| 20 | Paulhus 1984; Lucas et al. 2014 | Not obtained | Not verified |
| 21 | Back et al. 2010 | Full text | Confirmed |
| 22 | Aron et al. 1997; King 2001 | Abstract | Procedure details not verified |
| 23 | Decree 356/2025/NĐ-CP | Primary text, signed copy | Confirmed with corrected wording |
| 24 | O\*NET Tools Developer License | Full text | A validation study is a stated condition |

Items left at abstract level or below: 3, 4, 7, 11, 12, 13, 14, 15, 16, 19, 20, 22. Of the high-priority set, 3, 4, 7 and 16 could not be raised above abstract level; what was tried is listed in each entry.

---

## 1. Su, Rounds & Armstrong (2009), Psychological Bulletin 135(6), 859–884

- **Claim in the proposal** (block B, tagged "tóm tắt"): the People–Things axis is "the largest sex difference in interest measurement (d = 0.93)", which is the reason to drop that axis from the `feat/gtkm` branch.
- **What the source says**
  - Sample (p. 864): 47 inventories published between 1964 and 2007, 81 samples, 243,670 men and 259,518 women (503,188 in total). Mean ages of the samples ran from 12.50 to 42.55 years. The data come from the inventories' technical manuals.
  - Sign (p. 864, "Analytical Procedures"): Cohen's d, where a positive value means stronger interest for men than for women. The Things–People and Data–Ideas scores follow Prediger's formulas, with a larger score meaning stronger interest in things or in data.
  - Result (p. 865): Things–People d = 0.93, described as having "favored men"; it is the largest effect among the two dimensions and six RIASEC types. Data–Ideas d = −0.10. Realistic 0.84, Investigative 0.26, Artistic −0.35, Social −0.68, Conventional −0.33; Enterprising was not significant.
  - Spread (p. 865): every inventory showed a positive Things–People effect, from 0.14 to 1.65. The inventories listed as showing relatively small sex differences include the O\*NET Interest Profiler.
  - Moderators (pp. 865, 867): the way items were developed was the strongest moderator. The Things–People sex difference shrinks as sample age rises (β = −.24), so it is larger in younger samples.
  - The abstract also reports larger effects for a narrower measure: engineering interests d = 1.11 (science 0.36, mathematics 0.34).
- **Verdict**: confirmed, with one softening. Direction: men score towards Things, women towards People. "The largest sex difference in interest measurement" is true only among the eight broad scores; the narrower engineering scale is larger (1.11).
- **Level**: full text (pp. 864–867 read) plus the Europe PMC abstract.
- **URLs read**: https://emilkirkegaard.dk/en/wp-content/uploads/Men-and-things-women-and-people-A-meta-analysis-of-sex-differences-in-interests.pdf (third-party-hosted copy of the published article); abstract via https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1037/a0017364%22&resultType=core&format=json. The Rounds lab page also links a copy: https://jrounds.weebly.com/publications.html.

## 2. Zell & Krizan (2014), Perspectives on Psychological Science 9(2), 111–125

- **Claim in the proposal** (blocks E and tension 4, tagged "tóm tắt"): self-evaluated ability correlates on average 0.29 with real performance, and is "weaker when self-evaluation is general and about an unfamiliar task"; conversely, more accurate when specific and about familiar tasks.
- **What the source says** (page numbers are those of the 30-page author copy)
  - Overall (p. 1 abstract; pp. 7–9): 22 meta-analyses; individual effects from .09 to .63; mean .29, SD .11. Dropping the single .63 outlier gives .28.
  - Table 3 (p. 10): specific self-evaluations .28 against global .18, seven meta-analyses each. The authors call the difference "descriptively larger" and note both are below .30.
  - Table 3 also covers timing: self-evaluation made before the task .27, after the task .29, four meta-analyses each. The authors report little difference and say they find this surprising.
  - Table 4 (pp. 10–11): familiar tasks .32 against unfamiliar .26 (two meta-analyses each). Complexity: low .32, medium .21, high .20 (two each). Objective tests .30 against subjective .22 (four each). By domain: vocational skills .26 across six meta-analyses; academic ability .33; language competence .63; nonverbal skills .09.
- **Verdict**: confirmed with a correction. The .29 is right. "General" and "unfamiliar" are two separate moderators, each a descriptive comparison resting on two to seven meta-analyses with no significance test; the paper does not report their combination. The gaps are modest (.28 against .18; .32 against .26). A finding the proposal does not mention matters for block E: rating oneself after doing the task is not more accurate than rating before it.
- **Level**: author copy (UNCG repository, "reprinted with permission"); abstract also read on the APS page.
- **URLs read**: https://www.digitalgreensboro.org/record/9871 (file `facultystaff_9886_PDF.pdf`); https://www.psychologicalscience.org/journals/perspectives/1745691613518075/

## 3. Nye, Su, Rounds & Drasgow (2017), Journal of Vocational Behavior 98, 138–151

- **Claim in the proposal** (block E, tagged "tóm tắt"): interest congruence correlates about 0.32 with performance.
- **What the source says** (abstract): a meta-analysis of 92 studies and 1,858 correlations found congruence a stronger predictor of "performance outcomes" than interest scores alone, with "baseline correlations" of 0.32 and 0.16. The abstract does not say whether these are corrected, nor which performance outcomes they pool.
- **Verdict**: confirmed at abstract level. Which outcome and which correction: not stated in the abstract, and not verified.
- **Level**: abstract.
- **Full text**: not obtainable. Tried OpenAlex (no open copy), the Iowa and Illinois repositories (record only), Europe PMC (not indexed), the Rounds lab publication page (not listed), Crossref (no abstract field) and a web search (only pirate mirrors, not used).
- **URL read**: https://experts.illinois.edu/en/publications/interest-congruence-and-performance-revisiting-recent-meta-analyt/ ; metadata https://api.crossref.org/works/10.1016/j.jvb.2016.11.002

## 4. Hoff, Song, Wee, Phan & Rounds (2020), Journal of Vocational Behavior 123, 103503

- **Claim in the proposal** (block E, tagged "tóm tắt qua trích đoạn tìm kiếm"): interest fit correlates only 0.19 with job satisfaction.
- **What the source says** (abstract): 105 studies spanning more than 65 years; k = 194, N = 39,602; ρ = 0.19, 95% CI 0.16 to 0.21, which the authors call slightly lower than expected. The relation is stronger for satisfaction facets about one's career choice in general. The abstract adds that interest fit relates more strongly to performance outcomes and to satisfaction with the overall career path. The title and abstract both call it a meta-analysis.
- **Bibliographic check** (Crossref): Journal of Vocational Behavior, volume 123, article 103503, December 2020; authors in the order Hoff, Song, Wee, Phan, Rounds.
- **Verdict**: confirmed as stated. The abstract does not describe the correction behind ρ.
- **Level**: abstract, now read directly on a repository page rather than through a search snippet.
- **Full text**: not obtainable. The author-uploaded "in press" copy on ResearchGate returned HTTP 403. The IDEALS item the search surfaced (`items/73031`) is a different study: Earl's 2014 master's thesis, 79 studies, overall ρ = .09.
- **URLs read**: https://experts.illinois.edu/en/publications/interest-fit-and-job-satisfaction-a-systematic-review-and-meta-an/ ; https://api.crossref.org/works/10.1016/j.jvb.2020.103503

## 5. Hanna & Rounds (2020), Psychological Bulletin 146(9), 765–796

- **Claim in the proposal** (block E, tagged "tóm tắt"): interest inventories predict the career a person actually chooses about 50.8% of the time.
- **What the published article's abstract says**: a binomial-normal meta-analytic model gives an overall hit rate of 50.8% for predicting career choice, covering educational choices and occupational membership. Accuracy is moderated by publication year, inventory, type of scale, type of career-choice outcome and hit-rate calculation method. The abstract gives no k or N and does not define a hit.
- **What the 2018 thesis version says** (Hanna's master's thesis, chaired by Rounds; same title; 67 pages)
  - Overall (p. 25; Table note p. 44): k = 130 studies, N = 309,033; hit rate 50.3%, 95% CI 47.3 to 53.4. A sample-level check with k = 345 gives 49.7%.
  - Definition (pp. 8–9, 20–21): a hit is counted when a person's inventory result matches the group they belong to. Examples given: the highest occupational-scale score is Accountant and the person later works as an accountant; or the highest RIASEC category matches the category of the person's major.
  - Several hit rules exist, and the estimate depends on which is used (pp. 32–33): about 62.3% for a liberal rule that ignores a person's other scale scores; 43.7% for the RIASEC highest-code rule (k = 52), which the thesis compares with a 16.67% chance rate for six categories; 40.7% for the strictest rule (highest score on one's own scale).
  - Criteria include college major as well as occupation, and concurrent as well as predictive designs (abstract, p. 2).
  - p. 35: roughly half of people are in majors or occupations their inventory scores would predict.
- **Verdict**: confirmed with a correction. 50.8% is right for the published article. It is a pooled share of people whose inventory result matched their major or occupation, not a share of "times the test guessed the job". Many of the underlying studies are concurrent, and the figure moves between roughly 41% and 62% with the scoring rule (thesis figures).
- **Level**: abstract for the article; full text for the thesis version. The thesis reports 50.3%, so its numbers must not be attributed to the 2020 article.
- **URLs read**: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1037/bul0000269%22&resultType=core&format=json ; https://www.ideals.illinois.edu/items/109885 (thesis PDF `bitstreams/359336/data.pdf`)

## 6. Low, Yoon, Roberts & Rounds (2005), Psychological Bulletin 131(5), 713–737

- **Claim in the proposal** (block B, tagged "tóm tắt"): interests are considerably stable from age 12 and more stable in rank order than personality, "though still rising sharply at 18–22".
- **What the source says**
  - Abstract (p. 713): ages 12 to 40; stability stayed flat through much of adolescence, rose sharply in the college years (18–21.9) and held for two decades; interests show higher stability than the rank-order stability of personality traits.
  - Table 2 (p. 723), population estimates by age at first testing: 12–13.9 years ρ = .55 (k = 8, n = 1,808); 14–15.9 .57 (k = 22); 16–17.9 .58 (k = 30); 18–21.9 .67 (k = 39); 22–24.9 .70; 25–29.9 .83 (k = 2, n = 144, which the authors treat as probably inflated); 30–34.9 .72; 35–40 .64.
  - p. 722: 51.3% of coefficients come from adolescent samples and 40.5% from college samples; stability is described as relatively unchanged through the middle- and high-school years (.55 to .58).
  - Table 5 (p. 726): rank-order .60, profile .70; men and women both .58.
- **Verdict**: confirmed. The phrase "còn tăng mạnh ở tuổi 18–22" is ambiguous: what rises is the stability coefficient (from about .58 to .67), not the level of interest.
- **Level**: full text (pp. 713, 722–723, 725–726 read). The exact size of the comparison with personality was read only in the abstract.
- **URL read**: Rounds lab copy linked from https://jrounds.weebly.com/publications.html (Dropbox file "Low Yoon Roberts Rounds (2005) Stability of vocational interests.pdf")

## 7. Albo, Lanir, Bak & Rafaeli (2016), IEEE TVCG 22(1), 569–578; Abeynayake et al. (2023), Applied Ergonomics 109, 103996

- **Claim in the proposal** (block D and tension 3, tagged "tóm tắt"): a controlled experiment comparing radar with two other circular forms found radar "least effective and least liked"; two experiments both rank radar worst.
- **What Albo's abstract says**: a controlled experiment on composite indicators comparing the Radar chart, the Flower chart (as in the OECD Better Life Index) and the Circle chart, using a formal task taxonomy on a real data set. Radar was the least effective and least liked; the other two were mixed and task-dependent; participants strongly preferred the Flower chart. The abstract gives no participant count and does not list the tasks.
- **What Abeynayake's abstract says**: fourteen participants, two trials on two separate days, with eye tracking; bar, circular, line, radar and bubble graphs; bar and line were superior to circular and radial graphs in effectiveness; the radar graph performed worst. Not open access.
- **Verdict**: confirmed at abstract level, with a scope caveat. Albo compares radar only with other radial designs, so by itself it supports "radar is the weakest radial form", not "bars beat radar". The bar-versus-radar comparison rests on Abeynayake, a 14-person study. Participant numbers and task lists for Albo remain unverified.
- **Level**: abstract (both).
- **Full text**: not obtainable. Tried the PDF link on the Haifa lab page (`madadict.org`, domain no longer resolves), ResearchGate (HTTP 403), the IEEE Computer Society page (no text served) and OpenAlex (no open copy).
- **URLs read**: Europe PMC records for DOI 10.1109/TVCG.2015.2467322 and 10.1016/j.apergo.2023.103996 (https://www.ebi.ac.uk/europepmc/webservices/rest/search?...); https://haifahci.net/?p=310

## 8. Forer (1949), J. Abnormal and Social Psychology 44(1), 118–123; Dickson & Kelly (1985), Psychological Reports 57, 367–382

- **Claim in the proposal**: the original figures are known only second-hand and sources disagree (4.26 against 4.3), so no number is cited.
- **What Forer's article says** (pp. 120–121)
  - 39 students filled in the Diagnostic Interest Blank; one week later each received the same typed sketch of 13 statements. A footnote on p. 120 says the statements came largely from a newsstand astrology book.
  - Students gave two ratings on a scale from zero (poor) to five (perfect): rating A, how well the instrument reveals personality; rating B, how well the sketch reveals basic characteristics of their own personality.
  - Table 1 (p. 121), N = 39. Rating A: one 3, twenty-five 4s, thirteen 5s. Rating B: one 2, four 3s, eighteen 4s, sixteen 5s.
  - Forer prints the distributions, not the means, in the results text on pp. 120–121. Computed from Table 1: rating B (the sketch) = 166 / 39 = 4.26; rating A (the instrument) = 168 / 39 = 4.31.
  - Mean number of the 13 statements accepted as true: 10.2 (p. 121; Table 2 gives the distribution).
- **What Dickson & Kelly say** (pp. 367–368): 39 students; identical description, largely from a newsstand astrology book; scale 0 to 5; mean accuracy rating 4.3; nobody below 2 and only five below 4. Those last two details match rating B.
- **Verdict**: discrepancy resolved. 4.26 is the mean of the sketch ratings, computed from Forer's own table; 4.3 is the same figure rounded by Dickson & Kelly. The "4.2" in the first-round notes (from Wikipedia) is a further rounding. Both 39 students and the scale are confirmed.
- **Level**: full text for both (scans). For Forer, pp. 120–123 were read; pp. 118–119 were not.
- **URLs read**: https://cmapspublic.ihmc.us/rid=1TWXTKSR8-1BSYX2S-3L9L/forer_the%20fallacy%20of%20personal%20validation_1949.pdf ; https://cortecs.org/wp-content/uploads/2014/12/the-barnum-effect-in-personality-assessment-a-review-of-the-literature.pdf

## 9. Kluger & DeNisi (1996), Psychological Bulletin 119(2), 254–284

- **Claim in the proposal** (block B, tagged "tóm tắt"): the more feedback draws attention to "who I am" rather than "what I do", the more likely it backfires. The brief also asks about d = .41 and "over one third".
- **What the source says**
  - Abstract (p. 254): 607 effect sizes, 23,663 observations; feedback interventions improved performance on average (d = .41), but more than a third of them decreased performance. The theory's core assumption is that feedback moves attention among three levels (task learning, task motivation, and meta-task processes that include the self), and effectiveness falls as attention moves towards the self and away from the task.
  - p. 258: 131 usable papers, 607 effect sizes, 12,652 participants, 23,663 observations; weighted mean d = 0.41; "over 38% of the effects were negative".
  - p. 273 and Table 2 (after exclusions: 470 effects, mean .38, 32% negative): praise present .09 against absent .34; threat to self-esteem top quartile .08 against bottom quartile .47; discouraging feedback −.14 against .33.
- **Verdict**: confirmed as stated. Two precise points: the "one third" is 38% of 607 effect sizes, not of studies; and the "towards the self" claim is the paper's theory, supported by the praise and self-esteem-threat moderators.
- **Level**: full text (scan; pp. 254, 258, 271–273 read).
- **URL read**: https://mrbartonmaths.com/resourcesnew/8.%20Research/Marking%20and%20Feedback/The%20effects%20of%20feedback%20interventions.pdf

## 10. Bessière, Seay & Kiesler (2007), CyberPsychology & Behavior 10(4), 530–535

- **Claim in the proposal** (tension 5, tagged "tóm tắt"): World of Warcraft players rate their character as having more good traits than they rate themselves.
- **What the journal abstract says**: players rated their main character as having more favourable attributes than themselves, more so among players with lower psychological well-being. No sample size.
- **What the draft manuscript says** (a pre-publication draft; it still contains an editing note, so it is not the printed article)
  - p. 4: 68 respondents, 17 excluded as non-players, 51 valid; ages 18 to 27, mean 21; 43 men and 8 women; recruited through a university mailing list and a local gaming group. The 44-item Big Five Inventory was completed for actual self, ideal self and main character.
  - p. 5: the character was closer to the ideal than the actual self on three of five dimensions: conscientiousness, extraversion, neuroticism. Not for agreeableness (actual 3.56, character 3.60, ideal 4.0).
  - p. 6: for openness the pattern reversed; the character was rated lower than both actual and ideal self. Depressive affect moderated the effect for conscientiousness, neuroticism and agreeableness.
- **Verdict**: confirmed with a correction. The effect holds for three of the five Big Five traits, in 51 mostly male players aged 18–27.
- **Level**: draft manuscript in full, journal abstract. Figures from the draft should be re-checked against the printed article before going into the report.
- **URLs read**: http://spartan.ac.brocku.ca/~tkennedy/COMM/Bessiere.pdf ; Europe PMC record for DOI 10.1089/cpb.2007.9994

## 11. Smyth, Dillman, Christian & McBride (2009), Public Opinion Quarterly 73(2), 325–337

- **Claim in the proposal** (block C, tagged "tóm tắt"): an introduction saying what the answer is for and how much to write improves quality in every group of respondents.
- **What the abstract says**: three random-sample web surveys of Washington State University undergraduates. Manipulations: the size of the answer box, an explanation that answers may exceed the box, and clarifying and motivating introductions in the question stem. Outcomes: amount and type of information, response time, item nonresponse. Larger boxes had little effect on early responders but substantially improved quality among late responders. Any explanation or introduction that made response quality and length salient improved quality for both early and late responders. No sample sizes or effect sizes.
- **Verdict**: confirmed with a softening. "Every group" means the two groups studied (early and late responders). The abstract speaks of making quality and length salient, not of saying what the answer will be used for. All respondents were US undergraduates.
- **Level**: abstract (publisher page; full text is subscriber-only).
- **URL read**: https://academic.oup.com/poq/article/73/2/325/1941953

## 12. Tourangeau, Conrad, Couper & Ye (2014), Public Opinion Quarterly 78(1), 100–125

- **Claim in the proposal** (block C, tagged "tóm tắt"): examples in a question decide what respondents think of, and unusual examples steer most.
- **What the abstract says**: one preliminary and two follow-up studies on questions about food consumption. Frequently eaten example items produced higher reported consumption than rarely eaten ones. Atypical examples had more impact than typical ones. Examples reduced the omission of items in open-ended answers.
- **Verdict**: confirmed as stated at abstract level. The proposal already notes that carrying this from food recall to self-description is an inference.
- **Level**: abstract (publisher page).
- **URL read**: https://academic.oup.com/poq/article/78/1/100/1838155

## 13. Galesic & Bosnjak (2009), Public Opinion Quarterly 73(2), 349–360

- **Claim in the proposal** (block C, tagged "tóm tắt"): later questions get faster and shorter answers; the longer the announced length, the fewer people start.
- **What the abstract says**: stated length was manipulated at 10, 20 and 30 minutes; the longer the stated length, the fewer respondents started and completed. Answers to questions placed later were faster, shorter and more uniform.
- **Verdict**: confirmed as stated at abstract level.
- **Level**: abstract (publisher page). The SSRN copy listed as open by OpenAlex dropped the connection.
- **URL read**: https://academic.oup.com/poq/article/73/2/349/1940737

## 14. Soto, John, Gosling & Potter (2008), JPSP 94(4), 718–737

- **Claim in the proposal** (block B, tagged "tóm tắt"): personality self-reports of people under about 15 are distorted by acquiescent responding.
- **What the abstract says**: a large, diverse Internet sample aged 10 to 20; at the younger ages in that range there were large individual differences in acquiescent responding, with pronounced effects on psychometric characteristics. No specific age threshold and no sample size appear in the abstract.
- **Verdict**: partly confirmed. The acquiescence problem at younger ages is in the abstract; the "about 15" cut-off is not.
- **Level**: abstract. Full text not obtained (ResearchGate only).
- **URL read**: Europe PMC record for DOI 10.1037/0022-3514.94.4.718

## 15. Barrick & Mount (1991), Personnel Psychology 44(1), 1–26

- **Claim in the proposal** (block B, tagged "tóm tắt"): conscientiousness predicts performance in every occupational group.
- **What the abstract says**: one dimension, Conscientiousness, showed consistent relations with all job performance criteria for all occupational groups; Extraversion was valid for two occupations involving social interaction (managers and sales).
- **Verdict**: confirmed as stated at abstract level.
- **Level**: abstract (Crossref record).
- **URL read**: https://api.crossref.org/works?filter=doi:10.1111/j.1744-6570.1991.tb00688.x

## 16. McCrae & Costa (1989), Journal of Personality 57(1), 17–40; Pittenger (2005), Consulting Psychology Journal 57(3), 210–221

- **Claim in the proposal** (block B, tagged "tóm tắt"): the data show the MBTI measures four continuous dimensions, not sixteen types. The "about half change type on retest" figure is flagged as unverified.
- **What McCrae & Costa's abstract says**: 267 men and 201 women aged 19 to 93; self-reports and peer ratings on the NEO Personality Inventory. The study found no support for truly dichotomous preferences or qualitatively distinct types; the instrument measures four relatively independent dimensions, which correspond to aspects of four of the five major personality dimensions.
- **Pittenger (2005)**: full text not obtained. The only wording found is second-hand: a blog quotes p. 214 as saying 35% of individuals had a different four-letter type after a four-week interval, and separately that across a five-week retest 50% received a different classification on one or more scales. Other secondary sources give a range of 39% to 76%. None of this was checked against the article.
- **Verdict**: McCrae & Costa confirmed at abstract level. The "about half" retest figure remains unverified; the nearest second-hand wording is about a change on at least one of the four scales, which is not the same as "half change type", and a different second-hand figure (35% for the whole four-letter type) also circulates.
- **Level**: abstract for McCrae & Costa; secondary for Pittenger.
- **Full text**: not obtainable for either. McCrae & Costa: Wiley paywall, ResearchGate (not opened). Pittenger: ResearchGate HTTP 403, Ovid HTTP 402.
- **URLs read**: Europe PMC record for DOI 10.1111/j.1467-6494.1989.tb00759.x ; https://www.samyoung.co.nz/2022/03/some-limitations-of-mbti.html (secondary)

## 17. Haslam, McGrath, Viechtbauer & Kuppens (2020), Psychological Medicine

- **Claim in the proposal** (block D, tagged "tóm tắt"): individual differences are continuous, not categorical; dimensional findings outnumber categorical five to one across 317 findings.
- **What the source says** (accepted manuscript, abstract on p. 2): 317 findings from 183 articles; findings supporting dimensional models outnumbered taxonic ones five to one. Psychopathology was no more likely to yield taxonic findings than normal variation, which the authors gloss as individual differences in personality, response styles, gender and sexuality. No content domain showed aggregate support for the taxonic model.
- **Verdict**: confirmed as stated.
- **Level**: author copy (pp. 1–3 read; the results section was not).
- **URL read**: https://lirias.kuleuven.be/retrieve/2df69cd1-acd4-4310-99c2-e538423c82bb

## 18. Lu, Liu, Liao & Wang (2020), JPSP: Interpersonal Relations and Group Processes

- **Claim in the proposal** (block F, tagged "tóm tắt"): sign predicts neither personality (N = 173,709) nor job performance (N = 32,878), yet stereotypes still cause discrimination in dating and simulated hiring.
- **What the source says** (p. 1): both N values are as stated (Studies 7 and 8). The stereotype concerns Virgos, attributed to the Chinese translation of the sign's name. Discrimination against Virgos appears in romantic dating (Study 4) and in simulated job recruitment (Studies 5 and 6; Study 6 used HR professionals, per the section heading).
- **Verdict**: confirmed as stated. The copy is the advance online version and carries a DOI (10.1037/pspi0000237) but no volume or page numbers.
- **Level**: full text (pp. 1–2 read; section headings for Studies 4–8 seen).
- **URL read**: https://gosling.psy.utexas.edu/wp-content/uploads/2020/03/Lu-et-al.-2020-Disentangling-stereotypes-from-social-reality-Astrological-stereotypes-and-discrimination-in-China-JPSP.pdf

## 19. Clobert, Van Cappellen, Bourdon & Cohen (2016), Personality and Individual Differences 101, 348–355

- **Claim in the proposal** (block F, tagged "tóm tắt"): reading a positive rather than negative horoscope changes cognitive and creative performance.
- **Verdict**: not re-verified in this round. The HAL record is behind a bot challenge, Crossref has no abstract, and the ResearchGate copy was not opened. The claim stays at the first round's abstract level.
- **Level**: bibliographic metadata only (Crossref confirms journal, volume and pages).

## 20. Paulhus (1984), JPSP 46(3), 598–609; Lucas, Gratch, King & Morency (2014), Computers in Human Behavior 37, 94–100

- **Claim**: two components of socially desirable responding; people disclose more when they believe no human is watching. Neither paper is cited in the proposal's text; they sit in the underlying notes.
- **Verdict**: not verified. Crossref has no abstract for either; ScienceDirect returned HTTP 403 for Lucas et al.
- **Level**: bibliographic metadata only.

## 21. Back, Stopfer, Vazire, Gaddis, Schmukle, Egloff & Gosling (2010), Psychological Science 21(3), 372–374

- **Claim**: online profiles reflect actual rather than idealised personality. Not cited in the proposal's text; it sits in the notes.
- **What the source says** (pp. 372–373): 236 social-network users aged 17 to 22 (133 on Facebook in the United States, 103 on StudiVZ/SchuelerVZ in Germany). Observer ratings of the profiles were accurate against a criterion built from self- and friend-reports, with no evidence of self-idealisation. Table 1: accuracy was highest for extraversion and openness and not significant for neuroticism.
- **Verdict**: confirmed as stated.
- **Level**: full text.
- **URL read**: http://www.simine.com/docs/Back_et_al_PSYCHSCIENCE_2010.pdf

## 22. Aron et al. (1997), PSPB 23(4), 363–377; King (2001), PSPB 27(7), 798–807

- **Claim**: the structure of the 36-question procedure; the Best Possible Self writing exercise and its instructions (the proposal's K3 says it is adapted from this exercise).
- **What the abstracts say**: Aron: pairs carry out self-disclosure and relationship-building tasks over 45 minutes; Study 1 found greater closeness than with small-talk tasks. King: 81 undergraduates wrote for 20 minutes a day on four consecutive days about one of four topics; writing about life goals was less upsetting than writing about trauma and was associated with higher well-being and, five months later, less illness than controls.
- **Verdict**: the designs are confirmed at abstract level. The number and grouping of Aron's questions and the wording of King's instructions were not verified.
- **Level**: abstract (Crossref records).
- **URL read**: https://api.crossref.org/works?filter=doi:10.1177/0146167297234003,doi:10.1177/0146167201277003

## 23. Decree 356/2025/NĐ-CP (Vietnam)

- **Claim in the proposal** (block A, tagged "thứ cấp, chưa đọc bản công báo"): the decree lists "dữ liệu theo dõi hành vi sử dụng dịch vụ trực tuyến" and "đời sống riêng tư" as sensitive data and does not name psychological profiles.
- **What the primary text says** (signed copy on the Government portal: dated 31 December 2025, digitally signed by the Government Portal on 5 January 2026)
  - Điều 4 khoản 1 (pp. 2–3) lists twelve points, a) to m). The two relevant ones, exactly:
    - c) "Thông tin về đời sống riêng tư, bí mật cá nhân, bí mật gia đình;"
    - l) "Dữ liệu theo dõi hành vi, hoạt động sử dụng dịch vụ viễn thông, mạng xã hội, dịch vụ truyền thông trực tuyến và các dịch vụ khác trên không gian mạng;"
  - The other points: a) racial and ethnic origin; b) political, religious and belief views; d) "Tình trạng sức khỏe"; đ) biometric and genetic data; e) sex life and sexual orientation; g) crime and law-violation data held by law-enforcement bodies; h) location determined through positioning services; i) electronic-identity login names and passwords and images of identity cards; k) bank and financial account data; m) other personal data that the law requires to be kept confidential or strictly secured.
  - No point names psychological, personality or inferred profiles.
  - Điều 4 khoản 2 (p. 3): "Trong quá trình xử lý dữ liệu cá nhân nhạy cảm, cơ quan, tổ chức phải thiết lập quy định phân quyền giới hạn truy cập, quy trình xử lý và các biện pháp bảo mật."
  - Điều 3 (p. 2) lists basic personal data, including "Ngày, tháng, năm sinh" (khoản 2), "Giới tính" (khoản 3) and "Hình ảnh của cá nhân" (khoản 6).
  - Điều 42 (p. 36): khoản 1, "Nghị định này có hiệu lực thi hành từ ngày 01 tháng 01 năm 2026."; khoản 2, "Nghị định số 13/2023/NĐ-CP ngày 17 tháng 4 năm 2023 của Chính phủ về bảo vệ dữ liệu cá nhân hết hiệu lực kể từ ngày Nghị định này có hiệu lực thi hành."
  - Seen in passing, Điều 41 (p. 36): the five-year option for small enterprises and start-ups, and the exemption for household businesses and micro-enterprises, do not apply to those that directly process sensitive personal data.
- **Verdict**: confirmed with corrected wording. Point l) is broader than "online services": it names telecommunications, social networks, online media services and "other services in cyberspace", and covers data tracking both behaviour and activity. A web game falls under "các dịch vụ khác trên không gian mạng" on a plain reading; whether play logs count as tracking data is a legal question the text does not settle.
- **Level**: primary text (scanned signed copy; pp. 1–4 and 36–37 read). This is a reading of the text, not legal advice.
- **URLs read**: record page https://vanban.chinhphu.vn/?pageid=27160&docid=216387 ; file https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/356-nd.signed.pdf ; Official Gazette entry https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-356-2025-nd-cp-468371.htm (Công báo no. 18, 70 pages with forms)

## 24. O\*NET Tools Developer License, section 3(b)

- **Claim in the proposal** (block B; meeting item 5): the Vietnamese Mini-IP is "modified material", must carry attribution and a note that it is not validated, and someone should read section 3(b) about a validation-study requirement.
- **What the licence says**
  - Section 1: "Adapted Material means material subject to Copyright and Similar Rights that is derived from or based upon the Licensed Material and in which the Licensed Material is translated, altered, arranged, transformed, or otherwise modified in a manner requiring permission under the Copyright and Similar Rights held by the Licensor." A translation is therefore Adapted Material by definition.
  - Section 3(b), opening: "If You Share Adapted Material You produce, the following conditions apply:"
  - Section 3(b)(1), change of purpose: a Validation Study is required if the material is modified "in a manner designed to change their original purposes: as career counseling, career planning, or career exploration tools". The study must be consistent with industry standards such as the Standards for Educational and Psychological Testing and legal standards such as 41 C.F.R. Part 60-3.
  - **Section 3(b)(2), the sentence that applies**: "Modification of Content. If You only use a part of, or in any other manner modify or revise, any part of the Licensed Material, You must conduct a Validation Study to ensure that any and all results, information or other materials derived from the use of the Adapted Material are valid for the intended purpose, audience and end-user prior to introduction of the new Product." It adds: "A modification that only relates to the software in order to develop or integrate the tools as a part or component of Your system is not a modification under this clause."
  - Section 3(b)(3), notification: end users must be told of all modifications, with this notice: "This [page/product/application] includes information from the O*NET Career Exploration Tools by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Tools Developer License. O*NET® is a trademark of USDOL/ETA. [Your name or company] has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications." The notice must be conspicuous on the product, in the README and on the launch screen, with a link to a description of the modifications that refers to "modifications and disclaimers".
  - Section 6(a): rights terminate automatically on non-compliance; section 6(b) reinstates them if the violation is cured within 30 days of discovery.
- **Verdict**: a validation study is a stated condition, not an optional good practice. It is triggered when Adapted Material is shared and the adapter uses only part of the tool or modifies or revises its content. JobQuest's plan does both: it translates the items and it shows 12 of the 30 in the first round. Writing "not yet validated" does not meet the clause; the clause asks for the study before the new product is introduced, and separately for the modification notice. Section 3(b)(1) does not apply as long as the use remains career exploration.
- **Limits of this check**: the licence does not say how large a study under 3(b)(2) must be. Whether the Mini-IP itself is released under this licence was not re-checked here; the proposal takes that from the Mini-IP technical report. This is a reading of the text, not legal advice.
- **Level**: full text.
- **URL read**: https://www.onetcenter.org/license_toolsdev.html

---

## Sửa gì trong đề xuất

Thứ tự theo mức ảnh hưởng tới quyết định thiết kế. "Nay ghi được" nghĩa là đổi nhãn kiểm chứng trong báo cáo.

**Phải sửa nội dung**

1. **Giấy phép O\*NET (khối B, việc số 5 ở bảng chốt).** Câu hiện tại: "phải ghi nguồn và ghi rõ chưa được kiểm định, và nhóm cần tự đọc mục 3(b)". Sửa thành: "Mục 3(b)(2) của O\*NET Tools Developer License yêu cầu người chia sẻ bản đã sửa (bản dịch được định nghĩa là Adapted Material ở Mục 1) phải làm một Validation Study trước khi đưa sản phẩm mới ra, nếu chỉ dùng một phần hoặc sửa nội dung công cụ. Bản dịch tiếng Việt và việc tách 12 thẻ cho lượt 1 đều rơi vào điều khoản này. Ghi 'chưa kiểm định' là không đủ; ngoài ra phải hiện thông báo sửa đổi theo mẫu ở Mục 3(b)(3) trên sản phẩm, trong README và ở màn mở." Hệ quả: việc "30–50 người tính alpha từng trục, làm lại sau hai tuần" ở dòng 13 không còn là việc nên làm mà là điều kiện giấy phép, và phải xong trước khi phát hành; giấy phép không nói quy mô tối thiểu. Phương án thay thế "tự viết 18 thẻ kiểu RIASEC" ở chỗ căng 2 là cách duy nhất tránh hẳn điều khoản. Mức kiểm chứng: toàn văn.

2. **Nghị định 356/2025 (khối A, việc số 13).** Bỏ nhãn "bản sao lại của bên thứ ba, thứ cấp, chưa đọc bản công báo". Sửa câu thành: "Điều 4 khoản 1 Nghị định 356/2025/NĐ-CP xếp vào dữ liệu cá nhân nhạy cảm, trong số mười hai nhóm, 'Thông tin về đời sống riêng tư, bí mật cá nhân, bí mật gia đình' (điểm c) và 'Dữ liệu theo dõi hành vi, hoạt động sử dụng dịch vụ viễn thông, mạng xã hội, dịch vụ truyền thông trực tuyến và các dịch vụ khác trên không gian mạng' (điểm l); không điểm nào nêu hồ sơ tâm lý hay hồ sơ suy ra. Khoản 2 buộc tổ chức xử lý dữ liệu nhạy cảm phải có quy định phân quyền giới hạn truy cập, quy trình xử lý và biện pháp bảo mật." Dẫn bản ký số trên Cổng Thông tin điện tử Chính phủ. Thêm hai ý đọc được từ chính văn: ngày sinh và giới tính là dữ liệu cá nhân cơ bản (Điều 3 khoản 2, 3); Nghị định 13/2023 hết hiệu lực từ 01/01/2026 (Điều 42 khoản 2). Câu hỏi cho pháp chế nên đổi thành: "log lựa chọn khi chơi có phải 'dữ liệu theo dõi hành vi, hoạt động sử dụng … các dịch vụ khác trên không gian mạng' theo điểm l khoản 1 Điều 4 không".

3. **Hanna & Rounds (khối E).** Câu "bài hỏi sở thích đoán đúng nghề người ta thật sự chọn khoảng 50,8% số lần" sửa thành: "ở khoảng 50,8% số người, kết quả bài hỏi sở thích khớp với ngành học hoặc nghề của họ (ước lượng gộp của một tổng hợp gần 100 năm nghiên cứu); con số đổi theo cách tính thế nào là 'khớp'". Nếu cần nói rõ hơn thì ghi là số của bản luận văn 2018, không phải của bài báo: 130 nghiên cứu, 309.033 người, 50,3%, dao động khoảng 41–62% theo cách tính, và với cách tính theo nhóm RIASEC cao nhất là 43,7% so với mức ngẫu nhiên 16,67%. Mức kiểm chứng: tóm tắt bài báo, toàn văn bản luận văn.

4. **Zell & Krizan (khối E, chỗ căng 4).** Giữ con số 0,29. Câu "yếu hơn khi tự đánh giá chung chung về việc chưa quen" sửa thành: "tương quan thấp hơn khi tự đánh giá ở mức chung chung (0,18 so với 0,28 khi cụ thể) và, tách riêng, khi việc chưa quen (0,26 so với 0,32); đây là so sánh mô tả trên 2–7 tổng hợp, không có kiểm định". Thêm một câu bài báo có mà đề xuất chưa nêu: tự đánh giá sau khi làm xong không chính xác hơn trước khi làm (0,29 so với 0,27). Vì vậy "mức tự tin" hỏi sau mỗi lượt chơi nên được biện minh là để người chơi so hai con số, không phải vì hỏi sau thì đúng hơn. Nay ghi được: toàn văn (bản tác giả đăng ở kho của trường).

5. **Bessière và cộng sự (chỗ căng 5).** Câu "chấm nhân vật của mình có nhiều nét tốt hơn chấm chính mình" sửa thành: "chấm nhân vật gần với con người lý tưởng hơn ở ba trong năm nét Big Five (tận tâm, hướng ngoại, ổn định cảm xúc), không khác ở dễ chịu và ngược lại ở cởi mở; mẫu 51 người chơi, 18–27 tuổi, 43 nam". Ghi rõ số liệu lấy từ bản thảo trước khi in, cần đối chiếu bản in trước khi đưa vào báo cáo đồ án.

**Nên nói nhẹ lại**

6. **Su và cộng sự (khối B).** "Đó là chênh lệch giới lớn nhất trong đo sở thích (d = 0,93)" sửa thành: "đó là chênh lệch giới lớn nhất trong sáu nhóm RIASEC và hai chiều Người–Vật, Dữ liệu–Ý tưởng (d = 0,93, nam nghiêng về Vật, nữ nghiêng về Người; 47 bộ công cụ, 503.188 người); riêng thang sở thích kỹ thuật còn lớn hơn (d = 1,11)". Có thể thêm: chênh lệch này lớn hơn ở mẫu trẻ tuổi, tức đúng nhóm tuổi của người chơi. Nay ghi được: toàn văn.

7. **Albo và Abeynayake (khối D, chỗ căng 3).** Giữ câu trích, nhưng thêm giới hạn: thí nghiệm của Albo chỉ so radar với hai dạng hình tròn khác (hoa, vòng tròn), không so với thanh; ý "thanh đọc tốt hơn radar" dựa vào nghiên cứu 14 người của Abeynayake. Cả hai vẫn ở mức tóm tắt; số người tham gia và danh sách tác vụ của Albo chưa kiểm được.

8. **Soto và cộng sự (khối B).** "Tự khai tính cách ở người dưới khoảng 15 tuổi bị nhiễu bởi thói quen đồng ý" sửa thành: "ở phía tuổi nhỏ trong khoảng 10–20, tự khai tính cách có khác biệt cá nhân lớn về thói quen đồng ý". Mốc "khoảng 15 tuổi" không có trong tóm tắt và chưa kiểm được.

9. **Smyth và cộng sự (khối C).** "Một lời dẫn nói rõ câu trả lời dùng làm gì và nên viết bao nhiêu cải thiện chất lượng ở mọi nhóm người trả lời" sửa thành: "một lời dẫn làm nổi bật chất lượng và độ dài mong muốn của câu trả lời cải thiện chất lượng ở cả người trả lời sớm lẫn người trả lời muộn (sinh viên Mỹ)". Ý "nói rõ câu trả lời dùng làm gì" không có trong tóm tắt.

10. **Low và cộng sự (khối B).** "Tuy còn tăng mạnh ở tuổi 18–22" dễ bị đọc thành sở thích tăng. Sửa thành: "độ ổn định giữ ở khoảng 0,55–0,58 suốt tuổi 12–17 rồi lên 0,67 ở tuổi 18–21,9". Nay ghi được: toàn văn.

11. **Nye và cộng sự (khối E).** Giữ 0,32 nhưng thêm: "tóm tắt gọi đây là tương quan 'baseline' với các kết quả hiệu suất nói chung (92 nghiên cứu), so với 0,16 của điểm sở thích đơn thuần; chưa kiểm được đã hiệu chỉnh hay chưa và gồm những loại hiệu suất nào". Vẫn ở mức tóm tắt.

**Nay ghi được là đã kiểm (đổi nhãn, không đổi nội dung)**

12. **Kluger & DeNisi (khối B)**: toàn văn. Có thể thêm số: trung bình d = 0,41 trên 607 hệ số, hơn 38% hệ số âm; lời khen (0,09 so với 0,34) và phản hồi đe doạ lòng tự trọng (0,08 so với 0,47) làm hiệu quả giảm.

13. **Forer (mục "Những chỗ chưa có bằng chứng")**: bỏ câu "mới biết qua nguồn thứ cấp và các nguồn ghi lệch nhau, nên không dẫn số". Thay bằng: "39 sinh viên nhận cùng một bản mô tả 13 câu, phần lớn lấy từ một cuốn sách chiêm tinh bán ở sạp báo; điểm trung bình cho mức bản mô tả tả đúng mình là 4,26 trên 5 (tính từ Bảng 1 của bài gốc: 166/39); con số 4,3 trong tổng quan của Dickson & Kelly là số này làm tròn". Mức kiểm chứng: toàn văn bài gốc, tr. 120–121.

14. **Lu và cộng sự (khối F)**: toàn văn (tr. 1–2); mọi con số đúng như đã viết.

15. **Haslam và cộng sự (khối D)**: bản tác giả; đúng như đã viết (317 kết quả từ 183 bài, năm trên một).

16. **Hoff và cộng sự (khối E)**: bỏ "qua trích đoạn tìm kiếm"; nay là tóm tắt đọc trực tiếp trên trang kho của trường. Là tổng hợp (meta-analysis), Journal of Vocational Behavior tập 123, bài 103503, 105 nghiên cứu, N = 39.602, ρ = 0,19 [0,16; 0,21].

17. **Dickson & Kelly, Barrick & Mount, Galesic & Bosnjak, Tourangeau và cộng sự**: đúng như đã viết ở mức đã ghi.

**Vẫn chưa kiểm được, giữ nguyên cách viết thận trọng**

18. **MBTI đổi loại khi làm lại.** Vẫn không dẫn con số. Bài Pittenger (2005) không mở được; nguồn thứ cấp trích hai số khác nhau (35% đổi cả bốn chữ sau bốn tuần; 50% đổi ít nhất một trong bốn thang sau năm tuần), nên câu "khoảng một nửa đổi loại" không khớp với cả hai. McCrae & Costa (1989) vẫn ở mức tóm tắt và đủ cho ý "bốn chiều liên tục".

19. **Clobert và cộng sự (khối F)**: chưa mở lại được, giữ nhãn tóm tắt của đợt trước.

20. **Câu K3 "sửa theo bài viết 'bản thân tốt nhất có thể'"**: King (2001) mới ở mức tóm tắt (81 sinh viên, viết 20 phút mỗi ngày trong bốn ngày); lời hướng dẫn gốc chưa kiểm được, nên ghi là "phỏng theo ý tưởng", không phải theo lời văn.
