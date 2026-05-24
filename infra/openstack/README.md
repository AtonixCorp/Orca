<!--
================================================================================
 File: infra/openstack/README.md
 Purpose:
   Index for SmartCito OpenStack infrastructure definitions.
================================================================================
-->

# SmartCito OpenStack Infrastructure

This folder contains the OpenStack-specific infrastructure layer for running
SmartCito on virtual machines that host Docker today and Kubernetes later.

The root Terraform module in this directory composes the child modules under
`networking/`, `compute/`, and `storage/` into one apply flow.

## Layout

- `networking/` defines `smartcito-public-net`, `smartcito-services-net`, and
  `smartcito-database-net`, plus router and security groups.
- `compute/` defines API gateway, service-node, and database-node instances.
- `storage/` defines persistent volumes for databases, object storage, and logs.

## Apply Flow

```bash
cp infra/openstack/terraform.tfvars.example infra/openstack/terraform.tfvars
terraform -chdir=infra/openstack init
terraform -chdir=infra/openstack plan
terraform -chdir=infra/openstack apply
```