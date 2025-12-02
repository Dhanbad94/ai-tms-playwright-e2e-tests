pipeline {
    agent {
        label 'node'
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['staging', 'preproduction', 'production'], description: 'Select the environment to run tests against')
    }

    environment {
        NODE_ENV = 'test'
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
        BASE_URL = credentials('BASE_URL_PLACEHOLDER')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Set BASE_URL') {
            steps {
                script {
                    if (params.ENVIRONMENT == 'staging') {
                        env.BASE_URL = 'https://staging.trackmyshuttle.com/'
                    } else if (params.ENVIRONMENT == 'preproduction') {
                        env.BASE_URL = 'https://preproduction.trackmyshuttle.com/'
                    } else if (params.ENVIRONMENT == 'production') {
                        env.BASE_URL = 'https://trackmyshuttle.com/'
                    }
                }
            }
        }
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Set Node.js Version') {
            steps {
                // Use Node.js 18.x for Playwright compatibility
                sh 'nvm install 18 && nvm use 18'
            }
        }
        stage('Install Dependencies') {
            steps {
                cache(path: 'node_modules', key: 'npm-cache-${env.BUILD_NUMBER}') {
                    sh 'npm ci'
                }
            }
        }
        stage('Install Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
            }
        }
        stage('Run Playwright Tests') {
            steps {
                sh 'npx playwright test --project=chromium --project=firefox'
            }
            environment {
                BASE_URL = "${env.BASE_URL}"
            }
            post {
                always {
                    junit 'results.xml'
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                }
                failure {
                    script {
                        echo 'Tests failed. See HTML report in playwright-report/index.html.'
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
