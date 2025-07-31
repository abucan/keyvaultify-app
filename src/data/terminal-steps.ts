import type { Step } from '../../types/terminal'

export const steps: Step[] = [
  {
    title: 'Login to Your Account',
    description: 'Authenticate with your KeyVaultify API token',
    command: {
      input: 'keyvault login',
      output: [
        '🔑 Paste your API token: ••••••••••••••••••',
        '✅ Token saved to ~/.keyvaultify/config.json',
        '🎉 Successfully authenticated!'
      ],
      delay: 3000
    }
  },
  {
    title: 'Initialize Your Project',
    description: 'Link your local project to KeyVaultify',
    command: {
      input: 'keyvault init',
      output: [
        '🆔 Enter your Project ID: my-awesome-app',
        '🌱 Environment (default: dev): production',
        '✅ Project initialized and linked to KeyVaultify.',
        '📝 Config saved to .keyvaultify/project.json'
      ],
      delay: 3500
    }
  },
  {
    title: 'Push Your Secrets',
    description: 'Upload your environment variables securely',
    command: {
      input: 'keyvault push',
      output: [
        '📦 Found 8 secrets in .env',
        '🔐 Encrypting secrets...',
        '☁️  Uploading to my-awesome-app (production)',
        '✅ Successfully pushed 8 secrets',
        '🕒 Last updated: ' + new Date().toLocaleTimeString()
      ],
      delay: 4000
    }
  },
  {
    title: 'Pull Secrets to New Environment',
    description: 'Download secrets to your local environment file',
    command: {
      input: 'keyvault pull --env .env.local',
      output: [
        '☁️  Fetching secrets for my-awesome-app (production)',
        '🔓 Decrypting 8 secrets...',
        '📄 Writing to .env.local',
        '✅ Successfully pulled 8 secrets',
        '🔒 Your secrets are now available locally'
      ],
      delay: 3500
    }
  }
]
