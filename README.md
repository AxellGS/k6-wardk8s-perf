# WardK8s Performance Testing Suite (k6)

[![k6](https://img.shields.io/badge/k6-load_testing-7a64ff.svg)](https://k6.io/) 
[![Infrastructure](https://img.shields.io/badge/Infrastructure-QA_Performance-blue.svg)]()

This repository serves as a **Proof of Work (PoW)** and asynchronous technical trial demonstrating advanced Quality Assurance and Performance Engineering methodologies. 

It contains a highly optimized `k6` load testing suite specifically designed to aggressively stress test and validate [WardK8s](https://github.com/AxellGS/WardK8s), a Kubernetes Security Policy Controller.

## Objective

The goal of this suite is to prove that the WardK8s `ValidatingAdmissionWebhook` can handle extreme concurrent requests from the Kubernetes API Server without degrading cluster latency or exceeding its baseline resource footprint (8Mi RAM / 1m CPU).

This effectively bridges the gap between **Software Engineering** (writing the controller in Go) and **Quality Engineering** (breaking it under load and profiling the failure points).

## Test Architecture

The suite is written in modern JavaScript using the `k6` framework. It orchestrates a flood of `AdmissionReview` API calls (the exact payload the Kubernetes API Server sends) directly to the webhook's TLS endpoint.

### Profiles

1. **Smoke Test (`npm run test:smoke`)**
   - **Purpose:** Verification of baseline functionality. Injects 1 request per second.
   - **Threshold:** `p(95) < 5ms`, 0% failure rate.
   
2. **Load Test (`npm run test:load`)**
   - **Purpose:** Replicates typical heavy cluster traffic (e.g., a massive CI/CD pipeline deploying hundreds of pods simultaneously).
   - **Traffic:** Ramps up to 50 Concurrent Virtual Users (VUs) constantly flooding the endpoint for 1 minute.
   - **Threshold:** `p(95) < 10ms`, < 1% failure rate.
   
3. **Stress Test (`npm run test:stress`)**
   - **Purpose:** Finds the breaking point. Pushes the controller to resource saturation to observe how it degrades (Latencies vs Throughput).
   - **Traffic:** Aggressive ramp-up to 500 VUs.
   - **Threshold:** None (Evaluates saturation curve and OOM resilience).

## Performance Profiling Methodology

In modern infrastructure environments, reliability and efficiency are best demonstrated through tangible impact and data-driven analysis. 

This repository is designed to be easily reproducible so that engineers and technical reviewers can independently verify the load-bearing claims of the WardK8s project. The expected workflow is:
1. Review the test architecture designed here.
2. Execute the tests against a local instance of WardK8s.
3. Analyze the generated `REPORT.md` (or your own stdout metrics), detailing latencies, throughputs, and memory profiling during the stress phase.

## Quick Start

### Prerequisites

Depending on your execution preference, you will need either:

**For Native Execution (Option A):**
- [k6](https://k6.io/docs/get-started/installation/) installed locally.
- Node.js (for managing the TS typings).

**For Docker Execution (Option B):**
- Docker installed and running.

**For Both:**
- WardK8s running locally or in a Kind cluster.

### Setup & Execution

You can run this suite either using a native `k6` installation or via Docker. The scripts automatically detect the environment to route traffic correctly.

**Option A: Native k6**
```bash
npm install
npm run test:load
```

**Option B: Via Docker (No local installation required)**
*(Recommended for evaluators. Run from PowerShell, Bash, or Zsh)*
```bash
# Run the Smoke profile
docker run --rm -i --add-host host.docker.internal:host-gateway -v "${PWD}:/scripts" -w /scripts grafana/k6 run -e TARGET_ENV=docker tests/smoke.js

# Run the Load profile
docker run --rm -i --add-host host.docker.internal:host-gateway -v "${PWD}:/scripts" -w /scripts grafana/k6 run -e TARGET_ENV=docker tests/load.js
```
If targeting a deployed Kind cluster, port-forward the service first:
```bash
kubectl port-forward --address 0.0.0.0 svc/wardk8s-webhook -n wardk8s-system 9443:443
```
