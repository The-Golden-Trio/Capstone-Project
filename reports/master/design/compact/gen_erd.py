"""Split the entity-relationship source file ERD_JobQuest_Chen.puml into twenty-four small diagrams ERD-01a … ERD-06d.

The single file stays the source of truth (gen_domain.py and gen_class.py read it too).
This script only reads it and writes plantuml/erd/ERD-0nx_*.puml. Edit the source, then rerun.

The twelve groups A-L of the model are first collected into six parents ERD-01 … ERD-06 (the
numbering the report and the other documents use); each parent is then split into sub-views of
at most 8 entities so that the printed diagram stays readable on an A4 page.

Split rules:
  - each entity has one home view (listed in VIEWS); only there is it drawn with every attribute;
  - an entity from another view is drawn as a stub with its key attributes only, and listed
    in the title as "borrowed" with its home view;
  - each relationship is drawn once, in a sub-view of the parent that declares its section: the
    sub-view that owns most of its ends, and on a tie the sub-view with fewest relationships.
"""
from collections import Counter
from pathlib import Path

from erd_parse import ERD, parse_erd

OUT = ERD.parent
MAX_ENTITIES = 8

PARENT_SECTIONS = {"ERD-01": "AL", "ERD-02": "BC", "ERD-03": "DE", "ERD-04": "F", "ERD-05": "GK", "ERD-06": "HIJ"}

VIEWS = [
    ("ERD-01a", "Identity", "Identity and assignment",
     "USER_ACCOUNT EXPLORER STAFF_MEMBER USER_IDENTITY AUTH_SESSION PASSWORD_RESET_TOKEN AUDIT_LOG NOTIFICATION"),
    ("ERD-01b", "QualityAndFeedback", "Grading quality and feedback",
     "BLIND_RATING REFERENCE_REGRADE OCCUPATION_RATING RATING_ATTRIBUTE APP_FEEDBACK PLATFORM_SETTING"),
    ("ERD-01c", "AiOperations", "AI operations",
     "PROMPT_TEMPLATE MODEL_CONFIG MODEL_SLOT MODEL_PRICE AI_JOB MODEL_CALL"),
    ("ERD-02a", "Occupations", "Occupations and interest regions",
     "INTEREST_REGION OCCUPATION_GROUP OCCUPATION BAND"),
    ("ERD-02b", "LevelsAndTasks", "Occupation levels and tasks",
     "OCCUPATION_LEVEL LEVEL_TASK"),
    ("ERD-02c", "WorkEnvironments", "Work environments",
     "WORK_ENVIRONMENT DEPARTMENT COMPANY_TYPE COMPANY"),
    ("ERD-02d", "ReferenceAndKeywords", "Reference data and keywords",
     "IMPORT_BATCH IMPORT_ISSUE ONET_OCCUPATION ESCO_OCCUPATION ESCO_SKILL_GROUP KEYWORD"),
    ("ERD-02e", "SoftSkills", "Soft skills",
     "SOFT_SKILL_GROUP SOFT_SKILL_ITEM SKILL_TIER CHECK_QUESTION CONDUCT_FLAG"),
    ("ERD-03a", "Scenario", "Scenario",
     "SCENARIO TIMELINE_EVENT AMBIENT"),
    ("ERD-03b", "PackAndSlots", "Level pack and scenario slots",
     "LEVEL_PACK RESIDENT_SLOT SCENARIO_SLOT"),
    ("ERD-03c", "FactsAndActions", "Scenario facts and actions",
     "FACT ARTEFACT ACTION CHECK STORY_FLAG"),
    ("ERD-03d", "Nodes", "Scenario nodes and options",
     "NODE OPTION OBSERVED_ITEM"),
    ("ERD-03e", "ProbesAndAnswers", "Review probes and reference answers",
     "REVIEW_PROBE REFERENCE_ANSWER"),
    ("ERD-04a", "InterviewAndDrafting", "Interview and AI drafting",
     "TOPIC_GUIDE EXPERT_INTERVIEW INTERVIEW_TURN GENERATION_RUN"),
    ("ERD-04b", "ReviewAndLifecycle", "Review and lifecycle log",
     "CRITERIA_VERSION REVIEW_CRITERION REVIEW_ASSIGNMENT REVIEW REVIEW_COMMENT LIFECYCLE_LOG"),
    ("ERD-04c", "PresentationAndRelease", "Presentation, play-test and release",
     "ASSET PRESENTATION PRESENTATION_SCENE SCENARIO_BUILD PLAYTEST_FINDING TRIAGE_ITEM SCENARIO_RELEASE REVALIDATION_REQUEST"),
    ("ERD-05a", "NpcCards", "Tarot NPC cards",
     "NPC_CARD NPC_ABILITY"),
    ("ERD-05b", "NpcChaptersAndSideQuests", "NPC chapters, outfits and side quests",
     "NPC_CHAPTER NPC_ASSET OUTFIT_GROUP SIDE_ACTIVITY"),
    ("ERD-05c", "Economy", "Economy and inventory",
     "XU_TRANSACTION SHOP_ITEM INVENTORY_ITEM OCCASION INTIMACY_GAIN"),
    ("ERD-05d", "HealthAndLife", "Health, habits and life milestones",
     "HEALTH_CHANGE CAREER_HABIT GAP LIFE_MILESTONE EXPLORER_MILESTONE"),
    ("ERD-06a", "ExplorerProfile", "Explorer profile",
     "GTKM_CARD GTKM_ATTEMPT GOAL_QUESTION GOAL_OPTION EXPLORER_GOAL HOBBY DISTRESS_TERM ZODIAC_SIGN"),
    ("ERD-06b", "Progression", "Progression",
     "ACHIEVEMENT SUGGESTION_EVENT LEVEL_ENROLMENT SCENARIO_BEST"),
    ("ERD-06c", "Runs", "Runs",
     "SCENARIO_RUN RUN_EVENT CONTENT_FLAG INTEREST_TAP NPC_MEMORY SIDE_QUEST_RUN"),
    ("ERD-06d", "Grading", "Evidence and grading",
     "EVIDENCE_SEGMENT ASSESSMENT JUDGE_RESULT FEEDBACK_NOTE"),
]
VIEW_ENTITIES = {v[0]: v[3].split() for v in VIEWS}
ENTITY_HOME = {e: v for v, es in VIEW_ENTITIES.items() for e in es}

SECTION_TITLE = {
    "A": "Identity and assignment", "B": "Catalogue, occupation profile, work environments",
    "C": "Reference data, soft skill, keyword, grading library", "D": "Level pack",
    "E": "Scenario content", "F": "AI drafting, review, presentation, play-test, release",
    "G": "Tarot NPCs, side quests, character assets", "H": "Explorer profile", "I": "Progression",
    "J": "Runs and grading", "K": "Economy, health, calendar, NPC relationship",
    "L": "Grading quality, feedback, AI operations",
}


def parent_of(section):
    for pid, secs in PARENT_SECTIONS.items():
        if section in secs:
            return pid
    raise ValueError(section)


def assign_relationships(entities, relationships):
    """Name of relationship -> view id. Most owned ends first; ties go to the lightest view."""
    load, out, tied = Counter(), {}, []
    for r in relationships.values():
        cands = [v for v in VIEW_ENTITIES if v.startswith(parent_of(r["section"]))]
        ends = [e["entity"] for e in r["ends"]]
        score = {v: sum(ENTITY_HOME[e] == v for e in ends) for v in cands}
        top = max(score.values())
        best = [v for v in cands if score[v] == top]
        if len(best) == 1:
            out[r["name"]] = best[0]
            load[best[0]] += 1
        else:
            tied.append((r["name"], best))
    for name, best in tied:
        v = min(best, key=lambda x: (load[x], x))
        out[name] = v
        load[v] += 1
    return out


def stereo(a):
    s = []
    if a.get("key"):
        s.append("<<key>>")
    if a.get("multi"):
        s.append("<<multi>>")
    if a.get("derived"):
        s.append("<<derived>>")
    return (" " + " ".join(s)) if s else ""


def attr_lines(attrs, indent="  "):
    out = []
    for a in attrs:
        if a["group"]:
            out.append(f"{indent}{a['name']}{stereo(a)} {{")
            out += [f"{indent}  {c['name']}{stereo(c)}" for c in a["children"]]
            out.append(f"{indent}}}")
        else:
            out.append(f"{indent}{a['name']}{stereo(a)}")
    return out


def comment_lines(rec):
    out = []
    if rec.get("tag"):
        out.append(f"' [{rec['tag']}] {rec.get('note') or ''}".rstrip())
    elif rec.get("note"):
        out.append(f"' {rec['note']}")
    return out


def block(kind, name, stereos, attrs):
    head = f"{kind} {name}{(' ' + ' '.join(stereos)) if stereos else ''} {{"
    if not attrs:
        return [head, "}"]  # PlantUML refuses "{ }" on one line
    return [head] + attr_lines(attrs) + ["}"]


def link_line(end, rel, first):
    line = "=" if end["total"] else "-"
    lab = end["label"]
    if first:
        return f"{end['entity']} {line}{lab}{line} {rel}"
    return f"{rel} {line}{lab}{line} {end['entity']}"


def build(vid, slug, title, assignment, entities, relationships, isa):
    own_names = set(VIEW_ENTITIES[vid])
    own_e = [entities[n] for n in VIEW_ENTITIES[vid]]
    own_r = [r for r in relationships.values() if assignment[r["name"]] == vid]
    secs = sorted({e["section"] for e in own_e})
    used = []
    for r in own_r:
        for end in r["ends"]:
            if end["entity"] not in own_names and end["entity"] not in used:
                used.append(end["entity"])
    borrowed = sorted(used, key=lambda n: (ENTITY_HOME[n], n))

    out = [f"@startchen {vid}_{slug}"]
    # No title in the picture: the caption in the report names the diagram.
    if borrowed:
        out.append("' Borrowed, key only: " + ", ".join(f"{n} ({ENTITY_HOME[n]})" for n in borrowed))
    out.append("left to right direction")  # attributes fan out vertically: a much narrower page than the default
    out += [
        "' GENERATED by reports/master/design/compact/gen_erd.py from plantuml/erd/ERD_JobQuest_Chen.puml.",
        "' Do not edit this file: edit ERD_JobQuest_Chen.puml (or VIEWS in the script) and rerun the script.",
        f"' Sections: {', '.join(f'{s}. {SECTION_TITLE[s]}' for s in secs)}",
        "' Notation: <<weak>> double rectangle · <<identifying>> double diamond · <<key>> key (partial on weak)",
        "'   <<derived>> dashed oval · <<multi>> double oval · { } composite · =N= total participation",
        "'   Label next to an entity = that entity's cardinality in the relationship.",
        "' [CAM] research still 'can chot' or draft (07 A28) · [VANG] research 'da chot', no D-ID yet",
        "",
    ]
    out.append("' ═══ Entities ═══")
    for e in own_e:
        out += comment_lines(e)
        out += block("entity", e["name"], ["<<weak>>"] if e["weak"] else [], e["attrs"])
    out.append("")
    out.append("' ═══ Relationships ═══")
    for r in own_r:
        out += comment_lines(r)
        out += block("relationship", r["name"], ["<<identifying>>"] if r["identifying"] else [], r["attrs"])
    out.append("")
    if borrowed:
        out.append("' ═══ Borrowed from other views (key attributes only) ═══")
        for n in borrowed:
            e = entities[n]
            out.append(f"' home: {ENTITY_HOME[n]}")
            out += block("entity", n, ["<<weak>>"] if e["weak"] else [], [a for a in e["attrs"] if a["key"]])
        out.append("")
    out.append("' ═══ Links ═══")
    for i in isa:
        if i["parent"] in own_names:
            line = "=" if i["total"] else "-"
            out.append(f"{i['parent']} {line}>{line} {'o' if i['overlap'] else 'd'} {{ {', '.join(i['children'])} }}")
    for r in own_r:
        for k, end in enumerate(r["ends"]):
            out.append(link_line(end, r["name"], k == 0))
    out += ["", "@endchen", ""]
    path = OUT / f"{vid}_{slug}.puml"
    path.write_text("\n".join(out), encoding="utf-8")
    return path, len(own_e), len(own_r), len(borrowed)


def main():
    entities, relationships, isa = parse_erd()
    assert sorted(ENTITY_HOME) == sorted(entities), "every entity must have exactly one home view"
    assert sum(len(v) for v in VIEW_ENTITIES.values()) == len(entities)
    for vid, ents in VIEW_ENTITIES.items():
        assert len(ents) <= MAX_ENTITIES, f"{vid} has {len(ents)} entities"
        for n in ents:
            assert parent_of(entities[n]["section"]) == vid[:6], f"{n} is in the wrong parent view"
    assignment = assign_relationships(entities, relationships)
    for p in OUT.glob("ERD-0*_*.puml"):
        p.unlink()
    total_e = total_r = 0
    for vid, slug, title, _ in VIEWS:
        path, ne, nr, nb = build(vid, slug, title, assignment, entities, relationships, isa)
        total_e += ne
        total_r += nr
        print(f"{path.name}: {ne} entities, {nr} relationships, {nb} borrowed")
    assert total_e == len(entities) and total_r == len(relationships), "every item must have one home"
    print(f"total {total_e}/{len(entities)} entities, {total_r}/{len(relationships)} relationships")


if __name__ == "__main__":
    main()
