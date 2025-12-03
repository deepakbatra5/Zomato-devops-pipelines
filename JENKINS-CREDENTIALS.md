# 🔐 Jenkins Setup - Credentials & Configuration

**Date:** December 1, 2025  
**Status:** ✅ Infrastructure Deployed, ⏳ Awaiting Configuration

---

## 📊 Infrastructure Overview

### Jenkins Server
- **Public IP:** `13.127.116.184`
- **Jenkins URL:** http://13.127.116.184:8080
- **Instance Type:** t3.small (2 vCPU, 2GB RAM)
- **SSH Access:** `ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.127.116.184`

### Application Server
- **Public IP:** `3.108.112.197`
- **Frontend URL:** http://3.108.112.197:3000
- **Backend URL:** http://3.108.112.197:4000
- **Instance Type:** t3.micro (2 vCPU, 1GB RAM)
- **SSH Access:** `ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@3.108.112.197`

---

## 🔑 Jenkins Initial Setup

### Step 1: Access Jenkins

1. **Open in browser:** http://13.127.116.184:8080

2. **Initial Admin Password:**
   ```
   f9fc4f0474054c93988518b6468d6020
   ```

3. **Installation Wizard:**
   - Click **"Install suggested plugins"**
   - Wait 2-3 minutes for plugins to install
   - This includes: Git, Pipeline, GitHub, SSH Agent, Docker, etc.

### Step 2: Create Admin User

**Recommended Settings:**
- Username: `admin`
- Password: [Choose a strong password - save it securely!]
- Full name: `Jenkins Admin`
- Email: [Your email]

### Step 3: Instance Configuration
- Jenkins URL: `http://13.127.116.184:8080/`
- Keep as default, click **"Save and Finish"**
- Click **"Start using Jenkins"**

---

## 🔐 Credentials Configuration

### Credential 1: GitHub Access

**Path:** Manage Jenkins → Credentials → System → Global credentials (unrestricted) → Add Credentials

**Configuration:**
- **Kind:** Username with password
- **Scope:** Global
- **ID:** `github-credentials`
- **Username:** `harsh-raj04` (your GitHub username)
- **Password:** [GitHub Personal Access Token]
- **Description:** `GitHub Access Token for Zomato DevOps Pipeline`

**Generate GitHub Token:**
1. Go to: https://github.com/settings/tokens/new
2. Token name: `Jenkins Zomato Pipeline`
3. Expiration: `90 days` (or custom)
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. Paste it as the password in Jenkins

### Credential 2: EC2 SSH Access

**Path:** Same location → Add Credentials

**Configuration:**
- **Kind:** SSH Username with private key
- **Scope:** Global
- **ID:** `ec2-ssh-key`
- **Username:** `ubuntu`
- **Private Key:** Enter directly
- **Key:** [Paste content from `~/.ssh/zomato-deploy-key.pem`]
- **Passphrase:** Leave empty
- **Description:** `EC2 SSH Key for Application Server Deployment`

**Get Private Key Content:**
```bash
cat ~/.ssh/zomato-deploy-key.pem
```
Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

---

## 📦 Pipeline Job Creation

### Step 1: Create New Job

1. Click **"New Item"** (top left)
2. **Item name:** `Zomato-DevOps-Pipeline`
3. Select **"Pipeline"**
4. Click **"OK"**

### Step 2: General Configuration

**GitHub Project:**
- ✅ Check "GitHub project"
- **Project url:** `https://github.com/harsh-raj04/Zomato-devops-pipeline`

### Step 3: Build Triggers

- ✅ Check **"GitHub hook trigger for GITScm polling"**
  - This enables automatic builds when you push to GitHub

### Step 4: Pipeline Configuration

**Pipeline Section:**
- **Definition:** `Pipeline script from SCM`
- **SCM:** `Git`

**Repository:**
- **Repository URL:** `https://github.com/harsh-raj04/Zomato-devops-pipeline.git`
- **Credentials:** Select `harsh-raj04/****** (GitHub Access Token for Zomato DevOps Pipeline)`

**Branches to build:**
- **Branch Specifier:** `*/main`

**Script Path:**
- **Script Path:** `Jenkinsfile`
  - (Jenkins will read the pipeline definition from the Jenkinsfile in your repo)

**Click "Save"**

---

## 🔔 GitHub Webhook Setup

### Configure Webhook in GitHub

1. **Go to your repository:**
   - https://github.com/harsh-raj04/Zomato-devops-pipeline

2. **Navigate to Settings:**
   - Click **"Settings"** tab
   - Click **"Webhooks"** in left sidebar
   - Click **"Add webhook"**

3. **Webhook Configuration:**
   - **Payload URL:** `http://13.127.116.184:8080/github-webhook/`
   - **Content type:** `application/json`
   - **Secret:** Leave empty (or add for security)
   - **Which events:** `Just the push event`
   - **Active:** ✅ Checked
   - Click **"Add webhook"**

4. **Verify:**
   - You should see a green checkmark ✅ after a few seconds
   - If not, click on the webhook and check "Recent Deliveries"

---

## 🧪 Testing Your Setup

### Test 1: Manual Build

1. Go to your pipeline job: `Zomato-DevOps-Pipeline`
2. Click **"Build Now"** (left sidebar)
3. Watch the build progress in **"Build History"**
4. Click on the build number (e.g., `#1`)
5. Click **"Console Output"** to see detailed logs

**Expected Stages:**
1. ✅ Checkout Code from GitHub
2. ✅ Install Backend Dependencies
3. ✅ Install Frontend Dependencies
4. ✅ Run Tests
5. ✅ Build Docker Images
6. ✅ Deploy to EC2
7. ✅ Health Check

### Test 2: Automatic Build (GitHub Push)

1. Make a small change in your repository:
   ```bash
   cd /Users/harshraj/Desktop/VS\ Code/Zomato-devops-pipeline
   echo "# CI/CD Pipeline Active" >> README.md
   git add README.md
   git commit -m "test: Trigger Jenkins pipeline"
   git push origin main
   ```

2. **Watch Jenkins:**
   - Jenkins should automatically start a new build within seconds
   - Check the dashboard to see the build triggered by "GitHub Push"

### Test 3: Verify Deployment

After successful build:

1. **Check Frontend:**
   ```bash
   curl http://3.108.112.197:3000
   ```
   Should return HTML

2. **Check Backend:**
   ```bash
   curl http://3.108.112.197:4000/api/restaurants
   ```
   Should return JSON with restaurants

3. **Check in Browser:**
   - Frontend: http://3.108.112.197:3000
   - Should show 7 restaurants

---

## 🎯 Environment Variables

The pipeline uses these environment variables (already configured in Jenkinsfile):

```groovy
environment {
    EC2_HOST = '3.108.112.197'
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
}
```

If you need to update the app server IP:
1. Edit `Jenkinsfile` in your repository
2. Change `EC2_HOST` value
3. Commit and push

---

## 📝 Pipeline Stages Explained

### 1. Checkout Code
- Clones your repository from GitHub
- Uses the `github-credentials` credential

### 2. Install Dependencies (Parallel)
- **Backend:** `npm ci` in backend directory
- **Frontend:** `npm ci` in frontend directory
- Runs simultaneously to save time

### 3. Run Tests
- **Backend:** `npm test` (if tests exist)
- **Frontend:** `npm test` (if tests exist)
- Skips if no test scripts defined

### 4. Build Docker Images
- Builds frontend and backend images
- Tags with build number: `zomato-frontend:${BUILD_NUMBER}`
- Uses Docker BuildKit for faster builds

### 5. Deploy to EC2
- Uses Ansible to deploy via SSH
- Credentials: `ec2-ssh-key`
- Updates docker-compose on app server
- Restarts containers with new images

### 6. Health Check
- Waits 30 seconds for startup
- Checks frontend (port 3000)
- Checks backend (port 4000)
- Fails build if services don't respond

---

## 🔍 Troubleshooting

### Issue: Can't access Jenkins UI

**Solution:**
```bash
# Check if Jenkins is running
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.127.116.184
sudo systemctl status jenkins

# Restart if needed
sudo systemctl restart jenkins
```

### Issue: Build fails at "Deploy to EC2"

**Check:**
1. SSH key credential is correct
2. App server IP is correct in Jenkinsfile
3. Test SSH connection:
   ```bash
   ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@3.108.112.197 "echo 'Connection works!'"
   ```

### Issue: GitHub webhook not triggering builds

**Check:**
1. Webhook URL has `/github-webhook/` endpoint
2. Webhook shows green checkmark in GitHub
3. Jenkins has "GitHub hook trigger" enabled
4. Check webhook delivery logs in GitHub

### Issue: Docker permission denied

**Solution:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.127.116.184
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: Health check fails

**Check containers on app server:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@3.108.112.197
cd /home/ubuntu/zomato-app
docker compose ps
docker compose logs backend
docker compose logs frontend
```

---

## 📊 Monitoring & Logs

### View Jenkins Logs
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.127.116.184
sudo journalctl -u jenkins -f
```

### View Application Logs
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@3.108.112.197
cd /home/ubuntu/zomato-app
docker compose logs -f
```

### Check Build History
- Jenkins Dashboard → Click job name → Build History
- Click any build number → Console Output for detailed logs

---

## 💰 Cost Tracking

**Monthly Costs (AWS ap-south-1):**
- Jenkins EC2 (t3.small): ~$15-17/month
- App EC2 (t3.micro): ~$7-8/month
- 2 Elastic IPs: ~$7.20/month (if not attached)
- Data Transfer: ~$1-5/month
- **Total:** ~$30-35/month

**Cost Optimization:**
- Both instances use gp3 volumes (cheaper than gp2)
- Stop Jenkins when not actively developing (save ~50%)
- Use reserved instances for long-term (save ~30%)

---

## 🎉 Success Checklist

- [ ] Jenkins UI accessible at http://13.127.116.184:8080
- [ ] Initial admin password used: `f9fc4f0474054c93988518b6468d6020`
- [ ] Admin user created with secure password
- [ ] GitHub credentials added: `github-credentials`
- [ ] EC2 SSH credentials added: `ec2-ssh-key`
- [ ] Pipeline job created: `Zomato-DevOps-Pipeline`
- [ ] GitHub webhook configured and active
- [ ] Manual build successful (Build Now)
- [ ] Automatic build triggered by push
- [ ] Application deployed and accessible at http://3.108.112.197:3000
- [ ] Backend API responding at http://3.108.112.197:4000/api/restaurants

---

## 📚 Additional Resources

- **Jenkins Documentation:** https://www.jenkins.io/doc/
- **Pipeline Syntax:** https://www.jenkins.io/doc/book/pipeline/syntax/
- **GitHub Webhooks:** https://docs.github.com/en/webhooks
- **Docker Documentation:** https://docs.docker.com/

---

## 🔒 Security Notes

1. **Change Initial Password:** After first login, change from the temporary password
2. **GitHub Token:** Store securely, rotate every 90 days
3. **SSH Keys:** Never commit to repository
4. **Security Groups:** Currently allows SSH from your IP only (128.185.168.210/32)
5. **Jenkins Port:** Consider adding authentication/firewall for port 8080
6. **HTTPS:** For production, add SSL/TLS certificates

---

## 📞 Quick Reference Commands

**SSH to Jenkins:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.127.116.184
```

**SSH to App Server:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@3.108.112.197
```

**Restart Jenkins:**
```bash
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@13.127.116.184
sudo systemctl restart jenkins
```

**View Terraform Outputs:**
```bash
cd infra/terraform
terraform output
```

**Redeploy Application:**
```bash
cd ansible
ansible-playbook -i inventory deploy.yml
```

**Update Infrastructure:**
```bash
cd infra/terraform
terraform plan
terraform apply
```

---

**Last Updated:** December 1, 2025  
**Created by:** Automated DevOps Pipeline Setup

**Need Help?** Check troubleshooting section or review `jenkins/README.md` and `jenkins/SETUP-EC2.md`
