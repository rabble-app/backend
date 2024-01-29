terraform {

# backend "s3" {
#     bucket = "rutter-service-default-terraform-state-bucket"
#     key    = "terraform.tfstate"
#     region = "eu-west-2"
#     dynamodb_table =  "rutter-service-default-terraform-state-lock"
#     encrypt = true
#   }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "eu-west-2"
  profile = "rabble_api_prod"
}

locals {
  env = terraform.workspace
  base_name = format("%s-%s",var.project_name, terraform.workspace)
  ssm_base_name = format("/%s/%s",var.project_name, terraform.workspace)
}
