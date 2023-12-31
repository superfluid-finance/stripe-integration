# Kubernetes setup

- (optional) run `pnpm minikube` when using GitHub Codespaces (Dev Containers)
- build the back-end containers: `pnpm docker:builder`
- install [helm](https://helm.sh/docs/intro/install/)
- cd into the `k8s` folder
- add dependency repo `helm repo add bitnami https://charts.bitnami.com/bitnami`
- build dependencies `helm dependency build`
- set up secrets:
    - `kubectl create secret generic api-key --from-literal=INTERNAL_API_KEY=my-secret-key`
    - `kubectl create secret generic stripe-sk --from-literal=STRIPE_SECRET_KEY=my-stripe-sk`
- run `helm install stripe-integration .`
- (optional) upgrade with `helm upgrade stripe-integration .`
- verify that pods are running with `kubectl get pods`

## Useful commands
- `kubectl delete all --all --namespace default` -  delete all kubernetes pods & services
- `kubectl get po` - list pods
- `kubectl get svc` - list services
    - You can grab the api port with this command, and call `http://localhost:{port}/health` to test the service.        
    `stripe-backend     NodePort    10.101.180.9    <none>        3000:`<u>30894</u>`/TCP   11m`
- `kubectl logs -l app=stripe-backend` - get aggregated logs from all pods
- `kubectl logs [pod-name]` - get logs from a specific pod