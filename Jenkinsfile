@Library('jenkins-helpers') _

static final String PR_COMMENT_MARKER = "🚀[pr-server]\n"
static final String SLACK_ALERTS_CHANNEL = "#cdf-ui-devs-alerts"
static final String APP_ID = 'cdf-vision-subapp'
static final String FIREBASE_APP_SITE = 'vision'
static final String FUSION_SUBAPP_NAME = '@cognite/cdf-vision-subapp'
static final String NODE_VERSION = 'node:14'

final boolean isMaster = env.BRANCH_NAME == 'master'
final boolean isRelease = env.BRANCH_NAME == 'release-vision'
final boolean isPullRequest = !!env.CHANGE_ID

def pods = { body ->
  yarn.pod(nodeVersion: NODE_VERSION) {
    previewServer.pod(nodeVersion: NODE_VERSION) {
      appHosting.pod(
        nodeVersion: NODE_VERSION
      ) {
          testcafe.pod() {
            properties([

            ])

            node(POD_LABEL) {
              body()
            }
          }
        }
    }
  }
}


pods {
  def gitCommit
  def getTitle
  def gitAuthor
  def project = APP_ID;
  def packageName = FUSION_SUBAPP_NAME;

  app.safeRun(
    slackChannel: SLACK_ALERTS_CHANNEL,
    logErrors: isMaster || isRelease
  ) {
    dir('main') {
      stage("Checkout code") {
        checkout(scm)
        gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        gitTitle = sh(returnStdout: true, script: "git show -s --format='%s' HEAD").trim()
        gitAuthor = sh(returnStdout: true, script: "git show -s --format='%ae' HEAD").trim()
      }

      stage('Delete comments') {
        deleteComments(PR_COMMENT_MARKER)
      }

      stage('Install dependencies') {
        yarn.setup()
      }

      stage('Git setup') {
          // the apphosting container interacts with git when running npx commands.
          // since the git checkout is done in a different container,
          // the user permissions seem altered when git is executed from the node container,
          // therefore we need to mark the folder as safe
          container('apphosting') {
            sh("git config --global --add safe.directory ${env.WORKSPACE}/main")
          }
      }

      parallel(
        'Lint': {
          container('apphosting') {
            stageWithNotify('Lint') {
              sh("yarn lint")
            }
          }
        },
        'Test': {
          container('apphosting') {
            stageWithNotify('Unit tests') {
              sh("yarn test")
            }
          }
        },
        'Preview': {
          container('apphosting') {
            if (!isPullRequest) {
              print 'No PR previews for release builds'
              return
            }

            deleteComments('[FUSION_PREVIEW_URL]')

            if (packageName == null) {
              print "No preview available for: ${project}"
              return
            }

            // Run the yarn install in the app in cases of local packages.json file
            if (fileExists("yarn.lock")) {
              yarn.setup()
            }

            stageWithNotify("Build and deploy PR for: ${project}") {
              def prefix = jenkinsHelpersUtil.determineRepoName();
              def domain = "fusion-preview";
              previewServer(
                buildCommand: 'yarn build',
                buildFolder: 'build',
                prefix: prefix,
                repo: domain
              )
              deleteComments("[FUSION_PREVIEW_URL]")

              def url = "https://fusion-pr-preview.cogniteapp.com/?externalOverride=${packageName}&overrideUrl=https://${prefix}-${env.CHANGE_ID}.${domain}.preview.cogniteapp.com/index.js";
              pullRequest.comment("[FUSION_PREVIEW_URL] [$url]($url)");
            }
          }
        },
        'Release': {
          container('apphosting') {
            if (isPullRequest) {
              print 'No deployment on PR branch'
              return;
            }

            // Run the yarn install in the app in cases of local packages.json file
            if (fileExists("yarn.lock")) {
              yarn.setup()
            }

            stageWithNotify("Publish production build: ${project}") {
              appHosting(
                appName: FIREBASE_APP_SITE,
                environment: isRelease ? 'production' : 'staging',
                firebaseJson: 'build/firebase.json',
                buildCommand: "yarn build",
                buildFolder: 'build',
              )

              slack.send(
                channel: SLACK_ALERTS_CHANNEL,
                message: "Deployment of ${env.BRANCH_NAME} complete for: ${project}!"
              )
            }
          }
        }
      )
    }
  }
}
