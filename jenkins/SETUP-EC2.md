# Jenkins EC2 Setup Guide

Quick guide for deploying and configuring the Jenkins server.

## 🚀 Step 1: Deploy Jenkins Infrastructure

```bash
cd infra/terraform

# Initialize Terraform (if not done already)
terraform init

# Preview changes (you'll see new Jenkins resources)
terraform plan

# Apply infrastructure
terraform apply
# Type 'yes' when prompted
```

**What gets created:**
- New EC2 instance (t2.small) for Jenkins
- Elastic IP for Jenkins
- Security group allowing ports 22, 8080, 50000
- Pre-installed: Java, Docker, Node.js, Ansible

**Save these outputs:**
```bash
# Get Jenkins IP
terraform output jenkins_public_ip

# Get Jenkins URL
terraform output jenkins_url

# Get SSH command
terraform output jenkins_ssh_command
```

## 🔧 Step 2: Install Jenkins via Ansible

```bash
cd ../../ansible

# Update inventory with Jenkins IP
# Edit ansible/inventory and replace JENKINS_IP_HERE with actual IP
# (or let me do it for you after terraform apply)

# Run Jenkins installation playbook
ansible-playbook install-jenkins.yml

# This will:
# - Install Jenkins
# - Configure Docker access
# - Set up SSH keys for deployment
# - Display initial admin password
```

## 🌐 Step 3: Access Jenkins

1. **Open Jenkins in browser:**
   ```
   http://<JENKINS_IP>:8080
   ```

2. **Get initial admin password:**
   - It was displayed in Ansible output
   - Or SSH and get it:
     ```bash
     ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<JENKINS_IP>
     sudo cat /var/lib/jenkins/secrets/initialAdminPassword
     ```

3. **Complete setup wizard:**
   - Paste initial password
   - Click "Install suggested plugins"
   - Create admin user (username: `admin`, strong password)
   - Keep default Jenkins URL
   - Click "Start using Jenkins"

## 🔐 Step 4: Configure Credentials in Jenkins

### Add GitHub Credentials

1. Go to: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Configure:
   - **Kind:** Username with password
   - **ID:** `github-credentials`
   - **Username:** Your GitHub username
   - **Password:** GitHub Personal Access Token
     - Generate at: https://github.com/settings/tokens
     - Scopes: `repo`, `admin:repo_hook`
4. Click **Create**

### Add EC2 SSH Key

1. **Add Credentials** again
2. Configure:
   - **Kind:** SSH Username with private key
   - **ID:** `ec2-ssh-key`
   - **Username:** `ubuntu`
   - **Private Key:** Enter directly
   - Paste content from: `~/.ssh/zomato-deploy-key.pem`
3. Click **Create**

## 📦 Step 5: Create Pipeline Job

1. **New Item** → Enter name: `Zomato-DevOps-Pipeline`
2. Select **Pipeline** → Click **OK**
3. Configure:

   **General:**
   - ✅ GitHub project
   - URL: `https://github.com/harsh-raj04/Zomato-devops-pipeline`

   **Build Triggers:**
   - ✅ GitHub hook trigger for GITScm polling

   **Pipeline:**
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/harsh-raj04/Zomato-devops-pipeline.git`
   - Credentials: Select `github-credentials`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

4. Click **Save**

## 🔔 Step 6: Configure GitHub Webhook

1. Go to your GitHub repository
2. **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - Payload URL: `http://<JENKINS_IP>:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Just the push event
   - Active: ✅
4. Click **Add webhook**

## ✅ Step 7: Test the Pipeline

### Manual Build
1. Go to your pipeline job
2. Click **Build Now**
3. Watch the build progress
4. Check **Console Output** for details

### Automatic Build (Push Trigger)
1. Make a small change in your repo
2. Commit and push to main branch
3. Jenkins automatically starts building!

## 📊 What Happens During Build

```
1. Checkout code from GitHub
2. Install npm dependencies (parallel)
3. Run tests
4. Build Docker images
5. Deploy to app server via Ansible
6. Health check
```

## 🔍 Verify Everything Works

```bash
# Check Jenkins is running
curl http://<JENKINS_IP>:8080

# Check app server is accessible from Jenkins
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<JENKINS_IP>
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<APP_SERVER_IP> "echo 'Connection works!'"
```

## 💡 Quick Tips

**View Jenkins Logs:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<JENKINS_IP>
sudo journalctl -u jenkins -f
```

**Restart Jenkins:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<JENKINS_IP>
sudo systemctl restart jenkins
```

**Check Docker:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<JENKINS_IP>
docker --version
docker ps
```

## 🎯 Success Checklist

- ✅ Jenkins EC2 created via Terraform
- ✅ Jenkins installed via Ansible
- ✅ Jenkins accessible at http://JENKINS_IP:8080
- ✅ GitHub credentials configured
- ✅ EC2 SSH key configured
- ✅ Pipeline job created
- ✅ GitHub webhook configured
- ✅ Manual build succeeds
- ✅ Push triggers automatic build

## 🚨 Troubleshooting

**Can't access Jenkins UI:**
- Check security group allows port 8080
- Verify Jenkins is running: `sudo systemctl status jenkins`

**Build fails on Docker:**
- Jenkins user must be in docker group (Ansible does this)
- Restart Jenkins: `sudo systemctl restart jenkins`

**Can't deploy to app server:**
- Verify SSH key is in Jenkins home: `/var/lib/jenkins/.ssh/`
- Test connection manually from Jenkins server

## 💰 Cost Estimate

- **t2.small (Jenkins):** ~$0.023/hour = ~$17/month
- **t3.micro (App):** ~$0.0104/hour = ~$7.5/month
- **Total:** ~$24.5/month

## 🎉 Next Steps

Once Jenkins is working:
1. Push code to trigger automatic deployment
2. Monitor builds in Jenkins dashboard
3. Add Slack/email notifications
4. Consider Phase 4: ECR, RDS, Load Balancer

---

For detailed documentation, see: `jenkins/README.md`
