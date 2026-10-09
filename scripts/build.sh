#!/bin/sh
# Copies ONLY what gets published into _site/: supabase/, test/, docs and configs never leave the repo.
set -eu
rm -rf _site
mkdir -p _site/js
cp -r index.html css data assets _site/
cp js/app.js js/art.js js/validate.js js/hours.js js/config.js _site/js/
