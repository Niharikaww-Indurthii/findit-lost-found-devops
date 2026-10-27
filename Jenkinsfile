
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
        bat '"%PYTHON%" -m unittest -v test_app test_selenium'
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
        bat '''
            set KUBECONFIG=C:\\Users\\harik\\.kube\\config
            kubectl config current-context
            if errorlevel 1 exit /b 1

            kubectl get nodes
            if errorlevel 1 exit /b 1
        '''
    }
}



       
stage('Deploy to Kubernetes') {
    steps {
        bat '''
            set KUBECONFIG=C:\\Users\\harik\\.kube\\config

            kubectl apply --validate=false -f deployment.yaml
            if errorlevel 1 exit /b 1

            kubectl apply --validate=false -f service.yaml
            if errorlevel 1 exit /b 1

            kubectl set image deployment/findit-deployment findit=%DOCKER_IMAGE%:%BUILD_NUMBER%
            if errorlevel 1 exit /b 1

            kubectl rollout status deployment/findit-deployment --timeout=180s
            if errorlevel 1 exit /b 1
        '''
    }
}



        

stage('Verify Deployment') {
    steps {
        bat '''
            set KUBECONFIG=C:\\Users\\harik\\.kube\\config

            kubectl get deployments
            if errorlevel 1 exit /b 1

            kubectl get pods
            if errorlevel 1 exit /b 1

            kubectl get services
            if errorlevel 1 exit /b 1
        '''
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
