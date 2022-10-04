#!/bin/sh

set -ev

# DB Setup
npx prisma generate 
npx prisma db push

# Start entrypoint
yarn start:dev
