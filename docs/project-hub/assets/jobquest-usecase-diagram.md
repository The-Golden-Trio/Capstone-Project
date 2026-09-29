# JobQuest — Use case diagrams (one per actor)

Requires Mermaid v11.11+ / v12 (`usecase-beta`).

Use cases shared between actors appear in more than one diagram: UC-07, UC-08 and UC-14 (Content administrator + Domain expert), and Account management (all four actors).

## Figure 5.3a — Explorer

```mermaid
usecase-beta
direction LR
actor Explorer("Explorer")

systemBoundary "JobQuest"
  UC1("UC-01 Explore occupation catalogue")
  UC2("UC-02 Complete orientation quiz")
  UC3("UC-03 Perform a task scenario")
  UC4("UC-04 Progress to a further level or occupation")
  UC5("UC-05 Rate a completed occupation")
  UC6("UC-06 Review personal record")
  UC17("Account management")
end

Explorer --> UC1
Explorer --> UC2
Explorer --> UC3
Explorer --> UC4
Explorer --> UC5
Explorer --> UC6
Explorer --> UC17
```

## Figure 5.3b — Content administrator

```mermaid
usecase-beta
direction LR
actor ContentAdmin("Content administrator")

systemBoundary "JobQuest"
  UC7("UC-07 Author scenario context and rules")
  UC8("UC-08 Validate generated scenario")
  UC10("UC-10 Manage occupation lifecycle")
  UC14("UC-14 Test-play a scenario before submission")
  UC17("Account management")
end

ContentAdmin --> UC7
ContentAdmin --> UC8
ContentAdmin --> UC10
ContentAdmin --> UC14
ContentAdmin --> UC17
```

## Figure 5.3c — Domain expert

```mermaid
usecase-beta
direction LR
actor DomainExpert("Domain expert")

systemBoundary "JobQuest"
  UC7("UC-07 Author scenario context and rules")
  UC8("UC-08 Validate generated scenario")
  UC9("UC-09 Review assessment disagreements")
  UC14("UC-14 Test-play a scenario before submission")
  UC15("UC-15 Author reference item with AI assistance")
  UC17("Account management")
end

DomainExpert --> UC7
DomainExpert --> UC8
DomainExpert --> UC9
DomainExpert --> UC14
DomainExpert --> UC15
DomainExpert --> UC17
```

## Figure 5.3d — System administrator

```mermaid
usecase-beta
direction LR
actor SystemAdmin("System administrator")

systemBoundary "JobQuest"
  UC11("UC-11 Monitor coverage and currency")
  UC12("UC-12 Configure generation and assessment models")
  UC13("UC-13 Monitor operation and cost")
  UC16("UC-16 Create occupation and assign responsibility")
  UC17("Account management")
end

SystemAdmin --> UC11
SystemAdmin --> UC12
SystemAdmin --> UC13
SystemAdmin --> UC16
SystemAdmin --> UC17
```
