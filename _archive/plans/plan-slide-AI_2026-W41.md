# Plan slide · phần AI trình cô (CHƯA DỰNG SLIDE)

> Soạn 9/10/2026 theo `plan-chot_2026-W41.md`. File này chỉ là plan nội dung; chưa có slide nào được dựng.
> **Mạch trình bày:** đi theo luồng từ đầu tới cuối, tới chỗ nào dùng AI thì dừng ở đó, và trả lời luôn câu hỏi của cô gắn với chỗ đó.
> **Ngôn ngữ:** chữ trên slide viết tiếng Anh như deck 26/9. Phần "Ghi chú" bằng tiếng Việt là cho người trình bày, không lên slide.
> **Độ dài:** 16 slide (14 slide nội dung, 2 slide tài liệu tham khảo), khoảng 15 đến 18 phút.

## Cách đọc file này

- **On the slide:** nguyên văn chữ đề xuất đặt lên slide. Mỗi nhận định có nguồn trong ngoặc; danh sách đầy đủ ở slide 15 và 16.
- **Trả lời câu hỏi của cô:** câu hỏi nào được trả lời ở slide đó.
- **Ghi chú:** điều cần nói thêm hoặc cần cẩn thận.
- Ký hiệu mức kiểm nguồn, dùng ở mục "Tài liệu tham khảo" cuối file:
  - ✔✔ con số trên slide đã được đối chiếu với bảng hoặc đoạn văn của nguồn (do mình, hoặc do lượt kiểm nguồn ngày 8/10 in nguyên văn đoạn chứa con số; chưa lần nào là đọc trực tiếp từ PDF);
  - ✔ đã mở nguồn, tiêu đề, tác giả và kết luận chính khớp;
  - 🔍 mới có qua lượt khảo sát của agent, **phải đọc bản gốc trước khi dựng slide**.

## Bảng đối chiếu: câu hỏi của cô nằm ở slide nào

| Câu hỏi của cô | Nguồn câu hỏi | Slide |
|---|---|---|
| Hệ thống có thật là AI-native không; khi AI sập thì còn chạy không | Buổi 19/9 (07 B2); danh sách 6/10 | 2, 11 |
| QA kịch bản sinh và chấm lượt chơi | Danh sách 6/10 | 4, 5, 6, 7 |
| Model chấm có cần mạnh hơn model sinh không | Danh sách 6/10 | 8 |
| Có bằng chứng đã công bố rằng LLM judge đáng tin không | Buổi 26/9 (07 B20) | 9 |
| Benchmark | Danh sách 6/10 | 10 |
| Framework cho LLM judge | Danh sách 6/10 | 10 |
| Đối sánh giải pháp công nghệ, kể cả model AI | Email 1/10, mục 9 (07 B24) | 12 |

---

## Slide 1 · AI in JobQuest: from an expert's knowledge to a scored playthrough

**On the slide**

- This section walks through the product flow from start to end and stops at each of the five places where AI works.
- Each of your AI questions is answered at the step it belongs to:
  - Is JobQuest AI-native, and what happens when the AI is down? (slides 2 and 11)
  - How are generated scenarios checked, and how is a playthrough scored? (slides 4 to 7)
  - Does the judging model need to be stronger than the generating model? (slide 8)
  - Is there published evidence that an LLM judge is reliable? (slide 9)
  - Which benchmark and which framework? (slide 10)
  - Comparison of technology solutions, including AI models (slide 12)
- Status: this week produced the design decisions and the literature review. **No measurement has been run yet.** The first test is planned for week 42.

**Ghi chú:** nói ngay từ đầu rằng tuần này là khảo sát và chốt hướng, để cô không chờ số liệu.

---

## Slide 2 · The flow: five places where AI works

**On the slide**

```
Authoring (no player is waiting)
  Domain Expert --(AI-1 interviews)--> raw knowledge --(AI-2 with Content Admin)--> seed
        --(AI-3 with Domain Expert: test and review)--> approved seed

Play
  approved seed --(AI-4 narrates, asks follow-ups)--> player answers --(AI-5 scores)--> skill scores
                                                          flagged cases --> AI-3 --> Domain Expert
```

| Step | AI does | A person decides |
|---|---|---|
| AI-1 | Interviews the Domain Expert to collect what a seed needs | The expert confirms the record |
| AI-2 | Turns the expert's input into a structured game seed | The expert sets every scoring key and rubric anchor, and approves the seed |
| AI-3 | Runs test playthroughs and picks the cases the expert must see | The expert rules on them and approves publication |
| AI-4 | Writes connecting narration and follow-up questions during play | Nobody at run time; the engine and rules constrain it |
| AI-5 | Scores the playthrough against the rubric | The expert reviews flagged cases |

- Principle: AI drafts, connects, scores and filters. Domain Experts decide occupational content, scoring keys and publication.
- AI is present at every step of the content lifecycle and of play. Without it the core loop cannot run (definition on slide 11).

**Trả lời câu hỏi của cô:** nửa đầu của câu "AI-native": AI có mặt ở mọi khâu.

**Ghi chú:** đây là slide khung; các slide 3 đến 7 đi lần lượt từng bước.

---

## Slide 3 · Step 1: AI-1 interviews the Domain Expert

**On the slide**

- **What it does.** An LLM asks and probes to collect what a seed needs: incidents, what a good and a poor response look like, facts of the situation. One interview per expert; the merged content marks where experts agree and where they differ.
- **How it is constrained.**
  - A human-written topic guide based on the critical incident technique (Flanagan, 1954) and on situational-judgment-test development practice (Whetzel et al., 2020). The model probes inside each topic only.
  - A tracker of seed fields still missing.
  - The expert is shown a summary and confirms it.
  - Every turn is stored verbatim, and each seed field links to the turn it came from.
- **Evidence that an LLM can hold an interview to a guide.** In 766 AI-led interviews, 94.8% to 99.8% of questions were open-ended, 95.7% to 99.6% neutral, and 0.1% to 0.4% hallucinated (Chopra & Haaland, working paper). A chatbot asking follow-up questions elicited more informative and specific answers than a static form, with about 600 participants (Xiao et al., 2020).
- **Known weakness, and the design response.** In a small comparison (5 AI-led and 6 human-led interviews) the AI interviewer committed 88% of the failures to follow up on unclear answers (Wuttke et al., 2025). An LLM requirements interviewer elicited at most 73.7% of requirements and invented a figure in one interview (Korn et al., preprint). Hence the coverage tracker and the expert's confirmation.
- **Gap.** No study was found of an LLM conducting critical-incident interviews with domain experts, and none in Vietnamese.

**Ghi chú:** chỗ này dẫn tới câu hỏi 1 cho cô ở slide 14 (phạm vi AI-1 và AI-2 trong ĐACN).

---

## Slide 4 · Step 2: AI-2 turns expert input into a game seed

**On the slide**

- **What it does.** Helps the Content Administrator turn the experts' answers into a structured seed: context, characters, situations, canon events, and the scoring frame.
- **Rules.**
  - Drafts are written from the expert's own words.
  - **The Domain Expert sets every scoring key and every rubric anchor.** The model only drafts.
  - A seed passes automatic structure checks, then the expert's approval, before any player sees it.
- **Why experts own keys and rubrics.**
  - Rubrics generated by LLMs differ from the rubrics human graders use, and LLM graders take shortcuts; analytic rubrics that reflect human grading logic narrow the gap (Wu et al.).
  - When GPT-4 drafted 210 examination questions, specialists required revision of 15% and judged 0.5% false (Klang et al., 2023).
- **Schema.** The seed follows evidence-centered design: what is measured, which behaviour is evidence for it, and which situation elicits that behaviour (Mislevy & Haertel, 2006; Shute, 2011).
- **Checkpoint 1 of 4 for generated content:** structure check by machine, content approved by the expert.

**Trả lời câu hỏi của cô:** "QA kịch bản sinh", chốt thứ nhất.

**Ghi chú:** chi tiết schema của seed (danh sách fact, thang chấm) chờ game design; nói ở slide 13.

---

## Slide 5 · Step 3: AI-3 helps the expert test before publishing

**On the slide**

- **Problem.** A playthrough contains many free-text answers. A volunteer expert with about seven hours cannot read every one.
- **What it does.** Collects test playthroughs (experts or testers playing, plus simulated answers), runs AI-4 and AI-5 on them, and builds a ranked queue of the cases that need the expert:
  - cases where the three judges differ by more than one level;
  - generated turns that broke a run-time rule;
  - **plus a blind random sample of cases that were not flagged.**
- **The expert decides.** The expert can also refine a rubric anchor during review, so rubrics are versioned: people's criteria shift while they grade (Shankar et al., 2024).
- **Why the random sample is required.** Confidence signals from an LLM grader separate right from wrong grades only weakly (area under the curve 0.57 to 0.64; Ferrer et al., preprint), so flagged cases alone can hide errors. If n audited cases show no error, the error rate is at most about 3/n with 95% confidence (Hanley & Lippman-Hand, 1983).
- **Simulated players only find relative problems.** Persona-prompted LLMs answered with near-perfect, uniform accuracy, unlike 2,359 real students (Balog & Bakken, 2026). Simulated student profiles correlated with real students at r = 0.72 on multiple-choice items (Lu & Wang, 2024). Real test plays are therefore needed as well.
- **Checkpoint 2 of 4.** These expert-scored test plays are also the validation data for the judge (slide 10).
- **This phase.** There are no experts and no real players yet: the team stands in for both and the advisor checks a sample. Results then show that the machinery works, not agreement with experts.

**Trả lời câu hỏi của cô:** "QA kịch bản sinh", chốt thứ hai; và nguồn dữ liệu cho benchmark.

---

## Slide 6 · Step 4: AI-4 narrates during play

**On the slide**

- **The engine owns the plot.** The game engine, not the model, controls the order of canon events. Canon content is shown verbatim from the seed. A situation may have several approved canon variants chosen at random; the log records which variant was served.
- **What the model writes.** Only the connecting narration and the follow-up questions that fit the player's free-text answer. The whole seed is placed in the prompt; no retrieval and no fine-tuning. The rubric and scoring keys are not in its prompt.
- **Run-time checks are rules, not another model call,** so checking adds no waiting time: numbers and names must come from the seed or from the player's own text, and the engine counts follow-ups. A model from a different family reviews the logs afterwards.
- **Evidence.**
  - Holding authored structure outside free generation is the established approach in interactive narrative (Riedl & Bulitko, 2013).
  - In generated text checked against its data, wrong numbers (184) and wrong names (105) were the two largest classes among 418 accuracy errors (Thomson & Reiter, 2020), which is why the rules target them.
  - When the source fits in the prompt, long-context prompting outperformed retrieval on average (Li et al., 2024).
- **How the checks will be shown to work.** A test set of scripted player turns in four classes (on-script, off-script, adversarial, rubric-fishing), reporting the violation rate per class. Not yet built.
- **Checkpoint 3 of 4** (rules at run time) **and 4 of 4** (log review afterwards).

**Trả lời câu hỏi của cô:** "QA kịch bản sinh", chốt thứ ba và thứ tư.

**Ghi chú:** không nêu con số bên ngoài về giới hạn của phép kiểm. Nếu cô hỏi phép kiểm bắt được bao nhiêu lỗi, trả lời là nhóm sẽ đo bằng bộ thử của mình.

---

## Slide 7 · Step 5: AI-5 scores the playthrough

**On the slide**

- **A separate judge.** The scoring model is not the narrating model (design constraint DC-01).
- **No reference answer.** Answers are free text; the judge scores each rubric criterion by how far the answer meets the behaviour described for each level.
- **One call per situation per judge,** with at most three criteria in a call. The call runs in the background when the situation ends; results appear on the summary screen.
- **Auditable output.** For each criterion: a verbatim quote from the player, then the rationale, then the level. The quote must be a substring of what the player typed.
- **A panel of three judges from three model families.** The median is the score. Cases where judges differ by more than one level go to the expert through AI-3. If one judge is unavailable, the system waits for all three.
- **Why not one call for everything.** Batching several rubric checks into one call trades accuracy for cost, and the loss is large when the evidence is spread over a long trajectory (Peng et al., 2026). A verdict on one rubric shifts depending on which other rubrics are judged with it (Yu et al., preprint).
- **Why a panel.** A five-judge vote matched the best single judge (Pearson correlation with humans 0.627 against 0.623; Kim et al., 2025), so a panel reaches the best judge's level without knowing in advance which judge that is. LLM judges also give different scores to the same item across runs (Haldar & Hockenmaier, 2025). We do not claim a panel is more accurate than a single judge.

**Trả lời câu hỏi của cô:** "chấm lượt chơi", phần kỹ thuật.

**Ghi chú:** thang chấm ghi là dự kiến; bảng chấm năng lực và bộ tiêu chí chờ game design (slide 13).

---

## Slide 8 · Your question: does the judge need to be stronger than the generator?

**On the slide**

- **Answer: not relative to the generator.** The judge scores text written by a person, not the generator's output, so the two are not in competition.
- **What the judge does need.**
  1. **Enough knowledge of the work.** Without a reference answer, LLM judges agreed with human experts only on questions they could answer correctly themselves (Krumdick et al., preprint), and judging ability tracks problem-solving ability (Tan et al., 2025). JobQuest has no reference answer, so the judge must understand IT work, and the rubric's behavioural descriptions must carry the domain knowledge.
  2. **Enough capacity.** Small models aligned poorly with human raters (intraclass correlation below 0.20) and larger models moderately (0.41 to 0.57), against 0.45 between the two human raters (Jung et al., 2025).
  3. **Not necessarily a reasoning model.** Two reasoning models had lower validity than a smaller standard model in essay scoring (Yoshida, 2025).
  4. **A different model family.** LLM evaluators recognise and favour their own generations (Panickssery et al., 2024) and favour models whose mistakes resemble their own (Goel et al., 2025).
- **Decision method.** Each judge family is tested at two tiers in week 42; the cheapest tier that is not clearly worse is chosen.

**Trả lời câu hỏi của cô:** "model chấm có cần mạnh hơn model sinh không".

---

## Slide 9 · Your question: is an LLM judge reliable? What published evidence says

**On the slide**

- **Answer: conditionally, not by default.**
- **Average performance of prompted LLMs is below human raters.** On a standard essay-scoring dataset, average quadratic weighted kappa was 0.313 for ChatGPT and 0.297 for Llama, against 0.817 for the best supervised system (Mansour et al., 2024).
- **Conditions under which agreement approaches human level** (report Section 2.5, references [101] to [105]): a strong model, an explicit rubric, and scored examples. This phase relies on the first two; scored examples become available once experts have ruled on test cases.
- **Weakest where it matters.** Automated scorers handle fully correct and fully incorrect answers well and are much worse on partially correct ones, while human agreement stays constant (Schleifer et al., 2026).
- **The evidence is from another setting:** English, essays and short answers, 2023 to 2024 models. No study was found on Vietnamese answers or on role-play transcripts.
- **Consequence.** Reliability must be measured on our own task. That is research problem RP-2, with the acceptance criteria of Williamson et al. (2012): quadratic weighted kappa of at least 0.70, standardised mean difference of at most 0.15, and at most 0.10 below expert–expert agreement.

**Trả lời câu hỏi của cô:** nhận xét 26/9 về bằng chứng đã công bố cho độ tin cậy của LLM judge.

**Ghi chú:** slide này phải khớp với slide ngưỡng chấp nhận trong phần D do Nhật trình bày. Dẫn tới câu hỏi 3 cho cô ở slide 14.

---

## Slide 10 · Your questions: benchmark and framework

**On the slide**

- **No public benchmark matches our task** (ordinal rubric, short answers written by people, Vietnamese, IT work). Existing ones are used as references only:
  - JudgeBench: pairwise correctness judgments (Tan et al., 2025);
  - BiGGen Bench: a 1-to-5 rubric with a description per level and human ratings (Kim et al., 2025);
  - SEA-HELM: how well each model handles Vietnamese.
- **Our benchmark.** Playthrough transcripts scored by Domain Experts during testing (slide 5), compared with the judges' scores on the same transcripts, situation by situation.
- **Measures.** Quadratic weighted kappa with a confidence interval; the confusion matrix; exact and adjacent agreement; stability across repeated runs; share of quotes found verbatim in the transcript.
- **First test, week 42.** About 30 transcripts; six judge models (three families, two tiers each); per-situation calls against one call for the whole playthrough; three repeated runs.
- **Framework.**
  - Offline test harness: **Inspect AI**, open source, maintained by the UK AI Security Institute. It provides repeated runs, several grader models in one run, a median reducer and an ordinal Krippendorff's alpha. Our rubric needs a custom scorer.
  - In the product: our own TypeScript module with schema-validated output. Prompts and rubrics are kept in data files shared by both.
  - Not chosen: OpenAI's hosted Evals platform was announced deprecated on 3 June 2026.
- These tools have no peer-reviewed papers. The cited science is in the method: rubric-based scoring with reasoning before the score (Liu et al., 2023) and panels of judges (Verga et al., preprint).

**Trả lời câu hỏi của cô:** "benchmark" và "framework cho LLM judge".

**Ghi chú:** nói rõ ở giai đoạn này nhóm đóng vai DE nên kết quả chưa phải độ khớp với chuyên gia (D-47).

---

## Slide 11 · Your question: AI-native, and what happens when the AI is down

**On the slide**

- **Definition adopted.** A system is AI-native when AI is constitutive of its core loop, so that removing the AI makes the central activity collapse or change fundamentally (Xu et al., preprint, a survey of 53 AI-native games), and when AI is part of design, operation and maintenance, not an added component (Ericsson, white paper). No standards body defines the term; ITU-R M.2160 uses it without a definition.
- **Applied to JobQuest.** AI works at all five steps. Without it the system cannot fit the narration to a free-text answer and cannot score that answer. There is no substitute path: no keyword scoring and no scripted replacement.
- **When the model provider fails.**
  - Generation and scoring, the core, stop.
  - The session pauses. Answers and progress are saved (NFR-04), and play resumes when the AI returns.
  - Pages that do not use AI (sign-in, occupation map, profile) stay available.
  - Switching to another provider is still AI, not a fallback (DC-02).
- **Why several providers.** A study of public incident reports found an incident on average every 5.6 days for the OpenAI API and every 5.2 days for the Anthropic API, a median recovery time of about one hour, and no correlation between providers (Chu et al., 2025).

**Trả lời câu hỏi của cô:** "AI-native, chứng minh kỹ, khi AI sập thì có còn chạy được không".

**Ghi chú:** nêu thẳng hai nguồn neo của định nghĩa là một preprint và một tài liệu của hãng; đây là câu hỏi 4 cho cô. Không bàn tới prototype.

---

## Slide 12 · Your question: comparing technologies and AI models

**On the slide**

- **Four model families are needed:** one for generation, three for the judge panel. Judges must differ from the generator (DC-01) and from each other; bias toward related models falls as the relationship becomes more distant (Li et al., 2026).
- **Criteria for comparing models:** Vietnamese capability; knowledge of IT work; response time; price; support for schema-constrained output; data terms.
- **Candidates to test** (list prices in US dollars per million tokens, input / output, read on 8 and 9 October 2026):

| Role | Candidates | Vietnamese evidence (SEA-HELM, 18 Sep 2026) |
|---|---|---|
| Judge, Anthropic | claude-sonnet-5-5 (2 / 10); claude-haiku-5-5 (0.10 / 0.50) | Sonnet 5: 77.0; Haiku 4.5: 67.7 (earlier models of the same line) |
| Judge, OpenAI | gpt-6.1-sol (2 / 10); gpt-6-luna (0.10 / 0.50) | GPT 5.6 Sol: 77.1; GPT 5.6 Luna: 71.9 (earlier models) |
| Judge, Google | gemini-3.8-flash (0.75 / 3.75); gemini-3.5-flash-lite (0.30 / 2.50) | 78.4; Gemini 3.1 Flash Lite: 75.2 |
| Narrator | deepseek-flash (0.30 / 1.20); qwen3.8-flash (0.15 / 0.47) | DeepSeek V4 Flash: 72.1; Qwen 3.8 Flash Next: 74.9 |

- **What public data cannot tell us:** no public benchmark covers IT knowledge for our three roles; the newest small models are not on the Vietnamese leaderboard; no response-time data measured from Vietnam.
- **Estimated cost of one playthrough** (token counts are assumptions): about 0.015 US dollars with small-tier judges and about 0.086 with mid-tier judges, narrator included.
- **The final choice is made after the week-42 test,** reported with agreement, response time and cost.

**Trả lời câu hỏi của cô:** email 1/10, mục 9: đối sánh giải pháp công nghệ, kể cả model AI.

**Ghi chú:** ghi rõ "candidates to test", chưa phải lựa chọn cuối. Chỗ này dẫn tới câu hỏi 2 cho cô (mô hình miễn phí có hạn mức, mua thêm lượt).

---

## Slide 13 · Not settled yet: waiting for game design

**On the slide**

- The scoring scale: how many levels and what each level means. The scale −1 / 0 / +1 / +2 is **planned, not final**; the current sample scenarios describe three levels only.
- The competency scoring table for a playthrough, and the specific criteria given to the judge.
- The list of required facts in a seed, needed to measure fact preservation (NFR-15).
- How evidence from the play process (hints, time, follow-ups) counts, and how scores combine into a competency.
- The current sample scenarios and scoring are placeholders and will be revised.
- **What does not depend on game design:** the measure itself. Agreement between judge and expert can be computed on any ordinal scale.

**Ghi chú:** slide này giúp cô thấy phần nào chưa có là có chủ đích.

---

## Slide 14 · Decisions we need from you, and next steps

**On the slide**

**Questions**

1. **Scope of AI-1 and AI-2 in this phase.** We propose building AI-4 and AI-5 fully, AI-3 as a test harness, and AI-1 and AI-2 as a design with a prototype. Is that the right scope?
2. **A daily free quota with paid extra plays.** One playthrough costs an estimated 400 to 2,200 Vietnamese dong in model calls. May we move from "free for everyone" to a number of free plays per day plus paid additional plays? We would implement only the daily quota in this phase.
3. **The pass mark for the judge (NFR-14).** Keep quadratic weighted kappa of at least 0.70, or treat "at most 0.10 below expert–expert agreement" as the main criterion?
4. **The definition of AI-native.** Its two anchors are a preprint and a vendor white paper. Is that acceptable?
5. **Section 5.2.3.** May it present candidates, criteria, a provisional choice and a test plan, with the final choice reported after measurement?
6. **Was the 6 October task list your feedback from 3 October?** We have no minutes of that meeting.

**Next steps**

- Week 42: the first test (about 30 transcripts, six judge models, two narrator candidates).
- Write Section 5.2.3, then Section 5.3.6 (prompts, output schema, scoring flow).
- Game design: scale, competency table, judge criteria.

**Ghi chú:** dành nhiều thời gian nhất cho slide này. Tỉ giá và số token trong câu 2 là giả định.

---

## Slide 15 và 16 · References

**On the slides** (chia hai slide; nguồn đã có trong báo cáo ghi kèm số trong ngoặc vuông)

**Peer-reviewed**

- Balog, K., & Bakken, A. M. (2026). "Act Like a 5th Grader" is Not Enough: Bounding Knowledge in LLM-Based User Simulators. *Findings of EMNLP 2026*. arXiv:2608.30033.
- Chu et al. (2025). *ICPE 2025*. doi:10.1145/3676151.3719372.
- Flanagan, J. C. (1954). The critical incident technique. *Psychological Bulletin*, 51(4), 327–358. [26]
- Goel, S., et al. (2025). Great Models Think Alike and this Undermines AI Oversight. *ICML 2025* (PMLR 267). arXiv:2502.04313.
- Haldar, R., & Hockenmaier, J. (2025). Rating Roulette: Self-Inconsistency in LLM-As-A-Judge Frameworks. *EMNLP 2025*. arXiv:2510.27106.
- Hanley, J. A., & Lippman-Hand, A. (1983). *JAMA*. doi:10.1001/jama.1983.03330370053031.
- Jung, J., Lu, M., Benker, S. C., & Darici, D. (2025). How Model Size, Temperature, and Prompt Style Affect LLM-Human Assessment Score Alignment. *NCME AIME 2025*. arXiv:2509.19329.
- Kim, S., et al. (2025). BiGGen Bench. *NAACL 2025*. arXiv:2406.05761.
- Klang, E., et al. (2023). *BMC Medical Education*, 23, 772. doi:10.1186/s12909-023-04752-w.
- Li, D., et al. (2026). Preference Leakage: A Contamination Problem in LLM-as-a-judge. *ICLR 2026*. arXiv:2502.01534.
- Li, Z., Li, C., Zhang, M., Mei, Q., & Bendersky, M. (2024). Retrieval Augmented Generation or Long-Context LLMs? A Comprehensive Study and Hybrid Approach. *EMNLP 2024 Industry Track*. arXiv:2407.16833.
- Liu, Y., et al. (2023). G-Eval: NLG evaluation using GPT-4 with better human alignment. *EMNLP 2023*. [58]
- Lu, X., & Wang, X. (2024). Generative Students: Using LLM-Simulated Student Profiles to Support Question Item Evaluation. *L@S 2024*. arXiv:2405.11591.
- Mansour, W., Albatarni, S., Eltanbouly, S., & Elsayed, T. (2024). Can Large Language Models Automatically Score Proficiency of Written Essays? *LREC-COLING 2024*. arXiv:2403.06149.
- Mislevy, R. J., & Haertel, G. D. (2006). *Educational Measurement: Issues and Practice*, 25(4), 6–20. doi:10.1111/j.1745-3992.2006.00075.x.
- Panickssery, A., Bowman, S. R., & Feng, S. (2024). LLM Evaluators Recognize and Favor Their Own Generations. *NeurIPS 2024*. arXiv:2404.13076.
- Peng, Y., et al. (2026). Can LLM-as-a-Judge Reliably Verify Rubrics in Agentic Scenarios? *EMNLP 2026*. arXiv:2606.29920.
- Riedl, M. O., & Bulitko, V. (2013). Interactive Narrative: An Intelligent Systems Approach. *AI Magazine*, 34(1). doi:10.1609/aimag.v34i1.2449.
- Schleifer, A. V. G., Ariely, M., Beigman Klebanov, B., Salman, A., & Alexandron, G. (2026). Quality-Conditioned Agreement in Automated Short Answer Scoring. *BEA 2026*. arXiv:2605.07647.
- Shankar, S., Zamfirescu-Pereira, J. D., Hartmann, B., Parameswaran, A. G., & Arawjo, I. (2024). Who Validates the Validators? *UIST 2024*. doi:10.1145/3654777.3676450.
- Shute, V. J. (2011). Stealth assessment in computer-based games to support learning. [20]
- Tan, S., et al. (2025). JudgeBench: A benchmark for evaluating LLM-based judges. *ICLR 2025*. arXiv:2410.12784. [60]
- Thomson, C., & Reiter, E. (2020). A Gold Standard Methodology for Evaluating Accuracy in Data-To-Text Systems. *INLG 2020*. arXiv:2011.03992.
- Whetzel, D. L., Sullivan, T. S., & McCloy, R. A. (2020). Situational judgment tests: An overview of development practices and psychometric characteristics. *Personnel Assessment and Decisions*, 6(1). [27]
- Williamson, D. M., Xi, X., & Breyer, F. J. (2012). [71]
- Wu, X., Saraf, P. P., Lee, G., Latif, E., Liu, N., & Zhai, X. Unveiling Scoring Processes. Accepted, *Technology, Knowledge and Learning*. arXiv:2407.18328.
- Wuttke, A., Aßenmacher, M., Klamm, C., Lang, M. M., Würschinger, Q., & Kreuter, F. (2025). AI Conversational Interviewing. *LaTeCH-CLfL 2025*. arXiv:2410.01824.
- Xiao, Z., Zhou, M. X., Liao, Q. V., Mark, G., Chi, C., Chen, W., & Yang, H. (2020). Tell Me About Yourself. *ACM TOCHI*. doi:10.1145/3381804.
- Yoshida, L. (2025). Are the Reasoning Models Good at Automated Essay Scoring? *Findings of EMNLP 2025*, 8388–8394. doi:10.18653/v1/2025.findings-emnlp.445.

**Preprints and working papers**

- Chopra, F., & Haaland, I. Conducting Qualitative Interviews with AI. CESifo Working Paper 10666.
- Ferrer, R., Turgut, D., Chen, Z., & Sonkar, S. (2026). When Can We Trust LLM Graders? arXiv:2603.29559.
- Korn, A., Gorsch, S., & Vogelsang, A. (2025). LLMREI: Automating Requirements Elicitation Interviews with LLMs. arXiv:2507.02564.
- Krumdick, M., Lovering, C., Reddy, V., Ebner, S., & Tanner, C. (2025). No Free Labels: Limitations of LLM-as-a-Judge Without Human Grounding. arXiv:2503.05061.
- Verga, P., et al. (2024). Replacing judges with juries. arXiv:2404.18796. [74]
- Xu et al. (2026). AI Native Games. arXiv:2607.00527.
- Yu, D., Zhang, T., Mou, Y., Zhang, Y., Ye, W., & Zhang, S. (2026). Mitigating Rubric Interference in LLM Judges via On-Policy Self-Distillation. arXiv:2608.14684.

**Standards, vendor material and official documentation**

- ITU-R Recommendation M.2160-0 (2023).
- Ericsson. Defining AI native (white paper). ericsson.com.
- UK AI Security Institute. Inspect AI documentation. inspect.aisi.org.uk.
- OpenAI. API deprecations page (Evals platform, announced 3 June 2026).
- AI Singapore. SEA-HELM leaderboard, Vietnamese track (18 September 2026).
- Provider pricing pages of Anthropic, OpenAI, Google, DeepSeek and Alibaba (read 8 and 9 October 2026).

---

## Tài liệu tham khảo: mức đã kiểm (không lên slide)

| Nguồn | Dùng ở slide | Mức kiểm | Việc còn lại trước khi dựng |
|---|---|---|---|
| Chopra & Haaland | 3 | ✔✔ số Bảng 1 và 766 buổi đã được lượt kiểm nguồn xác nhận | Ghi năm của bản đang trích (bản sửa 2026) |
| Xiao et al. 2020 | 3 | ✔ | — |
| Wuttke et al. 2025 | 3 | ✔✔ (5 và 6 buổi, 88%) | — |
| Korn et al. | 3 | ✔✔ (73,7%, vụ bịa con số) | — |
| Wu et al. | 4, 8 | ✔ | — |
| Klang et al. 2023 | 4 | ✔✔ qua tóm tắt (210, 15%, 0,5%) | Điền tên bài từ trang gốc |
| Mislevy & Haertel 2006 | 4 | ✔ tóm tắt và DOI | Điền tên bài từ trang gốc |
| Shankar et al. 2024 | 5 | ✔ | — |
| Ferrer et al. | 5 | ✔✔ (AUC 0,570–0,639) | — |
| Hanley & Lippman-Hand 1983 | 5 | 🔍 mới đọc được đoạn mở đầu; điều kiện n > 30 lấy từ một bài nhắc lại năm 1995 | Đọc bản gốc; điền tên bài |
| Balog & Bakken 2026 | 5 | ✔ | — |
| Lu & Wang 2024 | 5 | ✔✔ (r = 0,72) | — |
| Riedl & Bulitko 2013 | 6 | ✔ | — |
| Thomson & Reiter 2020 | 6 | ✔✔ (184 và 105 trên 418) | — |
| Li, Z. et al. 2024 | 6 | ✔ | — |
| Peng et al. 2026 | 7 | ✔ kết luận định tính ở §4.4 | Con số theo cỡ gộp nằm trong hình; slide không dùng số |
| Yu et al. | 7 | ✔ tóm tắt | — |
| Kim et al. 2025 (BiGGen Bench) | 7, 10 | ✔✔ (0,627 và 0,623, §5.1 Bảng 3) | Điền tên bài đầy đủ và danh sách tác giả |
| Haldar & Hockenmaier 2025 | 7 | ✔ | — |
| Krumdick et al. | 8 | ✔ tóm tắt (đúng câu được trích) | — |
| Tan et al. 2025 (JudgeBench) | 8, 10 | ✔ qua lượt kiểm nguồn | — |
| Jung et al. 2025 | 8 | ✔✔ (dưới 0,20; 0,41–0,57; 0,45) | — |
| Yoshida 2025 | 8 | ✔ | — |
| Panickssery et al. 2024; Goel et al. 2025 | 8 | ✔ (nơi đăng đã xác nhận) | — |
| Mansour et al. 2024 | 9 | ✔✔ (0,313; 0,297; 0,817) | — |
| Schleifer et al. 2026 | 9 | ✔ | — |
| Williamson et al. 2012 [71] | 9 | Đã có trong báo cáo; lượt này không mở lại | — |
| Inspect AI, tài liệu | 10 | ✔ (mình kiểm qua Context7; lượt kiểm nguồn xác nhận bộ gộp trung vị và alpha thứ bậc) | — |
| OpenAI, trang deprecations | 10 | ✔ qua lượt kiểm nguồn | — |
| Liu et al. 2023 (G-Eval) [58] | 10 | ✔ (đã có trong báo cáo; mình mở lại §2 của bài) | — |
| Verga et al. [74] | 10 | ✔✔ | — |
| Xu et al. (AI Native Games) | 11 | 🔍 | Đọc bản gốc; điền tác giả; kiểm câu định nghĩa và con số 53 game |
| Ericsson, white paper | 11 | 🔍 | Đọc lại câu định nghĩa trên trang gốc; trang không ghi ngày |
| ITU-R M.2160-0 | 11 | 🔍 (agent đọc PDF) | Mở lại để xác nhận thuật ngữ không được định nghĩa |
| Chu et al. 2025 | 11 | 🔍 | Đọc bản gốc; điền tên bài, tác giả; kiểm 5,64 và 5,22 ngày, thời gian phục hồi, kết luận không tương quan |
| Li, D. et al. 2026 (Preference Leakage) | 12 | ✔ (số Bảng 2 đã được lượt kiểm nguồn xác nhận; slide không dùng số) | — |
| Giá Anthropic | 12 | ✔✔ (đối chiếu với tài liệu tham chiếu của Claude API) | — |
| Giá OpenAI, Google, DeepSeek, Alibaba | 12 | 🔍 | Mở lại trang giá chính thức trong ngày dựng slide |
| SEA-HELM | 12 | 🔍 (agent đọc bảng xếp hạng) | Mở lại bảng xếp hạng; xác nhận các điểm được trích |
| Chi phí một lượt chơi | 12, 14 | Mình tự tính, số token là giả định | Ghi rõ là ước tính |

## Việc cần làm trước khi dựng slide

1. Đọc bản gốc cho các nguồn đánh dấu 🔍, nhất là ba nguồn của slide 11 và các trang giá của slide 12.
2. Thống nhất với Nhật: 16 slide này là phần AI của master deck (D-75). Slide 9 và 10 phải khớp với phần D của Nhật (research problem và ngưỡng chấp nhận), vì cách chấm đã đổi so với deck 26/9.
3. Phúc duyệt chữ trên từng slide. Sau đó mới dựng bằng skill `capstone-slides`.
