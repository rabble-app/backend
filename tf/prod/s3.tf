

resource "aws_s3_bucket" "terraform_rabble_bucket" {

  bucket = "rabble-${terraform.workspace}-assets"

  // This is only here so we can destroy the bucket as part of automated tests. You should not copy this for production
  // usage
  force_destroy = true
  
}

resource "aws_ssm_parameter" "bucket_name_parameter" {
  name        = "${local.ssm_base_name}/RABBLE_AWS_BUCKET_NAME"
  description = "Assets bucket name"
  type        = "String"
  value       = aws_s3_bucket.terraform_rabble_bucket.bucket
  overwrite = true
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.terraform_rabble_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}


resource "aws_s3_bucket_lifecycle_configuration" "versioning-bucket-config" {
  # Must have bucket versioning enabled first
  depends_on = [aws_s3_bucket_versioning.versioning]

  bucket = aws_s3_bucket.terraform_rabble_bucket.id

  rule {
    id = "config"

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
    status = "Enabled"
  }
}


resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket                  = aws_s3_bucket.terraform_rabble_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "terraform_rabble_bucket_ownership_controls" {
  bucket = aws_s3_bucket.terraform_rabble_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}


resource "aws_s3_bucket_acl" "terraform_rabble_bucket_acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.terraform_rabble_bucket_ownership_controls,
    aws_s3_bucket_public_access_block.public_access,
  ]

  bucket = aws_s3_bucket.terraform_rabble_bucket.id
  acl    = "public-read"
}

