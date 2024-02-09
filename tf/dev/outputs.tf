output "domain_name" {
  value = "https://${aws_route53_record.beanstalkappenv.name}/api"
  
}

output "elb_cname" {
  value = aws_elastic_beanstalk_environment.beanstalkappenv.cname
}