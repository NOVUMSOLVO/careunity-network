#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Variables
ENVIRONMENT=$1
APP_NAME="careunity-$ENVIRONMENT"
DEPLOY_DIR="/var/www/careunity-$ENVIRONMENT"
ARTIFACT_NAME="artifact.tar.gz"

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh <environment>"
  echo "Example: ./deploy.sh staging"
  exit 1
fi

echo "Deploying $APP_NAME to $DEPLOY_DIR"

# Stop the current application using PM2
# If the app is not running, pm2 delete will fail, so we check if it exists first
pm2 describe $APP_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Stopping application $APP_NAME..."
  pm2 stop $APP_NAME || echo "Application $APP_NAME was not running."
  pm2 delete $APP_NAME || echo "Application $APP_NAME could not be deleted."
else
  echo "Application $APP_NAME is not currently managed by PM2 or does not exist."
fi

# Remove old application directory and recreate it
echo "Removing old application directory: $DEPLOY_DIR..."
rm -rf $DEPLOY_DIR
echo "Creating application directory: $DEPLOY_DIR..."
mkdir -p $DEPLOY_DIR

# Extract the new artifact
if [ ! -f "$ARTIFACT_NAME" ]; then
    echo "Artifact $ARTIFACT_NAME not found!"
    exit 1
fi
echo "Extracting $ARTIFACT_NAME to $DEPLOY_DIR..."
tar -xzf $ARTIFACT_NAME -C $DEPLOY_DIR

# Navigate to the application directory
cd $DEPLOY_DIR

# Fetch secrets from AWS Parameter Store
echo "Fetching secrets from AWS Parameter Store for $ENVIRONMENT environment..."
# Replace 'your-aws-region' with the AWS region where your parameters are stored (e.g., us-east-1)
AWS_REGION="your-aws-region" 
PARAM_PREFIX="/careunity/$ENVIRONMENT"

DATABASE_URL_VALUE=$(aws ssm get-parameter --name "$PARAM_PREFIX/DATABASE_URL" --with-decryption --query Parameter.Value --output text --region $AWS_REGION || echo "")
SESSION_SECRET_VALUE=$(aws ssm get-parameter --name "$PARAM_PREFIX/SESSION_SECRET" --with-decryption --query Parameter.Value --output text --region $AWS_REGION || echo "")

if [ -z "$DATABASE_URL_VALUE" ] || [ -z "$SESSION_SECRET_VALUE" ]; then
  echo "Error: Failed to fetch one or more secrets (DATABASE_URL, SESSION_SECRET) from AWS Parameter Store."
  echo "Please check parameter names in AWS SSM (e.g., $PARAM_PREFIX/DATABASE_URL), IAM permissions for the EC2 instance role, and the specified AWS region ($AWS_REGION)."
  exit 1
fi
export DATABASE_URL="$DATABASE_URL_VALUE"
export SESSION_SECRET="$SESSION_SECRET_VALUE"
echo "Secrets fetched and exported successfully."

# Install dependencies
# Assuming package.json and package-lock.json are in the root of the dist folder, or the artifact itself.
# If your build process nests dist inside another folder within the tarball, adjust the cd path or extraction.
echo "Installing production dependencies..."
if [ -f "package.json" ]; then
  npm install --omit=dev
else
  echo "package.json not found in $DEPLOY_DIR. Skipping npm install."
  echo "Ensure your build artifact contains package.json at its root if dependencies are needed."
fi

# Run database migrations
echo "Running database migrations for $ENVIRONMENT..."
# NODE_ENV is set by PM2 via --env flag, but migrations might need it explicitly.
# sudo -E preserves the exported DATABASE_URL and SESSION_SECRET for the npm script.
sudo -E NODE_ENV=$ENVIRONMENT npm run db:migrate

# Start the application with PM2
# The ecosystem.config.js should be part of your artifact and in the $DEPLOY_DIR
if [ -f "ecosystem.config.js" ]; then
  echo "Starting application $APP_NAME with PM2 using ecosystem.config.js for $ENVIRONMENT environment..."
  sudo -E pm2 start ecosystem.config.js --env $ENVIRONMENT
  pm2 save # Save the PM2 process list
else
  echo "ecosystem.config.js not found in $DEPLOY_DIR."
  echo "Attempting to start script directly if it exists (e.g., dist/index.js)"
  # Fallback: if ecosystem.config.js is not in the artifact, but the script path is known
  if [ -f "dist/index.js" ]; then # Check if the default script path exists
    echo "Starting dist/index.js directly with PM2 for $APP_NAME in $ENVIRONMENT environment..."
    # Attempt to dynamically get PORT from ecosystem.config.js if it's present for port configuration, otherwise default
    # This assumes ecosystem.config.js might be present but not used for the main start command above
    # Or, more likely, this section is a fallback if ecosystem.config.js is *not* in the artifact.
    # For a robust setup, ensure ecosystem.config.js is in the artifact.
    PORT_VAR="3000" # Default port
    if [ -f "ecosystem.config.js" ]; then
        # Extract port from ecosystem.config.js for the current environment
        # This is a bit complex for a shell script and might be fragile.
        # Consider ensuring ecosystem.config.js is always in the artifact.
        PORT_VAR=$(node -e \
          "try { \
            const config = require('./ecosystem.config.js'); \
            const appConfig = config.apps.find(app => app.name === '$APP_NAME'); \
            if (appConfig && appConfig.env_$ENVIRONMENT && appConfig.env_$ENVIRONMENT.PORT) { \
              console.log(appConfig.env_$ENVIRONMENT.PORT); \
            } else if (appConfig && appConfig.env && appConfig.env.PORT) { \
              console.log(appConfig.env.PORT); \
            } else { console.log('3000'); } \
          } catch (e) { console.log('3000'); }")
    fi
    echo "Using port: $PORT_VAR"
    pm2 start dist/index.js --name $APP_NAME --env NODE_ENV=$ENVIRONMENT,PORT=$PORT_VAR
    pm2 save
  else
    echo "No ecosystem.config.js and no dist/index.js found. Cannot start application."
    exit 1
  fi
fi

echo "Deployment of $APP_NAME completed successfully."
echo "PM2 status:"
pm2 list
