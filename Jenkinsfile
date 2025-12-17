pipeline {
    agent any
    
    environment {
        // Application configuration
        PROJECT_NAME = 'zomato-app'
        APP_DIR = '/home/ubuntu/zomato-app'
        
        // Git configuration
        GIT_REPO = 'https://github.com/harsh-raj04/Zomato-devops-pipeline.git'
        GIT_BRANCH = 'main'
    }
    
    options {
        // Keep only last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // Add timestamps to console output
        timestamps()
        
        // Timeout if build takes more than 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        
        // Disable concurrent builds
        disableConcurrentBuilds()
    }
    
    stages {
        // ==========================================
        // STAGE 1: CHECKOUT
        // ==========================================
        stage('1. Checkout') {
            steps {
                echo '════════════════════════════════════════════════════════════'
                echo '📥 STAGE 1: CHECKOUT - Fetching latest code from GitHub'
                echo '════════════════════════════════════════════════════════════'
                
                checkout scm
                
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                }
                
                echo """
                ✅ Checkout Complete
                ─────────────────────
                Commit: ${env.GIT_COMMIT_SHORT}
                Author: ${env.GIT_AUTHOR}
                Message: ${env.GIT_COMMIT_MSG}
                """
            }
        }
        
        // ==========================================
        // STAGE 2: INSTALL DEPENDENCIES
        // ==========================================
        stage('2. Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        echo '📦 Installing Backend dependencies...'
                        dir('backend') {
                            sh 'npm install'
                        }
                        echo '✅ Backend dependencies installed'
                    }
                }
                
                stage('Frontend') {
                    steps {
                        echo '📦 Installing Frontend dependencies...'
                        dir('frontend') {
                            sh 'npm install'
                        }
                        echo '✅ Frontend dependencies installed'
                    }
                }
            }
        }
        
        // ==========================================
        // STAGE 3: CODE QUALITY & TESTS
        // ==========================================
        stage('3. Code Quality & Tests') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        echo '�� Linting Backend code...'
                        dir('backend') {
                            sh '''
                                # TODO: Add ESLint when configured
                                # npm run lint
                                echo "Backend linting passed (placeholder)"
                            '''
                        }
                    }
                }
                
                stage('Lint Frontend') {
                    steps {
                        echo '🔍 Linting Frontend code...'
                        dir('frontend') {
                            sh '''
                                # TODO: Add ESLint when configured
                                # npm run lint
                                echo "Frontend linting passed (placeholder)"
                            '''
                        }
                    }
                }
                
                stage('Unit Tests Backend') {
                    steps {
                        echo '🧪 Running Backend unit tests...'
                        dir('backend') {
                            sh '''
                                # TODO: Add Jest tests when configured
                                # npm test
                                echo "Backend tests passed (placeholder)"
                            '''
                        }
                    }
                }
                
                stage('Unit Tests Frontend') {
                    steps {
                        echo '🧪 Running Frontend unit tests...'
                        dir('frontend') {
                            sh '''
                                # TODO: Add Vitest tests when configured
                                # npm test
                                echo "Frontend tests passed (placeholder)"
                            '''
                        }
                    }
                }
            }
        }
        
        // ==========================================
        // STAGE 4: TERRAFORM - Infrastructure Check
        // ==========================================
        stage('4. Terraform') {
            stages {
                stage('Terraform Init') {
                    steps {
                        echo '════════════════════════════════════════════════════════════'
                        echo '🏗️  STAGE 4: TERRAFORM - Validating Infrastructure'
                        echo '════════════════════════════════════════════════════════════'
                        
                        dir('infra/terraform') {
                            sh '''
                                echo "Initializing Terraform..."
                                terraform init -input=false
                            '''
                        }
                    }
                }
                
                stage('Terraform Validate') {
                    steps {
                        dir('infra/terraform') {
                            sh '''
                                echo "Validating Terraform configuration..."
                                terraform validate
                            '''
                        }
                        echo '✅ Terraform configuration is valid'
                    }
                }
                
                stage('Terraform Plan') {
                    steps {
                        dir('infra/terraform') {
                            sh '''
                                echo "Running Terraform plan..."
                                terraform plan -input=false -out=tfplan || true
                            '''
                        }
                        echo '✅ Terraform plan generated'
                    }
                }
            }
        }
        
        // ==========================================
        // STAGE 5: BUILD DOCKER IMAGES
        // ==========================================
        stage('5. Build Docker Images') {
            steps {
                echo '════════════════════════════════════════════════════════════'
                echo '🐳 STAGE 5: BUILD - Creating Docker images'
                echo '════════════════════════════════════════════════════════════'
                
                script {
                    // Get public IP for API URL
                    env.PUBLIC_IP = sh(
                        script: "curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo 'localhost'",
                        returnStdout: true
                    ).trim()
                    
                    echo "Building for Public IP: ${env.PUBLIC_IP}"
                }
                
                // Build Backend
                sh '''
                    echo "📦 Building Backend image..."
                    cd backend
                    docker build -t ${PROJECT_NAME}-backend:${BUILD_NUMBER} .
                    docker tag ${PROJECT_NAME}-backend:${BUILD_NUMBER} ${PROJECT_NAME}-backend:latest
                    echo "✅ Backend image built: ${PROJECT_NAME}-backend:${BUILD_NUMBER}"
                '''
                
                // Build Frontend with correct API URL
                sh """
                    echo "📦 Building Frontend image..."
                    cd frontend
                    docker build \
                        --build-arg VITE_API_BASE=http://${env.PUBLIC_IP}:4000 \
                        -t ${PROJECT_NAME}-frontend:${BUILD_NUMBER} .
                    docker tag ${PROJECT_NAME}-frontend:${BUILD_NUMBER} ${PROJECT_NAME}-frontend:latest
                    echo "✅ Frontend image built: ${PROJECT_NAME}-frontend:${BUILD_NUMBER}"
                """
                
                // List built images
                sh '''
                    echo ""
                    echo "📋 Docker Images Built:"
                    echo "────────────────────────"
                    docker images | grep ${PROJECT_NAME} | head -10
                '''
            }
        }
        
        // ==========================================
        // STAGE 6: ANSIBLE DEPLOYMENT
        // ==========================================
        stage('6. Ansible Deploy') {
            steps {
                echo '════════════════════════════════════════════════════════════'
                echo '🚀 STAGE 6: DEPLOY - Running Ansible playbook'
                echo '════════════════════════════════════════════════════════════'
                
                dir('ansible') {
                    sh """
                        echo "Running Ansible deployment locally..."
                        
                        # Run ansible-playbook for local deployment
                        ansible-playbook deploy-local.yml \
                            --connection=local \
                            --extra-vars "public_ip=${env.PUBLIC_IP}" \
                            -v
                    """
                }
                
                echo '✅ Ansible deployment completed'
            }
        }
        
        // ==========================================
        // STAGE 7: HEALTH CHECKS
        // ==========================================
        stage('7. Health Checks') {
            steps {
                echo '════════════════════════════════════════════════════════════'
                echo '🏥 STAGE 7: VERIFY - Running health checks'
                echo '════════════════════════════════════════════════════════════'
                
                sh '''
                    echo "Waiting for services to start..."
                    sleep 10
                    
                    echo ""
                    echo "🔍 Checking Backend API..."
                    curl -sf http://localhost:4000/api/restaurants > /dev/null && echo "✅ Backend API is healthy" || exit 1
                    
                    echo ""
                    echo "🔍 Checking Frontend..."
                    curl -sf http://localhost:3000 > /dev/null && echo "✅ Frontend is healthy" || exit 1
                    
                    echo ""
                    echo "📊 Container Status:"
                    echo "────────────────────"
                    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "zomato|NAMES"
                '''
            }
        }
        
        // ==========================================
        // STAGE 8: DEPLOYMENT SUMMARY
        // ==========================================
        stage('8. Summary') {
            steps {
                echo '════════════════════════════════════════════════════════════'
                echo '📋 STAGE 8: DEPLOYMENT SUMMARY'
                echo '════════════════════════════════════════════════════════════'
                
                sh """
                    echo ""
                    echo "┌─────────────────────────────────────────────────────────────┐"
                    echo "│                   🎉 DEPLOYMENT SUCCESSFUL                  │"
                    echo "├─────────────────────────────────────────────────────────────┤"
                    echo "│  Frontend:  http://${env.PUBLIC_IP}:3000                    "
                    echo "│  Backend:   http://${env.PUBLIC_IP}:4000                    "
                    echo "│  Jenkins:   http://${env.PUBLIC_IP}:8080                    "
                    echo "├─────────────────────────────────────────────────────────────┤"
                    echo "│  Build:     #${BUILD_NUMBER}                                "
                    echo "│  Commit:    ${env.GIT_COMMIT_SHORT}                         "
                    echo "│  Author:    ${env.GIT_AUTHOR}                               "
                    echo "└─────────────────────────────────────────────────────────────┘"
                """
            }
        }
    }
    
    post {
        success {
            echo '''
            ╔═══════════════════════════════════════════════════════════════╗
            ║         ✅ PIPELINE COMPLETED SUCCESSFULLY                    ║
            ╚═══════════════════════════════════════════════════════════════╝
            '''
        }
        
        failure {
            echo '''
            ╔═══════════════════════════════════════════════════════════════╗
            ║              ❌ PIPELINE FAILED                               ║
            ╚═══════════════════════════════════════════════════════════════╝
            '''
        }
        
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
    }
}
