'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { semver } = require('../validators')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const versionSchema = Joi.object({
  version: semver,
}).required()

module.exports = class Lerna extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/lerna',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Github lerna version',
        pattern: ':user/:repo',
        namedParams: { user: 'babel', repo: 'babel' },
        staticPreview: this.render({ version: '7.6.4' }),
        documentation,
      },
      {
        title: 'Github lerna version (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: { user: 'jneander', repo: 'jneander', branch: 'colors' },
        staticPreview: this.render({
          version: 'independent',
          branch: 'colors',
        }),
        documentation,
      },
    ]
  }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'lerna',
    })
  }

  async handle({ user, repo, branch }) {
    const { version } = await fetchJsonFromRepo(this, {
      schema: versionSchema,
      user,
      repo,
      branch,
      filename: 'lerna.json',
    })
    return this.constructor.render({ version, branch })
  }
}
