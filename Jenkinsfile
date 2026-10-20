
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'nihaaaa34/findit-lost-found'
        PYTHON = 'C:\\Users\\harik\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'FindIt source checked out from GitHub'
            }
        }

        stage('Test Application') {
            steps {
                bat '"%PYTHON%" -m pip install -r requirements.txt'
                bat '"%PYTHON%" -m unittest -v'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker version'
                bat 'docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% .'
                bat 'docker tag %DOCKER_IMAGE%:%BUILD_NUMBER% %DOCKER_IMAGE%:latest'
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    bat '''
                        powershell -NoProfile -Command "$env:DOCKER_PASS | docker login -u $env:DOCKER_USER --password-stdin"
                    '''

                    bat 'docker push %DOCKER_IMAGE%:%BUILD_NUMBER%'
                    bat 'docker push %DOCKER_IMAGE%:latest'

                    bat 'docker logout'
                }
            }
        }

        stage('Check Kubernetes Access') {
            steps {
                bat 'kubectl version'
                bat 'kubectl get nodes'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f deployment.yaml'
                bat 'kubectl apply -f service.yaml'

                bat 'kubectl set image deployment/findit-deployment findit=%DOCKER_IMAGE%:%BUILD_NUMBER%'

                bat 'kubectl rollout status deployment/findit-deployment --timeout=180s'
            }
        }

        stage('Verify Deployment') {
            steps {
                bat 'kubectl get deployments'
                bat 'kubectl get pods'
                bat 'kubectl get services'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: FindIt pipeline completed successfully!'
        }

        failure {
            echo 'FAILED: Check Console Output for the first failed stage.'
        }

        always {
            echo 'FindIt pipeline execution finished.'
        }
    }
}
