/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { neynar } from 'frog/hubs';
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { createPublicClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';

const baseClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || undefined)
})

const ethevacuations = '0x8D5bF23b181EA94d3104d4192acb52427E54875A';

type State = {
  txHash: string | undefined,
  srcChain: number,
}

const app = new Frog<{ State: State }>({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY!! }),
  initialState: {
    txHash: undefined,
    srcChain: -1,
  },
})

app.frame('/', (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  return c.res({
    image: (
      <div>
        Donate to ethevacuations.eth to evacuate civilizans in the Gaza conflict
      </div>
    ),
    intents: [
      <TextInput placeholder="Amount in ETH e.g. 0.1" />,
      <Button.Transaction target="/tx" action="/tx-success">Donate Now</Button.Transaction>,
    ],
  })
})

app.transaction('/tx', async (c) => {
  const amount = BigInt(parseEther(c.inputText || '0.05'));

  return c.res({
    chainId: `eip155:${base.id}`,
    method: "eth_sendTransaction",
    params: {
      to: ethevacuations,
      value: amount,
    },
  },)
});

app.frame('/tx-success', async (c) => {
  let { transactionId, deriveState } = c;

  return c.res({
    image: (
      <div>
         Thank you for your donation! Your transaction is being processed.
      </div>
    ),
    intents: [
      <Button.Link href={`https://basescan.org/tx/${transactionId}`}>View on BaseScan</Button.Link>,
    ],
  })
});

  

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
