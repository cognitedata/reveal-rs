@Library('jenkins-helpers') _

// This is your FAS staging app id. Staging deployments are protected by Cognite
// IAP, meaning they're only accessible to Cogniters.
static final String STAGING_APP_ID =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "fas-demo"
      : ""

// This is your FAS production app id.
// At this time, there is no production build for the demo app.
static final String PRODUCTION_APP_ID =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "fas-demo-prod"
      : ""

// This is your FAS app identifier (repo) shared across both production and staging apps
// in order to do a commit lookup (commits are shared between apps).
static final String APPLICATION_REPO_ID =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "fas-demo"
      : ""

// Replace this with your app's ID on https://sentry.io/ -- if you do not have
// one (or do not have access to Sentry), stop by #frontend to ask for help. :)
static final String SENTRY_PROJECT_NAME =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "react-demo-app"
      : ""

// The Sentry DSN is the URL used to report issues into Sentry. This can be
// found on your Sentry's project page, or by going here:
// https://docs.sentry.io/error-reporting/quickstart/?platform=browser
//
// If you omit this, then client errors WILL NOT BE REPORTED.
static final String SENTRY_DSN =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "https://da67b4b23d3e4baea6c36de155a08491@sentry.io/3541732"
      : ""

// Specify your locize.io project ID. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// See https://cog.link/i18n for more information.
//
// Note: You'll probably want to set this in scripts/start.sh too
static final String LOCIZE_PROJECT_ID =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "1ee63b21-27c7-44ad-891f-4bd9af378b72"
      : ""

// Specify your Mixpanel project token. If you do not have one of these, please
// stop by #frontend to get a project created under the Cognite umbrella.
// Remember: if you can't measure it, you can't improve it!
static final String MIXPANEL_TOKEN =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "1cc1cdc82fb93ec9a20a690216de41e4"
      : ""

// Specify your projects alerting slack channel here. If you do not have one of these, please
// consider creating one for your projects alerts
static final String SLACK_CHANNEL =
    // This ternary is only in here to avoid accidentally publishing to the
    // wrong app once this template is used. You should remove this whole thing
    // and replace it with a static string.
    jenkinsHelpersUtil.determineRepoName() == 'react-demo-app'
      ? "frontend-firehose"
      : ""

// This determines how this app is versioned. See https://cog.link/releases for
// more information. The options available here are:
//
//  - single-branch
//    This will push every change on the master branch first to the staging
//    environment and then to the production environment. The product team can
//    use FAS to control which version is actually served to end users who visit
//    the production environment.
//
//  - multi-branch
//    This will push every change on the master branch to the staging
//    environment. Pushing to the production environment will happen on branches
//    which are named release-[NNN].
//
// No other options are supported at this time.
static final String VERSIONING_STRATEGY = "single-branch"

// == End of customization. Everything below here is common. == \\

static final String NODE_VERSION = 'node:12'

static final Map<String, String> CONTEXTS = [
  checkout: "continuous-integration/jenkins/checkout",
  setup: "continuous-integration/jenkins/setup",
  lint: "continuous-integration/jenkins/lint",
  unitTests: "continuous-integration/jenkins/unit-tests",
  buildStaging: "continuous-integration/jenkins/build-staging",
  publishStaging: "continuous-integration/jenkins/publish-staging",
  buildProduction: "continuous-integration/jenkins/build-production",
  publishProduction: "continuous-integration/jenkins/publish-production",
  buildPreview: "continuous-integration/jenkins/build-preview",
  publishPreview: "continuous-integration/jenkins/publish-preview",
]

// Copy these before installing dependencies so that we don't have to
// copy the entire node_modules directory tree as well.
static final String[] DIRS = [
  'lint',
  'unit-tests',
  'storybook',
  'preview',
  'staging',
  'production',
]

def fakeIdpEnvVars = [
    envVar(key: 'PORT', value: '8200'),
    envVar(key: 'IDP_USER_ID', value: 'user'),
    envVar(key: 'IDP_CLUSTER', value: 'azure-dev'),
    envVar(key: 'IDP_TOKEN_ID', value: 'demo-app-e2e'),
    secretEnvVar(
      key: 'PRIVATE_KEY',
      secretName: 'react-demo-app-e2e-azure-dev', // <- project name
      secretKey: 'private-key',
    ),
]

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      fas.pod(
        nodeVersion: NODE_VERSION,
        sentryProjectName: SENTRY_PROJECT_NAME,
        sentryDsn: SENTRY_DSN,
        locizeProjectId: LOCIZE_PROJECT_ID,
        mixpanelToken: MIXPANEL_TOKEN,
        envVars: [
          envVar(key: 'BRANCH_NAME', value: env.BRANCH_NAME),
          envVar(key: 'CHANGE_ID', value: env.CHANGE_ID),
        ]
      ) {
        // This enables codecov for the repo. If this fails to start, then
        // do the following:
        //  1. Obtain a token by going to:
        //     https://codecov.io/gh/cognitedata/YOUR-REPO-HERE
        //  2. Create a PR similar to:
        //     https://github.com/cognitedata/terraform/pull/1923
        //  3. Get that PR approved, applied, and merged
        //
        // If you don't want codecoverage, then you can just remove this.
        codecov.pod {
          testcafe.pod(
            fakeIdpEnvVars: fakeIdpEnvVars,
          ) {
            properties([
              buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))
            ])

            node(POD_LABEL) {
              dir('main') {
                stageWithNotify('Checkout code', CONTEXTS.checkout) {
                  checkout(scm)
                }

                stageWithNotify('Install dependencies', CONTEXTS.setup) {
                  yarn.setup()
                }

                yarn.copy(
                  dirs: DIRS
                )
              }

              body()
            }
          }
        }
      }
    }
  }
}

pods {
  static final Map<String, Boolean> version = versioning.getEnv(
    versioningStrategy: VERSIONING_STRATEGY
  )
  final boolean isStaging = version.isStaging
  final boolean isProduction = version.isProduction
  final boolean isPullRequest = version.isPullRequest

  app.safeRun(
    slackChannel: SLACK_CHANNEL,
    logErrors: isStaging || isProduction
  ) {
    threadPool(
      tasks: [
        'Lint': {
          retryWithBackoff(2) { // <- retry this, since pod failures are not uncommon (and this step is pretty quick)
            stageWithNotify('Check linting', CONTEXTS.lint) {
              dir('lint') {
                container('fas') {
                  sh('yarn lint')
                }
              }
            }
          }
        },

        'Unit tests': {
          retryWithBackoff(2) { // <- retry this, since pod failures are not uncommon (and this step is pretty quick)
            stageWithNotify('Execute unit tests', CONTEXTS.unitTests) {
              dir('unit-tests') {
                container('fas') {
                  sh('yarn test')
                  junit(allowEmptyResults: true, testResults: '**/junit.xml')
                  if (isPullRequest) {
                    summarizeTestResults()
                  }
                  stage("Upload coverage reports") {
                    codecov.uploadCoverageReport()
                  }
                }
              }
            }
          }
        },

        'Storybook': {
          previewServer.runStorybookStage(
            shouldExecute: isPullRequest
          )
        },

        'Preview': {
          dir('preview') {
            stageWithNotify('Build for preview', CONTEXTS.buildPreview) {
              fas.build(
                appId: "${STAGING_APP_ID}-pr-${env.CHANGE_ID}",
                repo: APPLICATION_REPO_ID,
                buildCommand: 'yarn build preview',
                shouldExecute: isPullRequest
              )
            }
          }
        },

        'Staging': {
          dir('staging') {
            stageWithNotify('Build for staging', CONTEXTS.buildStaging) {
              fas.build(
                appId: STAGING_APP_ID,
                repo: APPLICATION_REPO_ID,
                buildCommand: 'yarn build staging',
                shouldExecute: isStaging
              )
            }
          }
        },

        'Production': {
          dir('production') {
            stageWithNotify('Build for production', CONTEXTS.buildProduction) {
              fas.build(
                appId: PRODUCTION_APP_ID,
                repo: APPLICATION_REPO_ID,
                buildCommand: 'yarn build production',
                shouldExecute: isProduction
              )
            }
          }
        },
      ],
      workers: 3,
    )

    if (isPullRequest) {
      testcafe.runE2EStage(
        //
        // multi-branch mode:
        //
        // We don't need to run end-to-end tests against release because
        // we're in one of two states:
        //   1. Cutting a new release
        //      In this state, staging has e2e already passing.
        //   2. Cherry-picking in a hotfix
        //      In this state, the PR couldn't have been merged without
        //      passing end-to-end tests.
        // As such, we can skip end-to-end tests on release branches. As
        // a side-effect, this will make hotfixes hit production faster!
        //
        // single-branch mode: always run e2e
        //
        shouldExecute: VERSIONING_STRATEGY == "single-branch" ? true : !isRelease,

        dir: 'production',
        runCommand: 'npx react-scripts build && ./scripts/testcafe-serve-run.sh'
      )
    }

    if (isPullRequest) {
      stageWithNotify('Publish preview build', CONTEXTS.publishPreview) {
        dir('preview') {
          fas.publish(
            previewSubdomain: 'react-demo'
          )
        }
      }
    }

    if (isStaging && STAGING_APP_ID) {
      stageWithNotify('Publish staging build', CONTEXTS.publishStaging) {
        dir('staging') {
          fas.publish()
        }

        // in 'single-branch' mode we always publish 'staging' and 'master' builds
        // from the main branch, but we only need to notify about one of them.
        // so it is ok to skip this message in that case
        //
        // note: the actual deployment of each is determined by versionSpec in FAS
        if (VERSIONING_STRATEGY != "single-branch") {
          dir('main') {
            slack.send(
              channel: SLACK_CHANNEL,
                message: "Deployment of ${env.BRANCH_NAME} complete!"
            )
          }
        }
      }
    }

    if (isProduction && PRODUCTION_APP_ID) {
      stageWithNotify('Publish production build', CONTEXTS.publishProduction) {
        dir('production') {
          fas.publish()

        }

        dir('main') {
          slack.send(
            channel: SLACK_CHANNEL,
            message: "Deployment of ${env.BRANCH_NAME} complete!"
          )
        }
      }
    }
  }
}
