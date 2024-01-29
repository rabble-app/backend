
variable "solution_stack_name" {
  type = string
}
variable "tier" {
  type = string
}
 

variable "instance_type" {
  default =  "t2.micro"
}

variable "minsize" {
  default = 1
}

variable "maxsize" {
  default = 2
}

variable "certificate_arn" {
  type = string
  
}

variable "elb_policy_name" {
  default = "ELBSecurityPolicy-2016-08"
  
}

variable "hosted_zone" {
  type = string
}

variable "project_name" {
  type = string
}

variable "env_map" {
  type = map(string)
}

variable "app_env" {
  type = map(string)
}