import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'
import { awsCredentialsProvider } from '@vercel/functions/oidc'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

let client: BedrockRuntimeClient | undefined

export function getBedrockClient(): BedrockRuntimeClient {
  if (client) {
    return client
  }

  const region = requireEnv('AWS_REGION')

  client = new BedrockRuntimeClient({
    region,
    credentials: awsCredentialsProvider({
      roleArn: requireEnv('AWS_ROLE_ARN'),
      clientConfig: { region },
    }),
  })

  return client
}

export function getBedrockModelId(): string {
  return process.env.BEDROCK_MODEL_ID ?? 'us.amazon.nova-lite-v1:0'
}
