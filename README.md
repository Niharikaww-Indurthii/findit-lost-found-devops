# FindIt — Lost & Found Portal

A responsive Flask-served Lost and Found demo portal prepared for a DevOps case study using GitHub, Jenkins, Docker, Docker Hub and Kubernetes.

## Features
- Responsive landing page and item cards
- Search by item, category, location and description
- Lost/Found and category filters
- Report form with validation
- Dashboard statistics
- Health endpoint at `/health`
- Automated unit tests
- Docker image and Kubernetes manifests

## Important storage limitation
No database is used. User-created reports are saved in the browser's localStorage. They persist in that browser but are not shared across browsers/devices, and they are not a true real-time multi-user feed. The six sample reports are demo data. To make reports shared across users, a shared server-side store or database would be required.

## Run locally (Windows PowerShell)
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
py -m unittest -v
py app.py
```
Open http://localhost:5000

## Docker
```powershell
docker build -t findit-lost-found:local .
docker run --rm -p 5001:5000 findit-lost-found:local
```
Open http://localhost:5001

## Before using Jenkins/Kubernetes
1. Replace `YOUR_DOCKERHUB_USERNAME` in `Jenkinsfile` and `deployment.yaml`.
2. Add Jenkins username/password credential with ID `dockerhub-creds`; use a Docker Hub access token as the password.
3. Configure the Jenkins Windows service to access Docker and the intended Kubernetes context.
4. Configure the Jenkins job as Pipeline script from SCM, Git, branch `*/main`, script path `Jenkinsfile`.
5. Push changes to GitHub. Jenkins polls SCM every approximately five minutes.
6. The Jenkinsfile applies the deployment and Service manifests before updating the deployment to the unique build-number image tag, so it supports the first deployment as well as later updates.

## Kubernetes access
```powershell
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods
kubectl get services
```
If NodePort is not accessible at http://localhost:30080, run:
```powershell
kubectl port-forward service/findit-service 8080:5000
```
Then open http://localhost:8080
