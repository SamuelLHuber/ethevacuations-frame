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
    image: (`${process.env.VERCEL_URL || 'http://localhost:3000'}/frameImage.jpg`),
    imageAspectRatio: '1:1',
    intents: [
      <TextInput placeholder="Amount in ETH e.g. 0.1" />,
      <Button.Transaction target="/tx" action="/tx-success">Donate Now</Button.Transaction>,
    ],
  })
})

app.transaction('/tx', async (c) => {
  try {
    const amount = BigInt(parseEther(c.inputText || '0.05'));
    return c.res({
      chainId: `eip155:${base.id}`,
      method: "eth_sendTransaction",
      params: {
        to: ethevacuations,
        value: amount,
      },
    },);

  } catch (e) {
    return c.error({ message: 'Invalid amount try "0.1" for 0.1 ETH' });
  }
});

app.frame('/tx-success', async (c) => {
  let { transactionId, deriveState } = c;

  return c.res({
    image: (`${process.env.VERCEL_URL || 'http://localhost:3000'}/frameImage.jpg`),
    imageAspectRatio: '1:1',
    intents: [
      <Button>Thank you!</Button>,
      <Button.Link href={`https://basescan.org/tx/${transactionId}`}>View on BaseScan</Button.Link>,
    ],
  })
});



devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
