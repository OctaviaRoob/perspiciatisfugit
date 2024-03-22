import { writeFile } from 'node:fs/promises'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { model as cryptoAccountsModel } from '@datamodels/identity-accounts-crypto'
import { model as webAccountsModel } from '@datamodels/identity-accounts-web'
import { model as profileModel } from '@datamodels/identity-profile-basic'
import { ModelManager } from '@glazed/devtools'
import prettierConfig from 'eslint-config-3box/prettier.config.js'
import prettier from 'prettier'

const ceramic = new CeramicClient(process.env.CERAMIC_URL)
const manager = new ModelManager({ ceramic })
manager.addJSONModel(cryptoAccountsModel)
manager.addJSONModel(webAccountsModel)
manager.addJSONModel(profileModel)

const aliases = await manager.deploy()
const modelFile = prettier.format(
  `// This is a file generated by the deploy-model.mjs script, do not edit manually

import type { CryptoAccountLinks } from '@datamodels/identity-accounts-crypto'
import type { AlsoKnownAs } from '@datamodels/identity-accounts-web'
import type { BasicProfile } from '@datamodels/identity-profile-basic'
import type { ModelAliases, ModelTypeAliases } from '@glazed/types'

export type ModelTypes = ModelTypeAliases<
  {
    AlsoKnownAs: AlsoKnownAs
    BasicProfile: BasicProfile
    CryptoAccounts: CryptoAccountLinks
  },
  {
    alsoKnownAs: 'AlsoKnownAs'
    basicProfile: 'BasicProfile'
    cryptoAccounts: 'CryptoAccounts'
  }
>

export const aliases: ModelAliases<ModelTypes> = ${JSON.stringify(aliases)}
`,
  { ...prettierConfig, parser: 'typescript' }
)
await writeFile(new URL('../src/__generated__/model.ts', import.meta.url), modelFile)
