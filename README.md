# Investment Policy Studio

An interactive prototype for drafting an investment policy statement (IPS) for a single family office. An IPS records how a portfolio should be managed, including what it covers, what it is meant to achieve, what limits apply, and who can approve changes or exceptions.

An analyst can draft the policy, check the current portfolio against it, and download a PDF for the investment committee. The committee can review the proposed rules alongside the current findings and decide what needs follow-up.

[Open Investment Policy Studio](https://jnoble555.github.io/investment-policy-studio/)

## Draft and review a policy

1. **Define the mandate.** Record the covered entities and excluded assets, return objective and time horizon, risk tolerance and capacity, restrictions, and performance benchmark.
2. **Plan liquidity.** Enter the liquid reserves available for near-term commitments, expected family distributions, capital calls due in the next 12 months, and other outflows such as taxes and fees. Count each outflow once. Enter $0 when no capital calls are expected.
3. **Set allocation bands.** For each asset class, enter the policy minimum, target, and maximum, then enter its current portfolio weight. Use the same portfolio denominator for every weight. Target weights and current weights must each total 100%.
4. **Assign responsibilities.** Identify who approves the policy, who implements it and reports on it, when the committee reviews it, and how breaches and exceptions are handled.
5. **Review and download.** The live panel lists incomplete fields, allocation checks, named breaches, and projected liquidity. Once the inputs pass validation, select **Download IPS PDF** to save a PDF directly. A properly entered breach or liquidity shortfall remains visible in the draft and does not block download.

The PDF opens with a committee review summary of the current scenario, followed by the policy and supporting details. Labels within each section distinguish individual fields from their answers. The Studio generates the file directly, so it contains no browser-added GitHub URL, timestamp, or print header.

## What the checks mean

| Check | Method |
| --- | --- |
| Allocation bands | Each row requires a valid minimum, target, maximum, and current weight. The minimum must be at or below the target, and the target must be at or below the maximum. |
| Allocation breach | A current weight below its minimum or above its maximum is flagged with the asset class, current weight, and applicable limit. A weight equal to either limit is in band. |
| Planned outflows | Family distributions plus expected capital calls plus other outflows. |
| Liquidity coverage | Available liquid reserves divided by planned outflows. When outflows are zero, the Studio displays **No outflows**. |
| Reserve surplus or shortfall | Available liquid reserves minus planned outflows. |

The allocation bands are **policy rules**. Current weights, expected outflows, and calculated flags are **findings for the scenario being reviewed**. A breach is a prompt to review the portfolio. The investment team and committee decide whether to rebalance, approve an exception, or take another action.

## Try the fictional example

Choose **Load fictional example** to populate the Alder Family Office draft. The example uses $2.5 million in available liquid reserves, $1.2 million in distributions, and $300,000 in other outflows.

| Expected capital calls | Total outflows | Coverage | Result |
| --- | --- | --- | --- |
| $800,000 | $2,300,000 | 1.09× | $200,000 surplus |
| $1,000,000 | $2,500,000 | 1.00× | Break-even |
| $1,200,000 | $2,700,000 | 0.93× | $200,000 shortfall |
| $0 | $1,500,000 | 1.67× | $1,000,000 surplus |

At each amount, private investments remain at 21% against a 20% maximum, and cash and equivalents remain at 3% against a 5% minimum. Clear the capital-call amount or enter a negative value to see the field-level validation. Then enter $1.2 million again, download the IPS, and confirm that the page-one summary shows the shortfall and both breaches.

## Scope and assumptions

- The Studio compares aggregate 12-month cash needs and reserves. A projected surplus can coexist with a timing gap if payments come due before cash is available.
- Available reserves are entered separately from the cash and equivalents portfolio weight. For a real mandate, define which entities and accounts can contribute cash and how that reserve figure relates to the allocation table.
- The PDF is a draft for committee review. The Studio does not track approvals, exceptions, revisions, custody positions, or performance history. It also does not import holdings or execute trades.
- Inputs stay in the current browser tab and reset on reload. Save the draft before closing the tab if you need a copy. The Alder example and its policy limits are fictional.

## Run locally

Open `index.html` from the repository in a modern browser. Keep `ips-pdf.js` and the `vendor/` folder in their original locations. The vendored PDF library is pdf-lib 1.17.1 (MIT). The Studio runs in the browser and needs no backend or build step.

## Policy references

The Studio covers scope, objectives, constraints, allocation, liquidity, and governance at the level of a first committee draft. Compare the guidance and published examples below when tailoring it to a real mandate.

- [CFA Institute, IPS elements for individual investors](https://rpc.cfainstitute.org/policy/positions/elements-of-an-investment-policy-statement-for-individual-investors) and [institutional investors](https://rpc.cfainstitute.org/policy/positions/elements-of-an-investment-policy-statement-for-institutional-investors) describe responsibilities, return and risk objectives, performance reporting, and rebalancing.
- [University of Rochester Investment Philosophy and Policy Statement](https://www.rochester.edu/endowment/investment-philosophy-policy-statement/) illustrates named benchmark components, delegated responsibilities, and the annual committee review process.
- [University of Colorado Regents Policy 13.A](https://www.cu.edu/regents/policy/13) illustrates written requirements for portfolio purpose, diversification, liquidity, and performance benchmarks.

Confirm which benchmarks, risk measures, concentration limits, and rebalancing procedures apply to the family office. Define who proposes policy amendments and who can appoint or replace external managers where relevant. The editor checks input consistency and modeled exceptions. The family office supplies and approves the policy itself.
