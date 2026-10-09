#!/bin/sh
# Copia a _site/ SOLO lo que se publica: supabase/, test/, docs y configs nunca salen del repo.
set -eu
rm -rf _site
mkdir -p _site/js
cp -r index.html css data assets _site/
cp js/app.js js/validate.js js/hours.js js/config.js _site/js/
