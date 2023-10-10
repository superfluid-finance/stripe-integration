# Kubernetes setup

- install [helm](https://helm.sh/docs/intro/install/)
- cd into the `k8s` folder
- run `sh helm install stripe-integration .`
- (optional) upgrade with `sh helm upgrade stripe-integration .`

## Useful commands
- `sh kubectl delete all --all --namespace default` -  delete all kubernetes pods & services
- `sh kubectl get po` - list pods
- `sh kubectl get svc` - list services
    - You can grab the api port with this command, and call `http://localhost:{port}/health` to test the service.        
    `sh stripe-integration     NodePort    10.101.180.9    <none>        3000:`<u>30894</u>`/TCP   11m`
- `sh kubectl logs -l app=stripe-integration` - get aggregated logs from all pods
- `sh kubectl logs [pod-name]` - get logs from a specific pod

## Set up secrets
- `sh kubectl create secret generic api-key --from-literal=API_KEY=my-secret-key`
- `sh kubectl create secret generic stripe-sk --from-literal=STRIPE_SECRET_KEY=my-stripe-sk`