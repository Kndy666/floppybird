cd %cd%
git init
git checkout -b master
git add .
git commit -am "Update%date:~0,4%��%date:~5,2%��%date:~8,2%��%time:~0,2%ʱ%time:~3,2%��%time:~6,2%��"
git push git@github.com:Kndy666/floppybird.git master --force