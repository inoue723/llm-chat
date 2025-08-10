resource "random_id" "default" {
  byte_length = 8
}

# gitの最新のコミットハッシュを取得する
# data.external.git.result.shaで取得できる
data "external" "git" {
  program = [
    "git",
    "log",
    "--pretty=format:{ \"sha\": \"%H\" }",
    "-1",
    "HEAD"
  ]
}

data "google_project" "project" {}

# 使用するgcloud serviceの有効化
module "project-services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "18.0.0"

  project_id = var.project_id

  activate_apis = [
    "run.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "storage.googleapis.com"
  ]
}