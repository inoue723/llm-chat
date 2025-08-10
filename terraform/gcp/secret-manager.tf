# secret作成
resource "google_service_account" "cloud-run-service-account" {
  account_id   = "cloud-run-service-account"
  display_name = "Service account for Cloud Run"
}

locals {
  secrets = [
    {
      name        = "DATABASE_URL"
      secret_data = var.database_url
    },
  ]

  secret_accessors_list = [
    "serviceAccount:${google_service_account.cloud-run-service-account.email}"
  ]
}

resource "google_secret_manager_secret" "secrets" {
  project   = var.project_id
  for_each  = { for secret in local.secrets : secret.name => secret }
  secret_id = each.value.name
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "secret-version" {
  for_each    = { for secret in local.secrets : secret.name => secret if can(secret.secret_data) }
  secret      = google_secret_manager_secret.secrets[each.value.name].id
  secret_data = each.value.secret_data
}

resource "google_secret_manager_secret_iam_binding" "binding" {
  project   = var.project_id
  for_each  = { for secret in local.secrets : secret.name => secret if length(local.secret_accessors_list) > 0 }
  secret_id = google_secret_manager_secret.secrets[each.value.name].id
  role      = "roles/secretmanager.secretAccessor"
  members   = local.secret_accessors_list
}