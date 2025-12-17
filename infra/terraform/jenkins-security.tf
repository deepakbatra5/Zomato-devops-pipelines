# Security Group for Jenkins Server
# Allows Jenkins web access, SSH, and communication with app server

resource "aws_security_group" "jenkins_sg" {
  name        = "${var.project_name}-${var.environment}-jenkins-sg"
  description = "Security group for Jenkins CI/CD server"
  vpc_id      = aws_vpc.main.id

  # SSH access - for management
  ingress {
    description = "SSH from allowed IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr
  }

  # Jenkins web interface
  ingress {
    description = "Jenkins web UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # TODO: Restrict to your IP for better security
  }

  # Jenkins agent connection (if using distributed builds)
  ingress {
    description = "Jenkins agent port"
    from_port   = 50000
    to_port     = 50000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-jenkins-sg"
  }
}

# Update app server security group to allow Jenkins access
resource "aws_security_group_rule" "app_allow_jenkins_ssh" {
  type                     = "ingress"
  from_port                = 22
  to_port                  = 22
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.jenkins_sg.id
  security_group_id        = aws_security_group.app_server.id
  description              = "Allow SSH from Jenkins for deployment"
}
