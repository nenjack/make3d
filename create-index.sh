#!/bin/bash

cd src
echo '' > index.ts
for f in $(find . -name '*.ts'); do
    if [[ "$f" == "./index.ts" ]]; then
        continue
    fi
    name="${f%.ts}"
    echo "export * from '$name'" >> index.ts
done
