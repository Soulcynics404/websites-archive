#!/usr/bin/env bash
# Verify each Unsplash URL returns HTTP 200; print status per ID.
ids=(
  "1509042239860-f550ce710b93"  # coffee latte art
  "1541167760496-1628856ab772"  # flat white
  "1517701550927-30cf4ba1dba5"  # cappuccino
  "1536256263959-770b48d82b0a"  # matcha
  "1541519227354-08fa5d50c44d"  # avocado toast
  "1525351484163-7529414344d8"  # poached eggs breakfast
  "1567620905732-2d1ec7ab7445"  # pancakes berries
  "1484723091739-30a097e8f929"  # french toast
  "1590412200988-a436970781fa"  # shakshuka
  "1608039829572-78524f79c4c7"  # eggs benedict
  "1568901346375-23c9450c58cd"  # burger
  "1600891964092-4316c288032e"  # steak plate
  "1467003909585-2f8a72700288"  # salmon
  "1512621776951-a57141f2eefd"  # salad bowl
  "1621996346565-e3dbc646d9a9"  # pasta
  "1551504734-5ee1c4a1479b"     # tacos
  "1509440159596-0249088772ff"  # croissants
  "1551024506-0bccd828d307"     # dessert chocolate
  "1563729784474-d77dbb933a9e"  # dessert pancakes
  "1517248135467-4c7edcad34c4"  # restaurant interior dark
  "1554118811-1e0d58224f24"     # cafe interior
  "1445116572660-236099ec97a0"  # coffee shop counter
  "1442512595331-e89e73853f31"  # barista pour
  "1490645935967-10de6ba17061"  # smoothie bowl
  "1414235077428-338989a2e8c0"  # fine dining plate
  "1559339352-11d035aa65de"     # restaurant table setting
  "1521017432531-fbd92d768814"  # cafe cozy interior
  "1554306297-0c86e837d24b"     # chef plating (?)
)
for id in "${ids[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -L "https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80")
  echo "$code $id"
done
