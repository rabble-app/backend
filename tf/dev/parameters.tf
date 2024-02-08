resource "aws_ssm_parameter" "env_variables" {
  for_each = var.env_map
  name = "${local.ssm_base_name}/${each.key}"
  type = "SecureString"
  value = each.value
  overwrite = true
}