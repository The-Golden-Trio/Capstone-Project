# Game economy, pay scaling, fairness and extrinsic rewards

> Researched 3 Nov 2026 for `research/reports/Kinh tế và sức khoẻ JobQuest.md`.
> Marks: **(inference)** = the researcher's own extrapolation, no source states it; **(memory)** = not re-verified in this session, check before citing. Full texts of Deci et al. 1999, Dormans & Adams 2012 and Lehdonvirta & Castronova 2014 were not read; they are verified through abstracts and secondary summaries only.

## Summary

Use a faucet-and-drain economy priced in "missions to afford", not in raw coins. Make pay differences a compressed bonus on top of a fixed base reward. Keep the signals that gate jobs and drive the career suggestion out of the shop's reach, or compute them from unbuffed play. Coins are best framed as informational feedback on competence, not as a payment announced in advance.

## 1. Faucets, sinks, inflation, pricing

- **Basic model.** Faucets add currency, sinks remove it. Faucets ahead of sinks → inflation, "currency becomes meaningless"; sinks ahead → starvation. Secondary summary of Lehdonvirta & Castronova: [reader notes](https://www.antoinebuteau.com/virtual-economies-book-summary/); [book record](https://research.utu.fi/converis/portal/detail/Publication/1870486?lang=en_US).
- **Daniel Cook, "Value chains" (Lostgarden, 2021)**, read in full: [link](https://lostgarden.com/2021/12/12/value-chains/)
  - Prefer "taut" economies: sinks slightly larger than sources.
  - A trickle of 10 gold a day becomes 7,300 gold in two years: the late-game shop-irrelevance problem in one number.
  - Sources come in power tiers (constant/capped, linear/trickle, exponential, adaptive); low-power sources should feed equal or higher-power sinks.
  - Grind-type sources are highly variable; convert them to capped or trickle sources.
  - For fixed-length games, tally every source and sink on a spreadsheet ("golden path"); cap each source so players don't ignore content.
  - The same total spent as many small purchases feels better than one large grindy sink.
- **Lehdonvirta, GDC 2014**, "Economic Balancing and Improved Monetization Through Clever Sink Design": six currency sinks, eleven item sinks, spreadsheet simulation. Abstract only. [GDC Vault](https://gdcvault.com/play/1020524/Economic-Balancing-and-Improved-Monetization)
- **Pricing as time-to-afford:** price = earnings per hour × hours of value. Low-authority blog, but consistent with Cook's golden path. [Strayspark](https://www.strayspark.studio/blog/game-economy-balancing-spreadsheets)
- **Dormans & Adams, *Game Mechanics: Advanced Game Design* (2012)**: internal economies, Machinations. Chapter text not accessed; no specific claim attributed. [record](https://research.hva.nl/en/publications/game-mechanics-advanced-game-design/)
- **Single-player** (inference from Cook): no trade means no inflation through other players; the failure is accumulation, money piles up and late prices stop mattering. Fixed sinks are weak against an ongoing trickle; use repeatable, exponential or competitive sinks.

**For JobQuest.** Design unit = missions to afford per shop category. Starting targets (inference, tune in playtest): consumable utility 2–4 missions; cosmetic 8–15; NPC/sidequest unlock 15–25; skill-gain buff 5–10 per use. Include repeatable sinks (consumables, recovery) and a few large aspirational sinks. Model the whole economy on a spreadsheet first.

## 2. Scaling income by job without making low-pay jobs a grind

- **The Sims 4 careers:** per-level pay table; promotions gated by skill and tasks, one-time bonuses; pay climbs steeply (Business about §20 → §375/hr, ~19×, per a fan guide). [Snooty Sims](https://snootysims.com/wiki/sims-4/sims-4-jobs-careers/); [EA help, Salaryperson](https://help.ea.com/zh/articles/the-sims/the-sims-4/salaryperson-career). Fan and help pages, not design documents.
- **Stardew Valley:** crops differ in gold per day through cost, regrowth, processing; viability comes from different constraints, not equal pay. Only forums/SEO guides found; cite the [wiki](https://stardewvalleywiki.com/Crops) if figures are needed (not fetched).
- **BitLife:** nothing reputable found.
- **Catch-up mechanics:** design essays only; catch-up that punishes the leader or negates skill feels unfair. [Law of Game Design](https://lawofgamedesign.com/2014/08/25/theory-rubber-bands/); [Anil Dash](https://anildash.com/2009/04/06/elastic-happiness/). No empirical study; weakest part of the evidence.

**For JobQuest (inference).** Reward per mission = fixed base for every job + bonus compressed from salary, multiplier = (salary/reference)^α, α ≈ 0.3–0.5: a 9× pay gap becomes 1.9–3.0×, the middle-80% 3.4× gap becomes 1.5–1.8×. Express "richer" through display (wealth-themed cosmetics, bigger home/office), not faster progression. Never gate the next job level on coins.

## 3. Earned-currency pay-to-progress and fairness

- Buying power with earned currency is accepted in single-player RPGs because everyone faces the same economy. The literature on unfairness concerns money buying advantage in competitive play: [Freeman et al. 2022, CHI PLAY](https://digitalcommons.njit.edu/fac_pubs/2577) (2,685 Reddit posts); [Hamari et al. 2020, "Costs to Compete"](https://link.springer.com/10.1007/978-3-030-61814-8_14) (96 participants).
- Inequity aversion explains why unequal outcomes between comparable people feel unfair. [Fehr & Schmidt 1999](https://web.stanford.edu/~niederle/Fehr.Schmidt.1999.QJE.pdf)
- A 2025 ECIS experiment (N=735, e-commerce discounts, not games) found higher perceived fairness in single-player conditions. Weak, off-domain. [ECIS 2025](https://aisel.aisnet.org/ecis2025/ethical/ethical/9)

**For JobQuest (inference).** No source addresses income that differs by career choice in a non-competitive game. Fairness risk rises when players can compare balances: no leaderboards or public wealth. A skill-gain buff is the one real pay-to-progress item: cap it, and compute "you are good at" from unbuffed performance.

## 4. Extrinsic rewards and motivation

- **Deci, Koestner & Ryan 1999**, *Psychological Bulletin* 125(6), 128 studies: tangible rewards undermine free-choice intrinsic motivation; engagement-, completion- and performance-contingent rewards d = −0.40, −0.36, −0.28 (abstract). [PDF](https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf). (memory) Verbal praise enhances, unexpected rewards don't undermine, children more vulnerable.
- **Cameron, Banko & Pierce 2001**: negatives appear mainly on high-interest tasks, for expected tangible rewards loosely tied to performance; rewards on low-interest tasks help. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC2731358/)
- **Ryan, Rigby & Przybylski 2006**: game pull comes from autonomy, competence, relatedness. [PDF](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf)
- **Sailer et al. 2017**, *Computers in Human Behavior* 69: badges, leaderboards, performance graphs raised competence; avatars, stories, teammates raised relatedness. [paper](https://opus.bibliothek.uni-augsburg.de/opus4/files/109059/109059.pdf)
- **Sailer & Homner 2020**, *Educ Psych Rev* 32(1): g = .49 cognitive (k=19), .36 motivational (k=16), .25 behavioural (k=9); fiction and social interaction moderate behavioural outcomes. [paper](https://link.springer.com/article/10.1007/s10648-019-09498-w)
- **Hanus & Fox 2015**, *Computers & Education* 80 (N≈80, 16 weeks): leaderboard and badges lowered intrinsic motivation and exam scores. Secondary verification only.

**For JobQuest.** Coins as feedback after a mission ("you showed X"), not "do X for N coins" before it. Tie rewards to performance rather than completion or time spent (inference; performance-contingent had the smallest negative effect). No leaderboards. Use narrative meaning over point-chasing.

## 5. Grind in educational games

- **Habgood & Ainsworth 2011**, *J Learning Sciences* 20(2): with learning built into the core mechanic, children learned more and chose to play ~7× longer in free time. [SHURA](https://shura.shu.ac.uk/3556/)
- **Wouters et al. 2013**, *J Educ Psych* 105(2): serious games beat conventional instruction (d ≈ .29); motivation results mixed. [UU](https://research-portal.uu.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/)
- Cook: repeated actions burn out; cap variable grind sources.
- No formal study of grind in educational games found.

**For JobQuest (inference).** Diminishing coin payout on replays (e.g. 100% / 50% / 25%); a daily coin cap so nobody farms; the first unlock tier reachable in a few sessions in every job; shop purchases never replace a mission.

## Strongest sources

1. Deci, Koestner & Ryan (1999). *Psychological Bulletin* 125(6), 627–668.
2. Cameron, Banko & Pierce (2001). *The Behavior Analyst* 24(1), 1–44.
3. Ryan, Rigby & Przybylski (2006). *Motivation and Emotion* 30(4), 347–363.
4. Sailer & Homner (2020). *Educ. Psychol. Rev.* 32(1), 77–112.
5. Sailer, Hense, Mayr & Mandl (2017). *Computers in Human Behavior* 69, 371–380.
6. Habgood & Ainsworth (2011). *J. Learning Sciences* 20(2), 169–206.
7. Cook (2021). Value chains. Lostgarden.
8. Lehdonvirta & Castronova (2014). *Virtual Economies*. MIT Press.
9. Freeman, Wu, Nower & Wohn (2022). *PACM HCI* 6(CHI PLAY).
