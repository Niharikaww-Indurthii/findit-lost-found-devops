pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        IMAGE_NAME = 'YOUR_DOCKERHUB_USERNAME/findit-lost-found'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Checked out FindIt source from GitHub'
            }
        }

        stage('Test Application') {
            steps {
                bat 'py -m pip install -r requirements.txt'
                bat 'py -m unittest -v'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME%:%BUILD_NUMBER% .'
                bat 'docker tag %IMAGE_NAME%:%BUILD_NUMBER% %IMAGE_NAME%:latest'
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat 'echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin'
                    bat 'docker push %IMAGE_NAME%:%BUILD_NUMBER%'
                    bat 'docker push %IMAGE_NAME%:latest'
                }
            }
        }

        stage('Check Kubernetes Access') {
            steps {
                bat 'kubectl config current-context'
                bat 'kubectl get nodes'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f deployment.yaml'
                bat 'kubectl apply -f service.yaml'
                bat 'kubectl set image deployment/findit-deployment findit=%IMAGE_NAME%:%BUILD_NUMBER%'
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
            echo 'FindIt CI/CD completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Inspect the first failed stage in Console Output.'
        }
        always {
            echo 'FindIt pipeline execution finished.'
        }
    }
}
