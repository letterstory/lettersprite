# Maverick integration for the LetterStory builder

LetterSprite renders the tracking pixel for one blog. It has no customer-account
backend and does not provision Maverick resources or fetch visitor data. The
steps below belong in the LetterStory builder backend, which knows which
customer owns each site.

Use **one Maverick partner account**, one customer group per LetterStory
customer, and one tracked domain per site. A group may contain several sites.
Keep the same Maverick partner `customerId` across those sites; group IDs are
not Maverick customer IDs.

## Credentials and deployment settings

| Value | Location | Purpose |
| --- | --- | --- |
| `MAVERICK_CUSTOMER_ID` | Each opted-in LetterSprite deployment | Public account ID rendered in the tracking tag. Use `customerId` from domain registration. |
| Management key (`pk_live_...`) | LetterStory backend secret store only | `X-API-Key` for `/v1/partner/*`. Get it from the Partner Dashboard's **Domain Management API Key**. |
| Data key (`mk_live_...`) | LetterStory backend secret store only | `X-API-Key` for `/v1/people` and visitor journeys. Create it in **Developer API**. |

The existing `MAVERICK_API_KEY` setting remains for compatibility but is unused
by LetterSprite. Leave it unset here. Neither key is required by the pixel;
neither belongs in browser JavaScript, `NEXT_PUBLIC_*`, script attributes, or
the environment of every blog project. A `pk_` key does not read visitor data,
and an `mk_` key does not manage domains.

## Provision a customer's sites from the backend

All examples use `https://api-v1.maverickintelligence.co`. The environment
variables in these commands refer to **backend secrets**, not LetterSprite
settings.

1. Map the authenticated LetterStory customer to a stable `groupId` in your own
   backend. IDs are case-sensitive, 1–64 letters, numbers, underscores or hyphens,
   beginning with a letter or number. Names are 1–100 characters.
2. Create the group once. Omit `domains` so an identical retry preserves sites
   attached later. The same ID and name return `200` on retry; a new group
   returns `201`. A conflicting payload returns `409`.

   ```bash
   curl -X POST "https://api-v1.maverickintelligence.co/v1/partner/domain-groups" \
     -H "X-API-Key: $MAVERICK_PARTNER_KEY" \
     -H "Content-Type: application/json" \
     -d '{"groupId":"acme","name":"Acme"}'
   ```

3. Whenever the builder creates a site, register its hostname and attach it to
   the group. The group must already exist. `clientRef` is an optional attribution
   label; it does not create a group.

   ```bash
   curl -X POST "https://api-v1.maverickintelligence.co/v1/partner/domains" \
     -H "X-API-Key: $MAVERICK_PARTNER_KEY" \
     -H "Content-Type: application/json" \
     -d '{"domain":"stories.example.com","groupId":"acme","clientRef":"acme"}'
   ```

4. Store the returned `customerId` as `MAVERICK_CUSTOMER_ID` on the opted-in blog
   deployment, then rebuild. The response also contains `pixelSnippet`: the
   existing root-layout tag matches its shared Plus script and account-ID
   format. Do not install a second copy or generate a different account ID for
   each site. If Maverick supplies a different snippet contract later, update
   the template to match it.
5. Poll `GET /v1/partner/domains` from the backend until this domain has
   `status: "active"` and `trackingSyncPending: false`. Registration acceptance
   alone is not tracking readiness. Use bounded polling, such as every five
   seconds for up to two minutes, then display **Setup pending** and retry in
   a background job. Back off with jitter on `429`; inspect conflicts and limit
   errors rather than repeatedly creating resources. Do not automatically
   activate paused sites or inactive accounts.

Registration with `groupId` can also attach an existing owned domain to a group.
If shared-pixel automatic registration is enabled, a first visit may add the
domain before the builder does; it does not know which LetterStory customer
group to choose. The backend must still associate that domain with its group.
The account's `maxDomains` limit is shared across groups.

## Read a customer's visitors from the backend

Authorize the LetterStory customer first and resolve their group on the server.
Never trust a browser-supplied group ID to scope an account-wide data key. Groups
filter data; they do not create separate logins or permission boundaries.

```bash
curl -H "X-API-Key: $MAVERICK_DATA_KEY" \
  "https://api-v1.maverickintelligence.co/v1/people?domain_group_id=acme&limit=100"
```

Process `data`, then pass `pagination.nextCursor` as `cursor` with the same
filter until no cursor remains. A filtered page can be empty with more pages
available. To read a visitor's journey, send the group again on
`/v1/people/{id}/events?domain_group_id=acme`; the people-list filter does not
carry over to that separate request.

An empty group returns no visitors. A missing or foreign group returns `404`;
a malformed ID returns `400`. Never handle those cases by retrying without the
group filter. Groups match exact tracked hostnames (`www.` aliases normalize);
add distinct subdomains explicitly. Other domain/client filters and an API
key's scope further restrict results.

## Maintain groups without changing tracking

- `GET /v1/partner/domain-groups` returns the account's groups.
- `PATCH /v1/partner/domain-groups` accepts `groupId` plus `name` and/or
  `domains`. The domain array replaces membership and may contain only sites
  already tracked by the partner; `[]` empties the group.
- `DELETE /v1/partner/domain-groups` accepts `{ "groupId": "acme" }`. It deletes
  the group without deleting domains or visitor history, or stopping tracking.

If a tracked hostname is removed and later added again, explicitly assign it
to the intended group again; its previous membership is not restored.

Keep all provisioning and data reads in the builder backend. This repository's
only runtime change remains the opt-in pixel already in `src/app/layout.tsx`.
See the [Maverick partner guide](https://app.maverickintelligence.co/partner-api)
for the full API contract, key setup, and OpenAPI download.
