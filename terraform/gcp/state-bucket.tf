resource "google_storage_bucket" "terraform_state" {
  name          = "${random_id.default.hex}-terraform-remote-backend"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }
}