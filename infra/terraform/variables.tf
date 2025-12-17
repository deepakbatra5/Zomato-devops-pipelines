# Variables for customizing the Zomato infrastructure
# Override these in terraform.tfvars or via -var flags

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "zomato"
}

variable "instance_type" {
  description = "EC2 instance type for combined Jenkins + Application server"
  type        = string
  default     = "t3.small"  # 2 vCPU, 2GB RAM - enough for Jenkins + Docker containers
}

variable "ami_id" {
  description = "AMI ID for EC2 instance (Ubuntu 22.04 LTS in ap-south-1)"
  type        = string
  default     = "ami-0f58b397bc5c1f2e8"
}

variable "key_name" {
  description = "EC2 Key Pair name for SSH access"
  type        = string
  default     = "zomato-deploy-key"
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed to SSH into EC2 instance"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}
