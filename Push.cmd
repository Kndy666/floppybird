cd %cd%
git init
git checkout -b master
git add .
git commit -am "Update%date:~0,4%年%date:~5,2%月%date:~8,2%日%time:~0,2%时%time:~3,2%分%time:~6,2%秒"
git push git@github.com:Kndy666/floppybird.git master --force