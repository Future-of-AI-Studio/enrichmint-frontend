# EnrichMINT web app

EnrichMINT helps people earn from their real-life experience, while helping others learn from it.

This is the Next.js front end. The API, the plan and the full setup guide (PayPal sandbox, demo accounts, tests) are in [`../enrichmint-api/README.md`](../enrichmint-api/README.md).

## Run it

```bash
yarn install
cp .env.example .env    # API_URL, TOKEN_NAME, PAYPAL_CLIENT_ID (sandbox), PAYPAL_ENV=sandbox
yarn dev                # http://localhost:3100
```

Start the API first. Without `PAYPAL_CLIENT_ID`, checkout pages say PayPal is not configured, and everything else works.

## Deploy (Vercel)

1. Deploy the API first (see the API README, "Deploy").
2. Import this repository into Vercel. The framework is detected as Next.js; no build settings need changing.
3. Set the environment variables:

   | Variable | Value |
   | --- | --- |
   | `ENV` | `staging` (anything but `development` turns on secure cookies, HSTS and the strict content security policy) |
   | `API_URL` | `https://<railway-domain>/api` |
   | `TOKEN_NAME` | `enrichmint_session` |
   | `PAYPAL_CLIENT_ID` | the same sandbox REST app client ID as the API |
   | `PAYPAL_ENV` | `sandbox` |

4. Set the API's `WEB_ORIGIN` to the Vercel URL.

## Demo script (under 3 minutes)

Learn opens the **steward** (`/steward`). It is a single conversation that uses the existing features as tools. It shows every step it takes and stops whenever a decision belongs to a person.

1. **Maria** (`maria@enrichmint.demo`, a demo profile) goes to Share, then "Share my experience". She answers the interview, drafts the guide, edits it and fills the gaps. She sets the price and AI permission, then submits.
2. **Admin** opens Reviews and clicks "Approve and publish".
3. **Alex** goes to Learn (the steward) and enters "My support role is changing…" with a $20 budget. Alex sees three recommendations with reasons. One is marked over budget, and one shows that AI help is off.
4. Alex buys Maria's $5 guide. Checkout runs in the PayPal sandbox popup, the server confirms the payment, and the guide opens in Alex's library.
5. Alex asks a question. The answer shows "Maria said" blocks with section citations, separated from AI suggestions.
6. Alex asks the steward about pricing for SaaS startups. The steward replies: "This guide doesn't cover that. Maria accepts questions on this topic for $15, which fits your remaining budget. I've drafted a request. Would you like to review it?" Alex opens the draft, unticks a private detail, approves it and sends it.
7. **Maria** goes to Requests and accepts. **Alex** pays. Maria delivers. Alex clicks "Help me apply this".
8. Alex asks the steward to buy a guide that costs more than his remaining budget. The steward refuses to set up a payment, and the block appears in the Stewardship log (Log). Opening that guide's checkout from the steward shows the same block, with no PayPal button.
9. **Maria** opens Earnings and sees the gross amount, the 15% commission, her 85% share, the PayPal fee paid by the platform, and the payout status.
10. Alex leaves feedback, and the counts update.

## Licence

MIT. See [LICENSE](./LICENSE).
