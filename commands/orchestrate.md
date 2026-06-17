# Orchestrate

Run a sequential or parallel agent workflow for complex tasks.

## Usage

```
/orchestrate <workflow-type> <task description>
/orchestrate custom "<agent1>,<agent2>,<agent3>" <task description>
```

## Built-in workflows

| Workflow | Agent sequence |
|----------|---------------|
| `feature` | planner → tester → reviewer → security |
| `bugfix` | tester → reviewer |
| `refactor` | architect → reviewer → tester |
| `security` | security → reviewer → architect |

## Execution

For each agent in the chain:

1. Invoke the agent with context from the previous step
2. Capture output as a handoff — what was done, key findings, files touched, open questions
3. Pass the handoff to the next agent
4. After the final agent, report: what changed, test results, security status, and a verdict (ship / needs work / blocked)

For independent checks (e.g. reviewer + security on the same diff), run agents in parallel and merge outputs.

## Custom workflow

```
/orchestrate custom "architect,tester,reviewer" "Redesign caching layer"
```