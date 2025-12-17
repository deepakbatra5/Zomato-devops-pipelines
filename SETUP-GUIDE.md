# 🚀 Zomato DevOps Pipeline - Complete Setup Guide

**Date:** December 10, 2025  
**Status:** ✅ Infrastructure Deployed & Jenkins Installed

---

## 📊 Infrastructure Overview

### AWS Resources
- **Jenkins Server:** `13.200.72.225:8080`
  - Instance ID: `i-00be8c203339a6ff2`
  - Instance Type: t3.small (2 vCPU, 2GB RAM)
  - SSH: `ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.200.72.225`

- **Application Server:** `13.203.190.4`
  - Instance ID: `i-0e614045a437a7513`
  - Private IP: `10.0.1.240` (for Jenkins deployment)
  - Instance Type: t3.micro (2 vCPU, 1GB RAM)
  - SSH: `ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.203.190.4`

- **Frontend URL:** http://13.203.190.4:3000
- **Backend URL:** http://13.203.190.4:4000

### Security Groups
- SSH: Open to 0.0.0.0/0 (✅ Unrestricted access for easier management)
- Jenkins UI (8080): Open to 0.0.0.0/0
- Frontend (3000): Open to 0.0.0.0/0
- Backend (4000): Open to 0.0.0.0/0

---

## 🔑 Jenkins Setup - Step by Step

### Step 1: Access Jenkins (IMMEDIATE)

1. Open in browser: **http://13.200.72.225:8080**

2. **Initial Admin Password:**
   ```
   33d02edf575043cc8c4b78f9d9b6513a
   ```

3. Paste the password and click **Continue**

### Step 2: Install Plugins (3-5 minutes)

1. Click **"Install suggested plugins"**
2. Wait for all plugins to install
3. Required plugins will include:
   - Git Plugin
   - GitHub Plugin
   - Pipeline
   - SSH Agent Plugin
   - Docker Pipeline
   - Credentials Binding

### Step 3: Create Admin User

**Recommended Settings:**
- Username: `admin`
- Password: [Choose a strong password - **SAVE IT**!]
- Full name: `Jenkins Admin`
- Email: your.email@example.com

Click **Save and Continue**

### Step 4: Instance Configuration

- Jenkins URL: `http://13.200.72.225:8080/`
- Keep as default
- Click **"Save and Finish"** → **"Start using Jenkins"**

---

## 🔐 Configure Jenkins Credentials

### Credential 1: GitHub Access Token

**Path:** Dashboard → Manage Jenkins → Credentials → System → Global credentials (unrestricted) → **Add Credentials**

**Settings:**
- **Kind:** Username with password
- **Scope:** Global
- **ID:** `github-credentials`
- **Username:** `harsh-raj04`
- **Password:** [GitHub Personal Access Token - see below]
- **Description:** `GitHub Access Token for Zomato Pipeline`

**Generate GitHub Token:**
1. Go to: https://github.com/settings/tokens/new
2. Token name: `Jenkins Zomato Pipeline`
3. Expiration: `90 days` (or your preference)
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. Paste it as the password in Jenkins

### Credential 2: EC2 SSH Key

**Path:** Same location → **Add Credentials**

**Settings:**
- **Kind:** SSH Username with private key
- **Scope:** Global
- **ID:** `ec2-ssh-key`
- **Username:** `ubuntu`
- **Private Key:** Enter directly
- **Key:** [Paste content below]
- **Passphrase:** Leave empty
- **Description:** `EC2 SSH Key for Deployment`

**Get Private Key:**
```bash
cat ~/.ssh/zomato-deploy-key.pem
```
Copy the **entire output** including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

---

## 📦 Create Pipeline Job

### Step 1: Create New Item

1. Dashboard → **New Item**
2. Name: `Zomato-DevOps-Pipeline`
3. Type: **Pipeline**
4. Click **OK**

### Step 2: Configure Job

**General Section:**
- ✅ GitHub project
- Project url: `https://github.com/harsh-raj04/Zomato-devops-pipeline/`

**Build Triggers:**
- ✅ GitHub hook trigger for GITScm polling

**Pipeline Section:**
- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `https://github.com/harsh-raj04/Zomato-devops-pipeline.git`
- Credentials: Select `github-credentials`
- Branch Specifier: `*/feature/jenkins`
- Script Path: `Jenkinsfile`

**Click Save**

---

## 🔗 Setup GitHub Webhook

### Configure Webhook

1. Go to: https://github.com/harsh-raj04/Zomato-devops-pipeline/settings/hooks
2. Click **Add webhook**

**Settings:**
- **Payload URL:** `http://13.200.72.225:8080/github-webhook/`
- **Content type:** `application/json`
- **Secret:** Leave empty
- **SSL verification:** Enable SSL verification
- **Which events:** Just the push event
- **Active:** ✅ Checked

3. Click **Add webhook**
4. You should see a green checkmark after webhook delivers successfully

---

## 🧪 Test Your Pipeline

### Manual Build Test

1. Go to Jenkins → `Zomato-DevOps-Pipeline` job
2. Click **Build Now**
3. Click on the build number (e.g., #1)
4. Click **Console Output**

**Expected Stages:**
```
✅ Checkout
✅ Install Dependencies (Backend + Frontend)
✅ Run Tests
✅ Build Docker Images
⏭️  Push to Registry (skipped - not on main branch)
✅ Deploy to EC2
✅ Health Check
```

Build should complete in ~5-10 minutes.

### Verify Deployment

After successful build:
- **Frontend:** http://13.203.190.4:3000
- **Backend API:** http://13.203.190.4:4000/api/restaurants

You should see **9 restaurants** listed!

### Test Automatic Deployment

Make a small change and push:

```bash
cd /Users/harshraj/Desktop/VS\ Code/Zomato-devops-pipeline

# Make a test change
echo "# Test automated deployment - $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Test: Verify webhook triggers Jenkins build"
git push origin feature/jenkins
```

Within 30 seconds, Jenkins should automatically start a new build!

---

## 🎯 Pipeline Workflow

```
1. Developer pushes code to GitHub (feature/jenkins branch)
          ↓
2. GitHub webhook triggers Jenkins
          ↓
3. Jenkins pulls latest code
          ↓
4. Installs npm dependencies (frontend + backend)
          ↓
5. Runs tests (placeholder for now)
          ↓
6. Builds Docker images with correct API URLs
   - Backend: Node.js app
   - Frontend: Vite build + Nginx
   - API URL: http://13.203.190.4:4000
          ↓
7. Ansible deploys to EC2 via SSH (private IP: 10.0.1.240)
   - Stops old containers
   - Removes database volume (fresh seed)
   - Starts new containers
          ↓
8. Health checks verify services are running
          ↓
9. Application live at http://13.203.190.4:3000
```

---

## 🛠️ Useful Commands

### Check Jenkins Status
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.200.72.225 \
  'sudo systemctl status jenkins'
```

### Check Docker Containers on App Server
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.203.190.4 \
  'docker ps'
```

### View Backend Logs
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.203.190.4 \
  'cd zomato-app && docker compose logs backend'
```

### View Frontend Logs
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.203.190.4 \
  'cd zomato-app && docker compose logs frontend'
```

### Restart Deployment Manually (via Ansible)
```bash
cd ansible
ansible-playbook -i inventory deploy.yml \
  --private-key=~/.ssh/zomato-deploy-key.pem \
  --extra-vars "EC2_PUBLIC_IP=13.203.190.4"
```

---

## 🐛 Troubleshooting

### Jenkins Not Accessible
```bash
# Check if Jenkins is running
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.200.72.225 \
  'sudo systemctl status jenkins'

# Restart Jenkins if needed
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.200.72.225 \
  'sudo systemctl restart jenkins'
```

### Pipeline Fails at "Deploy to EC2"
- Check SSH key is correctly added to Jenkins credentials
- Verify private IP in `Jenkinsfile` matches: `10.0.1.240`
- Check app server SSH: `ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.203.190.4`

### Frontend Shows Wrong API URL
- Check `Jenkinsfile` has: `EC2_PUBLIC_IP = '13.203.190.4'`
- Frontend builds with: `--build-arg VITE_API_BASE=http://13.203.190.4:4000`
- Rebuild triggers fresh Docker build with `--no-cache`

### Database Not Seeding
- `ansible/deploy.yml` removes volume: `docker volume rm zomato-app_dbdata`
- This forces fresh seed from `backend/src/data/restaurants.json`
- Check backend logs: `docker compose logs backend | grep "Seeded"`

### Webhook Not Triggering
1. Go to GitHub → Settings → Webhooks
2. Check webhook shows green checkmark
3. Click webhook → Recent Deliveries
4. Check response status (should be 200)
5. Verify payload URL: `http://13.200.72.225:8080/github-webhook/`

---

## 💰 Cost Management

### Stop Instances When Not Needed
```bash
cd infra/terraform
terraform destroy
```

### Recreate When Needed
```bash
cd infra/terraform
terraform apply

# Note: IPs might change! Update:
# - Jenkinsfile (EC2_HOST, EC2_PUBLIC_IP)
# - ansible/inventory
# - GitHub webhook URL
```

---

## 📝 What's Next?

1. ✅ Complete Jenkins setup (above steps)
2. ✅ Test manual build
3. ✅ Test automatic deployment via push
4. Add actual tests to `backend/package.json` and `frontend/package.json`
5. Add Slack/email notifications in Jenkinsfile
6. Consider AWS ECR for Docker images (Phase 4)
7. Add monitoring with CloudWatch
8. Implement blue-green deployment

---

## 🎉 Summary

Your complete CI/CD pipeline is ready! After completing the Jenkins setup:

- Push code → Automatic deployment in ~5-10 minutes
- 9 restaurants with menus automatically seeded
- Frontend + Backend + Database all containerized
- Infrastructure as Code with Terraform
- Automated deployment with Ansible
- Security groups configured (SSH open for easy access)

**Infrastructure Cost:** ~$0.03/hour (when running)

**Next Step:** Open http://13.200.72.225:8080 and complete Jenkins setup!
