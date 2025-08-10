resource "google_artifact_registry_repository" "llm-chat" {
  location      = var.region
  repository_id = "llm-chat"
  description   = "LLM Chat Repository"
  format        = "DOCKER"

  docker_config {
    # enable to delete images
    immutable_tags = false
  }

  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "delete-stale-tags"
    action = "DELETE"
    condition {
      tag_state  = "TAGGED"
      older_than = "259200s" # 3 days
    }
  }
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 3
    }
  }

  depends_on = [module.project-services]
}