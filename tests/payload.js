export function generatePodPayload(vuId, iter) {
  const hash = `${vuId}-${iter}-${Math.floor(Math.random() * 100000)}`;
  return JSON.stringify({
    kind: "AdmissionReview",
    apiVersion: "admission.k8s.io/v1",
    request: {
      uid: `req-${hash}`,
      kind: { group: "", version: "v1", kind: "Pod" },
      resource: { group: "", version: "v1", resource: "pods" },
      namespace: "production",
      operation: "CREATE",
      object: {
        metadata: {
          name: `load-test-pod-${hash}`,
          namespace: "production",
          labels: { "security-tier": "trusted" }
        },
        spec: {
          containers: [
            {
              name: "nginx",
              image: "nginx:latest",
              securityContext: {
                privileged: false
              }
            }
          ]
        }
      }
    }
  });
}
