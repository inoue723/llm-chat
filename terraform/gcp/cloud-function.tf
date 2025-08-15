resource "random_id" "short" {
  byte_length = 4
}

# Cloud Function for Cloud Run warm up
resource "google_cloudfunctions2_function" "warmup_function" {
  name        = "cloud-run-warmup-${random_id.default.hex}"
  location    = var.region
  description = "warm up cloud run"

  build_config {
    runtime     = "nodejs22"
    entry_point = "entry"
    source {
      storage_source {
        bucket = google_storage_bucket.warmup_function_source.name
        object = google_storage_bucket_object.warmup_function_source.name
      }
    }
  }

    service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
    service_account_email = google_service_account.warmup_function_sa.email
    environment_variables = {
      TARGET_URL = var.web_url
      SERVICE_ACCOUNT = google_service_account.warmup_function_sa.email
    }
  }
}

# Cloud Scheduler Job for Cloud Run warm up
resource "google_cloud_scheduler_job" "warmup_job" {
  name             = "cloud-run-warmup-job-${random_id.default.hex}"
  description      = "Warms up Cloud Run service every 5 minutes"
  schedule         = "*/5 * * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "320s"

  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.warmup_function.url

    headers = {
      "User-Agent" = "Google-Cloud-Scheduler"
    }

    oidc_token {
      service_account_email = google_service_account.warmup_scheduler_sa.email
    }
  }
}

# Service Account for Cloud Scheduler warm up
resource "google_service_account" "warmup_scheduler_sa" {
  account_id   = "warmup-sched-${random_id.short.hex}"
  display_name = "Cloud Run Warmup Scheduler Service Account"
  description  = "Service account for Cloud Scheduler to invoke Cloud Run warmup function"
}

# Service Account for Cloud Function to call Cloud Run
resource "google_service_account" "warmup_function_sa" {
  account_id   = "warmup-func-${random_id.short.hex}"
  display_name = "Cloud Run Warmup Function Service Account"
  description  = "Service account for Cloud Function to call Cloud Run service"
}

# IAM binding to allow Cloud Scheduler to invoke the warmup function
resource "google_cloudfunctions2_function_iam_member" "warmup_invoker" {
  project        = google_cloudfunctions2_function.warmup_function.project
  location       = google_cloudfunctions2_function.warmup_function.location
  cloud_function = google_cloudfunctions2_function.warmup_function.name

  role   = "roles/cloudfunctions.invoker"
  member = "serviceAccount:${google_service_account.warmup_scheduler_sa.email}"
}

# Storage bucket for warmup function source code
resource "google_storage_bucket" "warmup_function_source" {
  name          = "warmup-function-source-${random_id.default.hex}"
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true
}

# Warmup function source code (placeholder - you'll need to upload your actual code)
resource "google_storage_bucket_object" "warmup_function_source" {
  name   = "warmup-function-source.zip"
  bucket = google_storage_bucket.warmup_function_source.name
  source = "function-source.zip" # You'll need to create this zip file with your function code

  depends_on = [google_storage_bucket.warmup_function_source]
}

# IAM policy to restrict warmup function access to only Cloud Scheduler
resource "google_cloudfunctions2_function_iam_policy" "restrict_warmup_access" {
  project        = google_cloudfunctions2_function.warmup_function.project
  location       = google_cloudfunctions2_function.warmup_function.location
  cloud_function = google_cloudfunctions2_function.warmup_function.name

  policy_data = data.google_iam_policy.restrict_warmup_function_access.policy_data
}

# IAM policy data that denies all access except from the warmup scheduler service account
data "google_iam_policy" "restrict_warmup_function_access" {
  binding {
    role = "roles/cloudfunctions.invoker"
    members = [
      "serviceAccount:${google_service_account.warmup_scheduler_sa.email}"
    ]
  }

  binding {
    role = "roles/cloudfunctions.developer"
    members = [
      "serviceAccount:${google_service_account.warmup_scheduler_sa.email}"
    ]
  }
}

# IAM binding to assign Service Account Token Creator role to the warmup function service account
resource "google_project_iam_member" "warmup_function_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:${google_service_account.warmup_function_sa.email}"
}
