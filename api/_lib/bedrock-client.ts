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

function getBedrockRegion(): string {
  return process.env.BEDROCK_AWS_REGION ?? process.env.AWS_REGION ?? 'us-east-1'
}

function useAccessKeyCredentials(): boolean {
  return Boolean(
    process.env.BEDROCK_AWS_ACCESS_KEY_ID && process.env.BEDROCK_AWS_SECRET_ACCESS_KEY,
  )
}

export function getBedrockClient(): BedrockRuntimeClient {
  if (client) {
    return client
  }

  const region = getBedrockRegion()

  if (useAccessKeyCredentials()) {
    client = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: requireEnv('BEDROCK_AWS_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('BEDROCK_AWS_SECRET_ACCESS_KEY'),
      },
    })
    return client
  }

  client = new BedrockRuntimeClient({
    region,
    credentials: awsCredentialsProvider({
      roleArn: requireEnv('AWS_ROLE_ARN'),
      clientConfig: { region: requireEnv('AWS_REGION') },
    }),
  })

  return client
}

export function getBedrockModelId(): string {
  return process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-lite-v1:0'
}
